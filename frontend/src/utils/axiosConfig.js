import axios from 'axios';
import API_CONFIG from '../config';

// Create an axios instance with default config
const instance = axios.create({
  baseURL: API_CONFIG.API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
instance.interceptors.response.use(
  response => response,
  error => {
    console.error('API response error:', error?.response?.status, error?.response?.data);
    
    // Don't auto-redirect on 401 errors to prevent infinite logout loops
    // Just log the error and let the component handle it
    if (error.response && error.response.status === 401) {
      console.log('Authentication error detected, component should handle this');
    }
    
    // Handle CORS errors which won't have a proper response object
    if (error.message === 'Network Error') {
      console.error('Network or CORS error detected');
    }
    
    return Promise.reject(error);
  }
);

export default instance; 