const mongoose = require('mongoose');
const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { MongoMemoryServer } = require('mongodb-memory-server');

class DatabaseSetup {
  constructor() {
    this.isWindows = os.platform() === 'win32';
    this.isMac = os.platform() === 'darwin';
    this.isLinux = os.platform() === 'linux';
    this.localMongoUri = 'mongodb://localhost:27017/smart-sprint';
    this.mongoServer = null;
  }

  /**
   * Start in-memory MongoDB server
   */
  async startMemoryServer() {
    console.log('🚀 Starting in-memory MongoDB server...');
    try {
      this.mongoServer = await MongoMemoryServer.create();
      const mongoUri = this.mongoServer.getUri();
      console.log(`✅ In-memory MongoDB server started at: ${mongoUri}`);
      return mongoUri;
    } catch (error) {
      console.error('❌ Failed to start in-memory MongoDB server:', error);
      throw new Error('Failed to start in-memory MongoDB server');
    }
  }

  /**
   * Stop in-memory MongoDB server
   */
  async stopMemoryServer() {
    if (this.mongoServer) {
      await this.mongoServer.stop();
      console.log('🛑 In-memory MongoDB server stopped.');
    }
  }

  /**
   * Test MongoDB connection
   */
  async testConnection(uri, timeout = 10000) {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(false);
      }, timeout);

      mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: timeout
      })
      .then(() => {
        clearTimeout(timeoutId);
        console.log(`✅ Successfully connected to MongoDB at: ${uri}`);
        resolve(true);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        console.log(`❌ Failed to connect to MongoDB at: ${uri}`);
        console.log(`Error: ${error.message}`);
        resolve(false);
      });
    });
  }

  /**
   * Check if MongoDB is installed locally
   */
  async isMongoInstalled() {
    return new Promise((resolve) => {
      const command = this.isWindows ? 'mongod --version' : 'which mongod';
      
      exec(command, (error, stdout, stderr) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Check if MongoDB service is running
   */
  async isMongoRunning() {
    return new Promise((resolve) => {
      let command;
      
      if (this.isWindows) {
        command = 'sc query MongoDB';
      } else if (this.isMac) {
        command = 'brew services list | grep mongodb';
      } else {
        command = 'systemctl is-active mongod';
      }

      exec(command, (error, stdout, stderr) => {
        if (error) {
          resolve(false);
        } else {
          const isRunning = this.isWindows 
            ? stdout.includes('RUNNING')
            : this.isMac 
              ? stdout.includes('started')
              : stdout.trim() === 'active';
          resolve(isRunning);
        }
      });
    });
  }

  /**
   * Install MongoDB locally
   */
  async installMongoDB() {
    console.log('🔧 Installing MongoDB locally...');
    
    return new Promise((resolve, reject) => {
      let command;
      let args = [];

      if (this.isWindows) {
        // For Windows, we'll provide instructions rather than auto-install
        console.log(`
📋 MongoDB Installation Instructions for Windows:

1. Download MongoDB Community Server from:
   https://www.mongodb.com/try/download/community

2. Run the installer and follow the setup wizard

3. Make sure to install MongoDB as a Windows Service

4. Add MongoDB bin directory to your PATH environment variable
   (Usually: C:\\Program Files\\MongoDB\\Server\\6.0\\bin)

5. Restart your command prompt/terminal

6. Run this application again

Alternatively, you can use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
        `);
        resolve(false);
        return;
      } else if (this.isMac) {
        // Use Homebrew on macOS
        command = 'brew';
        args = ['install', 'mongodb-community'];
      } else {
        // Use apt on Ubuntu/Debian
        command = 'sudo';
        args = ['apt-get', 'install', '-y', 'mongodb'];
      }

      const installProcess = spawn(command, args, { stdio: 'inherit' });

      installProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ MongoDB installed successfully');
          resolve(true);
        } else {
          console.log('❌ Failed to install MongoDB');
          resolve(false);
        }
      });

      installProcess.on('error', (error) => {
        console.error('❌ Error installing MongoDB:', error.message);
        resolve(false);
      });
    });
  }

  /**
   * Start MongoDB service
   */
  async startMongoDB() {
    console.log('🚀 Starting MongoDB service...');
    
    return new Promise((resolve) => {
      let command;
      let args = [];

      if (this.isWindows) {
        command = 'net';
        args = ['start', 'MongoDB'];
      } else if (this.isMac) {
        command = 'brew';
        args = ['services', 'start', 'mongodb-community'];
      } else {
        command = 'sudo';
        args = ['systemctl', 'start', 'mongod'];
      }

      const startProcess = spawn(command, args, { stdio: 'inherit' });

      startProcess.on('close', (code) => {
        if (code === 0) {
          console.log('✅ MongoDB service started successfully');
          resolve(true);
        } else {
          console.log('❌ Failed to start MongoDB service');
          resolve(false);
        }
      });

      startProcess.on('error', (error) => {
        console.error('❌ Error starting MongoDB:', error.message);
        resolve(false);
      });
    });
  }

  /**
   * Create local MongoDB database and initial data
   */
  async initializeDatabase() {
    try {
      console.log('🗄️ Initializing database...');
      
      // Import User model
      const User = require('../models/User');
      
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
        console.log('✅ Admin user created successfully');
        console.log('   Username: admin');
        console.log('   Password: admin123');
      } else {
        console.log('✅ Admin user already exists');
      }

      return true;
    } catch (error) {
      console.error('❌ Error initializing database:', error.message);
      return false;
    }
  }

  /**
   * Setup MongoDB with automatic fallback
   */
  async setupDatabase() {
    console.log('🔍 Setting up MongoDB database...');
    
    // First, try to connect to the configured MongoDB URI
    const configuredUri = process.env.MONGODB_URI;
    
    if (configuredUri && configuredUri !== this.localMongoUri) {
      console.log('🌐 Attempting to connect to configured MongoDB URI...');
      const connected = await this.testConnection(configuredUri);
      
      if (connected) {
        await this.initializeDatabase();
        return configuredUri;
      }
      
      console.log('⚠️ Could not connect to configured MongoDB URI, falling back to local setup...');
    }

    // Try to connect to local MongoDB
    console.log('🏠 Attempting to connect to local MongoDB...');
    const localConnected = await this.testConnection(this.localMongoUri);
    
    if (localConnected) {
      console.log('✅ Connected to local MongoDB');
      await this.initializeDatabase();
      return this.localMongoUri;
    }

    // Check if MongoDB is installed
    const isInstalled = await this.isMongoInstalled();
    
    if (!isInstalled) {
      console.log('📦 MongoDB not found, attempting to install...');
      const installed = await this.installMongoDB();
      
      if (!installed) {
        throw new Error('Failed to install MongoDB. Please install it manually.');
      }
    }

    // Check if MongoDB is running
    const isRunning = await this.isMongoRunning();
    
    if (!isRunning) {
      console.log('▶️ MongoDB not running, attempting to start...');
      const started = await this.startMongoDB();
      
      if (!started) {
        throw new Error('Failed to start MongoDB service. Please start it manually.');
      }
    }

    // Wait a moment for MongoDB to fully start
    console.log('⏳ Waiting for MongoDB to be ready...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Try connecting again
    const finalConnected = await this.testConnection(this.localMongoUri);
    
    if (finalConnected) {
      await this.initializeDatabase();
      return this.localMongoUri;
    }

    throw new Error('Failed to establish MongoDB connection after setup attempts.');
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('🔌 Disconnected from MongoDB');
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error.message);
    }
  }

  /**
   * Initialize database connection and setup
   */
  async initialize() {
    console.log('🔍 Setting up MongoDB database...');
    
    // For development, use in-memory server
    if (process.env.NODE_ENV === 'development') {
      try {
        const mongoUri = await this.startMemoryServer();
        await this.testConnection(mongoUri);
        return mongoUri;
      } catch (error) {
        console.error('❌ Failed to initialize in-memory database:', error);
        throw new Error('Failed to initialize in-memory database');
      }
    }

    // For production or other environments, use MONGODB_URI
    const mongoUri = process.env.MONGODB_URI || this.localMongoUri;
    
    // Test connection to the MongoDB URI
    const connected = await this.testConnection(mongoUri);
    
    if (!connected) {
      throw new Error(`Unable to connect to MongoDB at ${mongoUri}`);
    }

    // Initialize the database (e.g., create admin user)
    await this.initializeDatabase();
    
    return mongoUri;
  }
}

module.exports = DatabaseSetup;