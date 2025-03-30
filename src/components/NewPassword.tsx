import React, { useState } from 'react';
        import { useParams } from 'react-router-dom';
        import { setNewPassword } from '../mockApi';
        import './NewPassword.css';

        const NewPassword: React.FC = () => {
          const { token } = useParams<{ token: string }>();
          const [password, setPassword] = useState('');
          const [message, setMessage] = useState('');

          const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            const success = setNewPassword(token as string, password);
            setMessage(success ? 'Password has been reset' : 'Error resetting password');
          };

          return (
            <div className="new-password-container">
              <form className="new-password-form" onSubmit={handleSubmit}>
                <h2>Set New Password</h2>
                <input
                  type="password"
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="new-password-input"
                  required
                />
                <button type="submit" className="new-password-button">Reset Password</button>
                {message && <p className="new-password-message">{message}</p>}
              </form>
            </div>
          );
        };

        export default NewPassword;
