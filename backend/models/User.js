const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    isFirstLogin: {
        type: Boolean,
        default: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Project Manager', 'Developer'],
        required: true
    },
    team: {
        type: String,
        enum: ['Design', 'Database', 'Backend', 'Frontend', 'DevOps', 'Tester/Security', 'None', 'admin', 'pm'],
        required: true,
        default: 'None'
    },
    level: {
        type: String,
        enum: ['Lead', 'Senior', 'Dev', 'Junior', 'admin', 'pm'],
        required: true,
        default: 'Dev'
    },
    profilePicture: {
        type: String,
        default: ''
    },
    fullName: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
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

module.exports = mongoose.model('User', userSchema); 