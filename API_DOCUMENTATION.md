# Smart Sprint API Documentation

**Version:** 2.0  
**Last Updated:** November 17, 2025

## Overview

The Smart Sprint API provides RESTful endpoints for managing projects, tasks, users, teams, and customizable dashboard widgets. All endpoints require authentication unless otherwise specified.

## Base URL

**Development:**
```
http://localhost:5000/api
```

**Production:**
```
https://your-production-domain.com/api
```

## Authentication

Smart Sprint uses JWT (JSON Web Tokens) for authentication. The token is automatically included in requests when using the configured axios instance.

**Manual Token Usage:**
```
Authorization: Bearer <your-jwt-token>
```

**Token Expiration:** Tokens expire after 24 hours and must be refreshed.

## Response Format

All API responses follow this structure:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "error": null
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "message": "Error message",
  "error": "Detailed error information"
}
```

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Register a new user account.

**Rate Limit:** 3 requests per 24 hours per IP

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securePassword123",
  "role": "Developer",
  "team": "Frontend",
  "level": "Mid"
}
```

**Validation Rules:**
- `username`: 3-30 characters, required, unique
- `password`: Minimum 8 characters, required
- `role`: One of: `Admin`, `Project Manager`, `Developer`, `Designer`
- `team`: Required for Developer/Designer. One of: `Frontend`, `Backend`, `Design`, `DevOps`, `QA`. For Admin: `admin`, for PM: `PM`
- `level`: Required for Developer/Designer. One of: `Junior`, `Mid`, `Senior`, `Lead`. For Admin: `admin`, for PM: `PM`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "john_doe",
      "role": "Developer",
      "team": "Frontend",
      "level": "Mid",
      "isFirstLogin": true
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

### Login User
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Rate Limit:** 5 requests per hour per IP

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "username": "john_doe",
      "role": "Developer",
      "team": "Frontend",
      "level": "Mid",
      "isFirstLogin": false,
      "lastLogin": "2025-11-17T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

**Error Responses:**
- `401`: Invalid credentials
- `429`: Too many login attempts

### Admin Login (Bypass Rate Limiting)
**POST** `/auth/admin-login`

Special endpoint for admin login that bypasses rate limiting.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin_password"
}
```

### Change Password
**POST** `/auth/change-password`

Change user password (required on first login).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "isFirstLogin": false
  }
}
```

