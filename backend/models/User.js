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
        minlength: [8, 'Password must be at least 8 characters long']
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
        enum: ['Frontend', 'Backend', 'Design', 'DevOps', 'QA'],
        required: function() {
            return ['Developer', 'Designer'].includes(this.role);
        }
    },
    level: {
        type: String,
        enum: ['Junior', 'Mid', 'Senior', 'Lead'],
        required: function() {
            return ['Developer', 'Designer'].includes(this.role);
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
    }
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
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Pre-save middleware to ensure team and level are set based on role
userSchema.pre('save', function(next) {
    if (this.isModified('role')) {
        if (!['Developer', 'Designer'].includes(this.role)) {
            this.team = undefined;
            this.level = undefined;
        }
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