const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

module.exports = router; 