import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Row, Col, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { AiFillDatabase, AiOutlineProject, AiOutlineTeam, AiOutlineDashboard } from 'react-icons/ai';
import axios from '../../utils/axiosConfig';
import { v4 as uuidv4 } from 'uuid';

const DashboardTemplates = ({ show, onHide, onApplyTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Predefined templates for different roles
  const predefinedTemplates = [
    {
      id: 'dev-dashboard',
      name: 'Developer Dashboard',
      description: 'Focus on tasks, project burndown, and code metrics',
      icon: <AiOutlineProject size={24} />,
      widgets: [
        { type: 'myTasks', config: { limit: 5 }, x: 0, y: 0, w: 6, h: 8 },
        { type: 'burndownChart', config: { projectId: null }, x: 6, y: 0, w: 6, h: 8 },
        { type: 'projectSummary', config: { projectId: null }, x: 0, y: 8, w: 12, h: 6 }
      ]
    },
    {
      id: 'pm-dashboard',
      name: 'Project Manager Dashboard',
      description: 'Overview of all projects, resources, and timelines',
      icon: <AiOutlineDashboard size={24} />,
      widgets: [
        { type: 'projectSummary', config: { projectId: null }, x: 0, y: 0, w: 6, h: 8 },
        { type: 'taskPriority', config: { projectId: null }, x: 6, y: 0, w: 6, h: 8 },
        { type: 'myTasks', config: { limit: 10 }, x: 0, y: 8, w: 6, h: 6 },
        { type: 'burndownChart', config: { projectId: null }, x: 6, y: 8, w: 6, h: 6 }
      ]
    },
    {
      id: 'team-lead-dashboard',
      name: 'Team Lead Dashboard',
      description: 'Team performance metrics and task distribution',
      icon: <AiOutlineTeam size={24} />,
      widgets: [
        { type: 'teamVelocity', config: { teamId: null, sprints: 4 }, x: 0, y: 0, w: 12, h: 6 },
        { type: 'myTasks', config: { limit: 8 }, x: 0, y: 6, w: 6, h: 8 },
        { type: 'taskPriority', config: { projectId: null }, x: 6, y: 6, w: 6, h: 8 }
      ]
    },
    {
      id: 'minimal-dashboard',
      name: 'Minimal Dashboard',
      description: 'Simple layout with essential widgets',
      icon: <AiFillDatabase size={24} />,
      widgets: [
        { type: 'projectSummary', config: { projectId: null }, x: 0, y: 0, w: 6, h: 8 },
        { type: 'myTasks', config: { limit: 5 }, x: 6, y: 0, w: 6, h: 8 },
        { type: 'notifications', config: { limit: 5 }, x: 0, y: 8, w: 12, h: 6 }
      ]
    }
  ];

  // Fetch custom templates from backend
  useEffect(() => {
    if (!show) return;
    
    const fetchCustomTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/dashboard/templates');
        
        // Combine predefined and custom templates
        setTemplates([...predefinedTemplates, ...response.data]);
      } catch (err) {
        console.error('Error fetching templates:', err);
        // Still show predefined templates even if API call fails
        setTemplates(predefinedTemplates);
        if (err.response?.status !== 404) {
          setError('Failed to load custom templates. Showing default templates only.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCustomTemplates();
  }, [show]);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      // Transform template widgets to include unique IDs
      const widgetsWithIds = selectedTemplate.widgets.map(widget => ({
        id: uuidv4(),
        type: widget.type,
        config: widget.config || {}
      }));
      
      // Create layouts from widget positions
      const layouts = {
        lg: selectedTemplate.widgets.map((widget, index) => ({
          i: widgetsWithIds[index].id,
          x: widget.x || 0,
          y: widget.y || 0,
          w: widget.w || 6,
          h: widget.h || 8,
          minW: 3,
          minH: 3
        }))
      };
      
      onApplyTemplate({
        name: selectedTemplate.name,
        widgets: widgetsWithIds,
        layouts: layouts
      });
      
      setSelectedTemplate(null);
      onHide();
    }
  };

  const renderTemplateCards = () => {
    return templates.map((template) => (
      <Col key={template.id} xs={12} md={6} lg={6} className="mb-3">
        <Card 
          className={`h-100 ${selectedTemplate?.id === template.id ? 'border-primary shadow-sm' : ''}`}
          onClick={() => handleSelectTemplate(template)}
          style={{ cursor: 'pointer', transition: 'all 0.2s' }}
        >
          <Card.Body className="d-flex flex-column">
            <div className="d-flex align-items-center mb-2">
              <div className="me-2">{template.icon}</div>
              <Card.Title className="mb-0 fs-6">{template.name}</Card.Title>
            </div>
            <Card.Text className="small">{template.description}</Card.Text>
            <div className="mt-auto">
              <small className="text-muted">
                {template.widgets.length} widget{template.widgets.length !== 1 ? 's' : ''}
              </small>
            </div>
          </Card.Body>
        </Card>
      </Col>
    ));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Dashboard Templates</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading && (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading templates...</p>
            </div>
          )}

          {error && <Alert variant="warning">{error}</Alert>}

          {!loading && templates.length === 0 ? (
            <Alert variant="info">No templates available.</Alert>
          ) : (
            <Row className="g-3">
              {renderTemplateCards()}
            </Row>
          )}

          {selectedTemplate && (
            <div className="mt-4">
              <h5>Template Preview</h5>
              <Card>
                <Card.Body>
                  <h6>{selectedTemplate.name}</h6>
                  <p className="text-muted">Widgets included:</p>
                  <ListGroup variant="flush">
                    {selectedTemplate.widgets.map((widget, index) => (
                      <ListGroup.Item key={index}>
                        {widget.type.charAt(0).toUpperCase() + widget.type.slice(1).replace(/([A-Z])/g, ' $1').trim()} Widget
                        {widget.config?.projectId === null && <span className="text-muted"> (requires project selection)</span>}
                        {widget.config?.teamId === null && <span className="text-muted"> (requires team selection)</span>}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleApplyTemplate}
            disabled={!selectedTemplate}
          >
            Apply Template
          </Button>
        </Modal.Footer>
      </Modal>
  );
};

export default DashboardTemplates; 