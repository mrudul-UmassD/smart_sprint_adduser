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
- Real-time Updates
- File Attachments
- Role-based Access Control

## Tech Stack

### Frontend
- React.js
- React Bootstrap
- Chart.js
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer (File Uploads)

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

### Analytics
- GET /api/analytics/project/:projectId - Get project analytics
- GET /api/analytics/team/:team - Get team performance
- GET /api/analytics/timeline/:projectId - Get project timeline
- GET /api/analytics/burndown/:projectId - Get burndown chart data

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
- MongoDB for database
- Express.js for backend framework 