### Get User Profile
**GET** `/users/me`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "user_id",
  "username": "john_doe",
  "role": "Developer",
  "team": "Frontend",
  "level": "Mid",
  "email": "john@example.com",
  "fullName": "John Doe",
  "profilePicture": "/uploads/profile/profile-123456.jpg",
  "projects": ["project_id_1", "project_id_2"],
  "lastLogin": "2025-11-17T00:00:00.000Z",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "themePreference": "dark",
  "notificationSettings": {
    "emailNotifications": true,
    "pushNotifications": true,
    "taskReminders": true,
    "projectUpdates": true
  }
}
```

## User Management Endpoints

### Get All Users
**GET** `/users`

Get list of all users (Admin and Project Manager only).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role (`Admin`, `Project Manager`, `Developer`, `Designer`)
- `team` (optional): Filter by team
- `level` (optional): Filter by level

**Response:**
```json
[
  {
    "_id": "user_id",
    "username": "john_doe",
    "role": "Developer",
    "team": "Frontend",
    "level": "Mid",
    "email": "john@example.com",
    "fullName": "John Doe",
    "profilePicture": "/uploads/profile/profile-123456.jpg",
    "projects": ["project_id_1"],
    "isFirstLogin": false,
    "lastLogin": "2025-11-17T00:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

### Create User
**POST** `/users`

Create a new user (Admin and Project Manager only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "new_user",
  "role": "Developer",
  "team": "Backend",
  "level": "Senior"
}
```

**Notes:**
- Initial password is automatically set to the username
- User must change password on first login
- For Admin role: `team` must be `admin`, `level` must be `admin`
- For Project Manager role: `team` must be `PM`, `level` must be `PM`
- For Developer/Designer: `team` is required and must be one of: `Frontend`, `Backend`, `Design`, `DevOps`, `QA`

**Response:**
```json
{
  "_id": "new_user_id",
  "username": "new_user",
  "role": "Developer",
  "team": "Backend",
  "level": "Senior",
  "isFirstLogin": true,
  "createdAt": "2025-11-17T00:00:00.000Z"
}
```

### Update User
**PATCH** `/users/:id`

Update user information (Admin, Project Manager, or own profile).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "updated_username",
  "email": "updated@example.com",
  "fullName": "Updated Name",
  "role": "Senior Developer",
  "team": "Frontend",
  "level": "Senior"
}
```

**Notes:**
- Password cannot be updated through this endpoint (use `/auth/change-password`)
- Role changes require Admin privileges
- Team/level changes follow the same rules as user creation

**Response:**
```json
{
  "_id": "user_id",
  "username": "updated_username",
  "email": "updated@example.com",
  "fullName": "Updated Name",
  "role": "Senior Developer",
  "team": "Frontend",
  "level": "Senior"
}
```

### Delete User
**DELETE** `/users/:id`

Delete user account (Admin and Project Manager only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### Upload Profile Picture
**POST** `/users/profile-picture`

Upload a profile picture for the current user.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `profilePicture`: Image file (JPG, PNG, GIF - max 5MB)

**Response:**
```json
{
  "message": "Profile picture uploaded successfully",
  "profilePicture": "/uploads/profile/profile-123456.jpg"
}
```

### Get User Projects
**GET** `/users/projects`

Get all projects assigned to the current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "project_id",
    "name": "Smart Sprint v2.0",
    "description": "Next version",
    "status": "active",
    "teamMembers": ["user_id_1", "user_id_2"]
  }
]
```

### Assign Project to User
**POST** `/users/:userId/projects/:projectId`

Assign a project to a user (Admin/Manager only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Project assigned successfully"
}
```

### Remove Project from User
**DELETE** `/users/:userId/projects/:projectId`

Remove a project assignment from a user (Admin/Manager only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Project unassigned successfully"
}
```

## Project Endpoints

### Get All Projects
**GET** `/projects`

Get all projects accessible to the current user.

**Query Parameters:**
- `status` (optional): Filter by project status
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "project_id",
      "name": "Smart Sprint v2.0",
      "description": "Next version of Smart Sprint",
      "status": "active",
      "startDate": "2025-01-01",
      "endDate": "2025-06-30",
      "teamMembers": ["user_id_1", "user_id_2"],
      "createdBy": "admin_user_id",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Project
**POST** `/projects`

Create a new project.

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "startDate": "2025-01-01",
  "endDate": "2025-06-30",
  "teamMembers": ["user_id_1", "user_id_2"]
}
```

### Get Project by ID
**GET** `/projects/:id`

Get detailed information about a specific project.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "project_id",
    "name": "Smart Sprint v2.0",
    "description": "Next version of Smart Sprint",
    "status": "active",
    "startDate": "2025-01-01",
    "endDate": "2025-06-30",
    "teamMembers": [
      {
        "id": "user_id",
        "username": "john_doe",
        "role": "Developer"
      }
    ],
    "tasks": [
      {
        "id": "task_id",
        "title": "Implement authentication",
        "status": "in_progress"
      }
    ],
    "sprints": [
      {
        "id": "sprint_id",
        "name": "Sprint 1",
        "status": "active"
      }
    ]
  }
}
```

### Update Project
**PUT** `/projects/:id`

Update project information.

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "status": "completed"
}
```

### Delete Project
**DELETE** `/projects/:id`

Delete a project and all associated data.

## Task Endpoints

### Get All Tasks
**GET** `/tasks`

Get all tasks accessible to the current user.

**Query Parameters:**
- `project` (optional): Filter by project ID
- `assignee` (optional): Filter by assignee ID
- `status` (optional): Filter by task status
- `priority` (optional): Filter by priority
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task_id",
      "title": "Implement user authentication",
      "description": "Add JWT-based authentication system",
      "status": "in_progress",
      "priority": "high",
      "assignee": {
        "id": "user_id",
        "username": "john_doe"
      },
      "project": {
        "id": "project_id",
        "name": "Smart Sprint v2.0"
      },
      "estimatedHours": 8,
      "actualHours": 5,
      "dueDate": "2025-01-15",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Task
**POST** `/tasks`

