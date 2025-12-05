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

export const analysisService = {
  // Get available prompts
  getPrompts: async (category = null) => {
    const params = {};
    if (category) params.category = category;
    const response = await api.get('/analysis/prompts', { params });
    return response.data;
  },

  // Analyze with a specific prompt
  analyzeWithPrompt: async (symbol, promptName = 'technical_analysis', customPrompt = null) => {
    const response = await api.post('/analysis/analyze', { symbol, promptName, customPrompt });
    return response.data;
  },

  // Real-time analysis with optional query
  analyzeRealTime: async (symbol, query = null) => {
    const response = await api.post('/analysis/realtime', { symbol, query });
    return response.data;
  },

  // Self-correct a previous advice
  selfCorrect: async (adviceId) => {
    const response = await api.post(`/analysis/correct/${adviceId}`);
    return response.data;
  },

  // Get correction history
  getCorrectionHistory: async (limit = 20) => {
    const response = await api.get('/analysis/corrections', { params: { limit } });
    return response.data;
  },

  // Create a new prompt
  createPrompt: async (promptData) => {
    const response = await api.post('/analysis/prompts', promptData);
    return response.data;
  },

  // Update an existing prompt
  updatePrompt: async (promptId, updates) => {
    const response = await api.put(`/analysis/prompts/${promptId}`, updates);
    return response.data;
  }
};

export default api;
