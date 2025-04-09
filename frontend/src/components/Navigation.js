import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const Navigation = () => {
    const [user, setUser] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

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
        { label: 'Dashboard', path: '/dashboard', visible: true },
        {
            label: 'Users',
            path: '/users',
            visible: user && (user.role === 'Admin' || user.role === 'Project Manager'),
        },
    ];

    const filteredNavItems = navItems.filter((item) => item.visible);

    const renderNavItems = () => {
        if (isMobile) {
            return (
                <>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="menu"
                        onClick={toggleDrawer(true)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
                        <Box
                            sx={{ width: 250 }}
                            role="presentation"
                            onClick={toggleDrawer(false)}
                            onKeyDown={toggleDrawer(false)}
                        >
                            <List>
                                {filteredNavItems.map((item) => (
                                    <ListItem button component={Link} to={item.path} key={item.path}>
                                        <ListItemText primary={item.label} />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Drawer>
                </>
            );
        }

        return (
            <Box sx={{ display: 'flex' }}>
                {filteredNavItems.map((item) => (
                    <Button
                        color="inherit"
                        component={Link}
                        to={item.path}
                        key={item.path}
                    >
                        {item.label}
                    </Button>
                ))}
            </Box>
        );
    };

    if (!user) return null;

    return (
        <AppBar position="static">
            <Toolbar>
                {renderNavItems()}
                <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
                    Smart Sprint
                </Typography>
                <Button color="inherit" onClick={handleLogout}>
                    Logout
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default Navigation; 