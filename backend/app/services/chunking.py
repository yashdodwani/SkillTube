import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List
import httpx
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs
import google.generativeai as genai
from ..models.schemas import VideoChunk

# Load environment variables with override to ensure .env values take precedence
load_dotenv(override=True)

logger = logging.getLogger(__name__)

# Configure paths - use the same temp directory as main.py
try:
    TEMP_DIR = Path(__file__).parent.parent.parent / "temp"
    CHUNKS_DIR = TEMP_DIR / "chunks"
    TRANSCRIPTS_DIR = TEMP_DIR / "json"
    CHUNKS_DIR.mkdir(exist_ok=True, parents=True)
    TRANSCRIPTS_DIR.mkdir(exist_ok=True, parents=True)
    logger.info(f"Chunks directory ready at: {CHUNKS_DIR}")
    logger.info(f"Transcripts directory ready at: {TRANSCRIPTS_DIR}")
except Exception as e:
    logger.error(f"Error creating directories: {e}")
    # Fallback to current working directory
    TEMP_DIR = Path.cwd() / "temp"
    CHUNKS_DIR = TEMP_DIR / "chunks"
    TRANSCRIPTS_DIR = TEMP_DIR / "json"
    CHUNKS_DIR.mkdir(exist_ok=True, parents=True)
    TRANSCRIPTS_DIR.mkdir(exist_ok=True, parents=True)
    logger.info(f"Using fallback chunks directory at: {CHUNKS_DIR}")
    logger.info(f"Using fallback transcripts directory at: {TRANSCRIPTS_DIR}")

# API configurations
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
TRANSCRIPT_API_KEY = os.getenv("TRANSCRIPT_KEY") or os.getenv("TRANSCRIPT_API_KEY")
TRANSCRIPT_API_URL = "https://transcriptapi.com/api/v2/youtube/transcript"

# Configure Google Gemini
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    logger.info("Google Gemini API configured successfully")
else:
    logger.warning("GOOGLE_API_KEY is not set. Chunk generation will fail until it is configured.")

if not TRANSCRIPT_API_KEY:
    logger.warning("TRANSCRIPT_API_KEY is not set. Will fallback to youtube-transcript-api library.")


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
            video_id = query.get('v', [None])[0]
            if video_id:
                return video_id
        elif parsed_url.path.startswith('/embed/'):
            return parsed_url.path.split('/')[2]
        elif parsed_url.path.startswith('/v/'):
            return parsed_url.path.split('/')[2]

    # If no ID is found, raise an exception
    raise ValueError(f"Could not extract video ID from URL: {youtube_url}")


async def get_transcript_data(youtube_url: str) -> Dict[str, Any]:
    """Get transcript data from YouTube URL using professional API with fallback"""
    # Convert pydantic URL object to string if needed
    if not isinstance(youtube_url, str):
        youtube_url = str(youtube_url)

    video_id = extract_video_id(youtube_url)
    if not video_id:
        raise ValueError(f"Could not extract video ID from URL: {youtube_url}")

    logger.info(f"Fetching transcript for video ID: {video_id}")
    
    # Try professional API first if available
    if TRANSCRIPT_API_KEY:
        try:
            return await get_transcript_from_api(youtube_url, video_id)
        except Exception as e:
            logger.warning(f"Professional API failed, trying fallback: {e}")
    
    # Fallback to youtube-transcript-api library
    try:
        return await get_transcript_from_library(video_id)
    except Exception as e:
        logger.error(f"All transcript methods failed: {e}")
        raise ValueError(f"Could not fetch transcript for video {video_id}: {e}")


