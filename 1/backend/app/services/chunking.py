import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List
import asyncio
import httpx
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
from ..models.schemas import VideoChunk

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Configure paths - use the same temp directory as main.py
try:
    TEMP_DIR = Path(__file__).parent.parent.parent / "temp"
    CHUNKS_DIR = TEMP_DIR / "chunks"
    CHUNKS_DIR.mkdir(exist_ok=True, parents=True)
    logger.info(f"Chunks directory ready at: {CHUNKS_DIR}")
except Exception as e:
    logger.error(f"Error creating chunks directory: {e}")
    # Fallback to current working directory
    TEMP_DIR = Path.cwd() / "temp"
    CHUNKS_DIR = TEMP_DIR / "chunks"
    CHUNKS_DIR.mkdir(exist_ok=True, parents=True)
    logger.info(f"Using fallback chunks directory at: {CHUNKS_DIR}")

# API configurations
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def extract_video_id(youtube_url: str) -> str:
    """Extract the video ID from a YouTube URL."""
    # Convert pydantic URL object to string if needed
    if not isinstance(youtube_url, str):
        youtube_url = str(youtube_url)

    parsed_url = urlparse(youtube_url)

    if parsed_url.netloc == 'youtu.be':
        return parsed_url.path.lstrip('/')

    if parsed_url.netloc in ('www.youtube.com', 'youtube.com'):
        if parsed_url.path == '/watch':
            query = parse_qs(parsed_url.query)
            return query.get('v', [None])[0]
        elif parsed_url.path.startswith('/embed/'):
            return parsed_url.path.split('/')[2]
        elif parsed_url.path.startswith('/v/'):
            return parsed_url.path.split('/')[2]

    # If no ID is found, return None
    return None


async def get_transcript_data(youtube_url: str) -> Dict[str, Any]:
    """Get transcript data directly from YouTube URL"""
    # Convert pydantic URL object to string if needed
    if not isinstance(youtube_url, str):
        youtube_url = str(youtube_url)

    video_id = extract_video_id(youtube_url)
    if not video_id:
        raise ValueError(f"Could not extract video ID from URL: {youtube_url}")

    logger.info(f"Fetching transcript for video ID: {video_id}")
    transcript_list = YouTubeTranscriptApi.get_transcript(video_id)

    # Format the transcript with timestamps
    transcript_data = {
        "video_id": video_id,
        "youtube_url": youtube_url,
        "text": " ".join([item["text"] for item in transcript_list]),
        "segments": []
    }

    for segment in transcript_list:
        transcript_data["segments"].append({
            "start": segment["start"],
            "end": segment["start"] + segment["duration"],
            "text": segment["text"]
        })

    return transcript_data


async def generate_chunks_from_url(youtube_url, level: str) -> List[VideoChunk]:
    """
    Fetch transcript and generate chunks directly from a YouTube URL.

    Args:
        youtube_url: URL of the YouTube video (can be str or HttpUrl)
        level: Difficulty level (easy, medium, hard)

    Returns:
        List of VideoChunk objects
    """
    try:
        # Convert pydantic URL object to string if needed
        if not isinstance(youtube_url, str):
            youtube_url = str(youtube_url)

        # Get transcript data
        transcript_data = await get_transcript_data(youtube_url)

        # Generate chunks from transcript data
        chunks = await generate_chunks(transcript_data, level)

        # Convert to VideoChunk objects
        video_chunks = []
        for chunk in chunks:
            video_chunk = VideoChunk(
                start_time=chunk["start_time"],
                end_time=chunk["end_time"],
                transcript=chunk["transcript"],
                summary=chunk["summary"],
                title=chunk["title"]
            )
            video_chunks.append(video_chunk)

        return video_chunks

    except Exception as e:
        logger.error(f"Error generating chunks from URL: {str(e)}")
        raise Exception(f"Failed to generate chunks: {str(e)}")


