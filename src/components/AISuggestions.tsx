import React, {useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronDown, faChevronUp} from '@fortawesome/free-solid-svg-icons';

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    margin: 0,
  },
  expandButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    color: '#666',
    fontSize: '14px',
  },
  suggestionList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  suggestion: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    borderLeft: '4px solid #22C55E',
  },
  suggestionTitle: {
    fontSize: '16px',
    fontWeight: 'bold' as const,
    marginBottom: '8px',
    color: '#333',
  },
  suggestionText: {
    fontSize: '14px',
    color: '#666',
    lineHeight: '1.5',
  },
};

const mockSuggestions = [
  {
    title: 'Subscription Optimization',
    text: 'I noticed you have multiple streaming subscriptions. Consolidating to a family plan could save you $25/month.',
  },
  {
    title: 'Spending Pattern Alert',
    text: 'Your food delivery expenses have increased by 40% this month. Consider meal planning to reduce costs.',
  },
  {
    title: 'Smart Savings Opportunity',
    text: 'Based on your cash flow, you could automatically save an additional $200/month without impacting your lifestyle.',
  },
  {
    title: 'Bill Negotiation',
    text: 'Your internet bill is higher than average for your area. I can help you negotiate a better rate with your provider.',
  },
];

const AISuggestions: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>AI Suggested Optimizations</h2>
        <button 
          style={styles.expandButton}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <span>Collapse</span>
              <FontAwesomeIcon icon={faChevronUp} />
            </>
          ) : (
            <>
              <span>Expand</span>
              <FontAwesomeIcon icon={faChevronDown} />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div style={styles.suggestionList}>
          {mockSuggestions.map((suggestion, index) => (
            <div key={index} style={styles.suggestion}>
              <div style={styles.suggestionTitle}>{suggestion.title}</div>
              <div style={styles.suggestionText}>{suggestion.text}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
