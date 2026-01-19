from pydantic import BaseModel, HttpUrl, field_validator
from typing import List, Literal, Optional, Dict, Any
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

class ChunkData(BaseModel):
    title: str
    summary: str
    start_time: float
    end_time: float
    transcript: str