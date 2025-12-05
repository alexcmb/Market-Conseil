import React from 'react';

const TodayAdvice = ({ advice, onGenerate, loading, selectedCategory, categories }) => {
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

  const getCategoryInfo = (categoryId) => {
    if (!categories) return null;
    return categories.find(c => c.id === categoryId);
  };

  const selectedCategoryInfo = selectedCategory ? getCategoryInfo(selectedCategory) : null;
  const adviceCategoryInfo = advice?.category ? getCategoryInfo(advice.category) : null;

  return (
    <div className="card advice-card">
      <div className="card-header">
        <h2 className="card-title">
          📊 Today's AI Recommendation
          {selectedCategoryInfo && (
            <span className="category-badge" style={{ backgroundColor: selectedCategoryInfo.color + '20', color: selectedCategoryInfo.color, marginLeft: '1rem' }}>
              {selectedCategoryInfo.icon} {selectedCategoryInfo.name}
            </span>
          )}
        </h2>
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
                <div className="symbol-info">
                  <div className="symbol-badge">{advice.symbol}</div>
                  {advice.assetInfo && (
                    <span className="asset-name">{advice.assetInfo.name}</span>
                  )}
                  {adviceCategoryInfo && (
                    <span 
                      className="category-tag" 
                      style={{ 
                        backgroundColor: adviceCategoryInfo.color + '20', 
                        color: adviceCategoryInfo.color,
                        borderColor: adviceCategoryInfo.color 
                      }}
                    >
                      {adviceCategoryInfo.icon} {adviceCategoryInfo.name}
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
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
            <p>No advice generated yet{selectedCategoryInfo ? ` for ${selectedCategoryInfo.name}` : ''}.</p>
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
