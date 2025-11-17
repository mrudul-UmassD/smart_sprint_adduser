import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { Container, Row, Col, Card, Badge, ProgressBar, Alert, Dropdown, Modal, InputGroup, Form, Button, Spinner, ButtonGroup } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import API_CONFIG from '../config';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import moment from 'moment';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import '../styles/dashboard.css';
import { toast } from 'react-hot-toast';

// Import components
import WidgetSelector from './widgets/WidgetSelector';
import DashboardWidgets from './widgets/DashboardWidgets';
import WidgetConfigModal from './widgets/WidgetConfigModal';
import DashboardTemplates from './Dashboard/DashboardTemplates';
import DashboardFilters from './Dashboard/DashboardFilters';
import WidgetNotifications from './widgets/WidgetNotifications';

// Import widget components
import ProjectSummaryWidget from './widgets/ProjectSummaryWidget';
import MyTasksWidget from './widgets/MyTasksWidget';
import BurndownChartWidget from './widgets/BurndownChartWidget';
import TeamPerformanceWidget from './widgets/TeamPerformanceWidget';

// Import icons - cleaned up to only used ones
import { 
    BsFilter
} from 'react-icons/bs';

import { 
    FaPlus, 
    FaCog, 
    FaMoon, 
    FaSun, 
    FaTrash,
    FaThLarge,
    FaSave,
    FaCheck,
    FaEdit,
    FaFileExport,
    FaFileImport
} from 'react-icons/fa';

import { 
    FiTrash2
} from 'react-icons/fi';

import {
  WIDGET_COMPONENTS,
  DEFAULT_WIDGETS,
  DEFAULT_WIDGET_LAYOUTS,
  WIDGET_METADATA,
  WIDGET_TYPES,
  DEFAULT_WIDGET_CONFIGS
} from './widgets/WidgetRegistry';

// Simple auth utils since we don't have the actual file
const getToken = () => localStorage.getItem('token');
const removeTokenAndRedirect = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Navigation will be handled in the component
};

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement,
  Title
);

const ResponsiveGridLayout = WidthProvider(Responsive);

// Define the widget components registry
const widgetComponents = {
  'projectSummary': ProjectSummaryWidget,
  'myTasks': MyTasksWidget,
  'burndownChart': BurndownChartWidget,
  'teamPerformance': TeamPerformanceWidget
};

