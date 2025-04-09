# Smart Sprint - Team Management Application

Smart Sprint is a MERN (MongoDB, Express.js, React, Node.js) stack application for team management with role-based access control.

## Features

- **Simple Authentication**: Login with username only (no password required)
- **Role-Based Access Control**:
  - **Admin**: Full access to manage all users, projects, and approve requests
  - **Project Manager**: Can add/edit users, request new projects, and request user additions to projects
  - **Developer**: Can view their assigned projects and team members
- **Team Categories**:
  - Design
  - Database
  - Backend
  - Frontend
  - DevOps
  - Tester/Security
- **Developer Levels**:
  - Lead
  - Senior
  - Dev
  - Junior
- **Project Management**:
  - Create and manage projects (Admin)
  - Request project creation (Project Manager)
  - Team-based organization of project members
  - Request workflow for adding users to projects
- **Responsive Design** with Material UI and Bootstrap

## Screenshots

![Smart Sprint Login](/screenshots/login.png)

## Tech Stack

- **Frontend**: React, Material UI, React Bootstrap, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
smart-sprint/
├── backend/              # Express.js server
│   ├── models/           # MongoDB schema models
│   ├── routes/           # API routes
│   ├── middleware/       # Authentication middleware
│   ├── .env              # Environment variables
│   └── server.js         # Main server file
├── frontend/             # React application
│   ├── public/           # Static files
│   └── src/
│       ├── components/   # React components
│       └── App.js        # Main React component
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm
- MongoDB database (local or Atlas)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/mrudul-UmassD/smart_sprint_adduser.git
   cd smart-sprint
   ```

2. Install all dependencies with a single command:
   ```
   npm run install-all
   ```
   
   This will install dependencies for:
   - Root project (for running both servers)
   - Backend server
   - Frontend application

3. Set up environment variables:
   Create a `.env` file in the `backend` directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5001
   ```

4. Initialize the database:
   ```
   cd backend
   npm run init-db
   cd ..
   ```

### Running the Application

#### Single Command Method

Run both the backend and frontend servers with a single command:
```
npm start
```

This will concurrently start:
- Backend server on http://localhost:5001
- Frontend application on http://localhost:3000

#### Separate Servers Method

If you prefer to run the servers separately:

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. In a separate terminal, start the frontend application:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

4. Log in with the default admin account:
   ```
   Username: admin
   ```

### Resetting the Database

If you need to reset the database to its initial state with only the admin user:

1. Send a POST request to `/api/auth/reset-db` endpoint using a tool like Postman
2. Alternatively, you can add a reset button to the admin interface

## User Roles and Workflows

### Admin

- Create, edit, and delete users
- Create, edit, and delete projects
- Approve or reject Project Manager requests for:
  - New project creation
  - Adding users to projects
- Add users directly to projects

### Project Manager

- View and edit user information
- Request new project creation (requires Admin approval)
- Request to add users to projects (requires Admin approval)
- View all assigned projects

### Developer

- View personal information
- View assigned projects
- View team members in assigned projects

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/reset-db` - Reset database to initial state (admin only)

### Users
- `GET /api/users` - Get all users (Admin/PM only)
- `POST /api/users` - Create a new user (Admin/PM only)
- `PATCH /api/users/:id` - Update a user (Admin/PM only)
- `DELETE /api/users/:id` - Delete a user (Admin/PM only)
- `GET /api/users/me` - Get current user details

### Projects
- `GET /api/projects` - Get all accessible projects
- `GET /api/projects/:id` - Get specific project details
- `POST /api/projects` - Create a new project (Admin) or request project creation (PM)
- `PATCH /api/projects/:id` - Update a project (Admin only)
- `DELETE /api/projects/:id` - Delete a project (Admin only)
- `POST /api/projects/:id/members` - Add user to project (Admin only)
- `DELETE /api/projects/:id/members/:userId` - Remove user from project (Admin only)
- `POST /api/projects/:id/requests` - Request to add a user to a project (PM only)
- `PATCH /api/projects/:id/requests/:requestId` - Approve/reject user request (Admin only)
- `GET /api/projects/admin/project-requests` - Get all project creation requests (Admin only)
- `GET /api/projects/my-project-requests` - Get PM's project creation requests (PM only)
- `PATCH /api/projects/admin/project-requests/:requestId` - Approve/reject project creation (Admin only)

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- MongoDB Atlas for database hosting
- Material UI and Bootstrap for the frontend components
- The MERN stack community for valuable resources 