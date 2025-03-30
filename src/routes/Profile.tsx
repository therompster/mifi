import React, { useState } from 'react';
                    import { Link, useNavigate } from 'react-router-dom';
                    import Card from '../Card';
                    import Toggle from '../components/Toggle';
                    import LinkedAccounts from '../components/LinkedAccounts';
                    import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
                    import { faEdit, faQuestionCircle, faBook, faEnvelope } from '@fortawesome/free-solid-svg-icons';

                    interface ToggleStates {
                      twoFactorAuth: boolean;
                      biometricLogin: boolean;
                      transactionAlerts: boolean;
                      weeklySummary: boolean;
                    }

                    const styles = {
                      container: {
                        width: '100%',
                        maxWidth: '480px',
                        margin: '0 auto',
                        padding: '20px',
                      },
                      profileSection: {
                        padding: '20px',
                        textAlign: 'left' as const,
                      },
                      profileHeader: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        marginBottom: '30px',
                      },
                      avatar: {
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover' as const,
                      },
                      profileInfo: {
                        flex: 1,
                      },
                      name: {
                        fontSize: '24px',
                        fontWeight: 'bold' as const,
                        marginBottom: '4px',
                        textAlign: 'left' as const,
                      },
                      email: {
                        color: '#666',
                        fontSize: '14px',
                        textAlign: 'left' as const,
                      },
                      editButton: {
                        background: 'none',
                        border: 'none',
                        color: '#FF784B',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'background-color 0.2s',
                      },
                      section: {
                        marginBottom: '24px',
                      },
                      sectionTitle: {
                        fontSize: '18px',
                        fontWeight: 'bold' as const,
                        marginBottom: '16px',
                        color: '#333',
                        textAlign: 'left' as const,
                      },
                      toggleItem: {
                        padding: '12px 0',
                        borderBottom: '1px solid #eee',
                      },
                      select: {
                        width: '100%',
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        marginBottom: '16px',
                        fontSize: '16px',
                      },
                      helpLinks: {
                        display: 'flex',
                        flexDirection: 'column' as const,
                        gap: '12px',
                      },
                      helpLink: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        color: '#333',
                        textDecoration: 'none',
                        transition: 'background-color 0.2s',
                        textAlign: 'left' as const,
                      },
                      helpLinkIcon: {
                        width: '20px',
                        color: '#666',
                      },
                      changePasswordButton: {
                        backgroundColor: '#FF784B',
                        border: '1px solid #FF784B',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        transition: 'background-color 0.2s',
                        marginTop: '10px',
                      },
                    };

                    const Profile: React.FC = () => {
                      const [toggles, setToggles] = useState<ToggleStates>({
                        twoFactorAuth: true,
                        biometricLogin: true,
                        transactionAlerts: true,
                        weeklySummary: true,
                      });

                      const navigate = useNavigate();

                      const handleToggle = (key: keyof ToggleStates) => {
                        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
                      };

                      const handleEditProfile = () => {
                        alert('Edit profile');
                      };

                      const handleChangePassword = () => {
                        navigate('/reset-password');
                      };

                      return (
                        <div style={styles.container}>

                          <Card>
                            <div style={styles.profileSection}>
                              <div style={styles.profileHeader}>
                                <img
                                  src="https://via.placeholder.com/80"
                                  style={styles.avatar}
                                  alt={''}
                                />
                                <div style={styles.profileInfo}>
                                  <div style={styles.name}>Jessica Harper</div>
                                  <div style={styles.email}>jessica.harper@example.com</div>
                                </div>
                                <button style={styles.editButton} onClick={handleEditProfile}>
                                  <FontAwesomeIcon icon={faEdit} />
                                  Edit
                                </button>
                              </div>

                              <LinkedAccounts />

                              <div style={styles.section}>
                                <h3 style={styles.sectionTitle}>Security & Privacy</h3>
                                <div style={styles.toggleItem}>
                                  <Toggle
                                    checked={toggles.twoFactorAuth}
                                    onChange={() => handleToggle('twoFactorAuth')}
                                    label="Two-Factor Authentication"
                                  />
                                </div>
                                <div style={styles.toggleItem}>
                                  <Toggle
                                    checked={toggles.biometricLogin}
                                    onChange={() => handleToggle('biometricLogin')}
                                    label="Biometric Login"
                                  />
                                </div>
                                <button style={styles.changePasswordButton} onClick={handleChangePassword}>
                                  Change Password
                                </button>
                              </div>

                              <div style={styles.section}>
                                <h3 style={styles.sectionTitle}>Notification Preferences</h3>
                                <div style={styles.toggleItem}>
                                  <Toggle
                                    checked={toggles.transactionAlerts}
                                    onChange={() => handleToggle('transactionAlerts')}
                                    label="Transaction Alerts"
                                  />
                                </div>
                                <div style={styles.toggleItem}>
                                  <Toggle
                                    checked={toggles.weeklySummary}
                                    onChange={() => handleToggle('weeklySummary')}
                                    label="Weekly Summary"
                                  />
                                </div>
                              </div>

                              <div style={styles.section}>
                                <h3 style={styles.sectionTitle}>App Preferences</h3>
                                <select style={styles.select} defaultValue="USD">
                                  <option value="USD">USD ($)</option>
                                  <option value="EUR">EUR (€)</option>
                                  <option value="GBP">GBP (£)</option>
                                </select>
                                <select style={styles.select} defaultValue="light">
                                  <option value="light">Light Mode</option>
                                  <option value="dark">Dark Mode</option>
                                </select>
                                <select style={styles.select} defaultValue="en">
                                  <option value="en">English</option>
                                  <option value="es">Spanish</option>
                                  <option value="fr">French</option>
                                </select>
                              </div>

                              <div style={styles.section}>
                                <h3 style={styles.sectionTitle}>Help & Support</h3>
                                <div style={styles.helpLinks}>
                                  <Link to="/faq" style={styles.helpLink}>
                                    <FontAwesomeIcon icon={faQuestionCircle} style={styles.helpLinkIcon} />
                                    FAQ
                                  </Link>
                                  <Link to="/terms" style={styles.helpLink}>
                                    <FontAwesomeIcon icon={faBook} style={styles.helpLinkIcon} />
                                    Terms of Service
                                  </Link>
                                  <Link to="/contact" style={styles.helpLink}>
                                    <FontAwesomeIcon icon={faEnvelope} style={styles.helpLinkIcon} />
                                    Contact Us
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      );
                    };

                    export default Profile;
