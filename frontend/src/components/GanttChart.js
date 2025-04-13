import React, { useState, useEffect } from 'react';
import { Gantt, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import axios from 'axios';
import { Container, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import API_CONFIG from '../config';

const GanttChart = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState(ViewMode.Month);
  const { projectId } = useParams();

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.TASKS_ENDPOINT}/project/${projectId}`);
      
      if (response.data) {
        // Transform tasks into Gantt chart format
        const ganttTasks = response.data.map(task => {
          return {
            id: task._id,
            name: task.title,
            start: task.startDate ? new Date(task.startDate) : new Date(),
            end: task.endDate ? new Date(task.endDate) : moment().add(1, 'days').toDate(),
            progress: task.completion / 100 || 0,
            dependencies: task.dependencies.map(dep => dep.task),
            type: 'task',
            project: task.project,
            styles: { 
              progressColor: getTaskStatusColor(task.status),
              progressSelectedColor: getTaskStatusColor(task.status, true)
            }
          };
        });
        
        setTasks(ganttTasks);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching tasks for Gantt chart:', err);
      setError('Failed to load tasks. Please try again later.');
      setLoading(false);
    }
  };
  
  const getTaskStatusColor = (status, isSelected = false) => {
    const opacity = isSelected ? '1' : '0.8';
    switch (status) {
      case 'Todo':
        return `rgba(108, 117, 125, ${opacity})`;
      case 'In Progress':
        return `rgba(0, 123, 255, ${opacity})`;
      case 'Review':
        return `rgba(255, 193, 7, ${opacity})`;
      case 'Needs Work':
        return `rgba(220, 53, 69, ${opacity})`;
      case 'Completed':
        return `rgba(40, 167, 69, ${opacity})`;
      default:
        return `rgba(108, 117, 125, ${opacity})`;
    }
  };
  
  const handleTaskChange = async (task) => {
    try {
      // Find the original task
      const originalTask = tasks.find(t => t.id === task.id);
      if (!originalTask) return;
      
      // Update in backend if dates changed
      if (task.start !== originalTask.start || task.end !== originalTask.end) {
        await axios.patch(`${API_CONFIG.TASKS_ENDPOINT}/${task.id}`, {
          startDate: task.start,
          endDate: task.end,
          completion: task.progress * 100
        });
      }
      
      // Update locally
      setTasks(tasks.map(t => (t.id === task.id ? task : t)));
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };
  
  const handleViewModeChange = (e) => {
    const mode = e.target.value;
    switch (mode) {
      case 'Hour':
        setViewMode(ViewMode.Hour);
        break;
      case 'QuarterDay':
        setViewMode(ViewMode.QuarterDay);
        break;
      case 'HalfDay':
        setViewMode(ViewMode.HalfDay);
        break;
      case 'Day':
        setViewMode(ViewMode.Day);
        break;
      case 'Week':
        setViewMode(ViewMode.Week);
        break;
      case 'Month':
        setViewMode(ViewMode.Month);
        break;
      case 'Year':
        setViewMode(ViewMode.Year);
        break;
      default:
        setViewMode(ViewMode.Month);
    }
  };

  return (
    <Container fluid className="py-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Project Timeline</h5>
            <Form.Select 
              style={{ width: 'auto' }} 
              value={viewMode} 
              onChange={handleViewModeChange}
            >
              <option value={ViewMode.Hour}>Hour</option>
              <option value={ViewMode.QuarterDay}>Quarter Day</option>
              <option value={ViewMode.HalfDay}>Half Day</option>
              <option value={ViewMode.Day}>Day</option>
              <option value={ViewMode.Week}>Week</option>
              <option value={ViewMode.Month}>Month</option>
              <option value={ViewMode.Year}>Year</option>
            </Form.Select>
          </div>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading project timeline...</p>
            </div>
          ) : tasks.length === 0 ? (
            <Alert variant="info">
              No tasks found for this project. Add tasks to view the timeline.
            </Alert>
          ) : (
            <div className="gantt-container" style={{ height: '500px', overflow: 'auto' }}>
              <Gantt
                tasks={tasks}
                viewMode={viewMode}
                onDateChange={handleTaskChange}
                listCellWidth=""
                columnWidth={60}
                todayColor="rgba(252, 182, 121, 0.53)"
                ganttHeight={400}
              />
            </div>
          )}
          
          <div className="mt-3">
            <Button variant="outline-primary" size="sm" onClick={fetchTasks}>
              Refresh Timeline
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default GanttChart; 