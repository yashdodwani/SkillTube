"""
CRUD helpers – all DB interaction lives here, keeping routers thin.
"""
from __future__ import annotations
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Course, Chunk, Quiz, Question, User, UserCourse


# ──────────────────────────────────────────────
# Course
# ──────────────────────────────────────────────

async def create_course(
    db: AsyncSession,
    *,
    youtube_url: str,
    video_id: str,
    difficulty_level: str,
    task_id: str,
    title: Optional[str] = None,
    status: str = "initialized",
) -> Course:
    course = Course(
        youtube_url=youtube_url,
        video_id=video_id,
        difficulty_level=difficulty_level,
        task_id=task_id,
        title=title,
        status=status,
    )
    db.add(course)
    await db.commit()
    await db.refresh(course)
    return course


async def get_course_by_task_id(db: AsyncSession, task_id: str) -> Optional[Course]:
    result = await db.execute(
        select(Course)
        .where(Course.task_id == task_id)
        .options(
            selectinload(Course.chunks).selectinload(Chunk.quiz).selectinload(Quiz.questions)
        )
    )
    return result.scalar_one_or_none()


async def update_course_status(db: AsyncSession, course: Course, status: str) -> Course:
    course.status = status
    await db.commit()
    await db.refresh(course)
    return course


async def get_all_courses(db: AsyncSession) -> List[Course]:
    result = await db.execute(
        select(Course)
        .options(selectinload(Course.chunks))
        .order_by(Course.created_at.desc())
    )
    return list(result.scalars().all())


# ──────────────────────────────────────────────
# Chunk
# ──────────────────────────────────────────────

async def create_chunk(
    db: AsyncSession,
    *,
    course_id: int,
    title: Optional[str],
    start_time: float,
    end_time: float,
    summary: str,
    transcript: str,
) -> Chunk:
    chunk = Chunk(
        course_id=course_id,
        title=title,
        start_time=start_time,
        end_time=end_time,
        summary=summary,
        transcript=transcript,
    )
    db.add(chunk)
    await db.flush()   # get chunk.id without committing yet
    return chunk


# ──────────────────────────────────────────────
# Quiz + Questions
# ──────────────────────────────────────────────

async def create_quiz_with_questions(
    db: AsyncSession,
    *,
    chunk_id: int,
    questions: List[dict],   # list of {question_text, options, correct_answer, explanation}
) -> Quiz:
    quiz = Quiz(chunk_id=chunk_id)
    db.add(quiz)
    await db.flush()   # get quiz.id

    for q in questions:
        question = Question(
            quiz_id=quiz.id,
            question_text=q["question"],
            options=q["options"],
            correct_answer=q["correct_answer"],
            explanation=q["explanation"],
        )
        db.add(question)

    return quiz


# ──────────────────────────────────────────────
# User
# ──────────────────────────────────────────────

async def create_user(db: AsyncSession, *, email: str, hashed_password: str) -> User:
    user = User(email=email, hashed_password=hashed_password)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: int) -> Optional[User]:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


# ──────────────────────────────────────────────
# UserCourse (saved courses + progress)
# ──────────────────────────────────────────────

async def get_user_courses(db: AsyncSession, user_id: int) -> List[UserCourse]:
    result = await db.execute(
        select(UserCourse)
        .where(UserCourse.user_id == user_id)
        .options(
            selectinload(UserCourse.course).selectinload(Course.chunks)
        )
        .order_by(UserCourse.saved_at.desc())
    )
    return list(result.scalars().all())


async def get_user_course(db: AsyncSession, user_id: int, course_id: int) -> Optional[UserCourse]:
    result = await db.execute(
        select(UserCourse)
        .where(UserCourse.user_id == user_id, UserCourse.course_id == course_id)
        .options(selectinload(UserCourse.course).selectinload(Course.chunks))
    )
    return result.scalar_one_or_none()


async def save_user_course(db: AsyncSession, *, user_id: int, course_id: int) -> UserCourse:
    existing = await get_user_course(db, user_id=user_id, course_id=course_id)
    if existing:
        return existing
    uc = UserCourse(user_id=user_id, course_id=course_id, chunks_completed=[], quizzes_completed=[])
    db.add(uc)
    await db.commit()
    await db.refresh(uc)
    return uc


async def update_course_progress(
    db: AsyncSession,
    *,
    user_id: int,
    course_id: int,
    chunks_completed: Optional[List[int]] = None,
    quizzes_completed: Optional[List[int]] = None,
) -> Optional[UserCourse]:
    uc = await get_user_course(db, user_id=user_id, course_id=course_id)
    if not uc:
        return None
    if chunks_completed is not None:
        uc.chunks_completed = chunks_completed
    if quizzes_completed is not None:
        uc.quizzes_completed = quizzes_completed
    await db.commit()
    await db.refresh(uc)
    return uc

