from __future__ import annotations

import logging
import time
from typing import Any, Dict, List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.crud import (
    create_course,
    create_chunk,
    create_quiz_with_questions,
    get_course_by_task_id,
    get_all_courses,
    update_course_status,
)
from app.db.database import get_db
from app.db.models import Chunk, Quiz
from app.models.schemas import (
    ChunkRequest,
    ProcessingStatus,
    QuizQuestion,
    QuizRequest,
    VideoChunk,
)
from app.services import chunking, quiz as quiz_svc

router = APIRouter(prefix="/api/course")
logger = logging.getLogger(__name__)

# In-memory status store (lightweight – only the task progress lives here;
# the actual data is persisted to Postgres)
task_status: Dict[str, ProcessingStatus] = {}


# ──────────────────────────────────────────────────────────────
# Background worker
# ──────────────────────────────────────────────────────────────

async def _process_complete_course(task_id: str, request: ChunkRequest) -> None:
    """
    Background task that:
      1. Generates chunks via Gemini
      2. Generates quiz questions per chunk via Gemini
      3. Persists everything to PostgreSQL
    """
    from app.db.database import AsyncSessionLocal  # avoid circular at module level

    task_status[task_id].status = "processing"
    task_status[task_id].current_step = 1
    task_status[task_id].message = "Generating content chunks…"

    youtube_url = str(request.youtube_url)
    video_id = chunking.extract_video_id(youtube_url)

    try:
        async with AsyncSessionLocal() as db:
            # ── 1. Persist course row ──────────────────────────────────
            course = await create_course(
                db,
                youtube_url=youtube_url,
                video_id=video_id,
                difficulty_level=request.level,
                task_id=task_id,
                status="processing",
            )

            # ── 2. Generate chunks ────────────────────────────────────
            chunks: List[VideoChunk] = await chunking.generate_chunks_from_url(
                youtube_url, request.level
            )

            if not course.title and chunks:
                course.title = chunks[0].title
                await db.commit()

            # ── 3. For each chunk: persist + generate quiz ────────────
            task_status[task_id].current_step = 2
            task_status[task_id].message = "Generating quiz questions…"

            all_results: List[Dict[str, Any]] = []

            for vc in chunks:
                # Persist chunk
                chunk_row = await create_chunk(
                    db,
                    course_id=course.id,
                    title=vc.title,
                    start_time=vc.start_time,
                    end_time=vc.end_time,
                    summary=vc.summary,
                    transcript=vc.transcript,
                )

                # Generate quiz questions
                questions: List[QuizQuestion] = await quiz_svc.generate_questions(
                    vc, request.level
                )

                # Persist quiz + questions
                await create_quiz_with_questions(
                    db,
                    chunk_id=chunk_row.id,
                    questions=[q.model_dump() for q in questions],
                )

                all_results.append(
                    {
                        "chunk": vc.model_dump(),
                        "questions": [q.model_dump() for q in questions],
                    }
                )

            # ── 4. Commit everything in one shot ──────────────────────
            await update_course_status(db, course, "completed")

        # Update in-memory status so the frontend polling sees the result
        task_status[task_id].status = "completed"
        task_status[task_id].message = "Course generation completed"
        task_status[task_id].result = all_results
        task_status[task_id].video_url = youtube_url
        task_status[task_id].video_id = video_id

        logger.info(f"[{task_id}] Course saved to DB (video_id={video_id})")

    except Exception as exc:
        logger.error(f"[{task_id}] Error processing course: {exc}", exc_info=True)
        task_status[task_id].status = "failed"
        task_status[task_id].message = f"Error: {exc}"

        # Try to mark the DB row as failed too
        try:
            async with AsyncSessionLocal() as db:
                course = (await db.execute(
                    __import__("sqlalchemy", fromlist=["select"]).select(
                        __import__("app.db.models", fromlist=["Course"]).Course
                    ).where(
                        __import__("app.db.models", fromlist=["Course"]).Course.task_id == task_id
                    )
                )).scalar_one_or_none()
                if course:
                    await update_course_status(db, course, "failed")
        except Exception:
            pass


# ──────────────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────────────

@router.post("/process-complete", response_model=ProcessingStatus)
async def process_course(
    request: ChunkRequest,
    background_tasks: BackgroundTasks,
):
    """Kick off a full course-generation pipeline in the background."""
    task_id = f"task_{int(time.time() * 1000)}"

    task_status[task_id] = ProcessingStatus(
        status="initialized",
        current_step=0,
        total_steps=2,
        message="Initialising course generation…",
        task_id=task_id,
    )

    background_tasks.add_task(_process_complete_course, task_id, request)
    return task_status[task_id]


@router.get("/status/{task_id}", response_model=ProcessingStatus)
async def get_course_status(task_id: str):
    """Poll the in-memory task status."""
    if task_id not in task_status:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_status[task_id]


@router.get("/history")
async def get_course_history(db: AsyncSession = Depends(get_db)):
    """Return all previously generated courses from PostgreSQL."""
    try:
        courses = await get_all_courses(db)
        return [
            {
                "task_id": c.task_id,
                "video_id": c.video_id,
                "video_url": c.youtube_url,
                "title": c.title or "Untitled",
                "level": c.difficulty_level,
                "num_chunks": len(c.chunks),
                "status": c.status,
                "created_at": c.created_at.isoformat(),
            }
            for c in courses
        ]
    except Exception as exc:
        logger.error(f"Error fetching history: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/course/{task_id}")
async def get_course(task_id: str, db: AsyncSession = Depends(get_db)):
    """
    Load a completed course from the DB (used to resume a previously
    generated course without re-processing).
    """
    course = await get_course_by_task_id(db, task_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    result = []
    for chunk in course.chunks:
        questions = []
        if chunk.quiz:
            questions = [
                {
                    "question": q.question_text,
                    "options": q.options,
                    "correct_answer": q.correct_answer,
                    "explanation": q.explanation,
                }
                for q in chunk.quiz.questions
            ]
        result.append(
            {
                "chunk": {
                    "title": chunk.title,
                    "start_time": chunk.start_time,
                    "end_time": chunk.end_time,
                    "summary": chunk.summary,
                    "transcript": chunk.transcript,
                },
                "questions": questions,
            }
        )

    return {
        "task_id": course.task_id,
        "video_id": course.video_id,
        "video_url": course.youtube_url,
        "title": course.title,
        "level": course.difficulty_level,
        "status": course.status,
        "result": result,
    }


# ── Legacy single-step endpoints (still useful for testing) ───

@router.post("/chunks", response_model=List[VideoChunk])
async def generate_chunks_endpoint(request: ChunkRequest):
    try:
        return await chunking.generate_chunks_from_url(
            str(request.youtube_url), request.level
        )
    except Exception as exc:
        logger.error(f"Error generating chunks: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/quiz", response_model=List[QuizQuestion])
async def generate_quiz_endpoint(request: QuizRequest):
    try:
        return await quiz_svc.generate_questions(request.chunk, request.level)
    except Exception as exc:
        logger.error(f"Error generating quiz: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))

