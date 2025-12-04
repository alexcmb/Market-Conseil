import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const adviceService = {
  // Generate new advice
  generateAdvice: async (symbol = null) => {
    const response = await api.post('/advice/generate', { symbol });
    return response.data;
  },

  // Get advice history
  getHistory: async (page = 1, limit = 20) => {
    const response = await api.get('/advice/history', { params: { page, limit } });
    return response.data;
  },

  // Get latest advice
  getLatest: async () => {
    const response = await api.get('/advice/latest');
    return response.data;
  },

  // Evaluate past advice
  evaluateAdvice: async () => {
    const response = await api.post('/advice/evaluate');
    return response.data;
  },

  // Get performance statistics
  getPerformance: async () => {
    const response = await api.get('/advice/performance');
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;
