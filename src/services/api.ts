import axios from 'axios';

// Get API URL from environment or default to Render backend
const apiUrl = process.env.REACT_APP_API_URL || 'https://pulse-events.onrender.com/api';

// Ensure proper protocol
let baseURL = apiUrl;
if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
  baseURL = `https://${baseURL}`;
}

// Remove trailing /api if present - we'll add it in the interceptor
if (baseURL.endsWith('/api')) {
  baseURL = baseURL.slice(0, -4);
}

const api = axios.create({
  baseURL: baseURL, // e.g., https://pulse-events.onrender.com
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
      console.error('Network error: Backend may not be running. Make sure the server is running and REACT_APP_API_URL is configured (https://pulse-events.onrender.com)');
    }
    return Promise.reject(error);
  }
);

export default api;