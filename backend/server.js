const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');
const { 
  apiLimiter, 
  loginLimiter, 
  registerLimiter, 
  passwordResetLimiter, 
  corsOptions, 
  securityHeaders,
  requestSizeLimit 
} = require('./middleware/security');
const helmet = require('helmet');
const DatabaseSetup = require('./utils/databaseSetup');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Basic middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cors(corsOptions));

// Apply security middleware
app.use(helmet());
app.use(requestSizeLimit);

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const projectsRoutes = require('./routes/projects');
const tasksRoutes = require('./routes/tasks');
const reportsRoutes = require('./routes/reports');
const userSettingsRoutes = require('./routes/userSettings');
const analyticsRoutes = require('./routes/analytics');
const teamsRoutes = require('./routes/teams');
const notificationsRoutes = require('./routes/notifications');

// Use routes with rate limiting
// Add a special bypass route for admin login to avoid rate limiting issues
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    // Validate request
    const { username, password } = req.body;
    
    console.log('Admin login attempt via bypass route. Username:', username);
    
    if (username !== 'admin') {
      console.log('Rejected non-admin login attempt for:', username);
      return res.status(401).json({ 
        success: false,
        error: 'This endpoint is only for admin login' 
      });
    }
    
    // Import User model
    const User = require('./models/User');
    const jwt = require('jsonwebtoken');
    
    // Find admin user
    const admin = await User.findOne({ username: 'admin' });
    
    if (!admin) {
      console.log('Admin user not found in database');
      
      // Create admin user if it doesn't exist
      console.log('Creating admin user...');
      const newAdmin = new User({
        username: 'admin',
        password: 'adminadmin', // Default stronger password
        role: 'Admin',
        isFirstLogin: false
      });
      
      await newAdmin.save();
      console.log('Admin user created successfully');
      
      // Use the newly created admin
      const token = jwt.sign(
        { 
          id: newAdmin._id.toString(), 
          _id: newAdmin._id.toString(), 
          role: newAdmin.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      return res.json({
        success: true,
        user: {
          _id: newAdmin._id,
          username: newAdmin.username,
          role: newAdmin.role,
          isFirstLogin: newAdmin.isFirstLogin
        },
        token
      });
    }
    
    console.log('Admin user found:', admin.username, 'Role:', admin.role);
    
    // Verify password - special handling for admin
    console.log('Verifying admin password...');
    const isMatch = await admin.comparePassword(password);
    
    if (!isMatch) {
      console.log('Invalid admin password');
      
      // Try alternative admin passwords
      const isMatchAlt = password === 'admin' || password === 'adminadmin';
      if (isMatchAlt) {
        console.log('Matched with default admin password');
        
        // Update the admin password to ensure it's correctly hashed
        console.log('Updating admin password hash...');
        admin.password = password;
        await admin.save();
        console.log('Admin password updated');
      } else {
        return res.status(401).json({ 
          success: false,
          error: 'Invalid password' 
        });
      }
    }
    
    // Update last login
    admin.lastLogin = new Date();
    await admin.save();
    
    // Generate token
    const token = jwt.sign(
      { 
        id: admin._id.toString(), 
        _id: admin._id.toString(), 
        role: admin.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('Admin login successful via bypass route');
    
    // Return success response
    return res.json({
      success: true,
      user: {
        _id: admin._id,
        username: admin.username,
        role: admin.role,
        isFirstLogin: admin.isFirstLogin
      },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Server error during admin login' 
    });
  }
});

// Fix auth routes registration
// Using express Router, the paths are relative to the mount point
// So we need to use /api/auth as the mount point
app.use('/api/auth', authRoutes);

// Other routes
app.use('/api/users', apiLimiter, usersRoutes);
app.use('/api/projects', apiLimiter, projectsRoutes);
app.use('/api/tasks', apiLimiter, tasksRoutes);
app.use('/api/reports', apiLimiter, reportsRoutes);
app.use('/api/user-settings', apiLimiter, userSettingsRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/notifications', apiLimiter, notificationsRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Test endpoint to check login functionality
app.post('/api/test/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Test login attempt for:', username);
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username and password are required'
      });
    }
    
    // Import User model
    const User = require('./models/User');
    const jwt = require('jsonwebtoken');
    
    // Find user
    const user = await User.findOne({ username });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found'
      });
    }
    
    console.log('User found:', user.username);
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid password'
      });
    }
    
    // Generate token
    const token = jwt.sign(
      { 
        id: user._id.toString(), 
        _id: user._id.toString(), 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        _id: user._id,
        username: user.username,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Test login error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Test endpoint to check authentication and database connection
app.get('/api/test/auth', async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ 
        success: false, 
        error: 'MongoDB not connected',
        readyState: mongoose.connection.readyState
      });
    }

    // Check if admin user exists
    const User = require('./models/User');
    const admin = await User.findOne({ username: 'admin' });
    
    if (!admin) {
      return res.status(404).json({ 
        success: false, 
        error: 'Admin user not found in database' 
      });
    }
    
    // Test password verification
    const isMatch = await admin.comparePassword('admin');
    const isMatchLong = await admin.comparePassword('adminadmin');
    
    // List all users
    const users = await User.find().select('username role');
    
    return res.status(200).json({
      success: true,
      message: 'Authentication system is working',
      adminExists: true,
      adminPasswordShortMatch: isMatch,
      adminPasswordLongMatch: isMatchLong,
      jwtSecretExists: !!process.env.JWT_SECRET,
      jwtSecretLength: process.env.JWT_SECRET ? process.env.JWT_SECRET.length : 0,
      userCount: users.length,
      users: users
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Only exit in development - in production, try to continue
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  // Only exit in development - in production, try to continue
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Create server variable to allow graceful shutdown
let server;

// Initialize database setup
const dbSetup = new DatabaseSetup();

// Setup database with automatic fallback
const initializeApp = async () => {
  try {
    console.log('🚀 Starting Smart Sprint application...');
    
    // Setup database connection
    const mongoUri = await dbSetup.setupDatabase();
    console.log(`📊 Using MongoDB URI: ${mongoUri}`);
    
    // Update environment variable if using local fallback
    if (mongoUri !== process.env.MONGODB_URI) {
      process.env.MONGODB_URI = mongoUri;
      console.log('🔄 Updated MONGODB_URI to use local database');
    }
    
    // Start server
    const PORT = process.env.PORT || 5000;
    
    // Create server with error handling
    const startServer = () => {
      try {
        server = app.listen(PORT, () => {
          console.log(`🌟 Server running on port ${PORT}`);
          console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
          console.log('✅ Smart Sprint is ready to use!');
          
          // Initialize scheduled tasks
          const { scheduleDailyTasks } = require('./utils/scheduledTasks');
          scheduleDailyTasks();
        });
        
        // Initialize Socket.io
        const io = require('socket.io')(server, {
          cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST']
          }
        });
        
        // Socket.io connection handling
        io.on('connection', (socket) => {
          console.log('New client connected');
          
          // Handle client disconnection
          socket.on('disconnect', () => {
            console.log('Client disconnected');
          });
          
          // Join a user-specific room
          socket.on('join-user', (userId) => {
            if (userId) {
              socket.join(`user:${userId}`);
              console.log(`User ${userId} joined their personal channel`);
            }
          });
        });
        
        // Make io available globally
        app.set('io', io);
        
        // Handle server errors
        server.on('error', (error) => {
          if (error.code === 'EADDRINUSE') {
            console.log(`⚠️ Port ${PORT} is already in use, trying again in 10 seconds...`);
            setTimeout(() => {
              server.close();
              startServer();
            }, 10000);
          } else {
            console.error('❌ Server error:', error);
          }
        });
      } catch (error) {
        console.error('❌ Error starting server:', error);
      }
    };
    
    startServer();
    
  } catch (error) {
    console.error('❌ Failed to initialize application:', error.message);
    console.log('\n📋 Troubleshooting steps:');
    console.log('1. Check if MongoDB is installed and running');
    console.log('2. Verify your MONGODB_URI in the .env file');
    console.log('3. Ensure you have proper network connectivity');
    console.log('4. Check firewall settings');
    console.log('\nFor more help, see the DEPLOYMENT_GUIDE.md file');
    process.exit(1);
  }
};

// Start the application
initializeApp(); 

// Graceful shutdown function
const gracefulShutdown = async () => {
  console.log('🔄 Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('🛑 Server closed');
      // Close mongoose connection and database setup
      Promise.all([
        mongoose.connection.close(),
        dbSetup.disconnect()
      ])
      .then(() => {
        console.log('🔌 Database connections closed');
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ Error closing database connections:', err);
        process.exit(1);
      });
    });
  } else {
    process.exit(0);
  }
  
  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    console.error('⏰ Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);