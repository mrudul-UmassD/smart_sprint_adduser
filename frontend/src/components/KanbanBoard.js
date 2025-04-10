import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Button, 
  Modal,
  Form, 
  Alert,
  Spinner
} from 'react-bootstrap';
import {
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import API_CONFIG from '../config';

const KanbanBoard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'Medium',
    status: 'Todo',
    dueDate: new Date().toISOString().split('T')[0]
  });

  // Fetch current user info
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  // Fetch projects, tasks, and users on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API_CONFIG.PROJECTS_ENDPOINT}`);
        setProjects(response.data);
        if (response.data.length > 0) {
          setSelectedProject(response.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to fetch projects. Please try again later.');
        setTimeout(() => {
          localStorage.removeItem('token');
          navigate('/login');
        }, 2000);
      }
    };

    fetchProjects();
    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    if (selectedProject) {
      fetchTasks();
    }
  }, [selectedProject]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_CONFIG.TASKS_ENDPOINT}/project/${selectedProject}`);
      setTasks(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to fetch tasks. Please try again later.');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.USERS_ENDPOINT}`);
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users. Please try again later.');
    }
  };

  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleOpenTaskDialog = (task = null) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignee: task.assignee?._id || '',
        priority: task.priority || 'Medium',
        status: task.status || 'Todo',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        assignee: '',
        priority: 'Medium',
        status: 'Todo',
        dueDate: new Date().toISOString().split('T')[0]
      });
    }
    setShowTaskDialog(true);
  };

  const handleCloseTaskDialog = () => {
    setShowTaskDialog(false);
    setSelectedTask(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getAssigneeTeam = () => {
    if (!formData.assignee) return null;
    const assignedUser = users.find(user => user._id === formData.assignee);
    return assignedUser ? assignedUser.team : null;
  };

  const handleSubmit = async () => {
    try {
      // Get the team from the selected assignee
      const team = getAssigneeTeam();
      
      if (!team) {
        setError('Please select a valid assignee');
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      const taskData = {
        ...formData,
        team,
        projectId: selectedProject
      };

      if (!taskData.title) {
        setError('Title is required');
        setTimeout(() => setError(''), 3000);
        return;
      }

      if (selectedTask) {
        await axios.put(`${API_CONFIG.TASKS_ENDPOINT}/${selectedTask._id}`, taskData);
      } else {
        await axios.post(`${API_CONFIG.TASKS_ENDPOINT}`, taskData);
      }

      fetchTasks();
      handleCloseTaskDialog();
    } catch (err) {
      console.error('Error saving task:', err);
      setError(err.response?.data?.error || 'Failed to save task. Please try again later.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // For developers, don't allow direct move to Completed
      if (currentUser && currentUser.role === 'Developer' && newStatus === 'Completed') {
        newStatus = 'Review';
      }
      
      await axios.patch(`${API_CONFIG.TASKS_ENDPOINT}/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again later.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;
    
    await handleStatusChange(draggableId, newStatus);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_CONFIG.TASKS_ENDPOINT}/${taskId}`);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task. Please try again later.');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'Low': return 'success';
      case 'Medium': return 'info';
      case 'High': return 'warning';
      case 'Critical': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusColumns = () => {
    return [
      { id: 'Todo', title: 'To Do' },
      { id: 'In Progress', title: 'In Progress' },
      { id: 'Review', title: 'Review' },
      { id: 'Needs Work', title: 'Needs Work' },
      { id: 'Completed', title: 'Completed' }
    ];
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid>
      {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      
      <Row className="mb-4 mt-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label>Select Project</Form.Label>
            <Form.Select 
              value={selectedProject} 
              onChange={handleProjectChange}
            >
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex align-items-end justify-content-end">
          <Button 
            variant="primary" 
            onClick={() => handleOpenTaskDialog()}
          >
            Add New Task
          </Button>
        </Col>
      </Row>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Row>
          {getStatusColumns().map(column => (
            <Col key={column.id} md style={{ minWidth: '250px' }}>
              <Card className="mb-4">
                <Card.Header className="text-center bg-light">
                  <h5 className="mb-0">{column.title}</h5>
                </Card.Header>
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="p-2"
                      style={{ minHeight: '500px' }}
                    >
                      {tasks
                        .filter(task => task.status === column.id)
                        .map((task, index) => (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(provided) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style
                                }}
                              >
                                <Card className="mb-2 task-card">
                                  <Card.Body>
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                      <Link 
                                        to={`/task/${task._id}`} 
                                        style={{ 
                                          textDecoration: 'none', 
                                          color: 'inherit',
                                          flex: 1
                                        }}
                                      >
                                        <Card.Title>{task.title}</Card.Title>
                                      </Link>
                                      <div>
                                        <IconButton 
                                          size="small" 
                                          color="primary"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleOpenTaskDialog(task);
                                          }}
                                          style={{ padding: '4px' }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton 
                                          size="small" 
                                          color="error"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            handleDeleteTask(task._id);
                                          }}
                                          style={{ padding: '4px' }}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </div>
                                    </div>
                                    <Link 
                                      to={`/task/${task._id}`} 
                                      style={{ 
                                        textDecoration: 'none', 
                                        color: 'inherit'
                                      }}
                                    >
                                      <div className="mt-2 mb-2">
                                        <Badge bg={getPriorityBadgeVariant(task.priority)}>
                                          {task.priority}
                                        </Badge>
                                        {' '}
                                        <Badge bg="secondary">{task.team}</Badge>
                                      </div>
                                      <div className="text-muted small">
                                        Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                                      </div>
                                      {task.assignee && (
                                        <div className="mt-2">
                                          Assignee: {task.assignee.username}
                                        </div>
                                      )}
                                      {task.comments && task.comments.length > 0 && (
                                        <div className="mt-2 text-primary small">
                                          {task.comments.length} comment(s) - Click to view
                                        </div>
                                      )}
                                    </Link>
                                  </Card.Body>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </Card>
            </Col>
          ))}
        </Row>
      </DragDropContext>

      <Modal show={showTaskDialog} onHide={handleCloseTaskDialog} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedTask ? 'Edit Task' : 'Create New Task'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
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
                <Form.Label>Assignee <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Assignee</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.username} - {user.team} ({user.role})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
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
            </Col>
          </Row>
          <Row>
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
          </Row>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Todo">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Needs Work">Needs Work</option>
                  <option value="Completed">Completed</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              {getAssigneeTeam() && (
                <Form.Group className="mb-3">
                  <Form.Label>Team (From Assignee)</Form.Label>
                  <Form.Control
                    type="text"
                    value={getAssigneeTeam() || ''}
                    disabled
                  />
                </Form.Group>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTaskDialog}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>
            {selectedTask ? 'Update' : 'Create'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default KanbanBoard; 