import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Offcanvas, NavDropdown, Image, Badge, Dropdown, ListGroup } from 'react-bootstrap';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import axios from 'axios';
import API_CONFIG from '../config';
import { 
    Dashboard as DashboardIcon, 
    People as PeopleIcon, 
    Assignment as AssignmentIcon, 
    ViewKanban as ViewKanbanIcon, 
    Person as PersonIcon, 
    ExitToApp as ExitToAppIcon,
    Settings as SettingsIcon,
    Widgets as WidgetsIcon
} from '@mui/icons-material';
// Import logo
import logo from '../assets/logo/logo.png';

const Navigation = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Get user info from localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const userRole = userStr ? JSON.parse(userStr).role : '';
  
  // Fetch projects on component mount
  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);
  
  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);
  
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.PROJECTS_ENDPOINT}`);
      // Ensure response.data is an array
      const projectsData = Array.isArray(response.data) ? response.data : [];
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]); // Set empty array on error
    }
  };
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    // Clear all auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Delete Authorization header
    delete axios.defaults.headers.common['Authorization'];
    delete axios.defaults.headers.common['x-auth-token'];
    // Redirect to login page
    navigate('/login');
  };

  // Only show certain items based on role
  const isAdmin = userRole === 'Admin';
  const isProjectManager = userRole === 'Project Manager';
  const canManageUsers = isAdmin || isProjectManager;

  const getProfileImage = () => {
    if (user?.profilePicture) {
      return `${API_CONFIG.BASE_URL}${user.profilePicture}`;
    }
    return null;
  };

  // Drawer content for mobile view
  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={handleDrawerToggle}
      onKeyDown={handleDrawerToggle}
    >
      <List>
        <ListItem component={Link} to="/dashboard">
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        {/* <ListItem component={Link} to="/custom-dashboard">
          <ListItemText primary="Custom Dashboard" />
        </ListItem> */}
        
        <ListItem component={Link} to="/projects">
          <ListItemText primary="Projects" />
        </ListItem>
        
        {canManageUsers && (
          <ListItem component={Link} to="/users">
            <ListItemText primary="Users" />
          </ListItem>
        )}
        
        <ListItem>
          <ListItemText primary="Task Manager" />
        </ListItem>
        
        {projects.map(project => (
          <ListItem 
            key={project._id} 
            component={Link} 
            to={`/kanban/${project._id}`}
            sx={{ pl: 4 }}
          >
            <ListItemText primary={project.name} />
          </ListItem>
        ))}
        
        <ListItem button onClick={handleLogout}>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      {/* Top Navbar */}
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-3">
        <Container fluid>
          <Navbar.Brand as={Link} to="/dashboard" className="d-flex align-items-center">
            <img
              src={logo} 
              width="30"
              height="30"
              className="d-inline-block align-top me-2"
              alt="Smart Sprint Logo"
            />
            Smart Sprint
          </Navbar.Brand>
          
          {/* Mobile menu toggle */}
          <Button 
            variant="outline-light" 
            className="d-lg-none" 
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </Button>
          
          {/* Desktop navigation */}
          <Navbar.Collapse className="d-none d-lg-flex">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/dashboard">
                <DashboardIcon fontSize="small" className="me-1" /> Dashboard
              </Nav.Link>
              
              {/* <Nav.Link as={Link} to="/custom-dashboard">
                <WidgetsIcon fontSize="small" className="me-1" /> Custom Dashboard
              </Nav.Link> */}
              
              {canManageUsers && (
                <Nav.Link as={Link} to="/users">
                  <PeopleIcon fontSize="small" className="me-1" /> Users
                </Nav.Link>
              )}
              
              <Nav.Link as={Link} to="/projects">
                <AssignmentIcon fontSize="small" className="me-1" /> Projects
              </Nav.Link>
              
              <Nav.Link as={Link} to="/kanban">
                <ViewKanbanIcon fontSize="small" className="me-1" /> Kanban
              </Nav.Link>
            </Nav>
            
            {/* User profile dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle 
                as="div" 
                id="user-dropdown" 
                className="d-flex align-items-center text-white custom-dropdown"
                style={{ cursor: 'pointer' }}
              >
                {user?.profilePicture ? (
                  <Image 
                    src={getProfileImage()}
                    width="32"
                    height="32"
                    roundedCircle
                    className="me-2 border border-light"
                  />
                ) : (
                  <div className="avatar-placeholder me-2 bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                    <PersonIcon fontSize="small" />
                  </div>
                )}
                <span>{user?.username}</span>
                <Badge 
                  bg={user?.role === 'Admin' ? 'danger' : user?.role === 'Project Manager' ? 'warning' : 'info'} 
                  className="ms-2"
                >
                  {user?.role}
                </Badge>
              </Dropdown.Toggle>
              
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/profile">
                  <PersonIcon fontSize="small" className="me-2" /> Profile
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  <ExitToAppIcon fontSize="small" className="me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      {/* Mobile Drawer */}
      <Offcanvas show={mobileOpen} onHide={handleDrawerToggle} placement="start">
        <Offcanvas.Header closeButton className="bg-primary text-white">
          <Offcanvas.Title className="d-flex align-items-center">
            <img
              src={logo} 
              width="30"
              height="30"
              className="d-inline-block align-top me-2"
              alt="Smart Sprint Logo"
            />
            Smart Sprint Menu
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {/* User info at the top */}
          <div className="p-3 bg-light">
            <div className="d-flex align-items-center">
              {user?.profilePicture ? (
                <Image 
                  src={getProfileImage()}
                  width="50"
                  height="50"
                  roundedCircle
                  className="me-3 border"
                />
              ) : (
                <div className="avatar-placeholder-large me-3 bg-secondary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                  <PersonIcon fontSize="large" />
                </div>
              )}
              <div>
                <h6 className="mb-0">{user?.username}</h6>
                <div>
                  <Badge 
                    bg={user?.role === 'Admin' ? 'danger' : user?.role === 'Project Manager' ? 'warning' : 'info'} 
                  >
                    {user?.role}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <ListGroup variant="flush">
            <ListGroup.Item 
              action 
              as={Link} 
              to="/dashboard" 
              onClick={handleDrawerToggle}
            >
              <DashboardIcon fontSize="small" className="me-3" /> Dashboard
            </ListGroup.Item>
            
            {/* <ListGroup.Item 
              action 
              as={Link} 
              to="/custom-dashboard" 
              onClick={handleDrawerToggle}
            >
              <WidgetsIcon fontSize="small" className="me-3" /> Custom Dashboard
            </ListGroup.Item> */}
            
            {canManageUsers && (
              <ListGroup.Item 
                action 
                as={Link} 
                to="/users" 
                onClick={handleDrawerToggle}
              >
                <PeopleIcon fontSize="small" className="me-3" /> Users
              </ListGroup.Item>
            )}
            
            <ListGroup.Item 
              action 
              as={Link} 
              to="/projects" 
              onClick={handleDrawerToggle}
            >
              <AssignmentIcon fontSize="small" className="me-3" /> Projects
            </ListGroup.Item>
            
            <ListGroup.Item 
              action 
              as={Link} 
              to="/kanban" 
              onClick={handleDrawerToggle}
            >
              <ViewKanbanIcon fontSize="small" className="me-3" /> Kanban Board
            </ListGroup.Item>
            
            <ListGroup.Item 
              action 
              as={Link} 
              to="/profile" 
              onClick={handleDrawerToggle}
            >
              <PersonIcon fontSize="small" className="me-3" /> Profile
            </ListGroup.Item>
            
            <ListGroup.Item 
              action 
              onClick={() => {
                handleDrawerToggle();
                handleLogout();
              }}
              className="text-danger"
            >
              <ExitToAppIcon fontSize="small" className="me-3" /> Logout
            </ListGroup.Item>
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default Navigation; 