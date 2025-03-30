import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

interface SpendingCategory {
  category: string;
  amount: number;
  percentage: number;
}

const initialCategories: SpendingCategory[] = [
  { category: 'Food', amount: 450, percentage: 35 },
  { category: 'Utilities', amount: 300, percentage: 25 },
  { category: 'Healthcare', amount: 200, percentage: 15 },
];

const expandedCategories: SpendingCategory[] = [
  ...initialCategories,
  { category: 'Transportation', amount: 150, percentage: 10 },
  { category: 'Entertainment', amount: 120, percentage: 8 },
  { category: 'Shopping', amount: 90, percentage: 7 },
];

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
  totalSpending: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#22C55E',
    marginBottom: '20px',
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
  categoryList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  category: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: '16px',
    marginBottom: '4px',
  },
  amount: {
    fontSize: '14px',
    color: '#666',
  },
  progressBarContainer: {
    width: '100%',
    height: '6px',
    backgroundColor: '#f0f0f0',
    borderRadius: '3px',
    marginTop: '8px',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#22C55E',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
};

const SpendingSummary: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const categories = isExpanded ? expandedCategories : initialCategories;
  const totalSpending = categories.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Spending Summary</h2>
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

      <div style={styles.totalSpending}>
        ${totalSpending.toLocaleString()}
      </div>

      <div style={styles.categoryList}>
        {categories.map((category, index) => (
          <div key={index}>
            <div style={styles.category}>
              <div style={styles.categoryInfo}>
                <div style={styles.categoryName}>{category.category}</div>
                <div style={styles.amount}>
                  ${category.amount.toLocaleString()} ({category.percentage}%)
                </div>
              </div>
            </div>
            <div style={styles.progressBarContainer}>
              <div 
                style={{
                  ...styles.progressBar,
                  width: `${category.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpendingSummary;