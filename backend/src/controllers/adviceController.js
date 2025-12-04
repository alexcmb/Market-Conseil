const aiAdvisorService = require('../services/aiAdvisorService');
const Advice = require('../models/Advice');
const { getAllCategories, getAssetInfo } = require('../config/categories');

const adviceController = {
  // Generate new advice
  generateAdvice: async (req, res) => {
    try {
      const { symbol, category } = req.body;
      // Validate symbol if provided
      const validSymbol = symbol && typeof symbol === 'string' 
        ? symbol.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10) 
        : null;
      // Validate category if provided
      const validCategory = category && ['crypto', 'stocks', 'etf', 'indices'].includes(category)
        ? category
        : null;
      const advice = await aiAdvisorService.generateDailyAdvice(validSymbol, validCategory);
      
      // Add asset info to response
      const assetInfo = getAssetInfo(advice.symbol);
      
      res.status(201).json({
        success: true,
        data: {
          ...advice.toObject(),
          assetInfo
        }
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
      const { page = 1, limit = 20, symbol, outcome, category } = req.query;
      const query = {};
      
      if (symbol) query.symbol = symbol.toUpperCase();
      if (outcome) query.outcome = outcome;
      if (category && ['crypto', 'stocks', 'etf', 'indices'].includes(category)) {
        query.category = category;
      }

      const advice = await Advice.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      // Add asset info to each advice
      const adviceWithInfo = advice.map(a => {
        const assetInfo = getAssetInfo(a.symbol);
        return {
          ...a.toObject(),
          assetInfo
        };
      });

      const total = await Advice.countDocuments(query);

      res.json({
        success: true,
        data: adviceWithInfo,
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
      const { category } = req.query;
      const query = {};
      if (category && ['crypto', 'stocks', 'etf', 'indices'].includes(category)) {
        query.category = category;
      }
      
      const advice = await Advice.findOne(query).sort({ createdAt: -1 });
      
      if (advice) {
        const assetInfo = getAssetInfo(advice.symbol);
        res.json({
          success: true,
          data: {
            ...advice.toObject(),
            assetInfo
          }
        });
      } else {
        res.json({
          success: true,
          data: null
        });
      }
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
      const assetInfo = getAssetInfo(advice.symbol);
      res.json({
        success: true,
        data: {
          ...advice.toObject(),
          assetInfo
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  },

  // Get all categories
  getCategories: async (req, res) => {
    try {
      const categories = getAllCategories();
      res.json({
        success: true,
        data: categories
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
