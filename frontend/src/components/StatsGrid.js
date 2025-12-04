import React from 'react';

const StatsGrid = ({ stats }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value cyan">{stats.totalAdvice || 0}</div>
        <div className="stat-label">Total Advices</div>
      </div>
      <div className="stat-card">
        <div className="stat-value green">{stats.successRate || 0}%</div>
        <div className="stat-label">Success Rate</div>
      </div>
      <div className="stat-card">
        <div className="stat-value magenta">{stats.averageScore || 0}</div>
        <div className="stat-label">Avg Score</div>
      </div>
      <div className="stat-card">
        <div className="stat-value yellow">{stats.evaluatedAdvice || 0}</div>
        <div className="stat-label">Evaluated</div>
      </div>
    </div>
  );
};

export default StatsGrid;
