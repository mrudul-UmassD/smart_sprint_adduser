const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function fixAdminUser() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin user
    const adminUser = await User.findOne({ username: 'admin' });
    
    if (adminUser) {
      console.log('Admin user found:', {
        id: adminUser._id,
        username: adminUser.username,
        role: adminUser.role,
        team: adminUser.team,
        level: adminUser.level
      });
      
      // Direct database update to bypass mongoose validation
      console.log('Fixing admin user by removing invalid fields...');
      const result = await mongoose.connection.collection('users').updateOne(
        { _id: adminUser._id },
        { 
          $unset: { 
            team: "", 
            level: "" 
          }
        }
      );
      
      console.log(`Admin user updated: ${result.modifiedCount} document(s) modified`);
      
      // Verify the fix
      const fixedAdmin = await mongoose.connection.collection('users').findOne({ _id: adminUser._id });
      console.log('Fixed admin user:', {
        id: fixedAdmin._id,
        username: fixedAdmin.username,
        role: fixedAdmin.role,
        team: fixedAdmin.team,
        level: fixedAdmin.level
      });
    } else {
      console.log('Admin user not found. Creating a new admin user...');
      
      // Create admin directly in the database to bypass validation
      const result = await mongoose.connection.collection('users').insertOne({
        username: 'admin',
        // Use bcrypt hash of 'admin' password
        password: '$2a$10$JVQM5Kv9JQA8RNc5jQmWk.aU.jWq2FWzFQB3Oq7xg.rvIgIgjRYEq',
        role: 'Admin',
        isFirstLogin: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('New admin user created:', result.insertedId);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

fixAdminUser(); 