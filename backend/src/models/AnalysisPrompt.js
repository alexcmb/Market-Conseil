const mongoose = require('mongoose');

const analysisPromptSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  promptTemplate: {
    type: String,
    required: true
  },
  systemPrompt: {
    type: String,
    default: 'You are an expert financial analyst. Analyze the provided market data and give clear, actionable recommendations.'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'fundamental', 'sentiment', 'custom'],
    default: 'general'
  },
  performance: {
    usageCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    averageConfidence: { type: Number, default: 0 },
    lastUsed: { type: Date, default: null }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

analysisPromptSchema.index({ isActive: 1, category: 1 });

module.exports = mongoose.model('AnalysisPrompt', analysisPromptSchema);
