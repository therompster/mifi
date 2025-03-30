import React from 'react';
import Card from '../Card';
import BackLink from '../components/BackLink';

const styles = {
  container: {
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    padding: '20px',
  },
  section: {
    padding: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    marginBottom: '24px',
    textAlign: 'left' as const,
  },
  faqItem: {
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '20px',
  },
  question: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    marginBottom: '12px',
    color: '#333',
    textAlign: 'left' as const,
  },
  answer: {
    fontSize: '16px',
    color: '#666',
    lineHeight: '1.6',
    textAlign: 'left' as const,
  },
};

const FAQ: React.FC = () => {
  const faqs = [
    {
      question: "How do I set up my account?",
      answer: "Setting up your account is easy! Simply click the 'Sign Up' button, enter your email, create a password, and follow the verification steps."
    },
    {
      question: "How can I link my bank account?",
      answer: "To link your bank account, go to Profile > Linked Accounts and follow the secure connection process with your banking credentials."
    },
    {
      question: "Is my financial data secure?",
      answer: "Yes! We use bank-level encryption and security measures to protect your data. We never store sensitive banking credentials on our servers."
    },
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login screen, enter your email address, and follow the reset instructions sent to your inbox."
    }
  ];

  return (
    <div style={styles.container}>
      <BackLink />
      <Card>
        <div style={styles.section}>
          <h1 style={styles.title}>Frequently Asked Questions</h1>
          {faqs.map((faq, index) => (
            <div key={index} style={styles.faqItem}>
              <h3 style={styles.question}>{faq.question}</h3>
              <p style={styles.answer}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FAQ;