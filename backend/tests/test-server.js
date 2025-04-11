const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const { 
  apiLimiter, 
  loginLimiter, 
  registerLimiter, 
  corsOptions, 
  securityHeaders,
  requestSizeLimit 
} = require('../middleware/security');

const app = express();

// Request size limit middleware before body parser
app.use(requestSizeLimit);

// Basic middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Custom CORS middleware for testing
const corsMiddleware = cors({
  ...corsOptions,
  origin: (origin, callback) => {
    if (!origin || origin === process.env.FRONTEND_URL || origin === 'http://localhost:3000') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
});

app.use(corsMiddleware);

// Security middleware
app.use(securityHeaders);

// Auth middleware for protected routes
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token format'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Password validation middleware
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

// Test routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Auth routes
app.post('/api/auth/register', registerLimiter, async (req, res) => {
  try {
    const { username, password, role, team, level } = req.body;

    // Validate password
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password validation failed'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Username already exists'
      });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      role,
      team,
      level
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Log login attempt
    console.log('Login attempt for user:', username);

    // Find user
    const user = await User.findOne({ username });
    console.log('Found user:', user ? 'yes' : 'no');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// Project routes
app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    let projects;
    
    if (req.user.role === 'Admin') {
      // Admin can see all projects
      projects = await Project.find().populate('members.userId', 'username team level role');
    } else if (req.user.role === 'Project Manager') {
      // Project Manager can see projects they are assigned to or created
      projects = await Project.find({
        $or: [
          { 'members.userId': req.user.id },
          { 'createdBy': req.user.id }
        ]
      }).populate('members.userId', 'username team level role');
    } else {
      // Developers can only see projects they are assigned to
      projects = await Project.find({
        'members.userId': req.user.id
      }).populate('members.userId', 'username team level role');
    }
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    // Validate user has a valid team
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.team === 'None' && user.role !== 'Admin') {
      return res.status(400).json({ error: 'You must be assigned to a team before creating projects' });
    }
    
    if (req.user.role === 'Admin') {
      // Admin can directly create projects
      const project = new Project({
        ...req.body,
        createdBy: req.user.id
      });
      
      // Add the admin as a project member automatically
      project.members.push({
        userId: req.user.id,
        role: 'Project Manager'
      });
      
      await project.save();
      
      // Fetch the populated project to return
      const populatedProject = await Project.findById(project._id)
        .populate('members.userId', 'username team level role')
        .populate('createdBy', 'username');
        
      res.status(201).json(populatedProject);
    } else if (req.user.role === 'Project Manager') {
      // Project Managers must request project creation
      res.status(201).json({ 
        message: 'Project creation request submitted successfully',
        request: {
          name: req.body.name,
          description: req.body.description || '',
          requestedBy: req.user.id,
          status: 'Pending'
        }
      });
    } else {
      return res.status(403).json({ error: 'Only Admin and Project Manager can create or request projects' });
    }
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.patch('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Only Admin can update projects' });
    }
    
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    updates.forEach(update => project[update] = req.body[update]);
    project.updatedAt = Date.now();
    
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Only Admin can delete projects' });
    }
    
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/projects/:id/members', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Only Admin can add members directly' });
    }
    
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({ error: 'User ID and role are required' });
    }
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add member to project
    project.members.push({ userId, role });
    await project.save();
    
    // Return populated project
    const populatedProject = await Project.findById(project._id)
      .populate('members.userId', 'username team level role');
      
    res.json(populatedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', apiLimiter, (req, res) => {
  res.status(201).json({ success: true, message: 'Task created' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).end();
  }
  
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export the app for testing
module.exports = app; 