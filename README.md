# SkillVId - AI-Powered Course Generator

Transform YouTube videos into interactive courses using AI-powered content chunking and quiz generation.

## 🚀 Features

- **Smart Content Chunking**: AI-powered video segmentation for optimal learning
- **Adaptive Quizzes**: Difficulty-based question generation (Easy/Medium/Hard)
- **Real-time Processing**: Background task processing with progress tracking
- **Modern UI**: Beautiful React frontend with responsive design
- **FastAPI Backend**: High-performance Python backend with async support

## 🏗️ Architecture

- **Frontend**: React 18 with modern hooks and functional components
- **Backend**: FastAPI with async/await support
- **AI Integration**: OpenRouter API (Gemini 2.0 Pro) for content analysis
- **Database**: File-based caching with SQLAlchemy ready for production

## 📋 Prerequisites

- **Python 3.8+**
- **Node.js 16+**
- **npm 8+**
- **OpenRouter API Key** (for AI features)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd skillvid-frontend
```

### 2. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 3. Set Up Environment Variables
Create a `.env` file in the root directory:
```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
DATABASE_URL=postgresql://user:password@localhost/skillvid_db
HOST=0.0.0.0
PORT=8000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
LOG_LEVEL=INFO
```

## 🚀 Quick Start

### Option 1: Automatic Startup (Recommended)
Run the startup script that handles both frontend and backend:
```bash
python start_app.py
```

This script will:
- Check dependencies
- Install React packages
- Start React frontend (port 3000)
- Start Python backend (port 8000)
- Open your browser automatically

### Option 2: Manual Startup

#### Start React Frontend
```bash
npm install
npm start
```
Frontend will be available at: http://localhost:3000

#### Start Python Backend (in another terminal)
```bash
python main.py
```
Backend will be available at: http://localhost:8000

## 🌐 Access Points

- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 📱 Usage

### 1. Generate Content Chunks
1. Navigate to "Generate Chunks" tab
2. Enter a YouTube URL
3. Select difficulty level (Easy/Medium/Hard)
4. Click "Generate Chunks"
5. View generated content segments with timestamps and summaries

### 2. Create Quiz Questions
1. Generate chunks first
2. Navigate to "Create Quiz" tab
3. Select quiz difficulty level
4. Click "Generate Quiz"
5. Interact with questions and check answers

### 3. Complete Course Generation
1. Navigate to "Complete Course" tab
2. Enter YouTube URL and difficulty level
3. Click "Process Complete Course"
4. Monitor real-time progress
5. View complete course with chunks and quizzes

## 🔧 API Endpoints

### Content Generation
- `POST /api/course/chunks` - Generate video chunks
- `POST /api/course/quiz` - Create quiz questions
- `POST /api/course/process-complete` - Process complete course

### Progress Tracking
- `GET /api/course/status/{task_id}` - Monitor task progress

### Health & Status
- `GET /health` - Backend health check
- `GET /docs` - Interactive API documentation

## 🎨 UI Components

- **Header**: Navigation with active state management
- **Home**: Hero section with feature cards
- **GenerateChunks**: Form-based chunk generation
- **CreateQuiz**: Interactive quiz interface
- **CompleteCourse**: Background processing with progress tracking

## 🔒 Security Features

- CORS configuration for development
- Input validation with Pydantic models
- YouTube URL validation
- Error handling with user-friendly messages

## 📁 Project Structure

```
skillvid-frontend/
├── src/
│   ├── components/          # React components
│   │   ├── Header.js       # Navigation header
│   │   ├── Home.js         # Home page
│   │   ├── GenerateChunks.js # Chunk generation
│   │   ├── CreateQuiz.js   # Quiz creation
│   │   └── CompleteCourse.js # Complete processing
│   ├── App.js              # Main app component
│   ├── index.js            # App entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── app/                    # Python backend modules
│   ├── routers/            # API routes
│   ├── services/           # Business logic
│   └── models/             # Data models
├── main.py                 # FastAPI application
├── start_app.py            # Startup script
├── package.json            # Node.js dependencies
├── requirements.txt        # Python dependencies
└── README.md               # This file
```

## 🧪 Testing

### Frontend Testing
```bash
npm test
```

### Backend Testing
```bash
pytest
```

## 🚀 Production Deployment

### Build React App
```bash
npm run build
```

### Deploy Backend
```bash
# Use production ASGI server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

## 🔧 Configuration

### Environment Variables
- `OPENROUTER_API_KEY`: Required for AI features
- `DATABASE_URL`: Database connection string
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `ALLOWED_ORIGINS`: CORS allowed origins
- `LOG_LEVEL`: Logging level (default: INFO)

### Customization
- Modify CSS variables in `src/index.css` for theming
- Update API endpoints in component files
- Customize AI prompts in backend services

## 🐛 Troubleshooting

### Common Issues

1. **Port Already in Use**
   - Kill processes using ports 3000 or 8000
   - Use different ports in configuration

2. **Node Modules Issues**
   - Delete `node_modules` folder
   - Run `npm install` again

3. **Python Dependencies**
   - Activate virtual environment
   - Run `pip install -r requirements.txt`

4. **API Connection Errors**
   - Check if backend is running
   - Verify CORS configuration
   - Check network connectivity

### Debug Mode
Enable debug logging by setting `LOG_LEVEL=DEBUG` in `.env`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/docs`
- Review the troubleshooting section

## 🎯 Roadmap

- [ ] User authentication and authorization
- [ ] Database integration for persistent storage
- [ ] Advanced analytics and reporting
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced AI models integration

---

**Made with ❤️ using React + FastAPI**
