// src/components/Notifications.tsx
  import React, { useState } from 'react';
  import { FaBell, FaChartLine, FaPiggyBank, FaTrash } from 'react-icons/fa';
  import './Notifications.css';

  const initialNotifications = [
    { id: 1, message: 'Monthly spending report available', icon: <FaBell />, timestamp: '2 hours ago' },
    { id: 2, message: 'Weekly Budget Limit Exceeded', icon: <FaChartLine />, timestamp: '1 day ago' },
    { id: 3, message: 'New Savings Goal Suggested', icon: <FaPiggyBank />, timestamp: '3 days ago' },
  ];

  const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState(initialNotifications);

    const handleDelete = (id: number) => {
      setNotifications(notifications.filter(notification => notification.id !== id));
    };

    return (
      <div className="notifications-container">
        {notifications.map((notification) => (
          <div key={notification.id} className="notification-card">
            <div className="notification-message">
              {notification.message}
            </div>
            <div className="notification-icon">
              {notification.icon}
            </div>
            <div className="notification-timestamp">
              {notification.timestamp}
            </div>
            <button className="delete-button" onClick={() => handleDelete(notification.id)}>
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    );
  };

  export default Notifications;
