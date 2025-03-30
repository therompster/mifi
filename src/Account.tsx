import React from 'react';
import Card from './Card';
import RecentTransactions from './RecentTransactions';
import SpendingInsights from './SpendingInsights';
import Budget from './summaries/Budget';
import Goals from './summaries/Goals';

interface AccountOverviewProps {
  totalBalance: number;
  availableCredit: number;
}

const styles = {
  container: {
    padding: '20px',
    width: '100%',
    maxWidth: '992px',
    margin: '0 auto'
  },
  cardContent: {
    padding: '15px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    marginBottom: '15px',
    color: '#333',
    textAlign: 'left' as const
  },
  balanceSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 0'
  },
  balanceInfo: {
    textAlign: 'left' as const
  },
  sectionTitle: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
    marginBottom: '1px'
  },
  amount: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: '#2c3e50',
    margin: 0
  },
  summariesContainer: {
    padding: '15px',
    overflow: 'hidden'
  },
  summariesTitle: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    marginBottom: '20px',
    color: '#333',
    textAlign: 'left' as const
  },
  summariesContent: {
    display: 'flex',
    gap: '40px',
    width: '100%'
  },
  summarySection: {
    flex: '1',
    minWidth: 0
  }
};

const AccountOverview: React.FC<AccountOverviewProps> = ({ totalBalance, availableCredit }) => {
  return (
    <div style={styles.container} className="account-overview">
      <Card>
        <div style={styles.cardContent}>
          <h2 style={styles.title}>Account Overview</h2>
          <div style={styles.balanceSection}>
            <div style={styles.balanceInfo}>
              <p style={styles.sectionTitle}>Total Balance</p>
              <p style={styles.amount}>
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          
          <div style={styles.balanceSection}>
            <div style={styles.balanceInfo}>
              <p style={styles.sectionTitle}>Available Credit</p>
              <p style={styles.amount}>
                ${availableCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div style={styles.cardContent}>
          <h2 style={styles.title}>Recent Transactions</h2>
          <RecentTransactions />
        </div>
      </Card>

      <Card>
        <SpendingInsights />
      </Card>

      <Card>
        <div style={styles.summariesContainer}>
          <h2 style={styles.summariesTitle}>Budget And Goal Summary</h2>
          <div style={styles.summariesContent} className="summaries-content">
            <div style={styles.summarySection}>
              <Budget />
            </div>
            <div style={styles.summarySection}>
              <Goals />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AccountOverview;