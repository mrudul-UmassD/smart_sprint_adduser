import React from 'react';
import TaskProgressWidget from './TaskProgressWidget';
import BurndownWidget from './BurndownWidget';
import TimeTrackingWidget from './TimeTrackingWidget';
import { 
  AssignmentTurnedIn, 
  Timer,
  ShowChart, 
  EventNote,
  Group,
  BarChart
} from '@mui/icons-material';

// Widget registry with metadata for each widget type
const WIDGET_REGISTRY = {
  TaskProgress: {
    component: TaskProgressWidget,
    title: 'Task Progress',
    description: 'Shows your task completion status and recent tasks',
    icon: <AssignmentTurnedIn />,
    defaultConfig: {
      showAll: false,
      limit: 5
    },
    roles: ['Admin', 'Project Manager', 'Developer'], // All roles can use this widget
    defaultDimensions: { w: 6, h: 8 }
  },
  
  TimeTracking: {
    component: TimeTrackingWidget,
    title: 'Time Tracking',
    description: 'Track time spent on tasks and view recent time entries',
    icon: <Timer />,
    defaultConfig: {
      daysToShow: 7,
      showOnlyMyTasks: true
    },
    roles: ['Admin', 'Project Manager', 'Developer'], // All roles can use this widget
    defaultDimensions: { w: 6, h: 10 }
  },
  
  BurndownChart: {
    component: BurndownWidget,
    title: 'Sprint Burndown',
    description: 'Track sprint progress with burndown chart',
    icon: <ShowChart />,
    defaultConfig: {},
    roles: ['Admin', 'Project Manager'], // Restricted to management roles
    defaultDimensions: { w: 6, h: 8 },
    requiresProject: true // This widget requires a project to be selected
  },
  
  Calendar: {
    component: null, // To be implemented
    title: 'Calendar',
    description: 'View upcoming deadlines and events',
    icon: <EventNote />,
    defaultConfig: {},
    roles: ['Admin', 'Project Manager', 'Developer'],
    defaultDimensions: { w: 12, h: 8 }
  },
  
  TeamActivity: {
    component: null, // To be implemented
    title: 'Team Activity',
    description: 'View recent activity from your team members',
    icon: <Group />,
    defaultConfig: {},
    roles: ['Admin', 'Project Manager'],
    defaultDimensions: { w: 6, h: 8 }
  },
  
  ProjectMetrics: {
    component: null, // To be implemented
    title: 'Project Metrics',
    description: 'Key metrics for your active projects',
    icon: <BarChart />,
    defaultConfig: {},
    roles: ['Admin', 'Project Manager'],
    defaultDimensions: { w: 6, h: 8 }
  }
};

// Get available widget types for a specific user role
export const getAvailableWidgets = (userRole) => {
  return Object.keys(WIDGET_REGISTRY)
    .filter(type => {
      const widget = WIDGET_REGISTRY[type];
      return widget.roles.includes(userRole) && widget.component !== null;
    })
    .map(type => ({
      type,
      ...WIDGET_REGISTRY[type]
    }));
};

// Get a specific widget component
export const getWidgetComponent = (type) => {
  return WIDGET_REGISTRY[type]?.component;
};

// Get widget metadata
export const getWidgetMetadata = (type) => {
  return WIDGET_REGISTRY[type] || null;
};

// Get default widget configuration
export const getWidgetDefaultConfig = (type) => {
  return WIDGET_REGISTRY[type]?.defaultConfig || {};
};

// Get predefined templates for different roles
export const getDashboardTemplate = (role) => {
  switch (role) {
    case 'Admin':
      return [
        { type: 'TaskProgress', x: 0, y: 0, w: 6, h: 8 },
        { type: 'TimeTracking', x: 6, y: 0, w: 6, h: 8 },
        { type: 'ProjectMetrics', x: 0, y: 8, w: 12, h: 8 }
      ];
      
    case 'Project Manager':
      return [
        { type: 'TaskProgress', x: 0, y: 0, w: 6, h: 8 },
        { type: 'BurndownChart', x: 6, y: 0, w: 6, h: 8 },
        { type: 'TeamActivity', x: 0, y: 8, w: 6, h: 8 },
        { type: 'TimeTracking', x: 6, y: 8, w: 6, h: 8 }
      ];
      
    case 'Developer':
      return [
        { type: 'TaskProgress', x: 0, y: 0, w: 6, h: 8 },
        { type: 'TimeTracking', x: 6, y: 0, w: 6, h: 8 },
        { type: 'Calendar', x: 0, y: 8, w: 12, h: 8 }
      ];
      
    default:
      return [
        { type: 'TaskProgress', x: 0, y: 0, w: 6, h: 8 },
        { type: 'TimeTracking', x: 6, y: 0, w: 6, h: 8 }
      ];
  }
};

export default WIDGET_REGISTRY; 