import React, { useEffect, useState } from 'react';
import { Card, ProgressBar, Table, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import axios from '../../utils/axiosConfig';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { BsTrash } from 'react-icons/bs';
import ProjectSummaryWidget from './ProjectSummaryWidget';
import MyTasksWidget from './MyTasksWidget';
import BurndownChartWidget from './BurndownChartWidget';
import TeamPerformanceWidget from './TeamPerformanceWidget';

// Register ChartJS components
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

// Widget Components

export const ProjectSummaryWidget = ({ config }) => {
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjectSummary = async () => {
      try {
        const response = await axios.get(`/api/analytics/projects/${config.projectId}/summary`);
        setProjectData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching project summary:', err);
        setError('Could not load project summary data');
        setLoading(false);
      }
    };

    if (config.projectId) {
      fetchProjectSummary();
    }
  }, [config.projectId]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!projectData) return <Alert variant="info">No project data available</Alert>;

  return (
    <div className="project-summary-widget h-100">
      <h5>{projectData.name} Summary</h5>
      
      <div className="task-stats mt-3">
        <div className="d-flex justify-content-between">
          <div className="text-center">
            <div className="stat-value">{projectData.taskStats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="stat-value">{projectData.taskStats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="text-center">
            <div className="stat-value">{projectData.taskStats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="progress-container">
          <div className="d-flex justify-content-between mb-1">
            <span>Progress</span>
            <span>{projectData.completionRate}%</span>
          </div>
          <div className="progress">
            <div 
              className="progress-bar" 
              role="progressbar" 
              style={{ width: `${projectData.completionRate}%` }}
              aria-valuenow={projectData.completionRate} 
              aria-valuemin="0" 
              aria-valuemax="100"
            ></div>
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <small className="text-muted">
          Due {new Date(projectData.dueDate).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

export const TasksWidget = ({ config }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`/api/tasks/my-tasks?limit=${config.limit || 5}`);
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Could not load tasks data');
        setLoading(false);
      }
    };

    fetchTasks();
  }, [config.limit]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (tasks.length === 0) return <Alert variant="info">No tasks assigned to you</Alert>;

  // Helper function for priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div className="tasks-widget h-100">
      <h5>My Tasks</h5>
      <div className="task-list mt-3">
        {tasks.map(task => (
          <div key={task._id} className="task-item mb-2 p-2 border-bottom">
            <div className="d-flex justify-content-between">
              <div className="task-name">{task.title}</div>
              <span className={`badge bg-${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
            </div>
            <div className="task-project text-muted small">
              {task.project?.name}
            </div>
            <div className="task-due small">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const BurndownChartWidget = ({ config }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBurndownData = async () => {
      try {
        const response = await axios.get(`/api/analytics/projects/${config.projectId}/burndown`);
        
        const data = {
          labels: response.data.dates,
          datasets: [
            {
              label: 'Remaining Tasks',
              data: response.data.remainingTasks,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              tension: 0.1
            },
            {
              label: 'Ideal Burndown',
              data: response.data.idealBurndown,
              borderColor: 'rgb(255, 99, 132)',
              backgroundColor: 'rgba(255, 99, 132, 0.5)',
              borderDash: [5, 5],
              tension: 0
            }
          ]
        };
        
        setChartData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching burndown data:', err);
        setError('Could not load burndown chart data');
        setLoading(false);
      }
    };

    if (config.projectId) {
      fetchBurndownData();
    }
  }, [config.projectId]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!chartData) return <Alert variant="info">No burndown data available</Alert>;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Project Burndown Chart',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Remaining Tasks'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Date'
        }
      }
    }
  };

  return (
    <div className="burndown-chart-widget h-100">
      <div style={{ height: '100%', minHeight: '180px' }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export const TeamPerformanceWidget = ({ config }) => {
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

// Widget container component with remove functionality
const WidgetContainer = ({ widgetType, config, onRemove, children }) => {
  return (
    <Card className="dashboard-widget h-100">
      <Card.Body className="d-flex flex-column">
        <div className="widget-header d-flex justify-content-end mb-2">
          <Button 
            variant="link" 
            className="p-0 text-danger" 
            onClick={onRemove}
            aria-label="Remove widget"
          >
            <BsTrash />
          </Button>
        </div>
        <div className="widget-content flex-grow-1">
          {children}
        </div>
      </Card.Body>
    </Card>
  );
};

// Main component to render the appropriate widget based on type
const DashboardWidgets = ({ widgetId, widgetType, widgetConfig, onRemoveWidget }) => {
  // Render different widgets based on type
  const renderWidget = () => {
    switch (widgetType) {
      case 'projectSummary':
        return <ProjectSummaryWidget config={widgetConfig} />;
      case 'tasks':
        return <MyTasksWidget config={widgetConfig} />;
      case 'burndownChart':
        return <BurndownChartWidget config={widgetConfig} />;
      case 'teamPerformance':
        return <TeamPerformanceWidget config={widgetConfig} />;
      default:
        return <Alert variant="warning">Unknown widget type: {widgetType}</Alert>;
    }
  };

  return (
    <WidgetContainer
      widgetType={widgetType}
      config={widgetConfig}
      onRemove={() => onRemoveWidget(widgetId)}
    >
      {renderWidget()}
    </WidgetContainer>
  );
};

// Widget component mapping
const WIDGET_COMPONENTS = {
  'projectSummary': ProjectSummaryWidget,
  'tasks': MyTasksWidget,
  'burndownChart': BurndownChartWidget,
  'teamPerformance': TeamPerformanceWidget
};

// Widget renderer component
const DashboardWidget = ({ widgetType, config, ...props }) => {
  const WidgetComponent = WIDGET_COMPONENTS[widgetType];
  
  if (!WidgetComponent) {
    return (
      <div className="alert alert-warning">
        Unknown widget type: {widgetType}
      </div>
    );
  }
  
  return <WidgetComponent config={config} {...props} />;
};

export { 
  DashboardWidget,
  WIDGET_COMPONENTS,
  ProjectSummaryWidget,
  MyTasksWidget,
  BurndownChartWidget,
  TeamPerformanceWidget
};

export default DashboardWidgets; 