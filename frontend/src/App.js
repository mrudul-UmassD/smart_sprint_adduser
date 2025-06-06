import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import UserList from './components/UserList';
import ProjectList from './components/ProjectList';
import KanbanBoard from './components/KanbanBoard';
import TaskDetail from './components/TaskDetail';
import Navigation from './components/Navigation';
import FirstLogin from './components/FirstLogin';
import UserProfile from './components/UserProfile';
import Box from '@mui/material/Box';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import theme from './theme';

// Component to check if user needs to change password
const FirstLoginCheck = ({ children }) => {
    const navigate = useNavigate();
    
    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.isFirstLogin) {
                navigate('/first-login');
            }
        }
    }, [navigate]);
    
    return <>{children}</>;
};

const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? (
        <>
            <Navigation />
            <FirstLoginCheck>
                <Box sx={{ mt: 2 }}>{children}</Box>
            </FirstLoginCheck>
        </>
    ) : (
        <Navigate to="/login" />
    );
};

const FirstLoginRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const isFirstLogin = user?.isFirstLogin;
    
    if (!token) {
        return <Navigate to="/login" />;
    }
    
    if (token && !isFirstLogin) {
        return <Navigate to="/dashboard" />;
    }
    
    return <>{children}</>;
};

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/first-login"
                        element={
                            <FirstLoginRoute>
                                <FirstLogin />
                            </FirstLoginRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/users"
                        element={
                            <PrivateRoute>
                                <UserList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/projects"
                        element={
                            <PrivateRoute>
                                <ProjectList />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/kanban"
                        element={
                            <PrivateRoute>
                                <KanbanBoard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/kanban/:projectId"
                        element={
                            <PrivateRoute>
                                <KanbanBoard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/task/:taskId"
                        element={
                            <PrivateRoute>
                                <TaskDetail />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <UserProfile />
                            </PrivateRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/login" />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
