import axios from 'axios';

// Get API URL from environment or use relative path since frontend and backend are served from same domain
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const courseService = {
  generateCourse: async (youtubeUrl, level) => {
    const response = await api.post('/course/process-complete', {
      youtube_url: youtubeUrl,
      level: level
    });
    return response.data;
  },

  getCourseStatus: async (taskId) => {
    const response = await api.get(`/course/status/${taskId}`);
    return response.data;
  },

  generateChunks: async (youtubeUrl, level) => {
    const response = await api.post('/course/chunks', {
      youtube_url: youtubeUrl,
      level: level
    });
    return response.data;
  },

  generateQuiz: async (chunk, level) => {
    const response = await api.post('/course/quiz', {
      chunk,
      level
    });
    return response.data;
  },

  // Health check endpoint
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};