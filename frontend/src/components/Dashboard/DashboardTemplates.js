import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Row, Col, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { AiFillDatabase, AiOutlineProject, AiOutlineTeam, AiOutlineDashboard } from 'react-icons/ai';
import axios from 'axios';

const DashboardTemplates = ({ onApplyTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Predefined templates for different roles
  const predefinedTemplates = [
    {
      id: 'dev-dashboard',
      name: 'Developer Dashboard',
      description: 'Focus on tasks, project burndown, and code metrics',
      icon: <AiOutlineProject size={24} />,
      layout: {
        widgets: [
          { type: 'tasks', config: { limit: 5 }, x: 0, y: 0, w: 6, h: 8 },
          { type: 'burndown', config: { projectId: null }, x: 6, y: 0, w: 6, h: 8 },
          { type: 'projectSummary', config: { projectId: null }, x: 0, y: 8, w: 12, h: 6 }
        ]
      }
    },
    {
      id: 'pm-dashboard',
      name: 'Project Manager Dashboard',
      description: 'Overview of all projects, resources, and timelines',
      icon: <AiOutlineDashboard size={24} />,
      layout: {
        widgets: [
          { type: 'projectSummary', config: { projectId: null }, x: 0, y: 0, w: 6, h: 8 },
          { type: 'teamPerformance', config: { teamId: null }, x: 6, y: 0, w: 6, h: 8 },
          { type: 'tasks', config: { limit: 10 }, x: 0, y: 8, w: 12, h: 6 }
        ]
      }
    },
    {
      id: 'team-lead-dashboard',
      name: 'Team Lead Dashboard',
      description: 'Team performance metrics and task distribution',
      icon: <AiOutlineTeam size={24} />,
      layout: {
        widgets: [
          { type: 'teamPerformance', config: { teamId: null }, x: 0, y: 0, w: 12, h: 6 },
          { type: 'tasks', config: { limit: 8 }, x: 0, y: 6, w: 6, h: 8 },
          { type: 'burndown', config: { projectId: null }, x: 6, y: 6, w: 6, h: 8 }
        ]
      }
    },
    {
      id: 'exec-dashboard',
      name: 'Executive Dashboard',
      description: 'High-level metrics across all projects and teams',
      icon: <AiFillDatabase size={24} />,
      layout: {
        widgets: [
          { type: 'projectSummary', config: { projectId: null }, x: 0, y: 0, w: 6, h: 8 },
          { type: 'teamPerformance', config: { teamId: null }, x: 6, y: 0, w: 6, h: 8 },
          { type: 'tasks', config: { limit: 5 }, x: 0, y: 8, w: 12, h: 6 }
        ]
      }
    }
  ];

  // Fetch custom templates from backend
  useEffect(() => {
    const fetchCustomTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/dashboard/templates', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Combine predefined and custom templates
        setTemplates([...predefinedTemplates, ...response.data]);
      } catch (err) {
        console.error('Error fetching templates:', err);
        // Still show predefined templates even if API call fails
        setTemplates(predefinedTemplates);
        setError('Failed to load custom templates. Showing default templates only.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomTemplates();
  }, []);

  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      onApplyTemplate(selectedTemplate.layout);
      handleCloseModal();
    }
  };

  const renderTemplateCards = () => {
    return templates.map((template) => (
      <Col key={template.id} xs={12} md={6} lg={3} className="mb-3">
        <Card 
          className={`h-100 ${selectedTemplate?.id === template.id ? 'border-primary' : ''}`}
          onClick={() => handleSelectTemplate(template)}
          style={{ cursor: 'pointer' }}
        >
          <Card.Body className="d-flex flex-column">
            <div className="d-flex align-items-center mb-2">
              <div className="me-2">{template.icon}</div>
              <Card.Title className="mb-0">{template.name}</Card.Title>
            </div>
            <Card.Text>{template.description}</Card.Text>
            <div className="mt-auto">
              <small className="text-muted">
                {template.layout.widgets.length} widgets
              </small>
            </div>
          </Card.Body>
        </Card>
      </Col>
    ));
  };

  return (
    <>
      <Button variant="outline-primary" onClick={handleOpenModal}>
        <AiOutlineDashboard className="me-1" /> Dashboard Templates
      </Button>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
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
                    {selectedTemplate.layout.widgets.map((widget, index) => (
                      <ListGroup.Item key={index}>
                        {widget.type.charAt(0).toUpperCase() + widget.type.slice(1)} Widget
                        {widget.config.projectId === null && <span className="text-muted"> (requires project selection)</span>}
                        {widget.config.teamId === null && <span className="text-muted"> (requires team selection)</span>}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
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
    </>
  );
};

export default DashboardTemplates; 