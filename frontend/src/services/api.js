import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const adviceService = {
  // Get all categories
  getCategories: async () => {
    const response = await api.get('/advice/categories');
    return response.data;
  },

  // Generate new advice (with optional category)
  generateAdvice: async (symbol = null, category = null) => {
    const response = await api.post('/advice/generate', { symbol, category });
    return response.data;
  },

  // Get advice history (with optional category filter)
  getHistory: async (page = 1, limit = 20, category = null) => {
    const params = { page, limit };
    if (category) params.category = category;
    const response = await api.get('/advice/history', { params });
    return response.data;
  },

  // Get latest advice (with optional category filter)
  getLatest: async (category = null) => {
    const params = {};
    if (category) params.category = category;
    const response = await api.get('/advice/latest', { params });
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
