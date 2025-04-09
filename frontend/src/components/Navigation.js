import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
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

const Navigation = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  // Get user info from localStorage
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const userRole = user ? user.role : '';
  
  // Fetch projects on component mount
  useEffect(() => {
    if (token) {
      fetchProjects();
    }
  }, [token]);
  
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.PROJECTS_ENDPOINT}`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };
  
  const toggleDrawer = (open) => (event) => {
    if (event?.type === 'keydown' && (event?.key === 'Tab' || event?.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isAdmin = userRole === 'Admin';
  const isPM = userRole === 'Project Manager';
  const isAdminOrPM = isAdmin || isPM;

  // Drawer content for mobile view
  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem component={Link} to="/dashboard">
          <ListItemText primary="Dashboard" />
        </ListItem>
        
        <ListItem component={Link} to="/projects">
          <ListItemText primary="Projects" />
        </ListItem>
        
        {isAdminOrPM && (
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
      {token ? (
        <>
          {isMobile ? (
            <Navbar bg="primary" variant="dark" expand="lg">
              <Container>
                <Navbar.Brand as={Link} to="/dashboard">Smart Sprint</Navbar.Brand>
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={toggleDrawer(true)}
                  sx={{ color: 'white' }}
                >
                  <MenuIcon />
                </IconButton>
                <Drawer
                  anchor="right"
                  open={isDrawerOpen}
                  onClose={toggleDrawer(false)}
                >
                  {drawer}
                </Drawer>
              </Container>
            </Navbar>
          ) : (
            <Navbar bg="primary" variant="dark" expand="lg">
              <Container>
                <Navbar.Brand as={Link} to="/dashboard">Smart Sprint</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="me-auto">
                    <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/projects">Projects</Nav.Link>
                    {isAdminOrPM && (
                      <Nav.Link as={Link} to="/users">Users</Nav.Link>
                    )}
                    <NavDropdown title="Task Manager" id="task-manager-dropdown">
                      {projects.length > 0 ? (
                        projects.map(project => (
                          <NavDropdown.Item 
                            key={project._id} 
                            as={Link} 
                            to={`/kanban/${project._id}`}
                          >
                            {project.name}
                          </NavDropdown.Item>
                        ))
                      ) : (
                        <NavDropdown.Item disabled>No projects available</NavDropdown.Item>
                      )}
                    </NavDropdown>
                  </Nav>
                  <Nav>
                    <Button 
                      variant="outline-light" 
                      onClick={handleLogout}
                      className="ms-2"
                    >
                      Logout
                    </Button>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          )}
        </>
      ) : null}
    </>
  );
};

export default Navigation; 