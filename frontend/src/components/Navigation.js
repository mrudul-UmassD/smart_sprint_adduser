import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

const Navigation = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  const toggleDrawer = (open) => (event) => {
    if (event?.type === 'keydown' && (event?.key === 'Tab' || event?.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

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
        {(role === 'admin' || role === 'pm') && (
          <ListItem component={Link} to="/users">
            <ListItemText primary="Manage Users" />
          </ListItem>
        )}
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
                <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                  <Nav>
                    <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                    {(role === 'admin' || role === 'pm') && (
                      <Nav.Link as={Link} to="/users">Manage Users</Nav.Link>
                    )}
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