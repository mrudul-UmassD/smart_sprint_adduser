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
        
        console.log('Login attempt for username:', username);
        
        if (!username || !password) {
            console.log('Login failed: Missing username or password');
            return res.status(400).json({ 
                success: false,
                error: 'Username and password are required' 
            });
        }

        const user = await User.findOne({ username });
        
        if (!user) {
            console.log('Login failed: User not found -', username);
            return res.status(401).json({ 
                success: false,
                error: 'Invalid username or password' 
            });
        }

        console.log('User found:', user.username, 'Role:', user.role);
        
        // Check password
        const isMatch = await user.comparePassword(password);
        console.log('Password comparison result:', isMatch);
        
        if (!isMatch) {
            console.log('Login failed: Invalid password for user', username);
            return res.status(401).json({ 
                success: false,
                error: 'Invalid username or password' 
            });
        }

        // Update user's last login
        user.lastLogin = new Date();
        await user.save();
        console.log('Updated last login for user:', username);

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
        console.log('Generated JWT token for user:', username);

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
        console.log('Login successful for user:', username);
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

        // Ensure team and level are set (especially for admin users)
        if (user.role === 'Admin') {
            if (!user.team) user.team = 'admin';
            if (!user.level) user.level = 'admin';
        } else if (user.role === 'Project Manager') {
            if (!user.team) user.team = 'PM';
            if (!user.level) user.level = 'PM';
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

        // Ensure team and level are set (especially for admin users)
        if (user.role === 'Admin') {
            if (!user.team) user.team = 'admin';
            if (!user.level) user.level = 'admin';
        } else if (user.role === 'Project Manager') {
            if (!user.team) user.team = 'PM';
            if (!user.level) user.level = 'PM';
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

// Special admin login endpoint
router.post('/admin-login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Admin login attempt for username:', username);
        
        if (username !== 'admin') {
            console.log('Admin login failed: Not an admin username');
            return res.status(401).json({ 
                success: false,
                error: 'Invalid admin credentials' 
            });
        }

        // Find the admin user
        const adminUser = await User.findOne({ username: 'admin' });
        
        if (!adminUser) {
            console.log('Admin login failed: Admin user not found in database');
            return res.status(401).json({ 
                success: false,
                error: 'Invalid admin credentials' 
            });
        }

        // Check if password is either 'admin' or 'adminadmin'
        const isMatch = (password === 'admin' || password === 'adminadmin');
        
        if (!isMatch) {
            console.log('Admin login failed: Invalid admin password');
            return res.status(401).json({ 
                success: false,
                error: 'Invalid admin credentials' 
            });
        }

        // Update admin's last login
        adminUser.lastLogin = new Date();
        await adminUser.save();

        // Generate token
        const token = jwt.sign(
            { 
                id: adminUser._id.toString(), 
                _id: adminUser._id.toString(), 
                role: 'Admin' 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.log('Generated JWT token for admin user');

        res.json({ 
            success: true,
            user: {
                _id: adminUser._id,
                username: adminUser.username,
                role: 'Admin',
                isFirstLogin: false
            }, 
            token 
        });
        console.log('Admin login successful');
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
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