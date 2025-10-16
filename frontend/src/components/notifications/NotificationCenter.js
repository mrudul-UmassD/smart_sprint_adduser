import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button, Badge, Spinner } from 'react-bootstrap';
import { BiBell, BiCheck, BiTrash, BiX } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import * as NotificationService from './NotificationService';
import moment from 'moment';
import '../../styles/notifications.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Fetch notifications on component mount
  const fetchNotifications = useCallback(async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);
      
      setError(null);
      
      const data = await NotificationService.fetchNotifications(page, pagination.limit);
      
      if (append) {
        setNotifications(prev => [...prev, ...data.notifications]);
      } else {
        setNotifications(data.notifications);
      }
      
      setPagination({
        page: data.pagination.page,
        limit: data.pagination.limit,
        total: data.pagination.total,
        pages: data.pagination.pages
      });
      
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications every minute
    const intervalId = setInterval(() => {
      if (!showNotifications) { // Only poll when notification center is closed
        fetchNotifications();
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  // Handle clicks outside the notification panel to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notificationRef]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationService.markAsRead(notificationId);
      
      setNotifications(notifications.map(notification => 
        notification._id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await NotificationService.deleteNotification(notificationId);
      
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(notifications.filter(n => n._id !== notificationId));
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await NotificationService.clearAllNotifications();
      
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error clearing all notifications:', err);
    }
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      fetchNotifications(pagination.page + 1, true);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }
    
    // Navigate based on notification link if present
    if (notification.link) {
      navigate(notification.link);
    } else if (notification.relatedEntity && notification.relatedEntity.entityId) {
      // Navigate based on entity type
      const { entityType, entityId } = notification.relatedEntity;
      switch (entityType) {
        case 'task':
          navigate(`/tasks/${entityId}`);
          break;
        case 'project':
          navigate(`/projects/${entityId}`);
          break;
        case 'team':
          navigate(`/teams/${entityId}`);
          break;
        case 'report':
          navigate(`/reports/${entityId}`);
          break;
        default:
          // Do nothing for other entity types
          break;
      }
    }
    
    // Close notification panel after clicking
    setShowNotifications(false);
  };

  const getNotificationIcon = (notification) => {
    // First check if there's a custom icon specified
    if (notification.icon && notification.icon !== 'notification') {
      return <i className={`bi bi-${notification.icon}`}></i>;
    }
    
    // Otherwise use type-based icons
    switch (notification.type) {
      case 'task':
        return <i className="bi bi-check-square"></i>;
      case 'project':
        return <i className="bi bi-kanban"></i>;
      case 'team':
        return <i className="bi bi-people"></i>;
      case 'success':
        return <i className="bi bi-check-circle"></i>;
      case 'warning':
        return <i className="bi bi-exclamation-triangle"></i>;
      case 'error':
        return <i className="bi bi-x-circle"></i>;
      case 'system':
        return <i className="bi bi-gear"></i>;
      default:
        return <i className="bi bi-bell"></i>;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'project':
        return 'primary';
      case 'task':
        return 'info';
      case 'team':
        return 'secondary';
      case 'system':
        return 'dark';
      default:
        return 'primary';
    }
  };

  return (
    <div className={`notification-center ${theme}`} ref={notificationRef}>
      <Button 
        variant="link"
        className="notification-bell"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <BiBell size={20} />
        {unreadCount > 0 && (
          <Badge pill bg="danger" className="notification-badge">
            {unreadCount}
          </Badge>
        )}
      </Button>
      
      <div className={`notifications-dropdown ${showNotifications ? 'show' : ''}`}>
        <div className="notifications-header">
          <h5 className="mb-0">Notifications</h5>
          <div>
            {unreadCount > 0 && (
              <Button 
                variant="link" 
                size="sm"
                className="text-decoration-none p-0 me-2"
                onClick={handleMarkAllAsRead}
              >
                <BiCheck className="me-1" /> Mark all read
              </Button>
            )}
            <Button 
              variant="link" 
              size="sm"
              className="text-decoration-none p-0 me-2"
              onClick={handleClearAllNotifications}
            >
              <BiTrash className="me-1" /> Clear all
            </Button>
            <Button
              variant="link"
              size="sm"
              className="text-decoration-none p-0"
              onClick={() => setShowNotifications(false)}
            >
              <BiX />
            </Button>
          </div>
        </div>
        
        <div className="notifications-list">
          {loading && (
            <div className="text-center p-3">
              <Spinner animation="border" size="sm" />
            </div>
          )}
          
          {error && (
            <div className="text-danger p-3">{error}</div>
          )}
          
          {!loading && notifications.length === 0 && (
            <div className="notifications-empty">
              No notifications
            </div>
          )}
          
          {!loading && notifications.map(notification => (
            <div 
              key={notification._id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-content">
                <div className="notification-header">
                  <Badge bg={getNotificationColor(notification.type)} className="me-2">
                    {getNotificationIcon(notification)}
                  </Badge>
                  <div className="notification-title">{notification.title}</div>
                  <small className="notification-time">
                    {moment(notification.createdAt).fromNow()}
                  </small>
                </div>
                <div className="notification-body">
                  <p>{notification.message}</p>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification._id);
                      }}
                    >
                      <BiCheck /> Mark as read
                    </Button>
                  )}
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={(e) => handleDeleteNotification(e, notification._id)}
                  >
                    <BiTrash /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {!loading && pagination.page < pagination.pages && (
            <div className="text-center p-2">
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <><Spinner animation="border" size="sm" /> Loading...</>
                ) : (
                  'Load more'
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter; 