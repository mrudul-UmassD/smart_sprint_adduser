import React, { useState, useEffect } from 'react';
import { Card, Row, Col, ProgressBar, Badge, Spinner, Alert } from 'react-bootstrap';
import { BarChart, TrendingUp, Assignment, Group, Schedule, CheckCircle } from '@mui/icons-material';
import axios from 'axios';

const ProjectMetricsWidget = ({ config = {}, onRemove, onUpdateConfig, onToggleFullscreen }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjectMetrics();
  }, [config]);

  const fetchProjectMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for project metrics - replace with actual API call
      const mockMetrics = {
        projectName: 'Smart Sprint Dashboard',
        totalTasks: 45,
        completedTasks: 28,
        inProgressTasks: 12,
        todoTasks: 5,
        overdueTasks: 3,
        teamMembers: 8,
        activeMembers: 6,
        completionRate: 62,
        velocity: 23,
        burndownProgress: 75,
        sprintProgress: 68,
        criticalIssues: 2,
        blockedTasks: 1,
        estimatedCompletion: '2025-02-15',
        timeSpent: 156, // hours
        estimatedTime: 240, // hours
        efficiency: 85
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMetrics(mockMetrics);
    } catch (err) {
      console.error('Error fetching project metrics:', err);
      setError('Failed to load project metrics');
    } finally {
      setLoading(false);
    }
  };

  const getProgressVariant = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'info';
    if (percentage >= 40) return 'warning';
    return 'danger';
  };

  const MetricCard = ({ icon, title, value, subtitle, variant = 'primary' }) => (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body className="text-center">
        <div className={`text-${variant} mb-2`}>
          {icon}
        </div>
        <h4 className="mb-1">{value}</h4>
        <h6 className="text-muted mb-0">{title}</h6>
        {subtitle && <small className="text-muted">{subtitle}</small>}
      </Card.Body>
    </Card>
  );

  if (loading) {
    return (
      <Card className="h-100">
        <Card.Header className="d-flex align-items-center">
          <BarChart className="me-2" />
          <span>Project Metrics</span>
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-100">
        <Card.Header className="d-flex align-items-center">
          <BarChart className="me-2" />
          <span>Project Metrics</span>
        </Card.Header>
        <Card.Body>
          <Alert variant="danger">{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100">
      <Card.Header className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center">
          <BarChart className="me-2" />
          <span>Project Metrics</span>
        </div>
        <Badge bg="info">{metrics.projectName}</Badge>
      </Card.Header>
      <Card.Body>
        {/* Key Metrics Row */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <MetricCard
              icon={<Assignment style={{ fontSize: '2rem' }} />}
              title="Total Tasks"
              value={metrics.totalTasks}
              subtitle={`${metrics.completedTasks} completed`}
              variant="primary"
            />
          </Col>
          <Col md={3} className="mb-3">
            <MetricCard
              icon={<Group style={{ fontSize: '2rem' }} />}
              title="Team Members"
              value={metrics.teamMembers}
              subtitle={`${metrics.activeMembers} active`}
              variant="success"
            />
          </Col>
          <Col md={3} className="mb-3">
            <MetricCard
              icon={<TrendingUp style={{ fontSize: '2rem' }} />}
              title="Velocity"
              value={metrics.velocity}
              subtitle="Story points/sprint"
              variant="info"
            />
          </Col>
          <Col md={3} className="mb-3">
            <MetricCard
              icon={<CheckCircle style={{ fontSize: '2rem' }} />}
              title="Efficiency"
              value={`${metrics.efficiency}%`}
              subtitle="Overall performance"
              variant="success"
            />
          </Col>
        </Row>

        {/* Progress Bars */}
        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <small className="text-muted">Project Completion</small>
                <small className="text-muted">{metrics.completionRate}%</small>
              </div>
              <ProgressBar 
                variant={getProgressVariant(metrics.completionRate)} 
                now={metrics.completionRate} 
              />
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <small className="text-muted">Sprint Progress</small>
                <small className="text-muted">{metrics.sprintProgress}%</small>
              </div>
              <ProgressBar 
                variant={getProgressVariant(metrics.sprintProgress)} 
                now={metrics.sprintProgress} 
              />
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <small className="text-muted">Burndown Progress</small>
                <small className="text-muted">{metrics.burndownProgress}%</small>
              </div>
              <ProgressBar 
                variant={getProgressVariant(metrics.burndownProgress)} 
                now={metrics.burndownProgress} 
              />
            </div>
          </Col>
          <Col md={6}>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <small className="text-muted">Time Utilization</small>
                <small className="text-muted">{Math.round((metrics.timeSpent / metrics.estimatedTime) * 100)}%</small>
              </div>
              <ProgressBar 
                variant={getProgressVariant((metrics.timeSpent / metrics.estimatedTime) * 100)} 
                now={(metrics.timeSpent / metrics.estimatedTime) * 100} 
              />
            </div>
          </Col>
        </Row>

        {/* Status Indicators */}
        <Row>
          <Col md={6}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">In Progress</span>
              <Badge bg="warning">{metrics.inProgressTasks}</Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">To Do</span>
              <Badge bg="secondary">{metrics.todoTasks}</Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Overdue</span>
              <Badge bg="danger">{metrics.overdueTasks}</Badge>
            </div>
          </Col>
          <Col md={6}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Critical Issues</span>
              <Badge bg="danger">{metrics.criticalIssues}</Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Blocked Tasks</span>
              <Badge bg="warning">{metrics.blockedTasks}</Badge>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">Est. Completion</span>
              <Badge bg="info">{new Date(metrics.estimatedCompletion).toLocaleDateString()}</Badge>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ProjectMetricsWidget;