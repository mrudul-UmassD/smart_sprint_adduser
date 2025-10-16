# Smart Sprint - Project Management Application

Smart Sprint is a comprehensive project management application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). It provides features for task management, team collaboration, and project analytics.

## Features

- User Authentication and Authorization
- Project Management
- Task Management with Kanban Board
- Team Management
- Analytics and Reporting
- Customizable Dashboards
- Gantt Charts for Project Timelines
- Time Tracking and Reporting
- Third-Party Integrations (GitHub, Slack, etc.)
- Document Management with Version Control
- Real-time Updates and Notifications

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

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (v6 or higher) or yarn (v1 or higher)

### Default Admin Credentials

After a fresh installation, you can log in with the following default admin credentials:

- **Username:** `admin`
- **Password:** `admin123`

### Quick Start

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
Replace the placeholders with your actual configuration values.

### Running the Application

To start both the backend server and frontend development server concurrently:
```bash
# From the root directory
npm run dev
```

Alternatively, you can start the servers separately:

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

## Troubleshooting

If you encounter issues while setting up or running the application, try the following:

- Ensure all dependencies are installed correctly in the root, backend, and frontend directories
- Double-check that your .env file in the backend directory is properly configured with valid values
- Make sure your MongoDB server is running and accessible at the provided MONGODB_URI
- Check that the backend server is running on port 5000 and the frontend server on port 3000
- Clear your browser cache and cookies if you experience any strange behavior, especially related to authentication

If the issue persists, please file an issue on the GitHub repository with details about your environment and the steps to reproduce the problem.

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

For detailed deployment instructions, please refer to the [Deployment Guide](DEPLOYMENT.md).

## Contributing

We welcome contributions to enhance Smart Sprint! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information on how to get started.

Before submitting a pull request, ensure that your changes pass all tests and linting checks. Also, make sure to update the relevant documentation.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

If you have any questions, suggestions, or feedback, please open an issue on the GitHub repository or contact the maintainers directly.

We hope you find Smart Sprint helpful in managing your projects efficiently!