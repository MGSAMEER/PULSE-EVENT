import axios from 'axios';

let rawApiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
if (!rawApiUrl.startsWith('http://') && !rawApiUrl.startsWith('https://')) {
  rawApiUrl = `https://${rawApiUrl}`;
}

let API_BASE_URL = 'http://localhost:5001/api';
try {
  const parsedUrl = new URL(rawApiUrl);
  API_BASE_URL = `${parsedUrl.protocol}//${parsedUrl.host}/api`;
} catch (e) {
  console.warn('Invalid API URL format, falling back to localhost.');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Add token to requests
api.interceptors.request.use((config) => {
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