const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error', 'task', 'project', 'team', 'system'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: null
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['task', 'project', 'user', 'team', 'report', 'widget'],
      default: null
    },
    entityId: {
      type: Schema.Types.ObjectId,
      default: null
    }
  },
  icon: {
    type: String,
    default: 'notification'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for querying notifications by user and read status
NotificationSchema.index({ user: 1, read: 1 });
// Index for sorting by creation time
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema); 