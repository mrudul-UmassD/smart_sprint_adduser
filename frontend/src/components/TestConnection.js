import React, { useEffect, useState } from 'react';
import { Container, Alert, Spinner } from 'react-bootstrap';
import API_CONFIG from '../config';
import axios from 'axios';

const TestConnection = () => {
  const [status, setStatus] = useState('Testing...');
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const runTests = async () => {
      const results = [];
      
      // Test 1: Check API URL
      results.push(`API URL: ${API_CONFIG.API_URL}`);
      
      // Test 2: Try health endpoint
      try {
        const response = await axios.get(`${API_CONFIG.API_URL}/health`, { timeout: 5000 });
        results.push(`✅ Health check: ${JSON.stringify(response.data)}`);
      } catch (error) {
        results.push(`❌ Health check failed: ${error.message}`);
      }
      
      // Test 3: Check localStorage
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      results.push(`Token exists: ${!!token} (length: ${token?.length || 0})`);
      results.push(`User exists: ${!!user}`);
      
      setDetails(results);
      setStatus('Tests complete');
    };
    
    runTests();
  }, []);

  return (
    <Container className="mt-5">
      <h2>Connection Test</h2>
      <Alert variant="info">{status}</Alert>
      {details.map((detail, idx) => (
        <p key={idx}>{detail}</p>
      ))}
    </Container>
  );
};

export default TestConnection;
