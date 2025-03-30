import React from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    margin: '20px 0',
  },
  message: {
    marginBottom: '16px',
    padding: '12px',
    borderRadius: '8px',
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#22C55E',
    opacity: '.8',
    color: '#000000',
    marginLeft: 'auto',
  },
  aiMessage: {
    backgroundColor: '#f5f5f5',
    color: '#000000',
    marginRight: 'auto',
  },
  timestamp: {
    fontSize: '12px',
    color: '#000',
    marginTop: '4px',
  }
};

const mockMessages: Message[] = [
  {
    id: 1,
    text: "Hi! How can I help you with your finances today?",
    sender: 'ai',
    timestamp: new Date('2024-01-20T10:00:00'),
  },
  {
    id: 2,
    text: "I need help with budgeting.",
    sender: 'user',
    timestamp: new Date('2024-01-20T10:01:00'),
  },
  {
    id: 3,
    text: "I can help you create a budget plan. Let's start by reviewing your income and expenses.",
    sender: 'ai',
    timestamp: new Date('2024-01-20T10:02:00'),
  },
];

const ConversationLog: React.FC = () => {
  return (
    <div style={styles.container}>
      {mockMessages.map((message) => (
        <div
          key={message.id}
          style={{
            ...styles.message,
            ...(message.sender === 'user' ? styles.userMessage : styles.aiMessage),
          }}
        >
          <div>{message.text}</div>
          <div style={styles.timestamp}>
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationLog;