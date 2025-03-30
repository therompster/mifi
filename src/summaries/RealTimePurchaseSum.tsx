import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const styles = {
  container: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    marginBottom: '15px',
  },
  progressContainer: {
    marginBottom: '20px',
  },
  progressTitle: {
    fontSize: '14px',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  progressBarContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    transition: 'width 0.3s ease',
  },
  groceriesBar: {
    backgroundColor: '#22C55E',
  },
  entertainmentBar: {
    backgroundColor: '#FF784B',
  },
  summaryTitle: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    marginBottom: '20px',
    color: '#333',
  }
};

const RealTimePurchaseSum: React.FC = () => {
  const data = {
    labels: ['6:00 AM', '9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '9:00 PM'],
    datasets: [
      {
        label: 'Groceries',
        data: [150, 320, 450, 475, 560, 650],
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Entertainment',
        data: [100, 250, 300, 420, 480, 550],
        borderColor: '#FF784B',
        backgroundColor: 'rgba(255, 120, 75, 0.5)',
        tension: 0.4,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Daily Purchase Activity'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amount ($)'
        }
      }
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.summaryTitle}>Real Time Purchase Impact Summary</h3>
      
      <div style={styles.progressContainer}>
        <div style={styles.progressTitle}>
          <span>Groceries</span>
          <span>75%</span>
        </div>
        <div style={styles.progressBarContainer}>
          <div 
            style={{
              ...styles.progressBar,
              ...styles.groceriesBar,
              width: '75%'
            }}
          />
        </div>
      </div>

      <div style={styles.progressContainer}>
        <div style={styles.progressTitle}>
          <span>Entertainment</span>
          <span>100%</span>
        </div>
        <div style={styles.progressBarContainer}>
          <div 
            style={{
              ...styles.progressBar,
              ...styles.entertainmentBar,
              width: '100%'
            }}
          />
        </div>
      </div>

      <h3 style={styles.title}>Live Spending Insights</h3>
      <Line data={data} options={options} />
    </div>
  );
};

export default RealTimePurchaseSum;