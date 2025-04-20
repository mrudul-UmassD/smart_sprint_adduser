import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';

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
const WidgetConfigModal = ({ show, onHide, widgetType, config = {}, onSaveConfig }) => {
  const [configuration, setConfiguration] = useState({});
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize configuration when modal opens or widget/config changes
  useEffect(() => {
    if (show) {
      setConfiguration(config || getDefaultConfig(widgetType));
      fetchData();
    }
  }, [show, widgetType, config]);
  
  const getDefaultConfig = (type) => {
    switch (type) {
      case 'projectSummary':
        return { projectId: '' };
      case 'myTasks':
        return { limit: 5 };
      case 'burndownChart':
        return { projectId: '' };
      case 'teamPerformance':
        return { teamId: '' };
      default:
        return {};
    }
  };
  
  const fetchData = async () => {
    setLoading(true);
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Fetch projects for project selection
      const projectsResponse = await axios.get('/api/projects', { headers });
      setProjects(projectsResponse.data);

      // Fetch teams data
      const teamsResponse = await axios.get('/api/teams', { headers });
      setTeams(teamsResponse.data);
    } catch (error) {
      console.error('Error fetching configuration data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfiguration({
      ...configuration,
      [name]: value
    });
  };
  
  const handleSave = () => {
    onSaveConfig(configuration);
    onHide();
  };
  
  const renderConfigForm = () => {
    if (loading) return <Spinner animation="border" />;

    // Safely access config.type or use widgetType as fallback
    const widgetTypeToUse = config?.type || widgetType;

    switch (widgetTypeToUse) {
      case 'projectSummary':
      case 'burndownChart':
        return (
          <Form.Group className="mb-3">
            <Form.Label>Select Project</Form.Label>
            <Form.Select
              name="projectId"
              value={configuration.projectId || ''}
              onChange={handleChange}
              required
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        );
      
      case 'myTasks':
        return (
          <Form.Group className="mb-3">
            <Form.Label>Number of Tasks to Display</Form.Label>
            <Form.Control
              type="number"
              name="limit"
              value={configuration.limit || 5}
              onChange={handleChange}
              min="1"
              max="20"
            />
          </Form.Group>
        );
      
      case 'teamPerformance':
        return (
          <Form.Group className="mb-3">
            <Form.Label>Select Team</Form.Label>
            <Form.Select
              name="teamId"
              value={configuration.teamId || ''}
              onChange={handleChange}
              required
            >
              <option value="">Select a team</option>
              {teams.map(team => (
                <option key={team._id || team.id} value={team._id || team.id}>
                  {team.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        );
      
      case 'NOTIFICATIONS':
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Number of notifications to display</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={20}
                value={configuration.limit || 5}
                onChange={e => handleChange({ target: { name: 'limit', value: parseInt(e.target.value) } })}
              />
              <Form.Text className="text-muted">
                Maximum number of notifications to show in the widget
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Show only unread notifications"
                checked={configuration.onlyUnread || false}
                onChange={e => handleChange({ target: { name: 'onlyUnread', value: e.target.checked } })}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Notification Types</Form.Label>
              <div>
                <Form.Check
                  inline
                  type="checkbox"
                  label="Tasks"
                  checked={configuration.includeTaskNotifications !== false}
                  onChange={e => handleChange({ target: { name: 'includeTaskNotifications', value: e.target.checked } })}
                />
                <Form.Check
                  inline
                  type="checkbox"
                  label="Projects"
                  checked={configuration.includeProjectNotifications !== false}
                  onChange={e => handleChange({ target: { name: 'includeProjectNotifications', value: e.target.checked } })}
                />
                <Form.Check
                  inline
                  type="checkbox"
                  label="System"
                  checked={configuration.includeSystemNotifications !== false}
                  onChange={e => handleChange({ target: { name: 'includeSystemNotifications', value: e.target.checked } })}
                />
              </div>
            </Form.Group>
          </>
        );
      
      default:
        return <p className="text-muted">No configuration options available for this widget type.</p>;
    }
  };
  
  const getWidgetTitle = () => {
    // Safely access config.type or use widgetType as fallback
    const widgetTypeToUse = config?.type || widgetType;
    
    switch (widgetTypeToUse) {
      case 'projectSummary':
        return 'Project Summary';
      case 'myTasks':
        return 'My Tasks';
      case 'burndownChart':
        return 'Burndown Chart';
      case 'teamPerformance':
        return 'Team Performance';
      case 'NOTIFICATIONS':
        return 'Configure Notifications Widget';
      default:
        return 'Configure Widget';
    }
  };
  
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Configure {getWidgetTitle()}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>{renderConfigForm()}</Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSave}
          disabled={
            loading ||
            // Safely access config.type using optional chaining
            ((config?.type === 'projectSummary' || widgetType === 'projectSummary') && !configuration.projectId) ||
            ((config?.type === 'burndownChart' || widgetType === 'burndownChart') && !configuration.projectId) ||
            ((config?.type === 'teamPerformance' || widgetType === 'teamPerformance') && !configuration.teamId)
          }
        >
          Save Configuration
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default WidgetConfigModal; 