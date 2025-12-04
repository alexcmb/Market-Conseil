const Advice = require('../models/Advice');
const Strategy = require('../models/Strategy');
const marketDataService = require('./marketDataService');

class AIAdvisorService {
  constructor() {
    this.strategy = null;
  }

  async initialize() {
    // Load or create default strategy
    this.strategy = await Strategy.findOne({ isActive: true });
    if (!this.strategy) {
      this.strategy = await Strategy.create({
        name: 'default',
        // Weights must sum to 1.0 for proper scoring
        weights: {
          rsiWeight: 0.2,
          macdWeight: 0.25,
          trendWeight: 0.25,
          volumeWeight: 0.15,
          momentumWeight: 0.15
        }
      });
    }
    return this.strategy;
  }

  async generateDailyAdvice(symbol = null) {
    if (!this.strategy) {
      await this.initialize();
    }

    const targetSymbol = symbol || this.selectSymbol();
    
    // Get market data
    const quote = await marketDataService.getStockQuote(targetSymbol);
    const indicators = await marketDataService.getTechnicalIndicators(targetSymbol);

    // Calculate AI recommendation
    const analysis = this.analyzeStock(quote, indicators);
    
    // Create advice record
    const advice = await Advice.create({
      symbol: targetSymbol,
      action: analysis.action,
      confidence: analysis.confidence,
      priceAtAdvice: quote.price,
      targetPrice: analysis.targetPrice,
      reasoning: analysis.reasoning,
      indicators: {
        rsi: indicators.rsi,
        macd: indicators.macd,
        sma20: indicators.sma20,
        sma50: indicators.sma50,
        volume: quote.volume,
        priceChange: quote.changePercent
      }
    });

    return advice;
  }

  analyzeStock(quote, indicators) {
    const { weights, thresholds } = this.strategy;
    let buyScore = 0;
    let sellScore = 0;
    const reasons = [];

    // RSI Analysis
    if (indicators.rsi !== null) {
      if (indicators.rsi < thresholds.rsiOversold) {
        buyScore += weights.rsiWeight * 100;
        reasons.push(`RSI (${indicators.rsi.toFixed(1)}) indicates oversold conditions`);
      } else if (indicators.rsi > thresholds.rsiOverbought) {
        sellScore += weights.rsiWeight * 100;
        reasons.push(`RSI (${indicators.rsi.toFixed(1)}) indicates overbought conditions`);
      }
    }

    // MACD Analysis
    if (indicators.macd !== null) {
      if (indicators.macd > 0) {
        buyScore += weights.macdWeight * (Math.min(indicators.macd, 5) / 5) * 100;
        reasons.push(`MACD (${indicators.macd.toFixed(2)}) shows bullish momentum`);
      } else {
        sellScore += weights.macdWeight * (Math.min(Math.abs(indicators.macd), 5) / 5) * 100;
        reasons.push(`MACD (${indicators.macd.toFixed(2)}) shows bearish momentum`);
      }
    }

    // Trend Analysis (SMA crossover)
    if (indicators.sma20 !== null && indicators.sma50 !== null) {
      const trendStrength = ((indicators.sma20 - indicators.sma50) / indicators.sma50) * 100;
      if (indicators.sma20 > indicators.sma50) {
        buyScore += weights.trendWeight * Math.min(Math.abs(trendStrength) * 10, 100);
        reasons.push(`Price above 50-day SMA, uptrend confirmed`);
      } else {
        sellScore += weights.trendWeight * Math.min(Math.abs(trendStrength) * 10, 100);
        reasons.push(`Price below 50-day SMA, downtrend indicated`);
      }
    }

    // Price momentum
    if (quote.changePercent !== null) {
      if (quote.changePercent > 0) {
        buyScore += weights.momentumWeight * Math.min(quote.changePercent * 10, 100);
        reasons.push(`Positive daily momentum (+${quote.changePercent.toFixed(2)}%)`);
      } else {
        sellScore += weights.momentumWeight * Math.min(Math.abs(quote.changePercent) * 10, 100);
        reasons.push(`Negative daily momentum (${quote.changePercent.toFixed(2)}%)`);
      }
    }

    // Volume Analysis
    const avgVolume = 5000000; // Simplified average
    if (quote.volume > avgVolume * 1.2) {
      const volumeMultiplier = Math.min(quote.volume / avgVolume, 2);
      if (buyScore > sellScore) {
        buyScore += weights.volumeWeight * volumeMultiplier * 50;
        reasons.push(`High volume confirms bullish sentiment`);
      } else {
        sellScore += weights.volumeWeight * volumeMultiplier * 50;
        reasons.push(`High volume confirms bearish sentiment`);
      }
    }

    // Determine action and confidence
    const totalScore = buyScore + sellScore;
    let action, confidence;

    if (buyScore > sellScore && buyScore > thresholds.confidenceMin) {
      action = 'BUY';
      confidence = Math.min(Math.round((buyScore / (totalScore || 1)) * 100), 95);
    } else if (sellScore > buyScore && sellScore > thresholds.confidenceMin) {
      action = 'SELL';
      confidence = Math.min(Math.round((sellScore / (totalScore || 1)) * 100), 95);
    } else {
      action = 'HOLD';
      confidence = Math.round(50 + Math.abs(buyScore - sellScore) / 2);
    }

    // Calculate target price
    const multiplier = action === 'BUY' ? 1.05 : action === 'SELL' ? 0.95 : 1;
    const targetPrice = quote.price * multiplier;

    return {
      action,
      confidence,
      targetPrice,
      reasoning: reasons.join('. ') + '.'
    };
  }

