# Changelog

All notable changes to Smart Sprint will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Widget registry system improvements
- Enhanced error handling for custom dashboard widgets
- Comprehensive documentation suite
- CodeRabbit integration for automated code reviews

### Changed
- Improved widget component mapping consistency
- Enhanced widget renderer with fallback lookup logic

### Fixed
- Widget not found errors in custom dashboards
- Widget registry inconsistencies between different mapping systems

## [1.0.0] - 2025-01-15

### Added
- **Core Features**
  - User authentication and authorization system
  - Role-based access control (Admin, Manager, Developer, Tester)
  - Project management with CRUD operations
  - Task management with priority levels and status tracking
  - Sprint planning and management
  - Time tracking functionality
  - Team collaboration features

- **Dashboard System**
  - Customizable dashboard with drag-and-drop widgets
  - Multiple widget types:
    - Project Summary Widget
    - My Tasks Widget
    - Burndown Chart Widget
    - Team Velocity Widget
    - Task Priority Distribution Widget
    - Notifications Widget
    - Time Tracking Widget
    - Task Progress Widget
  - Role-based widget visibility
  - Responsive dashboard layouts

- **User Interface**
  - Modern React-based frontend
  - Responsive design for mobile and desktop
  - Dark mode support
  - Intuitive navigation and user experience
  - Real-time updates and notifications

- **Backend API**
  - RESTful API with Express.js
  - MongoDB database integration
  - JWT-based authentication
  - Input validation and sanitization
  - Error handling and logging
  - File upload capabilities

- **Security Features**
  - Password hashing with bcrypt
  - JWT token management
  - CORS configuration
  - Rate limiting
  - Input validation
  - Security headers

- **Development Tools**
  - ESLint and Prettier configuration
  - Jest testing framework
  - Development and production build scripts
  - Environment configuration
  - Git hooks for code quality

### Technical Specifications

#### Frontend
- **Framework**: React 18.x
- **State Management**: React Context API
- **Routing**: React Router v6
- **Styling**: CSS Modules with SCSS
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: React Icons
- **HTTP Client**: Axios
- **Build Tool**: Create React App

#### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **File Upload**: Multer
- **Security**: Helmet, CORS, bcrypt
- **Logging**: Winston
- **Testing**: Jest with Supertest

#### Database Schema
- **Users**: Authentication, roles, profiles
- **Projects**: Project information, team assignments
- **Tasks**: Task details, assignments, status tracking
- **Sprints**: Sprint planning and tracking
- **Time Entries**: Time tracking records
- **Notifications**: User notifications and alerts

### API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

#### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)

#### Projects
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Tasks
- `GET /api/tasks` - Get tasks with filters
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Sprints
- `GET /api/sprints` - Get sprints
- `POST /api/sprints` - Create new sprint
- `GET /api/sprints/:id` - Get sprint details
- `PUT /api/sprints/:id` - Update sprint
- `DELETE /api/sprints/:id` - Delete sprint

#### Time Tracking
- `GET /api/time-entries` - Get time entries
- `POST /api/time-entries` - Create time entry
- `PUT /api/time-entries/:id` - Update time entry
- `DELETE /api/time-entries/:id` - Delete time entry

#### Dashboard
- `GET /api/dashboard/widgets` - Get available widgets
- `GET /api/dashboard/data/:widgetType` - Get widget data
- `POST /api/dashboard/layout` - Save dashboard layout

### Configuration

#### Environment Variables
```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/smart-sprint

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000
```

#### Package Dependencies

**Backend Dependencies**
- express: ^4.18.2
- mongoose: ^7.5.0
- jsonwebtoken: ^9.0.2
- bcryptjs: ^2.4.3
- cors: ^2.8.5
- helmet: ^7.0.0
- express-validator: ^7.0.1
- multer: ^1.4.5
- winston: ^3.10.0

**Frontend Dependencies**
- react: ^18.2.0
- react-dom: ^18.2.0
- react-router-dom: ^6.15.0
- axios: ^1.5.0
- chart.js: ^4.4.0
- react-chartjs-2: ^5.2.0
- react-icons: ^4.11.0

### Installation and Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/mrudul-UmassD/smart_sprint_adduser.git
   cd smart-sprint
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Start MongoDB**
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

### Testing

- **Backend Tests**: Jest with Supertest for API testing
- **Frontend Tests**: React Testing Library with Jest
- **Test Coverage**: Minimum 80% coverage requirement
- **E2E Tests**: Planned for future releases

### Deployment

- **Development**: Local development with hot reload
- **Production**: Docker containerization support
- **Cloud**: AWS, Heroku, DigitalOcean compatibility
- **Database**: MongoDB Atlas cloud database support

### Known Issues

- Widget registry system had inconsistencies (Fixed in v1.0.0)
- Dashboard layout persistence needs improvement
- Mobile responsiveness requires optimization for some widgets

### Breaking Changes

None - Initial release

### Migration Guide

Not applicable - Initial release

### Contributors

- **Lead Developer**: Mrudul Patel
- **Project Advisor**: [Advisor Name]
- **Contributors**: See CONTRIBUTORS.md

### Acknowledgments

- React community for excellent documentation
- MongoDB team for robust database solution
- Express.js maintainers for reliable backend framework
- Chart.js team for powerful charting capabilities
- Open source community for various libraries and tools

---

## Version History

### Versioning Strategy

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for backwards-compatible functionality additions
- **PATCH** version for backwards-compatible bug fixes

### Release Schedule

- **Major releases**: Quarterly
- **Minor releases**: Monthly
- **Patch releases**: As needed for critical fixes

### Support Policy

- **Current version (1.x)**: Full support with security updates
- **Previous major versions**: Security updates for 6 months
- **Legacy versions**: No support

---

For more information about releases, see our [GitHub Releases](https://github.com/mrudul-UmassD/smart_sprint_adduser/releases) page.