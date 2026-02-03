import axios from 'axios';
import { ChunkRequest, QuizRequest, VideoChunk, QuizQuestion, ProcessingStatus } from '../types/api';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export const courseAPI = {
  // Generate chunks for a video
  generateChunks: async (request: ChunkRequest): Promise<VideoChunk[]> => {
    const response = await api.post('/course/chunks', request);
    return response.data;
  },

  // Generate quiz for a chunk
  generateQuiz: async (request: QuizRequest): Promise<QuizQuestion[]> => {
    const response = await api.post('/course/quiz', request);
    return response.data;
  },

  // Process complete course (background task)
  processCompleteCourse: async (request: ChunkRequest): Promise<ProcessingStatus> => {
    const response = await api.post('/course/process-complete', request);
    return response.data;
  },

  // Get processing status
  getProcessingStatus: async (taskId: string): Promise<ProcessingStatus> => {
    const response = await api.get(`/course/status/${taskId}`);
    return response.data;
  },

  // Get course history
  getCourseHistory: async (): Promise<any[]> => {
    const response = await api.get('/course/history');
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ status: string }> => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;