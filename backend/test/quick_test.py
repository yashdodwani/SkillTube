#!/usr/bin/env python3
"""
Quick test to verify transcript API integration
"""

import asyncio
import os
from dotenv import load_dotenv
from app.services.chunking import get_transcript_data

load_dotenv()

async def test_transcript():
    """Test transcript extraction"""
    print("🧪 Testing transcript extraction...")
    
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    
    try:
        result = await get_transcript_data(test_url)
        print(f"✅ Success! Got {len(result['segments'])} segments")
        print(f"📝 First segment: {result['segments'][0]['text'][:50]}...")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def main():
    print("🚀 Quick Transcript Test")
    print("=" * 30)
    
    # Check API keys
    transcript_key = os.getenv("TRANSCRIPT_KEY") or os.getenv("TRANSCRIPT_API_KEY")
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    
    print(f"📋 Transcript API Key: {'✅ Set' if transcript_key else '❌ Missing'}")
    print(f"📋 OpenRouter API Key: {'✅ Set' if openrouter_key else '❌ Missing'}")
    print()
    
    # Test transcript extraction
    await test_transcript()

if __name__ == "__main__":
    asyncio.run(main())