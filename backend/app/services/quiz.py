import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List
import asyncio
import httpx
from dotenv import load_dotenv
from ..models.schemas import QuizQuestion, VideoChunk

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Configure paths - use the same temp directory as main.py
try:
    TEMP_DIR = Path(__file__).parent.parent.parent / "temp"
    QUIZZES_DIR = TEMP_DIR / "quizzes"
    QUIZZES_DIR.mkdir(exist_ok=True, parents=True)
    logger.info(f"Quizzes directory ready at: {QUIZZES_DIR}")
except Exception as e:
    logger.error(f"Error creating quizzes directory: {e}")
    # Fallback to current working directory
    TEMP_DIR = Path.cwd() / "temp"
    QUIZZES_DIR = TEMP_DIR / "quizzes"
    QUIZZES_DIR.mkdir(exist_ok=True, parents=True)
    logger.info(f"Using fallback quizzes directory at: {QUIZZES_DIR}")

# API configurations
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def create_fallback_quiz(chunk: VideoChunk, level: str, num_questions: int) -> List[QuizQuestion]:
    """Create basic quiz questions when AI fails"""
    logger.info("Creating fallback quiz questions")
    
    # Basic questions based on content
    questions = []
    
    # Extract key words from the content for basic questions
    content_words = chunk.transcript.split()[:100]  # First 100 words
    content_text = " ".join(content_words)
    
    for i in range(num_questions):
        question_text = f"Based on the content, what is a key concept discussed in this section?"
        
        # Create basic options
        options = [
            f"Concept related to the main topic",
            f"Secondary topic mentioned",
            f"Supporting detail discussed",
            f"Background information provided"
        ]
        
        # Make the first option correct
        correct_answer = 0
        explanation = "This answer reflects the main concept discussed in this section of the content."
        
        question = QuizQuestion(
            question=question_text,
            options=options,
            correct_answer=correct_answer,
            explanation=explanation
        )
        questions.append(question)
    
    logger.info(f"Created {len(questions)} fallback quiz questions")
    return questions


async def generate_questions(chunk: VideoChunk, level: str) -> List[QuizQuestion]:
    """
    Generate quiz questions for a specific chunk of content.

    Args:
        chunk: VideoChunk object with transcript and summary
        level: Difficulty level (easy, medium, hard)

    Returns:
        List of QuizQuestion objects
    """
    try:
        # Create a unique identifier for this chunk
        chunk_hash = f"{hash(chunk.transcript)}"
        output_path = QUIZZES_DIR / f"{chunk_hash}_{level}_quiz.json"

        # Check if quiz already exists
        if output_path.exists():
            logger.info(f"Using existing quiz from {output_path}")
            with open(output_path, "r") as f:
                questions_data = json.load(f)
                questions = [QuizQuestion(**q) for q in questions_data]
                return questions

        logger.info(f"Generating quiz questions for chunk with level: {level}")

        # Ensure API key is configured
        if not OPENROUTER_API_KEY:
            logger.error("OPENROUTER_API_KEY is not set")
            raise ValueError("OPENROUTER_API_KEY is not set. Please configure it in your environment.")

        # Determine number of questions based on level
        num_questions = 3
        if level == "medium":
            num_questions = 4
        elif level == "hard":
            num_questions = 5

        # Prepare prompt for the LLM
        prompt = f"""Create {num_questions} multiple-choice quiz questions based on this content.

CONTENT:
Title: {getattr(chunk, 'title', 'Video Segment')}
Summary: {chunk.summary}
Transcript: {chunk.transcript[:2000]}

DIFFICULTY: {level}

TASK: Create quiz questions testing comprehension of the key concepts.

REQUIRED JSON FORMAT:
[
  {{
    "question": "Clear question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": 0,
    "explanation": "Brief explanation of correct answer"
  }}
]

RULES:
- {num_questions} questions total
- Each question has exactly 4 options
- correct_answer is 0-3 (0=A, 1=B, 2=C, 3=D)
- Questions should test understanding, not memorization
- Appropriate for {level} difficulty level

Return ONLY the JSON array, no other text."""

        # Call the LLM API with multiple model fallbacks
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://skillvid.app",
            "X-Title": "SkillVid Quiz Generator"
        }

        # Try multiple models in order of preference
        models_to_try = [
            "anthropic/claude-3-haiku:beta",
            "google/gemini-flash-1.5:free",
            "meta-llama/llama-3.1-8b-instruct:free",
            "microsoft/wizardlm-2-8x22b:nitro"
        ]
        
        llm_response = None
        
        for model in models_to_try:
            try:
                payload = {
                    "model": model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an educational quiz creator. Generate multiple-choice questions in valid JSON format only, no additional text."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.3,
                    "max_tokens": 2048,
                    "top_p": 1
                }
                
                logger.info(f"Trying model: {model} for quiz generation")
                
                async with httpx.AsyncClient(timeout=60.0) as client:
                    response = await client.post(OPENROUTER_URL, json=payload, headers=headers)
                    
                    logger.info(f"Quiz API response status: {response.status_code}")
                    
                    if response.status_code == 200:
                        response_data = response.json()
                        
                        if "choices" in response_data and response_data["choices"]:
                            choice = response_data["choices"][0]
                            if "message" in choice and "content" in choice["message"]:
                                content = choice["message"]["content"]
                                if content and content.strip():
                                    llm_response = content
                                    logger.info(f"Quiz generation success with model: {model}")
                                    break
                                else:
                                    logger.warning(f"Empty content from quiz model: {model}")
                            else:
                                logger.warning(f"Invalid response structure from quiz model: {model}")
                        else:
                            logger.warning(f"No choices in quiz response from model: {model}")
                    else:
                        error_text = response.text
                        logger.warning(f"HTTP error {response.status_code} from quiz model {model}: {error_text}")
                        
            except Exception as e:
                logger.warning(f"Error with quiz model {model}: {str(e)}")
                continue
        
        if not llm_response:
            logger.error("All quiz models failed, creating fallback questions")
            return create_fallback_quiz(chunk, level, num_questions)

        logger.info("Received quiz response from OpenRouter")
        logger.info(f"Quiz Response Length: {len(llm_response)}")
        logger.info(f"Quiz Response Preview: {llm_response[:200]}...")

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
                logger.error(f"No JSON found in quiz response: {llm_response}")
                return create_fallback_quiz(chunk, level, num_questions)

            json_str = llm_response[json_start:json_end]
            logger.info(f"Extracted quiz JSON: {json_str[:200]}...")
            llm_questions = json.loads(json_str)

            # If result is not a list but a single object, wrap it
            if isinstance(llm_questions, dict):
                llm_questions = [llm_questions]

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from quiz response: {llm_response}")
            logger.error(f"JSON Error: {e}")
            return create_fallback_quiz(chunk, level, num_questions)

        # Convert to QuizQuestion objects
        questions = []
        for q in llm_questions:
            question = QuizQuestion(
                question=q.get("question", "Question not available"),
                options=q.get("options", ["Option A", "Option B", "Option C", "Option D"]),
                correct_answer=q.get("correct_answer", 0),
                explanation=q.get("explanation", "Explanation not available")
            )
            questions.append(question)

        # Save questions to file
        with open(output_path, "w") as f:
            json.dump([q.model_dump() for q in questions], f, indent=2)

        logger.info(f"Quiz questions saved to {output_path}")
        return questions

    except Exception as e:
        logger.error(f"Error generating quiz questions: {str(e)}")
        raise Exception(f"Failed to generate quiz questions: {str(e)}")