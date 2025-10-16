import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Alert,
} from '@mui/material';
import { Card, Row, Col, Image } from 'react-bootstrap';
import API_CONFIG from '../config';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [debugMode, setDebugMode] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for debug mode in URL
        const params = new URLSearchParams(location.search);
        if (params.get('debug') === 'true') {
            setDebugMode(true);
            console.log('Debug mode enabled');
        }
        
        // Clear any existing auth tokens
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }, [location]);

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
            console.log('Attempting login with:', { username });
            
            // Special case for admin login
            if (username === 'admin') {
                // Use the admin login function directly with existing credentials
                await handleAdminLogin(true);
                return;
            }
            
            // Regular user login below
            // Use direct axios call with full URL for login
            const loginUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINT}/login`;
            console.log('Login endpoint:', loginUrl);
            
            // Add a timestamp parameter to avoid any caching issues
            const response = await axios.post(loginUrl, { 
                username,
                password,
                timestamp: new Date().getTime() // Add timestamp to prevent caching
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-cache'
                }
            });
            
            console.log('Login response received');
            
            if (debugMode) {
                console.log('Full response:', response);
            }
            
            if (!response.data.token) {
                throw new Error('No token received from server');
            }
            
            // Store token and user details
            localStorage.setItem('token', response.data.token);
            
            const userData = response.data.user || {
                username,
                role: 'Admin',
                isFirstLogin: false
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            
            console.log('Token saved, length:', response.data.token.length);
            console.log('User saved:', userData.username, userData.role);
            
            // Redirect after short delay
            setTimeout(() => {
                if (userData.isFirstLogin) {
                    navigate('/first-login');
                } else {
                    navigate('/dashboard');
                }
            }, 100);
        } catch (err) {
            console.error('Login error:', err);
            
            if (err.response) {
                console.error('Response status:', err.response.status);
                console.error('Response data:', err.response.data);
                setError(err.response.data?.error || 'Login failed. Please check your credentials.');
            } else if (err.message === 'Network Error') {
                setError('Unable to connect to the server. Please check your connection.');
                console.error('Network error details:', err);
            } else {
                setError('An unexpected error occurred. Please try again.');
                console.error('Unexpected error details:', err);
            }
            
            setLoading(false);
        }
    };

    // Function to handle admin direct login with preset credentials
    const handleAdminLogin = async (useExistingCredentials = false) => {
        if (!useExistingCredentials) {
            setUsername('admin');
            setPassword('admin');
        }
        
        setLoading(true);
        setError('');
        
        try {
            console.log('Using admin direct login endpoint');
            
            // Use the special admin-login endpoint that bypasses rate limiting
            const adminLoginUrl = `${API_CONFIG.BASE_URL}${API_CONFIG.AUTH_ENDPOINT}/admin-login`;
            console.log('Admin login endpoint:', adminLoginUrl);
            
            // Password can be either 'admin' or 'adminadmin'
            const providedPassword = useExistingCredentials ? password : 'admin';
            
            console.log('Attempting login with admin and password:', providedPassword);
            
            try {
                // First try with the provided password
                const response = await axios.post(adminLoginUrl, { 
                    username: 'admin',
                    password: providedPassword,
                    timestamp: new Date().getTime()
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Cache-Control': 'no-cache'
                    }
                });
                
                console.log('Admin login response received');
                
                if (!response.data || !response.data.token) {
                    console.error('Invalid response format:', response.data);
                    throw new Error('No token received from server');
                }
                
                // Store token and user details
                localStorage.setItem('token', response.data.token);
                
                const userData = response.data.user || {
                    username: 'admin',
                    role: 'Admin',
                    isFirstLogin: false
                };
                
                localStorage.setItem('user', JSON.stringify(userData));
                
                console.log('Admin login successful');
                console.log('Token saved, length:', response.data.token.length);
                
                // Try loading dashboard directly
                window.location.href = '/dashboard';
                
            } catch (error) {
                console.log('Admin login attempt failed:', error.message);
                
                // If first attempt fails and we're using 'admin', try 'adminadmin'
                if (providedPassword === 'admin') {
                    console.log('Admin login with short password failed, trying longer password');
                    try {
                        const response = await axios.post(adminLoginUrl, { 
                            username: 'admin',
                            password: 'adminadmin',
                            timestamp: new Date().getTime()
                        }, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Cache-Control': 'no-cache'
                            }
                        });
                        
                        if (!response.data || !response.data.token) {
                            throw new Error('No token received from server');
                        }
                        
                        // Store token and user details
                        localStorage.setItem('token', response.data.token);
                        
                        const userData = response.data.user || {
                            username: 'admin',
                            role: 'Admin',
                            isFirstLogin: false
                        };
                        
                        localStorage.setItem('user', JSON.stringify(userData));
                        
                        console.log('Admin login successful with longer password');
                        console.log('Token saved, length:', response.data.token.length);
                        
                        // Try loading dashboard directly
                        window.location.href = '/dashboard';
                        return;
                    } catch (secondError) {
                        console.error('Both admin login attempts failed');
                        throw secondError;
                    }
                }
                throw error;
            }
            return true;
        } catch (err) {
            console.error('Admin login error:', err);
            
            if (err.response) {
                console.error('Response status:', err.response.status);
                console.error('Response data:', err.response.data);
                setError(err.response.data?.error || 'Admin login failed. Please try again.');
            } else if (err.request) {
                console.error('No response received:', err.request);
                setError('No response from server. Please check if the backend is running.');
            } else {
                setError('An unexpected error occurred during admin login: ' + err.message);
                console.error('Unexpected error during admin login:', err);
            }
            
            setLoading(false);
            return false;
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
                                        
                                        <Button
                                            variant="outlined"
                                            fullWidth
                                            sx={{ mb: 2 }}
                                            onClick={() => handleAdminLogin(false)}
                                            disabled={loading}
                                        >
                                            Quick Admin Login
                                        </Button>
                                        
                                        <Typography variant="body2" color="textSecondary" align="center">
                                            Admin login: username 'admin', password 'admin' or 'adminadmin'
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