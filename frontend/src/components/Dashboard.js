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
    Alert,
} from '@mui/material';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { Person, Work, EmojiEvents, Group } from '@mui/icons-material';
import API_CONFIG from '../config';

const Dashboard = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError('Authentication required');
            setTimeout(() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }, 2000);
            return;
        }

        try {
            const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.USERS_ENDPOINT}/me`, {
                headers: {
                    'x-auth-token': token
                }
            });
            setUserDetails(response.data);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to fetch user details';
            setError(errorMsg);
            
            // If we get an authentication error, clear token and redirect to login
            if (err.response?.status === 401 || errorMsg.toLowerCase().includes('auth') || errorMsg.toLowerCase().includes('token')) {
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/login');
                }, 2000);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Helper function to get badge color based on role
    const getRoleBadgeColor = (role) => {
        switch(role) {
            case 'Admin': return 'danger';
            case 'Project Manager': return 'warning';
            case 'Developer': return 'primary';
            default: return 'secondary';
        }
    };

    // Helper function to get badge color based on team
    const getTeamBadgeColor = (team) => {
        switch(team) {
            case 'Design': return 'info';
            case 'Database': return 'dark';
            case 'Backend': return 'success';
            case 'Frontend': return 'primary';
            case 'DevOps': return 'danger';
            case 'Tester/Security': return 'warning';
            case 'admin': return 'danger';
            case 'pm': return 'warning';
            default: return 'secondary';
        }
    };

    if (error) {
        return (
            <Container className="mt-5">
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!userDetails) {
        return (
            <Container className="mt-5 text-center">
                <Typography>Loading user details...</Typography>
            </Container>
        );
    }

    return (
        <Container fluid className="p-4">
            <Row>
                <Col lg={8} className="mx-auto">
                    <Card className="shadow mb-4">
                        <Card.Header className="bg-primary text-white py-3">
                            <Row className="align-items-center">
                                <Col>
                                    <h4 className="m-0">User Dashboard</h4>
                                </Col>
                                <Col className="text-end">
                                    <Button 
                                        variant="contained" 
                                        color="error" 
                                        onClick={handleLogout}
                                        className="rounded-pill"
                                    >
                                        Logout
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Header>
                        
                        <Card.Body className="p-4">
                            <Row className="mb-4">
                                <Col className="text-center">
                                    <div className="p-3 bg-light rounded mb-3">
                                        <Person className="text-primary" style={{ fontSize: 64 }} />
                                    </div>
                                    <Typography variant="h4">{userDetails.username}</Typography>
                                    <Badge bg={getRoleBadgeColor(userDetails.role)} className="mt-2 px-3 py-2">
                                        {userDetails.role}
                                    </Badge>
                                </Col>
                            </Row>
                            
                            <Row className="mt-4">
                                <Col md={4} className="mb-3">
                                    <Card className="h-100 bg-light">
                                        <Card.Body className="text-center">
                                            <Work className="text-info mb-3" style={{ fontSize: 40 }} />
                                            <Typography variant="h6">Team</Typography>
                                            <Badge bg={getTeamBadgeColor(userDetails.team)} className="mt-2">
                                                {userDetails.team}
                                            </Badge>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                
                                <Col md={4} className="mb-3">
                                    <Card className="h-100 bg-light">
                                        <Card.Body className="text-center">
                                            <EmojiEvents className="text-warning mb-3" style={{ fontSize: 40 }} />
                                            <Typography variant="h6">Level</Typography>
                                            <Typography variant="body1" className="mt-2">
                                                {userDetails.level}
                                            </Typography>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                
                                <Col md={4} className="mb-3">
                                    <Card className="h-100 bg-light">
                                        <Card.Body className="text-center">
                                            <Group className="text-success mb-3" style={{ fontSize: 40 }} />
                                            <Typography variant="h6">Account Created</Typography>
                                            <Typography variant="body1" className="mt-2">
                                                {new Date(userDetails.createdAt).toLocaleDateString()}
                                            </Typography>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                            
                            {userDetails.role === 'Admin' || userDetails.role === 'Project Manager' ? (
                                <div className="mt-4 text-center">
                                    <Button 
                                        variant="contained" 
                                        color="primary"
                                        onClick={() => navigate('/users')}
                                        className="px-4 me-3"
                                    >
                                        Manage Users
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        color="secondary"
                                        onClick={() => navigate('/projects')}
                                        className="px-4"
                                    >
                                        Manage Projects
                                    </Button>
                                </div>
                            ) : (
                                <div className="mt-4 text-center">
                                    <Button 
                                        variant="contained" 
                                        color="primary"
                                        onClick={() => navigate('/projects')}
                                        className="px-4"
                                    >
                                        View My Projects
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard; 