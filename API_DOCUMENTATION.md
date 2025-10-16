# Smart Sprint API Documentation

## Overview

The Smart Sprint API provides RESTful endpoints for managing projects, tasks, users, and dashboard widgets. All endpoints require authentication unless otherwise specified.

## Base URL
```
http://localhost:5000/api
```

## Authentication

Smart Sprint uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

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

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "Developer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "Developer"
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

### Login User
**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "Developer"
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

### Get User Profile
**GET** `/auth/profile`

Get current user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "Developer",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

## User Management Endpoints

### Get All Users
**GET** `/users`

Get list of all users (Admin only).

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `role` (optional): Filter by role

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "username": "john_doe",
        "email": "john@example.com",
        "role": "Developer",
        "isActive": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 50
    }
  }
}
```

### Update User
**PUT** `/users/:id`

Update user information (Admin or own profile).

**Request Body:**
```json
{
  "username": "new_username",
  "email": "new@example.com",
  "role": "Project Manager"
}
```

### Delete User
**DELETE** `/users/:id`

Delete user account (Admin only).

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

### Get User Widgets
**GET** `/dashboard/widgets`

Get all widgets configured for the current user's dashboard.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "widget_id",
      "type": "TASK_PROGRESS",
      "config": {
        "projectId": "project_id",
        "limit": 5
      },
      "position": {
        "x": 0,
        "y": 0,
        "w": 6,
        "h": 8
      }
    }
  ]
}
```

### Add Widget
**POST** `/dashboard/widgets`

Add a new widget to the user's dashboard.

**Request Body:**
```json
{
  "type": "BURNDOWN_CHART",
  "config": {
    "projectId": "project_id",
    "timeRange": "7days"
  },
  "position": {
    "x": 6,
    "y": 0,
    "w": 6,
    "h": 8
  }
}
```

### Update Widget
**PUT** `/dashboard/widgets/:id`

Update widget configuration or position.

**Request Body:**
```json
{
  "config": {
    "projectId": "new_project_id",
    "limit": 10
  },
  "position": {
    "x": 0,
    "y": 8,
    "w": 12,
    "h": 6
  }
}
```

### Remove Widget
**DELETE** `/dashboard/widgets/:id`

Remove a widget from the dashboard.

## Analytics Endpoints

### Get Project Analytics
**GET** `/analytics/projects/:id`

Get analytics data for a specific project.

**Response:**
```json
{
  "success": true,
  "data": {
    "taskCompletion": {
      "completed": 15,
      "inProgress": 8,
      "todo": 12
    },
    "burndownData": [
      {
        "date": "2025-01-01",
        "remainingHours": 100
      }
    ],
    "teamVelocity": {
      "currentSprint": 25,
      "averageVelocity": 22
    }
  }
}
```

### Get Team Performance
**GET** `/analytics/team-performance`

Get team performance metrics.

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error - Server error |

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated endpoints

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response includes pagination info:**
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Webhooks

Smart Sprint supports webhooks for real-time notifications:

### Available Events
- `task.created`
- `task.updated`
- `task.completed`
- `project.created`
- `sprint.started`
- `sprint.completed`

### Webhook Configuration
**POST** `/webhooks`

```json
{
  "url": "https://your-app.com/webhook",
  "events": ["task.created", "task.updated"],
  "secret": "webhook_secret"
}
```

## SDK and Libraries

Official SDKs are available for:
- JavaScript/Node.js
- Python
- PHP

Example usage (JavaScript):
```javascript
import SmartSprintAPI from 'smart-sprint-sdk';

const api = new SmartSprintAPI({
  baseURL: 'http://localhost:5000/api',
  token: 'your-jwt-token'
});

const projects = await api.projects.getAll();
```