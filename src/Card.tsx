import React from 'react';

interface CardProps {
  children: React.ReactNode;
}

const styles = {
  Card: {
    width: '100%',
    maxWidth: '992px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0px 0px 9px rgba(3,3,3,0.1)',
    marginBottom: '25px',
    margin: '0 auto 25px auto',
    overflow: 'hidden'
  }
};

const Card: React.FC<CardProps> = ({ children }) => {
  return (
    <div style={styles.Card} className="responsive-card">
      {children}
    </div>
  );
};

export default Card;