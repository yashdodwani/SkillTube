const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Use relative URLs in production
  : 'http://localhost:8000'; // Use full URL in development

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Course-related API calls
  async generateChunks(youtubeUrl, level) {
    return this.request('/api/course/chunks', {
      method: 'POST',
      body: JSON.stringify({
        youtube_url: youtubeUrl,
        level: level
      }),
    });
  }

  async generateQuiz(chunk, level) {
    return this.request('/api/course/quiz', {
      method: 'POST',
      body: JSON.stringify({
        chunk: chunk,
        level: level
      }),
    });
  }

  async processCompleteCourse(youtubeUrl, level) {
    return this.request('/api/course/process-complete', {
      method: 'POST',
      body: JSON.stringify({
        youtube_url: youtubeUrl,
        level: level
      }),
    });
  }

  async getCourseStatus(taskId) {
    return this.request(`/api/course/status/${taskId}`);
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export default apiService;