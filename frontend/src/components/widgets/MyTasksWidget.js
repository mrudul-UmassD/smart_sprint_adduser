import React, { useEffect, useState } from 'react';
import { Spinner, Alert, Badge } from 'react-bootstrap';
import axios from '../../utils/axiosConfig';

const MyTasksWidget = ({ config }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`/api/tasks/my-tasks?limit=${config.limit || 5}`);
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Could not load tasks data');
        setLoading(false);
      }
    };

    fetchTasks();
  }, [config?.limit]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (tasks.length === 0) return <Alert variant="info">No tasks assigned to you</Alert>;

  // Helper function for priority colors
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  // Helper function for status badges
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      case 'in progress':
        return <Badge bg="primary">In Progress</Badge>;
      case 'under review':
        return <Badge bg="info">Under Review</Badge>;
      case 'not started':
        return <Badge bg="secondary">Not Started</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="tasks-widget h-100">
      <h5>My Tasks</h5>
      <div className="task-list mt-3">
        {tasks.map(task => (
          <div key={task._id} className="task-item mb-2 p-2 border-bottom">
            <div className="d-flex justify-content-between">
              <div className="task-name">{task.title}</div>
              <Badge bg={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
            </div>
            <div className="d-flex justify-content-between mt-1">
              <div className="task-project text-muted small">
                {task.project?.name || 'No Project'}
              </div>
              <div>
                {getStatusBadge(task.status)}
              </div>
            </div>
            <div className="task-due small mt-1">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTasksWidget;