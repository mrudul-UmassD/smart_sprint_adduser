/**
 * NotificationUtils.js
 * 
 * Utility functions for displaying notifications in the application
 * This file provides an easy-to-use interface for showing notifications
 * across the application.
 */

import notify, { 
  showSuccessNotification, 
  showErrorNotification, 
  showWarningNotification, 
  showInfoNotification 
} from '../components/CenterNotification';

// Re-export all notification functions
export { 
  showSuccessNotification, 
  showErrorNotification, 
  showWarningNotification, 
  showInfoNotification 
};

/**
 * Show a notification in the center of the screen
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, warning, info)
 * @returns {number} The notification ID
 */
export const showNotification = (message, type = 'info') => {
  return notify(message, type);
};

/**
 * Show a success notification
 * @param {string} message - The notification message
 * @returns {number} The notification ID
 */
export const showSuccess = (message) => {
  return showSuccessNotification(message);
};

/**
 * Show an error notification
 * @param {string} message - The notification message
 * @returns {number} The notification ID
 */
export const showError = (message) => {
  return showErrorNotification(message);
};

/**
 * Show a warning notification
 * @param {string} message - The notification message
 * @returns {number} The notification ID
 */
export const showWarning = (message) => {
  return showWarningNotification(message);
};

/**
 * Show an info notification
 * @param {string} message - The notification message
 * @returns {number} The notification ID
 */
export const showInfo = (message) => {
  return showInfoNotification(message);
};

/**
 * Show a notification for API operations
 * @param {Object} options - Options for the notification
 * @param {string} options.operation - The operation that was performed
 * @param {boolean} options.success - Whether the operation was successful
 * @param {string} options.entityName - The name of the entity that was operated on
 * @param {string} options.errorMessage - The error message if the operation failed
 */
export const showApiNotification = ({ 
  operation = 'Operation', 
  success = true, 
  entityName = 'item', 
  errorMessage = 'An error occurred' 
}) => {
  if (success) {
    showSuccessNotification(`${operation} ${entityName} successful`);
  } else {
    showErrorNotification(`${operation} ${entityName} failed: ${errorMessage}`);
  }
};

// Named object for default export
const NotificationUtils = {
  showNotification,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showApiNotification
};

export default NotificationUtils;