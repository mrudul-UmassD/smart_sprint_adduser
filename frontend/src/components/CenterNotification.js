import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Alert } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/centerNotification.css';

/**
 * CenterNotification component and utility
 * 
 * This component displays notifications in the center of the screen
 * with an attractive design and automatically dismisses after 1.5 seconds.
 */

// Container for all notifications
const NotificationContainer = ({ children }) => (
  <div className="center-notification-container">
    <AnimatePresence>{children}</AnimatePresence>
  </div>
);

// Individual notification component
const NotificationItem = ({ message, type, onDismiss, id }) => {
  useEffect(() => {
    // Auto-dismiss after 1.5 seconds
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 1500);
    
    // Clean up the timer when the component unmounts
    return () => clearTimeout(timer);
  }, [onDismiss, id]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'danger':
        return '❌';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="center-notification-item"
    >
      <Alert 
        variant={type} 
        className="center-notification-alert"
      >
        <div className="notification-content">
          <span className="notification-icon">{getIcon()}</span>
          <span className="notification-message">{message}</span>
        </div>
      </Alert>
    </motion.div>
  );
};

// Notification Manager
class NotificationManager {
  static notifications = [];
  static counter = 0;
  static container = null;
  static root = null;
  
  static showNotification(message, type = 'info') {
    // Create notification ID
    const id = this.counter++;
    
    // Add new notification to the list
    this.notifications.push({ id, message, type });
    
    // Update UI
    this.render();
    
    // Return ID so it can be used to dismiss if needed
    return id;
  }
  
  static dismissNotification(id) {
    // Remove the notification with the given ID
    this.notifications = this.notifications.filter(notification => notification.id !== id);
    
    // Update UI
    this.render();
    
    // If no more notifications, clean up the DOM
    if (this.notifications.length === 0 && this.root) {
      setTimeout(() => {
        ReactDOM.unmountComponentAtNode(this.root);
        if (this.root.parentNode) {
          document.body.removeChild(this.root);
        }
        this.root = null;
      }, 300);
    }
  }
  
  static render() {
    // Create container if it doesn't exist
    if (!this.root) {
      this.root = document.createElement('div');
      document.body.appendChild(this.root);
    }
    
    // Render notifications
    ReactDOM.render(
      <NotificationContainer>
        {this.notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            id={notification.id}
            message={notification.message}
            type={notification.type}
            onDismiss={this.dismissNotification.bind(this)}
          />
        ))}
      </NotificationContainer>,
      this.root
    );
  }
}

// Helper functions to show different types of notifications
export const showSuccessNotification = (message) => NotificationManager.showNotification(message, 'success');
export const showErrorNotification = (message) => NotificationManager.showNotification(message, 'danger');
export const showWarningNotification = (message) => NotificationManager.showNotification(message, 'warning');
export const showInfoNotification = (message) => NotificationManager.showNotification(message, 'info');

// Default export is a general notification function
export default function notify(message, type = 'info') {
  return NotificationManager.showNotification(message, type);
} 