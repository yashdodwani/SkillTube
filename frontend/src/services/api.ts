import axios from 'axios';
import { ChunkRequest, QuizRequest, VideoChunk, QuizQuestion, ProcessingStatus, Token, UserOut, UserCourse, ProgressUpdate } from '../types/api';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

// Inject JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
  generateChunks: async (request: ChunkRequest): Promise<VideoChunk[]> => {
    const response = await api.post('/course/chunks', request);
    return response.data;
  },
  generateQuiz: async (request: QuizRequest): Promise<QuizQuestion[]> => {
    const response = await api.post('/course/quiz', request);
    return response.data;
  },
  processCompleteCourse: async (request: ChunkRequest): Promise<ProcessingStatus> => {
    const response = await api.post('/course/process-complete', request);
    return response.data;
  },
  getProcessingStatus: async (taskId: string): Promise<ProcessingStatus> => {
    const response = await api.get(`/course/status/${taskId}`);
    return response.data;
  },
  getCourseHistory: async (): Promise<any[]> => {
    const response = await api.get('/course/history');
    return response.data;
  },
  healthCheck: async (): Promise<{ status: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export const authAPI = {
  register: async (email: string, password: string): Promise<UserOut> => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },
  login: async (email: string, password: string): Promise<Token> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getMe: async (): Promise<UserOut> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const userAPI = {
  getSavedCourses: async (): Promise<UserCourse[]> => {
    const response = await api.get('/users/courses');
    return response.data;
  },
  saveCourse: async (courseId: number): Promise<UserCourse> => {
    const response = await api.post('/users/courses', { course_id: courseId });
    return response.data;
  },
  updateProgress: async (courseId: number, update: ProgressUpdate): Promise<UserCourse> => {
    const response = await api.put(`/users/courses/${courseId}/progress`, update);
    return response.data;
  },
};

export default api;

