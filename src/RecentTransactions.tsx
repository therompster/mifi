import React from 'react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
}

const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: '2024-01-15',
    description: 'Grocery Store',
    amount: 56.78,
    type: 'debit'
  },
  {
    id: '2',
    date: '2024-01-14',
    description: 'Salary Deposit',
    amount: 2500.00,
    type: 'credit'
  },
  {
    id: '3',
    date: '2024-01-13',
    description: 'Restaurant',
    amount: 45.90,
    type: 'debit'
  },
  {
    id: '4',
    date: '2024-01-13',
    description: 'Gym Membership',
    amount: 45.90,
    type: 'debit'
  },
{
    id: '5',
    date: '2024-01-13',
    description: 'Online Shopping',
    amount: 45.90,
    type: 'debit'
  },
];

const RecentTransactions: React.FC = () => {
  return (
    <div>
      {mockTransactions.map(transaction => (
        <div
          key={transaction.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '4px 0',
            borderBottom: '1px solid #f0f0f0'
          }}
        >
          <div>
            <p style={{ fontWeight: 'bold', color: '#2c3e50', marginBottom: '1px' }}>
              {transaction.description}
            </p>
            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
              {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
          <p style={{ 
            fontWeight: 'bold',
            color: transaction.type === 'credit' ? '#27ae60' : '#e74c3c',
            margin: 0
          }}>
            {transaction.type === 'credit' ? '+' : '-'}
            ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      ))}
    </div>
  );
};

export default RecentTransactions;