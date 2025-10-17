import React from 'react';
import TaskProgressWidget from './TaskProgressWidget';
import BurndownWidget from './BurndownWidget';
import TimeTrackingWidget from './TimeTrackingWidget';
import CalendarWidget from './CalendarWidget';
import TeamActivityWidget from './TeamActivityWidget';
import ProjectMetricsWidget from './ProjectMetricsWidget';
import TeamPerformanceWidget from './TeamPerformanceWidget';
import { 
  AssignmentTurnedIn, 
  Timer,
  ShowChart, 
  EventNote,
  Group,
  BarChart,
  Assessment,
  Speed
} from '@mui/icons-material';
import BurndownChartWidget from './BurndownChartWidget';
import TaskPriorityWidget from './TaskPriorityWidget';
import TeamVelocityWidget from './TeamVelocityWidget';
import ProjectSummaryWidget from './ProjectSummaryWidget';
import DashboardNotificationWidget from './DashboardNotificationWidget';
import MyTasksWidget from './MyTasksWidget';
import NotificationsWidget from './NotificationsWidget';

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
    component: CalendarWidget,
    title: 'Calendar',
    description: 'View upcoming deadlines and events',
    icon: <EventNote />,
    defaultConfig: {},
    roles: ['Admin', 'Project Manager', 'Developer'],
    defaultDimensions: { w: 12, h: 8 }
  },
  
  TeamActivity: {
    component: TeamActivityWidget,
    title: 'Team Activity',
    description: 'View recent activity from your team members',
    icon: <Group />,
    defaultConfig: {},
    roles: ['Admin', 'Project Manager'],
    defaultDimensions: { w: 6, h: 8 }
  },
  
  ProjectMetrics: {
    component: ProjectMetricsWidget,
    title: 'Project Metrics',
    description: 'Key metrics for your active projects',
    icon: <BarChart />,
    defaultConfig: {},
    roles: ['Admin', 'Project Manager'],
    defaultDimensions: { w: 6, h: 8 }
  },
  
  TeamPerformance: {
    component: TeamPerformanceWidget,
    title: 'Team Performance',
    description: 'View team performance metrics and statistics',
    icon: <Speed />,
    defaultConfig: { team: null },
    roles: ['Admin', 'Project Manager'],
    defaultDimensions: { w: 6, h: 8 }
  },
  
  // Additional widget entries with proper component references
  BURNDOWN_CHART: {
    component: BurndownChartWidget,
    title: 'Burndown Chart',
    description: 'Shows the remaining effort over time for a project',
    icon: <ShowChart />,
    defaultConfig: { projectId: null, timeRange: '7days' },
    roles: ['Admin', 'Project Manager', 'Developer'],
    defaultDimensions: { w: 6, h: 8 },
    requiresProject: true
  },
  
  TASK_PRIORITY: {
    component: TaskPriorityWidget,
    title: 'Task Priority Distribution',
    description: 'Displays tasks by priority for a project',
    icon: <AssignmentTurnedIn />,
    defaultConfig: { projectId: null, limit: 5 },
    roles: ['Admin', 'Project Manager', 'Developer'],
    defaultDimensions: { w: 6, h: 8 },
    requiresProject: true
  },
  
  TEAM_VELOCITY: {
    component: TeamVelocityWidget,
    title: 'Team Velocity',
    description: 'Shows the velocity of a team across sprints',
    icon: <ShowChart />,
    defaultConfig: { teamId: null, sprints: 4 },
    roles: ['Admin', 'Project Manager', 'Developer'],
    defaultDimensions: { w: 6, h: 8 }
  },
  
  PROJECT_SUMMARY: {
    component: ProjectSummaryWidget,
    title: 'Project Summary',
    description: 'Overview of a project\'s progress and status',
    icon: <Assessment />,
    defaultConfig: { projectId: null },
    roles: ['Admin', 'Project Manager', 'Developer'],
    defaultDimensions: { w: 6, h: 8 },
    requiresProject: true
  },
  
  NOTIFICATIONS: {
    component: DashboardNotificationWidget,
    title: 'Recent Notifications',
    description: 'Shows the most recent notifications',
    icon: <EventNote />,
    defaultConfig: { limit: 5 },
    roles: ['Admin', 'Project Manager', 'Developer'],
    defaultDimensions: { w: 4, h: 8 }
  },
  
  MY_TASKS: {
    component: MyTasksWidget,
    title: 'My Tasks',
    description: 'Shows your assigned tasks',
    icon: <AssignmentTurnedIn />,
    defaultConfig: { limit: 10 },
    roles: ['Admin', 'Project Manager', 'Developer'],
    defaultDimensions: { w: 6, h: 8 }
  },
};

