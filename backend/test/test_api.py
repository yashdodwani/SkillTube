#!/usr/bin/env python3
"""
Simple test script to verify the SkillVid API is working correctly.
"""

import requests
import json
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_transcript_api():
    """Test transcript extraction directly"""
    print("\n📝 Testing transcript extraction...")
    
    # Check if we have the transcript API key
    transcript_key = os.getenv("TRANSCRIPT_KEY") or os.getenv("TRANSCRIPT_API_KEY")
    if not transcript_key:
        print("⚠️  No TRANSCRIPT_API_KEY found, will use fallback method")
        return True
    
    try:
        headers = {
            "Authorization": f"Bearer {transcript_key}",
            "Content-Type": "application/json"
        }
        
        params = {
            "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "format": "json",
            "include_timestamp": "true",
            "send_metadata": "false"
        }
        
        response = requests.get(
            "https://transcriptapi.com/api/v2/youtube/transcript",
            params=params,
            headers=headers,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Transcript API working - got {len(data['transcript'])} segments")
            return True
        elif response.status_code == 404:
            print("⚠️  Video not found or no transcript available")
            return True  # This is expected for some videos
        elif response.status_code == 402:
            print("⚠️  Transcript API credits exhausted")
            return True  # Not a failure, just needs credits
        else:
            print(f"❌ Transcript API error: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Transcript API test error: {e}")
        return False

def test_course_generation():
    """Test course generation with a sample YouTube URL"""
    print("\n🎓 Testing course generation...")
    
    # Sample YouTube URL (replace with a real one for testing)
    test_data = {
        "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "level": "medium"
    }
    
    try:
        # Start course generation
        print("📤 Starting course generation...")
        response = requests.post(f"{BASE_URL}/api/course/process-complete", json=test_data)
        
        if response.status_code != 200:
            print(f"❌ Course generation failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        result = response.json()
        task_id = result.get("task_id")
        
        if not task_id:
            print("❌ No task ID returned")
            return False
        
        print(f"✅ Course generation started with task ID: {task_id}")
        
        # Poll for completion (max 60 seconds)
        print("⏳ Polling for completion...")
        for i in range(30):  # 30 attempts, 2 seconds each = 60 seconds max
            time.sleep(2)
            
            status_response = requests.get(f"{BASE_URL}/api/course/status/{task_id}")
            if status_response.status_code != 200:
                print(f"❌ Status check failed: {status_response.status_code}")
                continue
            
            status = status_response.json()
            print(f"📊 Status: {status['status']} - {status['message']}")
            
            if status['status'] == 'completed':
                print("✅ Course generation completed successfully!")
                if status.get('result'):
                    print(f"📚 Generated {len(status['result'])} course sections")
                return True
            elif status['status'] == 'failed':
                print(f"❌ Course generation failed: {status['message']}")
                return False
        
        print("⏰ Course generation timed out")
        return False
        
    except Exception as e:
        print(f"❌ Course generation error: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 SkillVid API Test Suite")
    print("=" * 40)
    
    # Test health check
    if not test_health_check():
        print("\n❌ Health check failed. Make sure the server is running.")
        return
    
    # Test transcript API
    test_transcript_api()
    
    # Test course generation (only if API keys are configured)
    openrouter_key = os.getenv("OPENROUTER_API_KEY")
    if not openrouter_key:
        print("\n⚠️  No OPENROUTER_API_KEY found, skipping course generation test")
    else:
        print("\n⚠️  Note: Course generation test requires API keys to be configured")
        user_input = input("Do you want to test course generation? (y/N): ").lower().strip()
        
        if user_input == 'y':
            test_course_generation()
        else:
            print("⏭️  Skipping course generation test")
    
    print("\n🎉 Test suite completed!")

if __name__ == "__main__":
    main()