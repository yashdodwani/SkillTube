#!/usr/bin/env python3
"""
Test complete course generation functionality
"""

import asyncio
import os
from dotenv import load_dotenv
from app.services.chunking import generate_chunks_from_url
from app.services.quiz import generate_questions

load_dotenv()

async def test_complete_course():
    """Test complete course generation pipeline"""
    print("🧪 Testing complete course generation...")
    
    test_url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    level = "medium"
    
    try:
        # Step 1: Generate chunks
        print("📚 Step 1: Generating content chunks...")
        chunks = await generate_chunks_from_url(test_url, level)
        print(f"✅ Generated {len(chunks)} chunks")
        
        # Step 2: Generate quizzes for each chunk
        print("\n❓ Step 2: Generating quizzes...")
        course_data = []
        
        for i, chunk in enumerate(chunks):
            print(f"   Generating quiz for chunk {i+1}: {chunk.title}")
            questions = await generate_questions(chunk, level)
            course_data.append({
                "chunk": chunk,
                "questions": questions
            })
            print(f"   ✅ Generated {len(questions)} questions")
        
        print(f"\n🎉 Complete course generated successfully!")
        print(f"📊 Summary:")
        print(f"   - {len(chunks)} content sections")
        print(f"   - {sum(len(cd['questions']) for cd in course_data)} total questions")
        
        # Show first chunk details
        if course_data:
            first_chunk = course_data[0]
            print(f"\n📖 First section preview:")
            print(f"   Title: {first_chunk['chunk'].title}")
            print(f"   Duration: {first_chunk['chunk'].start_time:.1f}s - {first_chunk['chunk'].end_time:.1f}s")
            print(f"   Questions: {len(first_chunk['questions'])}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def main():
    print("🚀 Complete Course Generation Test")
    print("=" * 40)
    
    # Check API keys
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    transcript_key = os.getenv("TRANSCRIPT_KEY") or os.getenv("TRANSCRIPT_API_KEY")
    
    print(f"📋 OpenRouter API Key: {'✅ Set' if openrouter_key else '❌ Missing'}")
    print(f"📋 Transcript API Key: {'✅ Set' if transcript_key else '❌ Missing'}")
    print()
    
    if not openrouter_key:
        print("❌ OpenRouter API key required for course generation")
        return
    
    # Test complete course generation
    await test_complete_course()

if __name__ == "__main__":
    asyncio.run(main())