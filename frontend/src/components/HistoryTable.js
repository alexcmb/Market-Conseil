import React from 'react';

const HistoryTable = ({ history }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📜 Advice History</h2>
      </div>
      <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Symbol</th>
              <th>Action</th>
              <th>Price</th>
              <th>Confidence</th>
              <th>Outcome</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {history && history.length > 0 ? (
              history.map((item) => (
                <tr key={item._id}>
                  <td>{formatDate(item.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{item.symbol}</td>
                  <td>
                    <span className={`action-badge ${item.action?.toLowerCase()}`}>
                      {item.action}
                    </span>
                  </td>
                  <td>${item.priceAtAdvice?.toFixed(2)}</td>
                  <td>{item.confidence}%</td>
                  <td>
                    <span className={`outcome-badge ${item.outcome?.toLowerCase()}`}>
                      {item.outcome}
                    </span>
                  </td>
                  <td>{item.performanceScore?.toFixed(0) || '-'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No history yet. Generate some advice to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryTable;