Create a new task.

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Task description",
  "project": "project_id",
  "assignee": "user_id",
  "priority": "medium",
  "estimatedHours": 4,
  "dueDate": "2025-01-20"
}
```

### Get Task by ID
**GET** `/tasks/:id`

Get detailed information about a specific task.

### Update Task
**PUT** `/tasks/:id`

Update task information.

**Request Body:**
```json
{
  "title": "Updated Task Title",
  "status": "completed",
  "actualHours": 6
}
```

### Delete Task
**DELETE** `/tasks/:id`

Delete a task.

## Sprint Endpoints

### Get All Sprints
**GET** `/sprints`

Get all sprints for accessible projects.

**Query Parameters:**
- `project` (optional): Filter by project ID
- `status` (optional): Filter by sprint status

### Create Sprint
**POST** `/sprints`

Create a new sprint.

**Request Body:**
```json
{
  "name": "Sprint 1",
  "project": "project_id",
  "startDate": "2025-01-01",
  "endDate": "2025-01-14",
  "goal": "Implement core authentication features"
}
```

### Update Sprint
**PUT** `/sprints/:id`

Update sprint information.

### Get Sprint Tasks
**GET** `/sprints/:id/tasks`

Get all tasks assigned to a specific sprint.

## Time Tracking Endpoints

### Get Time Entries
**GET** `/time-entries`

Get time entries for the current user.

**Query Parameters:**
- `task` (optional): Filter by task ID
- `project` (optional): Filter by project ID
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

### Create Time Entry
**POST** `/time-entries`

Log time spent on a task.

**Request Body:**
```json
{
  "task": "task_id",
  "hours": 2.5,
  "description": "Worked on authentication logic",
  "date": "2025-01-15"
}
```

### Update Time Entry
**PUT** `/time-entries/:id`

Update a time entry.

### Delete Time Entry
**DELETE** `/time-entries/:id`

Delete a time entry.

## Dashboard Widget Endpoints

### Get Dashboard Configuration
**GET** `/users/dashboard-layouts`

Get all saved dashboard layouts for the current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "layout_id",
    "name": "My Dashboard",
    "widgets": [
      {
        "id": "widget_uuid",
        "type": "myTasks",
        "config": {
          "limit": 5
        }
      },
      {
        "id": "widget_uuid_2",
        "type": "burndownChart",
        "config": {
          "projectId": "project_id"
        }
      }
    ],
    "layouts": {
      "lg": [
        {
          "i": "widget_uuid",
          "x": 0,
          "y": 0,
          "w": 6,
          "h": 8,
          "minW": 3,
          "minH": 3
        }
      ]
    },
    "createdAt": "2025-11-17T00:00:00.000Z",
    "updatedAt": "2025-11-17T12:00:00.000Z"
  }
]
```

### Save Dashboard Layout
**POST** `/users/dashboard-layouts`

Save a new dashboard layout.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "My Custom Dashboard",
  "widgets": [
    {
      "id": "generated_uuid",
      "type": "projectSummary",
      "config": {
        "projectId": "project_id"
      }
    }
  ],
  "layouts": {
    "lg": [
      {
        "i": "generated_uuid",
        "x": 0,
        "y": 0,
        "w": 12,
        "h": 8,
        "minW": 3,
        "minH": 3
      }
    ]
  }
}
```

**Available Widget Types:**
- `myTasks`: Display user's assigned tasks
- `projectSummary`: Show project overview
- `burndownChart`: Sprint burndown chart
- `taskPriority`: Task priority distribution pie chart
- `teamVelocity`: Team velocity over sprints
- `teamPerformance`: Team performance metrics
- `notifications`: Recent notifications
- `timeTracking`: Time tracking widget
- `projectMetrics`: Project metrics overview
- `taskProgress`: Task progress by status

**Response:**
```json
{
  "message": "Dashboard layout saved successfully",
  "data": {
    "_id": "layout_id",
    "name": "My Custom Dashboard",
    "widgets": [...],
    "layouts": {...}
  }
}
```

### Get Dashboard Layout by ID
**GET** `/users/dashboard-layouts/:id`

Get a specific dashboard layout.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "_id": "layout_id",
  "name": "My Dashboard",
  "widgets": [...],
  "layouts": {...},
  "createdAt": "2025-11-17T00:00:00.000Z",
  "updatedAt": "2025-11-17T12:00:00.000Z"
}
```

### Update Dashboard Layout
**PUT** `/users/dashboard-layouts/:id`

