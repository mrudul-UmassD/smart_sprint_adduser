import React from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { Bar, Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
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
  BarElement,
  Title, 
  Tooltip, 
  Legend
);

const VelocityReport = ({ data, theme }) => {
  if (!data || !data.sprints || data.sprints.length === 0) {
    return (
      <div className="text-center p-4">
        <p>No velocity data available for the selected parameters.</p>
      </div>
    );
  }

  // Create line chart data for velocity over time
  const velocityLineData = {
    labels: data.sprints.map(sprint => sprint.name),
    datasets: [
      {
        label: 'Velocity',
        data: data.sprints.map(sprint => sprint.velocity),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.1
      }
    ]
  };

  // Create bar chart data for completed story points per sprint
  const storyPointsBarData = {
    labels: data.sprints.map(sprint => sprint.name),
    datasets: [
      {
        label: 'Completed Story Points',
        data: data.sprints.map(sprint => sprint.completedStoryPoints),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      },
      {
        label: 'Committed Story Points',
        data: data.sprints.map(sprint => sprint.committedStoryPoints),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#fff' : '#666'
        }
      }
    }
  };

  // Calculate metrics
  const averageVelocity = data.sprints.reduce((sum, sprint) => sum + sprint.velocity, 0) / data.sprints.length;
  const lastSprintVelocity = data.sprints[data.sprints.length - 1].velocity;
  const velocityTrend = lastSprintVelocity > averageVelocity ? 'Increasing' : 'Decreasing';
  
  // Calculate completion rate
  const totalCommitted = data.sprints.reduce((sum, sprint) => sum + sprint.committedStoryPoints, 0);
  const totalCompleted = data.sprints.reduce((sum, sprint) => sum + sprint.completedStoryPoints, 0);
  const completionRate = totalCommitted > 0 ? (totalCompleted / totalCommitted) * 100 : 0;

  // Check if team info exists
  const teamInfo = data.teamName ? (
    <p className="mb-3">Team: <strong>{data.teamName}</strong></p>
  ) : null;

  return (
    <>
      <Row className="mb-4">
        <Col md={12}>
          {teamInfo}
          <h5>Velocity Trend</h5>
          <div className="chart-container" style={{ height: '300px' }}>
            <Line data={velocityLineData} options={chartOptions} />
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <h5>Story Points by Sprint</h5>
          <div className="chart-container" style={{ height: '300px' }}>
            <Bar 
              data={storyPointsBarData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.dataset.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value} points`;
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Velocity Metrics</h6>
            </Card.Header>
            <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <div className="d-flex justify-content-between mb-2">
                <div>Average Velocity:</div>
                <div><strong>{averageVelocity.toFixed(1)}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Latest Velocity:</div>
                <div><strong>{lastSprintVelocity.toFixed(1)}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Velocity Trend:</div>
                <div>
                  <strong className={velocityTrend === 'Increasing' ? 'text-success' : 'text-danger'}>
                    {velocityTrend}
                  </strong>
                </div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Completion Rate:</div>
                <div><strong>{Math.round(completionRate)}%</strong></div>
              </div>
              <div className="d-flex justify-content-between">
                <div>Total Sprints Analyzed:</div>
                <div><strong>{data.sprints.length}</strong></div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Predictability</h6>
            </Card.Header>
            <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <div className="d-flex justify-content-between mb-2">
                <div>Total Committed Points:</div>
                <div><strong>{totalCommitted}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Total Completed Points:</div>
                <div><strong>{totalCompleted}</strong></div>
              </div>
              <div className="d-flex justify-content-between">
                <div>Predictability:</div>
                <div>
                  <strong className={completionRate >= 80 ? 'text-success' : completionRate >= 60 ? 'text-warning' : 'text-danger'}>
                    {completionRate >= 80 ? 'High' : completionRate >= 60 ? 'Medium' : 'Low'}
                  </strong>
                </div>
              </div>
              <div className="mt-3">
                <p className="mb-0 small text-muted">
                  <strong>Note:</strong> Predictability is a measure of how accurately the team can estimate their capacity.
                  {completionRate >= 80 
                    ? ' Current predictability is high, indicating good estimation accuracy.'
                    : completionRate >= 60 
                      ? ' Current predictability is medium, indicating some estimation improvements needed.'
                      : ' Current predictability is low, indicating significant estimation challenges.'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Sprint Data</h6>
            </Card.Header>
            <Card.Body className={`p-0 ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <Table striped bordered hover variant={theme === 'dark' ? 'dark' : ''} className="mb-0">
                  <thead>
                    <tr>
                      <th>Sprint</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Velocity</th>
                      <th>Committed</th>
                      <th>Completed</th>
                      <th>Completion %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.sprints.map((sprint, index) => {
                      const sprintCompletion = sprint.committedStoryPoints > 0 
                        ? (sprint.completedStoryPoints / sprint.committedStoryPoints) * 100 
                        : 0;
                      
                      return (
                        <tr key={index}>
                          <td>{sprint.name}</td>
                          <td>{sprint.startDate}</td>
                          <td>{sprint.endDate}</td>
                          <td>{sprint.velocity.toFixed(1)}</td>
                          <td>{sprint.committedStoryPoints}</td>
                          <td>{sprint.completedStoryPoints}</td>
                          <td>
                            <span className={
                              sprintCompletion >= 80 ? 'text-success' : 
                              sprintCompletion >= 60 ? 'text-warning' : 
                              'text-danger'
                            }>
                              {Math.round(sprintCompletion)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default VelocityReport; 