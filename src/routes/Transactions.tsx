import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faFilter } from '@fortawesome/free-solid-svg-icons';
import Card from '../Card';
// import RecentTransactions from '../RecentTransactions';
import SpendingSummary from '../summaries/SpendingSummary';
import AISuggestions from '../components/AISuggestions';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  method: 'ACH' | 'Check' | 'Card' | 'Transfer';
}

interface Subscription {
  id: string;
  name: string;
  amount: number;
  billingCycle: 'Monthly' | 'Yearly';
  nextBilling: string;
  category: string;
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Grocery Store',
    amount: 56.78,
    type: 'debit',
    category: 'Food',
    method: 'Card'
  },
  {
    id: '2',
    date: '2024-01-14',
    description: 'Salary Deposit',
    amount: 2500.00,
    type: 'credit',
    category: 'Income',
    method: 'ACH'
  },
  {
    id: '3',
    date: '2024-01-13',
    description: 'Rent Payment',
    amount: 1200.00,
    type: 'debit',
    category: 'Housing',
    method: 'Check'
  }
];

const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    amount: 15.99,
    billingCycle: 'Monthly',
    nextBilling: '2024-02-15',
    category: 'Entertainment'
  },
  {
    id: '2',
    name: 'Spotify Family',
    amount: 14.99,
    billingCycle: 'Monthly',
    nextBilling: '2024-02-18',
    category: 'Entertainment'
  },
  {
    id: '3',
    name: 'Adobe Creative Cloud',
    amount: 52.99,
    billingCycle: 'Monthly',
    nextBilling: '2024-02-20',
    category: 'Software'
  },
  {
    id: '4',
    name: 'Amazon Prime',
    amount: 139.00,
    billingCycle: 'Yearly',
    nextBilling: '2024-06-15',
    category: 'Shopping'
  },
  {
    id: '5',
    name: 'Gym Membership',
    amount: 49.99,
    billingCycle: 'Monthly',
    nextBilling: '2024-02-01',
    category: 'Health'
  }
];

const styles = {
  container: {
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    padding: '20px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  toggleButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease',
  },
  searchContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    alignItems: 'center',
    width: '100%',
  },
  searchWrapper: {
    position: 'relative' as const,
    flex: 1,
  },
  searchInput: {
    width: '100%',
    padding: '10px 36px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    outline: 'none',
  },
  searchIcon: {
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#666',
  },
  filterContainer: {
    position: 'relative' as const,
  },
  filterButton: {
    padding: '8px 12px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    height: '38px',
    whiteSpace: 'nowrap' as const,
  },
  filterDropdown: {
    position: 'absolute' as const,
    right: '0',
    top: 'calc(100% + 5px)',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '8px 0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    zIndex: 1000,
    width: '180px',
  },
  filterOption: {
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
  filterDivider: {
    height: '1px',
    backgroundColor: '#ddd',
    margin: '8px 0',
  },
  subscriptionList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  subscriptionItem: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subscriptionInfo: {
    flex: 1,
    // textAlign: 'left',
  },
  subscriptionName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '4px',
    // textAlign: 'left',
  },
  subscriptionDetails: {
    fontSize: '14px',
    color: '#666',
    // textAlign: 'left',
  },
  subscriptionRight: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-end',
    gap: '4px',
  },
  subscriptionAmount: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#FF784B',
    // textAlign: 'right',
  },
  subscriptionCategory: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#E5E7EB',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#666',
  },
  transactionList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  transactionItem: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};

const filterOptions = [
  'All Transactions',
  'Income',
  'Expenses',
  'Last 7 Days',
  'Last 30 Days',
  'Last 3 Months',
  'Checks',
  'ACH',
  'Recurring'
];

