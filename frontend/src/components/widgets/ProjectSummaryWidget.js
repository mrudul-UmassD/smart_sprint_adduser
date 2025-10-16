import React, { useEffect, useState } from 'react';
import { Spinner, Alert, ProgressBar } from 'react-bootstrap';
import axios from '../../utils/axiosConfig';

const ProjectSummaryWidget = ({ config }) => {
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
    } else {
      setLoading(false);
      setError('No project selected');
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
          <ProgressBar 
            now={projectData.completionRate} 
            variant={
              projectData.completionRate < 30 ? "danger" : 
              projectData.completionRate < 70 ? "warning" : "success"
            }
          />
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

export default ProjectSummaryWidget; 