import React, { useState } from 'react';

                                const styles = {
                                  container: {
                                    width: '100%',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    backgroundColor: '#fff',
                                    marginBottom: '24px',
                                    textAlign: 'left' as const,
                                    boxSizing: 'border-box' as const,
                                  },
                                  title: {
                                    fontSize: '18px',
                                    fontWeight: 'bold' as const,
                                    marginBottom: '16px',
                                    color: '#333',
                                  },
                                  accountItem: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '12px 0',
                                  },
                                  accountInfo: {
                                    flex: 1,
                                  },
                                  manageButton: {
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
                                  manageLinks: {
                                    display: 'flex',
                                    flexDirection: 'column' as const,
                                    gap: '8px',
                                    marginTop: '8px',
                                  },
                                  manageLink: {
                                    color: '#FF784B',
                                    textDecoration: 'none',
                                    cursor: 'pointer',
                                  },
                                };

                                const LinkedAccounts: React.FC = () => {
                                  const [showManageLinks, setShowManageLinks] = useState(false);

                                  const handleManageClick = () => {
                                    setShowManageLinks(!showManageLinks);
                                  };

                                  const handleEdit = () => {
                                    alert('Edit account');
                                  };

                                  const handleDelete = () => {
                                    alert('Delete account');
                                  };

                                  return (
                                    <div style={styles.container}>
                                      <h3 style={styles.title}>Linked Accounts</h3>
                                      <div style={styles.accountItem}>
                                        <div style={styles.accountInfo}>
                                          <div>Mock Account Name</div>
                                          <div>Mock Account Details</div>
                                        </div>
                                        <button style={styles.manageButton} onClick={handleManageClick}>
                                          Manage
                                        </button>
                                      </div>
                                      {showManageLinks && (
                                        <div style={styles.manageLinks}>
                                          <div style={styles.manageLink} onClick={handleEdit}>Edit</div>
                                          <div style={styles.manageLink} onClick={handleDelete}>Delete</div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                };

                                export default LinkedAccounts;
