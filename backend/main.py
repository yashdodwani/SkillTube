from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from app.routers import course
from app.db.database import init_db
import logging
from pathlib import Path
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create DB tables. Shutdown: nothing to do."""
    logger.info("Initialising database…")
    await init_db()
    logger.info("Database ready.")
    yield

app = FastAPI(title="Course Generator API", version="1.0.0", lifespan=lifespan)

# Configure CORS from environment
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = (
    ["*"] if allowed_origins_env.strip() == "*"
    else [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static frontend path (serve `public/index.html` if present)
frontend_path = Path(__file__).parent / "public"
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
    index_path = index_html_path
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
    if full_path.startswith("api/") or full_path == "health":
        raise HTTPException(status_code=404, detail="Not found")
    
    # Serve index.html for all other routes (SPA routing)
    index_path = index_html_path
    if index_path.exists():
        return FileResponse(str(index_path), media_type="text/html")
    else:
        raise HTTPException(status_code=404, detail="Frontend not found")

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8001))
    uvicorn.run("main:app", host=host, port=port, reload=True)
