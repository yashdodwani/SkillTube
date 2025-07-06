from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.routers import course
import logging
from pathlib import Path
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any
from fastapi import APIRouter, BackgroundTasks
import time
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create necessary directories
TEMP_DIR = Path("temp")
TEMP_DIR.mkdir(exist_ok=True)
for subdir in ["chunks", "quizzes"]:
    (TEMP_DIR / subdir).mkdir(exist_ok=True)

app = FastAPI(title="Course Generator API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(course.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)