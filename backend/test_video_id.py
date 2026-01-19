#!/usr/bin/env python3
"""
Test video ID extraction
"""

from app.services.chunking import extract_video_id

def test_video_id_extraction():
    """Test video ID extraction from various YouTube URLs"""
    test_urls = [
        "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        "https://youtu.be/jNQXAC9IVRw",
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://www.youtube.com/embed/jNQXAC9IVRw",
        "https://www.youtube.com/v/jNQXAC9IVRw"
    ]
    
    print("🧪 Testing Video ID Extraction")
    print("=" * 40)
    
    for url in test_urls:
        try:
            video_id = extract_video_id(url)
            print(f"✅ {url}")
            print(f"   Video ID: {video_id}")
        except Exception as e:
            print(f"❌ {url}")
            print(f"   Error: {e}")
        print()

if __name__ == "__main__":
    test_video_id_extraction()