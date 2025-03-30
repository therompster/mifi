// api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication APIs
export const register = (userData) => api.post('/register', userData);
export const login = (credentials) => api.post('/login', credentials);
export const resetPassword = (email) => api.post('/reset-password', { email });
export const setNewPassword = (token, password) => api.post('/new-password', { token, password });

// Transactions APIs
export const getTransactions = () => api.get('/transactions');
export const addTransaction = (transaction) => api.post('/transactions', transaction);

// Subscriptions APIs
export const getSubscriptions = () => api.get('/subscriptions');
export const addSubscription = (subscription) => api.post('/subscriptions', subscription);

// Budget APIs
export const getBudget = () => api.get('/budget');
export const updateBudget = (budget) => api.put('/budget', budget);

// Goals APIs
export const getGoals = () => api.get('/goals');
export const updateGoal = (goal) => api.put('/goals', goal);

// User Profile APIs
export const getProfile = () => api.get('/profile');
export const updateProfile = (profile) => api.put('/profile', profile);

// Plaid Integration APIs
export const createLinkToken = () => api.get('/plaid/create_link_token');
export const exchangePublicToken = (publicToken, institutionId, institutionName) => 
  api.post('/plaid/exchange_public_token', { public_token: publicToken, institution_id: institutionId, institution_name: institutionName });
export const getAccounts = () => api.get('/plaid/accounts');
export const refreshTransactions = () => api.post('/plaid/transactions/refresh');
export const getSpendingByCategory = (startDate, endDate) => 
  api.get(`/plaid/spending_by_category?start_date=${startDate}&end_date=${endDate}`);

export default api;
