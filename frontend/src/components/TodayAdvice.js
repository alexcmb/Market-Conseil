import React from 'react';

const TodayAdvice = ({ advice, onGenerate, loading }) => {
  if (loading) {
    return (
      <div className="card advice-card">
        <div className="card-header">
          <h2 className="card-title">📊 Today's AI Recommendation</h2>
        </div>
        <div className="card-body">
          <div className="loading">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

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
    <div className="card advice-card">
      <div className="card-header">
        <h2 className="card-title">📊 Today's AI Recommendation</h2>
        <button className="btn btn-primary" onClick={onGenerate}>
          Generate New
        </button>
      </div>
      <div className="card-body">
        {advice ? (
          <>
            <div className="advice-main">
              <div className={`advice-action ${getActionClass(advice.action)}`}>
                {advice.action}
              </div>
              <div className="advice-details">
                <div className="symbol-badge">{advice.symbol}</div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Price: ${advice.priceAtAdvice?.toFixed(2)} → Target: ${advice.targetPrice?.toFixed(2)}
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Confidence</span>
                    <span style={{ color: getConfidenceColor(advice.confidence) }}>
                      {advice.confidence}%
                    </span>
                  </div>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill" 
                      style={{ 
                        width: `${advice.confidence}%`,
                        background: `linear-gradient(90deg, ${getConfidenceColor(advice.confidence)}, transparent)`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="advice-reasoning">
              <strong>AI Analysis: </strong>
              {advice.reasoning}
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <p>No advice generated yet today.</p>
            <button className="btn btn-primary" onClick={onGenerate} style={{ marginTop: '1rem' }}>
              Generate First Advice
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayAdvice;
