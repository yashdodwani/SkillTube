from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routers import course
import logging
from pathlib import Path
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any
from fastapi import APIRouter, BackgroundTasks
import time
import re
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create necessary directories in the backend folder
TEMP_DIR = Path(__file__).parent / "temp"
try:
    # Create temp directory
    TEMP_DIR.mkdir(exist_ok=True)
    logger.info(f"Created temp directory at: {TEMP_DIR}")
    
    # Create subdirectories
    for subdir in ["chunks", "quizzes"]:
        subdir_path = TEMP_DIR / subdir
        subdir_path.mkdir(exist_ok=True)
        logger.info(f"Created {subdir} directory at: {subdir_path}")
        
except Exception as e:
    logger.error(f"Error creating directories: {e}")
    # Fallback: try to create in current working directory
    TEMP_DIR = Path.cwd() / "temp"
    TEMP_DIR.mkdir(exist_ok=True)
    for subdir in ["chunks", "quizzes"]:
        (TEMP_DIR / subdir).mkdir(exist_ok=True)
    logger.info(f"Created fallback temp directory at: {TEMP_DIR}")

app = FastAPI(title="Course Generator API", version="1.0.0")

# Configure CORS - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for the frontend
frontend_path = Path(__file__).parent
index_html_path = frontend_path / "index.html"
if index_html_path.exists():
    logger.info(f"Frontend found at: {index_html_path}")
else:
    logger.warning(f"Frontend not found at: {index_html_path}")

# Include routers
app.include_router(course.router)

@app.get("/")
async def root():
    """Serve the frontend index.html file"""
    index_path = Path(__file__).parent / "index.html"
    if index_path.exists():
        logger.info(f"Serving frontend from: {index_path}")
        return FileResponse(str(index_path), media_type="text/html")
    else:
        logger.warning(f"Frontend not found at: {index_path}")
        return {"message": "SkillVId API is running!", "version": "1.0.0", "note": "Frontend not found"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": time.time()}

# Catch-all route for SPA routing
@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    """Handle client-side routing for the SPA"""
    # Skip API routes
    if full_path.startswith("api/") or full_path.startswith("health"):
        raise HTTPException(status_code=404, detail="Not found")
    
    # Serve index.html for all other routes (SPA routing)
    index_path = Path(__file__).parent / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path), media_type="text/html")
    else:
        raise HTTPException(status_code=404, detail="Frontend not found")

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    # Check if frontend is available
    index_path = Path(__file__).parent / "index.html"
    if index_path.exists():
        logger.info(f"🎉 Frontend found! Open http://{host}:{port} in your browser")
        logger.info(f"📁 Frontend file: {index_path}")
    else:
        logger.warning(f"⚠️  Frontend not found at: {index_path}")
        logger.info(f"🔧 API only mode. Frontend endpoints will return JSON responses")
    
    logger.info(f"🚀 Starting SkillVId server on http://{host}:{port}")
    uvicorn.run(app, host=host, port=port)