import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faRobot, faReceipt, faUser } from '@fortawesome/free-solid-svg-icons';

interface FooterProps {
  children?: React.ReactNode;
}

const styles: { 
  Footer: React.CSSProperties; 
  Subtext: React.CSSProperties;
  Nav: React.CSSProperties;
  NavList: React.CSSProperties;
  NavItem: React.CSSProperties;
  NavLink: React.CSSProperties;
} = {
  Footer: {
    position: 'fixed',
    bottom: '0px',
    left: '0px',
    width: '100%',
    height: '80px',
    backgroundColor: '#000000',
    boxShadow: '0px -2px 6px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    zIndex: 1000,
  },
  Subtext: {
    fontSize: '12px',
    color: '#ffffff',
    margin: '4px 0 0 0',
  },
  Nav: {
    width: '100%',
    maxWidth: '400px',
    marginBottom: '8px',
  },
  NavList: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  NavItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  NavLink: {
    color: '#ffffff',
    textDecoration: 'none',
    fontSize: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
};

const Footer: React.FC<FooterProps> = ({ children }) => {
  return (
    <div style={styles.Footer}>
      <nav style={styles.Nav}>
        <ul style={styles.NavList}>
          <li style={styles.NavItem}>
            <Link to="/" style={styles.NavLink}>
              <FontAwesomeIcon icon={faHome} size="lg" />
              <span>Home</span>
            </Link>
          </li>
          <li style={styles.NavItem}>
            <Link to="/advisor" style={styles.NavLink}>
              <FontAwesomeIcon icon={faRobot} size="lg" />
              <span>Advisor</span>
            </Link>
          </li>
          <li style={styles.NavItem}>
            <Link to="/transactions" style={styles.NavLink}>
              <FontAwesomeIcon icon={faReceipt} size="lg" />
              <span>Transactions</span>
            </Link>
          </li>
          <li style={styles.NavItem}>
            <Link to="/profile" style={styles.NavLink}>
              <FontAwesomeIcon icon={faUser} size="lg" />
              <span>Profile</span>
            </Link>
          </li>
        </ul>
      </nav>
      {children}
      <p style={styles.Subtext}>© 2024 Financial Literacy Hub</p>
    </div>
  );
};

export default Footer;