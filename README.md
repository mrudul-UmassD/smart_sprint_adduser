# Smart Sprint - Team Management Application

Smart Sprint is a MERN (MongoDB, Express.js, React, Node.js) stack application for team management with role-based access control.

## Features

- **Simple Authentication**: Login with username only (no password required)
- **Role-Based Access Control**:
  - **Admin**: Full access to manage all users and their roles
  - **Project Manager**: Can add, edit, delete, and view all users
  - **Developer**: Can view their own details
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
- **Responsive Design** with Material UI

## Screenshot

![Smart Sprint Login](/screenshots/login.png)

## Tech Stack

- **Frontend**: React, Material UI, React Router
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
   git clone https://github.com/yourusername/smart-sprint.git
   cd smart-sprint
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the `backend` directory with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   PORT=5001
   ```

4. Initialize the database:
   ```
   npm run init-db
   ```

5. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   npm run dev
   ```

2. Start the frontend application:
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

4. Log in with the default admin account:
   ```
   Username: admin
   ```

## API Endpoints

- `POST /api/auth/login` - User login
- `GET /api/users` - Get all users (Admin/PM only)
- `POST /api/users` - Create a new user (Admin/PM only)
- `PATCH /api/users/:id` - Update a user (Admin/PM only)
- `DELETE /api/users/:id` - Delete a user (Admin/PM only)
- `GET /api/users/me` - Get current user details

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
- Material UI for the frontend components
- The MERN stack community for valuable resources 