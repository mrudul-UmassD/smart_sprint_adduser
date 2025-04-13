import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { FaTasks, FaExclamationCircle, FaFilter, FaCheck, FaHourglass } from 'react-icons/fa';
import axios from 'axios';
import { getToken, removeTokenAndRedirect } from '../../utils/authUtils';
import { Link } from 'react-router-dom';

const TasksWidget = ({ config = {} }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  
  const limit = config.limit || 5; // Default to showing 5 tasks

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const token = getToken();
        
        if (!token) {
          removeTokenAndRedirect();
          return;
        }
        
        // Fetch assigned tasks for the current user
        const response = await axios.get('/api/tasks/my-tasks', {
          headers: { Authorization: `Bearer ${token}` },
          params: { limit, includeProject: true }
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
  }, [limit]);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Not Started':
        return 'secondary';
      case 'In Progress':
        return 'warning';
      case 'In Review':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Blocked':
        return 'danger';
      default:
        return 'light';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'Low':
        return 'info';
      case 'Medium':
        return 'warning';
      case 'High':
        return 'danger';
      case 'Critical':
        return 'dark';
      default:
        return 'light';
    }
  };

  const getFilteredTasks = () => {
    if (activeFilter === 'all') {
      return tasks;
    } else if (activeFilter === 'active') {
      return tasks.filter(task => 
        task.status === 'Not Started' || 
        task.status === 'In Progress' || 
        task.status === 'In Review'
      );
    } else if (activeFilter === 'completed') {
      return tasks.filter(task => task.status === 'Completed');
    } else if (activeFilter === 'high') {
      return tasks.filter(task => 
        task.priority === 'High' || 
        task.priority === 'Critical'
      );
    }
    return tasks;
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateOptions = { month: 'short', day: 'numeric' };
    
    if (date < today) {
      return <span className="text-danger">{date.toLocaleDateString(undefined, dateOptions)} (Overdue)</span>;
    } else if (date.getTime() === today.getTime()) {
      return <span className="text-warning">Today</span>;
    } else if (date.getTime() === tomorrow.getTime()) {
      return <span className="text-primary">Tomorrow</span>;
    }
    
    return date.toLocaleDateString(undefined, dateOptions);
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

  const filteredTasks = getFilteredTasks();

  return (
    <div className="tasks-widget h-100 d-flex flex-column">
      <h5 className="widget-title mb-3">
        <FaTasks className="me-2" />
        My Tasks
      </h5>
      
      <Card className="flex-grow-1">
        <Card.Body className="p-0 d-flex flex-column">
          <div className="filter-buttons p-2 d-flex">
            <Button 
              variant={activeFilter === 'all' ? 'primary' : 'outline-primary'} 
              size="sm"
              className="me-1"
              onClick={() => setActiveFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={activeFilter === 'active' ? 'primary' : 'outline-primary'} 
              size="sm"
              className="me-1"
              onClick={() => setActiveFilter('active')}
            >
              <FaHourglass className="me-1" />
              Active
            </Button>
            <Button 
              variant={activeFilter === 'completed' ? 'primary' : 'outline-primary'} 
              size="sm"
              className="me-1"
              onClick={() => setActiveFilter('completed')}
            >
              <FaCheck className="me-1" />
              Completed
            </Button>
            <Button 
              variant={activeFilter === 'high' ? 'primary' : 'outline-primary'} 
              size="sm"
              onClick={() => setActiveFilter('high')}
            >
              <FaExclamationCircle className="me-1" />
              High Priority
            </Button>
          </div>
          
          {filteredTasks.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-muted mb-0">No tasks found</p>
            </div>
          ) : (
            <div className="task-list-container flex-grow-1">
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Project</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => (
                    <tr key={task._id}>
                      <td>
                        <Link to={`/tasks/${task._id}`} className="text-decoration-none">
                          {task.title}
                        </Link>
                      </td>
                      <td>
                        {task.project ? (
                          <Link to={`/projects/${task.project._id}`} className="text-decoration-none">
                            {task.project.name}
                          </Link>
                        ) : (
                          <span className="text-muted">--</span>
                        )}
                      </td>
                      <td>
                        <Badge bg={getStatusVariant(task.status)}>
                          {task.status}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getPriorityVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                      </td>
                      <td>
                        {formatDueDate(task.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
          
          {tasks.length > 0 && (
            <div className="p-2 text-end border-top">
              <Link to="/tasks" className="btn btn-sm btn-outline-primary">
                View All Tasks
              </Link>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default TasksWidget; 