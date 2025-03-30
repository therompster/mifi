import React, { useEffect, useState } from 'react';
import { getAccounts, refreshTransactions } from '../api';
import PlaidLinkButton from './PlaidLinkButton';

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
  },
  accountList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  accountItem: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '4px',
  },
  accountDetails: {
    fontSize: '14px',
    color: '#666',
  },
  accountRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  accountBalance: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#22C55E',
  },
  institutionName: {
    display: 'inline-block',
    padding: '4px 8px',
    backgroundColor: '#E5E7EB',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#666',
  },
  refreshButton: {
    padding: '10px 20px',
    backgroundColor: '#f0f0f0',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  noAccounts: {
    textAlign: 'center',
    padding: '30px 0',
    color: '#666',
  },
  loader: {
    textAlign: 'center',
    padding: '30px 0',
    color: '#666',
  },
};

const BankAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch accounts when the component mounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Function to fetch accounts
  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await getAccounts();
      setAccounts(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching accounts:', err);
      setError('Failed to load your bank accounts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh transactions
  const handleRefreshTransactions = async () => {
    setIsRefreshing(true);
    try {
      await refreshTransactions();
      setError(null);
      // Show success message or update UI as needed
    } catch (err) {
      console.error('Error refreshing transactions:', err);
      setError('Failed to refresh transactions. Please try again later.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle successful Plaid link
  const handlePlaidSuccess = () => {
    fetchAccounts();
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount !== null && amount !== undefined
      ? `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : 'N/A';
  };

  // Render loading state
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Your Bank Accounts</h2>
        </div>
        <div style={styles.loader}>Loading your accounts...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Your Bank Accounts</h2>
        {accounts.length > 0 && (
          <button
            style={styles.refreshButton}
            onClick={handleRefreshTransactions}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh Transactions'}
          </button>
        )}
      </div>

      {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

      {accounts.length === 0 ? (
        <div>
          <div style={styles.noAccounts}>
            <p>You haven't connected any bank accounts yet.</p>
            <p>Connect an account to start tracking your finances.</p>
          </div>
          <div style={{ marginTop: '20px' }}>
            <PlaidLinkButton onSuccess={handlePlaidSuccess} />
          </div>
        </div>
      ) : (
        <div>
          <div style={styles.accountList}>
            {accounts.map((account) => (
              <div key={account.id} style={styles.accountItem}>
                <div style={styles.accountInfo}>
                  <div style={styles.accountName}>
                    {account.name} {account.mask && `•••• ${account.mask}`}
                  </div>
                  <div style={styles.accountDetails}>
                    {account.subtype
                      ? `${account.subtype.charAt(0).toUpperCase() + account.subtype.slice(1)} ${account.type}`
                      : account.type}
                  </div>
                </div>
                <div style={styles.accountRight}>
                  <div style={styles.accountBalance}>
                    {formatCurrency(account.available_balance || account.current_balance)}
                  </div>
                  <div style={styles.institutionName}>{account.institution_name}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '20px' }}>
            <PlaidLinkButton onSuccess={handlePlaidSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccounts;
