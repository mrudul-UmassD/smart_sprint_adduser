import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    Alert as MuiAlert,
    CircularProgress,
} from '@mui/material';
import { Container, Row, Col, Card, Badge, ProgressBar, Button, Alert, Spinner, Dropdown, Modal } from 'react-bootstrap';
import { 
    Person as PersonIcon, 
    Group as GroupIcon, 
    Folder as FolderOpenIcon,
    AccountCircle as AccountCircleIcon,
    Work, 
    EmojiEvents, 
    Assignment, 
    Timeline, 
    DeveloperMode,
    Dashboard as DashboardIcon
} from '@mui/icons-material';
import { 
    BsFillSunFill, 
    BsFillMoonFill, 
    BsGearFill, 
    BsBoxArrowInDown, 
    BsBoxArrowUp, 
    BsLayoutWtf 
} from 'react-icons/bs';
import API_CONFIG from '../config';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import moment from 'moment';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import WidgetSelector from './widgets/WidgetSelector';
import DashboardWidgets from './widgets/DashboardWidgets';
import WidgetConfigModal from './widgets/WidgetConfigModal';
import DashboardImportExport from './DashboardImportExport';
import DashboardTemplates from './DashboardTemplates';
import { useTheme } from '../utils/themeUtils';
import '../styles/Dashboard.css';
import { getToken, removeTokenAndRedirect } from '../utils/authUtils';
import DashboardHeader from './DashboardHeader';
import WidgetNotifications from './widgets/WidgetNotifications';

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

// Import the widget components
import ProjectSummaryWidget from './widgets/ProjectSummaryWidget';
import TasksWidget from './widgets/TasksWidget';
import BurndownChartWidget from './widgets/BurndownChartWidget';
import TeamPerformanceWidget from './widgets/TeamPerformanceWidget';

// Define the widget components registry
const widgetComponents = {
  'projectSummary': ProjectSummaryWidget,
  'myTasks': TasksWidget,
  'burndownChart': BurndownChartWidget,
  'teamPerformance': TeamPerformanceWidget
};

