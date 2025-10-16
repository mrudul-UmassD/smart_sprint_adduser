# Smart Sprint Documentation
*Generated on: July 23, 2024*

## Table of Contents
1. [Application Overview](#application-overview)
2. [System Architecture](#system-architecture)
3. [Frontend Components](#frontend-components)
4. [Backend Services](#backend-services)
5. [Installation & Setup](#installation--setup)
6. [API Documentation](#api-documentation)
7. [Troubleshooting](#troubleshooting)

## Application Overview

Smart Sprint is a comprehensive project management application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides features for task management, team collaboration, and project analytics through a user-friendly web interface.

### Key Features

- **User Authentication and Authorization**: 
  - Secure login with JWT
  - Role-based access control (Admin, Project Manager, Developer)
  - First-time login experience
  - Password reset functionality
  - Session management

- **Project Management**: 
  - Create, update, and track projects
  - Team member assignment
  - Project analytics and reporting
  - Project status tracking
  - Deadline management
  - Resource allocation

- **Task Management**: 
  - Kanban board with drag-and-drop
  - Task creation, editing, and assignment
  - Status tracking and filtering
  - Priority levels (Low, Medium, High, Critical)
  - Due date tracking with notifications
  - Task comments and attachments

- **Team Management**: 
  - Team creation and configuration
  - Member assignment and role management
  - Team performance analytics
  - Workload balancing
  - Skill tracking and allocation

- **Analytics and Reporting**: 
  - Sprint performance metrics
  - Burndown charts
  - Velocity tracking
  - Team productivity analysis
  - Custom report generation
  - Data export functionality

- **Customizable Dashboards**: 
  - Drag-and-drop widgets
  - Multiple layout options (Grid, List, Compact)
  - Theme customization (Light/Dark)
  - Widget configuration and persistence
  - Real-time data updates

- **Notification System**:
  - Real-time notifications
  - Email notifications
  - Task assignment alerts
  - Deadline reminders
  - System announcements
  - Customizable notification preferences

- **User Profile Management**:
  - Profile customization
  - Preference settings
  - Activity history
  - Personal dashboard configuration
  - Theme preferences

## System Architecture

Smart Sprint follows a modern client-server architecture with clear separation of concerns:

### Technology Stack

- **Frontend**: React.js with Material UI and React Bootstrap
- **Backend**: Node.js with Express.js
- **Database**: MongoDB (document-based NoSQL)
- **Authentication**: JSON Web Tokens (JWT)
- **State Management**: React Hooks and Context API
- **Drag & Drop Functionality**: @hello-pangea/dnd library
- **API Communication**: Axios
- **Data Visualization**: Chart.js
- **Grid Layout**: React Grid Layout
- **Icons**: React Icons, Material UI Icons

### System Components

1. **Frontend Application**:
   - Single Page Application (SPA) built with React
   - Responsive UI using Bootstrap and Material UI components
   - Component-based architecture for reusability
   - Context API for global state management
   - Local storage for persistent user preferences

2. **Backend API Server**:
   - RESTful API endpoints organized by resource
   - JWT authentication for secure access
   - Middleware for request validation and error handling
   - Rate limiting for security
   - CORS configuration for cross-origin requests

3. **Database Layer**:
   - MongoDB for flexible document storage
   - Mongoose ODM for schema validation and queries
   - Indexes for query optimization
   - Data validation at the schema level

## Frontend Components

### Core Components

1. **Authentication Components**:
   - Login
   - Register
   - PasswordReset
   - FirstTimeLogin
   - TwoFactorAuthentication

2. **Layout Components**:
   - Navbar
   - Sidebar
   - Footer
   - ThemeToggle
   - NotificationCenter
   - Breadcrumbs
   - PageContainer

3. **Dashboard Components**:
   - CustomDashboard
   - WidgetRenderer
   - DashboardSettings
   - LayoutSelector
   - WidgetSelector
   - DashboardFilter
   - EmptyDashboard

4. **Project Components**:
   - ProjectList
   - ProjectDetails
   - ProjectForm
   - ProjectMembers
   - ProjectTimeline
   - ProjectSettings
   - ProjectAnalytics
   - ProjectRequests

5. **Task Components**:
   - KanbanBoard
   - TaskCard
   - TaskForm
   - TaskDetails
   - TaskComments
   - TaskAttachments
   - TaskHistory
   - TaskFilters
   - TaskPriority
   - TaskStatusSelector

6. **Team Components**:
   - TeamList
   - TeamDetails
   - TeamForm
   - TeamMembers
   - TeamPerformance
   - TeamWorkload

7. **User Components**:
   - UserProfile
   - UserSettings
   - UserAvatar
   - UserList
   - UserForm
   - UserRoleSelector

8. **Notification Components**:
   - NotificationList
   - NotificationItem
   - NotificationBadge
   - NotificationSettings
   - CenterNotification
   - NotificationSystem

### Widget Components

1. **ProjectSummaryWidget**: 
   - Project completion percentage
   - Task status distribution
   - Recent activities
   - Team member allocation

2. **MyTasksWidget**: 
   - Task priority indicators
   - Due date tracking
   - Quick status updates
   - Task filtering options

3. **BurndownChartWidget**: 
   - Ideal vs. actual burndown
   - Remaining work calculation
   - Sprint timeline visualization
   - Trend analysis

4. **TeamPerformanceWidget**: 
   - Velocity tracking
   - Task completion rate
   - Member contribution charts
   - Performance trends

5. **TasksWidget**: 
   - Task list with filtering
   - Quick task creation
   - Status updates
   - Assignment management

6. **TimeTrackingWidget**: 
   - Time entry recording
   - Weekly/monthly summaries
   - Project time allocation
   - Time reports

7. **TaskPriorityWidget**: 
   - Priority breakdown chart
   - Critical task highlighting
   - Priority-based filtering
   - Quick priority updates

8. **TeamVelocityWidget**: 
   - Sprint comparison
   - Velocity trends
   - Story point completion
   - Capacity planning

9. **NotificationsWidget**: 
   - Unread notification indicators
   - Notification categories
   - Quick actions
   - Notification preferences

## Backend Services

### API Structure

- RESTful endpoints organized by resource
- JWT authentication for secure access
- Middleware for request validation and error handling
- Rate limiting for security
- CORS configuration for cross-origin requests
- Error handling middleware
- Logging and monitoring

### Key Services

1. **Authentication Service** (`/api/auth`):
   - User registration and login
   - Password management (change, reset)
   - JWT token generation and validation
   - First-time login handling
   - Session management
   - Two-factor authentication (optional)

2. **User Service** (`/api/users`):
   - User profile management
   - Role-based permissions
   - Team assignments
   - User search and filtering
   - Profile picture management
   - User activity tracking
   - Dashboard layout persistence

3. **Project Service** (`/api/projects`):
   - Project CRUD operations
   - Team member management
   - Project analytics
   - Project status updates
   - Resource allocation
   - Project join requests
   - Project archiving

4. **Task Service** (`/api/tasks`):
   - Task CRUD operations
   - Status updates
   - Assignment management
   - Task comments
   - Attachment handling
   - Task history tracking
   - Bulk task operations
   - Task filtering and search

5. **Team Service** (`/api/teams`):
   - Team CRUD operations
   - Member management
   - Team performance metrics
   - Capacity planning
   - Team analytics
   - Skill tracking

6. **Analytics Service** (`/api/analytics`):
   - Performance metrics calculation
   - Report generation
   - Data aggregation
   - Trend analysis
   - Custom metric creation
   - Data export

7. **Notification Service** (`/api/notifications`):
   - Notification creation and delivery
   - Notification preferences
   - Read/unread status management
   - Notification categories
   - Email notification integration
   - Real-time notifications

8. **User Settings Service** (`/api/user-settings`):
   - Preference management
   - Theme settings
   - Notification preferences
   - Dashboard configuration
   - Language preferences
   - Accessibility settings

9. **Reports Service** (`/api/reports`):
   - Custom report generation
   - Report scheduling
   - Data export (CSV, PDF)
   - Report templates
   - Visualization options

## Installation & Setup

### Prerequisites

- Node.js (v14+)
- MongoDB (v4+)
- npm or yarn

### Installation Steps

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/smart-sprint.git
   cd smart-sprint
   ```

2. Install dependencies:
   ```
   npm run install-all
   ```

3. Configure environment variables:
   - Create a `.env` file in the backend directory
   - Add the following variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/smart-sprint
     JWT_SECRET=your_jwt_secret
     NODE_ENV=development
     ```

4. Start the development servers:
   ```
   npm run dev
   ```

## API Documentation

### Authentication Endpoints

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Authenticate a user
- `POST /api/auth/change-password`: Change user password
- `POST /api/auth/reset-password`: Request password reset
- `POST /api/auth/reset-password/:token`: Reset password with token
- `POST /api/auth/first-password`: Set password on first login
- `GET /api/auth/verify`: Verify authentication token

### User Endpoints

- `GET /api/users`: Get all users
- `GET /api/users/:id`: Get user by ID
- `PUT /api/users/:id`: Update user
- `DELETE /api/users/:id`: Delete user
- `POST /api/users/profile-picture`: Upload profile picture
- `GET /api/users/me`: Get current user profile
- `PATCH /api/users/:id/role`: Update user role
- `PATCH /api/users/:id/team`: Update user team
- `POST /api/users/dashboard-layouts`: Save dashboard layout
- `GET /api/users/dashboard-layouts`: Get user dashboard layouts
- `GET /api/users/dashboard-layouts/:id`: Get specific dashboard layout
- `PUT /api/users/dashboard-layouts/:id`: Update dashboard layout
- `DELETE /api/users/dashboard-layouts/:id`: Delete dashboard layout

### Project Endpoints

- `GET /api/projects`: Get all projects
- `GET /api/projects/:id`: Get project by ID
- `POST /api/projects`: Create a new project
- `PUT /api/projects/:id`: Update project
- `DELETE /api/projects/:id`: Delete project
- `GET /api/projects/:id/members`: Get project members
- `POST /api/projects/:id/members`: Add project member
- `DELETE /api/projects/:id/members/:userId`: Remove project member
- `POST /api/projects/:id/requests`: Submit join request
- `GET /api/projects/:id/requests`: Get project join requests
- `PATCH /api/projects/:id/requests/:requestId`: Update request status
- `GET /api/projects/:id/analytics`: Get project analytics

### Task Endpoints

- `GET /api/tasks`: Get all tasks
- `GET /api/tasks/:id`: Get task by ID
- `POST /api/tasks`: Create a new task
- `PUT /api/tasks/:id`: Update task
- `DELETE /api/tasks/:id`: Delete task
- `GET /api/tasks/project/:projectId`: Get tasks by project
- `GET /api/tasks/user/:userId`: Get tasks by user
- `PATCH /api/tasks/:id/status`: Update task status
- `PATCH /api/tasks/:id/priority`: Update task priority
- `PATCH /api/tasks/:id/assignee`: Update task assignee
- `POST /api/tasks/:id/comments`: Add task comment
- `GET /api/tasks/:id/comments`: Get task comments
- `POST /api/tasks/:id/attachments`: Add task attachment
- `GET /api/tasks/:id/attachments`: Get task attachments
- `GET /api/tasks/:id/history`: Get task history

### Team Endpoints

- `GET /api/teams`: Get all teams
- `GET /api/teams/:id`: Get team by ID
- `POST /api/teams`: Create a new team
- `PUT /api/teams/:id`: Update team
- `DELETE /api/teams/:id`: Delete team
- `GET /api/teams/:id/members`: Get team members
- `POST /api/teams/:id/members`: Add team member
- `DELETE /api/teams/:id/members/:userId`: Remove team member
- `GET /api/teams/:id/performance`: Get team performance metrics

### Analytics Endpoints

- `GET /api/analytics/projects/:projectId`: Get project analytics
- `GET /api/analytics/teams/:teamId`: Get team analytics
- `GET /api/analytics/users/:userId`: Get user analytics
- `GET /api/analytics/tasks`: Get task analytics
- `GET /api/analytics/velocity`: Get velocity metrics
- `GET /api/analytics/burndown/:sprintId`: Get burndown data

### Notification Endpoints

- `GET /api/notifications`: Get user notifications
- `GET /api/notifications/:id`: Get notification by ID
- `PATCH /api/notifications/:id/read`: Mark notification as read
- `PATCH /api/notifications/read-all`: Mark all notifications as read
- `DELETE /api/notifications/:id`: Delete notification
- `GET /api/notifications/unread-count`: Get unread notification count
- `GET /api/notifications/settings`: Get notification settings
- `PUT /api/notifications/settings`: Update notification settings

### User Settings Endpoints

- `GET /api/user-settings`: Get user settings
- `PUT /api/user-settings`: Update user settings
- `GET /api/user-settings/theme`: Get user theme
- `PUT /api/user-settings/theme`: Update user theme
- `GET /api/user-settings/notifications`: Get notification preferences
- `PUT /api/user-settings/notifications`: Update notification preferences

### Reports Endpoints

- `GET /api/reports`: Get available reports
- `GET /api/reports/:id`: Get report by ID
- `POST /api/reports`: Generate custom report
- `GET /api/reports/export/:id`: Export report data
- `POST /api/reports/schedule`: Schedule report generation

## Troubleshooting

### Common Issues

1. **Connection Issues**:
   - Verify MongoDB connection string
   - Check if MongoDB service is running
   - Ensure correct port configuration
   - Check network firewall settings
   - Verify database user permissions

2. **Authentication Problems**:
   - Verify JWT secret is properly set
   - Check token expiration settings
   - Ensure correct credentials are being used
   - Clear browser cache and cookies
   - Check for CORS issues in browser console

3. **Widget Loading Issues**:
   - Check browser console for errors
   - Verify API endpoints are accessible
   - Ensure widget configuration is correct
   - Check network tab for failed requests
   - Verify data format from API responses

4. **Performance Issues**:
   - Optimize database queries
   - Implement pagination for large data sets
   - Use React.memo for component optimization
   - Check for memory leaks in components
   - Optimize image and asset sizes

5. **Layout Problems**:
   - Check responsive design breakpoints
   - Verify CSS conflicts
   - Test on multiple browsers and devices
   - Check for z-index conflicts
   - Validate HTML structure

### Support

For additional support, please contact the development team or submit an issue on the project repository.