Update an existing dashboard layout.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Dashboard Name",
  "widgets": [...],
  "layouts": {...}
}
```

**Response:**
```json
{
  "message": "Dashboard layout updated successfully",
  "data": {
    "_id": "layout_id",
    "name": "Updated Dashboard Name",
    "updatedAt": "2025-11-17T13:00:00.000Z"
  }
}
```

### Delete Dashboard Layout
**DELETE** `/users/dashboard-layouts/:id`

Delete a dashboard layout.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Dashboard layout deleted successfully"
}
```

### Get Dashboard Templates
**GET** `/dashboard/templates`

Get available dashboard templates (predefined and custom).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "dev-dashboard",
    "name": "Developer Dashboard",
    "description": "Focus on tasks, project burndown, and code metrics",
    "widgets": [
      {
        "type": "myTasks",
        "config": { "limit": 5 },
        "x": 0,
        "y": 0,
        "w": 6,
        "h": 8
      },
      {
        "type": "burndownChart",
        "config": { "projectId": null },
        "x": 6,
        "y": 0,
        "w": 6,
        "h": 8
      }
    ]
  },
  {
    "id": "pm-dashboard",
    "name": "Project Manager Dashboard",
    "description": "Overview of all projects, resources, and timelines",
    "widgets": [...]
  }
]
```

**Predefined Templates:**
1. **Developer Dashboard**: Tasks, burndown chart, project summary
2. **Project Manager Dashboard**: Project summary, task priority, tasks, burndown
3. **Team Lead Dashboard**: Team velocity, tasks, task priority
4. **Minimal Dashboard**: Project summary, tasks, notifications

### Get Widget Data

Each widget type has its own data endpoint:

#### Task Priority Distribution
**GET** `/projects/:projectId/tasks/priority-distribution`

Get task priority distribution for a project.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "priorityDistribution": {
    "High": 5,
    "Medium": 12,
    "Low": 8,
    "Critical": 2
  }
}
```

#### Burndown Chart Data
**GET** `/projects/:projectId/burndown`

Get burndown chart data for a project.

**Query Parameters:**
- `sprintId` (optional): Specific sprint ID
- `startDate` (optional): Start date for custom range
- `endDate` (optional): End date for custom range

**Response:**
```json
{
  "burndownData": [
    {
      "date": "2025-11-01",
      "remainingHours": 100,
      "idealHours": 100
    },
    {
      "date": "2025-11-02",
      "remainingHours": 92,
      "idealHours": 93
    }
  ]
}
```

## Analytics Endpoints

### Get Project Analytics
**GET** `/analytics/projects/:id`

Get analytics data for a specific project.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): Start date for analytics (ISO format)
- `endDate` (optional): End date for analytics (ISO format)
- `period` (optional): `week`, `month`, `quarter`, `year` (default: `month`)

**Response:**
```json
{
  "success": true,
  "data": {
    "projectId": "project_id",
    "projectName": "Smart Sprint v2.0",
    "period": {
      "startDate": "2025-10-18",
      "endDate": "2025-11-17"
    },
    "taskCompletion": {
      "completed": 15,
      "inProgress": 8,
      "todo": 12,
      "blocked": 2,
      "completionRate": 40.5
    },
    "tasksByPriority": {
      "Critical": 2,
      "High": 5,
      "Medium": 12,
      "Low": 8
    },
    "burndownData": [
      {
        "date": "2025-11-01",
        "remainingHours": 100,
        "idealHours": 100,
        "completedHours": 0
      },
      {
        "date": "2025-11-15",
        "remainingHours": 45,
        "idealHours": 50,
        "completedHours": 55
      }
    ],
    "teamVelocity": {
      "currentSprint": 25,
      "previousSprint": 22,
      "averageVelocity": 23.5,
      "trend": "increasing"
    },
    "timeTracking": {
      "totalEstimatedHours": 200,
      "totalActualHours": 175,
      "efficiency": 87.5
    }
  }
}
```

### Get Team Performance
**GET** `/analytics/team-performance`

Get team performance metrics.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `teamId` (optional): Specific team ID
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response:**
```json
{
  "success": true,
  "data": {
    "team": "Frontend",
    "period": {
      "startDate": "2025-10-18",
      "endDate": "2025-11-17"
    },
    "members": [
      {
        "userId": "user_id",
        "username": "john_doe",
        "tasksCompleted": 12,
        "hoursWorked": 85,
        "efficiency": 92.3
      }
    ],
    "totalTasksCompleted": 45,
    "totalHoursWorked": 340,
    "averageTasksPerMember": 15,
    "velocityByWeek": [
      {
        "week": "2025-W44",
        "velocity": 22
      },
      {
        "week": "2025-W45",
        "velocity": 25
      }
    ]
  }
}
```

