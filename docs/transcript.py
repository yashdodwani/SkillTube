# pip install youtube-transcript-api

from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound, VideoUnavailable
import re

def get_video_id(url: str) -> str:
    """
    Extract the video ID from a YouTube URL.
    Works with normal and short links.
    """
    # Handle youtu.be short links
    short_pattern = r"youtu\.be/([0-9A-Za-z_-]{11})"
    long_pattern = r"(?:v=|\/)([0-9A-Za-z_-]{11})"
    
    match = re.search(short_pattern, url)
    if not match:
        match = re.search(long_pattern, url)
    
    if not match:
        raise ValueError("Could not extract video ID from URL")
    return match.group(1)

def fetch_transcript(url: str) -> str:
    """
    Fetches transcript with timestamps.
    """
    video_id = get_video_id(url)
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
    except TranscriptsDisabled:
        return "❌ Transcripts are disabled for this video."
    except NoTranscriptFound:
        return "❌ No transcript found (maybe no captions in your language)."
    except VideoUnavailable:
        return "❌ Video is unavailable."
    except Exception as e:
        return f"⚠️ Error fetching transcript: {e}"

    # Format transcript
    transcript_text = ""
    for entry in transcript:
        timestamp = entry['start']
        minutes, seconds = divmod(int(timestamp), 60)
        timecode = f"[{minutes:02d}:{seconds:02d}]"
        transcript_text += f"{timecode} {entry['text']}\n"
    return transcript_text


if __name__ == "__main__":
    yt_url = input("Enter YouTube video link: ")
    result = fetch_transcript(yt_url)
    print("\n--- Transcript ---\n")
    print(result)
