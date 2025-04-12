const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Username and password are required' 
            });
        }

        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid username or password' 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                error: 'Invalid username or password' 
            });
        }

        // Update user's last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token with both id and _id for compatibility
        const token = jwt.sign(
            { 
                id: user._id.toString(), 
                _id: user._id.toString(), 
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ 
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
                team: user.team,
                level: user.level,
                isFirstLogin: user.isFirstLogin,
                profilePicture: user.profilePicture,
                fullName: user.fullName,
                email: user.email,
                createdAt: user.createdAt
            }, 
            token 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Get current user details
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        
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
        console.error('Error fetching user details:', error);
        res.status(500).json({
            success: false,
            error: 'Server error'
        });
    }
});

// Change password route (requires authentication)
router.post('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        user.isFirstLogin = false;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// First-time password setup route (requires authentication)
router.post('/first-password', auth, async (req, res) => {
    try {
        const { newPassword } = req.body;
        
        if (!newPassword) {
            return res.status(400).json({ error: 'New password is required' });
        }

        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if it's actually first login
        if (!user.isFirstLogin) {
            return res.status(400).json({ error: 'This is not your first login. Use the change password route instead.' });
        }

        // Update password
        user.password = newPassword;
        user.isFirstLogin = false;
        await user.save();

        res.status(200).json({ message: 'Password set successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset database - keep only admin user
router.post('/reset-db', async (req, res) => {
    try {
        // Find admin user (to keep)
        const adminUser = await User.findOne({ username: 'admin' });
        
        if (!adminUser) {
            // If no admin user exists, create one
            const admin = new User({
                username: 'admin',
                password: 'admin', // Default password for admin
                role: 'Admin',
                team: 'admin',
                level: 'admin',
                isFirstLogin: false // Admin doesn't need to reset password
            });
            await admin.save();
        } else {
            // Delete all users except admin
            await User.deleteMany({ _id: { $ne: adminUser._id } });
        }
        
        // Delete all projects and project requests
        if (mongoose.models.Project) {
            await mongoose.models.Project.deleteMany({});
        }
        
        if (mongoose.models.ProjectRequest) {
            await mongoose.models.ProjectRequest.deleteMany({});
        }
        
        res.status(200).json({ message: 'Database reset successful. Only admin user remains.' });
    } catch (error) {
        console.error('Database reset error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 