import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { 
  WIDGET_TYPES, 
  WIDGET_COMPONENTS, 
  getWidgetComponent,
  WIDGET_METADATA
} from './WidgetRegistry';

/**
 * WidgetRenderer - Renders a widget based on its type
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Widget type
 * @param {string} props.title - Widget title (optional, will use default if not provided)
 * @param {Object} props.config - Widget configuration
 * @param {function} props.onRemove - Function to call when widget is removed
 * @param {function} props.onConfigure - Function to call when widget is configured
 * @param {boolean} props.fullscreen - Whether the widget should be in fullscreen mode
 * @param {function} props.onToggleFullscreen - Function to call when the widget's fullscreen state is toggled
 */
const WidgetRenderer = ({ 
  type, 
  title, 
  config = {}, 
  onRemove, 
  onConfigure,
  fullscreen = false,
  onToggleFullscreen
}) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(config.projectId || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available projects from backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setProjects(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Handle project selection change
  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    setSelectedProject(projectId);
    
    // Update the config with new project ID
    if (onConfigure) {
      const updatedConfig = { ...config, projectId };
      onConfigure(null, { title, config: updatedConfig });
    }
  };

  // Determine which component to render based on the widget type
  const renderWidgetContent = () => {
    let WidgetComponent;
    
    // First check in WIDGET_COMPONENTS
    if (WIDGET_COMPONENTS[type]) {
      WidgetComponent = WIDGET_COMPONENTS[type];
    } 
    // Then try getWidgetComponent for legacy widgets
    else {
      WidgetComponent = getWidgetComponent(type);
    }
    
    // If component not found
    if (!WidgetComponent) {
      return (
        <div className="text-center p-4">
          <div className="alert alert-warning">
            Widget type "{type}" not found
          </div>
        </div>
      );
    }

    // Merge the selected project with other config options
    const updatedConfig = {
      ...config,
      projectId: selectedProject || config.projectId
    };

    return (
      <WidgetComponent
        config={updatedConfig}
        onRemove={onRemove}
        onUpdateConfig={onConfigure}
        onToggleFullscreen={onToggleFullscreen}
      />
    );
  };

  // Check if this widget needs a project selector
  const needsProjectSelector = () => {
    // Check WIDGET_METADATA for this requirement
    if (WIDGET_TYPES[type] && WIDGET_METADATA[WIDGET_TYPES[type]]) {
      const metadata = WIDGET_METADATA[WIDGET_TYPES[type]];
      return metadata.requiredConfigFields?.includes('projectId');
    }
    
    // Check for project-related types
    return type.includes('PROJECT') || 
           type.includes('BURNDOWN') || 
           type === 'projectSummary' ||
           type === 'burndownChart';
  };

  return (
    <Card className="h-100 shadow-sm widget-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>{title || 'Widget'}</div>
        <div className="d-flex">
          {onRemove && (
            <Button 
              variant="link" 
              className="p-0 me-2 text-danger" 
              onClick={onRemove}
              title="Remove widget"
            >
              <i className="bi bi-trash"></i>
            </Button>
          )}
          {onConfigure && (
            <Button 
              variant="link" 
              className="p-0 me-2" 
              onClick={onConfigure}
              title="Configure widget"
            >
              <i className="bi bi-gear"></i>
            </Button>
          )}
          {onToggleFullscreen && (
            <Button 
              variant="link" 
              className="p-0" 
              onClick={onToggleFullscreen}
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              <i className={`bi bi-${fullscreen ? 'fullscreen-exit' : 'fullscreen'}`}></i>
            </Button>
          )}
        </div>
      </Card.Header>
      
      {needsProjectSelector() && (
        <div className="px-3 pt-2">
          <Form.Group>
            <Form.Select
              value={selectedProject || ''}
              onChange={handleProjectChange}
              disabled={loading}
              size="sm"
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </div>
      )}
      
      <Card.Body className="p-2">
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading widget data...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          renderWidgetContent()
        )}
      </Card.Body>
    </Card>
  );
};

export default WidgetRenderer; 