import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface SpendingCategory {
  category: string;
  amount: number;
  color: string;
}

const spendingData: SpendingCategory[] = [
  { category: 'Food', amount: 450, color: '#FF6384' },
  { category: 'Utilities', amount: 300, color: '#36A2EB' },
  { category: 'Entertainment', amount: 200, color: '#FFCE56' },
  { category: 'Housing', amount: 1200, color: '#4BC0C0' },
  { category: 'Transportation', amount: 250, color: '#9966FF' },
  { category: 'Travel', amount: 300, color: '#FF9F40' }
];

const styles = {
  container: {
    padding: '15px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    marginBottom: '15px',
    color: '#333',
    textAlign: 'left' as const
  },
  chartContainer: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '10px'
  },
  legend: {
    marginTop: '20px',
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '10px',
    justifyContent: 'center'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '14px'
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '2px'
  }
};

const SpendingInsights: React.FC = () => {
  const data = {
    labels: spendingData.map(item => item.category),
    datasets: [
      {
        data: spendingData.map(item => item.amount),
        backgroundColor: spendingData.map(item => item.color),
        borderColor: spendingData.map(item => item.color),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <div style={styles.container} className="spending-insights">
      <h2 style={styles.title}>Spending Insights</h2>
      <div style={styles.chartContainer}>
        <Pie data={data} options={options} />
        <div style={styles.legend}>
          {spendingData.map((item, index) => (
            <div key={index} style={styles.legendItem} className="legend-item">
              <div style={{ ...styles.legendColor, backgroundColor: item.color }} />
              <span>{item.category}: ${item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpendingInsights;