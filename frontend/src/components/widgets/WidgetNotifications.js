import React, { useState } from 'react';
import { Badge, Button, Card, Dropdown, ListGroup, Spinner } from 'react-bootstrap';
import { FaBell, FaCheck, FaCheckDouble, FaTrash } from 'react-icons/fa';
import { useNotifications } from '../../contexts/NotificationContext';
import { useTheme } from '../../contexts/ThemeContext';

const WidgetNotifications = () => {
  const { isDarkMode } = useTheme();
  const { 
    notifications, 
    unreadCount, 
    loading, 
    error,
    markAsRead, 
    deleteNotification, 
    markAllAsRead, 
    fetchNotifications 
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (isOpen) => {
    setIsOpen(isOpen);
    if (isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = (e, id) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteNotification(id);
  };

  const handleMarkAllAsRead = (e) => {
    e.stopPropagation();
    markAllAsRead();
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

  return (
    <Dropdown onToggle={handleToggle} show={isOpen} align="end">
      <Dropdown.Toggle 
        variant={isDarkMode ? "dark" : "light"} 
        id="widget-notifications-dropdown" 
        className="position-relative"
      >
        <FaBell />
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            className="position-absolute" 
            style={{ 
              top: '-8px', 
              right: '-8px', 
              fontSize: '0.6rem' 
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu 
        className={`notification-menu ${isDarkMode ? 'bg-dark text-light' : 'bg-light text-dark'}`}
        style={{ 
          width: '350px', 
          maxHeight: '500px',
          overflow: 'hidden',
          padding: 0
        }}
      >
        <Card className={`border-0 ${isDarkMode ? 'bg-dark text-white' : 'bg-light text-dark'}`}>
          <Card.Header className="d-flex justify-content-between align-items-center py-2">
            <h6 className="mb-0">Widget Notifications</h6>
            <div>
              <Button 
                variant={isDarkMode ? "outline-light" : "outline-dark"} 
                size="sm" 
                onClick={handleMarkAllAsRead}
                disabled={loading || notifications.length === 0 || notifications.every(n => n.read)}
                className="me-1"
              >
                <FaCheckDouble size={14} /> Mark all read
              </Button>
              <Button 
                variant={isDarkMode ? "outline-light" : "outline-dark"} 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  fetchNotifications();
                }}
                disabled={loading}
              >
                🔄
              </Button>
            </div>
          </Card.Header>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center p-4">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="text-center p-4 text-danger">
                <p>{error}</p>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchNotifications();
                  }}
                >
                  Try again
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center p-4">
                <p className="mb-0">No notifications</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {notifications.map(notification => (
                  <ListGroup.Item 
                    key={notification.id}
                    className={`border-bottom ${isDarkMode ? 'bg-dark text-white' : ''} ${!notification.read ? 'unread-notification' : ''}`}
                    style={{
                      backgroundColor: !notification.read 
                        ? (isDarkMode ? '#2c3b41' : '#f8f9fa') 
                        : (isDarkMode ? '#343a40' : 'white'),
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
                              onClick={(e) => handleMarkAsRead(e, notification.id)}
                            >
                              <FaCheck size={14} /> Mark read
                            </Button>
                          )}
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 text-danger" 
                            onClick={(e) => handleDelete(e, notification.id)}
                          >
                            <FaTrash size={14} /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        </Card>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default WidgetNotifications; 