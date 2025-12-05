const promptAnalysisService = require('../services/promptAnalysisService');
const { getAssetInfo } = require('../config/categories');

const promptController = {
  // Analyze with a specific prompt
  analyzeWithPrompt: async (req, res) => {
    try {
      const { symbol, promptName, customPrompt } = req.body;
      
      if (!symbol) {
        return res.status(400).json({
          success: false,
          error: 'Symbol is required'
        });
      }

      const validSymbol = symbol.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10);
      
      const result = await promptAnalysisService.analyzeWithPrompt(
        validSymbol,
        promptName || 'technical_analysis',
        customPrompt
      );

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in prompt analysis:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Real-time analysis with optional user query
  analyzeRealTime: async (req, res) => {
    try {
      const { symbol, query } = req.body;
      
      if (!symbol) {
        return res.status(400).json({
          success: false,
          error: 'Symbol is required'
        });
      }

      const validSymbol = symbol.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10);
      
      const result = await promptAnalysisService.analyzeRealTime(validSymbol, query);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in real-time analysis:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Self-correct a previous advice
  selfCorrect: async (req, res) => {
    try {
      const { adviceId } = req.params;
      
      if (!adviceId) {
        return res.status(400).json({
          success: false,
          error: 'Advice ID is required'
        });
      }

      const result = await promptAnalysisService.selfCorrect(adviceId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error in self-correction:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get available prompts
  getPrompts: async (req, res) => {
    try {
      const { category } = req.query;
      const prompts = await promptAnalysisService.getPrompts(category);

      res.json({
        success: true,
        data: prompts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Create a new prompt
  createPrompt: async (req, res) => {
    try {
      const { name, description, promptTemplate, systemPrompt, category } = req.body;
      
      if (!name || !promptTemplate) {
        return res.status(400).json({
          success: false,
          error: 'Name and promptTemplate are required'
        });
      }

      const prompt = await promptAnalysisService.createPrompt({
        name,
        description,
        promptTemplate,
        systemPrompt,
        category
      });

      res.status(201).json({
        success: true,
        data: prompt
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          error: 'A prompt with this name already exists'
        });
      }
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Update an existing prompt
  updatePrompt: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const prompt = await promptAnalysisService.updatePrompt(id, updates);
      
      if (!prompt) {
        return res.status(404).json({
          success: false,
          error: 'Prompt not found'
        });
      }

      res.json({
        success: true,
        data: prompt
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get correction history
  getCorrectionHistory: async (req, res) => {
    try {
      const { limit = 20 } = req.query;
      const history = await promptAnalysisService.getCorrectionHistory(parseInt(limit));

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = promptController;
