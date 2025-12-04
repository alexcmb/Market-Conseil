import React from 'react';

const Header = ({ isConnected }) => {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">Market Conseil</h1>
        <div className="status-indicator">
          <span className="status-dot" style={{ 
            background: isConnected ? 'var(--neon-green)' : 'var(--neon-red)'
          }}></span>
          <span>{isConnected ? 'AI Active' : 'Connecting...'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
