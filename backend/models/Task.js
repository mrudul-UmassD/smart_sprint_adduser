const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    attachments: [{
        filename: String,
        path: String,
        mimetype: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Todo', 'In Progress', 'Review', 'Needs Work', 'Completed'],
        default: 'Todo'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    stage: {
        type: String,
        enum: ['Requirements', 'Design', 'Development', 'Testing', 'Deployment', 'Maintenance'],
        default: 'Development'
    },
    attachments: [{
        filename: String,
        path: String,
        mimetype: String
    }],
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    team: {
        type: String,
        enum: ['Design', 'Database', 'Backend', 'Frontend', 'DevOps', 'Tester/Security'],
        required: true
    },
    dueDate: {
        type: Date
    },
    comments: [commentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

taskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Task', taskSchema); 