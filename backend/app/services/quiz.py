import os
import json
import logging
from pathlib import Path
from typing import List
from dotenv import load_dotenv
import google.generativeai as genai
from ..models.schemas import QuizQuestion, VideoChunk

# Load environment variables with override to ensure .env values take precedence
load_dotenv(override=True)

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
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Configure Google Gemini
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    logger.info("Google Gemini API configured for quiz generation")
else:
    logger.warning("GOOGLE_API_KEY is not set. Quiz generation will use fallback questions.")


def create_fallback_quiz(chunk: VideoChunk, level: str, num_questions: int) -> List[QuizQuestion]:
    """Create better quality fallback quiz questions based on content analysis"""
    logger.info("Creating fallback quiz questions")
    
    questions = []
    transcript = chunk.transcript[:500]  # Use first 500 chars for context
    title = getattr(chunk, 'title', 'Video Content')
    
    # Template questions that work for educational content
    question_templates = [
        {
            "question": f"What is the main topic covered in the '{title}' section?",
            "options": [
                f"The primary concepts and principles discussed in this section",
                "Unrelated background information",
                "Advanced prerequisites from other topics",
                "Historical context only"
            ],
            "correct_answer": 0,
            "explanation": f"This section primarily focuses on {title.lower()}, covering the key concepts and main ideas presented in the content."
        },
        {
            "question": "Based on the content presented, which statement best describes the approach used?",
            "options": [
                "A structured explanation with clear examples and explanations",
                "Only theoretical definitions without practical context",
                "Purely mathematical formulas with no explanation",
                "General observations without specific details"
            ],
            "correct_answer": 0,
            "explanation": "The content uses a structured approach with explanations and relevant examples to help understand the concepts."
        },
        {
            "question": "What type of learner would benefit most from this section?",
            "options": [
                "Anyone looking to understand the fundamentals of this topic",
                "Only advanced experts in the field",
                "Those who already know everything about the subject",
                "People not interested in learning this topic"
            ],
            "correct_answer": 0,
            "explanation": "This section is designed to help learners understand the fundamental concepts, making it suitable for anyone seeking to learn about this topic."
        },
        {
            "question": f"In the context of '{title}', what is the key takeaway?",
            "options": [
                "Understanding the core concepts and their practical applications",
                "Memorizing unrelated facts and figures",
                "Ignoring the main points of the section",
                "Skipping important explanations"
            ],
            "correct_answer": 0,
            "explanation": "The key takeaway is to understand the core concepts presented and how they can be applied, which is the primary goal of this section."
        },
        {
            "question": "How should this material be best approached for learning?",
            "options": [
                "Study the concepts carefully and practice with examples",
                "Skip all explanations and jump to conclusions",
                "Ignore the detailed information provided",
                "Only read the title and move on"
            ],
            "correct_answer": 0,
            "explanation": "The best approach is to carefully study the concepts and practice with examples to fully grasp the material being taught."
        }
    ]
    
    # Select questions based on num_questions needed
    for i in range(min(num_questions, len(question_templates))):
        template = question_templates[i]
        question = QuizQuestion(
            question=template["question"],
            options=template["options"],
            correct_answer=template["correct_answer"],
            explanation=template["explanation"]
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
        if not GOOGLE_API_KEY:
            logger.error("GOOGLE_API_KEY is not set")
            raise ValueError("GOOGLE_API_KEY is not set. Please configure it in your environment.")

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

        # Call the Google Gemini API with multiple model fallbacks
        logger.info("Sending request to Google Gemini for quiz generation")

        # Try multiple Gemini models in order of preference
        models_to_try = [
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro"
        ]
        
        llm_response = None
        
        for model_name in models_to_try:
            try:
                logger.info(f"Trying Gemini model: {model_name} for quiz generation")

                model = genai.GenerativeModel(
                    model_name=model_name,
                    generation_config={
                        "temperature": 0.3,
                        "top_p": 1,
                        "max_output_tokens": 2048,
                    }
                )

                full_prompt = f"""You are an educational quiz creator. Generate multiple-choice questions in valid JSON format only, no additional text.

{prompt}"""

                response = model.generate_content(full_prompt)

                if response and response.text:
                    llm_response = response.text
                    logger.info(f"Quiz generation success with Gemini model: {model_name}")
                    break
                else:
                    logger.warning(f"Empty response from Gemini quiz model: {model_name}")

            except Exception as e:
                logger.error(f"Exception with Gemini quiz model {model_name}: {type(e).__name__}: {str(e)}")
                continue
        

        if not llm_response:
            logger.error("All Gemini quiz models failed, creating fallback questions")
            return create_fallback_quiz(chunk, level, num_questions)

        logger.info("Received quiz response from Google Gemini")
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