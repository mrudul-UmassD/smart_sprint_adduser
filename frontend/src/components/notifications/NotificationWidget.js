import React, { useState, useEffect, useRef } from 'react';
import { Badge, Button, Spinner } from 'react-bootstrap';
import { BsBell, BsCheck, BsTrash, BsX } from 'react-icons/bs';
import { fetchNotifications, markAsRead, deleteNotification, clearAllNotifications } from './NotificationService';
import '../../styles/notifications.css';

const NotificationWidget = ({ onWidgetRemove }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const panelRef = useRef(null);

  // Fetch notifications when component mounts
  useEffect(() => {
    const getNotifications = async () => {
      setLoading(true);
      try {
        const data = await fetchNotifications();
        setNotifications(data);
        setError(null);
      } catch (err) {
        setError('Failed to load notifications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getNotifications();
    
    // Set up polling for new notifications (every 30 seconds)
    const interval = setInterval(getNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;

  // Handle marking a notification as read
  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(notif => 
        notif._id === id ? { ...notif, read: true } : notif
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Handle deleting a notification
  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(notif => notif._id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  // Handle clearing all notifications
  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  // Format date for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task':
        return '📋';
      case 'project':
        return '📁';
      case 'team':
        return '👥';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="widget-notifications">
      <div className="widget-header d-flex justify-content-between align-items-center mb-2">
        <h5>Notifications</h5>
        {onWidgetRemove && (
          <Button 
            variant="outline-danger" 
            size="sm" 
            onClick={onWidgetRemove}
            className="remove-widget-btn"
          >
            <BsX />
          </Button>
        )}
      </div>

      <div className="position-relative" ref={panelRef}>
        <Button 
          className="notification-toggle" 
          variant="outline-secondary" 
          onClick={() => setShowPanel(!showPanel)}
        >
          <BsBell />
          {unreadCount > 0 && (
            <Badge className="notification-badge" pill bg="danger">
              {unreadCount}
            </Badge>
          )}
        </Button>

        {showPanel && (
          <div className="notification-panel">
            <div className="notification-header">
              <span>Notifications</span>
              {notifications.length > 0 && (
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={handleClearAll}
                  className="clear-all"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="notification-body">
              {loading && (
                <div className="text-center p-3">
                  <Spinner animation="border" size="sm" />
                </div>
              )}

              {error && (
                <div className="text-danger p-3 text-center">
                  {error}
                </div>
              )}

              {!loading && !error && notifications.length === 0 && (
                <div className="text-center p-3 text-muted">
                  No notifications
                </div>
              )}

              {!loading && !error && notifications.map(notification => (
                <div 
                  key={notification._id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTime(notification.createdAt)}</div>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <BsCheck />
                      </Button>
                    )}
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => handleDelete(notification._id)}
                      title="Delete"
                    >
                      <BsTrash />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationWidget; 