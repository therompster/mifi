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
  content: {
    fontSize: '16px',
    color: '#333',
    lineHeight: '1.6',
    textAlign: 'left' as const,
  },
  subheading: {
    fontSize: '18px',
    fontWeight: 'bold' as const,
    marginTop: '24px',
    marginBottom: '16px',
    color: '#333',
    textAlign: 'left' as const,
  },
  paragraph: {
    marginBottom: '16px',
  },
};

const Terms: React.FC = () => {
  return (
    <div style={styles.container}>
      <BackLink />
      <Card>
        <div style={styles.section}>
          <h1 style={styles.title}>Terms of Service</h1>
          <div style={styles.content}>
            <p style={styles.paragraph}>
              Welcome to IFi. By using our services, you agree to these terms. Please read them carefully.
            </p>

            <h2 style={styles.subheading}>1. Account Terms</h2>
            <p style={styles.paragraph}>
              You must be 13 years or older to use this service. You must provide accurate and complete information when creating your account.
            </p>

            <h2 style={styles.subheading}>2. Privacy & Security</h2>
            <p style={styles.paragraph}>
              Your privacy is important to us. We collect and use your information as described in our Privacy Policy.
            </p>

            <h2 style={styles.subheading}>3. Service Usage</h2>
            <p style={styles.paragraph}>
              Our services are provided "as is" without any warranties. We reserve the right to modify or terminate services at any time.
            </p>

            <h2 style={styles.subheading}>4. User Responsibilities</h2>
            <p style={styles.paragraph}>
              You are responsible for maintaining the security of your account and for all activities that occur under your account.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Terms;