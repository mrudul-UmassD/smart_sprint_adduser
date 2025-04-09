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
} from '@mui/material';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
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
            const response = await axios.get('http://localhost:5001/api/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleOpen = (user = null) => {
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
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            if (selectedUser) {
                await axios.patch(
                    `http://localhost:5001/api/users/${selectedUser._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post('http://localhost:5001/api/users', formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            handleClose();
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleDelete = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Users</Typography>
                <Button variant="contained" onClick={() => handleOpen()}>
                    Add User
                </Button>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Username</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Team</TableCell>
                            <TableCell>Level</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user._id}>
                                <TableCell>{user.username}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>{user.team}</TableCell>
                                <TableCell>{user.level}</TableCell>
                                <TableCell>
                                    <Button onClick={() => handleOpen(user)}>Edit</Button>
                                    <Button
                                        color="error"
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

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    {selectedUser ? 'Edit User' : 'Add New User'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Username"
                        fullWidth
                        value={formData.username}
                        onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                        }
                    />
                    <TextField
                        margin="dense"
                        select
                        label="Role"
                        fullWidth
                        value={formData.role}
                        onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                        }
                    >
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="Project Manager">Project Manager</MenuItem>
                        <MenuItem value="Developer">Developer</MenuItem>
                    </TextField>
                    <TextField
                        margin="dense"
                        select
                        label="Team"
                        fullWidth
                        value={formData.team}
                        onChange={(e) =>
                            setFormData({ ...formData, team: e.target.value })
                        }
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedUser ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserList; 