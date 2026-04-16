export interface VideoChunk {
  title?: string;
  start_time: number;
  end_time: number;
  transcript: string;
  summary: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface ChunkRequest {
  youtube_url: string;
  level: 'easy' | 'medium' | 'hard';
}

export interface QuizRequest {
  chunk: VideoChunk;
  level: 'easy' | 'medium' | 'hard';
}

export interface ProcessingStatus {
  status: string;
  current_step: number;
  total_steps: number;
  message: string;
  task_id?: string;
  video_url?: string;
  video_id?: string;
  course_id?: number;
  result?: Array<{
    chunk: VideoChunk;
    questions: QuizQuestion[];
  }>;
}

export interface CourseData {
  chunk: VideoChunk;
  questions: QuizQuestion[];
}

// ── Auth ──────────────────────────────────────

export interface UserOut {
  id: number;
  email: string;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// ── Dashboard ────────────────────────────────

export interface SavedCourse {
  id: number;
  title: string | null;
  video_id: string;
  difficulty_level: string;
  status: string;
}

export interface UserCourse {
  id: number;
  course_id: number;
  saved_at: string;
  chunks_completed: number[];
  quizzes_completed: number[];
  total_chunks: number;
  course: SavedCourse;
}

export interface ProgressUpdate {
  chunks_completed?: number[];
  quizzes_completed?: number[];
}

