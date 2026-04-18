import axios from 'axios';

let rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
if (!rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://')) {
  rawApiUrl = `https://${rawApiUrl}`;
}

let origin = 'http://localhost:5001';
try {
  origin = new URL(rawApiUrl).origin;
} catch (e) {
  console.warn('Invalid API URL format, using default origin.');
}

const api = axios.create({
  baseURL: origin,
  timeout: 30000, 
});

// Request Interceptor: Handles prefixing and tokens
api.interceptors.request.use((config) => {
  // 1. Ensure /api prefix for all relative requests
  if (config.url && !config.url.startsWith('http') && !config.url.startsWith('/api')) {
    const separator = config.url.startsWith('/') ? '' : '/';
    config.url = `/api${separator}${config.url}`;
  }

  // 2. Add Authorization token
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === 'Network Error' && !error.response) {
      console.error('Network error: Backend may not be running. Make sure the server is running on http://localhost:5001');
    }
    return Promise.reject(error);
  }
);

export default api;