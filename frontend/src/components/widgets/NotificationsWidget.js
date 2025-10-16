import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Button, Spinner } from 'react-bootstrap';
import { useNotifications } from '../../contexts/NotificationContext';
import { FaBell, FaCheck, FaTrash } from 'react-icons/fa';
import axios from 'axios';

/**
 * NotificationsWidget Component
 * 
 * Displays a list of notifications in a dashboard widget
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - The widget title
 * @param {function} props.onRemove - Function to remove the widget
 * @param {function} props.onConfigure - Function to configure the widget
 * @param {Object} props.config - Widget configuration
 */
const NotificationsWidget = ({ title, onRemove, onConfigure, config = {} }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { markAsRead, deleteNotification } = useNotifications();
  
  // Number of notifications to display
  const limit = config.limit || 5;
  const filter = config.filter || 'all'; // 'all', 'unread', 'read'
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');
        
        let url = `${process.env.REACT_APP_API_URL}/api/notifications`;
        
        // Add query parameters based on config
        const params = new URLSearchParams();
        params.append('limit', limit);
        
        if (filter !== 'all') {
          params.append('read', filter === 'read');
        }
        
        // Add the query parameters to the URL
        url += `?${params.toString()}`;
        
        const response = await axios.get(url, {
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
    
    fetchNotifications();
    
    // Set up polling interval
    const interval = setInterval(fetchNotifications, 60000); // Poll every minute
    
    return () => clearInterval(interval);
  }, [limit, filter]);
  
  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };
  
  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      // Update local state
      setNotifications(prev => 
        prev.filter(notif => notif.id !== id)
      );
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'warning':
        return <span className="text-warning">⚠️</span>;
      case 'error':
        return <span className="text-danger">❌</span>;
      case 'update':
        return <span className="text-info">🔄</span>;
      case 'success':
        return <span className="text-success">✅</span>;
      default:
        return <span className="text-primary">📌</span>;
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center p-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading notifications...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="text-center p-4 text-danger">
          <p>{error}</p>
          <Button variant="outline-primary" size="sm" onClick={() => setLoading(true)}>
            Try again
          </Button>
        </div>
      );
    }
    
    if (notifications.length === 0) {
      return (
        <div className="text-center p-4">
          <p className="mb-0">No notifications</p>
        </div>
      );
    }
    
    return (
      <ListGroup variant="flush">
        {notifications.map(notification => (
          <ListGroup.Item 
            key={notification.id}
            className={!notification.read ? 'unread-notification' : ''}
            style={{
              backgroundColor: !notification.read ? '#f8f9fa' : 'white',
              borderLeft: !notification.read ? '3px solid #007bff' : 'none',
              padding: '10px'
            }}
          >
            <div className="d-flex align-items-start">
              <div className="me-2 mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                  <h6 className="mb-1">{notification.title}</h6>
                  <small className="text-muted ms-2">
                    {formatTimestamp(notification.createdAt)}
                  </small>
                </div>
                <p className="mb-1">{notification.message}</p>
                <div className="d-flex justify-content-end mt-1">
                  {!notification.read && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 me-3 text-primary" 
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <FaCheck size={14} /> Mark read
                    </Button>
                  )}
                  <Button 
                    variant="link" 
                    size="sm" 
                    className="p-0 text-danger" 
                    onClick={() => handleDelete(notification.id)}
                  >
                    <FaTrash size={14} /> Delete
                  </Button>
                </div>
              </div>
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    );
  };
  
  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <Card className="h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <FaBell className="me-2" />
          <h5 className="mb-0">{title || 'Notifications'}</h5>
          {unreadCount > 0 && (
            <Badge bg="danger" className="ms-2">
              {unreadCount}
            </Badge>
          )}
        </div>
        <div>
          {onConfigure && (
            <Button variant="link" className="p-0 me-2" onClick={onConfigure}>
              ⚙️
            </Button>
          )}
          {onRemove && (
            <Button variant="link" className="p-0 text-danger" onClick={onRemove}>
              ✕
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body className="p-0" style={{ overflowY: 'auto' }}>
        {renderContent()}
      </Card.Body>
    </Card>
  );
};

export default NotificationsWidget; 