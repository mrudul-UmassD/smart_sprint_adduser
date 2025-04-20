import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';

// Register the required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TeamVelocityWidget = ({ 
  onRemove, 
  onUpdateConfig, 
  onToggleFullscreen,
  config = { teamId: null, sprints: 4 } 
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, [config.teamId, config.sprints]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // If no team is selected, use placeholder data
      if (!config.teamId) {
        setData({
          labels: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'],
          datasets: [{
            label: 'Story Points Completed',
            data: [10, 15, 12, 18],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }]
        });
        setLoading(false);
        return;
      }

      // Otherwise fetch real data from API
      const response = await axios.get(`/api/teams/${config.teamId}/velocity?sprints=${config.sprints}`);
      
      // Transform the data for the chart
      const sprints = response.data.sprints || [];
      
      setData({
        labels: sprints.map(sprint => sprint.name),
        datasets: [{
          label: 'Story Points Completed',
          data: sprints.map(sprint => sprint.pointsCompleted),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching team velocity data:', err);
      setError('Failed to load velocity data');
      setLoading(false);
    }
  };

  return (
    <Card className="h-100 widget">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <i className="bi bi-speedometer me-2"></i>
          Team Velocity
        </div>
        <div>
          <Button 
            variant="link" 
            className="p-0 me-2" 
            onClick={fetchData}
            title="Refresh data"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>
          <Button 
            variant="link" 
            className="p-0 me-2" 
            onClick={onUpdateConfig}
            title="Configure widget"
          >
            <i className="bi bi-gear"></i>
          </Button>
          <Button 
            variant="link" 
            className="p-0 me-2" 
            onClick={onToggleFullscreen}
            title="Toggle fullscreen"
          >
            <i className="bi bi-fullscreen"></i>
          </Button>
          <Button 
            variant="link" 
            className="p-0 text-danger" 
            onClick={onRemove}
            title="Remove widget"
          >
            <i className="bi bi-x-lg"></i>
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="d-flex flex-column justify-content-center align-items-center">
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status" />
            <p className="mt-2">Loading velocity data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : !config.teamId ? (
          <div className="text-center">
            <p>No team selected</p>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={onUpdateConfig}
            >
              Configure Widget
            </Button>
          </div>
        ) : data && data.labels.length === 0 ? (
          <div className="text-center">
            <p>No sprint data available for this team</p>
          </div>
        ) : (
          <div className="chart-container" style={{ width: '100%', height: '100%' }}>
            <Bar 
              data={data} 
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Team Velocity Across Sprints'
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Story Points'
                    }
                  }
                }
              }}
            />
          </div>
        )}
      </Card.Body>
      {config.teamId && (
        <Card.Footer className="text-center text-muted">
          <small>Showing velocity for last {config.sprints} sprints</small>
        </Card.Footer>
      )}
    </Card>
  );
};

export default TeamVelocityWidget; 