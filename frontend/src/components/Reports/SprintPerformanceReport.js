import React from 'react';
import { Row, Col, Card, Table, Badge, ProgressBar } from 'react-bootstrap';
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

const SprintPerformanceReport = ({ data, theme }) => {
  if (!data) {
    return (
      <div className="text-center p-4">
        <p>No sprint data available for the selected parameters.</p>
      </div>
    );
  }

  // Create burndown chart data if available
  let burndownChartData = null;
  if (data.burndown && data.burndown.dates && data.burndown.remainingTasks) {
    burndownChartData = {
      labels: data.burndown.dates,
      datasets: [
        {
          label: 'Actual Remaining Tasks',
          data: data.burndown.remainingTasks,
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          fill: true,
          tension: 0.1
        }
      ]
    };
    
    // Add ideal burndown line if available
    if (data.burndown.idealBurndown) {
      burndownChartData.datasets.push({
        label: 'Ideal Burndown',
        data: data.burndown.idealBurndown,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderDash: [5, 5],
        tension: 0
      });
    }
  }

  // Create daily velocity chart if available
  let velocityChartData = null;
  if (data.dailyActivity && data.dailyActivity.dates && data.dailyActivity.completedTasks) {
    velocityChartData = {
      labels: data.dailyActivity.dates,
      datasets: [
        {
          label: 'Tasks Completed',
          data: data.dailyActivity.completedTasks,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1,
          type: 'bar'
        }
      ]
    };
  }

  // Create team performance chart data if available
  let teamPerformanceData = null;
  if (data.teamPerformance && data.teamPerformance.length > 0) {
    const sortedMembers = [...data.teamPerformance].sort((a, b) => b.completionRate - a.completionRate);
    
    teamPerformanceData = {
      labels: sortedMembers.map(member => member.name),
      datasets: [
        {
          label: 'Assigned Tasks',
          data: sortedMembers.map(member => member.totalTasks),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        },
        {
          label: 'Completed Tasks',
          data: sortedMembers.map(member => member.completedTasks),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgb(75, 192, 192)',
          borderWidth: 1
        }
      ]
    };
  }

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

  // Determine status based on progress
  const getStatusColor = (completionRate, expectedProgress) => {
    // If no expected progress provided, use reasonable defaults
    const target = expectedProgress || (data.isCompleted ? 100 : 75);
    
    if (completionRate >= target) return 'success';
    if (completionRate >= target * 0.8) return 'warning';
    return 'danger';
  };

  const statusColor = getStatusColor(data.completionRate, data.expectedProgress);
  const isCompleted = data.isCompleted || false;
  const sprintInfo = data.sprintInfo || {};

  return (
    <>
      <Row className="mb-4">
        <Col md={12}>
          <div className="mb-3">
            <h4>{sprintInfo.name || 'Sprint Performance'}</h4>
            {sprintInfo.description && <p>{sprintInfo.description}</p>}
            {sprintInfo.startDate && sprintInfo.endDate && (
              <p className="mb-3">
                Duration: <strong>{sprintInfo.startDate}</strong> to <strong>{sprintInfo.endDate}</strong>
                {data.duration && ` (${data.duration} days)`}
              </p>
            )}
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Sprint Overview</h6>
            </Card.Header>
            <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <div>Progress:</div>
                  <div><strong>{data.completionRate}%</strong></div>
                </div>
                <ProgressBar 
                  now={data.completionRate} 
                  variant={statusColor} 
                />
              </div>

              <div className="d-flex justify-content-between mb-2">
                <div>Status:</div>
                <div>
                  {isCompleted ? (
                    <Badge bg="success">Completed</Badge>
                  ) : (
                    <Badge bg={statusColor}>
                      {statusColor === 'success' ? 'On Track' : 
                       statusColor === 'warning' ? 'At Risk' : 
                       'Behind Schedule'}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <div>Total Tasks:</div>
                <div><strong>{data.taskStats.total}</strong></div>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <div>Completed Tasks:</div>
                <div><strong>{data.taskStats.completed}</strong></div>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <div>Story Points:</div>
                <div><strong>{data.storyPoints.total}</strong></div>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <div>Completed Points:</div>
                <div><strong>{data.storyPoints.completed}</strong></div>
              </div>
              
              <div className="d-flex justify-content-between">
                <div>Points Completion Rate:</div>
                <div>
                  <strong>
                    {data.storyPoints.total > 0 
                      ? Math.round((data.storyPoints.completed / data.storyPoints.total) * 100)
                      : 0}%
                  </strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Task Status Distribution</h6>
            </Card.Header>
            <Card.Body className={`p-0 ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
              {data.tasksByStatus ? (
                <Table striped bordered hover variant={theme === 'dark' ? 'dark' : ''} className="mb-0">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Count</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.tasksByStatus).map(([status, count], index) => (
                      <tr key={index}>
                        <td>
                          <Badge 
                            bg={
                              status === 'Completed' ? 'success' :
                              status === 'In Progress' ? 'warning' :
                              status === 'In Review' ? 'info' :
                              status === 'Blocked' ? 'danger' : 
                              'secondary'
                            }
                          >
                            {status}
                          </Badge>
                        </td>
                        <td>{count}</td>
                        <td>
                          {data.taskStats.total > 0 
                            ? Math.round((count / data.taskStats.total) * 100)
                            : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="p-3 text-center">No task status data available</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {burndownChartData && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
              <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <h6 className="mb-0">Sprint Burndown</h6>
              </Card.Header>
              <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <div className="chart-container" style={{ height: '300px' }}>
                  <Line data={burndownChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {velocityChartData && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
              <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <h6 className="mb-0">Daily Activity</h6>
              </Card.Header>
              <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <div className="chart-container" style={{ height: '300px' }}>
                  <Bar data={velocityChartData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {teamPerformanceData && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
              <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <h6 className="mb-0">Team Member Performance</h6>
              </Card.Header>
              <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <div className="chart-container" style={{ height: '300px' }}>
                  <Bar data={teamPerformanceData} options={chartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {data.teamPerformance && data.teamPerformance.length > 0 && (
        <Row>
          <Col md={12}>
            <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
              <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <h6 className="mb-0">Individual Contributions</h6>
              </Card.Header>
              <Card.Body className={`p-0 ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                <Table striped bordered hover variant={theme === 'dark' ? 'dark' : ''} className="mb-0">
                  <thead>
                    <tr>
                      <th>Team Member</th>
                      <th>Assigned Tasks</th>
                      <th>Completed</th>
                      <th>Completion Rate</th>
                      <th>Story Points Completed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.teamPerformance
                      .sort((a, b) => b.completionRate - a.completionRate)
                      .map((member, index) => (
                        <tr key={index}>
                          <td>{member.name}</td>
                          <td>{member.totalTasks}</td>
                          <td>{member.completedTasks}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="me-2" style={{ width: '60%' }}>
                                <ProgressBar 
                                  now={member.completionRate} 
                                  variant={
                                    member.completionRate >= 75 ? 'success' : 
                                    member.completionRate >= 50 ? 'info' : 
                                    member.completionRate >= 25 ? 'warning' : 
                                    'danger'
                                  } 
                                  style={{ height: '8px' }}
                                />
                              </div>
                              <div>
                                {Math.round(member.completionRate)}%
                              </div>
                            </div>
                          </td>
                          <td>{member.storyPoints || 0}</td>
                        </tr>
                      ))
                    }
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </>
  );
};

export default SprintPerformanceReport; 