const Dashboard = () => {
    const { theme, toggleTheme } = useTheme();
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
    const [widgets, setWidgets] = useState([]);
    const [layouts, setLayouts] = useState({ lg: [] });
    const [showImportExport, setShowImportExport] = useState(false);
    const [showTemplates, setShowTemplates] = useState(false);
    const [showConfigModal, setShowConfigModal] = useState(false);
    const [selectedWidget, setSelectedWidget] = useState(null);
    const [isDashboardModified, setIsDashboardModified] = useState(false);
    const [showImportExportModal, setShowImportExportModal] = useState(false);
    const [importConfig, setImportConfig] = useState('');
    const [isImportMode, setIsImportMode] = useState(false);
    const [showTemplatesModal, setShowTemplatesModal] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

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
            removeTokenAndRedirect();
            return;
        }

        try {
            setLoading(true);
            // Use AUTH_ENDPOINT for fetching user details without manually setting headers
            // as they're already added by axios interceptors
            const response = await axios.get(`${API_CONFIG.AUTH_ENDPOINT}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.success && response.data.user) {
                setUserDetails(response.data.user);
            } else {
                throw new Error('Invalid response format');
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching user details:', err);
            
            // Try using stored user data as fallback
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const userData = JSON.parse(userStr);
                    console.log('Using stored user data as fallback:', userData);
                    setUserDetails(userData);
                    setLoading(false);
                    return;
                } catch (parseErr) {
                    console.error('Error parsing stored user data:', parseErr);
                }
            }
            
            const errorMsg = err.response?.data?.error || 'Failed to fetch user details';
            setError(errorMsg);
            setLoading(false);
            
            if (err.response?.status === 401) {
                console.error('Authentication failed, redirecting to login');
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }, 2000);
            }
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

    useEffect(() => {
        fetchProjects();
        fetchDashboardData(timeRange, selectedProject);
    }, [timeRange, selectedProject, userDetails._id]);

    const fetchProjects = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.PROJECTS_ENDPOINT}`);
            if (response.data) {
                setProjects(response.data);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to load projects');
        }
    };

    const fetchDashboardData = async (range, projectId) => {
        try {
            setLoading(true);
            
            // Build query params
            let params = new URLSearchParams();
            params.append('timeRange', range);
            if (projectId !== 'all') {
                params.append('projectId', projectId);
            }
            
            const response = await axios.get(`${API_CONFIG.ANALYTICS_ENDPOINT}/dashboard?${params.toString()}`);
            
            if (response.data) {
                setDashboardData(response.data);
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
            setLoading(false);
        }
    };

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

    // Load user's saved dashboard configuration
    useEffect(() => {
        if (userDetails) {
            loadDashboard();
        }
    }, [userDetails]);

    // Load dashboard configuration
    const loadDashboard = async () => {
        try {
            setLoading(true);
            const token = getToken();
            const response = await axios.get('/api/users/settings/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data && response.data.widgets) {
                setWidgets(response.data.widgets);
                if (response.data.layouts) {
                    setLayouts(response.data.layouts);
                } else {
                    // Generate default layout if none exists
                    generateDefaultLayout(response.data.widgets);
                }
            } else {
                // Set a default widget if user has no configuration
                const defaultWidget = {
                    id: uuidv4(),
                    type: 'tasks',
                    config: { limit: 5 }
                };
                setWidgets([defaultWidget]);
                generateDefaultLayout([defaultWidget]);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            // Set a default widget on error
            const defaultWidget = {
                id: uuidv4(),
                type: 'tasks',
                config: { limit: 5 }
            };
            setWidgets([defaultWidget]);
            generateDefaultLayout([defaultWidget]);
            setLoading(false);
        }
    };

    // Generate a default layout for widgets
    const generateDefaultLayout = (widgetList) => {
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
    };

    // Save dashboard configuration
    const saveDashboardConfig = useCallback(async () => {
        if (!userDetails) return;
        
        try {
            const token = getToken();
            await axios.post('/api/users/settings/dashboard', {
                widgets,
                layouts
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Dashboard configuration saved');
            setIsDashboardModified(false);
        } catch (error) {
            console.error('Error saving dashboard configuration:', error);
            setIsDashboardModified(true);
        }
    }, [widgets, layouts, userDetails]);

    // Save dashboard config when widgets or layouts change
    useEffect(() => {
        if (widgets.length > 0 && !loading) {
            // Use debounce to avoid too many API calls
            const timeoutId = setTimeout(() => {
                saveDashboardConfig();
            }, 1000);
            
            return () => clearTimeout(timeoutId);
        }
    }, [widgets, layouts, loading, saveDashboardConfig]);

    // Add a new widget
    const handleAddWidget = (widgetType, widgetConfig) => {
        const newWidget = {
            id: uuidv4(),
            type: widgetType,
            config: widgetConfig
        };
        
        const updatedWidgets = [...widgets, newWidget];
        setWidgets(updatedWidgets);
        
        // Update layout with the new widget
        const newLayouts = { ...layouts };
        if (!newLayouts.lg) newLayouts.lg = [];
        
        newLayouts.lg.push({
            i: newWidget.id,
            x: (newLayouts.lg.length % 2) * 6,
            y: Infinity, // Put it at the bottom
            w: 6,
            h: 8,
            minW: 3,
            minH: 4
        });
        
        setLayouts(newLayouts);
    };

    // Remove widget from dashboard
    const handleRemoveWidget = (widgetId) => {
        setWidgets(widgets.filter(widget => widget.id !== widgetId));
        
        const updatedLayouts = { ...layouts };
        updatedLayouts.lg = updatedLayouts.lg.filter(layout => layout.i !== widgetId);
        setLayouts(updatedLayouts);
    };

    // Open widget configuration modal
    const handleConfigureWidget = (widget) => {
        setSelectedWidget(widget);
        setShowConfigModal(true);
    };

    // Update widget configuration
    const handleUpdateWidgetConfig = (widgetId, newConfig) => {
        setWidgets(prevWidgets => 
            prevWidgets.map(widget => 
                widget.id === widgetId 
                    ? { ...widget, config: newConfig } 
                    : widget
            )
        );
    };

    // Handle layout changes
    const handleLayoutChange = (layout, allLayouts) => {
        setLayouts(allLayouts);
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

    // Handle applying a template
    const handleApplyTemplate = (template) => {
        setLayouts(template.layouts);
        setWidgets(template.widgets);
        setIsDashboardModified(true);
        setShowTemplatesModal(false);
    };

    // Export dashboard configuration
    const handleExportDashboard = () => {
        const dashboardConfig = {
            layouts,
            widgets
        };
        
        setImportConfig(JSON.stringify(dashboardConfig, null, 2));
        setIsImportMode(false);
        setShowImportExportModal(true);
    };

    // Import dashboard configuration
    const handleImportDashboard = () => {
        setImportConfig('');
        setIsImportMode(true);
        setShowImportExportModal(true);
    };

    // Process imported dashboard configuration
    const processImport = () => {
        try {
            const config = JSON.parse(importConfig);
            
            if (!config.layouts || !config.widgets) {
                throw new Error('Invalid configuration format');
            }
            
            setLayouts(config.layouts);
            setWidgets(config.widgets);
            setIsDashboardModified(true);
            setShowImportExportModal(false);
            
            alert('Dashboard configuration imported successfully!');
        } catch (err) {
            alert('Invalid configuration format. Please check your JSON.');
        }
    };

    // Render widget based on its type and configuration
    const renderWidget = (widgetId) => {
        const config = widgets.find(widget => widget.id === widgetId);
        
        if (!config || !config.type || !widgetComponents[config.type]) {
            return <div>Invalid widget configuration</div>;
        }
        
        const WidgetComponent = widgetComponents[config.type];
        
        return (
            <div className="widget-container h-100 position-relative">
                <div className="widget-controls position-absolute top-0 end-0 m-2 d-flex bg-light rounded p-1 shadow-sm">
                    <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 text-primary me-2" 
                        onClick={() => handleConfigureWidget(config)}
                        title="Configure Widget"
                    >
                        <i className="fas fa-cog"></i>
                    </Button>
                    <Button 
                        variant="link" 
                        size="sm" 
                        className="p-0 text-danger" 
                        onClick={() => handleRemoveWidget(config.id)}
                        title="Remove Widget"
                    >
                        <i className="fas fa-times"></i>
                    </Button>
                </div>
                <WidgetNotifications widgetId={config.id} widgetType={config.type} />
                <WidgetComponent config={config} />
            </div>
        );
    };

    // Add mobile detection effect to disable dragging and resizing on mobile
    useEffect(() => {
        const checkIfMobile = () => {
            const mobileQuery = window.matchMedia('(max-width: 768px)');
            setIsMobile(mobileQuery.matches);
        };
        
        // Check initially
        checkIfMobile();
        
        // Set up a listener for screen size changes
        const mobileQuery = window.matchMedia('(max-width: 768px)');
        const handleMobileChange = (e) => {
            setIsMobile(e.matches);
        };
        
        // Add event listener (using the correct method based on browser support)
        if (mobileQuery.addEventListener) {
            mobileQuery.addEventListener('change', handleMobileChange);
        } else {
            // For older browsers
            mobileQuery.addListener(handleMobileChange);
        }
        
        // Clean up
        return () => {
            if (mobileQuery.removeEventListener) {
                mobileQuery.removeEventListener('change', handleMobileChange);
            } else {
                // For older browsers
                mobileQuery.removeListener(handleMobileChange);
            }
        };
    }, []);

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (loading || !userDetails) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading your dashboard...</p>
            </Container>
        );
    }

    return (
        <div className={`dashboard-container ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
            <DashboardHeader 
                onAddWidget={() => setShowWidgetSelector(true)}
                onSaveDashboard={saveDashboardConfig}
                onResetDashboard={() => setShowTemplatesModal(true)}
                onExportDashboard={handleExportDashboard}
                onImportDashboard={handleImportDashboard}
                isDashboardModified={isDashboardModified}
            />
            
            <Container fluid className="py-3">
                {layouts && (
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={layouts}
                        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
                        cols={{ lg: 12, md: 12, sm: 6, xs: 4 }}
                        rowHeight={45}
                        onLayoutChange={handleLayoutChange}
                        isDraggable={!isMobile}
                        isResizable={!isMobile}
                        draggableHandle=".widget-title"
                        margin={[16, 16]}
                        containerPadding={[16, 16]}
                        useCSSTransforms={true}
                    >
                        {Object.keys(widgets).map(widgetId => (
                            <div key={widgetId} className={`widget ${theme === 'dark' ? 'widget-dark' : ''}`}>
                                {renderWidget(widgetId)}
                            </div>
                        ))}
                    </ResponsiveGridLayout>
                )}
            </Container>

            {/* Theme Toggle Button */}
            <div 
                className="theme-toggle" 
                onClick={toggleTheme}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                {theme === 'light' ? <BsFillMoonFill /> : <BsFillSunFill />}
            </div>

            {/* Modals */}
            <WidgetSelector
                show={showWidgetSelector}
                onHide={() => setShowWidgetSelector(false)}
                onAddWidget={handleAddWidget}
            />

            <WidgetConfigModal 
                show={showConfigModal}
                onHide={() => setShowConfigModal(false)}
                widget={selectedWidget}
                onSave={handleUpdateWidgetConfig}
            />

            <DashboardImportExport 
                show={showImportExport}
                onHide={() => setShowImportExport(false)}
                currentConfig={{ widgets, layouts }}
                onImport={handleImportConfig}
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