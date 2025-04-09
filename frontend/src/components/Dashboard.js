import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Paper,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';

const Dashboard = () => {
    const [userDetails, setUserDetails] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/users/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUserDetails(response.data);
        } catch (error) {
            console.error('Error fetching user details:', error);
            navigate('/login');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!userDetails) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Dashboard</Typography>
                <Button variant="contained" color="error" onClick={handleLogout}>
                    Logout
                </Button>
            </Box>
            <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
                <Typography variant="h5" gutterBottom>
                    User Details
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText
                            primary="Username"
                            secondary={userDetails.username}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Role"
                            secondary={userDetails.role}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Team"
                            secondary={userDetails.team}
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Level"
                            secondary={userDetails.level}
                        />
                    </ListItem>
                </List>
            </Paper>
        </Box>
    );
};

export default Dashboard; 