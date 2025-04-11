import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import axios from 'axios';
import { API_BASE_URL } from '../config';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = ({ projectId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [teamPerformance, setTeamPerformance] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [burndown, setBurndown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [analyticsRes, teamRes, timelineRes, burndownRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/analytics/project/${projectId}`),
          axios.get(`${API_BASE_URL}/analytics/team/development`),
          axios.get(`${API_BASE_URL}/analytics/timeline/${projectId}`),
          axios.get(`${API_BASE_URL}/analytics/burndown/${projectId}`)
        ]);

        setAnalytics(analyticsRes.data);
        setTeamPerformance(teamRes.data);
        setTimeline(timelineRes.data);
        setBurndown(burndownRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch analytics');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  const statusChartData = {
    labels: Object.keys(analytics.taskMetrics.statusDistribution),
    datasets: [{
      data: Object.values(analytics.taskMetrics.statusDistribution),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0'
      ]
    }]
  };

  const priorityChartData = {
    labels: Object.keys(analytics.taskMetrics.priorityDistribution),
    datasets: [{
      data: Object.values(analytics.taskMetrics.priorityDistribution),
      backgroundColor: [
        '#FF6384',
        '#36A2EB',
        '#FFCE56',
        '#4BC0C0'
      ]
    }]
  };

  const burndownChartData = {
    labels: burndown.dates.map(date => new Date(date).toLocaleDateString()),
    datasets: [
      {
        label: 'Actual Burndown',
        data: burndown.remainingTasks,
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4
      },
      {
        label: 'Ideal Burndown',
        data: burndown.idealBurndown,
        borderColor: '#36A2EB',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderDash: [5, 5],
        tension: 0.4
      }
    ]
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Project Analytics</h2>
      
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Task Status Distribution</Card.Title>
              <Pie data={statusChartData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Task Priority Distribution</Card.Title>
              <Pie data={priorityChartData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Project Burndown Chart</Card.Title>
              <Line 
                data={burndownChartData}
                options={{
                  responsive: true,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Card.Title>Team Performance</Card.Title>
              <table className="table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Total Tasks</th>
                    <th>Completed Tasks</th>
                    <th>Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {teamPerformance.userPerformance.map(user => (
                    <tr key={user.username}>
                      <td>{user.username}</td>
                      <td>{user.totalTasks}</td>
                      <td>{user.completedTasks}</td>
                      <td>{user.completionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics; 