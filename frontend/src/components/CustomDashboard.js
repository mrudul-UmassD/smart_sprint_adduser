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
  ButtonGroup,
  Dropdown,
  Modal
} from 'react-bootstrap';
import { Add as AddIcon, Settings as SettingsIcon, Save as SaveIcon } from '@mui/icons-material';
import WidgetRenderer from './widgets/WidgetRenderer';
import WidgetConfigModal from './widgets/WidgetConfigModal';
import { 
  getAvailableWidgets, 
  getDashboardTemplate, 
  WIDGET_METADATA, 
  WIDGET_TYPES, 
  DEFAULT_WIDGET_CONFIGS 
} from './widgets/WidgetRegistry';
import { applyLayoutMode, updateWidgetsWithLayout } from './layouts/DashboardLayouts';
import API_CONFIG from '../config';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/dashboard.css';
import { useNavigate } from 'react-router-dom';
import WidgetSelector from './widgets/WidgetSelector';
import DashboardWidgets from './widgets/DashboardWidgets';
import { FaSave, FaEdit, FaCheck, FaTimes, FaFileExport, FaFileImport } from 'react-icons/fa';
import WidgetNotifications from './widgets/WidgetNotifications';
import { useNotifications } from '../contexts/NotificationContext';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { FaPlus } from 'react-icons/fa';
import EditableText from './EditableText';
import { showSuccess, showError, showInfo, showWarning } from '../utils/NotificationUtils';

// Make the grid responsive
const ResponsiveGridLayout = WidthProvider(Responsive);

/**
 * CustomDashboard Component
 * 
 * This component provides a fully customizable dashboard experience for users.
 * It allows users to:
 * - Add, remove, and configure widgets
 * - Arrange widgets using drag and drop
 * - Resize widgets to show more or less information
 * - Save dashboard layouts for future sessions
 * - Switch between different layout modes (Grid, List, Compact)
 * - Apply different themes to the dashboard
 * 
 * The dashboard pulls data from user's assigned projects and displays relevant 
 * metrics and visualizations through various widget types. Each widget can be 
 * individually configured to show data from specific projects.
 * 
 * Dashboard settings are persisted to the backend and loaded on component mount.
 * Default templates are provided based on user role when no settings exist.
 * 
 * Layout modes:
 * - Grid: Fully customizable with drag & drop and resizing
 * - List: Single column layout for mobile or simple viewing
 * - Compact: Two column layout for a more dense display
 * 
 * @param {Object} props.user - The current user object with role and permissions
 */
