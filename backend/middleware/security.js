const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    details: 'Please try again later'
  }
});

// Login rate limiting
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, 
  message: {
    success: false,
    error: 'Too many login attempts',
    details: 'Please try again later'
  },
  // Adding skipSuccessfulRequests to not count successful logins against the limit
  skipSuccessfulRequests: true
});

// Registration rate limiting
const registerLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // limit each IP to 3 registration attempts per day
  message: {
    success: false,
    error: 'Too many registration attempts',
    details: 'Please try again tomorrow'
  }
});

// Password reset rate limiting
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset attempts per hour
  message: {
    success: false,
    error: 'Too many password reset attempts',
    details: 'Please try again later'
  }
});

// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    // Development mode - allow all origins
    if (process.env.NODE_ENV !== 'production') {
      callback(null, true);
      return;
    }
    
    // Production mode - check allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5000',
      process.env.FRONTEND_URL || 'https://smart-sprint.onrender.com'
    ];
    
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'Cache-Control'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Security headers configuration
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000']
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  xssFilter: true,
  hidePoweredBy: true,
  noSniff: true,
  frameguard: {
    action: 'SAMEORIGIN'
  }
};

// Create middleware function
const securityHeaders = (req, res, next) => {
  helmet(helmetConfig)(req, res, next);
};

// Request size limit middleware
const requestSizeLimit = (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || '0');
  if (contentLength > 1024 * 1024) { // 1MB limit
    return res.status(413).json({
      success: false,
      error: 'Request too large',
      details: 'Request payload exceeds 1MB limit'
    });
  }
  next();
};

module.exports = {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  passwordResetLimiter,
  corsOptions,
  securityHeaders,
  requestSizeLimit
}; 