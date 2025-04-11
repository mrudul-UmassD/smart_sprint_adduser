require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    
    if (existingAdmin) {
      console.log('Admin user already exists, updating password...');
      // Use bcrypt directly to hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      
      // Update using updateOne to bypass middleware
      await User.updateOne(
        { _id: existingAdmin._id },
        { 
          $set: { 
            password: hashedPassword,
            isFirstLogin: false
          } 
        }
      );
      console.log('Admin password updated to: Admin123!');
    } else {
      console.log('Creating new admin user...');
      // Create new admin with pre-hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'Admin',
        isFirstLogin: false
      });
      
      // Save admin user
      await admin.save();
      console.log('Admin user created with password: Admin123!');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

createAdmin(); 