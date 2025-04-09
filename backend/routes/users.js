const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all users (Admin and Project Manager only)
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
            return res.status(403).json({ error: 'Access denied' });
        }
        const users = await User.find({});
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
        
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update user (Admin and Project Manager only)
router.patch('/:id', auth, async (req, res) => {
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
        
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 