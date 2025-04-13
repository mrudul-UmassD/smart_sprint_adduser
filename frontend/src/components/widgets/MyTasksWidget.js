import React, { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { getToken, removeTokenAndRedirect } from '../../utils/authUtils';

const MyTasksWidget = ({ config = {} }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { limit = 5, projectId } = config;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const token = getToken();
        
        if (!token) {
          removeTokenAndRedirect();
          return;
        }

        let url = '/api/tasks/my-tasks';
        const params = { limit };
        
        if (projectId) {
          params.projectId = projectId;
        }
        
        const response = await axios.get(url, {
          params,
          headers: { Authorization: `Bearer ${token}` }
        });

        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        
        if (err.response && err.response.status === 401) {
          removeTokenAndRedirect();
        } else {
          setError(err.response?.data?.message || 'Failed to load tasks');
          setLoading(false);
        }
      }
    };

    fetchTasks();
  }, [limit, projectId]);

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'in progress': return 'warning';
      case 'to do': return 'secondary';
      case 'blocked': return 'danger';
      default: return 'info';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!tasks || tasks.length === 0) {
    return <Alert variant="info">No tasks found</Alert>;
  }

  return (
    <div className="h-100 d-flex flex-column">
      <h5 className="widget-title">My Tasks</h5>
      
      <div className="table-responsive flex-grow-1">
        <Table hover size="sm" className="mb-0">
          <thead>
            <tr>
              <th>Title</th>
              <th>Project</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Due Date</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task._id}>
                <td className="text-truncate" style={{ maxWidth: '120px' }}>{task.title}</td>
                <td className="text-truncate" style={{ maxWidth: '100px' }}>{task.project?.name || '-'}</td>
                <td>
                  <Badge bg={getStatusVariant(task.status)}>{task.status}</Badge>
                </td>
                <td>
                  <Badge bg={getPriorityVariant(task.priority)}>{task.priority}</Badge>
                </td>
                <td>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default MyTasksWidget; 