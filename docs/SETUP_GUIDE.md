# SkillVid Setup Guide

Complete setup instructions for the SkillVid AI-powered course generator.

## Overview

SkillVid consists of two main components:
- **Backend**: FastAPI server with AI integration (Python)
- **Frontend**: Modern React application (TypeScript)

## Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm 8+**
- **OpenRouter API Key** (for AI content generation)
- **Transcript API Key** (optional, for reliable transcript extraction)

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Required API Keys
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional API Keys (recommended for better reliability)
TRANSCRIPT_API_KEY=your_transcript_api_key_here

# Optional Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
HOST=0.0.0.0
PORT=8000
```

#### Getting API Keys:

**OpenRouter API Key (Required):**
1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up and create an API key
3. Copy the key to your `.env` file

**Transcript API Key (Optional but Recommended):**
1. Go to [TranscriptAPI.com](https://transcriptapi.com/)
2. Sign up and get an API key from the dashboard
3. Copy the key to your `.env` file

OpenRouter provides access to multiple AI models including Gemini, GPT, Claude, and others through a single API.

The professional transcript API provides more reliable transcript extraction with features like:
- Better error handling and retry logic
- Rate limiting and caching
- Support for more video types
- Professional support

If no transcript API key is provided, the system will fallback to the free `youtube-transcript-api` library.

### 5. Start Backend Server
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### 6. Verify Backend
- API Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

### 1. Access the Application
Open your browser and navigate to `http://localhost:3000`

### 2. Generate a Course
1. Enter a YouTube URL (ensure the video has captions/subtitles)
2. Select difficulty level (Easy/Medium/Hard)
3. Click "Generate Course"
4. Wait for AI processing to complete

### 3. Interactive Learning
1. Watch video sections
2. Complete quizzes for each section
3. Track your progress
4. Navigate between sections

## API Endpoints

### Course Generation
- `POST /api/course/process-complete` - Start complete course generation
- `GET /api/course/status/{task_id}` - Check processing status
- `POST /api/course/chunks` - Generate video chunks only
- `POST /api/course/quiz` - Generate quiz for a specific chunk

### System
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation

## Troubleshooting

### Common Issues

**1. Backend won't start**
- Check Python version: `python --version`
- Ensure virtual environment is activated
- Verify all dependencies are installed: `pip list`

**2. API Key errors**
- Verify API key is correctly set in `.env`
- Check API key permissions and quotas
- Ensure `.env` file is in the `backend` directory
- Test your OpenRouter API key at https://openrouter.ai/

**3. YouTube transcript errors**
- If using TranscriptAPI: Check API key and credit balance
- If using fallback method: Ensure the video has captions/subtitles enabled
- Try with different YouTube videos
- Check if the video is publicly accessible
- Verify video URL format is correct

**4. Frontend can't connect to backend**
- Verify backend is running on port 8000
- Check CORS configuration in backend
- Ensure no firewall blocking connections

**5. Course generation fails**
- Check backend logs for detailed error messages
- Verify API key has sufficient quota
- Try with shorter videos first
- Check OpenRouter service status

### Debug Mode

**Backend Debug:**
```bash
# Enable debug logging
export PYTHONPATH=$PYTHONPATH:$(pwd)
python -m uvicorn main:app --reload --log-level debug
```

**Frontend Debug:**
```bash
# Check network requests in browser dev tools
# Console logs show API communication
npm run dev
```

## Development

### Backend Development
- Code is in `backend/app/`
- Services: `backend/app/services/`
- Models: `backend/app/models/`
- Routers: `backend/app/routers/`

### Frontend Development
- Code is in `frontend/src/`
- Components: `frontend/src/components/`
- Pages: `frontend/src/pages/`
- Services: `frontend/src/services/`

### Adding Features

**Backend:**
1. Add new endpoints in `routers/`
2. Implement business logic in `services/`
3. Define data models in `models/schemas.py`

**Frontend:**
1. Create components in `components/`
2. Add pages in `pages/`
3. Update API service in `services/api.ts`

## Production Deployment

### Backend Production
```bash
# Install production dependencies
pip install gunicorn

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UnicornWorker --bind 0.0.0.0:8000
```

### Frontend Production
```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

### Environment Variables for Production
```env
# Backend
OPENROUTER_API_KEY=your_production_key
ALLOWED_ORIGINS=https://yourdomain.com
HOST=0.0.0.0
PORT=8000

# Database (optional)
DATABASE_URL=postgresql://user:pass@localhost/skillvid
```

## Architecture

### Data Flow
1. User enters YouTube URL
2. Frontend sends request to backend
3. Backend extracts transcript using `youtube-transcript-api`
4. OpenRouter AI analyzes content and creates chunks
5. OpenRouter generates quiz questions
6. Results stored in temp files (or database)
7. Frontend displays interactive course

### File Structure
```
skillvid/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Pydantic models
│   │   ├── routers/        # API endpoints
│   │   └── services/       # Business logic
│   ├── temp/               # Temporary file storage
│   ├── main.py             # FastAPI app
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API integration
│   │   └── types/          # TypeScript types
│   └── package.json        # Node dependencies
└── README.md               # Project documentation
```

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review backend logs for detailed error messages
3. Verify API key configuration and quotas
4. Test with different YouTube videos

## License

This project is for educational and demonstration purposes.