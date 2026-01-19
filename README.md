# SkillVid - AI-Powered Course Generator

Transform YouTube videos into interactive courses using AI-powered content analysis and quiz generation.

## 🚀 Features

- **Smart Content Analysis**: AI-powered video transcript analysis and segmentation
- **Interactive Quizzes**: Difficulty-based question generation (Easy/Medium/Hard)
- **Modern UI**: Beautiful React frontend with responsive design
- **Real-time Processing**: Background task processing with progress tracking
- **FastAPI Backend**: High-performance Python backend with async support

## 🏗️ Architecture

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: FastAPI with async/await support
- **AI Integration**: OpenRouter.ai for content analysis and quiz generation
- **Database**: File-based caching (SQLAlchemy ready for production)

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm 8+**
- **OpenRouter API Key** (for AI content generation)
- **Transcript API Key** (optional, for reliable transcript extraction)

## 🛠️ Quick Start

### 1. Clone and Setup Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

### 2. Setup Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install
```

### 3. Get API Keys

**OpenRouter API Key (Required):**
1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up and create an API key
3. Add it to `backend/.env`:
   ```env
   OPENROUTER_API_KEY=your_api_key_here
   ```

**Transcript API Key (Optional but Recommended):**
1. Go to [TranscriptAPI.com](https://transcriptapi.com/)
2. Sign up and get an API key
3. Add it to `backend/.env`:
   ```env
   TRANSCRIPT_API_KEY=your_transcript_api_key_here
   ```

> **Note:** The transcript API provides more reliable transcript extraction than the free fallback method. It includes professional features like rate limiting, caching, and better error handling.

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🎯 Usage

1. **Enter YouTube URL**: Paste any YouTube video URL (ensure it has captions)
2. **Select Difficulty**: Choose Easy (3 questions), Medium (4 questions), or Hard (5 questions)
3. **Generate Course**: Click "Generate Course" to start AI processing
4. **Learn Interactively**: Navigate through sections, watch video segments, and complete quizzes

## 🔧 API Endpoints

### Course Generation
- `POST /api/course/process-complete` - Start complete course generation
- `GET /api/course/status/{task_id}` - Check processing status
- `POST /api/course/chunks` - Generate video chunks only
- `POST /api/course/quiz` - Generate quiz for a specific chunk

### System
- `GET /health` - Health check
- `GET /docs` - Interactive API documentation

## 🧪 Testing

Test the API with the included test script:

```bash
cd backend
python test_api.py
```

## 📁 Project Structure

```
skillvid/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Pydantic models
│   │   ├── routers/        # API endpoints
│   │   └── services/       # Business logic
│   ├── temp/               # Temporary file storage
│   ├── main.py             # FastAPI app
│   ├── requirements.txt    # Python dependencies
│   └── test_api.py         # API test script
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API integration
│   │   └── types/          # TypeScript types
│   └── package.json        # Node dependencies
└── docs/                   # Documentation
    └── SETUP_GUIDE.md      # Detailed setup guide
```

## 🔄 Data Flow

1. User enters YouTube URL on frontend
2. Frontend sends request to FastAPI backend
3. Backend extracts transcript using:
   - **Primary**: Professional TranscriptAPI.com service (if API key provided)
   - **Fallback**: youtube-transcript-api library
4. OpenRouter AI analyzes content and creates logical sections
5. OpenRouter generates quiz questions for each section
6. Results cached in temp files (or database in production)
7. Frontend displays interactive learning interface

## 🚀 Production Deployment

### Backend
```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UnicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

## 🛠️ Development

### Adding New Features

**Backend:**
1. Add endpoints in `app/routers/`
2. Implement business logic in `app/services/`
3. Define data models in `app/models/schemas.py`

**Frontend:**
1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update API service in `src/services/api.ts`

### Environment Variables

```env
# Required
OPENROUTER_API_KEY=your_api_key_here

# Optional (but recommended for better reliability)
TRANSCRIPT_API_KEY=your_transcript_api_key_here

# Optional
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
HOST=0.0.0.0
PORT=8000
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**: Check Python version and virtual environment
2. **API key errors**: Verify OPENROUTER_API_KEY in `.env` file
3. **Transcript errors**: 
   - If using TranscriptAPI: Check TRANSCRIPT_API_KEY and credits
   - If using fallback: Ensure YouTube video has captions enabled
4. **Frontend connection issues**: Verify backend is running on port 8000

### Debug Mode

```bash
# Backend with debug logging
uvicorn main:app --reload --log-level debug

# Frontend with network inspection
npm run dev
# Check browser dev tools for API requests
```

## 📚 Documentation

- [Detailed Setup Guide](docs/SETUP_GUIDE.md)
- [Frontend README](frontend/README.md)
- [API Documentation](http://localhost:8000/docs) (when running)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is for educational and demonstration purposes.

## 🙏 Acknowledgments

- [TranscriptAPI.com](https://transcriptapi.com/) for professional transcript extraction
- [OpenRouter](https://openrouter.ai/) for AI model access
- [FastAPI](https://fastapi.tiangolo.com/) for the backend framework
- [React](https://reactjs.org/) for the frontend framework
- [YouTube Transcript API](https://github.com/jdepoix/youtube-transcript-api) for fallback transcript extraction