const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function checkAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin exists
    const adminUser = await User.findOne({ username: 'admin' });
    
    if (adminUser) {
      console.log('Admin user exists:', {
        id: adminUser._id,
        username: adminUser.username,
        role: adminUser.role,
        team: adminUser.team,
        level: adminUser.level,
        isFirstLogin: adminUser.isFirstLogin,
        passwordLength: adminUser.password.length
      });
      
      // Test password
      const testPassword = 'admin';
      const isMatch = await adminUser.comparePassword(testPassword);
      console.log(`Password "admin" matches: ${isMatch}`);
      
      if (!isMatch) {
        // Update admin password
        console.log('Updating admin password to "admin"...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin', salt);
        
        // Use updateOne to bypass middleware
        await User.updateOne(
          { _id: adminUser._id },
          { 
            $set: { 
              password: hashedPassword,
              isFirstLogin: false
            } 
          }
        );
        console.log('Admin password updated to: "admin"');
        
        // Verify update
        const updatedAdmin = await User.findOne({ username: 'admin' });
        const verifyMatch = await updatedAdmin.comparePassword('admin');
        console.log(`Password "admin" now matches: ${verifyMatch}`);
      }
      
      // Check if team and level are valid
      const validTeams = ['Frontend', 'Backend', 'Design', 'DevOps', 'QA'];
      const validLevels = ['Junior', 'Mid', 'Senior', 'Lead'];
      
      let needsUpdate = false;
      const updateFields = {};
      
      if (adminUser.role === 'Admin' && adminUser.team && !validTeams.includes(adminUser.team)) {
        console.log(`Invalid team value: ${adminUser.team}`);
        updateFields.team = undefined;
        needsUpdate = true;
      }
      
      if (adminUser.role === 'Admin' && adminUser.level && !validLevels.includes(adminUser.level)) {
        console.log(`Invalid level value: ${adminUser.level}`);
        updateFields.level = undefined;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        console.log('Updating admin user fields...');
        await User.updateOne(
          { _id: adminUser._id },
          { $set: updateFields }
        );
        console.log('Admin user updated successfully');
      }
    } else {
      console.log('No admin user found. Creating new admin user...');
      
      // Create a new admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin', salt);
      
      const newAdmin = new User({
        username: 'admin',
        password: hashedPassword,
        role: 'Admin',
        isFirstLogin: false
      });
      
      await newAdmin.save();
      console.log('Admin user created with password: "admin"');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

checkAdmin(); 