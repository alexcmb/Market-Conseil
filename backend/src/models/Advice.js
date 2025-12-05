const mongoose = require('mongoose');

const adviceSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  category: {
    type: String,
    enum: ['crypto', 'stocks', 'etf', 'indices'],
    default: 'stocks'
  },
  action: {
    type: String,
    enum: ['BUY', 'SELL', 'HOLD'],
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  priceAtAdvice: {
    type: Number,
    required: true
  },
  currentPrice: {
    type: Number,
    default: null
  },
  targetPrice: {
    type: Number,
    default: null
  },
  reasoning: {
    type: String,
    required: true
  },
  indicators: {
    rsi: Number,
    macd: Number,
    sma20: Number,
    sma50: Number,
    volume: Number,
    priceChange: Number
  },
  outcome: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILURE', 'PARTIAL'],
    default: 'PENDING'
  },
  performanceScore: {
    type: Number,
    default: null
  },
  evaluatedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

adviceSchema.index({ symbol: 1, createdAt: -1 });
adviceSchema.index({ outcome: 1 });
adviceSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Advice', adviceSchema);
