import axios from 'axios';

// Get the API URL from environment variables or use default
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Get auth header from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

// Fetch user notifications with pagination and filters
export const fetchNotifications = async (page = 1, limit = 10, filters = {}) => {
  try {
    let url = `${API_URL}/api/notifications?page=${page}&limit=${limit}`;
    
    // Add read status filter if provided
    if (filters.read !== undefined) {
      url += `&read=${filters.read}`;
    }
    
    // Add type filter if provided
    if (filters.type) {
      url += `&type=${filters.type}`;
    }
    
    const response = await axios.get(url, getAuthHeader());
    return response.data.data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Fetch recent unread notifications
export const fetchRecentNotifications = async (limit = 5) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/notifications/recent?limit=${limit}`,
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error fetching recent notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
  try {
    const response = await axios.put(
      `${API_URL}/api/notifications/${notificationId}/read`,
      {},
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await axios.put(
      `${API_URL}/api/notifications/mark-all-read`,
      {},
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/notifications/${notificationId}`,
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Clear all notifications
export const clearAllNotifications = async () => {
  try {
    const response = await axios.delete(
      `${API_URL}/api/notifications/clear-all`,
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    throw error;
  }
};

// Create a notification (for testing purposes)
export const createNotification = async (notification) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/notifications`,
      notification,
      getAuthHeader()
    );
    return response.data.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}; 