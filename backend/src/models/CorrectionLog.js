const mongoose = require('mongoose');

const correctionLogSchema = new mongoose.Schema({
  adviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Advice',
    required: true
  },
  originalAction: {
    type: String,
    enum: ['BUY', 'SELL', 'HOLD'],
    required: true
  },
  correctedAction: {
    type: String,
    enum: ['BUY', 'SELL', 'HOLD'],
    required: true
  },
  originalConfidence: {
    type: Number,
    required: true
  },
  correctedConfidence: {
    type: Number,
    required: true
  },
  correctionReason: {
    type: String,
    required: true
  },
  marketConditions: {
    priceChange: Number,
    volumeChange: Number,
    newIndicators: Object
  },
  aiAnalysis: {
    type: String,
    default: ''
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

correctionLogSchema.index({ adviceId: 1 });
correctionLogSchema.index({ appliedAt: -1 });

module.exports = mongoose.model('CorrectionLog', correctionLogSchema);
