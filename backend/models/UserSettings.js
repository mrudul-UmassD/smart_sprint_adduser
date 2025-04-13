const mongoose = require('mongoose');

const widgetSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['TaskProgress', 'TimeTracking', 'BurndownChart', 'TeamActivity', 'Milestones', 'CustomChart', 'RecentDocuments', 'Calendar'],
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
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const integrationConfigSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['GitHub', 'GitLab', 'Slack', 'Microsoft Teams', 'Google Calendar', 'Outlook'],
        required: true
    },
    isConnected: {
        type: Boolean,
        default: false
    },
    accessToken: {
        type: String
    },
    refreshToken: {
        type: String
    },
    tokenExpiry: {
        type: Date
    },
    config: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const userSettingsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    dashboardConfig: {
        layout: {
            type: String,
            enum: ['Grid', 'List', 'Compact'],
            default: 'Grid'
        },
        theme: {
            type: String,
            enum: ['Light', 'Dark', 'System'],
            default: 'System'
        },
        widgets: [widgetSchema],
        lastModified: {
            type: Date,
            default: Date.now
        }
    },
    notificationPreferences: {
        email: {
            taskAssigned: {
                type: Boolean,
                default: true
            },
            taskStatusChanged: {
                type: Boolean,
                default: true
            },
            taskCommented: {
                type: Boolean,
                default: true
            },
            projectAdded: {
                type: Boolean,
                default: true
            },
            dailyDigest: {
                type: Boolean,
                default: false
            },
            weeklyReport: {
                type: Boolean,
                default: true
            }
        },
        inApp: {
            taskAssigned: {
                type: Boolean,
                default: true
            },
            taskStatusChanged: {
                type: Boolean,
                default: true
            },
            taskCommented: {
                type: Boolean,
                default: true
            },
            projectAdded: {
                type: Boolean,
                default: true
            },
            documentUploaded: {
                type: Boolean,
                default: true
            }
        }
    },
    timeTrackingSettings: {
        reminderInterval: {
            type: Number, // in minutes
            default: 30
        },
        autoStop: {
            type: Boolean,
            default: true
        },
        workingHours: {
            start: {
                type: String,
                default: '09:00'
            },
            end: {
                type: String,
                default: '17:00'
            },
            workingDays: {
                type: [Number], // 0 = Sunday, 1 = Monday, etc.
                default: [1, 2, 3, 4, 5]
            }
        }
    },
    reportPreferences: {
        defaultExportFormat: {
            type: String,
            enum: ['PDF', 'Excel', 'CSV'],
            default: 'PDF'
        },
        savedReports: [{
            name: {
                type: String,
                required: true
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
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
    },
    integrations: [integrationConfigSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

userSettingsSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    if (this.isModified('dashboardConfig.widgets')) {
        this.dashboardConfig.lastModified = Date.now();
    }
    
    next();
});

// Static method to get or create settings for a user
userSettingsSchema.statics.getOrCreateSettings = async function(userId) {
    let settings = await this.findOne({ userId });
    
    if (!settings) {
        settings = await this.create({
            userId,
            dashboardConfig: {
                layout: 'Grid',
                theme: 'System',
                widgets: [
                    {
                        type: 'TaskProgress',
                        title: 'My Tasks',
                        position: { x: 0, y: 0, width: 6, height: 4 }
                    },
                    {
                        type: 'TimeTracking',
                        title: 'Time Tracking',
                        position: { x: 6, y: 0, width: 6, height: 4 }
                    },
                    {
                        type: 'Calendar',
                        title: 'Upcoming Deadlines',
                        position: { x: 0, y: 4, width: 12, height: 4 }
                    }
                ]
            }
        });
    }
    
    return settings;
};

module.exports = mongoose.model('UserSettings', userSettingsSchema); 