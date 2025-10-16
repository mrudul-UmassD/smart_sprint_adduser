import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Tab, Tabs, Badge, ListGroup, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { BsCalendarEvent, BsFilter, BsFolderPlus, BsTrash, BsCheck, BsX, BsTag, BsPeople, BsPerson } from 'react-icons/bs';
import axios from 'axios';
import './DashboardFilters.css';

const DashboardFilters = ({ show, onHide, filters, onApplyFilters }) => {
  const [localFilters, setLocalFilters] = useState({
    dateRange: {
      startDate: filters?.dateRange?.startDate || null,
      endDate: filters?.dateRange?.endDate || null
    },
    projectId: filters?.projectId || '',
    userId: filters?.userId || '',
    teamId: filters?.teamId || '',
    assigneeId: filters?.assigneeId || '',
    priority: filters?.priority || '',
    status: filters?.status || '',
    tags: filters?.tags || []
  });
  
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('filters');
  const [savedFilters, setSavedFilters] = useState([]);
  const [newFilterName, setNewFilterName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [selectedTags, setSelectedTags] = useState(filters?.tags || []);
  const [errorMessage, setErrorMessage] = useState('');

  // Update local filters when props change
  useEffect(() => {
    if (filters) {
      setLocalFilters({
        dateRange: {
          startDate: filters.dateRange?.startDate || null,
          endDate: filters.dateRange?.endDate || null
        },
        projectId: filters.projectId || '',
        userId: filters.userId || '',
        teamId: filters.teamId || '',
        assigneeId: filters.assigneeId || '',
        priority: filters.priority || '',
        status: filters.status || '',
        tags: filters.tags || []
      });
      setSelectedTags(filters.tags || []);
    }
  }, [filters]);

  // Fetch filter data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch projects
        const projectsResponse = await axios.get('/api/projects', { headers });
        if (projectsResponse.data) {
          setProjects(projectsResponse.data);
        }

        // Fetch users
        const usersResponse = await axios.get('/api/users', { headers });
        if (usersResponse.data) {
          setUsers(usersResponse.data);
        }
        
        // Fetch teams
        const teamsResponse = await axios.get('/api/teams', { headers });
        if (teamsResponse.data) {
          setTeams(teamsResponse.data);
        }
        
        // Fetch tags
        const tagsResponse = await axios.get('/api/tags', { headers });
        if (tagsResponse.data) {
          setTags(tagsResponse.data);
        }
        
        // Fetch saved filters
        const savedFiltersResponse = await axios.get('/api/user/filter-presets', { headers });
        if (savedFiltersResponse.data) {
          setSavedFilters(savedFiltersResponse.data);
        }
      } catch (error) {
        console.error('Error fetching filter data:', error);
        setErrorMessage('Failed to load filter data. Using demo data.');
        
        // Set demo data as fallback
        setProjects([
          { _id: 'p1', name: 'Smart Sprint' },
          { _id: 'p2', name: 'Website Redesign' }
        ]);
        
        setUsers([
          { _id: 'u1', name: 'John Developer' },
          { _id: 'u2', name: 'Jane Designer' }
        ]);
        
        setTeams([
          { _id: 't1', name: 'Frontend Team' },
          { _id: 't2', name: 'Backend Team' }
        ]);
        
        setTags([
          { _id: 'tag1', name: 'Bug', color: '#dc3545' },
          { _id: 'tag2', name: 'Feature', color: '#28a745' },
          { _id: 'tag3', name: 'Documentation', color: '#17a2b8' }
        ]);
        
        setSavedFilters([
          { 
            _id: 'sf1', 
            name: 'My Current Tasks', 
            filters: {
              status: 'in progress',
              assigneeId: 'u1'
            }
          },
          {
            _id: 'sf2',
            name: 'High Priority',
            filters: {
              priority: 'high'
            }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchData();
    }
  }, [show]);

  const handleDateRangeChange = (dates) => {
    const [startInput, endInput] = dates;
    
    // Ensure we have valid Date objects
    let validStartDate = null;
    let validEndDate = null;
    
    if (startInput) {
      validStartDate = new Date(startInput);
      // Check if the date is valid
      if (isNaN(validStartDate.getTime())) {
        console.warn('Invalid start date detected:', startInput);
        validStartDate = null;
      }
    }
    
    if (endInput) {
      validEndDate = new Date(endInput);
      // Check if the date is valid
      if (isNaN(validEndDate.getTime())) {
        console.warn('Invalid end date detected:', endInput);
        validEndDate = null;
      }
    }
    
    console.log('Setting date range:', { 
      startDate: validStartDate ? validStartDate.toISOString() : null, 
      endDate: validEndDate ? validEndDate.toISOString() : null 
    });
    
    setLocalFilters({
      ...localFilters,
      dateRange: {
        startDate: validStartDate,
        endDate: validEndDate
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters({
      ...localFilters,
      [name]: value
    });
  };

  const handleTagToggle = (tagId) => {
    let newSelectedTags;
    
    if (selectedTags.includes(tagId)) {
      newSelectedTags = selectedTags.filter(id => id !== tagId);
    } else {
      newSelectedTags = [...selectedTags, tagId];
    }
    
    setSelectedTags(newSelectedTags);
    setLocalFilters({
      ...localFilters,
      tags: newSelectedTags
    });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onHide();
  };

  const handleReset = () => {
    const resetFilters = {
      dateRange: { startDate: null, endDate: null },
      projectId: '',
      userId: '',
      teamId: '',
      assigneeId: '',
      priority: '',
      status: '',
      tags: []
    };
    setLocalFilters(resetFilters);
    setSelectedTags([]);
    onApplyFilters(resetFilters);
  };
  
  const handleSaveFilter = async () => {
    if (!newFilterName.trim()) {
      setErrorMessage('Please enter a name for your filter');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/user/filter-presets', {
        name: newFilterName,
        filters: localFilters
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setSavedFilters([...savedFilters, response.data]);
        setNewFilterName('');
        setShowSaveForm(false);
        setErrorMessage('');
      }
    } catch (error) {
      console.error('Error saving filter preset:', error);
      setErrorMessage('Failed to save filter preset');
      
      // Add the filter to the local list anyway for demo purposes
      const newFilter = {
        _id: Date.now().toString(),
        name: newFilterName,
        filters: localFilters
      };
      setSavedFilters([...savedFilters, newFilter]);
      setNewFilterName('');
      setShowSaveForm(false);
    }
  };
  
  const handleDeleteFilter = async (filterId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/user/filter-presets/${filterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSavedFilters(savedFilters.filter(filter => filter._id !== filterId));
    } catch (error) {
      console.error('Error deleting filter preset:', error);
      
      // Remove from local list anyway for demo purposes
      setSavedFilters(savedFilters.filter(filter => filter._id !== filterId));
    }
  };
  
  const handleApplyPreset = (preset) => {
    setLocalFilters({
      ...localFilters,
      ...preset.filters
    });
    setSelectedTags(preset.filters.tags || []);
    setActiveTab('filters');
  };

  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Not Started', 'In Progress', 'Under Review', 'Completed'];

  return (
    <Modal show={show} onHide={onHide} centered size="lg" dialogClassName="dashboard-filter-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <BsFilter className="me-2" />
          Dashboard Filters
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3">Loading filter options...</p>
          </div>
        ) : (
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4 filter-tabs"
          >
            <Tab eventKey="filters" title="Custom Filters">
              {errorMessage && (
                <Alert variant="warning" dismissible onClose={() => setErrorMessage('')}>
                  {errorMessage}
                </Alert>
              )}
              
              <Form>
                <Row className="mb-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Date Range</Form.Label>
                      <div className="date-picker-container">
                        <DatePicker
                          selectsRange
                          startDate={localFilters.dateRange.startDate}
                          endDate={localFilters.dateRange.endDate}
                          onChange={handleDateRangeChange}
                          className="form-control"
                          placeholderText="Select date range"
                          isClearable
                          showYearDropdown
                          dateFormatCalendar="MMMM"
                          yearDropdownItemNumber={15}
                          scrollableYearDropdown
                        />
                        <BsCalendarEvent className="calendar-icon" />
                      </div>
                      <small className="text-muted">Filter widgets by date range</small>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <BsFolderPlus className="me-1" /> Project
                      </Form.Label>
                      <Form.Select
                        name="projectId"
                        value={localFilters.projectId}
                        onChange={handleInputChange}
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
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <BsPerson className="me-1" /> User
                      </Form.Label>
                      <Form.Select
                        name="userId"
                        value={localFilters.userId}
                        onChange={handleInputChange}
                      >
                        <option value="">All Users</option>
                        {users.map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <BsPeople className="me-1" /> Team
                      </Form.Label>
                      <Form.Select
                        name="teamId"
                        value={localFilters.teamId}
                        onChange={handleInputChange}
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
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Assignee</Form.Label>
                      <Form.Select
                        name="assigneeId"
                        value={localFilters.assigneeId}
                        onChange={handleInputChange}
                      >
                        <option value="">All Assignees</option>
                        <option value="current">Assigned to Me</option>
                        <option value="unassigned">Unassigned</option>
                        {users.map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Priority</Form.Label>
                      <Form.Select
                        name="priority"
                        value={localFilters.priority}
                        onChange={handleInputChange}
                      >
                        <option value="">All Priorities</option>
                        {priorities.map((priority, index) => (
                          <option key={index} value={priority.toLowerCase()}>
                            {priority}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={localFilters.status}
                        onChange={handleInputChange}
                      >
                        <option value="">All Statuses</option>
                        {statuses.map((status, index) => (
                          <option key={index} value={status.toLowerCase()}>
                            {status}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row className="my-3">
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>
                        <BsTag className="me-1" /> Tags
                      </Form.Label>
                      <div className="tags-container">
                        {tags.map(tag => (
                          <Badge 
                            key={tag._id}
                            className={`tag-badge m-1 ${selectedTags.includes(tag._id) ? 'selected' : ''}`}
                            style={{ 
                              backgroundColor: selectedTags.includes(tag._id) ? tag.color : 'transparent',
                              color: selectedTags.includes(tag._id) ? '#fff' : '#333',
                              borderColor: tag.color
                            }}
                            onClick={() => handleTagToggle(tag._id)}
                          >
                            {tag.name}
                            {selectedTags.includes(tag._id) && <BsCheck className="ms-1" />}
                          </Badge>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>
                
                {showSaveForm && (
                  <Row className="mt-3">
                    <Col>
                      <Form.Group>
                        <Form.Label>Save Filter Preset</Form.Label>
                        <div className="d-flex">
                          <Form.Control
                            type="text"
                            placeholder="Enter name for this filter"
                            value={newFilterName}
                            onChange={(e) => setNewFilterName(e.target.value)}
                          />
                          <Button 
                            variant="success" 
                            className="ms-2" 
                            onClick={handleSaveFilter}
                          >
                            <BsCheck />
                          </Button>
                          <Button 
                            variant="outline-secondary" 
                            className="ms-2" 
                            onClick={() => setShowSaveForm(false)}
                          >
                            <BsX />
                          </Button>
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Form>
            </Tab>
            
            <Tab eventKey="saved" title="Saved Filters">
              {savedFilters.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted">You haven't saved any filters yet.</p>
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setActiveTab('filters')}
                  >
                    Create your first filter
                  </Button>
                </div>
              ) : (
                <ListGroup className="saved-filters-list">
                  {savedFilters.map(filter => (
                    <ListGroup.Item 
                      key={filter._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div className="filter-name" onClick={() => handleApplyPreset(filter)}>
                        {filter.name}
                      </div>
                      <div className="filter-actions">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleApplyPreset(filter)}
                        >
                          Apply
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDeleteFilter(filter._id)}
                        >
                          <BsTrash />
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Tab>
          </Tabs>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="outline-secondary" 
          onClick={handleReset}
          className="me-auto"
        >
          Reset Filters
        </Button>
        
        {activeTab === 'filters' && !showSaveForm && (
          <Button 
            variant="outline-primary" 
            onClick={() => setShowSaveForm(true)}
            className="me-2"
          >
            Save Filter
          </Button>
        )}
        
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleApply}>
          Apply Filters
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DashboardFilters; 