import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Alert,
} from '@mui/material';
import { Card, Row, Col, Image } from 'react-bootstrap';
import API_CONFIG from '../config';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        if (!username || !password) {
            setError('Please enter both username and password');
            setLoading(false);
            return;
        }
        
        try {
            console.log('Attempting login with:', { username, password });
            console.log('API endpoint:', `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINT}/login`);
            
            // Don't use AUTH_ENDPOINT directly with axios.post as it already has the base URL
            const response = await axios.post(`${API_CONFIG.AUTH_ENDPOINT}/login`, { 
                username,
                password
            });
            
            console.log('Login successful, response:', response.data);
            
            // Check if token is present
            if (!response.data.token) {
                throw new Error('No token received from server');
            }
            
            // Store the token and user details
            localStorage.setItem('token', response.data.token);
            
            // Store user object in local storage
            const userData = response.data.user || {
                username,
                role: 'Admin', // Fallback value
                isFirstLogin: false
            };
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Set default auth headers for all future requests
            // These are now handled by the axios interceptor in axiosConfig.js
            
            // Verify localStorage was set correctly
            console.log('localStorage token:', localStorage.getItem('token'));
            console.log('localStorage user:', localStorage.getItem('user'));
            
            // Small delay before redirect to ensure state is updated
            setTimeout(() => {
                // Check if it's the user's first login
                if (userData.isFirstLogin) {
                    console.log('Redirecting to first login page');
                    navigate('/first-login');
                } else {
                    console.log('Redirecting to dashboard');
                    navigate('/dashboard');
                }
            }, 100);
        } catch (err) {
            console.error('Login error:', err);
            console.error('Response data:', err.response?.data);
            console.error('Status code:', err.response?.status);
            
            // Show appropriate error message
            if (err.message === 'Network Error') {
                setError('Unable to connect to the server. Please check your connection and try again.');
            } else {
                setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
            }
            
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="lg">
            <Row className="justify-content-center align-items-center min-vh-100">
                <Col md={8} lg={6}>
                    <Card className="shadow-lg border-0 rounded-lg">
                        <Card.Body className="p-5">
                            <Row className="align-items-center">
                                <Col md={6} className="border-end text-center">
                                    <Image 
                                        src="/logo.png" 
                                        alt="Smart Sprint Logo" 
                                        className="img-fluid mb-4 p-4" 
                                        style={{ maxWidth: '200px' }}
                                    />
                                    <Typography variant="h4" className="text-primary">
                                        Smart Sprint
                                    </Typography>
                                    <Typography variant="subtitle1" className="text-muted">
                                        Project Management Simplified
                                    </Typography>
                                </Col>
                                <Col md={6}>
                                    <Box component="form" onSubmit={handleSubmit} noValidate className="p-3">
                                        <Typography variant="h5" gutterBottom className="mb-4 text-center">
                                            Login
                                        </Typography>
                                        
                                        {error && <Alert severity="error" className="mb-3">{error}</Alert>}
                                        
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            id="username"
                                            label="Username"
                                            name="username"
                                            autoComplete="username"
                                            autoFocus
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            disabled={loading}
                                        />
                                        <TextField
                                            margin="normal"
                                            required
                                            fullWidth
                                            name="password"
                                            label="Password"
                                            type="password"
                                            id="password"
                                            autoComplete="current-password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            disabled={loading}
                                        />
                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            sx={{ mt: 3, mb: 2 }}
                                            disabled={loading}
                                        >
                                            {loading ? 'Logging in...' : 'Login'}
                                        </Button>
                                        <Typography variant="body2" color="textSecondary" align="center">
                                            Default admin credentials: username 'admin', password 'admin'
                                        </Typography>
                                    </Box>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login; 