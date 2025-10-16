import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Spinner, Button, Badge } from 'react-bootstrap';
import { BsBell, BsTrash, BsCheckCircle, BsThreeDots } from 'react-icons/bs';
import { format, formatDistanceToNow } from 'date-fns';
import '../../styles/notifications.css';

const DashboardNotificationWidget = ({ 
  onRemove, 
  onUpdateConfig, 
  isFullScreen, 
  toggleFullScreen, 
  config 
}) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const limit = config?.limit || 5;

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling every 60 seconds
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, [config, limit]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`/api/notifications?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update the local state to mark the notification as read
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the notification from local state
      setNotifications(notifications.filter(
        notification => notification._id !== notificationId
      ));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    
    // If less than 24 hours ago, show relative time
    if (Date.now() - date.getTime() < 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true });
    }
    
    // Otherwise show the actual date
    return format(date, 'MMM d, yyyy');
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return <BsCheckCircle className="text-success" />;
      case 'project':
        return <BsThreeDots className="text-primary" />;
      case 'system':
        return <BsBell className="text-warning" />;
      default:
        return <BsBell className="text-secondary" />;
    }
  };

  const renderContent = () => {
    if (loading && notifications.length === 0) {
      return (
        <div className="d-flex justify-content-center align-items-center p-4">
          <Spinner animation="border" variant="primary" size="sm" />
          <span className="ms-2">Loading notifications...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-4 text-danger">
          <p>{error}</p>
          <Button variant="outline-primary" size="sm" onClick={fetchNotifications}>
            Retry
          </Button>
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="text-center p-4 text-muted">
          <p>No notifications yet</p>
        </div>
      );
    }

    return (
      <div className="notification-items">
        {notifications.map(notification => (
          <div 
            key={notification._id} 
            className={`notification-item ${notification.read ? '' : 'unread'}`}
            onClick={() => !notification.read && markAsRead(notification._id)}
          >
            <div className="notification-icon">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="notification-content">
              <div className="notification-title">
                {notification.title}
                {!notification.read && (
                  <Badge bg="primary" pill className="ms-2" style={{ fontSize: '0.6rem' }}>
                    New
                  </Badge>
                )}
              </div>
              <div className="notification-message">{notification.message}</div>
              <div className="notification-time">{formatTime(notification.createdAt)}</div>
            </div>
            <div className="notification-actions">
              <Button
                variant="link"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notification._id);
                }}
                aria-label="Delete notification"
              >
                <BsTrash />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <BsBell className="me-2" />
          <h6 className="mb-0">Recent Notifications</h6>
        </div>
        <div>
          <Button
            variant="link"
            size="sm"
            className="p-0 me-2"
            onClick={fetchNotifications}
            title="Refresh notifications"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button
            variant="link"
            size="sm"
            className="p-0 me-2"
            onClick={() => onUpdateConfig(config)}
            title="Configure widget"
          >
            <i className="bi bi-gear"></i>
          </Button>
          <Button
            variant="link"
            size="sm"
            className="p-0 me-2"
            onClick={toggleFullScreen}
            title={isFullScreen ? "Exit full screen" : "Full screen"}
          >
            <i className={`bi ${isFullScreen ? "bi-fullscreen-exit" : "bi-fullscreen"}`}></i>
          </Button>
          <Button
            variant="link"
            size="sm"
            className="p-0 text-danger"
            onClick={onRemove}
            title="Remove widget"
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="p-0 overflow-auto">
        {renderContent()}
      </Card.Body>
      <Card.Footer className="text-end">
        <Button variant="link" size="sm" onClick={() => window.location.href = '/notifications'}>
          View all notifications
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default DashboardNotificationWidget;