  selectSymbol() {
    const watchlist = marketDataService.getWatchlist();
    return watchlist[Math.floor(Math.random() * watchlist.length)];
  }

  async evaluatePastAdvice() {
    // Find pending advice older than 1 day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const pendingAdvice = await Advice.find({
      outcome: 'PENDING',
      createdAt: { $lt: oneDayAgo }
    });

    const results = [];

    for (const advice of pendingAdvice) {
      const currentQuote = await marketDataService.getStockQuote(advice.symbol);
      const priceChange = ((currentQuote.price - advice.priceAtAdvice) / advice.priceAtAdvice) * 100;

      let outcome, score;

      if (advice.action === 'BUY') {
        if (priceChange > 2) {
          outcome = 'SUCCESS';
          score = Math.min(100, 50 + priceChange * 10);
        } else if (priceChange > 0) {
          outcome = 'PARTIAL';
          score = 40 + priceChange * 10;
        } else {
          outcome = 'FAILURE';
          score = Math.max(0, 40 + priceChange * 5);
        }
      } else if (advice.action === 'SELL') {
        if (priceChange < -2) {
          outcome = 'SUCCESS';
          score = Math.min(100, 50 + Math.abs(priceChange) * 10);
        } else if (priceChange < 0) {
          outcome = 'PARTIAL';
          score = 40 + Math.abs(priceChange) * 10;
        } else {
          outcome = 'FAILURE';
          score = Math.max(0, 40 - priceChange * 5);
        }
      } else {
        // HOLD
        if (Math.abs(priceChange) < 2) {
          outcome = 'SUCCESS';
          score = 70;
        } else {
          outcome = 'PARTIAL';
          score = 50;
        }
      }

      advice.outcome = outcome;
      advice.performanceScore = score;
      advice.currentPrice = currentQuote.price;
      advice.evaluatedAt = new Date();
      await advice.save();

      results.push({
        id: advice._id,
        symbol: advice.symbol,
        action: advice.action,
        outcome,
        score,
        priceChange: priceChange.toFixed(2)
      });
    }

    // Update strategy performance
    await this.updateStrategyPerformance();

    return results;
  }

  async updateStrategyPerformance() {
    const allAdvice = await Advice.find({ outcome: { $ne: 'PENDING' } });
    const totalAdvices = allAdvice.length;
    const successfulAdvices = allAdvice.filter(a => a.outcome === 'SUCCESS').length;
    const partialAdvices = allAdvice.filter(a => a.outcome === 'PARTIAL').length;
    const averageScore = totalAdvices > 0 
      ? allAdvice.reduce((sum, a) => sum + (a.performanceScore || 0), 0) / totalAdvices 
      : 0;

    const successRate = totalAdvices > 0 
      ? ((successfulAdvices + partialAdvices * 0.5) / totalAdvices) * 100 
      : 0;

    this.strategy.performance = {
      totalAdvices,
      successfulAdvices,
      successRate,
      averageScore
    };

    // Adjust strategy if performance is poor
    if (totalAdvices >= 5 && successRate < 50) {
      await this.adjustStrategy(successRate);
    }

    this.strategy.updatedAt = new Date();
    await this.strategy.save();

    return this.strategy.performance;
  }

  async adjustStrategy(currentSuccessRate) {
    const previousSuccessRate = this.strategy.performance.successRate;
    
    // Analyze which factors were most reliable
    const recentAdvice = await Advice.find({ outcome: { $ne: 'PENDING' } })
      .sort({ createdAt: -1 })
      .limit(10);

    // Simple adjustment: increase weight of successful indicators
    const adjustments = {};
    
    if (currentSuccessRate < 40) {
      // Major adjustment needed - adjust weights while maintaining sum of 1.0
      const rsiDelta = this.strategy.weights.rsiWeight * 0.1;
      adjustments.rsiWeight = this.strategy.weights.rsiWeight - rsiDelta;
      adjustments.macdWeight = this.strategy.weights.macdWeight + rsiDelta;
      this.strategy.weights.rsiWeight = adjustments.rsiWeight;
      this.strategy.weights.macdWeight = adjustments.macdWeight;
      
      // Adjust thresholds
      this.strategy.thresholds.confidenceMin = Math.min(70, this.strategy.thresholds.confidenceMin + 5);
    }

    // Normalize weights to ensure they sum to 1.0
    const totalWeight = Object.values(this.strategy.weights).reduce((sum, w) => sum + w, 0);
    if (Math.abs(totalWeight - 1.0) > 0.001) {
      Object.keys(this.strategy.weights).forEach(key => {
        this.strategy.weights[key] = this.strategy.weights[key] / totalWeight;
      });
    }

    // Record learning history
    this.strategy.learningHistory.push({
      date: new Date(),
      adjustments,
      reason: `Success rate dropped to ${currentSuccessRate.toFixed(1)}%`,
      previousSuccessRate,
      newSuccessRate: currentSuccessRate
    });

    // Keep only last 20 adjustments
    if (this.strategy.learningHistory.length > 20) {
      this.strategy.learningHistory = this.strategy.learningHistory.slice(-20);
    }
  }

  async getPerformanceStats() {
    if (!this.strategy) {
      await this.initialize();
    }

    const totalAdvice = await Advice.countDocuments();
    const evaluatedAdvice = await Advice.countDocuments({ outcome: { $ne: 'PENDING' } });
    const successfulAdvice = await Advice.countDocuments({ outcome: 'SUCCESS' });
    const partialAdvice = await Advice.countDocuments({ outcome: 'PARTIAL' });

    const avgScoreResult = await Advice.aggregate([
      { $match: { performanceScore: { $ne: null } } },
      { $group: { _id: null, avgScore: { $avg: '$performanceScore' } } }
    ]);

    const recentAdvice = await Advice.find()
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      totalAdvice,
      evaluatedAdvice,
      successfulAdvice,
      partialAdvice,
      successRate: evaluatedAdvice > 0 
        ? ((successfulAdvice + partialAdvice * 0.5) / evaluatedAdvice * 100).toFixed(1) 
        : 0,
      averageScore: avgScoreResult[0]?.avgScore?.toFixed(1) || 0,
      strategy: {
        weights: this.strategy.weights,
        thresholds: this.strategy.thresholds,
        learningHistory: this.strategy.learningHistory.slice(-5)
      },
      recentAdvice
    };
  }
}

module.exports = new AIAdvisorService();
