#!/usr/bin/env python3
"""
Test quiz generation functionality
"""

import asyncio
import os
from dotenv import load_dotenv
from app.services.quiz import generate_questions
from app.models.schemas import VideoChunk

load_dotenv()

async def test_quiz():
    """Test quiz generation"""
    print("🧪 Testing quiz generation...")
    
    # Create a sample chunk
    chunk = VideoChunk(
        title="Test Section",
        start_time=0.0,
        end_time=60.0,
        transcript="This is a test transcript about machine learning. Machine learning is a subset of artificial intelligence that focuses on algorithms that can learn from data. It involves training models on datasets to make predictions or decisions without being explicitly programmed for every scenario.",
        summary="Introduction to machine learning concepts and basic definitions."
    )
    
    level = "medium"
    
    try:
        questions = await generate_questions(chunk, level)
        print(f"✅ Success! Generated {len(questions)} questions")
        
        for i, q in enumerate(questions):
            print(f"\n❓ Question {i+1}: {q.question}")
            for j, option in enumerate(q.options):
                marker = "✅" if j == q.correct_answer else "  "
                print(f"   {marker} {chr(65+j)}. {option}")
            print(f"   💡 Explanation: {q.explanation}")
            
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

async def main():
    print("🚀 Quiz Generation Test")
    print("=" * 30)
    
    # Check API key
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    
    print(f"📋 OpenRouter API Key: {'✅ Set' if openrouter_key else '❌ Missing'}")
    print()
    
    if not openrouter_key:
        print("❌ OpenRouter API key required for quiz test")
        return
    
    # Test quiz generation
    await test_quiz()

if __name__ == "__main__":
    asyncio.run(main())