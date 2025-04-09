import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    IconButton,
    Alert,
    Tabs,
    Tab
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    PersonAdd as PersonAddIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { Container, Row, Col, Card, Badge, ListGroup, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [projectRequests, setProjectRequests] = useState([]);
    const [open, setOpen] = useState(false);
    const [memberDialogOpen, setMemberDialogOpen] = useState(false);
    const [requestDialogOpen, setRequestDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [memberData, setMemberData] = useState({
        userId: '',
        role: 'Developer'
    });
    const [requestData, setRequestData] = useState({
        userId: ''
    });
    const navigate = useNavigate();
    const [userRole, setUserRole] = useState('');
    const [expandedProject, setExpandedProject] = useState(null);
    const [requestsLoading, setRequestsLoading] = useState({});

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setUserRole(user.role);
        }
        fetchProjects();
        if (user && (user.role === 'Admin' || user.role === 'Project Manager')) {
            fetchUsers();
        }
        
        if (user && user.role === 'Admin') {
            fetchProjectRequests();
        }
        
        if (user && user.role === 'Project Manager') {
            fetchMyProjectRequests();
        }
    }, []);

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/projects', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects:', error);
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        }
    };

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

    const fetchProjectRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/projects/admin/project-requests', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjectRequests(response.data);
        } catch (error) {
            console.error('Error fetching project requests:', error);
        }
    };

    const fetchMyProjectRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/projects/my-project-requests', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProjectRequests(response.data);
        } catch (error) {
            console.error('Error fetching my project requests:', error);
        }
    };

    const handleOpen = (project = null) => {
        if (project) {
            setFormData({
                name: project.name,
                description: project.description
            });
            setSelectedProject(project);
        } else {
            setFormData({
                name: '',
                description: ''
            });
            setSelectedProject(null);
        }
        setErrorMessage('');
        setOpen(true);
    };

    const handleMemberDialogOpen = (project) => {
        setSelectedProject(project);
        setMemberData({
            userId: '',
            role: 'Developer'
        });
        setErrorMessage('');
        setMemberDialogOpen(true);
    };

    const handleRequestDialogOpen = (project) => {
        setSelectedProject(project);
        setRequestData({
            userId: ''
        });
        setErrorMessage('');
        setRequestDialogOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedProject(null);
        setErrorMessage('');
    };

    const handleMemberDialogClose = () => {
        setMemberDialogOpen(false);
        setErrorMessage('');
    };

    const handleRequestDialogClose = () => {
        setRequestDialogOpen(false);
        setErrorMessage('');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleMemberDataChange = (e) => {
        setMemberData({
            ...memberData,
            [e.target.name]: e.target.value
        });
    };

    const handleRequestDataChange = (e) => {
        setRequestData({
            ...requestData,
            [e.target.name]: e.target.value
        });
    };

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    const toggleProjectExpand = (projectId) => {
        if (expandedProject === projectId) {
            setExpandedProject(null);
        } else {
            setExpandedProject(projectId);
        }
    };

    const handleSubmit = async () => {
        try {
            // Validation
            if (!formData.name) {
                setErrorMessage('Project name is required');
                return;
            }
            
            const token = localStorage.getItem('token');
            if (selectedProject) {
                await axios.patch(
                    `http://localhost:5001/api/projects/${selectedProject._id}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                await axios.post('http://localhost:5001/api/projects', formData, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                
                // Refresh project requests for Project Manager
                if (userRole === 'Project Manager') {
                    fetchMyProjectRequests();
                }
            }
            handleClose();
            fetchProjects();
        } catch (error) {
            console.error('Error saving project:', error);
            setErrorMessage(error.response?.data?.error || 'Error saving project');
        }
    };

    const handleDelete = async (projectId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchProjects();
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const handleAddMember = async () => {
        try {
            // Validation
            if (!memberData.userId) {
                setErrorMessage('User is required');
                return;
            }
            if (!memberData.role) {
                setErrorMessage('Role is required');
                return;
            }
            
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5001/api/projects/${selectedProject._id}/members`,
                memberData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            handleMemberDialogClose();
            fetchProjects();
        } catch (error) {
            console.error('Error adding member:', error);
            setErrorMessage(error.response?.data?.error || 'Error adding member');
        }
    };

    const handleRemoveMember = async (projectId, userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/projects/${projectId}/members/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchProjects();
        } catch (error) {
            console.error('Error removing member:', error);
        }
    };

    const handleAddRequest = async () => {
        try {
            // Validation
            if (!requestData.userId) {
                setErrorMessage('User is required');
                return;
            }
            
            const token = localStorage.getItem('token');
            await axios.post(
                `http://localhost:5001/api/projects/${selectedProject._id}/requests`,
                requestData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            handleRequestDialogClose();
            fetchProjects();
        } catch (error) {
            console.error('Error sending request:', error);
            setErrorMessage(error.response?.data?.error || 'Error sending request');
        }
    };

    const handleRequestAction = async (projectId, requestId, status) => {
        try {
            setRequestsLoading({ ...requestsLoading, [requestId]: true });
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:5001/api/projects/${projectId}/requests/${requestId}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchProjects();
        } catch (error) {
            console.error('Error processing request:', error);
        } finally {
            setRequestsLoading({ ...requestsLoading, [requestId]: false });
        }
    };

    const handleProjectRequestAction = async (requestId, status) => {
        try {
            setRequestsLoading({ ...requestsLoading, [requestId]: true });
            const token = localStorage.getItem('token');
            await axios.patch(
                `http://localhost:5001/api/projects/admin/project-requests/${requestId}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchProjectRequests();
            fetchProjects();
        } catch (error) {
            console.error('Error processing project request:', error);
        } finally {
            setRequestsLoading({ ...requestsLoading, [requestId]: false });
        }
    };

    // Helper function to get user short description
    const getUserShortDescription = (user) => {
        if (user.role === 'Project Manager') return 'Project Manager';
        
        // For developers, combine team and level
        const teamDisplay = {
            'Backend': 'Backend',
            'Frontend': 'Frontend',
            'Database': 'DB',
            'Design': 'Design',
            'DevOps': 'DevOps',
            'Tester/Security': 'QA/Security'
        };
        
        const levelDisplay = {
            'Lead': 'Lead',
            'Senior': 'Senior',
            'Dev': '',
            'Junior': 'Junior'
        };
        
        const team = teamDisplay[user.team] || user.team;
        const level = levelDisplay[user.level] || '';
        
        // Format as "Backend Senior" or "Frontend Junior"
        return `${team} ${level}`.trim();
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
            case 'pm':
            case 'Project Manager': return 'warning';
            default: return 'secondary';
        }
    };

    // Helper function to get appropriate badge color based on request status
    const getStatusBadgeColor = (status) => {
        switch(status) {
            case 'Approved': return 'success';
            case 'Rejected': return 'danger';
            case 'Pending': return 'warning';
            default: return 'secondary';
        }
    };

    // Modified render for project members
    const renderProjectMembers = (project) => {
        if (!project.members || project.members.length === 0) {
            return <Alert severity="info">No members in this project yet.</Alert>;
        }
        
        // Filter out Admin users
        const filteredMembers = project.members.filter(member => 
            member.userId && member.userId.role !== 'Admin'
        );
        
        if (filteredMembers.length === 0) {
            return <Alert severity="info">No members in this project yet.</Alert>;
        }
        
        // Get unique teams from members
        const allTeams = ['Project Manager', 'Backend', 'Frontend', 'Database', 'Design', 'DevOps', 'Tester/Security'];
        
        // Sort members by level (seniority)
        const levelOrder = { 'Lead': 0, 'Senior': 1, 'Dev': 2, 'Junior': 3, 'pm': 4 };
        
        const sortedMembers = [...filteredMembers].sort((a, b) => {
            // Sort by team first
            const teamA = a.userId.team;
            const teamB = b.userId.team;
            
            // Project Managers come first
            if (a.userId.role === 'Project Manager' && b.userId.role !== 'Project Manager') return -1;
            if (a.userId.role !== 'Project Manager' && b.userId.role === 'Project Manager') return 1;
            
            // Then sort by level (seniority)
            return levelOrder[a.userId.level] - levelOrder[b.userId.level];
        });
        
        // Group by team
        const membersByTeam = {};
        allTeams.forEach(team => {
            membersByTeam[team] = [];
        });
        
        // Assign members to their teams
        sortedMembers.forEach(member => {
            if (member.userId.role === 'Project Manager') {
                membersByTeam['Project Manager'].push(member);
            } else {
                if (membersByTeam[member.userId.team]) {
                    membersByTeam[member.userId.team].push(member);
                }
            }
        });
        
        return (
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            {Object.keys(membersByTeam).map(team => 
                                membersByTeam[team].length > 0 && (
                                    <th key={team} className={`bg-${getTeamBadgeColor(team === 'Project Manager' ? 'pm' : team)} text-white`}>
                                        {team}
                                    </th>
                                )
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {Object.keys(membersByTeam).map(team => 
                                membersByTeam[team].length > 0 && (
                                    <td key={team} className="p-0">
                                        <ListGroup variant="flush">
                                            {membersByTeam[team].map(member => (
                                                <ListGroup.Item key={member.userId._id} className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <div>{member.userId.username}</div>
                                                        <small className="text-muted">
                                                            {getUserShortDescription(member.userId)}
                                                        </small>
                                                    </div>
                                                    {userRole === 'Admin' && (
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={() => handleRemoveMember(project._id, member.userId._id)}
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    </td>
                                )
                            )}
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <Container className="mt-4">
            <Card className="shadow-sm mb-4">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="m-0">Projects</h2>
                        {(userRole === 'Admin' || userRole === 'Project Manager') && (
                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<AddIcon />}
                                onClick={() => handleOpen()}
                            >
                                {userRole === 'Admin' ? 'Add Project' : 'Request Project'}
                            </Button>
                        )}
                    </div>

                    <Tabs 
                        value={selectedTab} 
                        onChange={handleTabChange}
                        className="mb-3"
                    >
                        <Tab label="All Projects" />
                        {userRole === 'Admin' && <Tab label="Pending Requests" />}
                        {userRole === 'Admin' && <Tab label="Project Requests" />}
                        {userRole === 'Project Manager' && <Tab label="My Project Requests" />}
                    </Tabs>

                    {selectedTab === 0 && (
                        <>
                            {projects.length === 0 ? (
                                <Alert severity="info">No projects found. {userRole === 'Admin' && 'Create a new project to get started.'}</Alert>
                            ) : (
                                projects.map((project) => (
                                    <Card key={project._id} className="mb-3 border">
                                        <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                                            <div className="fw-bold fs-5">{project.name}</div>
                                            <div>
                                                {userRole === 'Admin' && (
                                                    <>
                                                        <IconButton 
                                                            size="small" 
                                                            onClick={() => handleOpen(project)}
                                                            className="me-1"
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                        <IconButton 
                                                            size="small" 
                                                            color="error"
                                                            onClick={() => handleDelete(project._id)}
                                                            className="me-1"
                                                        >
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </>
                                                )}
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    onClick={() => toggleProjectExpand(project._id)}
                                                >
                                                    {expandedProject === project._id ? 'Hide Details' : 'View Details'}
                                                </Button>
                                            </div>
                                        </Card.Header>
                                        
                                        {expandedProject === project._id && (
                                            <Card.Body>
                                                <Row>
                                                    <Col md={6}>
                                                        <div className="mb-3">
                                                            <h5>Description</h5>
                                                            <p>{project.description}</p>
                                                        </div>

                                                        <div className="mb-3">
                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                <h5>Team Members</h5>
                                                                {(userRole === 'Admin' || userRole === 'Project Manager') && (
                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        startIcon={<PersonAddIcon />}
                                                                        onClick={userRole === 'Admin' 
                                                                            ? () => handleMemberDialogOpen(project)
                                                                            : () => handleRequestDialogOpen(project)}
                                                                    >
                                                                        {userRole === 'Admin' ? 'Add Member' : 'Request Member'}
                                                                    </Button>
                                                                )}
                                                            </div>

                                                            {renderProjectMembers(project)}
                                                        </div>
                                                    </Col>
                                                    
                                                    {userRole === 'Admin' && project.requests && project.requests.length > 0 && (
                                                        <Col md={6}>
                                                            <div className="mb-3">
                                                                <h5>Pending Requests</h5>
                                                                <ListGroup>
                                                                    {project.requests
                                                                        .filter(request => request.status === 'Pending')
                                                                        .map((request) => (
                                                                            <ListGroup.Item key={request._id} className="d-flex justify-content-between align-items-center">
                                                                                <div>
                                                                                    <div>
                                                                                        <strong>{request.userId.username}</strong>
                                                                                        <Badge bg={getTeamBadgeColor(request.userId.team)} className="ms-2">
                                                                                            {request.userId.team}
                                                                                        </Badge>
                                                                                        <Badge bg="secondary" className="ms-2">
                                                                                            {request.userId.level}
                                                                                        </Badge>
                                                                                    </div>
                                                                                    <small className="text-muted">
                                                                                        Requested by: {request.requestedBy.username}
                                                                                    </small>
                                                                                </div>
                                                                                <div>
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        color="success"
                                                                                        disabled={requestsLoading[request._id]}
                                                                                        onClick={() => handleRequestAction(project._id, request._id, 'Approved')}
                                                                                        className="me-1"
                                                                                    >
                                                                                        <CheckCircleIcon fontSize="small" />
                                                                                    </IconButton>
                                                                                    <IconButton
                                                                                        size="small"
                                                                                        color="error"
                                                                                        disabled={requestsLoading[request._id]}
                                                                                        onClick={() => handleRequestAction(project._id, request._id, 'Rejected')}
                                                                                    >
                                                                                        <CancelIcon fontSize="small" />
                                                                                    </IconButton>
                                                                                </div>
                                                                            </ListGroup.Item>
                                                                        ))}
                                                                </ListGroup>
                                                            </div>
                                                        </Col>
                                                    )}
                                                </Row>
                                            </Card.Body>
                                        )}
                                    </Card>
                                ))
                            )}
                        </>
                    )}

                    {selectedTab === 1 && userRole === 'Admin' && (
                        <>
                            <h4 className="mb-3">Pending User Requests</h4>
                            {projects.some(project => project.requests && project.requests.some(request => request.status === 'Pending')) ? (
                                projects
                                    .filter(project => project.requests && project.requests.some(request => request.status === 'Pending'))
                                    .map(project => (
                                        <Card key={project._id} className="mb-3 border">
                                            <Card.Header className="bg-light">
                                                <h5>{project.name}</h5>
                                            </Card.Header>
                                            <ListGroup variant="flush">
                                                {project.requests
                                                    .filter(request => request.status === 'Pending')
                                                    .map(request => (
                                                        <ListGroup.Item key={request._id} className="d-flex justify-content-between align-items-center">
                                                            <div>
                                                                <div>
                                                                    <strong>{request.userId.username}</strong>
                                                                    <Badge bg={getTeamBadgeColor(request.userId.team)} className="ms-2">
                                                                        {request.userId.team}
                                                                    </Badge>
                                                                    <Badge bg="secondary" className="ms-2">
                                                                        {request.userId.level}
                                                                    </Badge>
                                                                </div>
                                                                <small className="text-muted">
                                                                    Requested by: {request.requestedBy.username}
                                                                </small>
                                                            </div>
                                                            <div>
                                                                <IconButton
                                                                    size="small"
                                                                    color="success"
                                                                    disabled={requestsLoading[request._id]}
                                                                    onClick={() => handleRequestAction(project._id, request._id, 'Approved')}
                                                                    className="me-1"
                                                                >
                                                                    <CheckCircleIcon fontSize="small" />
                                                                </IconButton>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    disabled={requestsLoading[request._id]}
                                                                    onClick={() => handleRequestAction(project._id, request._id, 'Rejected')}
                                                                >
                                                                    <CancelIcon fontSize="small" />
                                                                </IconButton>
                                                            </div>
                                                        </ListGroup.Item>
                                                    ))}
                                            </ListGroup>
                                        </Card>
                                    ))
                            ) : (
                                <Alert severity="info">No pending user requests found.</Alert>
                            )}
                        </>
                    )}

                    {selectedTab === 2 && userRole === 'Admin' && (
                        <>
                            <h4 className="mb-3">Pending Project Requests</h4>
                            {projectRequests.length > 0 ? (
                                projectRequests
                                    .filter(request => request.status === 'Pending')
                                    .map(request => (
                                        <Card key={request._id} className="mb-3 border">
                                            <Card.Header className="bg-light">
                                                <h5>{request.name}</h5>
                                            </Card.Header>
                                            <Card.Body>
                                                <Row>
                                                    <Col md={8}>
                                                        <p><strong>Description:</strong> {request.description || 'No description provided.'}</p>
                                                        <p><strong>Requested By:</strong> {request.requestedBy.username}</p>
                                                        <p><strong>Date:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                                                    </Col>
                                                    <Col md={4} className="d-flex justify-content-end align-items-center">
                                                        <Button
                                                            variant="contained"
                                                            color="success"
                                                            disabled={requestsLoading[request._id]}
                                                            onClick={() => handleProjectRequestAction(request._id, 'Approved')}
                                                            className="me-2"
                                                            size="small"
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            disabled={requestsLoading[request._id]}
                                                            onClick={() => handleProjectRequestAction(request._id, 'Rejected')}
                                                            size="small"
                                                        >
                                                            Reject
                                                        </Button>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    ))
                            ) : (
                                <Alert severity="info">No pending project requests found.</Alert>
                            )}
                        </>
                    )}

                    {selectedTab === (userRole === 'Admin' ? 2 : 1) && userRole === 'Project Manager' && (
                        <>
                            <h4 className="mb-3">My Project Requests</h4>
                            {projectRequests.length > 0 ? (
                                projectRequests.map(request => (
                                    <Card key={request._id} className="mb-3 border">
                                        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                                            <h5>{request.name}</h5>
                                            <Badge 
                                                bg={
                                                    request.status === 'Approved' ? 'success' : 
                                                    request.status === 'Rejected' ? 'danger' : 'warning'
                                                }
                                            >
                                                {request.status}
                                            </Badge>
                                        </Card.Header>
                                        <Card.Body>
                                            <p><strong>Description:</strong> {request.description || 'No description provided.'}</p>
                                            <p><strong>Date:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                                        </Card.Body>
                                    </Card>
                                ))
                            ) : (
                                <Alert severity="info">You haven't made any project requests yet.</Alert>
                            )}
                        </>
                    )}
                </Card.Body>
            </Card>

            {/* Project Add/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedProject ? 'Edit Project' : 
                     userRole === 'Admin' ? 'Add Project' : 'Request Project Creation'}
                </DialogTitle>
                <DialogContent>
                    {errorMessage && (
                        <Alert severity="error" className="mb-3">{errorMessage}</Alert>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label>Project Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </Form.Group>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedProject ? 'Update' : userRole === 'Admin' ? 'Create' : 'Submit Request'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Member Dialog */}
            <Dialog open={memberDialogOpen} onClose={handleMemberDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>Add Member to Project</DialogTitle>
                <DialogContent>
                    {errorMessage && (
                        <Alert severity="error" className="mb-3">{errorMessage}</Alert>
                    )}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>User</InputLabel>
                        <Select
                            name="userId"
                            value={memberData.userId}
                            onChange={handleMemberDataChange}
                            label="User"
                        >
                            {users
                                .filter(user => 
                                    !selectedProject?.members?.some(member => 
                                        member.userId._id === user._id
                                    )
                                )
                                .map(user => (
                                    <MenuItem key={user._id} value={user._id}>
                                        {user.username} ({user.role})
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Role in Project</InputLabel>
                        <Select
                            name="role"
                            value={memberData.role}
                            onChange={handleMemberDataChange}
                            label="Role in Project"
                        >
                            <MenuItem value="Project Manager">Project Manager</MenuItem>
                            <MenuItem value="Developer">Developer</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleMemberDialogClose}>Cancel</Button>
                    <Button onClick={handleAddMember} variant="contained" color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Request Member Dialog */}
            <Dialog open={requestDialogOpen} onClose={handleRequestDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>Request User Addition</DialogTitle>
                <DialogContent>
                    {errorMessage && (
                        <Alert severity="error" className="mb-3">{errorMessage}</Alert>
                    )}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>User</InputLabel>
                        <Select
                            name="userId"
                            value={requestData.userId}
                            onChange={handleRequestDataChange}
                            label="User"
                        >
                            {users
                                .filter(user => 
                                    // Filter out users who are already members or have pending requests
                                    !selectedProject?.members?.some(member => 
                                        member.userId._id === user._id
                                    ) &&
                                    !selectedProject?.requests?.some(request => 
                                        request.userId._id === user._id && request.status === 'Pending'
                                    )
                                )
                                .map(user => (
                                    <MenuItem key={user._id} value={user._id}>
                                        {user.username} ({user.role})
                                    </MenuItem>
                                ))
                            }
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRequestDialogClose}>Cancel</Button>
                    <Button onClick={handleAddRequest} variant="contained" color="primary">
                        Submit Request
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ProjectList; 