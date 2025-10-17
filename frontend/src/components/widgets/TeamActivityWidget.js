import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { Group, Person, Assignment, Schedule } from '@mui/icons-material';
import axios from 'axios';

const TeamActivityWidget = ({ config = {}, onRemove, onUpdateConfig, onToggleFullscreen }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeamActivity();
  }, [config]);

  const fetchTeamActivity = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for team activity - replace with actual API call
      const mockActivities = [
        {
          id: 1,
          user: 'John Doe',
          action: 'completed task',
          target: 'Implement user authentication',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          type: 'task_completed'
        },
        {
          id: 2,
          user: 'Jane Smith',
          action: 'created task',
          target: 'Design dashboard layout',
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
          type: 'task_created'
        },
        {
          id: 3,
          user: 'Mike Johnson',
          action: 'commented on',
          target: 'Fix login bug',
          timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
          type: 'comment'
        },
        {
          id: 4,
          user: 'Sarah Wilson',
          action: 'started working on',
          target: 'API integration',
          timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
          type: 'task_started'
        },
        {
          id: 5,
          user: 'David Brown',
          action: 'updated project',
          target: 'Smart Sprint Dashboard',
          timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
          type: 'project_updated'
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setActivities(mockActivities);
    } catch (err) {
      console.error('Error fetching team activity:', err);
      setError('Failed to load team activity');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed':
        return <Assignment className="text-success" />;
      case 'task_created':
        return <Assignment className="text-primary" />;
      case 'task_started':
        return <Schedule className="text-warning" />;
      case 'comment':
        return <Person className="text-info" />;
      case 'project_updated':
        return <Group className="text-secondary" />;
      default:
        return <Person className="text-muted" />;
    }
  };

  const getActivityBadge = (type) => {
    switch (type) {
      case 'task_completed':
        return <Badge bg="success">Completed</Badge>;
      case 'task_created':
        return <Badge bg="primary">Created</Badge>;
      case 'task_started':
        return <Badge bg="warning">Started</Badge>;
      case 'comment':
        return <Badge bg="info">Comment</Badge>;
      case 'project_updated':
        return <Badge bg="secondary">Updated</Badge>;
      default:
        return <Badge bg="light">Activity</Badge>;
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  if (loading) {
    return (
      <Card className="h-100">
        <Card.Header className="d-flex align-items-center">
          <Group className="me-2" />
          <span>Team Activity</span>
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-100">
        <Card.Header className="d-flex align-items-center">
          <Group className="me-2" />
          <span>Team Activity</span>
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <Group className="me-2" />
          <span>Team Activity</span>
        </div>
        <small className="text-muted">Recent activity from your team</small>
      </Card.Header>
      <Card.Body className="p-0">
        <ListGroup variant="flush">
          {activities.map((activity) => (
            <ListGroup.Item key={activity.id} className="d-flex align-items-center">
              <div className="me-3">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{activity.user}</strong> {activity.action}{' '}
                    <span className="text-primary">{activity.target}</span>
                  </div>
                  <div className="d-flex flex-column align-items-end">
                    {getActivityBadge(activity.type)}
                    <small className="text-muted mt-1">
                      {formatTimestamp(activity.timestamp)}
                    </small>
                  </div>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
        {activities.length === 0 && (
          <div className="text-center p-4">
            <Group className="text-muted mb-2" style={{ fontSize: '2rem' }} />
            <p className="text-muted">No recent team activity</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TeamActivityWidget;