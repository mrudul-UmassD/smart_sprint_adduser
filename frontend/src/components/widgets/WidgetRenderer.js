import React, { useState, useEffect } from 'react';
import { Card, Alert, Spinner, Form } from 'react-bootstrap';
import axios from 'axios';
import { WIDGET_COMPONENTS, WIDGET_TYPES, WIDGET_METADATA } from './WidgetRegistry';
import WIDGET_REGISTRY from './WidgetRegistry';

/**
 * WidgetRenderer - Renders a widget based on its type
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Widget type
 * @param {string} props.title - Widget title (optional, will use default if not provided)
 * @param {Object} props.config - Widget configuration
 * @param {function} props.onRemove - Function to call when widget is removed
 * @param {function} props.onConfigure - Function to call when widget is configured
 * @param {function} props.onToggleFullscreen - Function to call when widget is toggled to fullscreen
 */
const WidgetRenderer = ({ type, title, config, onRemove, onConfigure, onToggleFullscreen }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(config?.projectId || '');
  
  // Fetch projects if needed
  useEffect(() => {
    // Only fetch projects if the widget needs project selection and we don't have a projectId in config
    const widgetMetadata = getWidgetMetadata(type);
    const needsProject = widgetMetadata?.requiredConfigFields?.includes('projectId');
    
    if (needsProject) {
      fetchProjects();
    }
  }, [type]);
  
  // Get the component for the widget type
  const getWidgetComponent = (widgetType) => {
    // Try direct lookup first (for string types)
    if (WIDGET_COMPONENTS[widgetType]) {
      return WIDGET_COMPONENTS[widgetType];
    }
    
    // Try looking up via WIDGET_TYPES constants if direct lookup fails
    const typeKey = Object.keys(WIDGET_TYPES).find(key => 
      WIDGET_TYPES[key].toLowerCase() === widgetType.toLowerCase()
    );
    
    if (typeKey && WIDGET_COMPONENTS[WIDGET_TYPES[typeKey]]) {
      return WIDGET_COMPONENTS[WIDGET_TYPES[typeKey]];
    }
    
    // Try looking up in the main WIDGET_REGISTRY
    const registryEntry = Object.keys(WIDGET_REGISTRY).find(key => 
      key.toLowerCase() === widgetType.toLowerCase()
    );
    
    if (registryEntry && WIDGET_REGISTRY[registryEntry]?.component) {
      return WIDGET_REGISTRY[registryEntry].component;
    }
    
    return null;
  };
  
  // Get metadata for this widget type
  const getWidgetMetadata = (widgetType) => {
    // Try direct lookup in WIDGET_METADATA
    const typeKey = Object.keys(WIDGET_TYPES).find(key => 
      WIDGET_TYPES[key].toLowerCase() === widgetType.toLowerCase()
    );
    
    if (typeKey && WIDGET_METADATA[WIDGET_TYPES[typeKey]]) {
      return WIDGET_METADATA[WIDGET_TYPES[typeKey]];
    }
    
    return null;
  };
  
  // Fetch available projects for selection
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/users/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects');
      setLoading(false);
    }
  };
  
  // Handle project selection change
  const handleProjectChange = (e) => {
    setSelectedProject(e.target.value);
    // If there's an onConfigure handler, allow parent to update config
    if (onConfigure) {
      onConfigure({ projectId: e.target.value });
    }
  };
  
  // Determine if this widget needs project selection
  const needsProjectSelector = () => {
    const widgetMetadata = getWidgetMetadata(type);
    return widgetMetadata?.requiredConfigFields?.includes('projectId');
  };
  
  // Render the widget content
  const renderWidgetContent = () => {
    const WidgetComponent = getWidgetComponent(type);
    
    if (!WidgetComponent) {
      return (
        <Alert variant="danger">
          Widget type {type} not found. Please check WidgetRegistry.js
        </Alert>
      );
    }
    
    // Prepare combined config with selected project if needed
    const widgetConfig = {
      ...config,
      projectId: selectedProject || config?.projectId
    };
    
    return (
      <WidgetComponent
        config={widgetConfig}
        onRemove={onRemove}
        onUpdateConfig={onConfigure}
        onToggleFullscreen={onToggleFullscreen}
      />
    );
  };
  
  // Render project selector if widget requires it
  const renderProjectSelector = () => {
    if (!needsProjectSelector()) return null;
    
    if (loading) {
      return <Spinner animation="border" size="sm" className="mb-3" />;
    }
    
    if (error) {
      return <Alert variant="danger" className="mb-3">{error}</Alert>;
    }
    
    if (projects.length === 0) {
      return <Alert variant="info" className="mb-3">No projects available</Alert>;
    }
    
    return (
      <Form.Group className="mb-3">
        <Form.Label>Select Project</Form.Label>
        <Form.Select 
          value={selectedProject || config?.projectId || ''}
          onChange={handleProjectChange}
        >
          <option value="">Choose a project...</option>
          {projects.map(project => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    );
  };
  
  return (
    <div className="h-100">
      {needsProjectSelector() && !selectedProject && !config?.projectId ? (
        <Card className="h-100">
          <Card.Header>
            <h5 className="mb-0">{title || 'Configure Widget'}</h5>
          </Card.Header>
          <Card.Body>
            {renderProjectSelector()}
            <Alert variant="info">
              Please select a project to display data
            </Alert>
          </Card.Body>
        </Card>
      ) : (
        renderWidgetContent()
      )}
    </div>
  );
};

export default WidgetRenderer;