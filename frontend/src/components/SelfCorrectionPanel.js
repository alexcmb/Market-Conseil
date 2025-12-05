import React, { useState, useEffect } from 'react';
import { analysisService } from '../services/api';

const SelfCorrectionPanel = ({ history, onCorrectionApplied }) => {
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [correcting, setCorrecting] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadCorrectionHistory();
  }, []);

  // Auto-dismiss messages after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadCorrectionHistory = async () => {
    try {
      const result = await analysisService.getCorrectionHistory(10);
      setCorrections(result.data || []);
    } catch (err) {
      console.error('Error loading corrections:', err);
    }
  };

  const handleSelfCorrect = async (adviceId) => {
    setCorrecting(adviceId);
    setLoading(true);
    setMessage(null);
    
    try {
      const result = await analysisService.selfCorrect(adviceId);
      
      if (result.data.shouldCorrect) {
        // Refresh correction history
        await loadCorrectionHistory();
        if (onCorrectionApplied) {
          onCorrectionApplied(result.data);
        }
        setMessage({
          type: 'success',
          text: `Correction applied: ${result.data.correction.correctionReason}`
        });
      } else {
        setMessage({
          type: 'info',
          text: `No correction needed: ${result.data.reason}`
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: `Error: ${err.response?.data?.error || 'Self-correction failed'}`
      });
    } finally {
      setLoading(false);
      setCorrecting(null);
    }
  };

  const pendingAdvice = history?.filter(a => a.outcome === 'PENDING') || [];

  return (
    <div className="card self-correction-panel">
      <div className="card-header">
        <h2 className="card-title">🔄 AI Self-Correction</h2>
      </div>
      <div className="card-body">
        {/* Feedback Message */}
        {message && (
          <div className={`feedback-message feedback-${message.type}`}>
            {message.type === 'success' && '✅ '}
            {message.type === 'info' && 'ℹ️ '}
            {message.type === 'error' && '❌ '}
            {message.text}
          </div>
        )}

        {/* Pending Advice for Correction */}
        <div className="section">
          <h3 className="section-title">Pending Advice (Can Auto-Correct)</h3>
          {pendingAdvice.length > 0 ? (
            <div className="pending-list">
              {pendingAdvice.slice(0, 5).map(advice => (
                <div key={advice._id} className="pending-item">
                  <div className="pending-info">
                    <span className="symbol-badge">{advice.symbol}</span>
                    <span className={`action-badge ${advice.action.toLowerCase()}`}>
                      {advice.action}
                    </span>
                    <span className="confidence">{advice.confidence}%</span>
                    <span className="date">
                      {new Date(advice.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={() => handleSelfCorrect(advice._id)}
                    disabled={loading && correcting === advice._id}
                  >
                    {loading && correcting === advice._id ? '⏳' : '🔄'} Correct
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No pending advice to correct</p>
          )}
        </div>

        {/* Correction History */}
        <div className="section">
          <h3 className="section-title">Recent Corrections</h3>
          {corrections.length > 0 ? (
            <div className="corrections-list">
              {corrections.map(correction => (
                <div key={correction._id} className="correction-item">
                  <div className="correction-header">
                    <span className="symbol-badge">
                      {correction.adviceId?.symbol || 'N/A'}
                    </span>
                    <span className="correction-arrow">
                      <span className={`action-badge ${correction.originalAction.toLowerCase()}`}>
                        {correction.originalAction}
                      </span>
                      →
                      <span className={`action-badge ${correction.correctedAction.toLowerCase()}`}>
                        {correction.correctedAction}
                      </span>
                    </span>
                  </div>
                  <div className="correction-confidence">
                    Confidence: {correction.originalConfidence}% → {correction.correctedConfidence}%
                  </div>
                  <div className="correction-reason">
                    {correction.correctionReason}
                  </div>
                  <div className="correction-date">
                    {new Date(correction.appliedAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No corrections applied yet</p>
          )}
        </div>

        {/* Auto-Correction Info */}
        <div className="info-box">
          <strong>🧠 How Self-Correction Works:</strong>
          <ul>
            <li>The AI monitors pending advice against current market conditions</li>
            <li>When market indicators change significantly, the AI re-evaluates</li>
            <li>If the original advice no longer aligns with market reality, a correction is suggested</li>
            <li>Corrections help the AI learn and improve future predictions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SelfCorrectionPanel;
