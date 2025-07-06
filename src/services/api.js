import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  }
};