import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.msg || 'Login failed. Please check your credentials.');
  }
};

export const register = async (name, email, password) => {
  try {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data && response.data.token) {
      return response.data;
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Registration error:', error.response?.data);
    if (error.response?.data?.errors) {
      const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
      throw new Error(errorMessages);
    }
    throw new Error(error.response?.data?.msg || 'Registration failed. Please try again.');
  }
};

// Fraud Detection API calls
export const analyzeFraudRisk = async (transactionData) => {
  try {
    const response = await api.post('/fraud-detection', {
      ...transactionData,
      timestamp: transactionData.timestamp || new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error analyzing transaction');
    }
    throw error;
  }
};

// Transaction API calls
export const updateTransactionStatus = async (transactionId, status) => {
  try {
    const response = await api.put(`/transactions/${transactionId}/status`, { status });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error updating transaction status');
    }
    throw error;
  }
};

export const getTransactions = async () => {
  try {
    const response = await api.get('/fraud-detection/history');
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error fetching transactions');
    }
    throw error;
  }
};

export const createTransaction = async (transactionData) => {
  try {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error creating transaction');
    }
    throw error;
  }
};

// Format transaction data for display
export const formatTransaction = (transaction) => {
  return {
    id: transaction._id,
    amount: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(transaction.amount),
    cardNumber: transaction.cardNumber,
    merchantName: transaction.merchantName,
    category: transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1),
    timestamp: new Date(transaction.timestamp).toLocaleString(),
    status: transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1),
    riskLevel: transaction.riskAssessment.level,
    riskScore: transaction.riskAssessment.score
  };
};

export default api;
