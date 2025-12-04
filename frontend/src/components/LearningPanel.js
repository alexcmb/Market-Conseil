import React from 'react';

const LearningPanel = ({ strategy }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">🧠 AI Learning & Strategy</h2>
      </div>
      <div className="card-body">
        {/* Current Weights */}
        <h3 style={{ color: 'var(--neon-magenta)', marginBottom: '1rem', fontSize: '1rem' }}>
          Current Strategy Weights
        </h3>
        <div className="weights-display">
          <div className="weight-item">
            <div className="weight-value">
              {((strategy?.weights?.rsiWeight || 0.2) * 100).toFixed(0)}%
            </div>
            <div className="weight-label">RSI</div>
          </div>
          <div className="weight-item">
            <div className="weight-value">
              {((strategy?.weights?.macdWeight || 0.25) * 100).toFixed(0)}%
            </div>
            <div className="weight-label">MACD</div>
          </div>
          <div className="weight-item">
            <div className="weight-value">
              {((strategy?.weights?.trendWeight || 0.25) * 100).toFixed(0)}%
            </div>
            <div className="weight-label">Trend</div>
          </div>
          <div className="weight-item">
            <div className="weight-value">
              {((strategy?.weights?.volumeWeight || 0.15) * 100).toFixed(0)}%
            </div>
            <div className="weight-label">Volume</div>
          </div>
          <div className="weight-item">
            <div className="weight-value">
              {((strategy?.weights?.momentumWeight || 0.15) * 100).toFixed(0)}%
            </div>
            <div className="weight-label">Momentum</div>
          </div>
        </div>

        {/* Learning History */}
        <h3 style={{ color: 'var(--neon-purple)', marginTop: '2rem', marginBottom: '1rem', fontSize: '1rem' }}>
          Recent Adjustments
        </h3>
        {strategy?.learningHistory && strategy.learningHistory.length > 0 ? (
          strategy.learningHistory.slice().reverse().map((item, index) => (
            <div key={index} className="learning-item">
              <div className="learning-date">{formatDate(item.date)}</div>
              <div className="learning-reason">{item.reason}</div>
              {item.previousSuccessRate && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--neon-red)' }}>
                    {item.previousSuccessRate?.toFixed(1)}%
                  </span>
                  {' → '}
                  <span style={{ color: 'var(--neon-green)' }}>
                    {item.newSuccessRate?.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem' }}>
            No adjustments yet. The AI will learn from performance data over time.
          </div>
        )}

        {/* Thresholds */}
        <h3 style={{ color: 'var(--neon-cyan)', marginTop: '2rem', marginBottom: '1rem', fontSize: '1rem' }}>
          Decision Thresholds
        </h3>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>RSI Overbought</span>
            <span style={{ color: 'var(--neon-cyan)' }}>{strategy?.thresholds?.rsiOverbought || 70}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>RSI Oversold</span>
            <span style={{ color: 'var(--neon-cyan)' }}>{strategy?.thresholds?.rsiOversold || 30}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Min Confidence</span>
            <span style={{ color: 'var(--neon-cyan)' }}>{strategy?.thresholds?.confidenceMin || 60}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPanel;
