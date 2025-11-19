// API configuration
// Priority: REACT_APP_API_URL env var > production default > localhost
const getAPIUrl = () => {
  // Check for environment variable first (used in deployment)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Development environment - use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  
  // Production fallback (same domain)
  return '';
};

const API_CONFIG = {
  BASE_URL: getAPIUrl(),
  API_URL: getAPIUrl(),
  AUTH_ENDPOINT: '/api/auth',
  USERS_ENDPOINT: '/api/users',
  PROJECTS_ENDPOINT: '/api/projects',
  TASKS_ENDPOINT: '/api/tasks',
  ANALYTICS_ENDPOINT: '/api/analytics',
  REPORTS_ENDPOINT: '/api/reports',
  TEAMS_ENDPOINT: '/api/teams',
  SETTINGS_ENDPOINT: '/api/user-settings'
};

export default API_CONFIG; 