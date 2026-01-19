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
  result?: Array<{
    chunk: VideoChunk;
    questions: QuizQuestion[];
  }>;
}

export interface CourseData {
  chunk: VideoChunk;
  questions: QuizQuestion[];
}