const Dashboard = () => {
    // Theme state - since toggleTheme was removed to fix duplication
    const [theme, setTheme] = useState(localStorage.getItem('dashboardTheme') || 'light');
    
    // Toggle theme function
    const toggleTheme = useCallback(() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('dashboardTheme', newTheme);
        document.body.setAttribute('data-dashboard-theme', newTheme);
    }, [theme]);
    
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [dashboardData, setDashboardData] = useState(null);
    const [timeRange, setTimeRange] = useState('month'); // week, month, year
    const [selectedProject, setSelectedProject] = useState('all');
    const [projects, setProjects] = useState([]);
    const [showWidgetSelector, setShowWidgetSelector] = useState(false);
    const [showWidgetConfig, setShowWidgetConfig] = useState(false);
    const [currentWidget, setCurrentWidget] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [widgets, setWidgets] = useState([]);
    const [layouts, setLayouts] = useState({ lg: [] });
    const [showImportExport, setShowImportExport] = useState(false);
    const [showTemplatesModal, setShowTemplatesModal] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [dashboardName, setDashboardName] = useState('My Dashboard');
    const [isEditingName, setIsEditingName] = useState(false);
    const [savingLayout, setSavingLayout] = useState(false);
    const [savedLayouts, setSavedLayouts] = useState([]);
    const [isDashboardModified, setIsDashboardModified] = useState(false);
    const [isImportMode, setIsImportMode] = useState(false);
    const [importConfig, setImportConfig] = useState(null);
    const [width, setWidth] = useState(window.innerWidth);
    
    const [filters, setFilters] = useState({
        dateRange: {
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            endDate: new Date()
        },
        projectId: '',
        userId: '',
        priority: '',
        status: ''
    });
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Check for debug mode in URL
        const params = new URLSearchParams(location.search);
        const debugMode = params.get('debug') === 'true';
        
        if (debugMode) {
            console.log('Debug mode enabled, skipping authentication checks');
            // Set some dummy user data for testing
            setUserDetails({
                username: 'admin',
                role: 'Admin',
                team: 'Management',
                level: 'Senior'
            });
            return;
        }
        
        fetchUserDetails();
    }, [navigate, location]);

    const fetchUserDetails = async () => {
        const token = getToken();
        
        if (!token) {
            console.log('No token found, redirecting to login');
            navigate('/login');
            return;
        }
        
        try {
            setLoading(true);
            console.log('Fetching user details from:', `${API_CONFIG.API_URL}/api/users/me`);
            console.log('Using token of length:', token.length);
            
            const response = await axios.get(`${API_CONFIG.API_URL}/api/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('User details API response:', response.data);
            
            if (response.data) {
                setUserDetails(response.data);
                // Moved projects fetching to useEffect to prevent circular dependencies
            } else {
                console.error('Invalid user data received:', response.data);
                setError('Invalid user data received');
            }
        } catch (error) {
            console.error('Error fetching user details:', error);
            console.error('Response data:', error.response?.data);
            console.error('Response status:', error.response?.status);
            
            setError('Failed to load user data: ' + (error.response?.data?.message || error.message));
            
            // Create a minimal user object to allow the dashboard to render
            setUserDetails({
                username: 'User',
                role: 'User',
                team: 'Unknown',
                level: 'Unknown'
            });
            
            // Only redirect on specific auth errors
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                console.log('Authentication error, redirecting to login');
                setTimeout(() => navigate('/login'), 3000);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Helper function to get badge color based on role
    const getRoleBadgeColor = (role) => {
        switch(role) {
            case 'Admin': return 'danger';
            case 'Project Manager': return 'warning';
            case 'Developer': return 'primary';
            default: return 'secondary';
        }
    };

    // Helper function to get badge color based on team
    const getTeamBadgeColor = (team) => {
        switch(team) {
            case 'Design': return 'info';
            case 'Database': return 'dark';
            case 'Backend': return 'success';
            case 'Frontend': return 'primary';
            case 'DevOps': return 'danger';
            case 'Tester/Security': return 'warning';
            case 'admin': return 'danger';
            case 'pm': return 'warning';
            default: return 'secondary';
        }
    };

    const fetchProjects = useCallback(async (userData) => {
        try {
            const token = getToken();
            if (!token) return;
            
            const response = await axios.get(`${API_CONFIG.API_URL}/api/projects`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data) {
                setProjects(response.data);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to load projects');
        }
    }, []);

    const fetchDashboardData = useCallback(async (range, projectId) => {
        try {
            setLoading(true);
            
            // Build query params
            let params = new URLSearchParams();
            params.append('timeRange', range);
            
            if (projectId !== 'all') {
                params.append('projectId', projectId);
            }
            
            // Add new filters - Fix date formatting to ensure valid dates are sent
            if (filters.dateRange.startDate && filters.dateRange.endDate) {
                // Ensure we're working with valid Date objects
                const startDate = new Date(filters.dateRange.startDate);
                const endDate = new Date(filters.dateRange.endDate);
                
                // Only add dates if they're valid
                if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                    params.append('startDate', startDate.toISOString());
                    params.append('endDate', endDate.toISOString());
                } else {
                    console.warn('Invalid date detected, skipping date filter', {
                        startDate: filters.dateRange.startDate,
                        endDate: filters.dateRange.endDate
                    });
                }
            }
            
            if (filters.userId) {
                params.append('userId', filters.userId);
            }
            
            if (filters.priority) {
                params.append('priority', filters.priority);
            }
            
            if (filters.status) {
                params.append('status', filters.status);
            }
            
            const token = getToken();
            if (!token) return;
            
            console.log('Fetching dashboard data from:', `${API_CONFIG.API_URL}${API_CONFIG.ANALYTICS_ENDPOINT}/dashboard`);
            console.log('With params:', Object.fromEntries(params));
            
            const response = await axios.get(`${API_CONFIG.API_URL}${API_CONFIG.ANALYTICS_ENDPOINT}/dashboard`, {
                params: Object.fromEntries(params)
            });
            
            console.log('Dashboard data response:', response.data);
            
            if (response.data) {
                setDashboardData(response.data);
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            console.error('Error response:', err.response?.data);
            setError('Failed to load dashboard data: ' + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    }, [filters]);

    // Fetch saved dashboard layouts from the backend
    const fetchSavedLayouts = useCallback(async () => {
        try {
            const token = getToken();
            if (!token) {
                console.log('No token available for fetching saved layouts');
                return;
            }

            console.log('Fetching saved dashboard layouts...');
            const response = await axios.get(`${API_CONFIG.API_URL}${API_CONFIG.USERS_ENDPOINT}/dashboard-layouts`);
            
            console.log('Saved layouts response:', response.data);
            
            if (response.data && response.data.layouts) {
                setSavedLayouts(response.data.layouts);
                
                // If there's a default layout, set it as current
                const defaultLayout = response.data.layouts.find(layout => layout.isDefault);
                if (defaultLayout) {
                    console.log('Found default layout:', defaultLayout.name);
                    setDashboardName(defaultLayout.name);
                    setLayouts(defaultLayout.layouts || {});
                    setWidgets(defaultLayout.widgets || []);
                    setIsDashboardModified(false);
                }
            } else {
                console.log('No saved layouts found or invalid format');
            }
        } catch (error) {
            console.error('Error fetching saved layouts:', error);
            console.error('Error response:', error.response?.data);
            // Don't set an error message here to avoid blocking the dashboard
            console.log('Failed to load saved dashboard layouts, using default');
        }
    }, []);

    // Generate a default layout for widgets
    const generateDefaultLayout = useCallback((widgetList) => {
        const defaultLayouts = {
            lg: widgetList.map((widget, index) => ({
                i: widget.id,
                x: (index % 2) * 6,
                y: Math.floor(index / 2) * 8,
                w: 6,
                h: 8,
                minW: 3,
                minH: 4
            }))
        };
        setLayouts(defaultLayouts);
    }, []);

    // Load dashboard configuration
    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);
            console.log('Loading dashboard configuration...');
            
            const response = await axios.get(`${API_CONFIG.API_URL}${API_CONFIG.USERS_ENDPOINT}/settings/dashboard`);
            
            console.log('Dashboard config response:', response.data);
            
            if (response.data && response.data.widgets) {
                setWidgets(response.data.widgets);
                if (response.data.layouts) {
                    setLayouts(response.data.layouts);
                } else {
                    // Generate default layout if none exists
                    generateDefaultLayout(response.data.widgets);
                }
                setIsDashboardModified(false);
            } else {
                console.log('No saved dashboard configuration found, using default');
                // Set a default widget if user has no configuration
                const defaultWidget = {
                    id: uuidv4(),
                    type: 'projectSummary',
                    config: { projectId: 'all' }
                };
                setWidgets([defaultWidget]);
                generateDefaultLayout([defaultWidget]);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            console.error('Error response:', error.response?.data);
            
            // Create a default widget on error
            console.log('Setting up default dashboard due to error');
            const defaultWidget = {
                id: uuidv4(),
                type: 'projectSummary',
                config: { projectId: 'all' }
            };
            setWidgets([defaultWidget]);
            generateDefaultLayout([defaultWidget]);
        } finally {
            setLoading(false);
        }
    }, [generateDefaultLayout]);

    // Now that the functions are defined, we can use them in the useEffect
    useEffect(() => {
        // Check if we have userDetails before trying to fetch data
        if (userDetails) {
            console.log('User details available, fetching dashboard data');
            fetchProjects();
            fetchDashboardData(timeRange, selectedProject);
            fetchSavedLayouts();
            // Also try to load the dashboard configuration
            loadDashboard();
        }
    }, [userDetails, timeRange, selectedProject, fetchProjects, fetchDashboardData, fetchSavedLayouts, loadDashboard]);

    const getRangeLabel = () => {
        switch (timeRange) {
            case 'week': return 'Past 7 Days';
            case 'month': return 'Past 30 Days';
            case 'year': return 'Past 12 Months';
            default: return 'Past 30 Days';
        }
    };

    const getTaskStatusChartData = () => {
        if (!dashboardData || !dashboardData.taskStatusCounts) return null;
        
        return {
            labels: Object.keys(dashboardData.taskStatusCounts),
            datasets: [
                {
                    data: Object.values(dashboardData.taskStatusCounts),
                    backgroundColor: [
                        '#FF6384', // To Do
                        '#36A2EB', // In Progress
                        '#FFCE56', // In Review
                        '#4BC0C0', // Done
                        '#9966FF'  // Blocked
                    ],
                    borderWidth: 1
                },
            ],
        };
    };

    const getTaskCompletionChartData = () => {
        if (!dashboardData || !dashboardData.taskCompletionData) return null;
        
        return {
            labels: dashboardData.taskCompletionData.map(d => moment(d.date).format('MMM D')),
            datasets: [
                {
                    label: 'Tasks Completed',
                    data: dashboardData.taskCompletionData.map(d => d.count),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                },
            ],
        };
    };

    const getTimeTrackedChartData = () => {
        if (!dashboardData || !dashboardData.timeTrackedData) return null;
        
        return {
            labels: dashboardData.timeTrackedData.map(d => moment(d.date).format('MMM D')),
            datasets: [
                {
                    label: 'Hours Tracked',
                    data: dashboardData.timeTrackedData.map(d => Math.round(d.minutes / 60 * 10) / 10), // Convert mins to hours with 1 decimal
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                },
            ],
        };
    };

    const getTasksByAssigneeData = () => {
        if (!dashboardData || !dashboardData.tasksByAssignee) return null;
        
        const sortedData = [...dashboardData.tasksByAssignee]
            .sort((a, b) => b.taskCount - a.taskCount)
            .slice(0, 5); // Top 5 assignees
            
        return {
            labels: sortedData.map(d => d.name),
            datasets: [
                {
                    label: 'Tasks Assigned',
                    data: sortedData.map(d => d.taskCount),
                    backgroundColor: 'rgba(153, 102, 255, 0.6)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                },
            ],
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    };

    // Save dashboard configuration
    const saveDashboardConfig = useCallback(async () => {
        if (!userDetails) return;
        
        try {
            console.log('Saving dashboard configuration...');
            const token = getToken();
            await axios.post(`${API_CONFIG.API_URL}${API_CONFIG.SETTINGS_ENDPOINT}/dashboard`, {
                widgets,
                layouts
            });
            
            console.log('Dashboard configuration saved successfully');
            setIsDashboardModified(false);
            
            // Show success notification
            setNotification({
                show: true,
                message: 'Dashboard configuration saved successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error saving dashboard configuration:', error);
            console.error('Error response:', error.response?.data);
            setError('Failed to save dashboard: ' + (error.response?.data?.message || error.message));
            setIsDashboardModified(true);
            
            // Show error notification
            setNotification({
                show: true,
                message: 'Failed to save dashboard configuration',
                type: 'error'
            });
            
            // Don't logout on save error
            if (error.response && error.response.status === 401) {
                console.log('Token expired during save, but not redirecting yet');
            }
        }
    }, [widgets, layouts, userDetails]);

    // Save dashboard config when widgets or layouts change - limit frequency of saves
    useEffect(() => {
        // Only save if we have widgets and aren't in initial loading state
        if (widgets.length > 0 && !loading && userDetails && isDashboardModified) {
            console.log('Dashboard modified, scheduling save...');
            
            // Use debounce to avoid too many API calls
            const timeoutId = setTimeout(() => {
                console.log('Executing scheduled save');
                saveDashboardConfig();
            }, 5000); // Increased to 5 seconds to reduce frequency
            
            return () => {
                console.log('Clearing scheduled save timeout');
                clearTimeout(timeoutId);
            };
        }
    }, [widgets, layouts, loading, saveDashboardConfig, userDetails, isDashboardModified]);

    // Add a new widget
    const handleAddWidget = (widgetType, widgetConfig) => {
        const widgetId = uuidv4();
        
        // Get default config from registry or use empty object
        const defaultConfig = DEFAULT_WIDGET_CONFIGS[widgetType] || {};
        
        // Create new widget
        const newWidget = {
            id: widgetId,
            type: widgetType,
            config: {
                ...defaultConfig,
                ...widgetConfig,
                id: widgetId // Add id to config too so it's available to the widget
            }
        };
        
        // Add to widgets array
        setWidgets([...widgets, newWidget]);
        
        // Get widget metadata for default size
        const metadata = WIDGET_METADATA[widgetType];
        const defaultSize = metadata?.defaultSize || { w: 6, h: 4 };
        
        // Add to layout
        const newLayout = [
            ...layouts.lg,
            {
                i: widgetId,
                x: (layouts.lg.length * 6) % 12,
                y: Math.floor((layouts.lg.length * 6) / 12) * 4,
                w: defaultSize.w,
                h: defaultSize.h,
                minW: 3,
                minH: 3
            }
        ];
        
        setLayouts({ ...layouts, lg: newLayout });
        setIsDashboardModified(true);
        
        // Close widget selector
        setShowWidgetSelector(false);
        
        // Show success notification
        toast.success('Widget added successfully!');
    };

    // Remove widget from dashboard
    const handleRemoveWidget = (widgetId) => {
        console.log('Removing widget:', widgetId);
        setWidgets(widgets.filter(widget => widget.id !== widgetId));
        
        const updatedLayouts = { ...layouts };
        updatedLayouts.lg = updatedLayouts.lg.filter(layout => layout.i !== widgetId);
        setLayouts(updatedLayouts);
        setIsDashboardModified(true);
        
        // Show notification
        setNotification({
            show: true,
            message: 'Widget removed',
            type: 'info'
        });
    };

    // Open widget configuration modal
    const handleConfigureWidget = (widget) => {
        console.log('Configuring widget:', widget);
        setCurrentWidget(widget);
        setShowWidgetConfig(true);
    };

    // Update widget configuration
    const handleUpdateWidgetConfig = (widgetId, newConfig) => {
        console.log('Updating widget config:', widgetId, newConfig);
        setWidgets(prevWidgets => 
            prevWidgets.map(widget => 
                widget.id === widgetId 
                    ? { ...widget, config: newConfig } 
                    : widget
            )
        );
        setIsDashboardModified(true);
        
        // Show notification
        setNotification({
            show: true,
            message: 'Widget configuration updated',
            type: 'success'
        });
    };

    // Handle layout changes - make sure to mark as modified
    const handleLayoutChange = (layout, allLayouts) => {
        setLayouts(allLayouts);
        setIsDashboardModified(true);
    };

    // Import dashboard configuration
    const handleImportConfig = (config) => {
        if (config.widgets) {
            setWidgets(config.widgets);
        }
        
        if (config.layouts) {
            setLayouts(config.layouts);
        } else {
            generateDefaultLayout(config.widgets);
        }
    };

    // Handle applying a dashboard template
    const handleApplyTemplate = (template) => {
        try {
            console.log('Applying template:', template);
            
            // Set widgets from template
            setWidgets(template.widgets || []);
            
            // Set layouts from template
            if (template.layouts) {
                setLayouts(template.layouts);
            } else {
                // If no layouts provided, generate default layout
                generateDefaultLayout(template.widgets);
            }
            
            // Update dashboard name
            if (template.name) {
                setDashboardName(template.name);
            }
            
            setIsDashboardModified(true);
            
            toast.success(`${template.name || 'Template'} applied successfully!`);
        } catch (error) {
            console.error('Error applying template:', error);
            toast.error('Failed to apply dashboard template');
        }
    };

    // Export dashboard configuration
    const handleExportDashboard = () => {
        // Create export configuration
        const dashboardConfig = {
            layouts,
            widgets
        };
        
        // Just open the export dialog directly
        exportDashboardConfig();
    };

    // Export dashboard configuration as JSON file
    const exportDashboardConfig = () => {
        const config = {
            name: dashboardName,
            layouts,
            widgets,
            exportDate: new Date().toISOString()
        };

        // Create a blob and download link
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${dashboardName.replace(/\s+/g, '_')}_config.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        setNotification({
            show: true,
            message: 'Dashboard configuration exported successfully',
            type: 'success'
        });
    };

    // Import dashboard configuration from JSON file
    const importDashboardConfig = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                
                // Validate the imported configuration
                if (!config.layouts || !config.widgets) {
                    throw new Error('Invalid configuration file');
                }
                
                // Apply the imported configuration
                setDashboardName(config.name || 'Imported Dashboard');
                setLayouts(config.layouts);
                setWidgets(config.widgets);
                
                setNotification({
                    show: true,
                    message: 'Dashboard configuration imported successfully',
                    type: 'success'
                });
            } catch (error) {
                console.error('Error importing configuration:', error);
                setError('Failed to import dashboard configuration');
            }
        };
        reader.readAsText(file);
        
        // Reset the input to allow reimporting the same file
        event.target.value = null;
    };

    // Toggle edit mode for dashboard name
    const toggleEditingName = () => {
        setIsEditingName(!isEditingName);
    };

    // Handle applying filters from the filter modal
    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        
        // Count active filters for the badge
        let count = 0;
        if (newFilters.dateRange.startDate && newFilters.dateRange.endDate) count++;
        if (newFilters.projectId) count++;
        if (newFilters.userId) count++;
        if (newFilters.priority) count++;
        if (newFilters.status) count++;
        
        setActiveFiltersCount(count);
    };

    // Save current dashboard layout
    const saveCurrentLayout = async () => {
        setSavingLayout(true);
        try {
            const token = getToken();
            if (!token) {
                setError('Authentication required');
                setSavingLayout(false);
                return;
            }

            // Clean and sanitize the data before sending
            // Remove any invalid data like circular references or non-serializable values
            const sanitizedWidgets = widgets.map(widget => ({
                id: widget.id,
                type: widget.type,
                config: { ...widget.config }
            }));

            // Make sure layouts have proper format
            const sanitizedLayouts = {};
            if (layouts && layouts.lg && Array.isArray(layouts.lg)) {
                sanitizedLayouts.lg = layouts.lg.map(item => ({
                    i: item.i,
                    x: item.x || 0,
                    y: item.y || 0,
                    w: item.w || 6,
                    h: item.h || 4,
                    minW: item.minW || 3,
                    minH: item.minH || 3
                }));
            } else {
                // Create a default layout if none exists
                sanitizedLayouts.lg = sanitizedWidgets.map((widget, index) => ({
                    i: widget.id,
                    x: (index % 2) * 6,
                    y: Math.floor(index / 2) * 8,
                    w: 6,
                    h: 8,
                    minW: 3,
                    minH: 3
                }));
            }

            console.log('Saving current layout to API...');
            console.log('Layout data:', { 
                name: dashboardName, 
                layouts: sanitizedLayouts, 
                widgets: sanitizedWidgets 
            });

            await axios.post(`${API_CONFIG.API_URL}${API_CONFIG.USERS_ENDPOINT}/dashboard-layouts`, {
                name: dashboardName,
                layouts: sanitizedLayouts,
                widgets: sanitizedWidgets,
                isDefault: true
            });

            // Show success notification
            setNotification({
                show: true,
                message: 'Dashboard layout saved successfully',
                type: 'success'
            });
            
            // Reset the modified flag
            setIsDashboardModified(false);
            
            // Refresh saved layouts
            fetchSavedLayouts();
        } catch (error) {
            console.error('Error saving layout:', error);
            console.error('Error response:', error.response?.data);
            
            // Try to get a more detailed error message
            let errorMessage = 'Failed to save dashboard layout';
            if (error.response?.data?.message) {
                errorMessage += ': ' + error.response.data.message;
            } else if (error.message) {
                errorMessage += ': ' + error.message;
            }
            
            setError(errorMessage);
            
            // Show error notification
            setNotification({
                show: true,
                message: errorMessage,
                type: 'error'
            });
        } finally {
            setSavingLayout(false);
        }
    };

    // Toggle filters visibility
    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    // Add mobile detection effect to disable dragging and resizing on mobile
    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Import dashboard configuration
    const handleImportDashboard = () => {
        // Just open the file input directly
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const processImport = (config) => {
        try {
            if (config.layouts && config.widgets) {
                setLayouts(config.layouts);
                setWidgets(config.widgets);
                setIsDashboardModified(true);
                toast.success("Dashboard imported successfully!");
            } else {
                toast.error("Invalid dashboard configuration format");
            }
        } catch (error) {
            console.error("Error processing import config:", error);
            toast.error("Failed to parse dashboard configuration");
        }
    };

    // Update the getFilteredConfig function to ensure compatibility with our new filters
    const getFilteredConfig = (widget) => {
        const filteredConfig = { ...widget.config };
        
        // Apply project filter
        if (filters.projectId && ['projectSummary', 'burndownChart'].includes(widget.type)) {
            filteredConfig.projectId = filters.projectId;
        }
        
        // Apply user filter
        if (filters.userId && widget.type === 'myTasks') {
            filteredConfig.userId = filters.userId;
        }
        
        // Apply date filters to all widgets
        if (filters.dateRange.startDate && filters.dateRange.endDate) {
            filteredConfig.dateRange = {
                startDate: filters.dateRange.startDate,
                endDate: filters.dateRange.endDate
            };
        }
        
        return {
            ...widget,
            config: filteredConfig
        };
    };

    const renderWidget = (widget) => {
        const WidgetComponent = WIDGET_COMPONENTS[widget.type];
        
        if (!WidgetComponent) {
            console.error(`Widget type ${widget.type} not found in registry`);
            return (
                <Card className="h-100 widget-error">
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                        <div className="text-danger mb-2">
                            <i className="bi bi-exclamation-triangle-fill fs-1"></i>
                        </div>
                        <h5>Widget Error</h5>
                        <p className="text-center text-muted">
                            Widget type "{widget.type}" not found
                        </p>
                    </Card.Body>
                </Card>
            );
        }

        return (
            <WidgetComponent
                key={widget.id}
                config={widget.config}
                isFullScreen={widget.isFullScreen || false}
                toggleFullScreen={() => toggleWidgetFullscreen(widget.id)}
                onRemove={() => handleRemoveWidget(widget.id)}
                onUpdateConfig={(newConfig) => handleUpdateWidgetConfig(widget.id, newConfig)}
            />
        );
    };

    // Initialize with default widgets if no saved layout exists
    const initializeDefaultWidgets = () => {
        setWidgets(DEFAULT_WIDGETS);
        setLayouts(DEFAULT_WIDGET_LAYOUTS);
    };

    // Widget selector component
    const WidgetSelectorComponent = () => {
        const widgetOptions = [
            { 
                id: WIDGET_TYPES.BURNDOWN_CHART, 
                title: WIDGET_METADATA[WIDGET_TYPES.BURNDOWN_CHART].title, 
                description: WIDGET_METADATA[WIDGET_TYPES.BURNDOWN_CHART].description, 
                icon: <i className={`bi ${WIDGET_METADATA[WIDGET_TYPES.BURNDOWN_CHART].icon} fs-3`}></i> 
            },
            { 
                id: WIDGET_TYPES.PROJECT_SUMMARY, 
                title: WIDGET_METADATA[WIDGET_TYPES.PROJECT_SUMMARY].title, 
                description: WIDGET_METADATA[WIDGET_TYPES.PROJECT_SUMMARY].description, 
                icon: <i className={`bi ${WIDGET_METADATA[WIDGET_TYPES.PROJECT_SUMMARY].icon} fs-3`}></i> 
            },
            { 
                id: WIDGET_TYPES.TEAM_VELOCITY, 
                title: WIDGET_METADATA[WIDGET_TYPES.TEAM_VELOCITY].title, 
                description: WIDGET_METADATA[WIDGET_TYPES.TEAM_VELOCITY].description, 
                icon: <i className={`bi ${WIDGET_METADATA[WIDGET_TYPES.TEAM_VELOCITY].icon} fs-3`}></i> 
            },
            { 
                id: WIDGET_TYPES.TASK_PRIORITY, 
                title: WIDGET_METADATA[WIDGET_TYPES.TASK_PRIORITY].title, 
                description: WIDGET_METADATA[WIDGET_TYPES.TASK_PRIORITY].description, 
                icon: <i className={`bi ${WIDGET_METADATA[WIDGET_TYPES.TASK_PRIORITY].icon} fs-3`}></i> 
            },
            { 
                id: WIDGET_TYPES.NOTIFICATIONS, 
                title: WIDGET_METADATA[WIDGET_TYPES.NOTIFICATIONS].title, 
                description: WIDGET_METADATA[WIDGET_TYPES.NOTIFICATIONS].description, 
                icon: <i className={`bi ${WIDGET_METADATA[WIDGET_TYPES.NOTIFICATIONS].icon} fs-3`}></i> 
            }
        ];

        return (
            <Modal show={showWidgetSelector} onHide={() => setShowWidgetSelector(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Add Widget</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row className="g-3">
                        {widgetOptions.map(widget => (
                            <Col xs={12} md={6} key={widget.id}>
                                <Card 
                                    className="h-100 cursor-pointer"
                                    onClick={() => handleAddWidget(widget.id)}
                                >
                                    <Card.Body>
                                        <div className="d-flex mb-2">
                                            <div className="me-3">
                                                {widget.icon}
                                            </div>
                                            <div>
                                                <Card.Title className="fs-5">{widget.title}</Card.Title>
                                                <Card.Text className="text-muted small">
                                                    {widget.description}
                                                </Card.Text>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Modal.Body>
            </Modal>
        );
    };

    // Toggle widget fullscreen mode
    const toggleWidgetFullscreen = (widgetId) => {
        // Find the widget
        const widget = widgets.find(w => w.id === widgetId);
        if (!widget) return;
        
        // Update widget with fullscreen flag
        setWidgets(widgets.map(w => 
            w.id === widgetId 
                ? { ...w, isFullScreen: !w.isFullScreen } 
                : w
        ));
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
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
        <div className={`dashboard-container ${theme}`} data-dashboard-theme={theme}>
            {notification.show && (
                <div className={`dashboard-notification ${notification.type}`}>
                    <p>{notification.message}</p>
                    <button onClick={() => setNotification({ show: false, message: '', type: '' })}>
                        <FaCheck />
                    </button>
                </div>
            )}
            
            {/* Add Widget Notifications component */}
            <WidgetNotifications />
            
            <div className="dashboard-header">
                <div className="dashboard-title">
                    {isEditingName ? (
                        <InputGroup className="dashboard-title-edit">
                            <Form.Control
                                value={dashboardName}
                                onChange={(e) => setDashboardName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && toggleEditingName()}
                            />
                            <Button variant="outline-secondary" onClick={toggleEditingName}>
                                <FaCheck />
                            </Button>
                        </InputGroup>
                    ) : (
                        <h1 onClick={toggleEditingName}>
                            {dashboardName} <FaEdit className="edit-icon" />
                        </h1>
                    )}
                </div>
                
                <div className="dashboard-actions">
                    <Button
                        variant="outline-primary"
                        className="action-button template-button"
                        onClick={() => setShowTemplatesModal(true)}
                    >
                        <FaThLarge /> Templates
                    </Button>
                    
                    <Button
                        variant="outline-primary"
                        className="action-button save-button"
                        onClick={saveCurrentLayout}
                        disabled={savingLayout || !isDashboardModified}
                    >
                        {savingLayout ? <Spinner animation="border" size="sm" /> : <FaSave />} Save
                    </Button>
                    
                    <Button
                        variant="outline-secondary"
                        className="action-button export-button"
                        onClick={exportDashboardConfig}
                    >
                        <FaFileExport /> Export
                    </Button>
                    
                    <Button
                        variant="outline-secondary"
                        className="action-button import-button"
                        onClick={() => fileInputRef.current.click()}
                    >
                        <FaFileImport /> Import
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={importDashboardConfig}
                            accept=".json"
                        />
                    </Button>
                    
                    <Button
                        variant="outline-secondary"
                        className="action-button theme-button"
                        onClick={toggleTheme}
                    >
                        {theme === 'dark' ? <FaSun /> : <FaMoon />}
                    </Button>
                </div>
            </div>
            
            {error && (
                <Alert variant="danger" className="dashboard-alert">
                    {error}
                    <div className="mt-2">
                        <Button variant="primary" onClick={() => window.location.reload()}>
                            Reload Page
                        </Button>
                        <Button variant="secondary" className="ml-2" onClick={() => navigate('/login')}>
                            Return to Login
                        </Button>
                    </div>
                </Alert>
            )}
            
            {loading ? (
                <div className="loading-container">
                    <Spinner animation="border" role="status" variant="primary" />
                    <p>Loading your dashboard...</p>
                </div>
            ) : (
                <>
                    {/* Rest of the dashboard UI */}
                    {/* ... existing dashboard rendering ... */}
                    {/* Ensure there's a fallback view */}
                    {!widgets || widgets.length === 0 ? (
                        <div className="empty-dashboard">
                            <Card className="text-center p-5">
                                <Card.Body>
                                    <Card.Title>Welcome to your Dashboard</Card.Title>
                                    <Card.Text>
                                        Your dashboard is empty. Click the button below to add your first widget.
                                    </Card.Text>
                                    <Button variant="primary" onClick={() => setShowWidgetSelector(true)}>
                                        <FaPlus /> Add Widget
                                    </Button>
                                </Card.Body>
                            </Card>
                        </div>
                    ) : (
                        // Your existing widgets rendering code
                        <>
                            {/* Filter row */}
                            <Row className="dashboard-filters-row mb-2">
                                <Col xs={12} className="d-flex justify-content-between align-items-center">
                                    <span className="filter-label">
                                        <Button
                                            variant="outline-secondary"
                                            size="sm"
                                            onClick={toggleFilters}
                                            className="mr-2"
                                        >
                                            <BsFilter /> Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                                        </Button>
                                    </span>
                                    <div className="dashboard-widgets-actions">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => setShowWidgetSelector(true)}
                                            className="add-widget-btn"
                                        >
                                            <FaPlus /> Add Widget
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                            
                            {/* Dashboard content */}
                            {isMobile ? (
                                <div className="mobile-dashboard">
                                    {widgets.map(widget => (
                                        <Card key={widget.id} className="mb-3 dashboard-widget">
                                            {renderWidget(widget)}
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <ResponsiveGridLayout
                                    className="layout"
                                    layouts={layouts}
                                    breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                                    cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                                    rowHeight={60}
                                    onLayoutChange={(layout) => handleLayoutChange(layout, layouts)}
                                    isDraggable={true}
                                    isResizable={true}
                                    margin={[16, 16]}
                                >
                                    {widgets.map(widget => (
                                        <div key={widget.id} className="dashboard-widget-container">
                                            {renderWidget(widget)}
                                        </div>
                                    ))}
                                </ResponsiveGridLayout>
                            )}
                        </>
                    )}
                </>
            )}
            
            {/* Modals */}
            <WidgetSelectorComponent />
            
            <WidgetConfigModal
                show={showWidgetConfig}
                onHide={() => setShowWidgetConfig(false)}
                widget={currentWidget}
                onSave={handleUpdateWidgetConfig}
            />
            
            <DashboardFilters
                show={showFilters}
                onHide={() => setShowFilters(false)}
                filters={filters}
                onApplyFilters={handleApplyFilters}
                projects={projects}
            />
            
            <DashboardTemplates
                show={showTemplatesModal}
                onHide={() => setShowTemplatesModal(false)}
                onApplyTemplate={handleApplyTemplate}
            />
        </div>
    );
};

export default Dashboard; 