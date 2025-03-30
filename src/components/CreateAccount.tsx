import React, { useState } from 'react';
                        import { Link } from 'react-router-dom';
                        import { register } from '../mockApi';
                        import './CreateAccount.css';

                        const CreateAccount: React.FC = () => {
                          const [formData, setFormData] = useState({
                            firstName: '',
                            lastName: '',
                            email: '',
                            reEmail: '',
                            dob: '',
                            phone: '',
                            password: '',
                            rePassword: '',
                            country: '',
                            termsAccepted: false,
                          });
                          const [message, setMessage] = useState('');

                          const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
                            const { name, value, type } = e.target as HTMLInputElement;
                            const checked = (e.target as HTMLInputElement).checked;
                            setFormData(prev => ({
                              ...prev,
                              [name]: type === 'checkbox' ? checked : value,
                            }));
                          };

                          const handleSubmit = async (e: React.FormEvent) => {
                            e.preventDefault();
                            if (formData.email !== formData.reEmail) {
                              setMessage('Emails do not match');
                              return;
                            }
                            if (formData.password !== formData.rePassword) {
                              setMessage('Passwords do not match');
                              return;
                            }
                            try {
                              register(formData);
                              setMessage('Registration successful');
                            } catch {
                              setMessage('Error registering account');
                            }
                          };

                          return (
                            <div className="create-account-container">
                              <form className="create-account-form" onSubmit={handleSubmit}>
                                <h2>Registration</h2>
                                <p>Already a member? <Link to="/login">Login Here</Link></p>
                                <div className="create-account-input create-account-input-no-border">
                                  <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="create-account-input"
                                    required
                                  />
                                  <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="create-account-input"
                                    required
                                  />
                                </div>
                                <input
                                  type="email"
                                  name="email"
                                  placeholder="Email Address"
                                  value={formData.email}
                                  onChange={handleChange}
                                  className="create-account-input create-account-input-full"
                                  required
                                />
                                <input
                                  type="email"
                                  name="reEmail"
                                  placeholder="Re-enter Email Address"
                                  value={formData.reEmail}
                                  onChange={handleChange}
                                  className="create-account-input create-account-input-full"
                                  required
                                />
                                <label htmlFor="dob" style={{ textAlign: 'left', width: '100%' }}>Date of Birth</label>
                                <input
                                  type="date"
                                  name="dob"
                                  placeholder="Date of Birth"
                                  value={formData.dob}
                                  onChange={handleChange}
                                  className="create-account-input create-account-input-full"
                                  required
                                />
                                <input
                                  type="tel"
                                  name="phone"
                                  placeholder="Phone Number"
                                  value={formData.phone}
                                  onChange={handleChange}
                                  className="create-account-input create-account-input-full"
                                  required
                                />
                                <input
                                  type="password"
                                  name="password"
                                  placeholder="Create Password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  className="create-account-input create-account-input-full"
                                  required
                                />
                                <input
                                  type="password"
                                  name="rePassword"
                                  placeholder="Re-enter Password"
                                  value={formData.rePassword}
                                  onChange={handleChange}
                                  className="create-account-input create-account-input-full"
                                  required
                                />
                                <select
                                  name="country"
                                  value={formData.country}
                                  onChange={handleChange}
                                  className="create-account-input create-account-input-full select"
                                  required
                                >
                                  <option value="">Select Country</option>
                                  <option value="USA">USA</option>
                                  <option value="Canada">Canada</option>
                                  <option value="UK">UK</option>
                                  {/* Add more countries as needed */}
                                </select>
                                <div className="checkbox-group">
                                  <input
                                    type="checkbox"
                                    name="termsAccepted"
                                    checked={formData.termsAccepted}
                                    onChange={handleChange}
                                    required
                                  />
                                  <label>I accept the terms and conditions</label>
                                </div>
                                <button type="submit" className="signup-button">Sign Up</button>
                                {message && <p className="message">{message}</p>}
                                <div className="help-support">
                                  <p>Help and Support</p>
                                  <Link to="/faq">FAQ</Link>
                                  <Link to="/contact">Contact Us</Link>
                                </div>
                              </form>
                            </div>
                          );
                        };

                        export default CreateAccount;