// Get available widget types for a specific user role
export const getAvailableWidgets = (userRole) => {
  return Object.keys(WIDGET_REGISTRY)
    .filter(type => {
      const widget = WIDGET_REGISTRY[type];
      // Handle case where widget or widget.roles might be undefined
      return widget && widget.roles && widget.roles.includes(userRole) && widget.component !== null;
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

// Map of widget types to their respective components
export const WIDGET_COMPONENTS = {
  // Legacy string-based mappings
  BURNDOWN_CHART: BurndownChartWidget,
  TASK_PRIORITY: TaskPriorityWidget,
  TEAM_VELOCITY: TeamVelocityWidget,
  PROJECT_SUMMARY: ProjectSummaryWidget,
  NOTIFICATIONS: DashboardNotificationWidget,
  MY_TASKS: MyTasksWidget,
  
  // Camel case mappings
  'burndownChart': BurndownChartWidget,
  'projectSummary': ProjectSummaryWidget,
  'teamVelocity': TeamVelocityWidget,
  'myTasks': MyTasksWidget,
  'taskPriority': TaskPriorityWidget,
  'notifications': NotificationsWidget,
  
  // Additional mappings from WIDGET_REGISTRY
  'TaskProgress': TaskProgressWidget,
  'TimeTracking': TimeTrackingWidget,
  'BurndownChart': BurndownWidget,
  
  // Ensure all WIDGET_REGISTRY entries are mapped
  ...Object.keys(WIDGET_REGISTRY).reduce((acc, key) => {
    const widget = WIDGET_REGISTRY[key];
    if (widget.component) {
      acc[key] = widget.component;
    }
    return acc;
  }, {})
};

// Widget types
export const WIDGET_TYPES = {
  BURNDOWN_CHART: 'burndownChart',
  PROJECT_SUMMARY: 'projectSummary',
  TEAM_VELOCITY: 'teamVelocity',
  MY_TASKS: 'myTasks',
  TASK_PRIORITY: 'taskPriority',
  NOTIFICATIONS: 'notifications'
};

// Default widget configurations
export const DEFAULT_WIDGET_CONFIGS = {
  [WIDGET_TYPES.BURNDOWN_CHART]: {
    projectId: null,
    timeRange: '7days',
  },
  [WIDGET_TYPES.TASK_PRIORITY]: {
    projectId: null,
    limit: 5,
  },
  [WIDGET_TYPES.TEAM_VELOCITY]: {
    teamId: null,
    sprints: 4,
  },
  [WIDGET_TYPES.PROJECT_SUMMARY]: {
    projectId: null,
  },
  [WIDGET_TYPES.NOTIFICATIONS]: {
    limit: 5,
  },
};

// Widget metadata
export const WIDGET_METADATA = {
  [WIDGET_TYPES.BURNDOWN_CHART]: {
    title: 'Burndown Chart',
    description: 'Shows the remaining effort over time for a project',
    icon: 'bi-graph-down',
    requiredConfigFields: ['projectId', 'timeRange'],
    roles: ['Admin', 'Project Manager', 'Developer'],
  },
  [WIDGET_TYPES.TASK_PRIORITY]: {
    title: 'Task Priority Distribution',
    description: 'Displays tasks by priority for a project',
    icon: 'bi-list-check',
    requiredConfigFields: ['projectId', 'limit'],
    roles: ['Admin', 'Project Manager', 'Developer'],
  },
  [WIDGET_TYPES.TEAM_VELOCITY]: {
    title: 'Team Velocity',
    description: 'Shows the velocity of a team across sprints',
    icon: 'bi-speedometer',
    requiredConfigFields: ['teamId', 'sprints'],
    roles: ['Admin', 'Project Manager', 'Developer'],
  },
  [WIDGET_TYPES.PROJECT_SUMMARY]: {
    title: 'Project Summary',
    icon: <Assessment />,
    description: 'Overview of a project\'s progress and status',
    requiredConfigFields: ['projectId'],
    defaultDimensions: { w: 6, h: 8 }
  },
  [WIDGET_TYPES.NOTIFICATIONS]: {
    title: 'Recent Notifications',
    description: 'Shows the most recent notifications',
    icon: 'bi-bell',
    requiredConfigFields: ['limit'],
    roles: ['Admin', 'Project Manager', 'Developer'],
  },
};

// Default widget layouts
export const DEFAULT_WIDGET_LAYOUTS = {
  lg: [
    { i: 'burndown', x: 0, y: 0, w: 6, h: 8, minW: 3, minH: 5 },
    { i: 'priority', x: 6, y: 0, w: 6, h: 8, minW: 3, minH: 5 },
    { i: 'velocity', x: 0, y: 8, w: 6, h: 8, minW: 3, minH: 5 },
    { i: 'summary', x: 6, y: 8, w: 6, h: 8, minW: 3, minH: 5 },
    { i: 'notifications', x: 0, y: 16, w: 4, h: 8, minW: 3, minH: 5 },
  ],
  md: [
    { i: 'burndown', x: 0, y: 0, w: 6, h: 8, minW: 3, minH: 5 },
    { i: 'priority', x: 6, y: 0, w: 6, h: 8, minW: 3, minH: 5 },
    { i: 'velocity', x: 0, y: 8, w: 6, h: 8, minW: 3, minH: 5 },
    { i: 'summary', x: 6, y: 8, w: 6, h: 8, minW: 3, minH: 5 },
    { i: 'notifications', x: 0, y: 16, w: 4, h: 8, minW: 3, minH: 5 },
  ],
  sm: [
    { i: 'burndown', x: 0, y: 0, w: 6, h: 8, minW: 3, minH: 5 },
    { i: 'priority', x: 6, y: 0, w: 6, h: 8, minW: 3, minH: 5 },
    { i: 'velocity', x: 0, y: 8, w: 6, h: 8, minW: 3, minH: 5 },
    { i: 'summary', x: 6, y: 8, w: 6, h: 8, minW: 3, minH: 5 },
    { i: 'notifications', x: 0, y: 16, w: 6, h: 8, minW: 3, minH: 5 },
  ],
  xs: [
    { i: 'burndown', x: 0, y: 0, w: 12, h: 8, minW: 3, minH: 5 },
    { i: 'priority', x: 0, y: 8, w: 12, h: 8, minW: 3, minH: 5 },
    { i: 'velocity', x: 0, y: 16, w: 12, h: 8, minW: 3, minH: 5 },
    { i: 'summary', x: 0, y: 24, w: 12, h: 8, minW: 3, minH: 5 },
    { i: 'notifications', x: 0, y: 32, w: 12, h: 8, minW: 3, minH: 5 },
  ],
};

// Default widgets for a new dashboard
export const DEFAULT_WIDGETS = [
  {
    id: 'burndown',
    type: WIDGET_TYPES.BURNDOWN_CHART,
    config: DEFAULT_WIDGET_CONFIGS[WIDGET_TYPES.BURNDOWN_CHART],
  },
  {
    id: 'priority',
    type: WIDGET_TYPES.TASK_PRIORITY,
    config: DEFAULT_WIDGET_CONFIGS[WIDGET_TYPES.TASK_PRIORITY],
  },
  {
    id: 'velocity',
    type: WIDGET_TYPES.TEAM_VELOCITY,
    config: DEFAULT_WIDGET_CONFIGS[WIDGET_TYPES.TEAM_VELOCITY],
  },
  {
    id: 'summary',
    type: WIDGET_TYPES.PROJECT_SUMMARY,
    config: DEFAULT_WIDGET_CONFIGS[WIDGET_TYPES.PROJECT_SUMMARY],
  },
  {
    id: 'notifications',
    type: WIDGET_TYPES.NOTIFICATIONS,
    config: DEFAULT_WIDGET_CONFIGS[WIDGET_TYPES.NOTIFICATIONS],
  },
];

export default WIDGET_REGISTRY;