const CustomDashboard = ({ user }) => {
  // State for projects, loading status, and errors
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for dashboard configuration
  const [layout, setLayout] = useState({});
  const [widgets, setWidgets] = useState([]);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [dashboardTheme, setDashboardTheme] = useState('System');
  const [dashboardLayout, setDashboardLayout] = useState('Grid');
  const [settingsChanged, setSettingsChanged] = useState(false);
  const [configWidget, setConfigWidget] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [layoutMode, setLayoutMode] = useState('edit'); // 'edit' or 'view'
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [modeIndicator, setModeIndicator] = useState({ visible: false, message: '' });
  const saveTimeoutRef = useRef(null);
  const navigate = useNavigate();
  const [savedLayouts, setSavedLayouts] = useState([]);
  const [currentLayoutId, setCurrentLayoutId] = useState(null);
  const [dashboardName, setDashboardName] = useState('My Dashboard');
  const [successMessage, setSuccessMessage] = useState('');
  const [savingLayout, setSavingLayout] = useState(false);
  const [layouts, setLayouts] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [addWidgetModalOpen, setAddWidgetModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [canEdit, setCanEdit] = useState(true);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  
  // Fetch projects for use in widget configuration
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No authentication token found');
          return;
        }

        const response = await axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.USERS_ENDPOINT}/projects`, 
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        
        if (response.data && Array.isArray(response.data)) {
          // Format projects for use in select dropdowns
          const formattedProjects = response.data.map(project => ({
            id: project._id,
            name: project.name
          }));
          
          setProjects(formattedProjects);
        } else {
          console.error('Invalid project data format received');
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        const errorMessage = err.response?.data?.error || 'Failed to load projects';
        setError(errorMessage);
      }
    };
    
    fetchProjects();
  }, []);
  
  /**
   * Fetch user dashboard settings from the backend
   * If no settings exist, initialize with default templates based on user role
   */
  useEffect(() => {
    const fetchDashboardSettings = async () => {
      try {
        setLoading(true);
        
        // Use correct API endpoint and add auth token
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.SETTINGS_ENDPOINT}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
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
  
  /**
   * Initialize default dashboard based on user role
   * Uses predefined templates with widgets appropriate for each role
   */
  const initializeDefaultDashboard = useCallback(() => {
    const role = user?.role || 'Developer'; // Default to Developer if role not available
    const template = getDashboardTemplate(role);
    
    // Convert template to widgets with generated IDs
    const defaultWidgets = template.map((item, index) => {
      const id = `widget-${Date.now()}-${index}`;
      
      // Try to get title from available widgets or WIDGET_METADATA
      let widgetTitle;
      try {
        const availableWidget = getAvailableWidgets(role).find(w => w.type === item.type);
        if (availableWidget) {
          widgetTitle = availableWidget.title;
        } else {
          // Fallback to metadata
          const typeKey = Object.values(WIDGET_TYPES).find(type => type === item.type);
          widgetTitle = typeKey && WIDGET_METADATA[typeKey] ? WIDGET_METADATA[typeKey].title : item.type;
        }
      } catch (error) {
        console.error('Error getting widget title:', error);
        widgetTitle = item.type; // Use type as fallback
      }
      
      return {
        id,
        type: item.type,
        title: widgetTitle || item.type,
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
  
  // Show notification helper function
  const showNotification = (message, type = 'info') => {
    switch(type) {
      case 'success':
        showSuccess(message);
        break;
      case 'error':
        showError(message);
        break;
      case 'warning':
        showWarning(message);
        break;
      default:
        showInfo(message);
    }
  };
  
  /**
   * Handle layout changes from react-grid-layout
   * Updates the widget positions in state and marks changes for saving
   */
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
  
  /**
   * Add a new widget to the dashboard
   * Fetches widget metadata based on the type and adds it to the layout
   */
  const handleAddWidget = (widgetType, title) => {
    // Try to get widget info from available widgets or WIDGET_METADATA
    let widgetInfo;
    try {
      widgetInfo = getAvailableWidgets(user?.role || 'Developer').find(w => w.type === widgetType);
      
      if (!widgetInfo) {
        // Fallback to metadata
        const typeKey = Object.values(WIDGET_TYPES).find(type => type === widgetType);
        if (typeKey && WIDGET_METADATA[typeKey]) {
          widgetInfo = {
            type: widgetType,
            title: WIDGET_METADATA[typeKey].title,
            defaultConfig: DEFAULT_WIDGET_CONFIGS[typeKey] || {},
            defaultDimensions: { w: 6, h: 8 } // Default dimensions
          };
        }
      }
    } catch (error) {
      console.error('Error getting widget info:', error);
      // Create a basic widgetInfo if we couldn't get proper data
      widgetInfo = {
        type: widgetType,
        title: title || widgetType,
        defaultConfig: {},
        defaultDimensions: { w: 6, h: 8 }
      };
    }
    
    if (!widgetInfo) return;
    
    const id = `widget-${Date.now()}`;
    const defaultDimensions = widgetInfo.defaultDimensions || { w: 6, h: 8 };
    
    // Create new widget
    const newWidget = {
      id,
      type: widgetType,
      title: title || widgetInfo.title || widgetType,
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
    
    setUnsavedChanges(true);
    setShowWidgetSelector(false);
    showNotification(`Added ${newWidget.title} widget`);
    
    // If the widget requires configuration (like selecting a project), open config modal
    const requiresConfig = newWidget.type.includes('PROJECT') || 
                          newWidget.type.includes('BURNDOWN') || 
                          WIDGET_METADATA[newWidget.type]?.requiredConfigFields?.length > 0;
                          
    if (requiresConfig) {
      setConfigWidget(newWidget);
    }
  };
  
  /**
   * Remove a widget from the dashboard
   */
  const handleRemoveWidget = (widgetId) => {
    const updatedWidgets = widgets.filter(widget => widget.id !== widgetId);
    setWidgets(updatedWidgets);
    
    // Apply the current layout mode
    const newLayout = applyLayoutMode(dashboardLayout, updatedWidgets);
    setLayout(newLayout);
    
    setUnsavedChanges(true);
    showNotification('Widget removed');
  };
  
  /**
   * Open the configuration modal for a widget
   */
  const handleConfigureWidget = (widgetId) => {
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      setConfigWidget(widget);
    }
  };
  
  /**
   * Save widget configuration changes
   */
  const handleSaveWidgetConfig = (widgetId, newConfig) => {
    const updatedWidgets = widgets.map(widget => {
      if (widget.id === widgetId) {
        return {
          ...widget,
          title: newConfig.title || widget.title,
          config: newConfig.config || widget.config
        };
      }
      return widget;
    });
    
    setWidgets(updatedWidgets);
    setConfigWidget(null);
    setUnsavedChanges(true);
    showNotification('Widget configuration updated');
  };
  
  /**
   * Reset the dashboard to default layout based on user role
   */
  const handleResetToDefault = () => {
    if (window.confirm('Are you sure you want to reset to the default dashboard layout? This will remove all custom widgets.')) {
      initializeDefaultDashboard();
      showNotification('Dashboard reset to default layout');
    }
  };
  
  /**
   * Toggle between edit and view modes
   * Edit mode enables dragging and resizing, view mode disables it
   */
  const toggleLayoutMode = () => {
    setLayoutMode(layoutMode === 'edit' ? 'view' : 'edit');
    showNotification(layoutMode === 'edit' ? 'View mode - drag disabled' : 'Edit mode - drag enabled');
  };
  
  /**
   * Change the dashboard layout mode (Grid, List, Compact)
   */
  const handleLayoutModeChange = (mode) => {
    if (mode === dashboardLayout) return;
    
    setDashboardLayout(mode);
    setSettingsChanged(true);
    setUnsavedChanges(true);
    showNotification(`Layout changed to ${mode} mode`);
  };
  
  /**
   * Save dashboard settings to the backend
   * Stores theme, layout mode, and widget configurations
   */
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found');
        setLoading(false);
        return;
      }
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // First, save theme and layout
      if (settingsChanged) {
        await axios.patch(`${API_CONFIG.BASE_URL}${API_CONFIG.SETTINGS_ENDPOINT}/dashboard/theme`, {
          theme: dashboardTheme
        }, { headers });
        
        await axios.patch(`${API_CONFIG.BASE_URL}${API_CONFIG.SETTINGS_ENDPOINT}/dashboard/layout`, {
          layout: dashboardLayout
        }, { headers });
        
        setSettingsChanged(false);
      }
      
      // Prepare dashboard data
      const dashboardData = {
        widgets: widgets.map(widget => {
          // Convert layout to position format expected by the API
          const position = {
            x: widget.layout.x,
            y: widget.layout.y,
            width: widget.layout.w,
            height: widget.layout.h
          };
          
          return {
            id: widget.id,
            type: widget.type,
            title: widget.title,
            position,
            config: widget.config
          };
        }),
        layouts: layout
      };
      
      // Save the entire dashboard configuration in one request
      await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.SETTINGS_ENDPOINT}/dashboard`, 
        dashboardData, 
        { headers }
      );
      
      setUnsavedChanges(false);
      showNotification('Dashboard settings saved successfully');
      setLoading(false);
    } catch (err) {
      console.error('Error saving dashboard settings:', err);
      const errorMessage = err.response?.data?.error || 'Failed to save dashboard settings';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
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
  
  // Fetch saved layouts from backend
  const fetchSavedLayouts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        showNotification('Not authenticated', 'error');
        return;
      }
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.USERS_ENDPOINT}/dashboard-layouts`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Check if we have layouts data in the response
      if (response.data && Array.isArray(response.data)) {
        // Sort layouts by most recently updated
        const sortedLayouts = response.data.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        setSavedLayouts(sortedLayouts);
        
        // Load the most recent layout if none is loaded
        if (!currentLayoutId && (!layout.lg || layout.lg.length === 0)) {
          const mostRecent = sortedLayouts[0];
          if (mostRecent) {
            setLayout(mostRecent.layouts || {});
            setWidgets(mostRecent.widgets || []);
            setCurrentLayoutId(mostRecent._id);
            setDashboardName(mostRecent.name || 'My Dashboard');
          }
        }
      } else {
        console.log('No saved layouts found');
      }
    } catch (error) {
      console.error('Error fetching saved layouts:', error);
      const errorMessage = error.response?.data?.error || 'Failed to load saved dashboard layouts';
      showNotification(errorMessage, 'error');
    }
  };
  
  // Update an existing layout
  const updateLayout = async (layoutId) => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Not authenticated', 'error');
        setIsSaving(false);
        return;
      }
      
      const layoutData = {
        name: dashboardName,
        layouts: layout,
        widgets: widgets
      };
      
      const response = await axios.put(
        `${API_CONFIG.BASE_URL}${API_CONFIG.USERS_ENDPOINT}/dashboard-layouts/${layoutId}`,
        layoutData,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        showNotification('Dashboard layout updated', 'success');
        setUnsavedChanges(false);
        // Refresh the saved layouts
        fetchSavedLayouts();
      } else {
        showNotification(response.data.message || 'Failed to update dashboard layout', 'error');
      }
    } catch (error) {
      console.error('Error updating dashboard layout:', error);
      const errorMessage = error.response?.data?.error || 'Error updating dashboard layout';
      showNotification(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Load saved layouts on component mount
  useEffect(() => {
    if (user && user.id) {
      fetchSavedLayouts();
    }
  }, [user]);
  
  // Save current layout to backend
  const saveCurrentLayout = async (layoutName = dashboardName || 'My Dashboard') => {
    setSavingLayout(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Not authenticated', 'error');
        setSavingLayout(false);
        return;
      }
      
      const layoutData = {
        name: layoutName,
        layouts: layout,
        widgets: widgets
      };
      
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.USERS_ENDPOINT}/dashboard-layouts`,
        layoutData,
        {
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        showNotification(`Dashboard layout saved as "${layoutName}"`, 'success');
        setCurrentLayoutId(response.data.layoutId || response.data.data?._id);
        setUnsavedChanges(false);
        // Refresh the saved layouts
        fetchSavedLayouts();
      } else {
        showNotification(response.data?.message || 'Failed to save dashboard layout', 'error');
      }
    } catch (error) {
      console.error('Error saving dashboard layout:', error);
      const errorMessage = error.response?.data?.error || 'Error saving dashboard layout';
      showNotification(errorMessage, 'error');
    } finally {
      setSavingLayout(false);
    }
  };
  
  // Toggle dashboard name editing
  const toggleNameEdit = () => {
    setIsEditingName(!isEditingName);
  };

  // Handle dashboard name change
  const handleNameChange = (e) => {
    setDashboardName(e.target.value);
  };

  // Save dashboard name
  const saveDashboardName = () => {
    setIsEditingName(false);
    // Update the name in the current layout if it exists
    if (currentLayoutId) {
      saveCurrentLayout(dashboardName);
    }
  };

  // Cancel name editing
  const cancelNameEdit = () => {
    setIsEditingName(false);
  };

  // Show save as modal
  const showSaveAsModal = () => {
    setNewLayoutName(dashboardName);
    setShowSaveModal(true);
  };

  // Handle save as submit
  const handleSaveAs = () => {
    saveCurrentLayout(newLayoutName);
    setDashboardName(newLayoutName);
    setShowSaveModal(false);
  };

  // Load a saved layout
  const loadSavedLayout = (layoutId) => {
    const selectedLayout = savedLayouts.find(layout => layout._id === layoutId);
    if (selectedLayout) {
      setLayout(selectedLayout.layouts);
      setWidgets(selectedLayout.widgets);
      setDashboardName(selectedLayout.name);
      setCurrentLayoutId(selectedLayout._id);
      setUnsavedChanges(false);
      showNotification(`Loaded dashboard: ${selectedLayout.name}`, 'success');
    }
  };

  // Export dashboard configuration
  const exportDashboardConfig = () => {
    const config = {
      name: dashboardName,
      layouts: layout,
      widgets: widgets
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dashboard-${dashboardName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0,10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import dashboard configuration
  const importDashboardConfig = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target.result);
        if (config.layouts && config.widgets) {
          setLayout(config.layouts);
          setWidgets(config.widgets);
          setDashboardName(config.name || 'Imported Dashboard');
          setUnsavedChanges(true);
          showNotification('Dashboard configuration imported successfully', 'success');
        } else {
          showNotification('Invalid dashboard configuration file', 'error');
        }
      } catch (error) {
        console.error('Error parsing dashboard config:', error);
        showNotification('Failed to parse dashboard configuration file', 'error');
      }
    };
    reader.readAsText(file);
    
    // Reset the file input
    event.target.value = null;
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
  
  // The main dashboard rendering
  return (
    <div className={`dashboard-container theme-${dashboardTheme} ${layoutMode === 'edit' ? 'dashboard-edit-mode' : 'dashboard-view-mode'}`}>
      <Container fluid className="p-4">
        {/* Toast notification */}
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 5 }}>
          {notification.show && (
            <div className={`alert alert-${notification.type} alert-dismissible fade show`} role="alert">
              {notification.message}
              <button type="button" className="btn-close" onClick={() => setNotification({ ...notification, show: false })}></button>
            </div>
          )}
        </div>

        <Row className="mb-4 align-items-center position-relative">
          <Col>
            <h2 className="mb-0">Your Dashboard</h2>
            <p className="text-muted">
              {layoutMode === 'edit' 
                ? 'Edit mode: Drag widgets to rearrange, resize, or remove them'
                : 'View mode: Interact with your dashboard widgets'
              }
            </p>
          </Col>
          <Col xs="auto" className="d-flex align-items-center">
            {/* Add WidgetNotifications component */}
            <div className="me-3">
              <WidgetNotifications />
            </div>
            
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
              <span className="me-1">⚙️</span>
              Settings
            </Button>
            
            {layoutMode === 'edit' && (
              <>
                <Button
                  variant="primary"
                  className="me-2"
                  onClick={() => setShowWidgetSelector(true)}
                >
                  <span className="me-1">+</span>
                  Add Widget
                </Button>
                
                {unsavedChanges && !autoSave && (
                  <Button
                    variant="success"
                    onClick={handleSaveSettings}
                  >
                    <span className="me-1">💾</span>
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
        
        {/* Replace the Add Widget Offcanvas with WidgetSelector */}
        <WidgetSelector 
          show={showWidgetSelector} 
          onClose={() => setShowWidgetSelector(false)} 
          onSelectWidget={handleAddWidget} 
          userRole={user?.role || 'Developer'} 
        />
        
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
            config={configWidget.config}
            onSaveConfig={(newConfig) => handleSaveWidgetConfig(configWidget.id, { config: newConfig, title: configWidget.title })}
            projectOptions={projects}
          />
        )}

        {/* Save As Modal */}
        <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Save Dashboard As</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Dashboard Name</Form.Label>
              <Form.Control
                type="text"
                value={newLayoutName}
                onChange={(e) => setNewLayoutName(e.target.value)}
                placeholder="Enter dashboard name"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAs} disabled={!newLayoutName.trim()}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        {addWidgetModalOpen && (
          <WidgetSelector
            show={addWidgetModalOpen}
            onClose={() => setAddWidgetModalOpen(false)}
            onSelectWidget={handleAddWidget}
            userRole={user?.role || 'Developer'}
          />
        )}
      </Container>
    </div>
  );
};

export default CustomDashboard; 