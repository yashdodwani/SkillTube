from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.database import get_db
from app.db.crud import (
    get_user_courses, save_user_course, update_course_progress,
    get_course_by_task_id, get_user_course,
)
from app.core.security import get_current_user
from app.models.schemas import UserCourseOut, SaveCourseRequest, ProgressUpdate
from app.db.models import User, UserCourse

router = APIRouter(prefix="/api/users", tags=["users"])


def _serialize_user_course(uc: UserCourse) -> dict:
    return {
        "id": uc.id,
        "course_id": uc.course_id,
        "saved_at": uc.saved_at,
        "chunks_completed": uc.chunks_completed or [],
        "quizzes_completed": uc.quizzes_completed or [],
        "total_chunks": len(uc.course.chunks) if uc.course and uc.course.chunks else 0,
        "course": {
            "id": uc.course.id,
            "title": uc.course.title,
            "video_id": uc.course.video_id,
            "difficulty_level": uc.course.difficulty_level,
            "status": uc.course.status,
        } if uc.course else None,
    }


@router.get("/courses", response_model=List[UserCourseOut])
async def list_saved_courses(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    courses = await get_user_courses(db, user_id=current_user.id)
    return [_serialize_user_course(uc) for uc in courses]


@router.post("/courses", response_model=UserCourseOut, status_code=status.HTTP_201_CREATED)
async def save_course(
    body: SaveCourseRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uc = await save_user_course(db, user_id=current_user.id, course_id=body.course_id)
    # reload with relationships
    uc = await get_user_course(db, user_id=current_user.id, course_id=body.course_id)
    return _serialize_user_course(uc)


@router.put("/courses/{course_id}/progress", response_model=UserCourseOut)
async def update_progress(
    course_id: int,
    body: ProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    uc = await update_course_progress(
        db,
        user_id=current_user.id,
        course_id=course_id,
        chunks_completed=body.chunks_completed,
        quizzes_completed=body.quizzes_completed,
    )
    if not uc:
        raise HTTPException(status_code=404, detail="Course not saved by this user.")
    uc = await get_user_course(db, user_id=current_user.id, course_id=course_id)
    return _serialize_user_course(uc)

