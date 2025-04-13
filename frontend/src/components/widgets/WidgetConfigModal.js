import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Row, Col } from 'react-bootstrap';
import { useTheme } from '../../contexts/ThemeContext';
import axios from 'axios';
import { getToken, removeTokenAndRedirect } from '../../utils/authUtils';

/**
 * A reusable modal component for configuring widgets
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.show - Whether to show the modal
 * @param {function} props.onHide - Function to call when modal is hidden
 * @param {string} props.widgetType - Type of widget being configured
 * @param {string} props.widgetId - ID of widget being configured
 * @param {string} props.title - Current title of the widget
 * @param {Object} props.config - Current configuration of the widget
 * @param {function} props.onSave - Function to call when configuration is saved
 * @param {Object} props.projectOptions - Available projects for selection (optional)
 */
const WidgetConfigModal = ({ 
  show, 
  onHide, 
  widgetId, 
  config, 
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [formConfig, setFormConfig] = useState({});
  const { theme } = useTheme();
  
  // Load initial configuration
  useEffect(() => {
    if (show && config) {
      setFormConfig({ ...config });
      fetchData();
    }
  }, [show, config]);
  
  // Fetch projects and teams data for configuration options
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      
      if (!token) {
        removeTokenAndRedirect();
        return;
      }
      
      // Fetch projects
      const projectsResponse = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProjects(projectsResponse.data);
      
      // Fetch teams
      const teamsResponse = await axios.get('/api/users/teams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTeams(teamsResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching configuration data:', err);
      setLoading(false);
      
      if (err.response && err.response.status === 401) {
        removeTokenAndRedirect();
      }
    }
  };
  
  // Handle input changes
  const handleChange = (key, value) => {
    setFormConfig({
      ...formConfig,
      [key]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(widgetId, formConfig);
  };
  
  // Get the title based on widget type
  const getWidgetTitle = () => {
    switch (formConfig.type) {
      case 'projectSummary':
        return 'Project Summary Widget';
      case 'myTasks':
        return 'My Tasks Widget';
      case 'burndownChart':
        return 'Burndown Chart Widget';
      case 'teamPerformance':
        return 'Team Performance Widget';
      default:
        return 'Widget Configuration';
    }
  };
  
  // Render different configuration forms based on widget type
  const renderConfigForm = () => {
    if (loading) {
      return (
        <div className="text-center p-3">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      );
    }
    
    switch (formConfig.type) {
      case 'projectSummary':
        return (
          <Form.Group className="mb-3">
            <Form.Label>Project</Form.Label>
            <Form.Select 
              value={formConfig.projectId || ''} 
              onChange={(e) => handleChange('projectId', e.target.value)}
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Select a project to display its summary
            </Form.Text>
          </Form.Group>
        );
        
      case 'myTasks':
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Task Limit</Form.Label>
              <Form.Control 
                type="number" 
                min="1" 
                max="20" 
                value={formConfig.limit || 5} 
                onChange={(e) => handleChange('limit', parseInt(e.target.value))}
              />
              <Form.Text className="text-muted">
                Number of tasks to display (1-20)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Project Filter (Optional)</Form.Label>
              <Form.Select 
                value={formConfig.projectId || ''} 
                onChange={(e) => handleChange('projectId', e.target.value)}
              >
                <option value="">All Projects</option>
                {projects.map(project => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Filter tasks to a specific project
              </Form.Text>
            </Form.Group>
          </>
        );
        
      case 'burndownChart':
        return (
          <Form.Group className="mb-3">
            <Form.Label>Project</Form.Label>
            <Form.Select 
              value={formConfig.projectId || ''} 
              onChange={(e) => handleChange('projectId', e.target.value)}
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Select a project to display its burndown chart
            </Form.Text>
          </Form.Group>
        );
        
      case 'teamPerformance':
        return (
          <Form.Group className="mb-3">
            <Form.Label>Team</Form.Label>
            <Form.Select 
              value={formConfig.teamId || ''} 
              onChange={(e) => handleChange('teamId', e.target.value)}
            >
              <option value="">Select Team</option>
              {teams.map(team => (
                <option key={team._id} value={team._id}>
                  {team.name}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Select a team to display its performance metrics
            </Form.Text>
          </Form.Group>
        );
        
      default:
        return (
          <div className="alert alert-warning">
            No configuration options available for this widget type.
          </div>
        );
    }
  };
  
  return (
    <Modal 
      show={show} 
      onHide={onHide}
      centered
      scrollable
      className={theme === 'dark' ? 'dark-modal' : ''}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>{getWidgetTitle()}</Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body className="config-modal-body">
          <Row className="g-3">
            <Col md={12}>
              {renderConfigForm()}
            </Col>
            
            {/* Widget notification settings */}
            <Col md={12}>
              <Form.Group className="mb-3 border-top pt-3">
                <Form.Label>Notification Settings</Form.Label>
                <Form.Check 
                  type="switch"
                  id="notifications-switch"
                  label="Enable notifications for this widget"
                  checked={formConfig.enableNotifications !== false}
                  onChange={(e) => handleChange('enableNotifications', e.target.checked)}
                />
              </Form.Group>
            </Col>
            
            {/* Widget appearance settings */}
            <Col md={12}>
              <Form.Group className="mb-3 border-top pt-3">
                <Form.Label>Appearance</Form.Label>
                <Form.Check 
                  type="switch"
                  id="compact-switch"
                  label="Compact view"
                  checked={formConfig.compactView === true}
                  onChange={(e) => handleChange('compactView', e.target.checked)}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit"
            disabled={loading || 
              (formConfig.type === 'projectSummary' && !formConfig.projectId) || 
              (formConfig.type === 'burndownChart' && !formConfig.projectId) || 
              (formConfig.type === 'teamPerformance' && !formConfig.teamId)
            }
          >
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default WidgetConfigModal; 