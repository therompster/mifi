import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

const styles = {
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#666',
    textDecoration: 'none',
    fontSize: '16px',
    padding: '12px 0',
    marginBottom: '12px',
  },
  icon: {
    width: '12px',
  },
};

const BackLink: React.FC = () => {
  return (
    <Link to="/profile" style={styles.backLink}>
      <FontAwesomeIcon icon={faChevronLeft} style={styles.icon} />
      Back
    </Link>
  );
};

export default BackLink;