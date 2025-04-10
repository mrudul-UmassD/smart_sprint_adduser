import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IconButton,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { Container, Row, Col, Card, Badge, Alert, Form, ListGroup } from 'react-bootstrap';
import API_CONFIG from '../config';

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setUserRole(user.role);
      setUserId(user._id);
    }
    
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_CONFIG.BASE_URL || ''}${API_CONFIG.TASKS_ENDPOINT}/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTask(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching task details:', error);
      setError('Failed to load task details. Please try again later.');
      setLoading(false);
      
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const handleBackToTasks = () => {
    navigate(-1);
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

  const submitComment = async () => {
    if (!newComment.trim()) {
      setCommentError('Comment text is required');
      return;
    }

    try {
      setCommentLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_CONFIG.BASE_URL || ''}${API_CONFIG.TASKS_ENDPOINT}/${taskId}/comments`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewComment('');
      setCommentError('');
      fetchTaskDetails();
    } catch (error) {
      console.error('Error posting comment:', error);
      setCommentError(error.response?.data?.error || 'Error posting comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_CONFIG.BASE_URL || ''}${API_CONFIG.TASKS_ENDPOINT}/${taskId}/comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchTaskDetails();
    } catch (error) {
      console.error('Error deleting comment:', error);
      setCommentError(error.response?.data?.error || 'Error deleting comment');
    }
  };

  const canAddComments = () => {
    if (!task) return false;
    
    // Admin can always comment
    if (userRole === 'Admin') return true;
    
    // Project Manager can comment
    if (userRole === 'Project Manager') return true;
    
    // Assignee can comment
    if (task.assignee && task.assignee._id === userId) return true;
    
    // Task creator can comment
    if (task.assignedBy && task.assignedBy._id === userId) return true;
    
    return false;
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <Card className="shadow-sm">
          <Card.Body className="text-center">
            <p>Loading task details...</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToTasks}
        >
          Back to Tasks
        </Button>
      </Container>
    );
  }

  if (!task) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">Task not found</Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToTasks}
        >
          Back to Tasks
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Button
        variant="contained"
        startIcon={<ArrowBackIcon />}
        onClick={handleBackToTasks}
        className="mb-3"
      >
        Back to Tasks
      </Button>
      
      <Card className="shadow-sm mb-4">
        <Card.Header className={`d-flex justify-content-between align-items-center bg-${getStatusBadgeColor(task.status)} bg-opacity-10`}>
          <div className="d-flex align-items-center">
            <h4 className="mb-0 me-2">{task.title}</h4>
            <Badge bg={getPriorityBadgeColor(task.priority)} className="me-1">{task.priority}</Badge>
            <Badge bg={getTeamBadgeColor(task.team)}>{task.team}</Badge>
          </div>
          <div>
            {(userRole === 'Admin' || userRole === 'Project Manager') && (
              <IconButton 
                size="small" 
                color="primary"
                onClick={() => navigate(`/kanban/${task.project}`)}
                className="me-1"
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            )}
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={8}>
              <h5>Description</h5>
              <p>{task.description || 'No description provided.'}</p>
              
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
            </Col>
            <Col md={4} className="border-start">
              <div className="assignee-info">
                <h5>Assigned to</h5>
                {task.assignee ? (
                  <div>
                    <p className="mb-0">{task.assignee.username}</p>
                    <Badge bg="secondary">{task.assignee.role}</Badge>
                  </div>
                ) : (
                  <p className="text-muted">Unassigned</p>
                )}
                
                <div className="mt-3">
                  <h6>Created by</h6>
                  <p>{task.assignedBy?.username || 'Unknown'}</p>
                </div>
                
                <div className="mt-3">
                  <small className="text-muted">
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </small>
                  <br />
                  <small className="text-muted">
                    Last updated: {new Date(task.updatedAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </Col>
          </Row>
          
          {/* Comments Section */}
          <div className="mt-4">
            <h5>Comments</h5>
            
            {canAddComments() && (
              <div className="mb-3">
                <Form.Group className="mb-2">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </Form.Group>
                {commentError && <Alert variant="danger" className="mb-2">{commentError}</Alert>}
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<SendIcon />}
                  onClick={submitComment}
                  disabled={commentLoading}
                >
                  {commentLoading ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            )}
            
            {task.comments && task.comments.length > 0 ? (
              <ListGroup>
                {task.comments.map(comment => (
                  <ListGroup.Item key={comment._id} className="mb-2">
                    <div className="d-flex justify-content-between">
                      <div className="d-flex align-items-center">
                        <strong>{comment.author.username}</strong>
                        <Badge bg="secondary" className="ms-2">{comment.author.role}</Badge>
                      </div>
                      {(userRole === 'Admin' || comment.author._id === userId) && (
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteComment(comment._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </div>
                    <p className="mt-2 mb-1">{comment.text}</p>
                    <small className="text-muted">
                      {new Date(comment.createdAt).toLocaleString()}
                    </small>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <Alert variant="info">No comments yet</Alert>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default TaskDetail; 