import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { FaBell, FaExclamationTriangle, FaInfoCircle, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WidgetNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications every 30 seconds
    const intervalId = setInterval(fetchNotifications, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await axios.get('/api/notifications/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && Array.isArray(response.data)) {
        // Only show unread notifications that are recent (less than 24 hours old)
        const now = new Date();
        const recentNotifications = response.data.filter(notification => {
          const createdAt = new Date(notification.createdAt);
          const hoursDiff = (now - createdAt) / (1000 * 60 * 60);
          return !notification.read && hoursDiff < 24;
        });
        
        setNotifications(recentNotifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // For demo purposes, add sample notifications if API fails
      if (loading) {
        setNotifications([
          {
            _id: '1',
            title: 'Task Update',
            message: 'Your "Database Migration" task deadline has been extended',
            type: 'info',
            createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
            relatedEntity: { type: 'task', id: '123' }
          },
          {
            _id: '2',
            title: 'Project Alert',
            message: 'Project "Smart Sprint" has 3 overdue tasks',
            type: 'warning',
            createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 minutes ago
            relatedEntity: { type: 'project', id: '456' }
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      await axios.put(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the notification from state
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n._id !== notificationId)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // For demo, just remove from state even if API fails
      setNotifications(prevNotifications => 
        prevNotifications.filter(n => n._id !== notificationId)
      );
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    
    // Navigate to relevant entity if available
    if (notification.relatedEntity) {
      const { type, id } = notification.relatedEntity;
      switch (type) {
        case 'task':
          navigate(`/tasks/${id}`);
          break;
        case 'project':
          navigate(`/projects/${id}`);
          break;
        case 'team':
          navigate(`/teams/${id}`);
          break;
        default:
          break;
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <FaExclamationTriangle className="text-warning" />;
      case 'success':
        return <FaCheck className="text-success" />;
      case 'info':
      default:
        return <FaInfoCircle className="text-info" />;
    }
  };

  // Don't render anything if there are no notifications
  if (notifications.length === 0) {
    return null;
  }

  return (
    <ToastContainer position="top-end" className="p-3 notification-container">
      {notifications.map(notification => (
        <Toast 
          key={notification._id} 
          onClose={() => markAsRead(notification._id)}
          onClick={() => handleNotificationClick(notification)}
          className="notification-toast"
          style={{ cursor: 'pointer' }}
        >
          <Toast.Header>
            <span className="me-2">{getNotificationIcon(notification.type)}</span>
            <strong className="me-auto">{notification.title}</strong>
            <small>
              {new Date(notification.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </small>
          </Toast.Header>
          <Toast.Body>{notification.message}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default WidgetNotifications; 