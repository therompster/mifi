import React, { useState } from 'react';
import Card from '../Card';
import ConversationLog from '../components/ConversationLog';
import RealTimePurchaseSum from '../summaries/RealTimePurchaseSum';

const styles = {
  container: {
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    padding: '20px',
  },
  inputContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  input: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  button: {
    padding: '12px 24px',
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  insightsButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#FF784B',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    marginTop: '20px',
    cursor: 'pointer',
    fontSize: '16px',
    // textTransform: 'uppercase',
  }
};

const Advisor: React.FC = () => {
  const [message, setMessage] = useState('');
  const [showInsights, setShowInsights] = useState(false);

  const handleSubmit = () => {
    // Handle message submission
    setMessage('');
  };

  return (
    <div style={styles.container}>
      <Card>
        <div style={{ padding: '20px' }}>
          <div style={styles.inputContainer}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask your financial advisor..."
              style={styles.input}
            />
            <button onClick={handleSubmit} style={styles.button}>Send</button>
          </div>
          <ConversationLog />
          {showInsights && <RealTimePurchaseSum />}
          <button 
            onClick={() => setShowInsights(!showInsights)} 
            style={styles.insightsButton}
          >
            More Insights
          </button>
        </div>
      </Card>
    </div>
  );
};

export default Advisor;