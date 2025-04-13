import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
  Offcanvas,
  Card,
  Form,
  Toast,
  ToastContainer,
  ButtonGroup
} from 'react-bootstrap';
import { Add as AddIcon, Settings as SettingsIcon, Save as SaveIcon } from '@mui/icons-material';
import WidgetRenderer from './widgets/WidgetRenderer';
import WidgetConfigModal from './widgets/WidgetConfigModal';
import { getAvailableWidgets, getDashboardTemplate } from './widgets/WidgetRegistry';
import { applyLayoutMode, updateWidgetsWithLayout } from './layouts/DashboardLayouts';
import API_CONFIG from '../config';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import WidgetSelector from './widgets/WidgetSelector';
import DashboardWidgets from './widgets/DashboardWidgets';

// Make the grid responsive
const ResponsiveGridLayout = WidthProvider(Responsive);

const CustomDashboard = ({ user }) => {
  const [layout, setLayout] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardTheme, setDashboardTheme] = useState('System');
  const [dashboardLayout, setDashboardLayout] = useState('Grid');
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [configWidget, setConfigWidget] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [projects, setProjects] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [layoutMode, setLayoutMode] = useState('edit'); // 'edit' or 'view'
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [modeIndicator, setModeIndicator] = useState({ visible: false, message: '' });
  const saveTimeoutRef = useRef(null);
  const navigate = useNavigate();
  
  // Fetch projects for use in widget configuration
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.PROJECTS_ENDPOINT}`);
        
        // Format projects for use in select dropdowns
        const formattedProjects = response.data.map(project => ({
          id: project._id,
          name: project.name
        }));
        
        setProjects(formattedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Fetch user dashboard settings
  useEffect(() => {
    const fetchDashboardSettings = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/settings`);
        
        if (response.data && response.data.success) {
          const { settings } = response.data;
          
          // Load dashboard theme and layout
          setDashboardTheme(settings.dashboardConfig.theme);
          setDashboardLayout(settings.dashboardConfig.layout);
          
          // Convert widgets to the format expected by react-grid-layout
          const widgetsFromSettings = settings.dashboardConfig.widgets.map(widget => ({
            id: widget._id,
            type: widget.type,
            title: widget.title,
            config: widget.config || {},
            layout: {
              i: widget._id,
              x: widget.position.x || 0,
              y: widget.position.y || 0,
              w: widget.position.width || 6,
              h: widget.position.height || 4
            }
          }));
          
          setWidgets(widgetsFromSettings);
          
          // Apply the current layout mode
          const newLayout = applyLayoutMode(settings.dashboardConfig.layout, widgetsFromSettings);
          setLayout(newLayout);
        } else {
          // If user has no settings yet, use template based on role
          initializeDefaultDashboard();
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard settings:', err);
        
        // If error, use template based on role
        initializeDefaultDashboard();
        
        if (err.response?.status === 404) {
          // This is expected for new users, so don't show as error
          setLoading(false);
        } else {
          setError('Failed to load dashboard settings');
          setLoading(false);
        }
      }
    };
    
    fetchDashboardSettings();
  }, [user]);
  
  // Apply layout mode when it changes
  useEffect(() => {
    if (widgets.length > 0) {
      const newLayout = applyLayoutMode(dashboardLayout, widgets);
      setLayout(newLayout);
      
      // Update widgets with new layout
      const updatedWidgets = updateWidgetsWithLayout(widgets, newLayout);
      setWidgets(updatedWidgets);
    }
  }, [dashboardLayout]);
  
  // Auto-save dashboard changes if enabled
  useEffect(() => {
    let timer;
    
    if (unsavedChanges && autoSave) {
      timer = setTimeout(() => {
        handleSaveSettings();
      }, 5000); // Auto-save after 5 seconds of inactivity
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [unsavedChanges, autoSave]);
  
  // Initialize default dashboard based on user role
  const initializeDefaultDashboard = useCallback(() => {
    const role = user.role;
    const template = getDashboardTemplate(role);
    
    // Convert template to widgets with generated IDs
    const defaultWidgets = template.map((item, index) => {
      const id = `widget-${Date.now()}-${index}`;
      return {
        id,
        type: item.type,
        title: getAvailableWidgets(role).find(w => w.type === item.type)?.title || item.type,
        config: {},
        layout: {
          i: id,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        }
      };
    });
    
    setWidgets(defaultWidgets);
    
    // Apply the current layout mode
    const newLayout = applyLayoutMode(dashboardLayout, defaultWidgets);
    setLayout(newLayout);
    
    setUnsavedChanges(true);
    setLoading(false);
  }, [user, dashboardLayout]);
  
  // Show toast notification
  const showNotification = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };
  
  // Handle layout change
  const handleLayoutChange = (newLayout) => {
    // Only process if in edit mode
    if (layoutMode === 'view') return;
    
    // Only update if in Grid mode, as other modes are auto-generated
    if (dashboardLayout === 'Grid') {
      setLayout(newLayout);
      
      // Update widgets with new positions
      const updatedWidgets = updateWidgetsWithLayout(widgets, newLayout);      
      setWidgets(updatedWidgets);
      setUnsavedChanges(true);
    }
  };
  
  // Add a new widget
  const handleAddWidget = (widgetType, title) => {
    const availableWidgets = getAvailableWidgets(user.role);
    const widgetInfo = availableWidgets.find(w => w.type === widgetType);
    
    if (!widgetInfo) return;
    
    const id = `widget-${Date.now()}`;
    const { defaultDimensions } = widgetInfo;
    
    // Create new widget
    const newWidget = {
      id,
      type: widgetType,
      title: title || widgetInfo.title,
      config: widgetInfo.defaultConfig || {},
      layout: {
        i: id,
        x: 0, // Initial position will be determined by layout mode
        y: 0,
        w: defaultDimensions.w,
        h: defaultDimensions.h
      }
    };
    
    // Add widget to state
    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    
    // Apply the current layout mode to update all widget positions
    const newLayout = applyLayoutMode(dashboardLayout, updatedWidgets);
    setLayout(newLayout);
    
    setShowAddWidget(false);
    setUnsavedChanges(true);
    
    // If the widget requires configuration (like BurndownChart), open config modal
    if (widgetInfo.requiresProject) {
      setConfigWidget(newWidget);
    }
  };
  
  // Remove a widget
  const handleRemoveWidget = (widgetId) => {
    const updatedWidgets = widgets.filter(widget => widget.id !== widgetId);
    setWidgets(updatedWidgets);
    
    // Apply the current layout mode
    const newLayout = applyLayoutMode(dashboardLayout, updatedWidgets);
    setLayout(newLayout);
    
    setUnsavedChanges(true);
    showNotification('Widget removed');
  };
  
  // Open widget configuration modal
  const handleConfigureWidget = (widgetId) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      setConfigWidget(widget);
    }
  };
  
  // Save widget configuration
  const handleSaveWidgetConfig = (widgetId, { title, config }) => {
    const updatedWidgets = widgets.map(widget => {
      if (widget.id === widgetId) {
        return {
          ...widget,
          title,
          config
        };
      }
      return widget;
    });
    
    setWidgets(updatedWidgets);
    setConfigWidget(null);
    setUnsavedChanges(true);
    showNotification('Widget configuration updated');
  };
  
  // Reset to default layout based on role
  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset to the default dashboard layout? This will remove all custom widgets.')) {
      initializeDefaultDashboard();
      showNotification('Dashboard reset to default layout');
    }
  };
  
  // Toggle edit/view mode
  const toggleLayoutMode = () => {
    setLayoutMode(layoutMode === 'edit' ? 'view' : 'edit');
    showNotification(layoutMode === 'edit' ? 'View mode - drag disabled' : 'Edit mode - drag enabled');
  };
  
  // Change the dashboard layout mode
  const handleLayoutModeChange = (mode) => {
    if (mode === dashboardLayout) return;
    
    setDashboardLayout(mode);
    setSettingsChanged(true);
    setUnsavedChanges(true);
    showNotification(`Layout changed to ${mode} mode`);
  };
  
  // Save dashboard settings
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // First, save theme and layout
      if (settingsChanged) {
        await axios.patch(`${API_CONFIG.BASE_URL}/api/settings/dashboard/theme`, {
          theme: dashboardTheme
        });
        
        await axios.patch(`${API_CONFIG.BASE_URL}/api/settings/dashboard/layout`, {
          layout: dashboardLayout
        });
        
        setSettingsChanged(false);
      }
      
      // Then, save widgets
      for (const widget of widgets) {
        // Convert layout to position format expected by the API
        const position = {
          x: widget.layout.x,
          y: widget.layout.y,
          width: widget.layout.w,
          height: widget.layout.h
        };
        
        // For existing widgets (not temporary IDs), update them
        if (!widget.id.includes('widget-')) {
          await axios.patch(`${API_CONFIG.BASE_URL}/api/settings/dashboard/widgets/${widget.id}`, {
            title: widget.title,
            position,
            config: widget.config
          });
        } else {
          // For new widgets, add them
          await axios.post(`${API_CONFIG.BASE_URL}/api/settings/dashboard/widgets`, {
            type: widget.type,
            title: widget.title,
            position,
            config: widget.config
          });
        }
      }
      
      // For any widgets that were removed, delete them from the backend
      // This would need the original list of widgets from the backend to compare
      
      setUnsavedChanges(false);
      showNotification('Dashboard settings saved successfully');
      setLoading(false);
    } catch (err) {
      console.error('Error saving dashboard settings:', err);
      setError('Failed to save dashboard settings');
      setLoading(false);
    }
  };
  
  // Apply theme based on settings
  useEffect(() => {
    // Apply theme to document
    const applyTheme = () => {
      let theme = dashboardTheme;
      
      // If theme is System, use system preference
      if (theme === 'System') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        theme = prefersDark ? 'Dark' : 'Light';
      }
      
      // Apply theme class to body
      document.body.classList.remove('theme-light', 'theme-dark');
      document.body.classList.add(`theme-${theme.toLowerCase()}`);
    };
    
    applyTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = () => applyTheme();
    
    mediaQuery.addEventListener('change', handleThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
    };
  }, [dashboardTheme]);
  
  // Show mode indicator message
  const showModeIndicatorMessage = (message) => {
    setModeIndicator({ visible: true, message });
    
    // Hide after 3 seconds
    setTimeout(() => {
      setModeIndicator(prev => ({ ...prev, visible: false }));
    }, 3000);
  };
  
  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading dashboard...</span>
        </Spinner>
        <p className="mt-3">Loading your dashboard...</p>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  
  return (
    <div className={`dashboard-container theme-${dashboardTheme} ${layoutMode === 'edit' ? 'dashboard-edit-mode' : 'dashboard-view-mode'}`}>
      <Container fluid className="p-4">
        {/* Toast notification */}
        <ToastContainer position="top-end" className="p-3">
          <Toast 
            show={showToast} 
            onClose={() => setShowToast(false)} 
            delay={3000} 
            autohide
          >
            <Toast.Header>
              <strong className="me-auto">Dashboard</strong>
            </Toast.Header>
            <Toast.Body>{toastMessage}</Toast.Body>
          </Toast>
        </ToastContainer>

        <Row className="mb-4 align-items-center">
          <Col>
            <h2 className="mb-0">Your Dashboard</h2>
            <p className="text-muted">
              {layoutMode === 'edit' 
                ? 'Drag widgets to rearrange, resize them, or add new ones.' 
                : 'View mode: Drag is disabled. Switch to edit mode to make changes.'}
            </p>
            {unsavedChanges && (
              <Alert variant="info" className="p-2 mt-2">
                You have unsaved changes. 
                {autoSave ? ' They will be automatically saved.' : ' Remember to save your changes.'}
              </Alert>
            )}
          </Col>
          <Col xs="auto">
            <Button
              variant={layoutMode === 'edit' ? 'primary' : 'outline-primary'}
              className="me-2"
              onClick={toggleLayoutMode}
            >
              {layoutMode === 'edit' ? 'View Mode' : 'Edit Mode'}
            </Button>
            
            <div className="btn-group me-2">
              <Button
                variant={dashboardLayout === 'Grid' ? 'primary' : 'outline-primary'}
                onClick={() => handleLayoutModeChange('Grid')}
                disabled={layoutMode !== 'edit'}
              >
                Grid
              </Button>
              <Button
                variant={dashboardLayout === 'List' ? 'primary' : 'outline-primary'}
                onClick={() => handleLayoutModeChange('List')}
                disabled={layoutMode !== 'edit'}
              >
                List
              </Button>
              <Button
                variant={dashboardLayout === 'Compact' ? 'primary' : 'outline-primary'}
                onClick={() => handleLayoutModeChange('Compact')}
                disabled={layoutMode !== 'edit'}
              >
                Compact
              </Button>
            </div>
            
            <Button
              variant="outline-primary"
              className="me-2"
              onClick={() => setShowSettings(true)}
            >
              <SettingsIcon className="me-1" />
              Settings
            </Button>
            
            {layoutMode === 'edit' && (
              <>
                <Button
                  variant="primary"
                  className="me-2"
                  onClick={() => setShowAddWidget(true)}
                >
                  <AddIcon className="me-1" />
                  Add Widget
                </Button>
                
                {unsavedChanges && !autoSave && (
                  <Button
                    variant="success"
                    onClick={handleSaveSettings}
                  >
                    <SaveIcon className="me-1" />
                    Save
                  </Button>
                )}
              </>
            )}
          </Col>
        </Row>
        
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={60}
          onLayoutChange={handleLayoutChange}
          isDraggable={layoutMode === 'edit' && dashboardLayout === 'Grid'}
          isResizable={layoutMode === 'edit' && dashboardLayout === 'Grid'}
          containerPadding={[0, 0]}
        >
          {widgets.map(widget => (
            <div key={widget.id}>
              <WidgetRenderer
                type={widget.type}
    <Container fluid className="p-4">
      {/* Toast notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={showToast} 
          onClose={() => setShowToast(false)} 
          delay={3000} 
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Dashboard</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-0">Your Dashboard</h2>
          <p className="text-muted">
            {layoutMode === 'edit' 
              ? 'Drag widgets to rearrange, resize them, or add new ones.' 
              : 'View mode: Drag is disabled. Switch to edit mode to make changes.'}
          </p>
          {unsavedChanges && (
            <Alert variant="info" className="p-2 mt-2">
              You have unsaved changes. 
              {autoSave ? ' They will be automatically saved.' : ' Remember to save your changes.'}
            </Alert>
          )}
        </Col>
        <Col xs="auto">
          <Button
            variant={layoutMode === 'edit' ? 'primary' : 'outline-primary'}
            className="me-2"
            onClick={toggleLayoutMode}
          >
            {layoutMode === 'edit' ? 'View Mode' : 'Edit Mode'}
          </Button>
          
          <div className="btn-group me-2">
            <Button
              variant={dashboardLayout === 'Grid' ? 'primary' : 'outline-primary'}
              onClick={() => handleLayoutModeChange('Grid')}
              disabled={layoutMode !== 'edit'}
            >
              Grid
            </Button>
            <Button
              variant={dashboardLayout === 'List' ? 'primary' : 'outline-primary'}
              onClick={() => handleLayoutModeChange('List')}
              disabled={layoutMode !== 'edit'}
            >
              List
            </Button>
            <Button
              variant={dashboardLayout === 'Compact' ? 'primary' : 'outline-primary'}
              onClick={() => handleLayoutModeChange('Compact')}
              disabled={layoutMode !== 'edit'}
            >
              Compact
            </Button>
          </div>
          
          <Button
            variant="outline-primary"
            className="me-2"
            onClick={() => setShowSettings(true)}
          >
            <SettingsIcon className="me-1" />
            Settings
          </Button>
          
          {layoutMode === 'edit' && (
            <>
              <Button
                variant="primary"
                className="me-2"
                onClick={() => setShowAddWidget(true)}
              >
                <AddIcon className="me-1" />
                Add Widget
              </Button>
              
              {unsavedChanges && !autoSave && (
                <Button
                  variant="success"
                  onClick={handleSaveSettings}
                >
                  <SaveIcon className="me-1" />
                  Save
                </Button>
              )}
            </>
          )}
        </Col>
      </Row>
      
      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={60}
        onLayoutChange={handleLayoutChange}
        isDraggable={layoutMode === 'edit' && dashboardLayout === 'Grid'}
        isResizable={layoutMode === 'edit' && dashboardLayout === 'Grid'}
        containerPadding={[0, 0]}
      >
        {widgets.map(widget => (
          <div key={widget.id}>
            <WidgetRenderer
              type={widget.type}
              title={widget.title}
              config={widget.config}
              onRemove={layoutMode === 'edit' ? () => handleRemoveWidget(widget.id) : null}
              onConfigure={layoutMode === 'edit' ? () => handleConfigureWidget(widget.id) : null}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
      
      {/* Add Widget Offcanvas */}
      <Offcanvas show={showAddWidget} onHide={() => setShowAddWidget(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Add Widget</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <p className="text-muted mb-4">
            Choose a widget to add to your dashboard. You can configure it after adding.
          </p>
          
          <Row xs={1} className="g-4">
            {getAvailableWidgets(user.role).map(widget => (
              <Col key={widget.type}>
                <Card 
                  className="h-100 hover-elevate"
                  onClick={() => handleAddWidget(widget.type)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card.Body className="d-flex flex-column">
                    <div className="d-flex align-items-center mb-3">
                      <div className="widget-icon me-3">
                        {widget.icon}
                      </div>
                      <div>
                        <h5 className="mb-0">{widget.title}</h5>
                      </div>
                    </div>
                    <p className="text-muted mb-0">
                      {widget.description}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Offcanvas.Body>
      </Offcanvas>
      
      {/* Dashboard Settings Offcanvas */}
      <Offcanvas show={showSettings} onHide={() => setShowSettings(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Dashboard Settings</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label>Theme</Form.Label>
              <Form.Select 
                value={dashboardTheme}
                onChange={(e) => {
                  setDashboardTheme(e.target.value);
                  setSettingsChanged(true);
                  setUnsavedChanges(true);
                }}
              >
                <option value="Light">Light</option>
                <option value="Dark">Dark</option>
                <option value="System">System (use device setting)</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Choose how your dashboard looks
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Default Layout</Form.Label>
              <Form.Select 
                value={dashboardLayout}
                onChange={(e) => {
                  handleLayoutModeChange(e.target.value);
                }}
              >
                <option value="Grid">Grid (fully customizable)</option>
                <option value="List">List (single column)</option>
                <option value="Compact">Compact (two columns)</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Grid is fully customizable, list and compact have preset arrangements
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Check 
                type="switch"
                id="auto-save-switch"
                label="Auto-save dashboard changes"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
              />
              <Form.Text className="text-muted">
                Changes will be automatically saved after 5 seconds
              </Form.Text>
            </Form.Group>
            
            <hr />
            
            <div className="d-grid gap-2">
              <Button 
                variant="primary" 
                onClick={handleSaveSettings}
                className="mb-2"
              >
                Save Dashboard Settings
              </Button>
              
              <Button 
                variant="outline-danger" 
                onClick={handleResetToDefault}
              >
                Reset to Default Layout
              </Button>
            </div>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
      
      {/* Widget Configuration Modal */}
      {configWidget && (
        <WidgetConfigModal
          show={configWidget !== null}
          onHide={() => setConfigWidget(null)}
          widgetType={configWidget.type}
          widgetId={configWidget.id}
          title={configWidget.title}
          config={configWidget.config}
          onSave={handleSaveWidgetConfig}
          projectOptions={projects}
        />
      )}
    </Container>
  );
};

export default CustomDashboard; 