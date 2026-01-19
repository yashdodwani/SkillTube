#!/usr/bin/env python3
"""
Test chunking functionality
"""

import asyncio
import os
from dotenv import load_dotenv
from app.services.chunking import generate_chunks_from_url

load_dotenv()

async def test_chunking():
    """Test chunking with a real YouTube URL"""
    print("🧪 Testing chunking functionality...")
    
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    level = "medium"
    
    try:
        chunks = await generate_chunks_from_url(test_url, level)
        print(f"✅ Success! Generated {len(chunks)} chunks")
        
        for i, chunk in enumerate(chunks):
            print(f"\n📚 Chunk {i+1}: {chunk.title}")
            print(f"   ⏱️  Time: {chunk.start_time:.1f}s - {chunk.end_time:.1f}s")
            print(f"   📝 Summary: {chunk.summary[:100]}...")
            
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def main():
    print("🚀 Chunking Test")
    print("=" * 30)
    
    # Check API keys
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    transcript_key = os.getenv("TRANSCRIPT_KEY") or os.getenv("TRANSCRIPT_API_KEY")
    
    print(f"📋 OpenRouter API Key: {'✅ Set' if openrouter_key else '❌ Missing'}")
    print(f"📋 Transcript API Key: {'✅ Set' if transcript_key else '❌ Missing'}")
    print()
    
    if not openrouter_key:
        print("❌ OpenRouter API key required for chunking test")
        return
    
    # Test chunking
    await test_chunking()

if __name__ == "__main__":
    asyncio.run(main())