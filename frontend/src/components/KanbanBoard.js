import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    team: '',
    priority: 'Medium',
    status: 'Todo',
    stage: 'Development',
    dueDate: new Date().toISOString().split('T')[0]
  });

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
      const response = await axios.get(`${API_CONFIG.TASKS_ENDPOINT}?projectId=${selectedProject}`);
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
        team: task.team || '',
        priority: task.priority || 'Medium',
        status: task.status || 'Todo',
        stage: task.stage || 'Development',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: '',
        description: '',
        assignee: '',
        team: '',
        priority: 'Medium',
        status: 'Todo',
        stage: 'Development',
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

  const handleSubmit = async () => {
    try {
      const taskData = {
        ...formData,
        projectId: selectedProject
      };

      if (selectedTask) {
        await axios.put(`${API_CONFIG.TASKS_ENDPOINT}/${selectedTask._id}`, taskData);
      } else {
        await axios.post(`${API_CONFIG.TASKS_ENDPOINT}`, taskData);
      }

      fetchTasks();
      handleCloseTaskDialog();
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task. Please try again later.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`${API_CONFIG.TASKS_ENDPOINT}/${taskId}/status`, { status: newStatus });
      fetchTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again later.');
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
                              <Card 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2 task-card"
                                onClick={() => handleOpenTaskDialog(task)}
                              >
                                <Card.Body>
                                  <Card.Title>{task.title}</Card.Title>
                                  <div className="mt-2 mb-2">
                                    <Badge bg={getPriorityBadgeVariant(task.priority)}>
                                      {task.priority}
                                    </Badge>
                                    {' '}
                                    <Badge bg="info">{task.stage}</Badge>
                                  </div>
                                  <div className="text-muted small">
                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                  </div>
                                  {task.assignee && (
                                    <div className="mt-2">
                                      Assignee: {task.assignee.username}
                                    </div>
                                  )}
                                  <div className="mt-2 d-flex justify-content-end">
                                    <Button 
                                      variant="outline-danger" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTask(task._id);
                                      }}
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </Card.Body>
                              </Card>
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
                <Form.Label>Title</Form.Label>
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
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                >
                  <option value="">Select Assignee</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.username} ({user.role})
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
                <Form.Label>Team</Form.Label>
                <Form.Select
                  name="team"
                  value={formData.team}
                  onChange={handleChange}
                >
                  <option value="">Select Team</option>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Design">Design</option>
                  <option value="QA">QA</option>
                  <option value="DevOps">DevOps</option>
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
            <Col md={4}>
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
            <Col md={4}>
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
            <Col md={4}>
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