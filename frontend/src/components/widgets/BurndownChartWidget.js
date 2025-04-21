import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Alert, Spinner, Button, Form } from 'react-bootstrap';
import { FiSettings, FiTrash2, FiMaximize2, FiRefreshCw, FiInfo } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Dummy data for empty state
const DUMMY_BURNDOWN_DATA = {
  dates: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8', 'Day 9', 'Day 10'],
  remainingTasks: [20, 18, 17, 15, 13, 12, 10, 8, 6, 4],
  idealBurndown: [20, 18, 16, 14, 12, 10, 8, 6, 4, 0],
  completed: 16,
  total: 20
};

const BurndownChartWidget = ({
  config,
  onRemove,
  onUpdateConfig,
  onToggleFullscreen
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [burndownData, setBurndownData] = useState(null);
  const [timeRange, setTimeRange] = useState('2w'); // Default to 2 weeks
  
  // Destructure config with defaults
  const { projectId } = config || {};

  useEffect(() => {
    if (projectId) {
      fetchBurndownData();
    } else {
      // Use dummy data when no project is selected
      setBurndownData(DUMMY_BURNDOWN_DATA);
      setLoading(false);
    }
  }, [projectId, timeRange]);

  const fetchBurndownData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await axios.get(`/api/analytics/projects/${projectId}/burndown`, {
        params: { timeRange },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setBurndownData(response.data);
    } catch (error) {
      console.error('Error fetching burndown data:', error);
      setError(error.response?.data?.message || 'Failed to load burndown data');
      // Use dummy data on error
      setBurndownData(DUMMY_BURNDOWN_DATA);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  const getChartData = () => {
    // Use dummy data if no real data is available
    const data = burndownData || DUMMY_BURNDOWN_DATA;

    return {
      labels: data.dates,
      datasets: [
        {
          label: 'Actual',
          data: data.remainingTasks,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 2,
          tension: 0.1,
          fill: false,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'Ideal',
          data: data.idealBurndown,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          tension: 0,
          borderDash: [5, 5],
          fill: false,
          pointRadius: 0
        }
      ]
    };
  };

  const getChartOptions = () => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 15,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: (tooltipItems) => {
              return tooltipItems[0].label;
            },
            label: (context) => {
              return `${context.dataset.label}: ${context.parsed.y} tasks`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date'
          },
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Remaining Tasks'
          }
        }
      }
    };
  };

  const chartData = getChartData();
  const chartOptions = getChartOptions();

  // Display project selection message when no project is selected
  const renderProjectSelectionMessage = () => {
    if (!projectId) {
      return (
        <Alert variant="info" className="mb-0 mt-2 mx-3">
          {!projectId ? "Please select a project to see actual burndown data." : ""}
          {!projectId && error ? <br /> : ""}
          {error ? `Error: ${error}` : ""}
        </Alert>
      );
    }
    
    if (error) {
      return <Alert variant="danger" className="mb-0 mt-2 mx-3">{error}</Alert>;
    }
    
    return null;
  };

  return (
    <Card className="dashboard-widget burndown-widget h-100">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <h5 className="mb-0">Burndown Chart</h5>
          <Button
            variant="link"
            className="p-0 ms-2 text-muted"
            title="A burndown chart shows remaining tasks over time, comparing actual progress against ideal progress."
          >
            <FiInfo />
          </Button>
        </div>
        <div className="widget-controls">
          <Button 
            variant="link" 
            className="p-0 me-2" 
            onClick={fetchBurndownData}
            title="Refresh data"
          >
            <FiRefreshCw />
          </Button>
          <Button 
            variant="link" 
            className="p-0 me-2" 
            onClick={onUpdateConfig}
            title="Configure widget"
          >
            <FiSettings />
          </Button>
          <Button 
            variant="link" 
            className="p-0 me-2" 
            onClick={onToggleFullscreen}
            title="Toggle fullscreen"
          >
            <FiMaximize2 />
          </Button>
          <Button 
            variant="link" 
            className="p-0 text-danger" 
            onClick={onRemove}
            title="Remove widget"
          >
            <FiTrash2 />
          </Button>
        </div>
      </Card.Header>
      
      {renderProjectSelectionMessage()}
      
      <Card.Body>
        <div className="mb-3 d-flex gap-2 align-items-center">
          <Form.Select 
            size="sm" 
            value={timeRange} 
            onChange={handleTimeRangeChange}
            disabled={!projectId}
            style={{ maxWidth: '150px' }}
          >
            <option value="1w">Last Week</option>
            <option value="2w">Last 2 Weeks</option>
            <option value="1m">Last Month</option>
            <option value="sprint">Current Sprint</option>
          </Form.Select>
          
          {loading && (
            <Spinner 
              animation="border" 
              role="status" 
              size="sm" 
              className="ms-2"
            >
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          )}
        </div>
        
        <div style={{ height: '280px', position: 'relative' }}>
          {loading ? (
            <div 
              className="position-absolute top-0 start-0 end-0 bottom-0 d-flex justify-content-center align-items-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
            >
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : null}
          
          <Line data={chartData} options={chartOptions} />
        </div>
        
        <div className="mt-3 d-flex justify-content-between text-center">
          <div>
            <div className="h5 mb-0">{burndownData?.completed || DUMMY_BURNDOWN_DATA.completed}</div>
            <div className="text-muted small">Tasks Completed</div>
          </div>
          <div>
            <div className="h5 mb-0">{burndownData?.total || DUMMY_BURNDOWN_DATA.total}</div>
            <div className="text-muted small">Total Tasks</div>
          </div>
          <div>
            <div className="h5 mb-0">
              {burndownData?.completed && burndownData?.total 
                ? Math.round((burndownData.completed / burndownData.total) * 100) 
                : Math.round((DUMMY_BURNDOWN_DATA.completed / DUMMY_BURNDOWN_DATA.total) * 100)}%
            </div>
            <div className="text-muted small">Completion</div>
          </div>
        </div>
      </Card.Body>
      
      {!projectId && (
        <Card.Footer className="text-muted text-center">
          <small>This is a sample visualization. Select a project to see actual data.</small>
        </Card.Footer>
      )}
    </Card>
  );
};

export default BurndownChartWidget; 