### Get User Analytics
**GET** `/analytics/users/:userId`

Get analytics for a specific user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `startDate` (optional): Start date
- `endDate` (optional): End date

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_id",
    "username": "john_doe",
    "period": {
      "startDate": "2025-10-18",
      "endDate": "2025-11-17"
    },
    "tasksCompleted": 12,
    "tasksInProgress": 3,
    "tasksTodo": 5,
    "hoursWorked": 85,
    "averageTaskCompletionTime": 4.2,
    "projectsInvolved": ["project_id_1", "project_id_2"],
    "performanceTrend": "improving"
  }
}
```

### Get Dashboard Analytics
**GET** `/analytics/dashboard`

Get overview analytics for the current user's dashboard.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `dateRange` (optional): `week`, `month`, `quarter`, `year` (default: `month`)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "tasksOverview": {
      "total": 35,
      "completed": 15,
      "inProgress": 8,
      "todo": 12
    },
    "projectsOverview": {
      "total": 3,
      "active": 2,
      "completed": 1
    },
    "timeTracking": {
      "totalHours": 85,
      "thisWeek": 22,
      "lastWeek": 18
    },
    "upcomingDeadlines": [
      {
        "taskId": "task_id",
        "taskTitle": "Implement authentication",
        "dueDate": "2025-11-20",
        "priority": "High"
      }
    ]
  }
}
```

## Error Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| 400 | Bad Request | Invalid input data, missing required fields |
| 401 | Unauthorized | Invalid or missing token, expired token |
| 403 | Forbidden | Insufficient permissions for the requested action |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate username) |
| 413 | Payload Too Large | Request body exceeds 1MB limit |
| 422 | Unprocessable Entity | Validation errors in request data |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error, database issues |

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information (development only)"
}
```

## Rate Limiting

API requests are limited per IP address:

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| General API | 100 requests | 15 minutes |
| Login | 5 requests | 1 hour |
| Registration | 3 requests | 24 hours |
| Password Reset | 3 requests | 1 hour |

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1637174400
```

**Rate Limit Exceeded Response:**
```json
{
  "success": false,
  "error": "Too many requests",
  "details": "Please try again later"
}
```

## Security Features

### CORS Configuration
- Development: All origins allowed
- Production: Whitelist specific origins
- Allowed methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
- Credentials: Enabled

### Security Headers
- `Strict-Transport-Security`: Enforced HTTPS
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: SAMEORIGIN
- `X-XSS-Protection`: Enabled
- `Content-Security-Policy`: Configured
- `X-Powered-By`: Hidden

### Request Size Limits
- JSON payload: 1MB maximum
- File uploads: 5MB maximum
- Form data: 1MB maximum

## Database Configuration

### Development
Uses in-memory MongoDB server (mongodb-memory-server) for:
- Fast startup without external dependencies
- Isolated testing environment
- Automatic cleanup

### Production
Requires MongoDB connection string:
```
MONGODB_URI=mongodb://username:password@host:port/database
```

**Connection Options:**
- Connection pooling enabled
- Automatic reconnection
- Server selection timeout: 10 seconds

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sort`: Sort field (e.g., `createdAt`, `-priority`)
- `search`: Search query (where applicable)

**Response includes pagination info:**
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Frontend Integration

### Axios Configuration

The frontend uses a configured axios instance with automatic token injection:

**Location:** `frontend/src/utils/axiosConfig.js`

```javascript
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - adds JWT token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles auth errors
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
```

**Usage in Components:**
```javascript
import axios from '../../utils/axiosConfig';

// GET request
const users = await axios.get('/users');

// POST request
const newUser = await axios.post('/users', userData);

// PUT request
const updated = await axios.put(`/users/${userId}`, updates);

// DELETE request
await axios.delete(`/users/${userId}`);
```

### Widget Components

All dashboard widgets should follow this structure:

```javascript
import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../utils/axiosConfig';

