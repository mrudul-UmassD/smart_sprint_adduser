import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import axios from '../../utils/axiosConfig';
import { useTheme, applyThemeToChart } from '../../utils/themeUtils';

const BurndownWidget = ({ config = {} }) => {
  const [burndownData, setBurndownData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  
  useEffect(() => {
    const fetchBurndownData = async () => {
      try {
        setLoading(true);
        const projectId = config.projectId || 'all';
        const response = await axios.get(`/api/analytics/projects/${projectId}/burndown`);
        setBurndownData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching burndown data:', err);
        setError('Failed to load burndown chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchBurndownData();
  }, [config.projectId]);

  // Generate chart data
  const getChartData = () => {
    if (!burndownData) return null;
    
    return {
      labels: burndownData.dates,
      datasets: [
        {
          label: 'Remaining Tasks',
          data: burndownData.remainingTasks,
          borderColor: 'rgba(13, 110, 253, 0.8)',
          backgroundColor: 'rgba(13, 110, 253, 0.2)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Ideal Burndown',
          data: burndownData.idealBurndown,
          borderColor: 'rgba(25, 135, 84, 0.7)',
          borderDash: [5, 5],
          backgroundColor: 'transparent',
          fill: false,
          tension: 0
        }
      ]
    };
  };

  // Chart options
  const chartOptions = applyThemeToChart({
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      },
      tooltip: {
        enabled: true
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Tasks Remaining'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    },
    maintainAspectRatio: false,
    responsive: true
  }, theme);

  if (loading) {
    return (
      <Card className="dashboard-widget h-100">
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="primary" />
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="dashboard-widget h-100">
        <Card.Body>
          <Alert variant="danger">{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  if (!burndownData || burndownData.dates.length === 0) {
    return (
      <Card className="dashboard-widget h-100">
        <Card.Body>
          <Alert variant="info">No burndown data available</Alert>
        </Card.Body>
      </Card>
    );
  }

  const chartData = getChartData();

  return (
    <Card className="dashboard-widget h-100">
      <Card.Header className="fw-bold">Burndown Chart</Card.Header>
      <Card.Body>
        <div className="chart-container" style={{ height: '230px' }}>
          {chartData && <Line data={chartData} options={chartOptions} />}
        </div>
      </Card.Body>
    </Card>
  );
};

export default BurndownWidget; 