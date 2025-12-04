const mongoose = require('mongoose');

const strategySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'default'
  },
  weights: {
    rsiWeight: { type: Number, default: 0.2 },
    macdWeight: { type: Number, default: 0.25 },
    trendWeight: { type: Number, default: 0.25 },
    volumeWeight: { type: Number, default: 0.15 },
    momentumWeight: { type: Number, default: 0.15 }
  },
  thresholds: {
    rsiOverbought: { type: Number, default: 70 },
    rsiOversold: { type: Number, default: 30 },
    confidenceMin: { type: Number, default: 60 }
  },
  performance: {
    totalAdvices: { type: Number, default: 0 },
    successfulAdvices: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 }
  },
  learningHistory: [{
    date: Date,
    adjustments: Object,
    reason: String,
    previousSuccessRate: Number,
    newSuccessRate: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Strategy', strategySchema);
