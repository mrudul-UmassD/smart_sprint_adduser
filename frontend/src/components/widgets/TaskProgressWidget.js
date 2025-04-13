import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ProgressBar, Badge } from 'react-bootstrap';
import BaseWidget from './BaseWidget';
import API_CONFIG from '../../config';

const TaskProgressWidget = ({ 
  title = 'My Tasks', 
  config = {}, 
  onRemove, 
  onConfigure 
}) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default to showing only the user's tasks, can be configured
  const { showAll = false, limit = 5, projectId = null } = config;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (!showAll) {
          params.append('assignedToMe', 'true');
        }
        if (projectId) {
          params.append('projectId', projectId);
        }
        params.append('limit', limit.toString());
        
        const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.TASKS_ENDPOINT}?${params.toString()}`);
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err.response?.data?.message || 'Failed to load tasks');
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [showAll, limit, projectId]);
  
  // Calculate task completion statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === 'done').length;
    const inProgress = tasks.filter(task => task.status === 'inProgress').length;
    const todo = tasks.filter(task => task.status === 'todo').length;
    
    return {
      total,
      completed,
      inProgress,
      todo,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };
  
  const stats = getTaskStats();
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'done':
        return <Badge bg="success">Completed</Badge>;
      case 'inProgress':
        return <Badge bg="primary">In Progress</Badge>;
      case 'review':
        return <Badge bg="info">In Review</Badge>;
      default:
        return <Badge bg="secondary">To Do</Badge>;
    }
  };

  return (
    <BaseWidget 
      title={title} 
      onRemove={onRemove} 
      onConfigure={onConfigure}
      loading={loading}
      error={error}
    >
      <div className="task-progress">
        <div className="d-flex justify-content-between mb-3">
          <div>
            <h6 className="mb-0">Completion Rate</h6>
            <small className="text-muted">{stats.completed} of {stats.total} tasks</small>
          </div>
          <div>
            <h3 className="mb-0">{stats.completionRate}%</h3>
          </div>
        </div>
        
        <ProgressBar className="mb-4">
          <ProgressBar variant="success" now={stats.completed} max={stats.total} key={1} />
          <ProgressBar variant="primary" now={stats.inProgress} max={stats.total} key={2} />
          <ProgressBar variant="secondary" now={stats.todo} max={stats.total} key={3} />
        </ProgressBar>
        
        <h6 className="mb-3">Recent Tasks</h6>
        {tasks.length > 0 ? (
          <ul className="list-group">
            {tasks.map(task => (
              <li key={task._id} className="list-group-item d-flex justify-content-between align-items-center p-2">
                <div className="task-title text-truncate" style={{ maxWidth: '70%' }}>
                  {task.title}
                </div>
                {getStatusBadge(task.status)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">No tasks available</p>
        )}
      </div>
    </BaseWidget>
  );
};

export default TaskProgressWidget; 