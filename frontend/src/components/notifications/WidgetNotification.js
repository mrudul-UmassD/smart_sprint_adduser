import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import '../../styles/notifications.css';

const WidgetNotification = ({ notification, onMarkAsRead, onDelete }) => {
  const { id, type, title, message, createdAt, read } = notification;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle color="#28a745" />;
      case 'warning':
        return <FaExclamationTriangle color="#ffc107" />;
      case 'error':
        return <FaTimesCircle color="#dc3545" />;
      case 'info':
      default:
        return <FaInfoCircle color="#17a2b8" />;
    }
  };

  const handleClick = () => {
    if (!read) {
      onMarkAsRead(id);
    }
  };

  const getTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'recently';
    }
  };

  return (
    <Card 
      className={`notification-card ${type} ${!read ? 'unread' : ''}`}
      onClick={handleClick}
    >
      <Card.Body className="p-0">
        <div className="notification-header">
          <div className="d-flex align-items-center">
            <span className="notification-icon">{getIcon()}</span>
            <div>
              <h6 className="notification-title">{title}</h6>
              <small className="notification-time">{getTimeAgo(createdAt)}</small>
            </div>
          </div>
          <Button 
            variant="link" 
            className="notification-close p-0" 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          >
            <FaTimes />
          </Button>
        </div>
        <div className="notification-content">
          {message}
        </div>
      </Card.Body>
    </Card>
  );
};

export default WidgetNotification; 