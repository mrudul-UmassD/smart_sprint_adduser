import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Form } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { FaChartLine } from 'react-icons/fa';
import axios from 'axios';
import { getToken, removeTokenAndRedirect } from '../../utils/authUtils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BurndownChartWidget = ({ config = {} }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(config.projectId || '');

  // Fetch available projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = getToken();
        if (!token) {
          removeTokenAndRedirect();
          return;
        }

        const response = await axios.get('/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProjects(response.data);
        
        // If no project is selected but we have projects, select the first one
        if (!selectedProjectId && response.data.length > 0) {
          setSelectedProjectId(response.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
        if (err.response && err.response.status === 401) {
          removeTokenAndRedirect();
        }
      }
    };

    fetchProjects();
  }, []);

  // Fetch burndown data when a project is selected
  useEffect(() => {
    const fetchBurndownData = async () => {
      if (!selectedProjectId) {
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
        
        const response = await axios.get(`/api/analytics/projects/${selectedProjectId}/burndown`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const { dates, remainingTasks, idealBurndown } = response.data;
        
        setChartData({
          labels: dates,
          datasets: [
            {
              label: 'Actual Remaining Tasks',
              data: remainingTasks,
              borderColor: 'rgb(54, 162, 235)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true,
              tension: 0.1
            },
            {
              label: 'Ideal Burndown',
              data: idealBurndown,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              borderDash: [5, 5],
              tension: 0
            }
          ]
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching burndown data:', err);
        
        if (err.response && err.response.status === 401) {
          removeTokenAndRedirect();
        } else {
          setError(err.response?.data?.message || 'Failed to load burndown data');
          setLoading(false);
        }
      }
    };
    
    fetchBurndownData();
  }, [selectedProjectId]);

  const handleProjectChange = (e) => {
    setSelectedProjectId(e.target.value);
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

  if (!selectedProjectId) {
    return (
      <Alert variant="info">
        No project selected. Please select a project to view its burndown chart.
      </Alert>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Remaining Tasks'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw} tasks`;
          }
        }
      }
    }
  };

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  return (
    <div className="burndown-chart-widget h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="widget-title m-0">
          <FaChartLine className="me-2" />
          Burndown Chart
        </h5>
        
        <Form.Select 
          size="sm"
          value={selectedProjectId}
          onChange={handleProjectChange}
          style={{ width: '150px' }}
        >
          <option value="">Select Project</option>
          {projects.map(project => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </Form.Select>
      </div>
      
      <Card className="flex-grow-1">
        <Card.Body>
          {!chartData ? (
            <Alert variant="info">
              No burndown data available for this project.
            </Alert>
          ) : (
            <div className="chart-container" style={{ position: 'relative', height: '250px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
          
          {selectedProject && chartData && (
            <div className="text-center mt-2">
              <small className="text-muted">
                Project completion: {selectedProject.progress || 0}% | 
                Start: {new Date(selectedProject.startDate).toLocaleDateString()} | 
                End: {new Date(selectedProject.endDate).toLocaleDateString()}
              </small>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default BurndownChartWidget; 