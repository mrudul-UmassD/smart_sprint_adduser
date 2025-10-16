const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const deleteAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Delete admin user
        const result = await User.deleteOne({ role: 'Admin' });
        console.log(`${result.deletedCount} admin user removed successfully.`);

        process.exit(0);
    } catch (error) {
        console.error('Error deleting admin user:', error);
        process.exit(1);
    }
};

deleteAdmin();