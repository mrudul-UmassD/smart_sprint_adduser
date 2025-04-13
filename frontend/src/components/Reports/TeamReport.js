import React from 'react';
import { Row, Col, Card, Table, ProgressBar, Badge } from 'react-bootstrap';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

const TeamReport = ({ data, theme }) => {
  if (!data || !data.members || data.members.length === 0) {
    return (
      <div className="text-center p-4">
        <p>No team data available for the selected parameters.</p>
      </div>
    );
  }

  // Sort members by completion rate
  const sortedMembers = [...data.members].sort((a, b) => b.completionRate - a.completionRate);
  
  // Create member performance chart data
  const memberPerformanceData = {
    labels: sortedMembers.map(member => member.name),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: sortedMembers.map(member => Math.round(member.completionRate)),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  // Create task distribution chart data
  const taskDistributionData = {
    labels: sortedMembers.map(member => member.name),
    datasets: [
      {
        label: 'Assigned Tasks',
        data: sortedMembers.map(member => member.totalTasks),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
      {
        label: 'Completed Tasks',
        data: sortedMembers.map(member => member.completedTasks),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  };

  // Create team-wide task status chart if available
  let taskStatusData = null;
  if (data.taskStatusDistribution) {
    const statusColors = {
      'Not Started': 'rgba(108, 117, 125, 0.8)',    // gray
      'In Progress': 'rgba(0, 123, 255, 0.8)',      // blue
      'In Review': 'rgba(255, 193, 7, 0.8)',        // yellow
      'Completed': 'rgba(40, 167, 69, 0.8)',        // green
      'Blocked': 'rgba(220, 53, 69, 0.8)',          // red
    };
    
    taskStatusData = {
      labels: Object.keys(data.taskStatusDistribution),
      datasets: [
        {
          data: Object.values(data.taskStatusDistribution),
          backgroundColor: Object.keys(data.taskStatusDistribution).map(status => 
            statusColors[status] || 'rgba(0, 0, 0, 0.1)'
          ),
          borderWidth: 1
        }
      ]
    };
  }

  const barChartOptions = {
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

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: theme === 'dark' ? '#fff' : '#666'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Calculate team metrics
  const teamTotalTasks = data.members.reduce((sum, member) => sum + member.totalTasks, 0);
  const teamCompletedTasks = data.members.reduce((sum, member) => sum + member.completedTasks, 0);
  const teamCompletionRate = teamTotalTasks > 0 ? (teamCompletedTasks / teamTotalTasks) * 100 : 0;
  
  // Calculate average tasks per member
  const avgTasksPerMember = data.members.length > 0 ? teamTotalTasks / data.members.length : 0;
  
  // Calculate workload distribution (standard deviation as percentage of mean)
  const taskCounts = data.members.map(member => member.totalTasks);
  const mean = taskCounts.reduce((a, b) => a + b, 0) / taskCounts.length;
  const variance = taskCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / taskCounts.length;
  const stdDev = Math.sqrt(variance);
  const workloadVariation = mean > 0 ? (stdDev / mean) * 100 : 0;
  
  // Determine workload balance level
  let workloadBalance = 'Balanced';
  let workloadBalanceVariant = 'success';
  
  if (workloadVariation > 50) {
    workloadBalance = 'Highly Unbalanced';
    workloadBalanceVariant = 'danger';
  } else if (workloadVariation > 30) {
    workloadBalance = 'Unbalanced';
    workloadBalanceVariant = 'warning';
  } else if (workloadVariation > 15) {
    workloadBalance = 'Slightly Unbalanced';
    workloadBalanceVariant = 'info';
  }

  // Get top performer (highest completion rate)
  const topPerformer = sortedMembers.length > 0 ? sortedMembers[0] : null;
  
  // Check if team info exists
  const teamInfo = data.teamName ? (
    <div className="mb-3">
      <h4>{data.teamName}</h4>
      {data.teamDescription && <p>{data.teamDescription}</p>}
    </div>
  ) : null;

  return (
    <>
      {teamInfo}
      
      <Row className="mb-4">
        <Col md={6}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Team Performance Overview</h6>
            </Card.Header>
            <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <div>Team Completion Rate:</div>
                  <div><strong>{Math.round(teamCompletionRate)}%</strong></div>
                </div>
                <ProgressBar 
                  now={teamCompletionRate} 
                  variant={
                    teamCompletionRate >= 75 ? 'success' : 
                    teamCompletionRate >= 50 ? 'info' : 
                    teamCompletionRate >= 25 ? 'warning' : 
                    'danger'
                  } 
                />
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <div>Team Members:</div>
                <div><strong>{data.members.length}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Total Tasks:</div>
                <div><strong>{teamTotalTasks}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Completed Tasks:</div>
                <div><strong>{teamCompletedTasks}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Average Tasks per Member:</div>
                <div><strong>{avgTasksPerMember.toFixed(1)}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Workload Balance:</div>
                <div>
                  <Badge bg={workloadBalanceVariant}>{workloadBalance}</Badge>
                </div>
              </div>
              
              {topPerformer && (
                <div className="d-flex justify-content-between">
                  <div>Top Performer:</div>
                  <div><strong>{topPerformer.name}</strong> ({Math.round(topPerformer.completionRate)}%)</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        {taskStatusData && (
          <Col md={6}>
            <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
              <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <h6 className="mb-0">Team Task Status</h6>
              </Card.Header>
              <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <div style={{ height: '250px' }}>
                  <Doughnut data={taskStatusData} options={doughnutChartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        )}
        
        {!taskStatusData && data.tasksByProject && Object.keys(data.tasksByProject).length > 0 && (
          <Col md={6}>
            <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
              <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <h6 className="mb-0">Tasks by Project</h6>
              </Card.Header>
              <Card.Body className={`p-0 ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                <Table striped bordered hover variant={theme === 'dark' ? 'dark' : ''} className="mb-0">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Tasks</th>
                      <th>Completed</th>
                      <th>Completion %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.tasksByProject).map(([project, stats], index) => (
                      <tr key={index}>
                        <td>{project}</td>
                        <td>{stats.total}</td>
                        <td>{stats.completed}</td>
                        <td>
                          {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Member Completion Rates</h6>
            </Card.Header>
            <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <div style={{ height: '300px' }}>
                <Bar data={memberPerformanceData} options={barChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Task Distribution</h6>
            </Card.Header>
            <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <div style={{ height: '300px' }}>
                <Bar data={taskDistributionData} options={barChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={12}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Team Member Details</h6>
            </Card.Header>
            <Card.Body className={`p-0 ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
              <Table striped bordered hover variant={theme === 'dark' ? 'dark' : ''} className="mb-0">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Assigned Tasks</th>
                    <th>Completed Tasks</th>
                    <th>Completion Rate</th>
                    <th>Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedMembers.map((member, index) => (
                    <tr key={index}>
                      <td>{member.name}</td>
                      <td>{member.role || 'N/A'}</td>
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
                      <td>
                        <Badge 
                          bg={
                            member.completionRate >= 75 ? 'success' : 
                            member.completionRate >= 50 ? 'info' : 
                            member.completionRate >= 25 ? 'warning' : 
                            'danger'
                          }
                        >
                          {member.completionRate >= 75 ? 'Excellent' : 
                           member.completionRate >= 50 ? 'Good' : 
                           member.completionRate >= 25 ? 'Fair' : 
                           'Needs Improvement'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default TeamReport; 