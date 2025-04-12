const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up storage for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/profile';
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'profile-' + uniqueSuffix + ext);
    }
});

// Set up file filter for image uploads
const fileFilter = (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Initialize multer upload
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Get all users (Admin and Project Manager only)
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new user (Admin and Project Manager only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Validate team for Developers
        if (req.body.role === 'Developer' && (!req.body.team || req.body.team === 'None')) {
            return res.status(400).json({ error: 'Team is required for Developer role' });
        }
        
        // Set proper values for Admin and Project Manager
        if (req.body.role === 'Admin') {
            req.body.team = 'admin';
            req.body.level = 'admin';
        } else if (req.body.role === 'Project Manager') {
            req.body.team = 'pm';
            req.body.level = 'pm';
        }

        // Set initial password same as username
        req.body.password = req.body.username;
        
        const user = new User(req.body);
        await user.save();
        
        // Don't return the password in the response
        const userObject = user.toObject();
        delete userObject.password;
        
        res.status(201).json(userObject);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update user (Admin and Project Manager only)
router.patch('/:id', auth, async (req, res) => {
    try {
        // Prevent password update through this endpoint
        if (req.body.password) {
            delete req.body.password;
        }
        
        // Check permissions
        if (req.user._id !== req.params.id && 
            req.user.role !== 'Admin' && 
            req.user.role !== 'Project Manager') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Extra validation for admins and project managers
        if (req.user.role === 'Admin' || req.user.role === 'Project Manager') {
            // Validate team for Developers
            if (req.body.role === 'Developer' && (!req.body.team || req.body.team === 'None')) {
                return res.status(400).json({ error: 'Team is required for Developer role' });
            }
            
            // Set proper values for Admin and Project Manager
            if (req.body.role === 'Admin') {
                req.body.team = 'admin';
                req.body.level = 'admin';
            } else if (req.body.role === 'Project Manager') {
                req.body.team = 'pm';
                req.body.level = 'pm';
            }
        } else {
            // Regular users can only update their profile info, not role or permissions
            const allowedUpdates = ['fullName', 'email'];
            const requestedUpdates = Object.keys(req.body);
            
            const isValidOperation = requestedUpdates.every(update => 
                allowedUpdates.includes(update)
            );
            
            if (!isValidOperation) {
                return res.status(400).json({ error: 'Invalid updates. Regular users can only update profile information.' });
            }
        }
        
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete user (Admin and Project Manager only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get current user details
router.get('/me', auth, async (req, res) => {
    try {
        console.log('Users /me route called');
        console.log('User ID from token:', req.user._id || req.user.id);
        
        const user = await User.findById(req.user._id || req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }
        
        console.log('User found:', user.username);
        res.json(user);
    } catch (error) {
        console.error('Error in /me route:', error.message);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Upload profile picture
router.post('/profile-picture', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Delete old profile picture if it exists
        if (user.profilePicture) {
            const oldPath = path.join(__dirname, '..', user.profilePicture);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }
        
        // Update user with new profile picture path
        user.profilePicture = '/uploads/profile/' + req.file.filename;
        await user.save();
        
        res.json({ 
            message: 'Profile picture uploaded successfully',
            profilePicture: user.profilePicture 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}, (error, req, res, next) => {
    // Error handler for multer
    res.status(400).json({ error: error.message });
});

module.exports = router; 