# Smart Sprint

Smart Sprint is a comprehensive team management application built with the MERN stack (MongoDB, Express, React, Node.js). It features role-based access control, project management capabilities, and a Kanban board for task visualization.

## Features

- **Secure Authentication System**
  - Password-based authentication
  - First-time login password setup
  - Role-based access control (Admin, Project Manager, Developer)
  - User profile management with profile pictures

- **User Management**
  - Create, edit, and delete users
  - Assign roles, teams, and levels
  - Manage user permissions

- **Project Management**
  - Create and manage projects
  - Assign team members to projects
  - Track project progress

- **Task Management**
  - Kanban board for visual task management
  - Create, assign, and track tasks
  - Set priorities and due dates
  - Move tasks between stages

- **Responsive Design**
  - Works on desktop and mobile devices
  - Bootstrap and Material UI components

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/smart-sprint.git
   cd smart-sprint
   ```

2. Install all dependencies (root, backend, and frontend):
   ```
   npm run install-all
   ```

3. Set up environment variables:
   - Create a `.env` file in the backend directory with the following:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     PORT=5000
     ```

4. Initialize the database:
   ```
   cd backend
   node resetDatabase.js
   ```
   This will create an admin user with username "admin" and password "admin".

## Running the Application

Start both the backend and frontend servers with a single command:

```
npm start
```

- Backend server runs on: http://localhost:5000
- Frontend server runs on: http://localhost:3000

## Default Login

- Username: `admin`
- Password: `admin`

## User Roles

1. **Admin**
   - Full access to all features
   - Can manage users, projects, and tasks
   - Can assign roles to users

2. **Project Manager**
   - Can create and manage projects
   - Can manage tasks and team members
   - Limited user management capabilities

3. **Developer**
   - Can view assigned projects
   - Can create and manage tasks within assigned projects
   - Cannot manage users or create projects

## Development

To run the servers separately:

- Backend:
  ```
  npm run server
  ```

- Frontend:
  ```
  npm run client
  ```

## File Structure

```
smart-sprint/
  ├── backend/             # Backend server code
  │   ├── models/          # MongoDB models
  │   ├── routes/          # API routes
  │   ├── middleware/      # Custom middleware
  │   ├── uploads/         # User uploads (profile pictures)
  │   ├── server.js        # Server entry point
  │   └── resetDatabase.js # Database initialization script
  │
  ├── frontend/            # React frontend code
  │   ├── public/          # Static files
  │   └── src/             # Source files
  │       ├── components/  # React components
  │       ├── App.js       # Main component
  │       └── index.js     # Entry point
  │
  ├── package.json         # Root package.json for running both servers
  └── README.md            # Project documentation
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Your Name - [Your GitHub](https://github.com/yourusername) 