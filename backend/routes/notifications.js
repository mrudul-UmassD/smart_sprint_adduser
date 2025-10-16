const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const { check } = require('express-validator');

// Protect all notification routes
router.use(auth);

// @route   GET /api/notifications
// @desc    Get all notifications for the logged in user
// @access  Private
router.get('/', notificationController.getNotifications);

// @route   GET /api/notifications/recent
// @desc    Get recent unread notifications
// @access  Private
router.get('/recent', notificationController.getRecentNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.put('/:id/read', notificationController.markAsRead);

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', notificationController.markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', notificationController.deleteNotification);

// @route   DELETE /api/notifications/clear-all
// @desc    Clear all notifications
// @access  Private
router.delete('/clear-all', notificationController.clearAllNotifications);

// @route   POST /api/notifications
// @desc    Create a notification (admin or system only)
// @access  Private/Admin
router.post(
  '/',
  [
    check('userId', 'User ID is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('message', 'Message is required').not().isEmpty(),
    check('type', 'Type must be valid if provided').optional().isIn([
      'info', 'warning', 'success', 'error', 'task', 'project', 'team', 'system'
    ])
  ],
  notificationController.createNotification
);

module.exports = router; 