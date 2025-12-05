import React, { useState } from 'react';
import { analysisService } from '../services/api';

const RealTimeAnalysis = ({ categories }) => {
  const [symbol, setSymbol] = useState('');
  const [query, setQuery] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState('technical_analysis');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [showPrompts, setShowPrompts] = useState(false);

  // Get all symbols from categories for quick selection
  const allSymbols = categories?.flatMap(cat => 
    cat.symbols?.map(s => ({ ...s, category: cat.name, icon: cat.icon })) || []
  ) || [];

  const loadPrompts = async () => {
    try {
      const result = await analysisService.getPrompts();
      setPrompts(result.data || []);
      setShowPrompts(true);
    } catch (err) {
      console.error('Error loading prompts:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!symbol) {
      setError('Please enter a symbol');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await analysisService.analyzeRealTime(symbol.toUpperCase(), query || null);
      setAnalysis(result.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePromptAnalysis = async () => {
    if (!symbol) {
      setError('Please enter a symbol');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await analysisService.analyzeWithPrompt(symbol.toUpperCase(), selectedPrompt);
      setAnalysis({
        ...result.data.advice,
        analysis: result.data.rawAnalysis,
        promptUsed: result.data.promptUsed
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed');
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const getActionClass = (action) => {
    return action?.toLowerCase() || 'hold';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'var(--neon-green)';
    if (confidence >= 60) return 'var(--neon-cyan)';
    if (confidence >= 40) return 'var(--neon-yellow)';
    return 'var(--neon-red)';
  };

  return (
    <div className="card realtime-analysis">
      <div className="card-header">
        <h2 className="card-title">⚡ Real-Time AI Analysis</h2>
        <button 
          className="btn btn-secondary" 
          onClick={loadPrompts}
          style={{ marginLeft: 'auto' }}
        >
          📝 Prompts
        </button>
      </div>
      <div className="card-body">
        {/* Input Section */}
        <div className="analysis-input-section">
          <div className="input-row">
            <div className="input-group">
              <label>Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g., AAPL, BTC"
                className="neon-input"
              />
            </div>
            <div className="input-group" style={{ flex: 2 }}>
              <label>Custom Query (optional)</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Should I buy now? What's the risk level?"
                className="neon-input"
              />
            </div>
          </div>
          
          {/* Quick Symbol Selection */}
          <div className="quick-symbols">
            {allSymbols.slice(0, 8).map(s => (
              <button
                key={s.symbol}
                className={`symbol-chip ${symbol === s.symbol ? 'active' : ''}`}
                onClick={() => setSymbol(s.symbol)}
              >
                {s.icon} {s.symbol}
              </button>
            ))}
          </div>

          {/* Prompt Selection */}
          {showPrompts && prompts.length > 0 && (
            <div className="prompt-selection">
              <label>Analysis Prompt</label>
              <select 
                value={selectedPrompt}
                onChange={(e) => setSelectedPrompt(e.target.value)}
                className="neon-select"
              >
                {prompts.map(p => (
                  <option key={p.name} value={p.name}>
                    {p.name.replace(/_/g, ' ')} ({p.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="button-row">
            <button 
              className="btn btn-primary" 
              onClick={handleAnalyze}
              disabled={loading || !symbol}
            >
              {loading ? '⏳ Analyzing...' : '🔍 Analyze Now'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handlePromptAnalysis}
              disabled={loading || !symbol}
            >
              📊 Use Prompt
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="analysis-results">
            <div className="result-header">
              <div className="symbol-info">
                <span className="symbol-badge">{analysis.symbol}</span>
                <span className="asset-name">{analysis.assetName || analysis.assetInfo?.name}</span>
                {analysis.promptUsed && (
                  <span className="prompt-badge">Prompt: {analysis.promptUsed}</span>
                )}
              </div>
              {analysis.isRealTime && (
                <span className="realtime-badge">⚡ Real-Time</span>
              )}
            </div>

            <div className="result-main">
              <div className={`advice-action ${getActionClass(analysis.analysis?.action || analysis.action)}`}>
                {analysis.analysis?.action || analysis.action}
              </div>
              <div className="result-details">
                <div className="price-info">
                  <span>Current: ${(analysis.currentPrice || analysis.priceAtAdvice)?.toFixed(2)}</span>
                  {(analysis.analysis?.targetPrice || analysis.targetPrice) && (
                    <span>Target: ${(analysis.analysis?.targetPrice || analysis.targetPrice)?.toFixed(2)}</span>
                  )}
                </div>
                <div className="confidence-section">
                  <div className="confidence-label">
                    <span>Confidence</span>
                    <span style={{ color: getConfidenceColor(analysis.analysis?.confidence || analysis.confidence) }}>
                      {analysis.analysis?.confidence || analysis.confidence}%
                    </span>
                  </div>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ 
                        width: `${analysis.analysis?.confidence || analysis.confidence}%`,
                        background: `linear-gradient(90deg, ${getConfidenceColor(analysis.analysis?.confidence || analysis.confidence)}, transparent)`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Indicators */}
            {analysis.indicators && (
              <div className="indicators-grid">
                <div className="indicator">
                  <span className="indicator-label">RSI</span>
                  <span className="indicator-value">{analysis.indicators.rsi?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="indicator">
                  <span className="indicator-label">MACD</span>
                  <span className="indicator-value">{analysis.indicators.macd?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="indicator">
                  <span className="indicator-label">SMA20</span>
                  <span className="indicator-value">${analysis.indicators.sma20?.toFixed(2) || 'N/A'}</span>
                </div>
                <div className="indicator">
                  <span className="indicator-label">SMA50</span>
                  <span className="indicator-value">${analysis.indicators.sma50?.toFixed(2) || 'N/A'}</span>
                </div>
              </div>
            )}

            {/* Reasoning */}
            <div className="reasoning-section">
              <strong>AI Analysis: </strong>
              {analysis.analysis?.reasoning || analysis.reasoning}
            </div>

            {/* User Query Response */}
            {analysis.userQuery && (
              <div className="user-query-section">
                <strong>Your Question: </strong>{analysis.userQuery}
              </div>
            )}

            <div className="timestamp">
              Analyzed at: {new Date(analysis.timestamp || Date.now()).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeAnalysis;
