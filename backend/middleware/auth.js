const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        // Get token from different possible headers
        let token;
        
        // Check Authorization header (Bearer token)
        if (req.header('Authorization')) {
            token = req.header('Authorization').replace('Bearer ', '');
        } 
        // Check x-auth-token header (used by frontend)
        else if (req.header('x-auth-token')) {
            token = req.header('x-auth-token');
        }
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided, authorization denied' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Make sure both _id and id are available for convenience
            req.user = {
                ...decoded,
                id: decoded._id
            };
            
            next();
        } catch (err) {
            console.error('Token verification error:', err.message);
            return res.status(401).json({ error: 'Token is not valid' });
        }
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(500).json({ error: 'Server error in authentication' });
    }
};

module.exports = auth; 