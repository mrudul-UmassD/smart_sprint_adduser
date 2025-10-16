const Notification = require('../models/Notification');
const User = require('../models/User');
const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

// Get all notifications for a user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Add filters
    const filter = { user: userId };
    
    // Apply read status filter if provided
    if (req.query.read !== undefined) {
      filter.read = req.query.read === 'true';
    }
    
    // Apply type filter if provided
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    // Get total count
    const total = await Notification.countDocuments(filter);
    
    // Get notifications
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({ 
      user: userId, 
      read: false 
    });
    
    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching notifications'
    });
  }
};

// Get recent unread notifications
exports.getRecentNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 5;
    
    const notifications = await Notification.find({
      user: userId,
      read: false
    })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    const unreadCount = await Notification.countDocuments({
      user: userId,
      read: false
    });
    
    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    console.error('Error fetching recent notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while fetching recent notifications'
    });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification ID'
      });
    }
    
    // Find the notification and update
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found or not authorized'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while marking notification as read'
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Update all unread notifications for the user
    const result = await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );
    
    return res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while marking all notifications as read'
    });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification ID'
      });
    }
    
    // Find and delete the notification
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found or not authorized'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: { id: notificationId }
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while deleting notification'
    });
  }
};

// Clear all notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Delete all notifications for the user
    const result = await Notification.deleteMany({ user: userId });
    
    return res.status(200).json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while clearing all notifications'
    });
  }
};

// Create a notification (admin or system only)
exports.createNotification = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // Only allow admins to create notifications for other users
    if (req.user.role !== 'Admin' && req.body.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create notifications for other users'
      });
    }
    
    const { userId, title, message, type, link, relatedEntity, icon } = req.body;
    
    // Verify user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'Target user not found'
      });
    }
    
    // Create notification
    const notification = new Notification({
      user: userId,
      title,
      message,
      type: type || 'info',
      link: link || null,
      relatedEntity: relatedEntity || { entityType: null, entityId: null },
      icon: icon || 'notification'
    });
    
    await notification.save();
    
    return res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error while creating notification'
    });
  }
};

// System utility function to create notifications (not exposed as API)
exports.createSystemNotification = async (userId, title, message, options = {}) => {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type: options.type || 'system',
      link: options.link || null,
      relatedEntity: options.relatedEntity || { entityType: null, entityId: null },
      icon: options.icon || 'system'
    });
    
    return await notification.save();
  } catch (error) {
    console.error('Error creating system notification:', error);
    throw error;
  }
}; 