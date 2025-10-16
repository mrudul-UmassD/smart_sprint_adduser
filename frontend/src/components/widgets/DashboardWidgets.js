import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import axios from 'axios';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { FaTrash, FaCog, FaExpand, FaCompress, FaBell } from 'react-icons/fa';

// Import widget components
import ProjectSummaryWidget from './ProjectSummaryWidget';
import MyTasksWidget from './MyTasksWidget';
import BurndownChartWidget from './BurndownChartWidget';
import TeamPerformanceWidget from './TeamPerformanceWidget';
import TasksWidget from './TasksWidget';
import WidgetNotifications from './WidgetNotifications';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Widget container component
const WidgetContainer = ({ title, onRemove, onConfigure, children, widgetId, widgetType }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);
  
  // Check if this widget type would have notifications
  useEffect(() => {
    // This is a simplified check - in a real application,
    // you would check with an API if there are unread notifications
    const widgetTypesWithNotifications = [
      'projectSummary',
      'myTasks',
      'burndownChart',
      'teamPerformance'
    ];
    
    setHasNotifications(widgetTypesWithNotifications.includes(widgetType));
  }, [widgetType]);
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };
  
  return (
    <Card className={`dashboard-widget h-100 ${isFullscreen ? 'widget-fullscreen' : ''}`}>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>{title}</div>
        <div className="widget-controls">
          <Button 
            variant="link" 
            className="p-0 mx-2 text-secondary" 
            onClick={toggleNotifications}
            aria-label="Toggle notifications"
          >
            <div className={`widget-notification-bell ${hasNotifications ? 'has-notifications' : ''}`}>
              <FaBell />
            </div>
          </Button>
        
          {onConfigure && (
            <Button 
              variant="link" 
              className="p-0 mx-2 text-secondary" 
              onClick={onConfigure}
              aria-label="Configure widget"
            >
              <FaCog />
            </Button>
          )}
          
          <Button 
            variant="link" 
            className="p-0 mx-2 text-secondary" 
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </Button>
          
          {onRemove && (
            <Button 
              variant="link" 
              className="p-0 mx-2 text-danger" 
              onClick={onRemove}
              aria-label="Remove widget"
            >
              <FaTrash />
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body className="p-3 position-relative">
        {/* Add widget-specific notifications */}
        {showNotifications && <WidgetNotifications widgetId={widgetId} widgetType={widgetType} />}
        {children}
      </Card.Body>
    </Card>
  );
};

// Component mapping
const WIDGET_COMPONENTS = {
  'projectSummary': ProjectSummaryWidget,
  'myTasks': MyTasksWidget,
  'burndownChart': BurndownChartWidget,
  'teamPerformance': TeamPerformanceWidget,
  'tasks': TasksWidget
};

// Widget titles mapping
const WIDGET_TITLES = {
  'projectSummary': 'Project Summary',
  'myTasks': 'My Tasks',
  'burndownChart': 'Burndown Chart',
  'teamPerformance': 'Team Performance',
  'tasks': 'Tasks Overview'
};

// Main component that serves as a widget router
const DashboardWidgets = ({ widgetType, config, onRemove, onConfigure }) => {
  const renderWidget = () => {
    const WidgetComponent = WIDGET_COMPONENTS[widgetType];
    
    if (!WidgetComponent) {
      return (
        <Alert variant="warning">
          Unknown widget type: {widgetType}
        </Alert>
      );
    }
    
    return (
      <WidgetComponent 
        config={config || {}} 
        onRemove={onRemove}
        onConfigure={onConfigure}
      />
    );
  };

  return (
    <WidgetContainer 
      title={WIDGET_TITLES[widgetType] || widgetType} 
      onRemove={onRemove}
      onConfigure={onConfigure}
      widgetId={config?.id || `widget-${Math.random().toString(36).substr(2, 9)}`}
      widgetType={widgetType}
    >
      {renderWidget()}
    </WidgetContainer>
  );
};

export default DashboardWidgets; 