const Transactions: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Transactions');
  const [isFocused, setIsFocused] = useState(false);
  const [viewType, setViewType] = useState<'transactions' | 'subscriptions'>('transactions');

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setShowFilters(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filterTransactions = (transactions: Transaction[]) => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    switch (selectedFilter) {
      case 'Income':
        filtered = filtered.filter(t => t.type === 'credit');
        break;
      case 'Expenses':
        filtered = filtered.filter(t => t.type === 'debit');
        break;
      case 'Last 7 Days':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        filtered = filtered.filter(t => new Date(t.date) >= sevenDaysAgo);
        break;
      case 'Last 30 Days':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        filtered = filtered.filter(t => new Date(t.date) >= thirtyDaysAgo);
        break;
      case 'Last 3 Months':
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        filtered = filtered.filter(t => new Date(t.date) >= threeMonthsAgo);
        break;
      case 'Checks':
        filtered = filtered.filter(t => t.method === 'Check');
        break;
      case 'ACH':
        filtered = filtered.filter(t => t.method === 'ACH');
        break;
    }

    return filtered;
  };

  const filterSubscriptions = (subscriptions: Subscription[]) => {
    if (!searchTerm) return subscriptions;

    return subscriptions.filter(subscription =>
      subscription.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredTransactions = filterTransactions(mockTransactions);
  const filteredSubscriptions = filterSubscriptions(mockSubscriptions);

  return (
    <div style={styles.container}>
      <div style={styles.toggleContainer}>
        <button
          style={{
            ...styles.toggleButton,
            backgroundColor: viewType === 'transactions' ? '#FF784B' : '#E5E7EB',
            color: viewType === 'transactions' ? '#fff' : '#000',
          }}
          onClick={() => setViewType('transactions')}
        >
          Transactions
        </button>
        <button
          style={{
            ...styles.toggleButton,
            backgroundColor: viewType === 'subscriptions' ? '#FF784B' : '#E5E7EB',
            color: viewType === 'subscriptions' ? '#fff' : '#000',
          }}
          onClick={() => setViewType('subscriptions')}
        >
          Subscriptions
        </button>
      </div>

      <Card>
        <div style={{ padding: '20px' }}>
          <h2 style={styles.heading}>
            {viewType === 'transactions' ? 'Transactions' : 'Subscriptions'}
          </h2>
          
          <div style={styles.searchContainer}>
            <div style={styles.searchWrapper}>
              <FontAwesomeIcon icon={faMagnifyingGlass} style={styles.searchIcon} />
              <input
                type="text"
                placeholder={viewType === 'transactions' ? "Search transactions..." : "Search subscriptions..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                style={{
                  ...styles.searchInput,
                  borderColor: isFocused ? '#FF784B' : '#ddd',
                }}
              />
            </div>
            
            <div style={styles.filterContainer}>
              <button 
                style={{
                  ...styles.filterButton,
                  borderColor: showFilters ? '#FF784B' : '#ddd',
                }}
                onClick={() => setShowFilters(!showFilters)}
              >
                <FontAwesomeIcon icon={faFilter} />
                Filter
              </button>

              {showFilters && (
                <div style={styles.filterDropdown}>
                  {filterOptions.map((option, index) => (
                    <React.Fragment key={option}>
                      {index === 6 && <div style={styles.filterDivider} />}
                      <div
                        style={styles.filterOption}
                        onClick={() => handleFilterSelect(option)}
                      >
                        {option}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          {viewType === 'transactions' ? (
            <div style={styles.transactionList}>
              {filteredTransactions.map(transaction => (
                <div key={transaction.id} style={styles.transactionItem}>
                  <div>
                    <p style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '1px' }}>
                      {transaction.description}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                      {formatDate(transaction.date)} • {transaction.method}
                    </p>
                  </div>
                  <p style={{ 
                    fontWeight: 'bold',
                    color: transaction.type === 'credit' ? '#27ae60' : '#e74c3c',
                    margin: 0
                  }}>
                    {transaction.type === 'credit' ? '+' : '-'}
                    ${transaction.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.subscriptionList}>
              {filteredSubscriptions.map(subscription => (
                <div key={subscription.id} style={styles.subscriptionItem}>
                  <div style={styles.subscriptionInfo}>
                    <div style={styles.subscriptionName}>{subscription.name}</div>
                    <div style={styles.subscriptionDetails}>
                      {subscription.billingCycle} • Next billing: {formatDate(subscription.nextBilling)}
                    </div>
                  </div>
                  <div style={styles.subscriptionRight}>
                    <div style={styles.subscriptionAmount}>
                      ${subscription.amount.toFixed(2)}
                      <div style={{ fontSize: '12px', color: '#666', textAlign: 'right' }}>
                        /{subscription.billingCycle === 'Monthly' ? 'mo' : 'yr'}
                      </div>
                    </div>
                    <div style={styles.subscriptionCategory}>
                      {subscription.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <SpendingSummary />
      </Card>

      <Card>
        <AISuggestions />
      </Card>
    </div>
  );
};

export default Transactions;