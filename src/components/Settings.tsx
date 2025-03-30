import React, { useState } from 'react';
          import General from '../settings/General';
          import Preferences from '../settings/Preferences';
          import Security from '../settings/Security';
          import Billing from '../settings/Billing';
          import Membership from '../settings/Membership';
          import UpgradePlan from '../settings/UpgradePlan';
          import Integrations from '../settings/Integrations';
          import ContactSupport from '../settings/ContactSupport';
          import SetBudgetAndGoals from '../settings/SetBudgetAndGoals';
          import Notifications from '../Notifications';
          import '../settings/Settings.css';

          interface SettingsProps {
            isOpen: boolean;
            onClose: () => void;
          }

          const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
            const [activeTab, setActiveTab] = useState('General');

            if (!isOpen) return null;

            const renderContent = () => {
              switch (activeTab) {
                case 'General':
                  return <General />;
                case 'Preferences':
                  return <Preferences />;
                case 'Security':
                  return <Security />;
                case 'Billing':
                  return <Billing />;
                case 'Membership':
                  return <Membership />;
                case 'UpgradePlan':
                  return <UpgradePlan />;
                case 'Integrations':
                  return <Integrations />;
                case 'ContactSupport':
                  return <ContactSupport />;
                case 'SetBudgetAndGoals':
                  return <SetBudgetAndGoals />;
                case 'Notifications':
                  return <Notifications />;
                default:
                  return <General />;
              }
            };

            return (
              <div className="settings-overlay" onClick={onClose}>
                <div className="settings-container" onClick={e => e.stopPropagation()}>
                  <div className="settings-header">
                    <h2 className="settings-title">Settings</h2>
                    <button className="settings-close-button" onClick={onClose}>×</button>
                  </div>
                  <div className="settings-content">
                    <nav className="settings-nav">
                      <ul>
                        <li onClick={() => setActiveTab('General')}>General</li>
                        <li onClick={() => setActiveTab('Preferences')}>Preferences</li>
                        <li onClick={() => setActiveTab('Security')}>Security</li>
                        <li onClick={() => setActiveTab('Billing')}>Billing</li>
                        <li onClick={() => setActiveTab('Membership')}>Membership</li>
                        <li onClick={() => setActiveTab('UpgradePlan')}>Upgrade Plan</li>
                        <li onClick={() => setActiveTab('Integrations')}>Integrations</li>
                        <li onClick={() => setActiveTab('ContactSupport')}>Contact Support</li>
                        <li onClick={() => setActiveTab('SetBudgetAndGoals')}>Set Budget and Goals</li>
                        <li onClick={() => setActiveTab('Notifications')}>Notifications</li>
                        <li onClick={() => setActiveTab('SignOut')}>Sign Out</li>
                      </ul>
                    </nav>
                    <div className="settings-tab-content">
                      {renderContent()}
                    </div>
                  </div>
                </div>
              </div>
            );
          };

          export default Settings;
