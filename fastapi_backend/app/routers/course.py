from fastapi import APIRouter, HTTPException, BackgroundTasks
from ..models.schemas import ChunkRequest, QuizRequest, ProcessingStatus, VideoChunk, QuizQuestion
from ..services import chunking, quiz
import logging
import time
from typing import List, Dict, Any

router = APIRouter(prefix="/api/course")
logger = logging.getLogger(__name__)


task_status = {}


@router.post("/chunks", response_model=List[VideoChunk])
async def generate_chunks(request: ChunkRequest):
    """
    Generate content chunks for a YouTube video
    """
    try:

        youtube_url = str(request.youtube_url)
        chunks = await chunking.generate_chunks_from_url(youtube_url, request.level)
        return chunks
    except Exception as e:
        logger.error(f"Error generating chunks: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/quiz", response_model=List[QuizQuestion])
async def generate_quiz(request: QuizRequest):
    """
    Generate quiz questions for a chunk
    """
    try:
        # Generate quiz questions from chunk
        questions = await quiz.generate_questions(request.chunk, request.level)
        return questions
    except Exception as e:
        logger.error(f"Error generating quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Optional: Background task functionality for processing longer videos
async def process_complete_course(task_id: str, request: ChunkRequest):
    try:
        # Update status
        task_status[task_id] = ProcessingStatus(
            status="processing",
            current_step=1,
            total_steps=2,
            message="Generating content chunks"
        )

        # 1. Generate content chunks
        # Pass as string to avoid Pydantic URL object issues
        youtube_url = str(request.youtube_url)
        chunks = await chunking.generate_chunks_from_url(youtube_url, request.level)

        # 2. Generate quiz questions for each chunk
        task_status[task_id].current_step = 2
        task_status[task_id].message = "Generating quiz questions"

        all_questions = []
        for chunk in chunks:
            # Generate quiz questions for this chunk
            questions = await quiz.generate_questions(chunk, request.level)
            all_questions.append({"chunk": chunk, "questions": questions})

        task_status[task_id].status = "completed"
        task_status[task_id].message = "Course generation completed"

        # Store the results in task_status
        task_status[task_id].result = all_questions

    except Exception as e:
        logger.error(f"Error processing complete course: {str(e)}")
        task_status[task_id].status = "failed"
        task_status[task_id].message = f"Error: {str(e)}"


@router.post("/process-complete", response_model=ProcessingStatus)
async def process_course(request: ChunkRequest, background_tasks: BackgroundTasks):
    """
    Process a complete course generation in the background
    """
    task_id = f"task_{int(time.time())}"

    # Initialize task status
    task_status[task_id] = ProcessingStatus(
        status="initialized",
        current_step=0,
        total_steps=2,
        message="Initializing course generation"
    )

    # Start processing in background
    background_tasks.add_task(process_complete_course, task_id, request)

    return task_status[task_id]


@router.get("/status/{task_id}", response_model=ProcessingStatus)
async def get_course_status(task_id: str):
    if task_id not in task_status:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_status[task_id]