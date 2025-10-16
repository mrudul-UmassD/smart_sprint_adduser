const axios = require('axios');

async function testLogin() {
  console.log('Testing login functionality...');
  
  // API URL
  const baseUrl = 'http://localhost:5000';
  
  try {
    // Test admin login
    console.log('\n--- Admin Login Test ---');
    const adminResponse = await axios.post(`${baseUrl}/api/auth/admin-login`, {
      username: 'admin',
      password: 'admin'
    });
    
    console.log('Admin login successful');
    console.log('Response status:', adminResponse.status);
    console.log('Token received:', !!adminResponse.data.token);
    console.log('Token length:', adminResponse.data.token?.length);
    
    // Test regular login with admin
    console.log('\n--- Regular Login with Admin ---');
    const regularAdminResponse = await axios.post(`${baseUrl}/api/auth/login`, {
      username: 'admin',
      password: 'admin'
    });
    
    console.log('Regular admin login successful');
    console.log('Response status:', regularAdminResponse.status);
    console.log('Token received:', !!regularAdminResponse.data.token);
    
    // Test manager login
    console.log('\n--- Manager Login Test ---');
    const managerResponse = await axios.post(`${baseUrl}/api/auth/login`, {
      username: 'manager',
      password: 'manager123'
    });
    
    console.log('Manager login successful');
    console.log('Response status:', managerResponse.status);
    console.log('Token received:', !!managerResponse.data.token);
    
  } catch (error) {
    console.error('Login test failed:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('Request was made but no response received');
      console.error(error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    
    console.error('Error details:', error.toJSON());
  }
}

testLogin(); 