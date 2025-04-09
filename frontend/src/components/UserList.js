import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    FormControl,
    InputLabel,
    Select,
    IconButton,
    FormHelperText,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import API_CONFIG from '../config';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        role: '',
        team: 'None',
        level: 'Dev',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_CONFIG.BASE_URL}${API_CONFIG.USERS_ENDPOINT}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleOpen = (user = null) => {
        setErrorMessage('');
        if (user) {
            setSelectedUser(user);
            setFormData({
                username: user.username,
                role: user.role,
                team: user.team,
                level: user.level,
            });
        } else {
            setSelectedUser(null);
            setFormData({
                username: '',
                role: '',
                team: 'None',
                level: 'Dev',
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedUser(null);
        setErrorMessage('');
    };

    const handleRoleChange = (e) => {
        const selectedRole = e.target.value;
        
        if (selectedRole === 'Admin' || selectedRole === 'Project Manager') {
            setFormData({
                ...formData,
                role: selectedRole,
                team: selectedRole === 'Admin' ? 'admin' : 'pm',
                level: selectedRole === 'Admin' ? 'admin' : 'pm'
            });
        } else {
            setFormData({
                ...formData,
                role: selectedRole
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Check if required fields are filled
            if (!formData.username || !formData.role) {
                setErrorMessage('Username and Role are required fields');
                return;
            }

            // For regular users, ensure team and level are selected
            if (formData.role !== 'Admin' && formData.role !== 'Project Manager') {
                if (!formData.team || !formData.level) {
                    setErrorMessage('Team and Level are required for regular users');
                    return;
                }
            }

            const token = localStorage.getItem('token');
            
            if (selectedUser) {
                await axios.put(`${API_CONFIG.BASE_URL}${API_CONFIG.USERS_ENDPOINT}/${selectedUser._id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.USERS_ENDPOINT}`, formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }

            handleClose();
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            setErrorMessage(error.response?.data?.error || 'Error saving user');
        }
    };

    const handleDelete = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_CONFIG.BASE_URL}${API_CONFIG.USERS_ENDPOINT}/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // Helper function to get appropriate badge color based on role
    const getRoleBadgeColor = (role) => {
        switch(role) {
            case 'Admin': return 'danger';
            case 'Project Manager': return 'warning';
            case 'Developer': return 'primary';
            default: return 'secondary';
        }
    };

    // Helper function to get appropriate badge color based on team
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

    return (
        <Container fluid className="p-4">
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <Row className="align-items-center mb-3">
                        <Col>
                            <h2 className="mb-0">User Management</h2>
                        </Col>
                        <Col className="text-end">
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={() => handleOpen()}
                                className="rounded-pill px-4"
                            >
                                Add User
                            </Button>
                        </Col>
                    </Row>
                    
                    <TableContainer component={Paper} className="shadow-sm">
                        <Table striped hover responsive>
                            <TableHead className="bg-light">
                                <TableRow>
                                    <TableCell><strong>Username</strong></TableCell>
                                    <TableCell><strong>Role</strong></TableCell>
                                    <TableCell><strong>Team</strong></TableCell>
                                    <TableCell><strong>Level</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id} hover>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>
                                            <Badge bg={getRoleBadgeColor(user.role)} pill>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge bg={getTeamBadgeColor(user.team)} pill>
                                                {user.team}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{user.level}</TableCell>
                                        <TableCell>
                                            <Button 
                                                variant="outlined" 
                                                size="small" 
                                                onClick={() => handleOpen(user)}
                                                className="me-2"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDelete(user._id)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card.Body>
            </Card>

            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle className="bg-light">
                    {selectedUser ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogContent className="p-4">
                    {errorMessage && (
                        <Alert severity="error" className="mb-3">
                            {errorMessage}
                        </Alert>
                    )}
                    <TextField
                        margin="dense"
                        label="Username"
                        fullWidth
                        value={formData.username}
                        onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                        }
                        className="mb-3"
                    />
                    <TextField
                        margin="dense"
                        select
                        label="Role"
                        fullWidth
                        value={formData.role}
                        onChange={handleRoleChange}
                        className="mb-3"
                    >
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="Project Manager">Project Manager</MenuItem>
                        <MenuItem value="Developer">Developer</MenuItem>
                    </TextField>
                    
                    {formData.role === 'Developer' && (
                        <>
                            <TextField
                                margin="dense"
                                select
                                label="Team"
                                fullWidth
                                value={formData.team}
                                onChange={(e) =>
                                    setFormData({ ...formData, team: e.target.value })
                                }
                                className="mb-3"
                            >
                                <MenuItem value="None">None</MenuItem>
                                <MenuItem value="Design">Design</MenuItem>
                                <MenuItem value="Database">Database</MenuItem>
                                <MenuItem value="Backend">Backend</MenuItem>
                                <MenuItem value="Frontend">Frontend</MenuItem>
                                <MenuItem value="DevOps">DevOps</MenuItem>
                                <MenuItem value="Tester/Security">Tester/Security</MenuItem>
                            </TextField>
                            <TextField
                                margin="dense"
                                select
                                label="Level"
                                fullWidth
                                value={formData.level}
                                onChange={(e) =>
                                    setFormData({ ...formData, level: e.target.value })
                                }
                            >
                                <MenuItem value="Lead">Lead</MenuItem>
                                <MenuItem value="Senior">Senior</MenuItem>
                                <MenuItem value="Dev">Dev</MenuItem>
                                <MenuItem value="Junior">Junior</MenuItem>
                            </TextField>
                        </>
                    )}
                </DialogContent>
                <DialogActions className="p-3">
                    <Button onClick={handleClose} variant="outlined">Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedUser ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default UserList; 