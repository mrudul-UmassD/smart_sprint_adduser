# Smart Sprint - Agile Project Management System

![Smart Sprint Logo](https://img.shields.io/badge/Smart%20Sprint-v2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node.js](https://img.shields.io/badge/node.js-v18+-green.svg)
![React](https://img.shields.io/badge/react-v18+-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-v6+-green.svg)

Smart Sprint is a comprehensive agile project management system designed to streamline team collaboration, track project progress, and enhance productivity through intuitive dashboards and powerful analytics.

**Version 2.0** includes enhanced dashboard templates, role-based user management, in-memory MongoDB support for development, and improved security features.

## Features

### Core Features
- **User Authentication and Authorization** - JWT-based authentication with role-based access control
- **Project Management** - Create, update, and track multiple projects with team assignments
- **Task Management** - Kanban board, task assignments, priority levels, and status tracking
- **Team Management** - Organize users by teams (Frontend, Backend, Design, DevOps, QA, PM)
- **Analytics and Reporting** - Comprehensive project and team performance metrics
- **Customizable Dashboards** - Drag-and-drop widget system with 4 predefined templates
- **Time Tracking** - Track time spent on tasks and generate reports
- **Real-time Updates** - Socket.io-based notifications and live updates

### Dashboard Features (v2.0)
- **Dashboard Templates** - 4 pre-configured templates:
  - Developer Dashboard (tasks, burndown chart, project summary)
  - Project Manager Dashboard (project overview, task priority, burndown)
  - Team Lead Dashboard (team velocity, tasks, task priority)
  - Minimal Dashboard (project summary, tasks, notifications)
- **Widget System** - 10+ customizable widgets:
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
- **Layout Persistence** - Save and load custom dashboard configurations
- **Responsive Grid** - React Grid Layout for flexible widget positioning

### User Management (v2.0)
- **Role-Based Fields** - Team and level fields customized by user role
  - Admin: `team=admin`, `level=admin`
  - Project Manager: `team=PM`, `level=PM`
  - Developer/Designer: Custom teams and levels (Junior, Mid, Senior, Lead)
- **First Login Password Change** - Mandatory password change for new users
- **Profile Management** - Upload profile pictures, update personal information
- **Project Assignments** - Assign users to specific projects

### Security Features (v2.0)
- **Rate Limiting** - Endpoint-specific rate limits:
  - Login: 5 attempts per hour
  - Registration: 3 attempts per 24 hours
  - General API: 100 requests per 15 minutes
- **Security Headers** - Helmet.js with comprehensive security headers
- **CORS Configuration** - Environment-based origin whitelisting
- **Request Size Limits** - 1MB for JSON, 5MB for file uploads

## Tech Stack

### Backend
- **Node.js** and **Express.js** - Server framework (port 5000)
- **MongoDB** - Database with in-memory support for development
  - Production: MongoDB connection string via `MONGODB_URI`
  - Development: `mongodb-memory-server` for automatic in-memory database
- **JWT** - Authentication with 24-hour token expiration
- **Socket.io** - Real-time notifications and updates
- **Security** - Helmet, CORS, Rate Limiting, bcrypt password hashing
- **Mongoose** - MongoDB ODM
- **Multer** - File uploads with size limits

### Frontend
- **React** - UI library (port 3000)
- **React Router** - Client-side routing
- **Axios** - HTTP client with request/response interceptors for authentication
- **React Grid Layout** - Dashboard widget system
- **Chart.js and Recharts** - Data visualization and analytics
- **React Bootstrap** and **Material-UI** - UI components
- **Gantt-Task-React** - Gantt chart visualization
- **React Big Calendar** - Scheduling and calendar views
- **XLSX and jsPDF** - Report exports

### Development Tools
- **Jest** - Testing framework with mongodb-memory-server integration
- **Supertest** - API endpoint testing
- **ESLint** - Code quality and consistency
- **Nodemon** - Development server with auto-restart

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher) or yarn (v1 or higher)
- MongoDB (for production only - development uses in-memory database)

### Database Configuration

**Development Environment:**
- Smart Sprint automatically uses `mongodb-memory-server` for development
- No MongoDB installation required
- In-memory database created automatically on server start
- Perfect for testing and local development

**Production Environment:**
- Set `MONGODB_URI` environment variable to your MongoDB connection string
- Example: `MONGODB_URI=mongodb://localhost:27017/smart-sprint`
- Or use MongoDB Atlas cloud database

### Default Admin Credentials

After a fresh installation, you can log in with the following default admin credentials:

- **Username:** `admin`
- **Password:** `admin123`

**Important:** Change the admin password immediately after first login!

### Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/smart-sprint.git
cd smart-sprint

# Install all dependencies
npm run install-all

# Create .env file in backend directory (see Environment Variables section)

# Start both frontend and backend in development mode
npm run dev
```

The application will start with an in-memory database automatically. No MongoDB setup needed!

### Detailed Installation

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

5. Create a `.env` file in the backend directory:

**For Development (In-Memory Database):**
```env
# JWT Configuration (required)
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Database (optional - uses in-memory MongoDB if not set)
# MONGODB_URI=mongodb://localhost:27017/smart-sprint
```

**For Production:**
```env
# JWT Configuration (required)
JWT_SECRET=your_production_jwt_secret

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://your-domain.com

# Database (required for production)
MONGODB_URI=mongodb://localhost:27017/smart-sprint
# Or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/smart-sprint

# Optional Email Configuration
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
```

Replace the placeholders with your actual configuration values.

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `JWT_SECRET` | Yes | - | Secret key for JWT token signing |
| `PORT` | No | 5000 | Backend server port |
| `NODE_ENV` | No | development | Environment mode (development/production) |
| `FRONTEND_URL` | No | http://localhost:3000 | Frontend URL for CORS configuration |
| `MONGODB_URI` | Production | In-memory | MongoDB connection string (auto in-memory for dev) |
| `SMTP_HOST` | No | - | SMTP server for email notifications |
| `SMTP_PORT` | No | - | SMTP server port |
| `SMTP_USER` | No | - | SMTP username |
| `SMTP_PASS` | No | - | SMTP password |

### Running the Application

**Development Mode (Recommended):**
```bash
# From the root directory - starts both frontend and backend
npm run dev
```

This starts:
- Backend server on http://localhost:5000 with in-memory MongoDB
- Frontend server on http://localhost:3000
- Auto-restart on code changes

**Separate Servers:**

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

### Testing

**Run All Tests:**
```bash
cd backend
npm test
```

**Run Specific Test Suite:**
```bash
npm test -- auth.test.js
npm test -- security.test.js
```

Tests automatically use `mongodb-memory-server` for isolated, fast testing without needing a real MongoDB instance.

## Troubleshooting

### Database Connection Issues

**Problem:** "Failed to connect to MongoDB"
- **Solution (Development):** No action needed - in-memory database will be created automatically
- **Solution (Production):** Check `MONGODB_URI` in `.env` file and ensure MongoDB is running

**Problem:** "mongodb-memory-server download failed"
- **Solution:** Run `npm install mongodb-memory-server --save-dev` in backend directory
- Or set up a local MongoDB instance and use `MONGODB_URI`

### Installation Issues

**Problem:** Dependencies not installing correctly
- **Solution:** Delete `node_modules` folders and `package-lock.json`, then run `npm install` again
- Ensure Node.js version is 14 or higher: `node --version`

**Problem:** Port already in use
- **Solution:** Change `PORT` in backend `.env` file or kill the process using port 5000:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -i :5000
  kill -9 <PID>
  ```

### Authentication Issues

**Problem:** "Token expired" or "Unauthorized" errors
- **Solution:** JWT tokens expire after 24 hours - log in again
- Check that `JWT_SECRET` is set in backend `.env` file

**Problem:** Cannot log in with admin credentials
- **Solution:** Ensure database is initialized with admin user
- Run `node backend/initDB.js` to reinitialize the database

### Frontend Issues

**Problem:** API requests failing with CORS errors
- **Solution:** Check `FRONTEND_URL` in backend `.env` matches your frontend URL
- Verify backend server is running on the correct port

**Problem:** Widgets not loading on dashboard
- **Solution:** Check browser console for errors
- Verify user is authenticated and has proper role permissions

For more issues, please file a bug report on GitHub with:
- Your environment details (OS, Node.js version)
- Steps to reproduce the problem
- Error messages and logs

## Testing

### Backend Tests
```bash
cd backend
npm test
```

Backend tests use `mongodb-memory-server` for isolated testing. Test suites include:
- Authentication and authorization
- Security features and rate limiting
- Project and task management
- API endpoints

### Frontend Tests
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

For detailed deployment instructions, please refer to the [Deployment Guide](DEPLOYMENT.md).

## Contributing

We welcome contributions to enhance Smart Sprint! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information on how to get started.

Before submitting a pull request, ensure that your changes pass all tests and linting checks. Also, make sure to update the relevant documentation.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions, suggestions, or feedback, please open an issue on the GitHub repository or contact the maintainers directly.

We hope you find Smart Sprint helpful in managing your projects efficiently!