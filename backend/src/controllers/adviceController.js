const aiAdvisorService = require('../services/aiAdvisorService');
const Advice = require('../models/Advice');

const adviceController = {
  // Generate new advice
  generateAdvice: async (req, res) => {
    try {
      const { symbol } = req.body;
      const advice = await aiAdvisorService.generateDailyAdvice(symbol);
      res.status(201).json({
        success: true,
        data: advice
      });
    } catch (error) {
      console.error('Error generating advice:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get all advice history
  getHistory: async (req, res) => {
    try {
      const { page = 1, limit = 20, symbol, outcome } = req.query;
      const query = {};
      
      if (symbol) query.symbol = symbol.toUpperCase();
      if (outcome) query.outcome = outcome;

      const advice = await Advice.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Advice.countDocuments(query);

      res.json({
        success: true,
        data: advice,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get latest advice
  getLatest: async (req, res) => {
    try {
      const advice = await Advice.findOne().sort({ createdAt: -1 });
      res.json({
        success: true,
        data: advice
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Evaluate past advice
  evaluateAdvice: async (req, res) => {
    try {
      const results = await aiAdvisorService.evaluatePastAdvice();
      res.json({
        success: true,
        data: results,
        message: `Evaluated ${results.length} advice records`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get performance statistics
  getPerformance: async (req, res) => {
    try {
      const stats = await aiAdvisorService.getPerformanceStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get advice by ID
  getById: async (req, res) => {
    try {
      const advice = await Advice.findById(req.params.id);
      if (!advice) {
        return res.status(404).json({
          success: false,
          error: 'Advice not found'
        });
      }
      res.json({
        success: true,
        data: advice
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

module.exports = adviceController;
