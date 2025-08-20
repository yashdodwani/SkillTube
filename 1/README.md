# SkillVId - AI-Powered Learning Platform

Transform any YouTube video into an interactive learning experience with AI-generated content chunks and quizzes.

## 🚀 Quick Start

### Prerequisites
- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **OpenRouter API Key** - [Get one here](https://openrouter.ai/)

### Automated Setup

#### Windows
```bash
# Run the setup script
setup.bat

# Or use npm script
npm run setup:win
```

#### macOS/Linux
```bash
# Make scripts executable
chmod +x setup.sh start.sh

# Run the setup script
./setup.sh

# Or use npm script
npm run setup
```

### Manual Setup

#### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp env.example .env
# Edit .env and add your OPENROUTER_API_KEY
```

#### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp env.example .env
```

#### 3. Environment Configuration

**Backend (.env)**
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000/api
```

## 🏃‍♂️ Running the Application

### Option 1: Automated Start (Recommended)

#### Windows
```bash
start.bat
```

#### macOS/Linux
```bash
./start.sh
```

### Option 2: Manual Start

#### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate.bat on Windows
python main.py
```

#### Terminal 2 - Frontend
```bash
npm run dev
```

### Option 3: NPM Scripts
```bash
# Start both services
npm run start        # macOS/Linux
npm run start:win    # Windows

# Start backend only
npm run backend      # macOS/Linux
npm run backend:win  # Windows
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Health Check**: http://localhost:8000/health

## 🔧 API Endpoints

### Course Generation
- `POST /api/course/process-complete` - Generate complete course
- `GET /api/course/status/{task_id}` - Check processing status
- `POST /api/course/chunks` - Generate content chunks
- `POST /api/course/quiz` - Generate quiz questions

### Health Check
- `GET /health` - API health status
- `GET /` - API root endpoint

## 🎯 How to Use

1. **Create a Course**:
   - Navigate to "Course Maker"
   - Paste a YouTube URL
   - Select difficulty level (easy/medium/hard)
   - Click "Generate Course"

2. **View Courses**:
   - Go to "Quiz & Quests"
   - Browse available courses
   - Click on a course to start learning

3. **Track Progress**:
   - Check "Dashboard" for statistics
   - View "Completed Courses" for history
   - Monitor "Quiz Analytics" for performance

## 🛠️ Development

### Project Structure
```
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── routers/        # API endpoints
│   │   ├── services/       # Business logic
│   │   └── models/         # Data models
│   ├── main.py            # Application entry point
│   └── requirements.txt   # Python dependencies
├── src/                    # React frontend
│   ├── components/        # React components
│   ├── services/          # API services
│   ├── store/             # State management
│   └── mockData/          # Sample data
├── package.json           # Node.js dependencies
└── vite.config.js         # Vite configuration
```

### Environment Variables

#### Backend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | API key for AI services | Required |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:3000` |

#### Frontend (.env)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth ID | Optional |

## 🔍 Troubleshooting

### Common Issues

1. **Backend won't start**:
   - Check if Python virtual environment is activated
   - Verify OPENROUTER_API_KEY is set in .env
   - Ensure port 8000 is not in use

2. **Frontend can't connect to backend**:
   - Verify backend is running on http://localhost:8000
   - Check CORS configuration in backend
   - Ensure VITE_API_URL is correct in frontend .env

3. **AI features not working**:
   - Verify OPENROUTER_API_KEY is valid
   - Check API quota and limits
   - Review backend logs for errors

4. **YouTube videos not processing**:
   - Ensure video has available transcripts
   - Check video is not age-restricted
   - Verify YouTube URL format

### Debug Mode

#### Backend
```bash
cd backend
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
npm run dev -- --debug
```

## 📦 Deployment

### Production Build
```bash
# Build frontend
npm run build

# Start backend with production settings
cd backend
python main.py
```

### Docker (Future)
```bash
# Build and run with Docker
docker-compose up --build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Open an issue on GitHub

---

**Made with ❤️ for better learning experiences**