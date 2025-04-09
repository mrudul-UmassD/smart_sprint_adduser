import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Button,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
  Comment as CommentIcon,
  Attachment as AttachmentIcon
} from '@mui/icons-material';
import { Container, Row, Col, Card, Badge, Alert, Form, Tab, Tabs } from 'react-bootstrap';

const TaskList = ({ projectId }) => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [tabKey, setTabKey] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    team: '',
    priority: 'Medium',
    stage: 'Development',
    dueDate: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserRole(user.role);
    }
    
    if (projectId) {
      fetchTasks();
      fetchCompletedTasks();
      fetchUsers();
    }
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/tasks/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again later.');
      setLoading(false);
      
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const fetchCompletedTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/tasks/project/${projectId}/completed`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompletedTasks(response.data);
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleOpen = (task = null) => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        assigneeId: task.assignee ? task.assignee._id : '',
        team: task.team,
        priority: task.priority,
        stage: task.stage,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
      setSelectedTask(task);
    } else {
      setFormData({
        title: '',
        description: '',
        assigneeId: '',
        team: '',
        priority: 'Medium',
        stage: 'Development',
        dueDate: ''
      });
      setSelectedTask(null);
    }
    setError('');
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedTask(null);
    setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try {
      if (!formData.title || !formData.team) {
        setError('Please fill in all required fields');
        return;
      }

      const token = localStorage.getItem('token');
      const data = {
        title: formData.title,
        description: formData.description,
        assigneeId: formData.assigneeId,
        team: formData.team,
        priority: formData.priority,
        stage: formData.stage,
        dueDate: formData.dueDate,
        projectId
      };

      if (selectedTask) {
        await axios.patch(`http://localhost:5001/api/tasks/${selectedTask._id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:5001/api/tasks', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchTasks();
      fetchCompletedTasks();
      handleClose();
    } catch (error) {
      console.error('Error saving task:', error);
      setError(error.response?.data?.error || 'Failed to save task');
    }
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchTasks();
        fetchCompletedTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
        setError('Failed to delete task');
      }
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5001/api/tasks/${taskId}`, { status }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTasks();
      fetchCompletedTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      setError('Failed to update task status');
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'Low': return 'info';
      case 'Medium': return 'secondary';
      case 'High': return 'warning';
      case 'Critical': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Todo': return 'secondary';
      case 'In Progress': return 'primary';
      case 'Review': return 'info';
      case 'Needs Work': return 'warning';
      case 'Completed': return 'success';
      default: return 'secondary';
    }
  };

  const getTeamBadgeColor = (team) => {
    switch (team) {
      case 'Design': return 'info';
      case 'Database': return 'dark';
      case 'Backend': return 'success';
      case 'Frontend': return 'primary';
      case 'DevOps': return 'danger';
      case 'Tester/Security': return 'warning';
      default: return 'secondary';
    }
  };

  const getStageBadgeColor = (stage) => {
    switch (stage) {
      case 'Requirements': return 'info';
      case 'Design': return 'primary';
      case 'Development': return 'warning';
      case 'Testing': return 'danger';
      case 'Deployment': return 'success';
      case 'Maintenance': return 'secondary';
      default: return 'secondary';
    }
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return 'No date set';
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();
    const isPast = date < today;
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString();
  };

  const isDateOverdue = (dateString) => {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const today = new Date();
    return date < today;
  };

  const renderTaskCard = (task) => {
    return (
      <Card key={task._id} className="mb-3 task-card shadow-sm">
        <Card.Header className={`d-flex justify-content-between align-items-center bg-${getStatusBadgeColor(task.status)} bg-opacity-10`}>
          <div className="d-flex align-items-center">
            <h5 className="mb-0 me-2">{task.title}</h5>
            <Badge bg={getPriorityBadgeColor(task.priority)} className="me-1">{task.priority}</Badge>
            <Badge bg={getTeamBadgeColor(task.team)}>{task.team}</Badge>
          </div>
          <div>
            {userRole === 'Admin' || userRole === 'Project Manager' ? (
              <>
                <IconButton 
                  size="small" 
                  onClick={() => handleOpen(task)}
                  className="me-1"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => handleDelete(task._id)}
                  className="me-1"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </>
            ) : null}
            {task.status !== 'Completed' && (
              <IconButton
                size="small"
                color="success"
                onClick={() => handleStatusChange(task._id, 'Completed')}
              >
                <DoneIcon fontSize="small" />
              </IconButton>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col lg={9}>
              <p className="mb-2">{task.description || 'No description provided.'}</p>
              
              <div className="d-flex flex-wrap mb-3">
                <Badge bg={getStatusBadgeColor(task.status)} className="me-2 mb-1">
                  {task.status}
                </Badge>
                <Badge bg={getStageBadgeColor(task.stage)} className="me-2 mb-1">
                  {task.stage}
                </Badge>
                {task.dueDate && (
                  <Badge 
                    bg={isDateOverdue(task.dueDate) && task.status !== 'Completed' ? 'danger' : 'secondary'} 
                    className="mb-1"
                  >
                    Due: {getFormattedDate(task.dueDate)}
                  </Badge>
                )}
              </div>
              
              {task.attachments && task.attachments.length > 0 && (
                <div className="mb-2">
                  <small className="text-muted d-flex align-items-center">
                    <AttachmentIcon fontSize="small" className="me-1" />
                    {task.attachments.length} attachment(s)
                  </small>
                </div>
              )}
              
              {task.comments && task.comments.length > 0 && (
                <div>
                  <small className="text-muted d-flex align-items-center">
                    <CommentIcon fontSize="small" className="me-1" />
                    {task.comments.length} comment(s)
                  </small>
                </div>
              )}
            </Col>
            <Col lg={3} className="border-start">
              <div className="assignee-info">
                <p className="mb-1"><strong>Assigned to:</strong></p>
                {task.assignee ? (
                  <div>
                    <p className="mb-0">{task.assignee.username}</p>
                    <small className="text-muted">{task.assignee.role}</small>
                  </div>
                ) : (
                  <p className="text-muted">Unassigned</p>
                )}
                <div className="mt-2">
                  <small className="text-muted">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container fluid className="mt-4">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="m-0">Project Tasks</h3>
            {(userRole === 'Admin' || userRole === 'Project Manager') && (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={() => handleOpen()}
              >
                Add Task
              </Button>
            )}
          </div>

          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}

          <Tabs
            activeKey={tabKey}
            onSelect={(k) => setTabKey(k)}
            className="mb-3"
          >
            <Tab eventKey="active" title="Active Tasks">
              {loading ? (
                <div className="text-center p-4">
                  <p>Loading tasks...</p>
                </div>
              ) : tasks.length === 0 ? (
                <Alert variant="info">No active tasks found for this project.</Alert>
              ) : (
                <div>
                  {tasks.map(task => renderTaskCard(task))}
                </div>
              )}
            </Tab>
            <Tab eventKey="completed" title="Completed Tasks">
              {loading ? (
                <div className="text-center p-4">
                  <p>Loading tasks...</p>
                </div>
              ) : completedTasks.length === 0 ? (
                <Alert variant="info">No completed tasks found for this project.</Alert>
              ) : (
                <div>
                  {completedTasks.map(task => renderTaskCard(task))}
                </div>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Task Add/Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTask ? 'Edit Task' : 'Add Task'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert variant="danger" className="mb-3">{error}</Alert>
          )}
          <Row className="mt-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Assignee</Form.Label>
                <Form.Select
                  name="assigneeId"
                  value={formData.assigneeId}
                  onChange={handleChange}
                >
                  <option value="">Unassigned</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.username} ({user.role})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Team <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Team</option>
                  <option value="Design">Design</option>
                  <option value="Database">Database</option>
                  <option value="Backend">Backend</option>
                  <option value="Frontend">Frontend</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Tester/Security">Tester/Security</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Due Date</Form.Label>
                <Form.Control
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Stage</Form.Label>
                <Form.Select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                >
                  <option value="Requirements">Requirements</option>
                  <option value="Design">Design</option>
                  <option value="Development">Development</option>
                  <option value="Testing">Testing</option>
                  <option value="Deployment">Deployment</option>
                  <option value="Maintenance">Maintenance</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskList; 