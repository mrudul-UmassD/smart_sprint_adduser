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

const Login = () => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5001/api/auth/login', { username });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <Container component="main" maxWidth="xs" className="mt-5">
            <Row className="justify-content-center">
                <Col xs={12} md={10} lg={8}>
                    <Card className="shadow-lg border-0">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <Image 
                                    src="/logo192.png" 
                                    alt="Smart Sprint Logo" 
                                    width={80} 
                                    className="mb-3"
                                />
                                <Typography component="h1" variant="h4" className="fw-bold">
                                    Smart Sprint
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" className="mb-4">
                                    Team Management Portal
                                </Typography>
                            </div>
                            
                            {error && (
                                <Alert severity="error" className="mb-4">
                                    {error}
                                </Alert>
                            )}
                            
                            <Box component="form" onSubmit={handleSubmit}>
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
                                    className="mb-4"
                                    variant="outlined"
                                />
                                
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    className="py-3 text-white"
                                    sx={{ 
                                        mt: 2, 
                                        mb: 2,
                                        fontSize: '1rem',
                                        backgroundColor: '#1976d2',
                                        '&:hover': {
                                            backgroundColor: '#1565c0',
                                        }
                                    }}
                                >
                                    Sign In
                                </Button>
                            </Box>
                            
                            <div className="text-center mt-4">
                                <Typography variant="body2" color="text.secondary">
                                    Default admin account: "admin"
                                </Typography>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login; 