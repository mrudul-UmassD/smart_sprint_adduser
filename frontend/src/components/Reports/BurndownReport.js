import React from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
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
  Title, 
  Tooltip, 
  Legend
);

const BurndownReport = ({ data, theme }) => {
  if (!data || !data.dates || !data.remainingTasks || !data.idealBurndown) {
    return (
      <div className="text-center p-4">
        <p>No burndown data available for the selected parameters.</p>
      </div>
    );
  }

  // Create chart data
  const chartData = {
    labels: data.dates,
    datasets: [
      {
        label: 'Actual Remaining Tasks',
        data: data.remainingTasks,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        tension: 0.1
      },
      {
        label: 'Ideal Burndown',
        data: data.idealBurndown,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
        borderDash: [5, 5],
        tension: 0
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Remaining Tasks'
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        },
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
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.raw} tasks`;
          }
        }
      }
    }
  };

  // Calculate metrics
  const startTasks = data.remainingTasks[0];
  const currentTasks = data.remainingTasks[data.remainingTasks.length - 1];
  const completedTasks = startTasks - currentTasks;
  const completionRate = startTasks > 0 ? (completedTasks / startTasks) * 100 : 0;
  
  const idealFinalTasks = data.idealBurndown[data.idealBurndown.length - 1];
  const isAheadOfSchedule = currentTasks <= idealFinalTasks;

  // Check if start date, end date and project info exists
  const projectInfo = data.projectName ? (
    <p className="mb-3">Project: <strong>{data.projectName}</strong></p>
  ) : null;

  const dateRange = data.startDate && data.endDate ? (
    <p className="mb-3">
      Period: <strong>{data.startDate}</strong> to <strong>{data.endDate}</strong>
    </p>
  ) : null;

  // Is the project ahead or behind schedule
  const scheduleStatus = isAheadOfSchedule ? (
    <div className="text-success">Ahead of schedule</div>
  ) : (
    <div className="text-danger">Behind schedule</div>
  );

  return (
    <>
      <Row className="mb-4">
        <Col md={12}>
          {projectInfo}
          {dateRange}
          <h5>Burndown Chart</h5>
          <div className="chart-container" style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Burndown Metrics</h6>
            </Card.Header>
            <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <div className="d-flex justify-content-between mb-2">
                <div>Initial Tasks:</div>
                <div><strong>{startTasks}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Current Remaining Tasks:</div>
                <div><strong>{currentTasks}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Completed Tasks:</div>
                <div><strong>{completedTasks}</strong></div>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <div>Completion Rate:</div>
                <div><strong>{Math.round(completionRate)}%</strong></div>
              </div>
              <div className="d-flex justify-content-between">
                <div>Status:</div>
                <strong>{scheduleStatus}</strong>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
            <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
              <h6 className="mb-0">Data Table</h6>
            </Card.Header>
            <Card.Body className={`p-0 ${theme === 'dark' ? 'bg-dark text-light' : ''}`}>
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                <Table striped bordered hover variant={theme === 'dark' ? 'dark' : ''} className="mb-0">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Remaining Tasks</th>
                      <th>Ideal Burndown</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.dates.map((date, index) => (
                      <tr key={index}>
                        <td>{date}</td>
                        <td>{data.remainingTasks[index]}</td>
                        <td>{data.idealBurndown[index]}</td>
                      </tr>
                    ))}
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

export default BurndownReport; 