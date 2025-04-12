const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        console.log('Auth middleware called');
        console.log('Headers:', JSON.stringify(req.headers));
        
        // Get token from different possible headers
        let token;
        
        // Check Authorization header (Bearer token)
        if (req.header('Authorization')) {
            token = req.header('Authorization').replace('Bearer ', '');
            console.log('Token from Authorization header:', token.substring(0, 20) + '...');
        } 
        // Check x-auth-token header (used by frontend)
        else if (req.header('x-auth-token')) {
            token = req.header('x-auth-token');
            console.log('Token from x-auth-token header:', token.substring(0, 20) + '...');
        }
        
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ 
                success: false,
                error: 'No token provided, authorization denied' 
            });
        }

        try {
            console.log('Verifying token with secret key');
            console.log('JWT Secret length:', process.env.JWT_SECRET?.length || 'Not set');
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verification successful');
            console.log('Decoded token:', decoded);
            
            // Make user ID available in both formats for compatibility
            req.user = {
                ...decoded,
                id: decoded._id || decoded.id // Ensure id is available
            };
            
            console.log('User set in request:', req.user);
            next();
        } catch (err) {
            console.error('Token verification error:', err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    success: false,
                    error: 'Token has expired',
                    details: 'Please log in again'
                });
            }
            return res.status(401).json({ 
                success: false,
                error: 'Token is not valid',
                details: err.message
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error.message);
        res.status(500).json({ 
            success: false,
            error: 'Server error in authentication',
            details: error.message
        });
    }
};

module.exports = auth; 