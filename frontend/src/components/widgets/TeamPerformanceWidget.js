import React, { useEffect, useState } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import axios from '../../utils/axiosConfig';
import { Bar } from 'react-chartjs-2';

const TeamPerformanceWidget = ({ config }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamPerformance = async () => {
      try {
        const response = await axios.get(`/api/analytics/teams/${encodeURIComponent(config.team)}/performance`);
        
        const data = {
          labels: response.data.map(member => member.name),
          datasets: [
            {
              label: 'Tasks Completed',
              data: response.data.map(member => member.tasksCompleted),
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgb(75, 192, 192)',
              borderWidth: 1
            },
            {
              label: 'Tasks Assigned',
              data: response.data.map(member => member.tasksAssigned),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgb(54, 162, 235)',
              borderWidth: 1
            }
          ]
        };
        
        setPerformanceData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team performance:', err);
        setError('Could not load team performance data');
        setLoading(false);
      }
    };

    if (config.team) {
      fetchTeamPerformance();
    } else {
      setLoading(false);
      setError('No team selected');
    }
  }, [config.team]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!performanceData) return <Alert variant="info">No team performance data available</Alert>;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: `${config.team} Team Performance`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Tasks'
        }
      }
    }
  };

  return (
    <div className="team-performance-widget h-100">
      <div style={{ height: '100%', minHeight: '180px' }}>
        <Bar data={performanceData} options={options} />
      </div>
    </div>
  );
};

export default TeamPerformanceWidget;