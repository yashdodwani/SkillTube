#!/usr/bin/env python3
"""
Test with a different video to ensure correct video ID is used
"""

import asyncio
import os
from dotenv import load_dotenv
from app.services.chunking import generate_chunks_from_url, extract_video_id

load_dotenv()

async def test_different_video():
    """Test with a different YouTube video"""
    print("🧪 Testing with different video...")
    
    # Use a different video (this is "Me at the zoo" - first YouTube video)
    test_url = "https://www.youtube.com/watch?v=jNQXAC9IVRw"
    level = "medium"
    
    print(f"📹 Input URL: {test_url}")
    
    # Extract video ID
    video_id = extract_video_id(test_url)
    print(f"🆔 Extracted Video ID: {video_id}")
    
    try:
        chunks = await generate_chunks_from_url(test_url, level)
        print(f"✅ Success! Generated {len(chunks)} chunks for video {video_id}")
        
        print(f"\n📚 Course sections:")
        for i, chunk in enumerate(chunks):
            print(f"   {i+1}. {chunk.title}")
            print(f"      Time: {chunk.start_time:.1f}s - {chunk.end_time:.1f}s")
            
        return video_id
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

async def main():
    print("🚀 Different Video Test")
    print("=" * 30)
    
    # Check API keys
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    transcript_key = os.getenv("TRANSCRIPT_KEY") or os.getenv("TRANSCRIPT_API_KEY")
    
    print(f"📋 OpenRouter API Key: {'✅ Set' if openrouter_key else '❌ Missing'}")
    print(f"📋 Transcript API Key: {'✅ Set' if transcript_key else '❌ Missing'}")
    print()
    
    if not openrouter_key:
        print("❌ OpenRouter API key required")
        return
    
    # Test with different video
    video_id = await test_different_video()
    
    if video_id:
        print(f"\n🎬 Video embed URL would be:")
        print(f"   https://www.youtube.com/embed/{video_id}")

if __name__ == "__main__":
    asyncio.run(main())