require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        
        try {
            // Find admin user
            const adminUser = await User.findOne({ username: 'admin' });
            
            if (adminUser) {
                console.log('Admin user found, resetting password...');
                
                // Update admin password
                adminUser.password = 'admin';
                adminUser.isFirstLogin = false;
                await adminUser.save();
                
                console.log('Admin password reset to "admin"');
                
                // Delete all other users
                const deleteResult = await User.deleteMany({ _id: { $ne: adminUser._id } });
                console.log(`Deleted ${deleteResult.deletedCount} other users`);
            } else {
                console.log('Admin user not found, creating new admin user...');
                
                // Create admin user
                const admin = new User({
                    username: 'admin',
                    password: 'admin',
                    role: 'Admin',
                    team: 'admin',
                    level: 'admin',
                    isFirstLogin: false
                });
                
                await admin.save();
                console.log('New admin user created with password "admin"');
            }
            
            console.log('Database reset completed successfully');
            
        } catch (error) {
            console.error('Error resetting database:', error);
        } finally {
            // Close MongoDB connection
            await mongoose.connection.close();
            console.log('Database connection closed');
            process.exit(0);
        }
    })
    .catch(error => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }); 