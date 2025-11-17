const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const initDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin user exists
        const adminExists = await User.findOne({ role: 'Admin' });
        
        if (!adminExists) {
            // Create admin user
            const admin = new User({
                username: 'admin',
                password: 'admin123',
                role: 'Admin',
                team: 'admin',
                level: 'admin'
            });
            
            await admin.save();
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
};

initDatabase();