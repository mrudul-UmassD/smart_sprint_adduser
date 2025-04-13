import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { FaProjectDiagram, FaCalendarAlt, FaClock, FaTasks } from 'react-icons/fa';
import axios from 'axios';
import { getToken, removeTokenAndRedirect } from '../../utils/authUtils';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectSummaryWidget = ({ config = {} }) => {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const projectId = config.projectId;

  useEffect(() => {
    const fetchProjectSummary = async () => {
      if (!projectId) {
        setError('No project selected');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const token = getToken();
        
        if (!token) {
          removeTokenAndRedirect();
          return;
        }
        
        const response = await axios.get(`/api/analytics/projects/${projectId}/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProjectData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project summary:', err);
        
        if (err.response && err.response.status === 401) {
          removeTokenAndRedirect();
        } else {
          setError(err.response?.data?.message || 'Failed to load project summary');
          setLoading(false);
        }
      }
    };
    
    fetchProjectSummary();
  }, [projectId]);

  const getStatusChartData = () => {
    if (!projectData || !projectData.tasksByStatus) return null;
    
    const statusColors = {
      'Not Started': 'rgba(108, 117, 125, 0.8)',
      'In Progress': 'rgba(255, 193, 7, 0.8)',
      'In Review': 'rgba(13, 202, 240, 0.8)',
      'Completed': 'rgba(25, 135, 84, 0.8)',
      'Blocked': 'rgba(220, 53, 69, 0.8)'
    };
    
    const labels = Object.keys(projectData.tasksByStatus);
    const data = labels.map(key => projectData.tasksByStatus[key]);
    const backgroundColor = labels.map(label => statusColors[label] || 'rgba(0, 123, 255, 0.8)');
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor: backgroundColor.map(color => color.replace('0.8', '1')),
          borderWidth: 1
        }
      ]
    };
  };

  const getPriorityChartData = () => {
    if (!projectData || !projectData.tasksByPriority) return null;
    
    const priorityColors = {
      'Low': 'rgba(40, 167, 69, 0.8)',
      'Medium': 'rgba(255, 193, 7, 0.8)',
      'High': 'rgba(220, 53, 69, 0.8)',
      'Critical': 'rgba(108, 17, 125, 0.8)'
    };
    
    const labels = Object.keys(projectData.tasksByPriority);
    const data = labels.map(key => projectData.tasksByPriority[key]);
    const backgroundColor = labels.map(label => priorityColors[label] || 'rgba(0, 123, 255, 0.8)');
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor,
          borderColor: backgroundColor.map(color => color.replace('0.8', '1')),
          borderWidth: 1
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '70%'
  };

  const getDaysRemaining = () => {
    if (!projectData || !projectData.endDate) return null;
    
    const endDate = new Date(projectData.endDate);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'success';
    if (progress >= 50) return 'info';
    if (progress >= 25) return 'warning';
    return 'danger';
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!projectData) {
    return <Alert variant="warning">No project summary data available</Alert>;
  }

  const statusChartData = getStatusChartData();
  const priorityChartData = getPriorityChartData();
  const daysRemaining = getDaysRemaining();

  return (
    <div className="project-summary-widget h-100 d-flex flex-column">
      <h5 className="widget-title mb-3">
        <FaProjectDiagram className="me-2" />
        Project Summary
      </h5>
      
      <Card className="flex-grow-1">
        <Card.Body>
          <div className="project-header mb-3">
            <h6>{projectData.name}</h6>
            <div className="d-flex align-items-center mb-2">
              <Badge bg="secondary" className="me-2">
                <FaCalendarAlt className="me-1" />
                {new Date(projectData.startDate).toLocaleDateString()} - {new Date(projectData.endDate).toLocaleDateString()}
              </Badge>
              {daysRemaining !== null && (
                <Badge bg={daysRemaining < 7 ? 'danger' : 'info'}>
                  <FaClock className="me-1" />
                  {daysRemaining} days remaining
                </Badge>
              )}
            </div>
            <div className="d-flex align-items-center">
              <span className="me-2">Progress:</span>
              <span className="me-2">{projectData.completionRate}%</span>
            </div>
            <ProgressBar 
              variant={getProgressColor(projectData.completionRate)} 
              now={projectData.completionRate} 
              className="mb-2"
            />
          </div>
          
          <Row>
            <Col xs={12} md={6} className="mb-3">
              <div className="task-count-section">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="m-0">Tasks by Status</h6>
                  <Badge bg="primary">
                    <FaTasks className="me-1" />
                    {projectData.totalTasks} Total
                  </Badge>
                </div>
                <div style={{ height: '140px', position: 'relative' }}>
                  {statusChartData ? (
                    <Doughnut data={statusChartData} options={chartOptions} />
                  ) : (
                    <Alert variant="light" className="text-center">No status data</Alert>
                  )}
                </div>
              </div>
            </Col>
            
            <Col xs={12} md={6} className="mb-3">
              <div className="priority-section">
                <h6 className="mb-2">Tasks by Priority</h6>
                <div style={{ height: '140px', position: 'relative' }}>
                  {priorityChartData ? (
                    <Doughnut data={priorityChartData} options={chartOptions} />
                  ) : (
                    <Alert variant="light" className="text-center">No priority data</Alert>
                  )}
                </div>
              </div>
            </Col>
          </Row>
          
          {projectData.teamSize && (
            <div className="text-end mt-2">
              <small className="text-muted">
                Team size: {projectData.teamSize} members
              </small>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProjectSummaryWidget; 