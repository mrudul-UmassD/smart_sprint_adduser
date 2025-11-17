# Smart Sprint Frontend

React-based frontend for the Smart Sprint project management system. Features a customizable dashboard with drag-and-drop widgets, real-time updates, and comprehensive project management tools.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Dashboard System](#dashboard-system)
- [Authentication](#authentication)
- [Component Structure](#component-structure)
- [Best Practices](#best-practices)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)

## Features

### Dashboard Features
- **Customizable Dashboards** - Drag-and-drop widget positioning with React Grid Layout
- **Dashboard Templates** - 4 predefined templates:
  - Developer Dashboard
  - Project Manager Dashboard
  - Team Lead Dashboard
  - Minimal Dashboard
- **10+ Widget Types**:
  - My Tasks Widget
  - Project Summary Widget
  - Burndown Chart Widget
  - Task Priority Distribution Widget
  - Team Velocity Widget
  - Team Performance Widget
  - Notifications Widget
  - Time Tracking Widget
  - Project Metrics Widget
  - Task Progress Widget
- **Layout Persistence** - Save and restore custom dashboard layouts

### Core Features
- **Project Management** - Create, update, and track projects with Kanban boards
- **Task Management** - Task assignment, priority levels, status tracking
- **Team Management** - Role-based team organization with custom fields
- **Analytics** - Charts and reports for project metrics and team performance
- **Time Tracking** - Track time spent on tasks
- **Gantt Charts** - Visual project timelines
- **Calendar Views** - Schedule and deadline management
- **Real-time Notifications** - Socket.io integration for live updates
- **Export Reports** - PDF and Excel report generation

## Tech Stack

- **React** - UI library (v18+)
- **React Router** - Client-side routing
- **Axios** - HTTP client with interceptors for authentication
- **React Grid Layout** - Drag-and-drop dashboard system
- **Chart.js** and **Recharts** - Data visualization
- **React Bootstrap** and **Material-UI** - UI components
- **Gantt-Task-React** - Gantt chart visualization
- **React Big Calendar** - Calendar component
- **XLSX** and **jsPDF** - Report exports
- **Socket.io Client** - Real-time updates

## Architecture

### Directory Structure

```
frontend/
├── public/
│   ├── index.html
│   └── debug-login.html
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── dashboard/       # Dashboard and widget components
│   │   ├── projects/        # Project management components
│   │   ├── tasks/           # Task management components
│   │   └── common/          # Shared components
│   ├── pages/               # Page-level components
│   ├── services/            # API service layer
│   │   └── api.js          # Axios instance with interceptors
│   ├── utils/               # Utility functions
│   ├── context/             # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── App.js               # Main application component
│   └── index.js             # Application entry point
└── package.json
```

### Key Architectural Patterns

**Widget Registry Pattern:**
- Centralized widget registration system
- Dynamic widget loading based on user preferences
- Type-safe widget configuration

**Service Layer:**
- All API calls abstracted into service modules
- Consistent error handling across the application
- Automatic authentication token injection

**Component Composition:**
- Small, reusable components
- Props-based configuration
- Separation of concerns (presentation vs. logic)

## Getting Started

### Prerequisites
- Node.js 14 or higher
- npm 6 or higher
- Backend server running on http://localhost:5000

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open at http://localhost:3000

### Build for Production

```bash
npm run build
```

Creates an optimized production build in the `build/` folder.

## Dashboard System

### Widget System

The dashboard uses a registry pattern for widget management:

**Widget Registration:**
```javascript
// In src/utils/widgetRegistry.js
export const widgetRegistry = {
  myTasks: {
    component: MyTasksWidget,
    defaultSize: { w: 6, h: 4 },
    minSize: { w: 3, h: 3 },
    title: "My Tasks"
  },
  // ... more widgets
};
```

**Creating Custom Widgets:**

1. Create widget component in `src/components/dashboard/widgets/`
2. Implement required props interface
3. Use `useCallback` for functions passed to child components
4. Register widget in `widgetRegistry.js`

Example widget structure:
```javascript
import React, { useCallback, useEffect, useState } from 'react';

const MyCustomWidget = ({ projectId, onUpdate }) => {
  const [data, setData] = useState([]);

  // Use useCallback for functions to prevent infinite re-renders
  const fetchData = useCallback(async () => {
    // Fetch data from API
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="widget-container">
      {/* Widget content */}
    </div>
  );
};

export default MyCustomWidget;
```

### Dashboard Templates

Templates are predefined dashboard layouts:

```javascript
// Developer Dashboard Template
{
  name: "Developer Dashboard",
  description: "Optimized for developers",
  layout: [
    { i: 'myTasks', x: 0, y: 0, w: 6, h: 4 },
    { i: 'burndownChart', x: 6, y: 0, w: 6, h: 4 },
    { i: 'projectSummary', x: 0, y: 4, w: 12, h: 3 }
  ],
  widgets: ['myTasks', 'burndownChart', 'projectSummary']
}
```

Users can:
- Select from predefined templates
- Customize widget positions
- Add/remove widgets
- Save custom layouts

## Authentication

### Axios Configuration

The application uses axios interceptors for automatic authentication:

**Request Interceptor:**
```javascript
// In src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Token Management

- JWT tokens stored in `localStorage`
- 24-hour token expiration
- Automatic logout on token expiration
- Token included in all API requests via interceptor

### User Roles and Permissions

**Role-Based UI:**
- Admin: Full access to all features
- Project Manager: Project creation, team management, reports
- Developer/Designer: Task management, time tracking, personal dashboard
- Restrictions enforced on both frontend and backend

## Component Structure

### Page Components

Located in `src/pages/`:
- `Dashboard.js` - Main dashboard with widgets
- `Projects.js` - Project list and management
- `TaskBoard.js` - Kanban board view
- `Analytics.js` - Charts and reports
- `Profile.js` - User profile and settings

### Widget Components

Located in `src/components/dashboard/widgets/`:
- Follow consistent naming: `<Name>Widget.js`
- Implement loading states and error handling
- Use `useCallback` for functions to prevent re-renders
- Handle API errors gracefully

### Common Components

Located in `src/components/common/`:
- `Header.js` - Navigation and user menu
- `Sidebar.js` - App navigation
- `Modal.js` - Reusable modal component
- `LoadingSpinner.js` - Loading indicator

## Best Practices

### Performance Optimization

1. **Use useCallback for Widget Functions:**
```javascript
const handleUpdate = useCallback(() => {
  // Update logic
}, [dependencies]);
```

2. **Memoize Expensive Calculations:**
```javascript
const computedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);
```

3. **Lazy Load Components:**
```javascript
const Analytics = lazy(() => import('./pages/Analytics'));
```

### State Management

- Use React Context for global state (user, theme)
- Local state for component-specific data
- Consider Redux for complex state requirements

### Error Handling

Always handle API errors:
```javascript
try {
  const response = await api.get('/endpoint');
  setData(response.data);
} catch (error) {
  console.error('Error fetching data:', error);
  setError(error.response?.data?.message || 'An error occurred');
}
```

### Code Style

- Use functional components with hooks
- Follow ESLint configuration
- Consistent naming conventions:
  - Components: PascalCase
  - Functions: camelCase
  - Constants: UPPER_SNAKE_CASE

## Available Scripts

### `npm start`

Runs the app in development mode at http://localhost:3000

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder. Optimized and minified.

### `npm run eject`

**Warning: This is a one-way operation!**

Ejects from Create React App, giving you full control over webpack configuration.

## Troubleshooting

### Common Issues

**Problem:** "Network Error" when making API calls
- **Solution:** Ensure backend server is running on http://localhost:5000
- Check CORS configuration in backend

**Problem:** Authentication not working
- **Solution:** Clear localStorage and log in again
- Verify JWT_SECRET matches between frontend and backend

**Problem:** Widgets not rendering correctly
- **Solution:** Check browser console for errors
- Ensure widget is registered in `widgetRegistry.js`
- Verify component exports

**Problem:** Dashboard layout not saving
- **Solution:** Check API endpoint `/api/users/dashboard-layout`
- Verify user authentication token is valid

**Problem:** Build fails
- **Solution:** Delete `node_modules` and run `npm install` again
- Check for dependency version conflicts

### Development Tips

1. Use React DevTools for debugging component state
2. Check Network tab for API request/response details
3. Enable Redux DevTools if using Redux
4. Use browser console for error messages

## Additional Resources

- [React Documentation](https://reactjs.org/)
- [React Router Documentation](https://reactrouter.com/)
- [React Grid Layout Documentation](https://github.com/react-grid-layout/react-grid-layout)
- [Axios Documentation](https://axios-http.com/)
- [Chart.js Documentation](https://www.chartjs.org/)

## Contributing

When contributing to the frontend:

1. Follow the existing code style and structure
2. Write unit tests for new components
3. Update documentation for new features
4. Test across different browsers
5. Ensure responsive design works on mobile

For more details, see the main project [CONTRIBUTING.md](../CONTRIBUTING.md)

## License

See [LICENSE](../LICENSE) in the project root.
