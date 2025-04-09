import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Typography,
    TextField,
    Button,
    Box,
    Paper,
    Avatar,
    IconButton,
    Divider,
    Alert,
    Grid,
    Card,
} from '@mui/material';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import {
    Edit as EditIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import API_CONFIG from '../config';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [passwordMode, setPasswordMode] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`${API_CONFIG.USERS_ENDPOINT}/me`);
            setUser(response.data);
            setFormData({
                fullName: response.data.fullName || '',
                email: response.data.email || '',
            });
        } catch (err) {
            console.error('Error fetching user details:', err);
            setError(err.response?.data?.error || 'Failed to fetch user details');
            if (err.response?.status === 401) {
                setTimeout(() => {
                    localStorage.removeItem('token');
                    navigate('/login');
                }, 2000);
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value,
        });
    };

    const handleSaveProfile = async () => {
        try {
            const response = await axios.patch(`${API_CONFIG.USERS_ENDPOINT}/${user._id}`, formData);
            setUser(response.data);
            setEditMode(false);
            setSuccess('Profile updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.error || 'Failed to update profile');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match');
            setTimeout(() => setError(''), 3000);
            return;
        }

        try {
            await axios.post(`${API_CONFIG.AUTH_ENDPOINT}/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });
            setPasswordMode(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
            setSuccess('Password changed successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error changing password:', err);
            setError(err.response?.data?.error || 'Failed to change password');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleProfilePictureClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        try {
            const response = await axios.post(`${API_CONFIG.USERS_ENDPOINT}/profile-picture`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUser((prevUser) => ({
                ...prevUser,
                profilePicture: response.data.profilePicture,
            }));
            setSuccess('Profile picture updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error uploading profile picture:', err);
            setError(err.response?.data?.error || 'Failed to upload profile picture');
            setTimeout(() => setError(''), 3000);
        }
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
            case 'Frontend': return 'success';
            case 'Backend': return 'info';
            case 'Design': return 'danger';
            case 'Testing': return 'warning';
            default: return 'secondary';
        }
    };

    if (!user) {
        return (
            <Container className="py-5">
                <div className="text-center">
                    <Typography variant="h5">Loading user profile...</Typography>
                </div>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {error && (
                <Alert severity="error" className="mb-4">
                    {error}
                </Alert>
            )}
            {success && (
                <Alert severity="success" className="mb-4">
                    {success}
                </Alert>
            )}
            <Box sx={{ mb: 4 }}>
                <Card className="shadow-sm">
                    <Row className="g-0">
                        {/* Profile sidebar */}
                        <Col xs={12} md={4} className="border-end p-4 text-center">
                            <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                                <Avatar
                                    src={user.profilePicture ? `${API_CONFIG.BASE_URL}${user.profilePicture}` : null}
                                    sx={{ width: 120, height: 120, mx: 'auto' }}
                                />
                                <IconButton
                                    color="primary"
                                    aria-label="upload picture"
                                    component="span"
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        bgcolor: 'white',
                                    }}
                                    onClick={handleProfilePictureClick}
                                >
                                    <PhotoCameraIcon />
                                </IconButton>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </Box>
                            <Typography variant="h6" className="mb-1">{user?.username}</Typography>
                            <Badge bg={getRoleBadgeColor(user?.role)} className="mb-2">{user?.role}</Badge>
                            {user?.team !== 'admin' && user?.team !== 'pm' && (
                                <div className="mb-1">
                                    <Badge bg={getTeamBadgeColor(user?.team)} className="me-1">Team: {user?.team}</Badge>
                                </div>
                            )}
                            {user?.level !== 'admin' && user?.level !== 'pm' && (
                                <div>
                                    <Badge bg="secondary">Level: {user?.level}</Badge>
                                </div>
                            )}
                        </Col>

                        {/* Profile details */}
                        <Col xs={12} md={8}>
                            <div className="p-4">
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6">Profile Information</Typography>
                                    {!editMode ? (
                                        <Button
                                            variant="outlined"
                                            startIcon={<EditIcon />}
                                            onClick={() => {
                                                setEditMode(true);
                                                setPasswordMode(false);
                                            }}
                                        >
                                            Edit Profile
                                        </Button>
                                    ) : (
                                        <Box>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<SaveIcon />}
                                                onClick={handleSaveProfile}
                                                sx={{ mr: 1 }}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<CloseIcon />}
                                                onClick={() => {
                                                    setEditMode(false);
                                                    setFormData({
                                                        fullName: user?.fullName || '',
                                                        email: user?.email || '',
                                                    });
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                {editMode ? (
                                    <Box component="form">
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="Full Name"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleInputChange}
                                        />
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="Email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                    </Box>
                                ) : (
                                    <Box>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Full Name:</strong> {user?.fullName || 'Not set'}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Email:</strong> {user?.email || 'Not set'}
                                        </Typography>
                                        <Typography variant="body1" sx={{ mb: 1 }}>
                                            <strong>Account Created:</strong>{' '}
                                            {new Date(user?.createdAt).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                )}
                            </div>

                            {/* Password section */}
                            <div className="p-4 pt-0">
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6">Password</Typography>
                                    {!passwordMode ? (
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<EditIcon />}
                                            onClick={() => {
                                                setPasswordMode(true);
                                                setEditMode(false);
                                            }}
                                        >
                                            Change Password
                                        </Button>
                                    ) : (
                                        <Box>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<SaveIcon />}
                                                onClick={handleChangePassword}
                                                sx={{ mr: 1 }}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                startIcon={<CloseIcon />}
                                                onClick={() => {
                                                    setPasswordMode(false);
                                                    setPasswordData({
                                                        currentPassword: '',
                                                        newPassword: '',
                                                        confirmPassword: '',
                                                    });
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                                <Divider sx={{ mb: 2 }} />
                                {passwordMode ? (
                                    <Box component="form">
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="Current Password"
                                            name="currentPassword"
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                        />
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="New Password"
                                            name="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                        />
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="Confirm New Password"
                                            name="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                        />
                                    </Box>
                                ) : (
                                    <Typography variant="body1">
                                        For security reasons, your password is not displayed here.
                                    </Typography>
                                )}
                            </div>
                        </Col>
                    </Row>
                </Card>
            </Box>
        </Container>
    );
};

export default UserProfile; 