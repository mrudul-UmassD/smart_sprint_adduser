const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username } = req.body;
        
        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid username' });
        }

        const token = jwt.sign(
            { _id: user._id.toString(), role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ user, token });
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
                role: 'Admin',
                team: 'admin',
                level: 'admin'
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