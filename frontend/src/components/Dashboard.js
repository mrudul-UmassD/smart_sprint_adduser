import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    Alert as MuiAlert,
    CircularProgress,
} from '@mui/material';
import { Container, Row, Col, Card, Badge, ProgressBar, Button, Alert, Spinner } from 'react-bootstrap';
import { 
    Person as PersonIcon, 
    Group as GroupIcon, 
    Folder as FolderOpenIcon,
    AccountCircle as AccountCircleIcon,
    Work, 
    EmojiEvents, 
    Assignment, 
    Timeline, 
    DeveloperMode,
    Dashboard as DashboardIcon
} from '@mui/icons-material';
import API_CONFIG from '../config';

const Dashboard = () => {
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check for debug mode in URL
        const params = new URLSearchParams(location.search);
        const debugMode = params.get('debug') === 'true';
        
        if (debugMode) {
            console.log('Debug mode enabled, skipping authentication checks');
            // Set some dummy user data for testing
            setUserDetails({
                username: 'admin',
                role: 'Admin',
                team: 'Management',
                level: 'Senior'
            });
            return;
        }
        
        fetchUserDetails();
    }, [navigate, location]);

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
            setLoading(true);
            // Use AUTH_ENDPOINT for fetching user details without manually setting headers
            // as they're already added by axios interceptors
            const response = await axios.get(`${API_CONFIG.AUTH_ENDPOINT}/me`);
            
            if (response.data && response.data.success && response.data.user) {
                setUserDetails(response.data.user);
            } else {
                throw new Error('Invalid response format');
            }
            
            setLoading(false);
        } catch (err) {
            console.error('Error fetching user details:', err);
            
            // Try using stored user data as fallback
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const userData = JSON.parse(userStr);
                    console.log('Using stored user data as fallback:', userData);
                    setUserDetails(userData);
                    setLoading(false);
                    return;
                } catch (parseErr) {
                    console.error('Error parsing stored user data:', parseErr);
                }
            }
            
            const errorMsg = err.response?.data?.error || 'Failed to fetch user details';
            setError(errorMsg);
            setLoading(false);
            
            if (err.response?.status === 401) {
                console.error('Authentication failed, redirecting to login');
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
                <Alert variant="danger">{error}</Alert>
            </Container>
        );
    }

    if (loading || !userDetails) {
        return (
            <Container className="mt-5 text-center">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading your dashboard...</p>
            </Container>
        );
    }

    return (
        <Container fluid className="p-4">
            <Row>
                <Col lg={10} className="mx-auto">
                    <Card className="shadow-lg border-0 rounded-3 overflow-hidden">
                        <Card.Header className="py-4" style={{ 
                            background: 'linear-gradient(135deg, #0062cc 0%, #4d8fda 100%)',
                            borderBottom: 0
                        }}>
                            <Row className="align-items-center">
                                <Col md={8}>
                                    <div className="d-flex align-items-center">
                                        <DashboardIcon className="text-white me-3" style={{ fontSize: 36 }} />
                                        <div>
                                            <h4 className="m-0 text-white fw-bold">Welcome, {userDetails.username}!</h4>
                                            <p className="text-white-50 m-0 mt-1">
                                                {userDetails.role} • {userDetails.team}
                                            </p>
                                        </div>
                                    </div>
                                </Col>
                                <Col md={4} className="text-end">
                                    <Button 
                                        variant="outline-light" 
                                        onClick={handleLogout}
                                        className="rounded-pill px-4"
                                    >
                                        Logout
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Header>
                        
                        <Card.Body className="px-4 py-5">
                            <Row>
                                <Col md={6} lg={4} className="mb-4">
                                    <Card className="h-100 border-0 shadow-sm">
                                        <Card.Body>
                                            <h6 className="text-uppercase text-muted mb-3">Profile Info</h6>
                                            <div className="d-flex align-items-center mb-3">
                                                <div className="bg-light rounded-circle p-3 me-3">
                                                    <PersonIcon className="text-primary" />
                                                </div>
                                                <div>
                                                    <h5 className="mb-0">{userDetails.username}</h5>
                                                    <small className="text-muted">{userDetails.email || 'No email provided'}</small>
                                                </div>
                                            </div>
                                            <hr />
                                            <Row className="g-3">
                                                <Col xs={6}>
                                                    <div className="mb-0">
                                                        <small className="text-muted d-block">Role</small>
                                                        <Badge 
                                                            bg={getRoleBadgeColor(userDetails.role)} 
                                                            className="mt-1"
                                                        >
                                                            {userDetails.role}
                                                        </Badge>
                                                    </div>
                                                </Col>
                                                <Col xs={6}>
                                                    <div className="mb-0">
                                                        <small className="text-muted d-block">Team</small>
                                                        <Badge 
                                                            bg={getTeamBadgeColor(userDetails.team)} 
                                                            className="mt-1"
                                                        >
                                                            {userDetails.team}
                                                        </Badge>
                                                    </div>
                                                </Col>
                                                {userDetails.level && (
                                                    <Col xs={6}>
                                                        <div className="mb-0">
                                                            <small className="text-muted d-block">Level</small>
                                                            <span className="d-block">{userDetails.level}</span>
                                                        </div>
                                                    </Col>
                                                )}
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={6} lg={8} className="mb-4">
                                    <Card className="h-100 border-0 shadow-sm">
                                        <Card.Body>
                                            <h6 className="text-uppercase text-muted mb-3">Quick Actions</h6>
                                            <Row className="g-3">
                                                {(userDetails.role === 'Admin' || userDetails.role === 'Project Manager') && (
                                                    <Col xs={12} sm={6} xl={4}>
                                                        <Button 
                                                            variant="primary" 
                                                            className="w-100 d-flex align-items-center justify-content-center py-3"
                                                            onClick={() => navigate('/users')}
                                                        >
                                                            <GroupIcon className="me-2" />
                                                            Manage Users
                                                        </Button>
                                                    </Col>
                                                )}
                                                <Col xs={12} sm={6} xl={4}>
                                                    <Button 
                                                        variant="outline-primary" 
                                                        className="w-100 d-flex align-items-center justify-content-center py-3"
                                                        onClick={() => navigate('/projects')}
                                                    >
                                                        <FolderOpenIcon className="me-2" />
                                                        View Projects
                                                    </Button>
                                                </Col>
                                                <Col xs={12} sm={6} xl={4}>
                                                    <Button 
                                                        variant="outline-primary" 
                                                        className="w-100 d-flex align-items-center justify-content-center py-3"
                                                        onClick={() => navigate('/profile')}
                                                    >
                                                        <PersonIcon className="me-2" />
                                                        Edit Profile
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <style jsx>{`
                .hover-elevate:hover {
                    transform: translateY(-5px);
                    transition: transform 0.3s ease;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
                }
                .hover-elevate {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
            `}</style>
        </Container>
    );
};

export default Dashboard; 