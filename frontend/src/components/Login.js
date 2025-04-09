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
            console.log('Attempting login with username:', username);
            const response = await axios.post(`${API_CONFIG.AUTH_ENDPOINT}/login`, { 
                username,
                password
            });
            console.log('Login successful, response:', response.data);
            
            // Store the token and user details
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            // Set default auth headers for all future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            axios.defaults.headers.common['x-auth-token'] = response.data.token;
            
            // Check if it's the user's first login
            if (response.data.user.isFirstLogin) {
                navigate('/first-login');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
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