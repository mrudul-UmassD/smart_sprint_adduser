import axios from 'axios';
import API_CONFIG from '../config';

// Set base URL
axios.defaults.baseURL = API_CONFIG.BASE_URL;

// Add request interceptor to set auth token for all requests
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set token in both formats to ensure compatibility
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API response error:', error?.response?.status, error?.response?.data);
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log('Authentication error detected. Logging out.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle CORS errors which won't have a proper response object
    if (error.message === 'Network Error') {
      console.error('Network or CORS error detected');
    }
    
    return Promise.reject(error);
  }
);

export default axios; 