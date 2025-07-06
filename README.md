# Course Generator

A platform that transforms YouTube videos into interactive learning experiences with AI-generated content chunks and quizzes.

## Architecture Overview

### Backend Endpoints

#### 1. `/api/course/chunks` (POST)
- **Function**: `generate_chunks`
- **Location**: `backend/app/routers/course.py`
- **Purpose**: Generates content chunks from a YouTube video
- **Frontend Connection**: 
  - Component: `VideoProcessor.jsx`
  - Function: `handleSubmit()`
  - Usage: Initial video processing step

**Request Format**:
```json
{
  "youtube_url": "string",
  "level": "easy" | "medium" | "hard"
}
```

**Response Format**:
```json
[
  {
    "title": "string",
    "start_time": float,
    "end_time": float,
    "transcript": "string",
    "summary": "string"
  }
]
```

#### 2. `/api/course/quiz` (POST)
- **Function**: `generate_quiz`
- **Location**: `backend/app/routers/course.py`
- **Purpose**: Generates quiz questions for a content chunk
- **Frontend Connection**: 
  - Component: `CourseView.jsx`
  - Usage: Displays quiz questions for each chunk

**Request Format**:
```json
{
  "chunk": {
    "title": "string",
    "start_time": float,
    "end_time": float,
    "transcript": "string",
    "summary": "string"
  },
  "level": "easy" | "medium" | "hard"
}
```

**Response Format**:
```json
[
  {
    "question": "string",
    "options": ["string"],
    "correct_answer": int,
    "explanation": "string"
  }
]
```

#### 3. `/api/course/process-complete` (POST)
- **Function**: `process_course`
- **Location**: `backend/app/routers/course.py`
- **Purpose**: Processes complete course generation in background
- **Frontend Connection**: 
  - Component: `VideoProcessor.jsx`
  - Function: `handleSubmit()`
  - Usage: Initiates full course processing

**Request Format**:
```json
{
  "youtube_url": "string",
  "level": "easy" | "medium" | "hard"
}
```

**Response Format**:
```json
{
  "status": "string",
  "current_step": int,
  "total_steps": int,
  "message": "string",
  "result": null | object
}
```

#### 4. `/api/course/status/{task_id}` (GET)
- **Function**: `get_course_status`
- **Location**: `backend/app/routers/course.py`
- **Purpose**: Checks status of course generation
- **Frontend Connection**: 
  - Component: `VideoProcessor.jsx`
  - Usage: Polls for processing status
  - Component: `CourseView.jsx`
  - Usage: Retrieves course data when viewing

**Response Format**:
```json
{
  "status": "string",
  "current_step": int,
  "total_steps": int,
  "message": "string",
  "result": null | object
}
```

### Backend Services

#### 1. Chunking Service (`backend/app/services/chunking.py`)
- **Main Function**: `generate_chunks_from_url`
- **Purpose**: Processes YouTube videos into learning chunks
- **Frontend Usage**: 
  - Provides content structure for `CourseView.jsx`
  - Generates timeline in `Timeline.jsx`

#### 2. Quiz Service (`backend/app/services/quiz.py`)
- **Main Function**: `generate_questions`
- **Purpose**: Creates quiz questions for content chunks
- **Frontend Usage**: 
  - Displays in `CourseView.jsx`
  - Interactive quiz component

### Frontend Components

#### 1. VideoProcessor.jsx
- Connects to: `/api/course/process-complete`, `/api/course/status/{task_id}`
- Purpose: Video URL input and processing initiation

#### 2. CourseView.jsx
- Connects to: `/api/course/status/{task_id}`
- Purpose: Displays course content and quizzes

#### 3. Timeline.jsx
- Uses: Data from chunking service
- Purpose: Visual representation of course segments

### Data Models

#### Backend Models (`backend/app/models/schemas.py`)
```python
ChunkRequest:
  - youtube_url: HttpUrl
  - level: Literal["easy", "medium", "hard"]

VideoChunk:
  - title: Optional[str]
  - start_time: float
  - end_time: float
  - transcript: str
  - summary: str

QuizQuestion:
  - question: str
  - options: List[str]
  - correct_answer: int
  - explanation: str

ProcessingStatus:
  - status: str
  - current_step: int
  - total_steps: int
  - message: str
  - result: Optional[List[Dict[str, Any]]]
```

### Mock Data Integration
- Location: `src/mockData/courses.js`
- Purpose: Provides sample courses for frontend development
- Usage: 
  - `CoursesPage.jsx`: Displays course catalog
  - `CourseView.jsx`: Shows course content when backend is not used

### Token System
- Location: `src/store/userStore.js`
- Purpose: Manages user progress and rewards
- Integration:
  - Course completion tracking
  - Reward token management
  - Persistent storage using Zustand

## Development Setup

1. Start Backend:
```bash
cd backend
python main.py
```

2. Start Frontend:
```bash
npm run dev
```

The application will be available at `http://localhost:3000` with the backend API at `http://localhost:8000`.