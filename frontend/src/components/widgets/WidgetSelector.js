import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, Form } from 'react-bootstrap';
import axios from '../../utils/axiosConfig';

// Widget type definitions with icons and descriptions
const WIDGET_TYPES = [
  {
    id: 'projectSummary',
    title: 'Project Summary',
    description: 'Overview of your current projects with completion rates and task distribution.',
    icon: '📊'
  },
  {
    id: 'tasks',
    title: 'My Tasks',
    description: 'Display your assigned tasks with priorities and due dates.',
    icon: '✓'
  },
  {
    id: 'burndown',
    title: 'Burndown Chart',
    description: 'Track project progress over time with a burndown chart.',
    icon: '📉'
  },
  {
    id: 'teamPerformance',
    title: 'Team Performance',
    description: 'Monitor team productivity and task completion metrics.',
    icon: '👥'
  }
];

const WidgetSelector = ({ show, onHide, onAddWidget }) => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [widgetConfig, setWidgetConfig] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch available projects and teams when modal opens
  useEffect(() => {
    if (show) {
      fetchData();
    }
  }, [show]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch projects for project selection
      const projectsResponse = await axios.get('/api/projects');
      setProjects(projectsResponse.data);

      // Get available teams from user data or from a dedicated endpoint
      const teamsResponse = await axios.get('/api/users/teams');
      setTeams(teamsResponse.data);
    } catch (error) {
      console.error('Error fetching widget configuration data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWidgetSelect = (widgetType) => {
    setSelectedWidget(widgetType);
    // Set default configuration based on widget type
    switch (widgetType) {
      case 'projectSummary':
        setWidgetConfig({ projectId: '' });
        break;
      case 'tasks':
        setWidgetConfig({ limit: 5 });
        break;
      case 'burndown':
        setWidgetConfig({ projectId: '' });
        break;
      case 'teamPerformance':
        setWidgetConfig({ team: '' });
        break;
      default:
        setWidgetConfig({});
    }
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setWidgetConfig({ ...widgetConfig, [name]: value });
  };

  const handleAddWidget = () => {
    onAddWidget(selectedWidget, widgetConfig);
    resetForm();
    onHide();
  };

  const resetForm = () => {
    setSelectedWidget(null);
    setWidgetConfig({});
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  // Widget definitions with their UI representation
  const widgetDefinitions = [
    {
      type: 'projectSummary',
      title: 'Project Summary',
      description: 'Shows key metrics for a specific project',
      icon: 'bi-bar-chart-fill'
    },
    {
      type: 'tasks',
      title: 'My Tasks',
      description: 'Displays your assigned tasks',
      icon: 'bi-list-check'
    },
    {
      type: 'burndown',
      title: 'Burndown Chart',
      description: 'Shows project progress over time',
      icon: 'bi-graph-down'
    },
    {
      type: 'teamPerformance',
      title: 'Team Performance',
      description: 'Displays performance metrics for a team',
      icon: 'bi-people-fill'
    }
  ];

  // Configuration form based on selected widget type
  const renderConfigurationForm = () => {
    if (!selectedWidget) return null;

    switch (selectedWidget) {
      case 'projectSummary':
      case 'burndown':
        return (
          <Form.Group className="mb-3">
            <Form.Label>Select Project</Form.Label>
            <Form.Select 
              name="projectId" 
              value={widgetConfig.projectId || ''} 
              onChange={handleConfigChange}
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
        
      case 'tasks':
        return (
          <Form.Group className="mb-3">
            <Form.Label>Number of Tasks to Display</Form.Label>
            <Form.Control 
              type="number" 
              name="limit" 
              value={widgetConfig.limit || 5} 
              onChange={handleConfigChange}
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
              name="team" 
              value={widgetConfig.team || ''} 
              onChange={handleConfigChange}
              required
            >
              <option value="">Select a team</option>
              {teams.map((team, index) => (
                <option key={index} value={team}>
                  {team}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        );
        
      default:
        return null;
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg" 
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {selectedWidget 
            ? `Configure ${widgetDefinitions.find(w => w.type === selectedWidget)?.title || 'Widget'}`
            : 'Select a Widget to Add'
          }
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!selectedWidget ? (
          <Row xs={1} md={2} className="g-4">
            {widgetDefinitions.map((widget) => (
              <Col key={widget.type}>
                <Card 
                  className={`widget-card h-100 cursor-pointer`}
                  onClick={() => handleWidgetSelect(widget.type)}
                >
                  <Card.Body className="d-flex flex-column">
                    <div className="text-center mb-3">
                      <i className={`${widget.icon} display-5 text-primary`}></i>
                    </div>
                    <Card.Title className="text-center">{widget.title}</Card.Title>
                    <Card.Text className="text-center text-muted">
                      {widget.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Form>
            {renderConfigurationForm()}
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        {selectedWidget ? (
          <>
            <Button variant="secondary" onClick={() => setSelectedWidget(null)}>
              Back to Widgets
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddWidget}
              disabled={
                (selectedWidget === 'projectSummary' || selectedWidget === 'burndown') && !widgetConfig.projectId ||
                selectedWidget === 'teamPerformance' && !widgetConfig.team
              }
            >
              Add to Dashboard
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default WidgetSelector; 