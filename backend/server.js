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
const userRoutes = require('./routes/users');
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');

// Use routes with rate limiting
app.use('/api/auth/login', loginLimiter, authRoutes);
app.use('/api/auth/register', registerLimiter, authRoutes);
app.use('/api/auth/reset-password', passwordResetLimiter, authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/projects', apiLimiter, projectRoutes);
app.use('/api/tasks', apiLimiter, taskRoutes);

// Only add analytics routes if the file exists
try {
  const analyticsRoutes = require('./routes/analytics');
  app.use('/api/analytics', apiLimiter, analyticsRoutes);
} catch (error) {
  console.log('Analytics routes not available');
}

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
    }
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use(errorHandler);

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Create server variable to allow graceful shutdown
let server;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  // Start server
  const PORT = process.env.PORT || 5000;
  server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB connection error:', error);
}); 

// Graceful shutdown function
const gracefulShutdown = () => {
  console.log('Shutting down gracefully...');
  if (server) {
    server.close(() => {
      console.log('Server closed');
      // Close mongoose connection without callback
      mongoose.connection.close()
        .then(() => {
          console.log('MongoDB connection closed');
          process.exit(0);
        })
        .catch(err => {
          console.error('Error closing MongoDB connection:', err);
          process.exit(1);
        });
    });
  } else {
    process.exit(0);
  }
  
  // Force close if graceful shutdown takes too long
  setTimeout(() => {
    console.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown); 