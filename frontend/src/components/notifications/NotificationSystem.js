import React, { useState, useEffect, useContext } from 'react';
import { Toast, ToastContainer, Button, Badge } from 'react-bootstrap';
import { BsBell, BsBellFill } from 'react-icons/bs';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/notifications.css';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.id) {
      fetchNotifications();
      // Set up polling to check for new notifications every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setNotifications(response.data);
      countUnread(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const countUnread = (notifs) => {
    const count = notifs.filter(notif => !notif.read).length;
    setUnreadCount(count);
    
    // Update the favicon badge if supported
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        navigator.setAppBadge(count).catch(e => console.error(e));
      } else {
        navigator.clearAppBadge().catch(e => console.error(e));
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.put('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.delete(`/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update the local state
      const updatedNotifications = notifications.filter(notification => notification.id !== id);
      setNotifications(updatedNotifications);
      countUnread(updatedNotifications);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'project':
        return '🏢';
      case 'task':
        return '📋';
      case 'team':
        return '👥';
      case 'system':
        return '⚙️';
      default:
        return '📌';
    }
  };

  const handleToastClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Handle navigation based on notification type
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div className="widget-notifications">
      <div className="notification-toggle">
        <Button
          variant="light"
          className="notification-button"
          onClick={toggleNotifications}
          aria-label="Notifications"
        >
          {unreadCount > 0 ? <BsBellFill /> : <BsBell />}
          {unreadCount > 0 && (
            <Badge bg="danger" pill className="notification-badge">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      <ToastContainer 
        className={`notifications-container ${showNotifications ? 'show' : ''}`}
        position="top-end"
      >
        <div className="d-flex justify-content-between align-items-center p-2 border-bottom">
          <h6 className="m-0">Notifications</h6>
          {notifications.length > 0 && (
            <Button variant="link" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-3 text-center text-muted">
            No notifications
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <Toast 
                key={notification.id} 
                className={notification.read ? 'read' : 'unread'}
                onClick={() => handleToastClick(notification)}
              >
                <Toast.Header closeButton={false}>
                  <span className="me-2">{getNotificationIcon(notification.type)}</span>
                  <strong className="me-auto">{notification.title}</strong>
                  <small>{new Date(notification.createdAt).toLocaleTimeString()}</small>
                  <Button
                    variant="link"
                    className="p-0 ms-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    &times;
                  </Button>
                </Toast.Header>
                <Toast.Body>
                  {notification.message}
                  {!notification.read && (
                    <div className="mt-1">
                      <Badge bg="info" pill>New</Badge>
                    </div>
                  )}
                </Toast.Body>
              </Toast>
            ))}
          </div>
        )}
      </ToastContainer>
    </div>
  );
};

export default NotificationSystem; 