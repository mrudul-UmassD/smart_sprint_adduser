import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaBell, FaExclamationTriangle, FaInfo, FaCheck } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';

// Notification types with their icons and styles
const notificationTypes = {
  info: { icon: <FaInfo />, bg: 'primary', textColor: 'white' },
  warning: { icon: <FaExclamationTriangle />, bg: 'warning', textColor: 'dark' },
  success: { icon: <FaCheck />, bg: 'success', textColor: 'white' },
  error: { icon: <FaExclamationTriangle />, bg: 'danger', textColor: 'white' }
};

const WidgetNotifications = ({ widgetId, widgetType }) => {
  const [notifications, setNotifications] = useState([]);
  const { theme } = useTheme();
  
  // Generate mock notifications based on widget type
  useEffect(() => {
    const generateNotifications = () => {
      const mockNotifications = [];
      
      switch (widgetType) {
        case 'projectSummary':
          mockNotifications.push({
            id: `${widgetId}-1`,
            type: 'warning',
            title: 'Project Deadline Approaching',
            message: 'Project deadline is in 3 days.',
            timestamp: new Date()
          });
          break;
          
        case 'myTasks':
          mockNotifications.push({
            id: `${widgetId}-1`,
            type: 'info',
            title: 'New Task Assigned',
            message: 'You have been assigned a new task.',
            timestamp: new Date()
          });
          break;
          
        case 'burndownChart':
          mockNotifications.push({
            id: `${widgetId}-1`,
            type: 'warning',
            title: 'Behind Schedule',
            message: 'Project is falling behind the ideal burndown rate.',
            timestamp: new Date()
          });
          break;
          
        case 'teamPerformance':
          mockNotifications.push({
            id: `${widgetId}-1`,
            type: 'success',
            title: 'Team Performance Improved',
            message: 'Team completion rate increased by 15% this week.',
            timestamp: new Date()
          });
          break;
          
        default:
          break;
      }
      
      setNotifications(mockNotifications);
    };
    
    generateNotifications();
    
    // In a real application, you would set up a socket or polling mechanism here
    // to receive updates for this specific widget
  }, [widgetId, widgetType]);
  
  const handleClose = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };
  
  if (notifications.length === 0) {
    return null;
  }
  
  return (
    <ToastContainer 
      className="position-absolute p-3" 
      style={{ top: 0, right: 0, zIndex: 10 }}
    >
      {notifications.map(notification => {
        const { icon, bg, textColor } = notificationTypes[notification.type] || notificationTypes.info;
        
        return (
          <Toast 
            key={notification.id} 
            onClose={() => handleClose(notification.id)}
            delay={8000}
            autohide
            bg={bg}
            className={`text-${textColor} mb-2 shadow-sm`}
          >
            <Toast.Header className={`bg-${bg} text-${textColor}`}>
              <span className="me-1">{icon}</span>
              <strong className="me-auto">{notification.title}</strong>
              <small>{new Date(notification.timestamp).toLocaleTimeString()}</small>
            </Toast.Header>
            <Toast.Body>{notification.message}</Toast.Body>
          </Toast>
        );
      })}
    </ToastContainer>
  );
};

export default WidgetNotifications; 