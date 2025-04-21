import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CustomDashboard from './components/CustomDashboard';
import UserList from './components/UserList';
import ProjectList from './components/ProjectList';
import KanbanBoard from './components/KanbanBoard';
import TaskDetail from './components/TaskDetail';
import Navigation from './components/Navigation';
import FirstLogin from './components/FirstLogin';
import UserProfile from './components/UserProfile';
import NotificationDemo from './components/NotificationDemo';
import Box from '@mui/material/Box';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';
import theme from './theme';
import { ThemeProvider as ContextThemeProvider } from './contexts/ThemeContext';
import './styles/Widgets.css';
import './styles/centerNotification.css';
import DashboardPage from './pages/DashboardPage';
import NotificationProvider from './contexts/NotificationContext';

// Define a simple fallback theme in case there's an issue with the imported theme
const fallbackTheme = createTheme({
  palette: {
    primary: {
      main: '#0062cc',
    },
    secondary: {
      main: '#ff5722',
    },
  },
});

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
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            
            // Debug mode override
            if (location.search.includes('debug=true')) {
                console.log('Debug mode enabled, bypassing authentication');
                setIsAuthenticated(true);
                setIsLoading(false);
                return;
            }
            
            if (!token) {
                console.log('No token found, redirecting to login');
                setIsAuthenticated(false);
                setIsLoading(false);
                return;
            }
            
            try {
                console.log('Validating token...');
                // Optional: You can make a request to the backend to validate the token
                // For now just check if the token exists
                setIsAuthenticated(true);
            } catch (err) {
                console.error('Token validation error:', err);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };
        
        checkAuth();
    }, [navigate, location]);
    
    if (isLoading) {
        return <div>Loading...</div>;
    }
    
    return isAuthenticated ? (
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
    // Check for the bypass auth query parameter
    const queryParams = new URLSearchParams(window.location.search);
    const bypassAuth = queryParams.get('bypass') === 'true';
    
    console.log('App initialized, bypass auth:', bypassAuth);
    
    // If bypassing auth, store a fake token and user
    if (bypassAuth && !localStorage.getItem('token')) {
        console.log('Setting fake auth credentials for testing');
        localStorage.setItem('token', 'fake-token-for-testing');
        localStorage.setItem('user', JSON.stringify({
            username: 'admin',
            role: 'Admin',
            isFirstLogin: false
        }));
    }
    
  return (
    <ContextThemeProvider>
      <NotificationProvider>
        <MUIThemeProvider theme={theme || fallbackTheme}>
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
                    <DashboardPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/custom-dashboard"
                element={
                  <PrivateRoute>
                    <CustomDashboard user={JSON.parse(localStorage.getItem('user') || '{}')} />
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
              <Route
                path="/notification-demo"
                element={
                  <PrivateRoute>
                    <NotificationDemo />
                  </PrivateRoute>
                }
              />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
        </MUIThemeProvider>
      </NotificationProvider>
    </ContextThemeProvider>
  );
}

export default App;
