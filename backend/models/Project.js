const mongoose = require('mongoose');

const projectRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const documentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    path: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    versions: [{
        path: String,
        updatedAt: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        versionNumber: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Schema for integrations with external tools
const integrationSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['GitHub', 'GitLab', 'Slack', 'Microsoft Teams', 'Google Calendar', 'Outlook'],
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    config: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Error'],
        default: 'Active'
    },
    lastSync: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Schema for custom dashboard widgets
const widgetSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['TaskProgress', 'TimeTracking', 'BurndownChart', 'TeamActivity', 'Milestones', 'CustomChart'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    config: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    position: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isShared: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const reportTemplateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['BurndownChart', 'VelocityTracking', 'TaskCompletion', 'TimeTracking', 'CustomReport'],
        required: true
    },
    config: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isShared: {
        type: Boolean,
        default: true
    },
    schedule: {
        isScheduled: {
            type: Boolean,
            default: false
        },
        frequency: {
            type: String,
            enum: ['Daily', 'Weekly', 'Biweekly', 'Monthly'],
            default: 'Weekly'
        },
        recipients: [{
            type: String // Email addresses
        }],
        lastSent: {
            type: Date
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true,
        default: ''
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['Project Manager', 'Developer'],
            required: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    requests: [projectRequestSchema],
    // Document Management
    documents: [documentSchema],
    // Third-party tool integrations
    integrations: [integrationSchema],
    // Dashboard customization
    widgets: [widgetSchema],
    // Reporting
    reportTemplates: [reportTemplateSchema],
    // Project timeline
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
        default: 'Planning'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

projectSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Project', projectSchema); 