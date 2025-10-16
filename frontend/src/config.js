// API configuration
const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000',
  API_URL: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000',
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