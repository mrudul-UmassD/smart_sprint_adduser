# Smart Sprint - Project Management Application

Smart Sprint is a comprehensive project management application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides features for task management, team collaboration, and project analytics.

## Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/smart-sprint.git
cd smart-sprint

# Install all dependencies
npm run install-all

# Create .env file in backend directory with:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret

# Start both frontend and backend
npm run dev
```

## Features

- User Authentication and Authorization
- Project Management
- Task Management with Kanban Board
- Team Management
- Analytics and Reporting

### New Features
- **Task Dependencies and Gantt Charts**
  - Set up dependencies between tasks
  - Visualize project timelines with interactive Gantt charts
  - Identify critical paths and potential bottlenecks
  
- **Customizable Dashboards**
  - Configure dashboard with preferred metrics and widgets
  - Role-specific views highlighting relevant information
  - Drag-and-drop functionality for dashboard components
  
- **Advanced Reporting**
  - Export reports in various formats (PDF, Excel, CSV)
  - Generate burndown charts for sprint progress
  - Track velocity for development teams
  
- **Time Tracking**
  - Log time spent on tasks
  - Generate timesheet reports for billing or productivity analysis
  - Set reminders for timely updates
  
- **Third-Party Integrations**
  - Connect with version control systems (GitHub, GitLab)
  - Integrate with communication tools (Slack, Microsoft Teams)
  - Link with calendar applications for deadline management
  
- **Document Management**
  - Version control for attached files
  - Centralized document repository for projects
  - Collaboration features for document editing

- Real-time Updates
- File Attachments
- Role-based Access Control

## Tech Stack

### Frontend
- React.js
- React Bootstrap
- Material-UI
- React Grid Layout (for customizable dashboards)
- Gantt-Task-React (for Gantt charts)
- Chart.js and Recharts (for data visualization)
- React Big Calendar (for scheduling)
- Axios
- React Router
- XLSX and jsPDF (for report exports)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer (File Uploads)
- Passport (OAuth for third-party integrations)
- Socket.io (for real-time updates)
- PDF-Lib and Excel.js (for report generation)
- Nodemailer (for notifications)

## Security Features
- Rate Limiting
- Input Validation
- CORS Configuration
- Helmet Security Headers
- Password Hashing
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

#### Option 1: Install all dependencies with a single command (Recommended)
```bash
# From the root directory
npm run install-all
```
This will install dependencies for the root, backend, and frontend in one go.

#### Option 2: Install dependencies separately
1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-sprint.git
cd smart-sprint
```

2. Install root dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

4. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

5. Create a .env file in the backend directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:3000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

### Running the Application

#### Option 1: Start both frontend and backend with a single command (Recommended)
```bash
# From the root directory
npm run dev
```
This will start both the backend server and frontend development server concurrently.

#### Option 2: Start servers separately
1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at http://localhost:3000

## API Documentation

### Authentication
- POST /api/auth/login - User login
- POST /api/auth/first-login - First-time user setup

### Users
- GET /api/users - Get all users
- POST /api/users - Create new user
- PUT /api/users/:id - Update user
- DELETE /api/users/:id - Delete user

### Projects
- GET /api/projects - Get all projects
- POST /api/projects - Create new project
- PUT /api/projects/:id - Update project
- DELETE /api/projects/:id - Delete project

### Tasks
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create new task
- PUT /api/tasks/:id - Update task
- DELETE /api/tasks/:id - Delete task
- POST /api/tasks/:id/dependencies - Add dependencies to a task
- DELETE /api/tasks/:id/dependencies/:dependencyId - Remove a dependency
- POST /api/tasks/:id/time - Log time spent on a task
- GET /api/tasks/timeEntries/user - Get time entries for a user

### Dashboard Settings
- GET /api/settings - Get user settings
- PATCH /api/settings/dashboard/layout - Update dashboard layout
- PATCH /api/settings/dashboard/theme - Update dashboard theme
- POST /api/settings/dashboard/widgets - Add a dashboard widget
- PATCH /api/settings/dashboard/widgets/:widgetId - Update a widget
- DELETE /api/settings/dashboard/widgets/:widgetId - Remove a widget

### Reports
- GET /api/reports/burndown/:projectId - Get burndown chart data
- GET /api/reports/velocity/:projectId - Get velocity tracking data
- GET /api/reports/timeTracking/export - Export time tracking report

### Integrations
- POST /api/settings/integrations - Add or update a third-party integration
- DELETE /api/settings/integrations/:type - Remove an integration

### Documents
- POST /api/tasks/:id/documents - Upload a document to a task
- POST /api/tasks/:id/documents/:documentId/versions - Upload a new version

## Testing

Run tests for the backend:
```bash
cd backend
npm test
```

Run tests for the frontend:
```bash
cd frontend
npm test
```

## Deployment

The application can be deployed using Render.com. Follow these steps:

1. Create a Render.com account
2. Connect your GitHub repository
3. Set up environment variables
4. Deploy using the render.yaml configuration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Material-UI for UI components
- Chart.js for data visualization
- React Bootstrap for responsive design
- Gantt-Task-React for Gantt charts
- React Grid Layout for customizable dashboards 