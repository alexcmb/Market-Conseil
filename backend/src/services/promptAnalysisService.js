const OpenAI = require('openai');
const AnalysisPrompt = require('../models/AnalysisPrompt');
const CorrectionLog = require('../models/CorrectionLog');
const Advice = require('../models/Advice');
const marketDataService = require('./marketDataService');
const { getCategoryBySymbol, getAssetInfo } = require('../config/categories');

class PromptAnalysisService {
  constructor() {
    this.openai = null;
    this.defaultPrompts = this.getDefaultPrompts();
  }

  async initialize() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
    
    // Initialize default prompts if none exist
    const existingPrompts = await AnalysisPrompt.countDocuments();
    if (existingPrompts === 0) {
      await this.seedDefaultPrompts();
    }
    
    return this;
  }

  getDefaultPrompts() {
    return [
      {
        name: 'technical_analysis',
        description: 'Comprehensive technical analysis based on indicators',
        category: 'technical',
        systemPrompt: 'You are an expert technical analyst specializing in stock market analysis. You provide clear, actionable recommendations based on technical indicators.',
        promptTemplate: `Analyze the following market data for {{symbol}} ({{assetName}}):

Current Price: ${{price}}
Price Change: {{changePercent}}%
Volume: {{volume}}

Technical Indicators:
- RSI (14-day): {{rsi}}
- MACD: {{macd}}
- SMA 20: ${{sma20}}
- SMA 50: ${{sma50}}

Based on this data, provide:
1. A clear recommendation: BUY, SELL, or HOLD
2. A confidence level (0-100%)
3. A target price
4. A detailed reasoning (2-3 sentences)

Format your response as JSON:
{
  "action": "BUY|SELL|HOLD",
  "confidence": 75,
  "targetPrice": 150.00,
  "reasoning": "Your analysis here"
}`
      },
      {
        name: 'momentum_analysis',
        description: 'Focus on momentum and trend analysis',
        category: 'technical',
        systemPrompt: 'You are a momentum trader focusing on price trends and market momentum.',
        promptTemplate: `Evaluate the momentum for {{symbol}}:

Price: ${{price}} ({{changePercent}}% today)
Volume: {{volume}}
RSI: {{rsi}}
MACD: {{macd}}
Trend: SMA20 (${{sma20}}) vs SMA50 (${{sma50}})

Determine if the momentum is bullish, bearish, or neutral.
Provide a trading recommendation with confidence.

JSON response:
{
  "action": "BUY|SELL|HOLD",
  "confidence": 75,
  "targetPrice": 150.00,
  "reasoning": "Your momentum analysis"
}`
      },
      {
        name: 'risk_assessment',
        description: 'Risk-focused analysis for conservative investors',
        category: 'fundamental',
        systemPrompt: 'You are a risk-averse financial advisor focusing on capital preservation.',
        promptTemplate: `Risk assessment for {{symbol}} ({{assetName}}):

Current Price: ${{price}}
Daily Change: {{changePercent}}%
RSI: {{rsi}} (oversold < 30, overbought > 70)
Trend: {{trend}}

Evaluate the risk/reward ratio and provide a conservative recommendation.
Consider volatility and potential downside.

JSON response:
{
  "action": "BUY|SELL|HOLD",
  "confidence": 75,
  "targetPrice": 150.00,
  "reasoning": "Your risk assessment"
}`
      },
      {
        name: 'self_correction',
        description: 'System prompt for self-correction analysis',
        category: 'general',
        systemPrompt: 'You are an AI analyst reviewing previous predictions to identify errors and improve future accuracy.',
        promptTemplate: `Review this previous advice and current market conditions:

ORIGINAL ADVICE ({{adviceDate}}):
- Symbol: {{symbol}}
- Recommendation: {{originalAction}}
- Confidence: {{originalConfidence}}%
- Price at advice: ${{priceAtAdvice}}
- Reasoning: {{originalReasoning}}

CURRENT MARKET CONDITIONS:
- Current Price: ${{currentPrice}}
- Price Change: {{priceChange}}%
- RSI: {{currentRsi}}
- MACD: {{currentMacd}}
- Volume trend: {{volumeTrend}}

PERFORMANCE:
- Expected outcome: {{expectedOutcome}}
- Actual outcome: {{actualOutcome}}

Analyze if the original advice was correct. If not, explain what went wrong and provide a corrected recommendation.

JSON response:
{
  "shouldCorrect": true|false,
  "correctedAction": "BUY|SELL|HOLD",
  "correctedConfidence": 75,
  "correctionReason": "Explanation of what went wrong and why",
  "learnings": "What the system should learn from this"
}`
      }
    ];
  }

  async seedDefaultPrompts() {
    for (const prompt of this.defaultPrompts) {
      await AnalysisPrompt.create(prompt);
    }
    console.log('Default analysis prompts seeded');
  }

  async analyzeWithPrompt(symbol, promptName = 'technical_analysis', customPrompt = null) {
    // Get market data
    const quote = await marketDataService.getStockQuote(symbol);
    const indicators = await marketDataService.getTechnicalIndicators(symbol);
    const assetInfo = getAssetInfo(symbol);
    const categoryInfo = getCategoryBySymbol(symbol);

    // Get the prompt template
    let prompt;
    if (customPrompt) {
      prompt = {
        systemPrompt: customPrompt.systemPrompt || 'You are an expert financial analyst.',
        promptTemplate: customPrompt.promptTemplate
      };
    } else {
      prompt = await AnalysisPrompt.findOne({ name: promptName, isActive: true });
      if (!prompt) {
        prompt = await AnalysisPrompt.findOne({ name: 'technical_analysis', isActive: true });
      }
    }

    if (!prompt) {
      throw new Error('No analysis prompt found');
    }

    // Prepare data for template
    const templateData = {
      symbol,
      assetName: assetInfo?.name || symbol,
      price: quote.price.toFixed(2),
      changePercent: quote.changePercent?.toFixed(2) || '0.00',
      volume: quote.volume?.toLocaleString() || '0',
      rsi: indicators.rsi?.toFixed(1) || 'N/A',
      macd: indicators.macd?.toFixed(2) || 'N/A',
      sma20: indicators.sma20?.toFixed(2) || 'N/A',
      sma50: indicators.sma50?.toFixed(2) || 'N/A',
      trend: indicators.sma20 > indicators.sma50 ? 'Bullish (SMA20 > SMA50)' : 'Bearish (SMA20 < SMA50)'
    };

    // Fill template
    let filledPrompt = prompt.promptTemplate;
    for (const [key, value] of Object.entries(templateData)) {
      filledPrompt = filledPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    // Call AI or use fallback
    let analysis;
    if (this.openai) {
      analysis = await this.callOpenAI(prompt.systemPrompt, filledPrompt);
    } else {
      analysis = this.generateFallbackAnalysis(quote, indicators);
    }

    // Update prompt usage stats
    if (!customPrompt && prompt._id) {
      await AnalysisPrompt.findByIdAndUpdate(prompt._id, {
        $inc: { 'performance.usageCount': 1 },
        'performance.lastUsed': new Date()
      });
    }

    // Create advice record
    const advice = await Advice.create({
      symbol,
      category: categoryInfo.id,
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

    return {
      advice,
      promptUsed: promptName,
      assetInfo,
      rawAnalysis: analysis
    };
  }

  async callOpenAI(systemPrompt, userPrompt) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const responseText = completion.choices[0].message.content;
      
      // Parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          action: ['BUY', 'SELL', 'HOLD'].includes(parsed.action?.toUpperCase()) 
            ? parsed.action.toUpperCase() 
            : 'HOLD',
          confidence: Math.min(95, Math.max(0, parseInt(parsed.confidence) || 50)),
          targetPrice: parseFloat(parsed.targetPrice) || 0,
          reasoning: parsed.reasoning || 'AI analysis completed'
        };
      }
      
      throw new Error('Invalid AI response format');
    } catch (error) {
      console.error('OpenAI API error:', error.message);
      return null;
    }
  }

  generateFallbackAnalysis(quote, indicators) {
    // Fallback to rule-based analysis when OpenAI is not available
    let buyScore = 0;
    let sellScore = 0;
    const reasons = [];

    if (indicators.rsi !== null) {
      if (indicators.rsi < 30) {
        buyScore += 30;
        reasons.push(`RSI (${indicators.rsi.toFixed(1)}) indicates oversold conditions`);
      } else if (indicators.rsi > 70) {
        sellScore += 30;
        reasons.push(`RSI (${indicators.rsi.toFixed(1)}) indicates overbought conditions`);
      }
    }

    if (indicators.macd !== null) {
      if (indicators.macd > 0) {
        buyScore += 25;
        reasons.push(`MACD (${indicators.macd.toFixed(2)}) shows bullish momentum`);
      } else {
        sellScore += 25;
        reasons.push(`MACD (${indicators.macd.toFixed(2)}) shows bearish momentum`);
      }
    }

    if (indicators.sma20 !== null && indicators.sma50 !== null) {
      if (indicators.sma20 > indicators.sma50) {
        buyScore += 25;
        reasons.push('Price trend is bullish (SMA20 > SMA50)');
      } else {
        sellScore += 25;
        reasons.push('Price trend is bearish (SMA20 < SMA50)');
      }
    }

    if (quote.changePercent > 0) {
      buyScore += 10;
      reasons.push(`Positive daily momentum (+${quote.changePercent.toFixed(2)}%)`);
    } else {
      sellScore += 10;
      reasons.push(`Negative daily momentum (${quote.changePercent.toFixed(2)}%)`);
    }

    let action, confidence;
    if (buyScore > sellScore && buyScore > 40) {
      action = 'BUY';
      confidence = Math.min(90, 50 + buyScore - sellScore);
    } else if (sellScore > buyScore && sellScore > 40) {
      action = 'SELL';
      confidence = Math.min(90, 50 + sellScore - buyScore);
    } else {
      action = 'HOLD';
      confidence = 60;
    }

    const multiplier = action === 'BUY' ? 1.05 : action === 'SELL' ? 0.95 : 1;

    return {
      action,
      confidence,
      targetPrice: quote.price * multiplier,
      reasoning: reasons.join('. ') + '.'
    };
  }

  async selfCorrect(adviceId) {
    const advice = await Advice.findById(adviceId);
    if (!advice) {
      throw new Error('Advice not found');
    }

    // Get current market data
    const quote = await marketDataService.getStockQuote(advice.symbol);
    const indicators = await marketDataService.getTechnicalIndicators(advice.symbol);
    
    const priceChange = ((quote.price - advice.priceAtAdvice) / advice.priceAtAdvice) * 100;
    
    // Determine actual outcome based on price movement
    let actualOutcome;
    if (advice.action === 'BUY') {
      actualOutcome = priceChange > 2 ? 'Price increased as expected' : 
                      priceChange < -2 ? 'Price decreased unexpectedly' : 'Price stable';
    } else if (advice.action === 'SELL') {
      actualOutcome = priceChange < -2 ? 'Price decreased as expected' :
                      priceChange > 2 ? 'Price increased unexpectedly' : 'Price stable';
    } else {
      actualOutcome = Math.abs(priceChange) < 2 ? 'Price stayed stable as expected' : 'Price moved unexpectedly';
    }

    const expectedOutcome = advice.action === 'BUY' ? 'Price increase' :
                           advice.action === 'SELL' ? 'Price decrease' : 'Price stability';

    // Get self-correction prompt
    const correctionPrompt = await AnalysisPrompt.findOne({ name: 'self_correction', isActive: true });
    
    if (!correctionPrompt) {
      return { shouldCorrect: false, reason: 'No correction prompt available' };
    }

    // Prepare template data
    const templateData = {
      adviceDate: advice.createdAt.toISOString().split('T')[0],
      symbol: advice.symbol,
      originalAction: advice.action,
      originalConfidence: advice.confidence,
      priceAtAdvice: advice.priceAtAdvice.toFixed(2),
      originalReasoning: advice.reasoning,
      currentPrice: quote.price.toFixed(2),
      priceChange: priceChange.toFixed(2),
      currentRsi: indicators.rsi?.toFixed(1) || 'N/A',
      currentMacd: indicators.macd?.toFixed(2) || 'N/A',
      volumeTrend: quote.volume > 5000000 ? 'High' : 'Normal',
      expectedOutcome,
      actualOutcome
    };

    // Fill template
    let filledPrompt = correctionPrompt.promptTemplate;
    for (const [key, value] of Object.entries(templateData)) {
      filledPrompt = filledPrompt.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }

    let correction;
    if (this.openai) {
      try {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: correctionPrompt.systemPrompt },
            { role: 'user', content: filledPrompt }
          ],
          temperature: 0.5,
          max_tokens: 500
        });

        const responseText = completion.choices[0].message.content;
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          correction = JSON.parse(jsonMatch[0]);
        }
      } catch (error) {
        console.error('Self-correction AI error:', error.message);
      }
    }

    // Fallback logic for self-correction
    if (!correction) {
      correction = this.generateFallbackCorrection(advice, priceChange, indicators);
    }

    // Record correction if needed
    if (correction.shouldCorrect) {
      const correctionLog = await CorrectionLog.create({
        adviceId: advice._id,
        originalAction: advice.action,
        correctedAction: correction.correctedAction,
        originalConfidence: advice.confidence,
        correctedConfidence: correction.correctedConfidence,
        correctionReason: correction.correctionReason,
        marketConditions: {
          priceChange,
          volumeChange: 0,
          newIndicators: indicators
        },
        aiAnalysis: correction.learnings || ''
      });

      return {
        shouldCorrect: true,
        correction: correctionLog,
        learnings: correction.learnings
      };
    }

    return {
      shouldCorrect: false,
      reason: 'Original advice appears to be on track'
    };
  }

  generateFallbackCorrection(advice, priceChange, indicators) {
    const wasCorrect = (advice.action === 'BUY' && priceChange > 0) ||
                       (advice.action === 'SELL' && priceChange < 0) ||
                       (advice.action === 'HOLD' && Math.abs(priceChange) < 2);

    if (wasCorrect) {
      return { shouldCorrect: false };
    }

    // Determine correction based on current indicators
    let correctedAction = 'HOLD';
    let correctedConfidence = 60;
    let reason = '';

    if (indicators.rsi < 30) {
      correctedAction = 'BUY';
      correctedConfidence = 70;
      reason = 'Current RSI indicates oversold conditions, suggesting a buying opportunity';
    } else if (indicators.rsi > 70) {
      correctedAction = 'SELL';
      correctedConfidence = 70;
      reason = 'Current RSI indicates overbought conditions, suggesting a selling opportunity';
    } else if (priceChange > 5) {
      correctedAction = 'SELL';
      correctedConfidence = 65;
      reason = 'Significant price increase suggests taking profits';
    } else if (priceChange < -5) {
      correctedAction = 'BUY';
      correctedConfidence = 65;
      reason = 'Significant price drop may present a buying opportunity';
    }

    return {
      shouldCorrect: correctedAction !== advice.action,
      correctedAction,
      correctedConfidence,
      correctionReason: reason || 'Market conditions have changed',
      learnings: `Original ${advice.action} recommendation at confidence ${advice.confidence}% resulted in ${priceChange.toFixed(2)}% price change`
    };
  }

  async analyzeRealTime(symbol, userQuery = null) {
    // Get fresh market data
    const quote = await marketDataService.getStockQuote(symbol);
    const indicators = await marketDataService.getTechnicalIndicators(symbol);
    const assetInfo = getAssetInfo(symbol);

    // Prepare analysis context
    const analysisContext = {
      symbol,
      assetName: assetInfo?.name || symbol,
      currentPrice: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      volume: quote.volume,
      indicators,
      timestamp: new Date().toISOString()
    };

    // If user provided a custom query, use it
    let analysis;
    if (userQuery && this.openai) {
      const systemPrompt = `You are an expert financial analyst providing real-time market analysis. 
      Analyze the provided market data and answer the user's question concisely.
      Always include a recommendation (BUY/SELL/HOLD) with confidence level.`;
      
      const userPrompt = `Market Data for ${symbol}:
      - Price: $${quote.price.toFixed(2)} (${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%)
      - Volume: ${quote.volume.toLocaleString()}
      - RSI: ${indicators.rsi?.toFixed(1) || 'N/A'}
      - MACD: ${indicators.macd?.toFixed(2) || 'N/A'}
      - SMA20: $${indicators.sma20?.toFixed(2) || 'N/A'}
      - SMA50: $${indicators.sma50?.toFixed(2) || 'N/A'}

      User Question: ${userQuery}

      Respond with your analysis and recommendation in JSON format:
      {
        "action": "BUY|SELL|HOLD",
        "confidence": 75,
        "targetPrice": 150.00,
        "reasoning": "Your analysis answering the user's question"
      }`;

      analysis = await this.callOpenAI(systemPrompt, userPrompt);
    }

    // Fallback to standard analysis
    if (!analysis) {
      analysis = this.generateFallbackAnalysis(quote, indicators);
    }

    return {
      ...analysisContext,
      analysis,
      isRealTime: true,
      userQuery: userQuery || null
    };
  }

  async getPrompts(category = null) {
    const query = { isActive: true };
    if (category) {
      query.category = category;
    }
    return await AnalysisPrompt.find(query).sort({ 'performance.usageCount': -1 });
  }

  async updatePrompt(promptId, updates) {
    return await AnalysisPrompt.findByIdAndUpdate(
      promptId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }

  async createPrompt(promptData) {
    return await AnalysisPrompt.create(promptData);
  }

  async getCorrectionHistory(limit = 20) {
    return await CorrectionLog.find()
      .sort({ appliedAt: -1 })
      .limit(limit)
      .populate('adviceId', 'symbol action confidence');
  }
}

module.exports = new PromptAnalysisService();
