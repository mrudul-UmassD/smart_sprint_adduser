import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import {
    Box,
    Typography,
    Button,
    TextField,
    Container,
    Paper,
    Card,
    Alert
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import API_CONFIG from '../config';

const FirstLogin = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validate passwords
        if (!password || !confirmPassword) {
            setError('Please enter both fields');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        if (password.length < 4) {
            setError('Password should be at least 4 characters long');
            return;
        }
        
        setLoading(true);
        
        try {
            await axios.post(`${API_CONFIG.AUTH_ENDPOINT}/first-password`, {
                newPassword: password
            });
            
            // Update the isFirstLogin property in local storage
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                user.isFirstLogin = false;
                localStorage.setItem('user', JSON.stringify(user));
            }
            
            navigate('/dashboard');
        } catch (err) {
            console.error('Error setting new password:', err);
            setError(err.response?.data?.error || 'Failed to set new password. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Card sx={{ padding: 4, borderRadius: 2, boxShadow: 3, width: '100%' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <LockOutlined sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                        <Typography component="h1" variant="h5" gutterBottom>
                            Set New Password
                        </Typography>
                        <Typography variant="body2" color="textSecondary" align="center" sx={{ mb: 3 }}>
                            This is your first login. Please set a new password to continue.
                        </Typography>
                        
                        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
                        
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="New Password"
                                type="password"
                                id="password"
                                autoFocus
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? 'Setting Password...' : 'Set Password'}
                            </Button>
                        </Box>
                    </Box>
                </Card>
            </Box>
        </Container>
    );
};

export default FirstLogin; 