async def generate_chunks(transcript_data: Dict[str, Any], level: str) -> List[Dict[str, Any]]:
    """
    Use AI to identify logical segments/subtopics in the transcript.

    Args:
        transcript_data: Transcript data with timestamps
        level: Difficulty level (easy, medium, hard)

    Returns:
        List of chunks with start_time, end_time, transcript, and summary
    """
    try:
        video_id = transcript_data["video_id"]
        output_path = CHUNKS_DIR / f"{video_id}_{level}_chunks.json"

        # Check if chunks already exists
        if output_path.exists():
            logger.info(f"Using existing chunks from {output_path}")
            with open(output_path, "r") as f:
                return json.load(f)

        logger.info(f"Generating chunks for video: {video_id} with level: {level}")

        # Extract full transcript
        full_transcript = transcript_data["text"]
        segments = transcript_data["segments"]

        # Prepare prompt for the LLM
        prompt = f"""
        You are an educational content expert. Your task is to divide the following transcript into logical segments or subtopics.

        For each segment:
        1. Identify a clear subtopic or concept
        2. Provide a concise title for the segment
        3. Write a brief summary of the content (3-5 sentences)
        4. Make sure segments are of reasonable length (about 2-5 minutes of video time)

        The content should be appropriate for a {level} level student.

        Transcript:
        {full_transcript[:10000]}  # Limit length to avoid token limits

        Return your response as a JSON array with objects containing:
        - title: the title of the segment
        - summary: a brief summary of the segment
        - start_index: the index of the first segment in the transcript that belongs to this chunk
        - end_index: the index of the last segment in the transcript that belongs to this chunk

        Don't include any explanation, just the JSON.
        """

        # Call the LLM API
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "google/gemini-2.0-pro-exp-02-05:free",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 2048
        }

        logger.info("Sending request to LLM for chunking")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(OPENROUTER_URL, json=payload, headers=headers)
            
            # Log the response status and headers for debugging
            logger.info(f"API Response Status: {response.status_code}")
            logger.info(f"API Response Headers: {dict(response.headers)}")
            
            # Check if the response is successful
            if response.status_code != 200:
                logger.error(f"API Error: {response.status_code} - {response.text}")
                raise ValueError(f"API request failed with status {response.status_code}")
            
            response_data = response.json()
            logger.info(f"API Response Data Keys: {list(response_data.keys())}")
            
            # Check if we have the expected structure
            if "choices" not in response_data:
                logger.error(f"Unexpected API response structure: {response_data}")
                raise ValueError("API response missing 'choices' field")
            
            if not response_data["choices"]:
                logger.error("API returned empty choices")
                raise ValueError("API returned empty choices")
            
            llm_response = response_data["choices"][0]["message"]["content"]
            logger.info(f"LLM Response Length: {len(llm_response)}")
            logger.info(f"LLM Response Preview: {llm_response[:200]}...")

            # Extract JSON from response
            try:
                # Find JSON in the response
                json_start = llm_response.find("[")
                json_end = llm_response.rfind("]") + 1

                if json_start == -1 or json_end == 0:
                    # No JSON array found, try looking for an object
                    json_start = llm_response.find("{")
                    json_end = llm_response.rfind("}") + 1

                if json_start == -1 or json_end == 0:
                    logger.error(f"No JSON found in response: {llm_response}")
                    raise ValueError("No valid JSON found in LLM response")

                json_str = llm_response[json_start:json_end]
                logger.info(f"Extracted JSON: {json_str}")
                llm_chunks = json.loads(json_str)

                # If result is not a list but a single object, wrap it
                if isinstance(llm_chunks, dict):
                    llm_chunks = [llm_chunks]

            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON from LLM response: {llm_response}")
                logger.error(f"JSON Error: {e}")
                raise ValueError("Invalid JSON response from LLM")

        # Process chunks to match with timestamps
        final_chunks = []
        for chunk in llm_chunks:
            # Map segment indices to actual timestamps
            start_index = max(0, min(chunk.get("start_index", 0), len(segments) - 1))
            end_index = min(chunk.get("end_index", len(segments) - 1), len(segments) - 1)

            start_time = segments[start_index]["start"]
            end_time = segments[end_index]["end"]

            # Extract transcript text for this chunk
            chunk_transcript = " ".join([seg["text"] for seg in segments[start_index:end_index + 1]])

            final_chunks.append({
                "title": chunk.get("title", "Untitled Segment"),
                "summary": chunk.get("summary", "No summary available"),
                "start_time": start_time,
                "end_time": end_time,
                "transcript": chunk_transcript
            })

        # Save chunks to file
        with open(output_path, "w") as f:
            json.dump(final_chunks, f, indent=2)

        logger.info(f"Chunks saved to {output_path}")
        return final_chunks

    except Exception as e:
        logger.error(f"Error generating chunks: {str(e)}")
        raise Exception(f"Failed to generate chunks: {str(e)}")