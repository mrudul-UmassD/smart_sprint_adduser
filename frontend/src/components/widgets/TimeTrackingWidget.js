import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Button, ListGroup } from 'react-bootstrap';
import { PlayArrow, Pause, Timer } from '@mui/icons-material';
import BaseWidget from './BaseWidget';
import API_CONFIG from '../../config';

const TimeTrackingWidget = ({
  title = 'Time Tracking',
  config = {},
  onRemove,
  onConfigure
}) => {
  const [timeEntries, setTimeEntries] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingStartTime, setTrackingStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default configuration
  const { daysToShow = 7, showOnlyMyTasks = true } = config;

  useEffect(() => {
    const fetchTimeEntries = async () => {
      try {
        setLoading(true);
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysToShow);
        
        // Format dates for the API
        const formattedStartDate = startDate.toISOString().split('T')[0];
        const formattedEndDate = endDate.toISOString().split('T')[0];
        
        // Build query parameters
        const params = new URLSearchParams();
        params.append('startDate', formattedStartDate);
        params.append('endDate', formattedEndDate);
        if (showOnlyMyTasks) {
          params.append('myEntriesOnly', 'true');
        }
        
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.TASKS_ENDPOINT}/timeEntries?${params.toString()}`
        );
        
        setTimeEntries(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching time entries:', err);
        setError(err.response?.data?.message || 'Failed to load time entries');
        setLoading(false);
      }
    };
    
    fetchTimeEntries();
    
    // Timer for active tracking
    let timerId;
    if (isTracking) {
      timerId = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - trackingStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [daysToShow, showOnlyMyTasks, isTracking, trackingStartTime]);
  
  // Format seconds to HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Start time tracking for a task
  const startTracking = (taskId, taskTitle) => {
    setActiveTask({ id: taskId, title: taskTitle });
    setIsTracking(true);
    setTrackingStartTime(new Date());
    setElapsedTime(0);
  };
  
  // Stop time tracking
  const stopTracking = async () => {
    if (!activeTask) return;
    
    try {
      const duration = Math.floor(elapsedTime / 60); // Convert to minutes
      
      // Only save if tracked more than 1 minute
      if (duration >= 1) {
        await axios.post(`${API_CONFIG.BASE_URL}${API_CONFIG.TASKS_ENDPOINT}/${activeTask.id}/time`, {
          duration,
          description: `Time tracked on ${new Date().toLocaleDateString()}`
        });
        
        // Refresh time entries
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}${API_CONFIG.TASKS_ENDPOINT}/timeEntries?myEntriesOnly=true`
        );
        setTimeEntries(response.data);
      }
    } catch (err) {
      console.error('Error saving time entry:', err);
      setError('Failed to save time entry');
    }
    
    setIsTracking(false);
    setActiveTask(null);
    setElapsedTime(0);
  };
  
  // Calculate time tracked per day for the chart
  const getTimeTrackingChartData = () => {
    if (timeEntries.length === 0) return null;
    
    // Group entries by date
    const entriesByDate = timeEntries.reduce((acc, entry) => {
      const date = new Date(entry.startTime).toLocaleDateString();
      if (!acc[date]) acc[date] = 0;
      acc[date] += entry.duration; // Duration in minutes
      return acc;
    }, {});
    
    // Generate labels for last N days
    const labels = [];
    const data = [];
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      
      labels.push(dateStr);
      data.push((entriesByDate[dateStr] || 0) / 60); // Convert to hours
    }
    
    return {
      labels,
      datasets: [
        {
          label: 'Hours Tracked',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
        }
      ]
    };
  };
  
  const chartData = getTimeTrackingChartData();
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };

  return (
    <BaseWidget
      title={title}
      onRemove={onRemove}
      onConfigure={onConfigure}
      loading={loading}
      error={error}
    >
      <div className="time-tracking">
        {isTracking ? (
          <div className="active-tracking mb-3 p-3 bg-light rounded">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h6 className="mb-1">Tracking: {activeTask?.title}</h6>
                <div className="timer">
                  <Timer fontSize="small" className="me-1" />
                  <span className="time-display">{formatTime(elapsedTime)}</span>
                </div>
              </div>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={stopTracking}
                className="rounded-circle p-2"
              >
                <Pause />
              </Button>
            </div>
          </div>
        ) : null}
        
        <div className="chart-container mb-3" style={{ height: '150px' }}>
          {chartData ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <p className="text-muted text-center pt-3">No time tracking data available</p>
          )}
        </div>
        
        <h6 className="mb-2">Recent Time Entries</h6>
        {timeEntries.length > 0 ? (
          <ListGroup variant="flush" className="recent-entries">
            {timeEntries.slice(0, 3).map(entry => (
              <ListGroup.Item key={entry._id} className="px-0 py-2 d-flex justify-content-between align-items-center">
                <div className="entry-details">
                  <div className="entry-task">{entry.taskTitle}</div>
                  <small className="text-muted">
                    {new Date(entry.startTime).toLocaleDateString()} • 
                    {Math.round(entry.duration / 60 * 10) / 10} hrs
                  </small>
                </div>
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => startTracking(entry.taskId, entry.taskTitle)}
                  className="rounded-circle p-1"
                >
                  <PlayArrow fontSize="small" />
                </Button>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-muted">No recent time entries</p>
        )}
      </div>
    </BaseWidget>
  );
};

export default TimeTrackingWidget; 