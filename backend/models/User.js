const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        validate: {
            validator: function(value) {
                // Bypass validation for admin user with "admin" password
                if (this.username === 'admin' && value === 'admin') {
                    return true;
                }
                // Otherwise, enforce the 8-character minimum
                return value.length >= 8;
            },
            message: 'Password must be at least 8 characters long'
        }
    },
    isFirstLogin: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Project Manager', 'Developer', 'Designer'],
        required: [true, 'Role is required']
    },
    team: {
        type: String,
        enum: ['Frontend', 'Backend', 'Design', 'DevOps', 'QA', 'PM', 'admin'],
        required: function() {
            // Required for all roles except when not set
            return ['Developer', 'Designer', 'Project Manager', 'Admin'].includes(this.role);
        },
        validate: {
            validator: function(value) {
                if (this.role === 'Admin') {
                    return value === 'admin';
                }
                if (this.role === 'Project Manager') {
                    return value === 'PM';
                }
                return true;
            },
            message: 'Team should be \'admin\' for Admin role and \'PM\' for Project Manager role'
        }
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    level: {
        type: String,
        enum: ['Junior', 'Mid', 'Senior', 'Lead', 'PM', 'admin'],
        required: function() {
            // Required for all roles
            return ['Developer', 'Designer', 'Project Manager', 'Admin'].includes(this.role);
        },
        validate: {
            validator: function(value) {
                if (this.role === 'Admin') {
                    return value === 'admin';
                }
                if (this.role === 'Project Manager') {
                    return value === 'PM';
                }
                return true;
            },
            message: 'Level should be \'admin\' for Admin role and \'PM\' for Project Manager role'
        }
    },
    profilePicture: {
        type: String
    },
    fullName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // Dashboard settings
    dashboardSettings: {
        widgets: [
            {
                id: {
                    type: String,
                    required: true
                },
                type: {
                    type: String,
                    required: true
                },
                config: {
                    type: mongoose.Schema.Types.Mixed,
                    default: {}
                }
            }
        ],
        layouts: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    // Theme preferences
    themePreference: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
    },
    // Notification settings
    notificationSettings: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        pushNotifications: {
            type: Boolean,
            default: true
        },
        taskReminders: {
            type: Boolean,
            default: true
        },
        projectUpdates: {
            type: Boolean,
            default: true
        }
    },
    // Dashboard layouts
    dashboardLayouts: [{
        name: {
            type: String,
            default: 'My Dashboard'
        },
        layouts: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        },
        widgets: {
            type: [Object],
            default: []
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Hash the password before saving
userSchema.pre('save', async function(next) {
    // Only hash the password if it's modified (or new)
    if (!this.isModified('password')) return next();
    
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password along with the new salt
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('Comparing password for user:', this.username);
        // Make sure we have valid inputs
        if (!candidatePassword) {
            console.log('Empty candidate password provided');
            return false;
        }
        
        if (!this.password) {
            console.log('User has no password hash stored');
            return false;
        }
        
        // Special case for admin user - allow both 'admin' and 'adminadmin'
        if (this.username === 'admin') {
            if (candidatePassword === 'admin') {
                console.log('Admin special access granted with short password');
                return true;
            }
        }
        
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('Password match result:', isMatch);
        return isMatch;
    } catch (error) {
        console.error('Error comparing passwords:', error);
        throw error;
    }
};

// Pre-save middleware to ensure team and level are unset based on role
userSchema.pre('save', function(next) {
    if (['Admin', 'Project Manager'].includes(this.role)) {
        this.team = undefined;
        this.level = undefined;
    }
    next();
});

// Method to check if user has required permissions
userSchema.methods.hasPermission = function(requiredRole) {
    const roleHierarchy = {
        'Admin': 3,
        'Project Manager': 2,
        'Developer': 1,
        'Designer': 1
    };

    return roleHierarchy[this.role] >= roleHierarchy[requiredRole];
};

module.exports = mongoose.model('User', userSchema); 