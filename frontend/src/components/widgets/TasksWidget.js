import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Table, Badge, Alert, Spinner, Button, Form, Row, Col, Dropdown } from 'react-bootstrap';
import { FiSettings, FiTrash2, FiMaximize2, FiRefreshCw, FiFilter, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { format, isAfter, isBefore, addDays } from 'date-fns';

const TasksWidget = ({
  config,
  onRemove,
  onConfigUpdate,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: 'dueDate',
    direction: 'asc'
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    dueDate: ''
  });

  // Destructure config with defaults
  const { userId, limit = 10, projectId } = config || {};

  useEffect(() => {
    fetchTasks();
  }, [userId, projectId, limit, fetchTasks]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [tasks, filters, sortConfig]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      let url = '/api/tasks';
      const params = new URLSearchParams();
      
      // Apply filters based on config
      if (userId) {
        params.append('assignedTo', userId);
      }
      
      if (projectId) {
        params.append('projectId', projectId);
      }
      
      if (filters.status) {
        params.append('status', filters.status);
      }
      
      if (filters.priority) {
        params.append('priority', filters.priority);
      }
      
      params.append('limit', limit);

      const response = await axios.get(url, {
        params,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStatusVariant = (status) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'primary';
      case 'review':
        return 'info';
      case 'blocked':
        return 'danger';
      case 'to do':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getPriorityVariant = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getDueDateStatus = (dueDate) => {
    if (!dueDate) return '';
    
    try {
      const today = new Date();
      const due = new Date(dueDate);
      
      if (isBefore(due, today)) {
        return 'text-danger'; // Overdue
      } else if (isBefore(due, addDays(today, 2))) {
        return 'text-warning'; // Due soon
      }
      return '';
    } catch (e) {
      return '';
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFiltersAndSort = () => {
    let filtered = [...tasks];
    
    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(task => 
        task.status.toLowerCase() === filters.status.toLowerCase()
      );
    }
    
    // Apply priority filter
    if (filters.priority) {
      filtered = filtered.filter(task => 
        task.priority.toLowerCase() === filters.priority.toLowerCase()
      );
    }
    
    // Apply due date filter
    if (filters.dueDate) {
      const today = new Date();
      const tomorrow = addDays(today, 1);
      const nextWeek = addDays(today, 7);
      
      switch (filters.dueDate) {
        case 'overdue':
          filtered = filtered.filter(task => 
            task.dueDate && isBefore(new Date(task.dueDate), today)
          );
          break;
        case 'today':
          filtered = filtered.filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return (
              dueDate.getDate() === today.getDate() &&
              dueDate.getMonth() === today.getMonth() &&
              dueDate.getFullYear() === today.getFullYear()
            );
          });
          break;
        case 'tomorrow':
          filtered = filtered.filter(task => {
            if (!task.dueDate) return false;
            const dueDate = new Date(task.dueDate);
            return (
              dueDate.getDate() === tomorrow.getDate() &&
              dueDate.getMonth() === tomorrow.getMonth() &&
              dueDate.getFullYear() === tomorrow.getFullYear()
            );
          });
          break;
        case 'week':
          filtered = filtered.filter(task => 
            task.dueDate && 
            isAfter(new Date(task.dueDate), today) && 
            isBefore(new Date(task.dueDate), nextWeek)
          );
          break;
        default:
          break;
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let compareA, compareB;
      
      // Handle different data types for sorting
      switch (sortConfig.key) {
        case 'title':
          compareA = a.title || '';
          compareB = b.title || '';
          break;
        case 'status':
          compareA = a.status || '';
          compareB = b.status || '';
          break;
        case 'priority':
          compareA = a.priority || '';
          compareB = b.priority || '';
          break;
        case 'dueDate':
          compareA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
          compareB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
          break;
        default:
          compareA = a[sortConfig.key] || '';
          compareB = b[sortConfig.key] || '';
      }
      
      if (compareA < compareB) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (compareA > compareB) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredTasks(filtered);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      dueDate: ''
    });
  };

  const getTableHeight = () => {
    if (isFullscreen) {
      return 'calc(100vh - 300px)';
    }
    
    // Calculate based on the number of tasks to display
    const rowHeight = 50; // approximate height of each row in pixels
    const headerHeight = 56; // approximate height of the table header
    const minHeight = 200; // minimum height
    
    const calculatedHeight = Math.min(
      filteredTasks.length * rowHeight + headerHeight,
      400 // maximum non-fullscreen height
    );
    
    return Math.max(calculatedHeight, minHeight) + 'px';
  };

  const getDefaultTaskFilter = () => {
    if (userId) {
      return "My Tasks";
    } else if (projectId) {
      return "Project Tasks";
    }
    return "All Tasks";
  };

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (tasks.length === 0) return <Alert variant="info">No tasks found with the current filters</Alert>;

  return (
    <Card className="dashboard-widget tasks-widget h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{getDefaultTaskFilter()}</h5>
        <div className="widget-controls d-flex">
          <Button 
            variant="link" 
            className="p-0 me-2" 
            onClick={() => setFilterVisible(!filterVisible)}
            title="Toggle filters"
          >
            <FiFilter />
          </Button>
          <Button 
            variant="link" 
            className="p-0 me-2" 
            onClick={fetchTasks}
            title="Refresh data"
          >
            <FiRefreshCw />
          </Button>
          <Button 
            variant="link" 
            className="p-0 me-2" 
            onClick={() => onConfigUpdate(config)}
            title="Configure widget"
          >
            <FiSettings />
          </Button>
          <Button 
            variant="link" 
            className="p-0 me-2" 
            onClick={onToggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            <FiMaximize2 />
          </Button>
          <Button 
            variant="link" 
            className="p-0 text-danger" 
            onClick={onRemove}
            title="Remove widget"
          >
            <FiTrash2 />
          </Button>
        </div>
      </Card.Header>
      
      {filterVisible && (
        <Card.Body className="py-2 border-bottom">
          <Row className="align-items-end g-2">
            <Col xs={12} md={3}>
              <Form.Group controlId="statusFilter">
                <Form.Label className="small">Status</Form.Label>
                <Form.Select 
                  size="sm" 
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="to do">To Do</option>
                  <option value="in progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="blocked">Blocked</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={3}>
              <Form.Group controlId="priorityFilter">
                <Form.Label className="small">Priority</Form.Label>
                <Form.Select 
                  size="sm" 
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={3}>
              <Form.Group controlId="dueDateFilter">
                <Form.Label className="small">Due Date</Form.Label>
                <Form.Select 
                  size="sm" 
                  value={filters.dueDate}
                  onChange={(e) => handleFilterChange('dueDate', e.target.value)}
                >
                  <option value="">All Dates</option>
                  <option value="overdue">Overdue</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">This Week</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={3} className="text-end">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={clearFilters}
                className="mt-md-0 mt-2"
              >
                Clear Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      )}
      
      <Card.Body className="p-0">
        <div className="table-responsive" style={{ height: getTableHeight(), overflowY: 'auto' }}>
          <Table hover className="mb-0">
            <thead className="sticky-top bg-light">
              <tr>
                <th 
                  className="cursor-pointer" 
                  onClick={() => requestSort('title')}
                >
                  <div className="d-flex align-items-center">
                    Task {getSortIcon('title')}
                  </div>
                </th>
                <th 
                  className="cursor-pointer" 
                  onClick={() => requestSort('status')}
                >
                  <div className="d-flex align-items-center">
                    Status {getSortIcon('status')}
                  </div>
                </th>
                <th 
                  className="cursor-pointer" 
                  onClick={() => requestSort('priority')}
                >
                  <div className="d-flex align-items-center">
                    Priority {getSortIcon('priority')}
                  </div>
                </th>
                <th 
                  className="cursor-pointer" 
                  onClick={() => requestSort('dueDate')}
                >
                  <div className="d-flex align-items-center">
                    Due Date {getSortIcon('dueDate')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task._id} onClick={() => window.location.href = `/tasks/${task._id}`} style={{ cursor: 'pointer' }}>
                  <td className="align-middle">
                    <div className="task-title">{task.title}</div>
                    {task.projectName && <small className="text-muted d-block">{task.projectName}</small>}
                  </td>
                  <td className="align-middle">
                    <Badge bg={getStatusVariant(task.status)}>
                      {task.status}
                    </Badge>
                  </td>
                  <td className="align-middle">
                    <Badge bg={getPriorityVariant(task.priority)}>
                      {task.priority}
                    </Badge>
                  </td>
                  <td className={`align-middle ${getDueDateStatus(task.dueDate)}`}>
                    {formatDate(task.dueDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
      
      <Card.Footer className="text-muted d-flex justify-content-between align-items-center">
        <small>Showing {filteredTasks.length} of {tasks.length} tasks</small>
        <Dropdown align="end">
          <Dropdown.Toggle variant="link" size="sm" className="p-0">
            Limit: {limit}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {[5, 10, 15, 20, 25, 50].map(l => (
              <Dropdown.Item 
                key={l} 
                onClick={() => onConfigUpdate({ ...config, limit: l })}
                active={limit === l}
              >
                {l} tasks
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </Card.Footer>
    </Card>
  );
};

export default TasksWidget;