const MyWidget = ({ onRemove, onUpdateConfig, onToggleFullscreen, config }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/endpoint', {
        params: config
      });
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [config.projectId]); // Dependencies

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card className="widget">
      {/* Widget content */}
    </Card>
  );
};

export default MyWidget;
```

**Important:** Always use `useCallback` for data fetching functions to prevent infinite re-render loops.

## Testing

### Backend Tests

Run backend tests with in-memory MongoDB:

```bash
cd backend
npm test
```

**Test Configuration:**
- Uses `mongodb-memory-server` for isolated testing
- Automatic database cleanup between tests
- Jest test framework
- Supertest for API endpoint testing

**Test Files:**
- `backend/tests/auth.test.js` - Authentication tests
- `backend/tests/project.test.js` - Project management tests
- `backend/tests/security.test.js` - Security features tests
- `backend/tests/setup.js` - Test environment setup

### Frontend Tests

```bash
cd frontend
npm test
```

## Webhooks

Smart Sprint supports webhooks for real-time notifications:

### Available Events
- `task.created` - New task created
- `task.updated` - Task modified
- `task.completed` - Task marked as complete
- `task.assigned` - Task assigned to user
- `project.created` - New project created
- `project.updated` - Project modified
- `sprint.started` - Sprint started
- `sprint.completed` - Sprint completed
- `user.created` - New user added
- `user.updated` - User profile updated

### Webhook Configuration
**POST** `/webhooks`

```json
{
  "url": "https://your-app.com/webhook",
  "events": ["task.created", "task.updated"],
  "secret": "webhook_secret"
}
```

### Webhook Payload Format

```json
{
  "event": "task.created",
  "timestamp": "2025-11-17T12:00:00.000Z",
  "data": {
    "taskId": "task_id",
    "title": "New Task",
    "project": "project_id",
    "assignee": "user_id"
  },
  "signature": "hmac_signature"
}
```

## Environment Variables

### Backend (.env)

```bash
# Server
PORT=5000
NODE_ENV=development  # development, production, test

# Database
MONGODB_URI=mongodb://localhost:27017/smart-sprint

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
UPLOAD_MAX_SIZE=5242880  # 5MB in bytes
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif
```

### Frontend (.env)

```bash
# API
REACT_APP_API_URL=http://localhost:5000/api

# App Configuration
REACT_APP_NAME=Smart Sprint
REACT_APP_VERSION=2.0

# Features
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_NOTIFICATIONS=true
```

## Recent Changes (v2.0 - November 2025)

### Bug Fixes
1. **TaskPriorityWidget** - Fixed infinite render loop with `useCallback`
2. **DashboardTemplates** - Converted to controlled modal component
3. **User Management** - Added support for Admin/PM team and level fields
4. **Authentication** - Fixed axios imports to use configured instance

### New Features
1. **Dashboard Templates** - 4 predefined templates (Developer, PM, Team Lead, Minimal)
2. **In-Memory MongoDB** - Development environment uses mongodb-memory-server
3. **Enhanced User Model** - Support for custom team/level values per role
4. **Improved Security** - Rate limiting per endpoint type

### Breaking Changes
- Widget type names updated: `tasks` → `myTasks`, `burndown` → `burndownChart`
- User model now requires `team` and `level` fields for all roles
- Dashboard layout structure changed from nested to flat format

## SDK and Libraries

### Official JavaScript SDK (Planned)

```javascript
import SmartSprintAPI from 'smart-sprint-sdk';

const api = new SmartSprintAPI({
  baseURL: 'http://localhost:5000/api',
  token: 'your-jwt-token'
});

// Projects
const projects = await api.projects.getAll();
const project = await api.projects.getById(projectId);
await api.projects.create(projectData);

// Users
const users = await api.users.getAll();
const user = await api.users.getById(userId);

// Tasks
const tasks = await api.tasks.getAll({ projectId });
await api.tasks.create(taskData);

// Dashboard
const layouts = await api.dashboard.getLayouts();
await api.dashboard.saveLayout(layoutData);
```

## Support and Resources

- **GitHub Repository:** https://github.com/mrudul-UmassD/smart_sprint_adduser
- **Branch:** development
- **Documentation:** `/API_DOCUMENTATION.md`, `/BUGFIX_*.md`
- **Issues:** GitHub Issues
- **License:** See LICENSE file

## Changelog

See `CHANGELOG.md` for detailed version history.