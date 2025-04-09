const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        
        try {
            // Import models
            const User = require('./models/User');
            
            // Check for admin user
            let adminUser = await User.findOne({ username: 'admin' });
            
            if (!adminUser) {
                console.log('Creating admin user...');
                // Create admin user
                const admin = new User({
                    username: 'admin',
                    role: 'Admin',
                    team: 'admin',
                    level: 'admin'
                });
                
                adminUser = await admin.save();
                console.log('Admin user created successfully');
            } else {
                console.log('Admin user already exists');
            }
            
            // Log admin details for verification
            console.log('Admin user details:');
            console.log(`ID: ${adminUser._id}`);
            console.log(`Username: ${adminUser.username}`);
            console.log(`Role: ${adminUser.role}`);
            
            // Close the connection
            await mongoose.connection.close();
            console.log('Database connection closed');
            process.exit(0);
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }); 