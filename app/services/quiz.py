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

        # Determine number of questions based on level
        num_questions = 3
        if level == "medium":
            num_questions = 4
        elif level == "hard":
            num_questions = 5

        # Prepare prompt for the LLM
        prompt = f"""
        You are an educational content creator. Your task is to create {num_questions} multiple-choice quiz questions based on the following content.

        Content Title: {chunk.title if hasattr(chunk, 'title') else "Video Segment"}
        Content Summary: {chunk.summary}
        Transcript: {chunk.transcript}

        Create quiz questions that are appropriate for a {level} level student.

        For each question:
        1. Write a clear question
        2. Provide exactly 4 options (A, B, C, D)
        3. Indicate which option is correct (0-based index where 0=A, 1=B, 2=C, 3=D)
        4. Write a brief explanation of why the answer is correct

        Return your response as a JSON array with objects containing:
        - question: the question text
        - options: array of 4 option strings
        - correct_answer: integer index of correct answer (0-3)
        - explanation: explanation text

        Don't include any explanation outside the JSON.
        """

        # Call the LLM API
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "google/gemini-2.0-pro-exp-02-05:free",
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 2048
        }

        logger.info("Sending request to LLM for quiz generation")
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(OPENROUTER_URL, json=payload, headers=headers)
            response.raise_for_status()

            response_data = response.json()
            llm_response = response_data["choices"][0]["message"]["content"]

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
                    raise ValueError("No valid JSON found in LLM response")

                json_str = llm_response[json_start:json_end]
                llm_questions = json.loads(json_str)

                # If result is not a list but a single object, wrap it
                if isinstance(llm_questions, dict):
                    llm_questions = [llm_questions]

            except json.JSONDecodeError:
                logger.error(f"Failed to parse JSON from LLM response: {llm_response}")
                raise ValueError("Invalid JSON response from LLM")

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
            json.dump([q.dict() for q in questions], f, indent=2)

        logger.info(f"Quiz questions saved to {output_path}")
        return questions

    except Exception as e:
        logger.error(f"Error generating quiz questions: {str(e)}")
        raise Exception(f"Failed to generate quiz questions: {str(e)}")