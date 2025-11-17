import React, { useState, useEffect, useCallback } from 'react';
import { Card, Spinner, Alert, Button } from 'react-bootstrap';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from '../../utils/axiosConfig';

// Register the required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const TaskPriorityWidget = ({ 
  onRemove, 
  onUpdateConfig, 
  onToggleFullscreen,
  config = { projectId: null, limit: 5 } 
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If no project is selected, use placeholder data
      if (!config.projectId) {
        setData({
          labels: ['High', 'Medium', 'Low'],
          datasets: [{
            data: [3, 6, 2],
            backgroundColor: ['#dc3545', '#ffc107', '#28a745'],
            borderWidth: 1
          }]
        });
        setLoading(false);
        return;
      }

      // Otherwise fetch real data from API
      const response = await axios.get(`/api/projects/${config.projectId}/tasks/priority-distribution`);
      
      // Transform the data for the chart
      const priorities = response.data.priorityDistribution;
      
      setData({
        labels: Object.keys(priorities),
        datasets: [{
          data: Object.values(priorities),
          backgroundColor: ['#dc3545', '#ffc107', '#28a745', '#6c757d'],
          borderWidth: 1
        }]
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching task priority data:', err);
      setError('Failed to load priority data');
      setLoading(false);
    }
  }, [config.projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Card className="h-100 widget">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div>
          <i className="bi bi-list-check me-2"></i>
          Task Priority Distribution
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
            <p className="mt-2">Loading priority data...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : !config.projectId ? (
          <div className="text-center">
            <p>No project selected</p>
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
            <p>No tasks found for this project</p>
          </div>
        ) : (
          <div className="chart-container" style={{ width: '100%', height: '100%' }}>
            <Pie 
              data={data} 
              options={{
                maintainAspectRatio: false,
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  title: {
                    display: true,
                    text: 'Tasks by Priority'
                  }
                }
              }}
            />
          </div>
        )}
      </Card.Body>
      {config.projectId && (
        <Card.Footer className="text-center text-muted">
          <small>Showing priority distribution for selected project</small>
        </Card.Footer>
      )}
    </Card>
  );
};

export default TaskPriorityWidget;