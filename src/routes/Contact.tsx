import React, {useState} from 'react';
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
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  label: {
    fontSize: '16px',
    color: '#333',
    textAlign: 'left' as const,
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  textarea: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    minHeight: '120px',
    resize: 'vertical' as const,
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#32BC9B',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  successMessage: {
    backgroundColor: '#32BC9B',
    color: '#fff',
    padding: '12px',
    borderRadius: '8px',
    marginTop: '16px',
    textAlign: 'center' as const,
  },
};

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  return <>
    <div style={styles.container}>
      <BackLink/>
      <Card>
        <div style={styles.section}>
          <h1 style={styles.title}>Contact Us</h1>
          <form name="contact" style={styles.form}
                onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="name">Name</label>
              <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="email">Email</label>
              <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="subject">Subject</label>
              <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  style={styles.input}
                  required
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="message">Message</label>
              <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  style={styles.textarea}
                  required
              />
            </div>
            <button type="submit" style={styles.submitButton}>
              Send Message
            </button>
          </form>
          {submitted && (
              <div style={styles.successMessage}>
                Thank you for your message! We'll get back to you soon.
              </div>
          )}
        </div>
      </Card>
    </div>
  </>;
};

export default Contact;
