from fastapi import APIRouter, HTTPException, BackgroundTasks
from ..models.schemas import ChunkRequest, QuizRequest, ProcessingStatus, VideoChunk, QuizQuestion
from ..services import chunking, quiz
import logging
import time
import os
import json
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime

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
            message="Generating content chunks",
            task_id=task_id
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

        # Store the results in task_status with video info
        task_status[task_id].result = all_questions
        task_status[task_id].video_url = youtube_url
        task_status[task_id].video_id = chunking.extract_video_id(youtube_url)

    except Exception as e:
        logger.error(f"Error processing complete course: {str(e)}")
        task_status[task_id].status = "failed"
        task_status[task_id].message = f"Error: {str(e)}"


@router.post("/process-complete")
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

    # Return the task status with task_id
    response = task_status[task_id]
    response.task_id = task_id  # Add task_id to response
    return response


@router.get("/status/{task_id}", response_model=ProcessingStatus)
async def get_course_status(task_id: str):
    if task_id not in task_status:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_status[task_id]


@router.get("/history")
async def get_course_history():
    """
    Get list of previously generated courses from temp directory
    """
    try:
        # Get temp directory
        temp_dir = Path(__file__).parent.parent.parent / "temp"
        chunks_dir = temp_dir / "chunks"
        
        if not chunks_dir.exists():
            return []
        
        history = []
        
        # Scan chunks directory for course files
        for chunk_file in chunks_dir.glob("*_chunks.json"):
            try:
                # Parse filename: videoId_level_chunks.json
                filename = chunk_file.stem  # Remove .json
                parts = filename.rsplit('_', 2)  # Split from right, max 2 splits
                
                if len(parts) >= 2:
                    video_id = parts[0]
                    level = parts[1]
                    
                    # Read the chunk file to get video info
                    with open(chunk_file, 'r', encoding='utf-8') as f:
                        chunks_data = json.load(f)
                    
                    # Get file modification time
                    modified_time = datetime.fromtimestamp(chunk_file.stat().st_mtime)
                    
                    # Create history entry
                    history.append({
                        "video_id": video_id,
                        "video_url": f"https://www.youtube.com/watch?v={video_id}",
                        "level": level,
                        "num_chunks": len(chunks_data),
                        "created_at": modified_time.isoformat(),
                        "title": chunks_data[0].get("title", "Untitled") if chunks_data else "Untitled"
                    })
            except Exception as e:
                logger.warning(f"Error processing {chunk_file}: {e}")
                continue
        
        # Sort by creation date (newest first)
        history.sort(key=lambda x: x["created_at"], reverse=True)
        
        return history
        
    except Exception as e:
        logger.error(f"Error fetching course history: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))