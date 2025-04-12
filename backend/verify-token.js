require('dotenv').config();
const jwt = require('jsonwebtoken');

// A token to verify (replace with an actual token from your app)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2N2Y5ODlkNmI0NDkyNjA4OWI4OWVhMmUiLCJyb2xlIjoiQWRtaW4iLCJpYXQiOjE3NDQ0MDg5MzYsImV4cCI6MTc0NDQ5NTMzNn0.evoBJ6JddBkHGApbsnheu4P7Ck8P7d_6ORuqWc7TxrA';

console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Token successfully verified!');
  console.log('Decoded payload:', decoded);
} catch (error) {
  console.error('Token verification failed:', error.message);
}

// Generate a new token for testing
const payload = { 
  id: '67f989d6b44926089b89ea2e', 
  _id: '67f989d6b44926089b89ea2e',
  role: 'Admin' 
};

const newToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
console.log('\nNew token generated for testing:');
console.log(newToken); 