async def get_transcript_from_api(youtube_url: str, video_id: str) -> Dict[str, Any]:
    """Get transcript using the professional transcriptapi.com service"""
    logger.info(f"Using professional transcript API for video: {video_id}")
    
    headers = {
        "Authorization": f"Bearer {TRANSCRIPT_API_KEY}",
        "Content-Type": "application/json"
    }
    
    params = {
        "video_url": youtube_url,
        "format": "json",
        "include_timestamp": "true",
        "send_metadata": "false"
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(TRANSCRIPT_API_URL, params=params, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
            # Convert API response to our format
            transcript_data = {
                "video_id": data["video_id"],
                "youtube_url": youtube_url,
                "text": " ".join([item["text"] for item in data["transcript"]]),
                "segments": []
            }
            
            for segment in data["transcript"]:
                transcript_data["segments"].append({
                    "start": segment["start"],
                    "end": segment["start"] + segment["duration"],
                    "text": segment["text"]
                })
            
            logger.info(f"Successfully fetched transcript via API: {len(transcript_data['segments'])} segments")
            return transcript_data
            
        elif response.status_code == 404:
            raise ValueError(f"Video {video_id} not found or has no transcript available")
        elif response.status_code == 401:
            raise ValueError("Invalid transcript API key")
        elif response.status_code == 402:
            raise ValueError("Transcript API credits exhausted")
        elif response.status_code == 429:
            raise ValueError("Transcript API rate limit exceeded")
        else:
            raise ValueError(f"Transcript API error: {response.status_code} - {response.text}")


async def get_transcript_from_library(video_id: str) -> Dict[str, Any]:
    """Fallback method using youtube-transcript-api library"""
    logger.info(f"Using fallback transcript library for video: {video_id}")
    
    try:
        # Import here to avoid issues if library is not installed
        from youtube_transcript_api import YouTubeTranscriptApi

    except ImportError as e:
        logger.error(f"youtube-transcript-api library not installed: {e}")
        raise ValueError("Fallback transcript library not available. Please install youtube-transcript-api or configure TRANSCRIPT_API_KEY")

    transcript_list = None
    last_error = None

    # Create API instance
    api = YouTubeTranscriptApi()

    # Try different methods to fetch transcript
    methods_to_try = [
        ("Standard fetch", lambda: api.fetch(video_id)),
        ("English only", lambda: api.fetch(video_id, languages=['en'])),
        ("English/Hindi", lambda: api.fetch(video_id, languages=['en', 'hi'])),
        ("Auto-generated", lambda: api.fetch(video_id, languages=['en'], preserve_formatting=True)),
    ]

    for method_name, method_func in methods_to_try:
        try:
            logger.info(f"Trying method: {method_name}")
            transcript_list = method_func()
            logger.info(f"✅ Success with method: {method_name}")
            break
        except Exception as e:
            last_error = e
            logger.warning(f"Method '{method_name}' error: {type(e).__name__}: {e}")
            continue

    if not transcript_list:
        error_msg = f"Could not fetch transcript using any method. Last error: {last_error}"
        logger.error(error_msg)
        raise ValueError(error_msg)

    # Format the transcript with timestamps
    transcript_data = {
        "video_id": video_id,
        "youtube_url": f"https://www.youtube.com/watch?v={video_id}",
        "text": " ".join([item.text for item in transcript_list]),
        "segments": []
    }

    for segment in transcript_list:
        transcript_data["segments"].append({
            "start": segment.start,
            "end": segment.start + segment.duration,
            "text": segment.text
        })

    logger.info(f"Successfully fetched transcript via library: {len(transcript_data['segments'])} segments")
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
        
        # Save transcript to JSON file
        video_id = extract_video_id(youtube_url)
        transcript_path = TRANSCRIPTS_DIR / f"{video_id}.json"
        try:
            with open(transcript_path, "w", encoding="utf-8") as f:
                json.dump(transcript_data, f, indent=2, ensure_ascii=False)
            logger.info(f"Transcript saved to {transcript_path}")
        except Exception as e:
            logger.warning(f"Failed to save transcript: {e}")

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


def create_fallback_chunks(segments: List[Dict], level: str) -> List[Dict[str, Any]]:
    """Create basic chunks when AI fails"""
    logger.info("Creating fallback chunks using automatic segmentation")
    
    total_segments = len(segments)
    if total_segments == 0:
        return []
    
    # Determine number of chunks based on video length
    if total_segments < 20:
        num_chunks = 2
    elif total_segments < 50:
        num_chunks = 3
    elif total_segments < 100:
        num_chunks = 4
    else:
        num_chunks = 5
    
    chunk_size = total_segments // num_chunks
    chunks = []
    
    for i in range(num_chunks):
        start_idx = i * chunk_size
        end_idx = min((i + 1) * chunk_size - 1, total_segments - 1)
        
        # For the last chunk, include all remaining segments
        if i == num_chunks - 1:
            end_idx = total_segments - 1
        
        # Extract text for this chunk
        chunk_text = " ".join([seg["text"] for seg in segments[start_idx:end_idx + 1]])
        
        # Create basic title and summary
        title = f"Section {i + 1}"
        summary = f"This section covers content from {format_time(segments[start_idx]['start'])} to {format_time(segments[end_idx]['end'])}."
        
        chunks.append({
            "title": title,
            "summary": summary,
            "start_time": segments[start_idx]["start"],
            "end_time": segments[end_idx]["end"],
            "transcript": chunk_text
        })
    
    logger.info(f"Created {len(chunks)} fallback chunks")
    return chunks


def format_time(seconds: float) -> str:
    """Format seconds to MM:SS format"""
    minutes = int(seconds // 60)
    seconds = int(seconds % 60)
    return f"{minutes}:{seconds:02d}"


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

        if not GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY is not set. Please configure it in your environment.")

        # Extract full transcript
        full_transcript = transcript_data["text"]
        segments = transcript_data["segments"]

        # Prepare prompt for the LLM
        prompt = f"""Analyze this video transcript and divide it into 3-5 logical learning segments.

TRANSCRIPT ({len(segments)} segments):
{full_transcript[:6000]}

TASK: Create a JSON array with learning segments. Each segment should be 2-5 minutes long.

REQUIRED JSON FORMAT:
[
  {{
    "title": "Clear segment title",
    "summary": "2-3 sentence summary of key concepts",
    "start_index": 0,
    "end_index": 10
  }}
]

RULES:
- Difficulty level: {level}
- start_index and end_index refer to transcript segment positions (0 to {len(segments)-1})
- Each segment should cover 10-30 transcript segments
- Ensure segments don't overlap
- Cover the full transcript length

Return ONLY the JSON array, no other text."""

        # Call the Google Gemini API
        logger.info("Sending request to Google Gemini for chunking")

        try:
            # Try multiple Gemini models in order of preference
            models_to_try = [
                "gemini-1.5-flash",
                "gemini-1.5-pro",
                "gemini-pro"
            ]
            
            llm_response = None
            
            for model_name in models_to_try:
                try:
                    logger.info(f"Trying Gemini model: {model_name}")

                    model = genai.GenerativeModel(
                        model_name=model_name,
                        generation_config={
                            "temperature": 0.2,
                            "top_p": 1,
                            "max_output_tokens": 2048,
                        }
                    )

                    full_prompt = f"""You are an educational content expert. You analyze video transcripts and create logical learning segments. Always respond with valid JSON only, no additional text or explanations.

{prompt}"""

                    response = model.generate_content(full_prompt)

                    if response and response.text:
                        llm_response = response.text
                        logger.info(f"Success with Gemini model: {model_name}")
                        break
                    else:
                        logger.warning(f"Empty response from Gemini model: {model_name}")

                except Exception as e:
                    logger.error(f"Exception with Gemini model {model_name}: {type(e).__name__}: {str(e)}")
                    continue
            
            if not llm_response:
                logger.error("All Gemini models failed. Falling back to automatic chunking.")
                return create_fallback_chunks(segments, level)
            
            logger.info("Received response from Google Gemini")
            logger.info(f"LLM Response Length: {len(llm_response)}")
            logger.info(f"LLM Response Preview: {llm_response[:200]}...")
            
        except Exception as e:
            logger.error(f"Error calling OpenRouter API: {str(e)}")
            raise ValueError(f"OpenRouter API request failed: {str(e)}")

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
                logger.info("Falling back to automatic chunking")
                return create_fallback_chunks(segments, level)

            json_str = llm_response[json_start:json_end]
            logger.info(f"Extracted JSON: {json_str[:200]}...")
            llm_chunks = json.loads(json_str)

            # If result is not a list but a single object, wrap it
            if isinstance(llm_chunks, dict):
                llm_chunks = [llm_chunks]

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from LLM response: {llm_response}")
            logger.error(f"JSON Error: {e}")
            logger.info("Falling back to automatic chunking")
            return create_fallback_chunks(segments, level)

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