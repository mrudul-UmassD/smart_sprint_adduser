import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    Drawer,
    List,
    ListItem,
    ListItemText,
    IconButton,
    useMediaQuery,
    useTheme,
    Divider,
    ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import { Navbar, Nav, Container } from 'react-bootstrap';

const Navigation = () => {
    const [user, setUser] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleDrawer = (open) => (event) => {
        if (
            event.type === 'keydown' &&
            (event.key === 'Tab' || event.key === 'Shift')
        ) {
            return;
        }
        setDrawerOpen(open);
    };

    const navItems = [
        { 
            label: 'Dashboard', 
            path: '/dashboard', 
            visible: true,
            icon: <DashboardIcon />
        },
        {
            label: 'Users',
            path: '/users',
            visible: user && (user.role === 'Admin' || user.role === 'Project Manager'),
            icon: <PeopleIcon />
        },
    ];

    const filteredNavItems = navItems.filter((item) => item.visible);

    const renderDrawerContent = () => (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6" className="fw-bold">Smart Sprint</Typography>
                {user && (
                    <Typography variant="body2" color="textSecondary">
                        Logged in as: <strong>{user.username}</strong>
                    </Typography>
                )}
            </Box>
            <Divider />
            <List>
                {filteredNavItems.map((item) => (
                    <ListItem 
                        button 
                        component={Link} 
                        to={item.path} 
                        key={item.path}
                        selected={location.pathname === item.path}
                        sx={{
                            backgroundColor: location.pathname === item.path ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItem>
                ))}
                <Divider sx={{ my: 1 }} />
                <ListItem button onClick={handleLogout}>
                    <ListItemIcon><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItem>
            </List>
        </Box>
    );

    if (!user) return null;

    return (
        <>
            <AppBar position="static" className="shadow-sm mb-3">
                <Container>
                    <Toolbar disableGutters>
                        {isMobile && (
                            <IconButton
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={toggleDrawer(true)}
                                sx={{ mr: 2 }}
                            >
                                <MenuIcon />
                            </IconButton>
                        )}
                        
                        <Typography 
                            variant="h6" 
                            component={Link} 
                            to="/dashboard"
                            sx={{ 
                                flexGrow: 1, 
                                ml: 2,
                                textDecoration: 'none',
                                color: 'white',
                                fontWeight: 'bold' 
                            }}
                        >
                            Smart Sprint
                        </Typography>
                        
                        {!isMobile && (
                            <Box sx={{ display: 'flex' }}>
                                {filteredNavItems.map((item) => (
                                    <Button
                                        color="inherit"
                                        component={Link}
                                        to={item.path}
                                        key={item.path}
                                        sx={{ 
                                            mx: 0.5,
                                            borderBottom: location.pathname === item.path ? '2px solid white' : 'none',
                                            borderRadius: 0,
                                            pb: 0.5
                                        }}
                                        startIcon={item.icon}
                                    >
                                        {item.label}
                                    </Button>
                                ))}
                                <Button
                                    color="inherit"
                                    onClick={handleLogout}
                                    sx={{ ml: 2 }}
                                    startIcon={<LogoutIcon />}
                                >
                                    Logout
                                </Button>
                            </Box>
                        )}
                    </Toolbar>
                </Container>
            </AppBar>
            
            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                {renderDrawerContent()}
            </Drawer>
        </>
    );
};

export default Navigation; 