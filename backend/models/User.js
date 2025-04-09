const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
        type: String,
        enum: ['Admin', 'Project Manager', 'Developer'],
        required: true
    },
    team: {
        type: String,
        enum: ['Design', 'Database', 'Backend', 'Frontend', 'DevOps', 'Tester/Security', 'None'],
        default: 'None'
    },
    level: {
        type: String,
        enum: ['Lead', 'Senior', 'Dev', 'Junior'],
        default: 'Dev'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema); 