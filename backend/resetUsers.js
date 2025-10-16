const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const resetUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete all users except admin
        const result = await User.deleteMany({ role: { $ne: 'Admin' } });
        console.log(`${result.deletedCount} users removed successfully.`);

        process.exit(0);
    } catch (error) {
        console.error('Error resetting users:', error);
        process.exit(1);
    }
};

resetUsers();