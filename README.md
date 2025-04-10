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
  - Drag and drop user tiles to organize teams
  - Admin can drag users to delete them

- **Project Management**
  - Create and manage projects
  - Assign team members to projects
  - Track project progress
  - Approve or reject project membership requests

- **Task Management**
  - Kanban board for visual task management
  - Create, assign, and track tasks
  - Set priorities and due dates
  - Drag and drop tasks between status columns
  - Automatic team assignment based on assignee

- **Responsive Design**
  - Works on desktop and mobile devices
  - Bootstrap and Material UI components
  - Professional UI with team-colored badges

## Installation and Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Git

### Cloning from GitHub

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart-sprint.git
   cd smart-sprint
   ```

2. Install all dependencies (root, backend, and frontend):
   ```bash
   npm run install-all
   ```
   
   If the above command doesn't exist in your package.json yet, you can run:
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

3. Set up environment variables:
   - Create a `.env` file in the backend directory with the following:
     ```
     MONGODB_URI=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     PORT=5001
     ```

4. Initialize the database:
   ```bash
   cd backend
   node resetDatabase.js
   ```
   This will create an admin user with username "admin" and password "admin".

### MongoDB Setup

#### Option 1: Local MongoDB
1. Install MongoDB on your system
2. Start the MongoDB service
3. Use `mongodb://localhost:27017/smart-sprint` as your MONGODB_URI

#### Option 2: MongoDB Atlas
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Click on "Connect" and follow the instructions to get your connection string
4. Replace `<password>` with your actual password in the connection string
5. Use this string as your MONGODB_URI in the .env file

## Running the Application

Start both the backend and frontend servers with a single command:

```bash
npm start
```

- Backend server runs on: http://localhost:5001
- Frontend server runs on: http://localhost:3000

You can also run the servers separately:

- Backend:
  ```bash
  npm run server
  ```

- Frontend:
  ```bash
  npm run client
  ```

## Default Login

- Username: `admin`
- Password: `admin`

After logging in for the first time, you'll be prompted to change your password.

## User Roles

1. **Admin**
   - Full access to all features
   - Can manage users, projects, and tasks
   - Can assign roles to users
   - Can approve or reject project membership requests
   - Can drag and drop users between teams

2. **Project Manager**
   - Can create and manage projects
   - Can manage tasks and team members
   - Limited user management capabilities
   - Can approve team members' tasks for completion

3. **Developer**
   - Can view assigned projects
   - Can create and manage tasks within assigned projects
   - Can move tasks between stages (except directly to Completed)
   - Tasks moved to Completed by developers are automatically put in Review

## Key Features Implementation

### User Management

- Users are organized by teams and roles
- Admin can drag and drop users between teams
- Team and Level fields are hidden for Admin and Project Manager roles
- Users can be managed in List View or Team View

### Task Management

- Kanban board visually displays tasks by status
- Team is automatically assigned based on the assignee
- Drag and drop functionality for moving tasks between statuses
- Developers cannot directly move tasks to Completed status

### Project Requests

- Users can request to join projects
- Admins can drag and drop requests to approve or reject them

## Development

### Branching Strategy

When contributing to this project, please use the following branching strategy:

1. Create a feature branch from main:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "Add your meaningful commit message"
   ```

3. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request to merge into main

### File Structure

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

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check if your MongoDB service is running
   - Verify your connection string in .env file
   - Make sure your network allows MongoDB connections

2. **Port Already in Use**
   - Check if another application is using port 5001 or 3000
   - You can modify the ports in `.env` for backend and in `frontend/package.json` for frontend

3. **Dependencies Issues**
   - Try running `npm ci` instead of `npm install` for exact versions
   - Clear npm cache: `npm cache clean --force`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Authors

Your Name - [Your GitHub](https://github.com/yourusername)

## GitHub Integration

This project has been configured with GitHub templates and workflows for better collaboration and continuous integration. The repository includes:

- Issue templates for bug reports and feature requests
- Pull request templates
- GitHub Actions for CI/CD
- Dependabot for automatic dependency updates
- Contributing guidelines
- Security policy

For more information, see the CONTRIBUTING.md file. 