import React from 'react';
import { Navbar, Button, Form, Container } from 'react-bootstrap';
import { FaMoon, FaSun, FaPlus, FaSave, FaUndo, FaDownload, FaUpload } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import WidgetNotifications from './widgets/WidgetNotifications';

const DashboardHeader = ({ 
  onAddWidget, 
  onSaveDashboard,
  onResetDashboard,
  onExportDashboard,
  onImportDashboard,
  isDashboardModified
}) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Navbar bg={theme === 'dark' ? 'dark' : 'light'} 
      variant={theme === 'dark' ? 'dark' : 'light'} 
      className="mb-4 shadow-sm"
    >
      <Container fluid>
        <Navbar.Brand>
          Dashboard
        </Navbar.Brand>
        
        <div className="d-flex align-items-center">
          <Button 
            variant={theme === 'dark' ? 'outline-light' : 'outline-primary'} 
            size="sm" 
            onClick={onAddWidget}
            className="me-2"
          >
            <FaPlus className="me-1" /> Add Widget
          </Button>
          
          <Button 
            variant={theme === 'dark' ? 'outline-light' : 'outline-primary'} 
            size="sm" 
            onClick={onSaveDashboard}
            className="me-2"
            disabled={!isDashboardModified}
          >
            <FaSave className="me-1" /> Save Layout
          </Button>
          
          <Button 
            variant={theme === 'dark' ? 'outline-light' : 'outline-primary'} 
            size="sm" 
            onClick={onResetDashboard}
            className="me-2"
          >
            <FaUndo className="me-1" /> Reset
          </Button>
          
          <div className="d-flex border-start ps-2 ms-2">
            <Button 
              variant={theme === 'dark' ? 'outline-light' : 'outline-primary'} 
              size="sm" 
              onClick={onExportDashboard}
              className="me-2"
              title="Export Dashboard Configuration"
            >
              <FaDownload />
            </Button>
            
            <Button 
              variant={theme === 'dark' ? 'outline-light' : 'outline-primary'} 
              size="sm" 
              onClick={onImportDashboard}
              className="me-2"
              title="Import Dashboard Configuration"
            >
              <FaUpload />
            </Button>
          </div>
          
          <div className="border-start ps-2 ms-2">
            <Button
              variant={theme === 'dark' ? 'outline-light' : 'outline-primary'}
              size="sm"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </Button>
          </div>
          
          <div className="me-3">
            <WidgetNotifications />
          </div>
          <ThemeToggle />
        </div>
      </Container>
    </Navbar>
  );
};

export default DashboardHeader; 