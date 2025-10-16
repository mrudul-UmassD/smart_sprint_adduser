import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Collapse } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import { format, subDays } from 'date-fns';

const DashboardFilters = ({ filters, onFilterChange, onApplyFilters, visible }) => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    startDate: filters.startDate ? new Date(filters.startDate) : subDays(new Date(), 30),
    endDate: filters.endDate ? new Date(filters.endDate) : new Date(),
    projectId: filters.projectId || '',
    teamId: filters.teamId || ''
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const [projectsResponse, teamsResponse] = await Promise.all([
          axios.get('/api/projects', { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          axios.get('/api/teams', { 
            headers: { Authorization: `Bearer ${token}` } 
          })
        ]);

        setProjects(projectsResponse.data);
        setTeams(teamsResponse.data);
      } catch (error) {
        console.error('Error fetching filter data:', error);
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    if (visible) {
      fetchData();
    }
  }, [visible]);

  useEffect(() => {
    setLocalFilters({
      startDate: filters.startDate ? new Date(filters.startDate) : subDays(new Date(), 30),
      endDate: filters.endDate ? new Date(filters.endDate) : new Date(),
      projectId: filters.projectId || '',
      teamId: filters.teamId || ''
    });
  }, [filters]);

  const handleChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApply = () => {
    // Format dates to ISO string for consistency
    const formattedFilters = {
      ...localFilters,
      startDate: localFilters.startDate ? localFilters.startDate.toISOString() : null,
      endDate: localFilters.endDate ? localFilters.endDate.toISOString() : null
    };
    
    onFilterChange(formattedFilters);
    onApplyFilters();
  };

  const handleReset = () => {
    const resetFilters = {
      startDate: subDays(new Date(), 30).toISOString(),
      endDate: new Date().toISOString(),
      projectId: '',
      teamId: ''
    };
    
    setLocalFilters({
      startDate: subDays(new Date(), 30),
      endDate: new Date(),
      projectId: '',
      teamId: ''
    });
    
    onFilterChange(resetFilters);
    onApplyFilters();
  };

  return (
    <Collapse in={visible}>
      <Card className="mb-3">
        <Card.Header>
          <h5 className="mb-0">Dashboard Filters</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <DatePicker
                  selected={localFilters.startDate}
                  onChange={date => handleChange('startDate', date)}
                  selectsStart
                  startDate={localFilters.startDate}
                  endDate={localFilters.endDate}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  maxDate={localFilters.endDate || new Date()}
                />
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <DatePicker
                  selected={localFilters.endDate}
                  onChange={date => handleChange('endDate', date)}
                  selectsEnd
                  startDate={localFilters.startDate}
                  endDate={localFilters.endDate}
                  minDate={localFilters.startDate}
                  maxDate={new Date()}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                />
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Project</Form.Label>
                <Form.Select
                  value={localFilters.projectId}
                  onChange={e => handleChange('projectId', e.target.value)}
                  disabled={loading}
                >
                  <option value="">All Projects</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} lg={3} className="mb-3">
              <Form.Group>
                <Form.Label>Team</Form.Label>
                <Form.Select
                  value={localFilters.teamId}
                  onChange={e => handleChange('teamId', e.target.value)}
                  disabled={loading}
                >
                  <option value="">All Teams</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>
                      {team.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-secondary" 
              className="me-2" 
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button 
              variant="primary" 
              onClick={handleApply}
            >
              Apply Filters
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Collapse>
  );
};

export default DashboardFilters; 