const mongoose = require('mongoose');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config({
  path: path.join(__dirname, '..', '.env.test')
});

let mongoServer;

beforeAll(async () => {
  jest.setTimeout(30000);
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000
    });
    console.log('Connected to in-memory MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // Let Jest handle the error
  }
});

beforeEach(async () => {
  try {
    await mongoose.connection.dropDatabase();
    console.log('Database cleared');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
});