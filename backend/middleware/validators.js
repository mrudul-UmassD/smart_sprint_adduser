const { body, validationResult } = require('express-validator');

// User validation rules
const userValidationRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .isIn(['admin', 'pm', 'developer', 'designer', 'qa']).withMessage('Invalid role'),
  
  body('team')
    .isIn(['admin', 'pm', 'development', 'design', 'qa']).withMessage('Invalid team'),
  
  body('level')
    .isIn(['admin', 'pm', 'senior', 'mid', 'junior']).withMessage('Invalid level')
];

// Task validation rules
const taskValidationRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters long'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  
  body('priority')
    .isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  
  body('status')
    .isIn(['todo', 'in-progress', 'review', 'done']).withMessage('Invalid status'),
  
  body('dueDate')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Due date must be in the future');
      }
      return true;
    })
];

// Project validation rules
const projectValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Project name is required')
    .isLength({ min: 3 }).withMessage('Project name must be at least 3 characters long'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),
  
  body('startDate')
    .isISO8601().withMessage('Invalid date format'),
  
  body('endDate')
    .isISO8601().withMessage('Invalid date format')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    })
];

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = errors.array().map(err => ({
    field: err.param,
    message: err.msg
  }));

  return res.status(400).json({
    success: false,
    error: 'Validation Error',
    details: extractedErrors
  });
};

module.exports = {
  userValidationRules,
  taskValidationRules,
  projectValidationRules,
  validate
}; 