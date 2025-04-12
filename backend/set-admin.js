require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function setAdminPassword() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    let adminUser = await User.findOne({ username: 'admin' });
    
    if (adminUser) {
      console.log('Admin user found, updating password...');
      // Use bcrypt directly to hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      // Update using updateOne to bypass middleware
      await User.updateOne(
        { _id: adminUser._id },
        { 
          $set: { 
            password: hashedPassword,
            isFirstLogin: false
          } 
        }
      );
      console.log('Admin password updated to: admin');
    } else {
      console.log('Admin user not found, creating new admin user...');
      
      // Create admin user with special permissions
      const admin = new User({
        username: 'admin',
        password: 'admin',
        role: 'Admin',
        // Bypassing team and level validation
        isFirstLogin: false
      });
      
      // Override the validation and save directly to database
      await User.collection.insertOne({
        username: 'admin',
        password: await bcrypt.hash('admin', 10),
        role: 'Admin',
        isFirstLogin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Admin user created with password: admin');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

setAdminPassword(); 