import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../mockApi';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(email, password);
    if (user) {
      alert('Login successful');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        {error && <div className="login-error">{error}</div>}
        <p className="login-title">Great to see you again!</p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          required
        />
        <button type="submit" className="login-button">Login</button>
        <p className="forgot-password">Forgot your password? <Link to="/reset-password">Reset it here</Link></p>
        <p className="register-link">Don't have an account? <Link to="/register">Register here</Link></p>
      </form>
    </div>
  );
};

export default LoginPage;
