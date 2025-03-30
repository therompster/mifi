import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import Settings from './components/Settings';

interface HeaderProps {
  children?: React.ReactNode;
  subtitle?: string;
}

const styles: {
  Header: React.CSSProperties;
  Title: React.CSSProperties;
  Subtitle: React.CSSProperties;
  SubtitleSmall: React.CSSProperties;
  HeaderContent: React.CSSProperties;
  SettingsButton: React.CSSProperties;
} = {
  Header: {
    top: '0px',
    left: '0px',
    width: '100%',
    backgroundColor: '#ffffff',
    boxShadow: '0px 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    position: 'fixed',
    zIndex: 1000,
    padding: '20px 0'
  },
  HeaderContent: {
    width: '100%',
    maxWidth: '480px',
    position: 'relative' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '0 16px',
    boxSizing: 'border-box'
  },
  Title: {
    fontSize: '36px',
    fontWeight: 800,
    margin: '0 0 8px 0'
  },
  Subtitle: {
    fontSize: '18px',
    color: '#555',
    margin: '0',
    fontWeight: 'bold'
  },
  SubtitleSmall: {
    fontSize: '14px',
    color: '#666',
    margin: '0',
    fontWeight: 'normal',
    fontStyle: 'italic'
  },
  SettingsButton: {
    position: 'absolute' as const,
    right: '20px',
    top: '20%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#000000'
  }
};

const Header: React.FC<HeaderProps> = ({ children, subtitle }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
      <>
        <div style={styles.Header} className="header">
          <div style={styles.HeaderContent}>
            <button
                style={styles.SettingsButton}
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Settings"
            >
              <FontAwesomeIcon icon={faCog} size="lg" />
            </button>
            <Link to="/login" style={{ textDecoration: 'none', color: '#22C55E', fontWeight: 'bold', position: 'absolute', left: '20px', top: '20px' }}>Login</Link>
            <h1 style={styles.Title}>{children}</h1>
            <p style={styles.Subtitle} className="subhead">Financial Literacy For You</p>
            <h3 style={styles.SubtitleSmall}>{subtitle}</h3>
          </div>
        </div>
        <Settings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </>
  );
};

export default Header;
