import React from 'react';
import { Row, Col, Card, Table, ProgressBar } from 'react-bootstrap';
import { Pie, Bar } from 'react-chartjs-2';
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

const ProjectReport = ({ data, theme }) => {
  if (!data) {
    return (
      <div className="text-center p-4">
        <p>No project data available for the selected parameters.</p>
      </div>
    );
  }

  // Color palettes
  const statusColors = {
    'Not Started': 'rgba(108, 117, 125, 0.8)',    // gray
    'In Progress': 'rgba(0, 123, 255, 0.8)',      // blue
    'In Review': 'rgba(255, 193, 7, 0.8)',        // yellow
    'Completed': 'rgba(40, 167, 69, 0.8)',        // green
    'Blocked': 'rgba(220, 53, 69, 0.8)',          // red
  };

  const priorityColors = {
    'Low': 'rgba(23, 162, 184, 0.8)',            // cyan
    'Medium': 'rgba(255, 193, 7, 0.8)',          // yellow
    'High': 'rgba(255, 127, 80, 0.8)',           // coral
    'Critical': 'rgba(220, 53, 69, 0.8)',        // red
  };

  // Create task status chart data
  const taskStatusData = {
    labels: Object.keys(data.tasksByStatus),
    datasets: [
      {
        data: Object.values(data.tasksByStatus),
        backgroundColor: Object.keys(data.tasksByStatus).map(status => statusColors[status] || 'rgba(0, 0, 0, 0.1)'),
        borderWidth: 1
      }
    ]
  };

  // Create task priority chart data
  const taskPriorityData = {
    labels: Object.keys(data.tasksByPriority),
    datasets: [
      {
        data: Object.values(data.tasksByPriority),
        backgroundColor: Object.keys(data.tasksByPriority).map(priority => priorityColors[priority] || 'rgba(0, 0, 0, 0.1)'),
        borderWidth: 1
      }
    ]
  };

  // Create team members task distribution bar chart
  let teamMembersData = null;
  if (data.tasksByAssignee && data.tasksByAssignee.length > 0) {
    // Sort by most tasks first
    const sortedMembers = [...data.tasksByAssignee].sort((a, b) => b.taskCount - a.taskCount);
    
    teamMembersData = {
      labels: sortedMembers.map(member => member.name),
      datasets: [
        {
          label: 'Assigned Tasks',
          data: sortedMembers.map(member => member.taskCount),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
        },
        {
          label: 'Completed Tasks',
          data: sortedMembers.map(member => member.completedCount || 0),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        }
      ]
    };
  }

  const pieChartOptions = {
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

  // Calculate metrics
  const totalTasks = Object.values(data.tasksByStatus).reduce((a, b) => a + b, 0);
  const completedTasks = data.tasksByStatus['Completed'] || 0;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  // Calculate priority distribution percentages
  const totalPriorities = Object.values(data.tasksByPriority).reduce((a, b) => a + b, 0);
  const criticalPercentage = totalPriorities > 0 ? ((data.tasksByPriority['Critical'] || 0) / totalPriorities) * 100 : 0;
  const highPercentage = totalPriorities > 0 ? ((data.tasksByPriority['High'] || 0) / totalPriorities) * 100 : 0;
  
  // Check if project info exists
  const projectInfo = data.projectName ? (
    <div className="mb-3">
      <h4>{data.projectName}</h4>
      {data.projectDescription && <p>{data.projectDescription}</p>}
    </div>
  ) : null;

  return (
    <>
      {projectInfo}
      
      <Row className="mb-4">
        <Col md={6}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Progress Overview</h6>
            </Card.Header>
            <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <div>Project Completion:</div>
                  <div><strong>{Math.round(completionRate)}%</strong></div>
                </div>
                <ProgressBar 
                  now={completionRate} 
                  variant={
                    completionRate >= 75 ? 'success' : 
                    completionRate >= 50 ? 'info' : 
                    completionRate >= 25 ? 'warning' : 
                    'danger'
                  } 
                />
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <div>Total Tasks:</div>
                <div><strong>{totalTasks}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Completed Tasks:</div>
                <div><strong>{completedTasks}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>In Progress:</div>
                <div><strong>{data.tasksByStatus['In Progress'] || 0}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>In Review:</div>
                <div><strong>{data.tasksByStatus['In Review'] || 0}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Not Started:</div>
                <div><strong>{data.tasksByStatus['Not Started'] || 0}</strong></div>
              </div>
              <div className="d-flex justify-content-between">
                <div>Blocked:</div>
                <div><strong>{data.tasksByStatus['Blocked'] || 0}</strong></div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Risk Assessment</h6>
            </Card.Header>
            <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <div>Project Status:</div>
                  <div>
                    <strong className={
                      completionRate >= data.expectedProgress ? 'text-success' : 'text-danger'
                    }>
                      {completionRate >= data.expectedProgress ? 'On Track' : 'Behind Schedule'}
                    </strong>
                  </div>
                </div>
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <div>High Priority Tasks:</div>
                <div><strong>{data.tasksByPriority['High'] || 0}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Critical Tasks:</div>
                <div><strong>{data.tasksByPriority['Critical'] || 0}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Critical + High Tasks:</div>
                <div>
                  <strong>{(data.tasksByPriority['Critical'] || 0) + (data.tasksByPriority['High'] || 0)}</strong>
                  <span className="ms-1 text-muted">
                    ({Math.round(criticalPercentage + highPercentage)}% of total)
                  </span>
                </div>
              </div>
              
              {data.dueDate && (
                <div className="d-flex justify-content-between mb-2">
                  <div>Due Date:</div>
                  <div><strong>{data.dueDate}</strong></div>
                </div>
              )}
              
              {data.daysLeft !== undefined && (
                <div className="d-flex justify-content-between mb-2">
                  <div>Days Remaining:</div>
                  <div>
                    <strong className={data.daysLeft < 7 ? 'text-danger' : 'text-primary'}>
                      {data.daysLeft}
                    </strong>
                  </div>
                </div>
              )}
              
              <div className="risk-assessment mt-3">
                <div className="d-flex justify-content-between mb-1">
                  <div>Risk Level:</div>
                  <div>
                    <strong className={
                      criticalPercentage > 20 || data.daysLeft < 5 ? 'text-danger' :
                      highPercentage > 40 || data.daysLeft < 10 ? 'text-warning' :
                      'text-success'
                    }>
                      {criticalPercentage > 20 || data.daysLeft < 5 ? 'High' :
                       highPercentage > 40 || data.daysLeft < 10 ? 'Medium' :
                       'Low'}
                    </strong>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Task Status Distribution</h6>
            </Card.Header>
            <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <div style={{ height: '250px' }}>
                <Pie data={taskStatusData} options={pieChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Task Priority Distribution</h6>
            </Card.Header>
            <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <div style={{ height: '250px' }}>
                <Pie data={taskPriorityData} options={pieChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {teamMembersData && (
        <Row className="mb-4">
          <Col md={12}>
            <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
              <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <h6 className="mb-0">Task Distribution by Team Member</h6>
              </Card.Header>
              <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <div style={{ height: '300px' }}>
                  <Bar data={teamMembersData} options={barChartOptions} />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {data.tasksByCategory && Object.keys(data.tasksByCategory).length > 0 && (
        <Row>
          <Col md={12}>
            <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
              <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <h6 className="mb-0">Task Categories</h6>
              </Card.Header>
              <Card.Body className={`p-0 ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
                <Table striped bordered hover variant={theme === 'dark' ? 'dark' : ''} className="mb-0">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Task Count</th>
                      <th>Completed</th>
                      <th>Completion %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.tasksByCategory).map(([category, count], index) => (
                      <tr key={index}>
                        <td>{category}</td>
                        <td>{count.total}</td>
                        <td>{count.completed}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2" style={{ width: '60%' }}>
                              <ProgressBar 
                                now={count.total > 0 ? (count.completed / count.total) * 100 : 0} 
                                variant={
                                  count.total > 0 && (count.completed / count.total) >= 0.75 ? 'success' : 
                                  count.total > 0 && (count.completed / count.total) >= 0.5 ? 'info' : 
                                  count.total > 0 && (count.completed / count.total) >= 0.25 ? 'warning' : 
                                  'danger'
                                } 
                                style={{ height: '8px' }}
                              />
                            </div>
                            <div>
                              {count.total > 0 ? Math.round((count.completed / count.total) * 100) : 0}%
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
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

export default ProjectReport; 