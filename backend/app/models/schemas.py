from pydantic import BaseModel, HttpUrl, field_validator, EmailStr
from typing import List, Literal, Optional, Dict, Any
from datetime import datetime
import re

class ChunkRequest(BaseModel):
    youtube_url: HttpUrl
    level: Literal["easy", "medium", "hard"]

    @field_validator("youtube_url")
    @classmethod
    def validate_youtube_url(cls, value: HttpUrl) -> HttpUrl:
        patterns = [
            r'^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]+',
            r'^https?:\/\/youtu\.be\/[\w-]+'
        ]
        if not any(re.match(pattern, str(value)) for pattern in patterns):
            raise ValueError("Invalid YouTube URL")
        return value

class VideoChunk(BaseModel):
    title: Optional[str] = "Video Segment"
    start_time: float
    end_time: float
    transcript: str
    summary: str

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int
    explanation: str

class QuizRequest(BaseModel):
    chunk: VideoChunk
    level: Literal["easy", "medium", "hard"]

class ProcessingStatus(BaseModel):
    status: str
    current_step: int
    total_steps: int
    message: str
    result: Optional[List[Dict[str, Any]]] = None
    task_id: Optional[str] = None
    video_url: Optional[str] = None
    video_id: Optional[str] = None
    course_id: Optional[int] = None

class ChunkData(BaseModel):
    title: str
    summary: str
    start_time: float
    end_time: float
    transcript: str


# ──────────────────────────────────────────────
# Auth schemas
# ──────────────────────────────────────────────

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: str
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    email: Optional[str] = None


# ──────────────────────────────────────────────
# UserCourse / progress schemas
# ──────────────────────────────────────────────

class SaveCourseRequest(BaseModel):
    course_id: int


class ProgressUpdate(BaseModel):
    chunks_completed: Optional[List[int]] = None
    quizzes_completed: Optional[List[int]] = None


class CourseOut(BaseModel):
    id: int
    title: Optional[str]
    video_id: str
    difficulty_level: str
    status: str

    model_config = {"from_attributes": True}


class UserCourseOut(BaseModel):
    id: int
    course_id: int
    saved_at: datetime
    chunks_completed: List[int]
    quizzes_completed: List[int]
    total_chunks: int
    course: CourseOut

    model_config = {"from_attributes": True}

