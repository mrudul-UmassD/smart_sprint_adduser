import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Nav, Tab } from 'react-bootstrap';
import { FaDownload, FaFilePdf, FaFileExcel, FaChartLine, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import { getToken, removeTokenAndRedirect } from '../../utils/authUtils';
import { useTheme } from '../../contexts/ThemeContext';
import BurndownReport from './BurndownReport';
import VelocityReport from './VelocityReport';
import ProjectReport from './ProjectReport';
import TeamReport from './TeamReport';
import SprintPerformanceReport from './SprintPerformanceReport';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ReportingDashboard = () => {
  const [activeTab, setActiveTab] = useState('burndown');
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedSprint, setSelectedSprint] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const { theme } = useTheme();

  // Fetch projects and teams
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = getToken();
        
        if (!token) {
          removeTokenAndRedirect();
          return;
        }

        // Fetch projects
        const projectsResponse = await axios.get('/api/projects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setProjects(projectsResponse.data);
        
        // Fetch teams
        const teamsResponse = await axios.get('/api/users/teams', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTeams(teamsResponse.data);
        
        // Set default date range (last 30 days)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        
        setDateRange({
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setLoading(false);
        
        if (err.response && err.response.status === 401) {
          removeTokenAndRedirect();
        } else {
          setError('Failed to load initial data. Please try again.');
        }
      }
    };
    
    fetchData();
  }, []);

  // Fetch sprints when a project is selected
  useEffect(() => {
    const fetchSprints = async () => {
      if (!selectedProject) {
        setSprints([]);
        return;
      }
      
      try {
        const token = getToken();
        
        if (!token) {
          removeTokenAndRedirect();
          return;
        }
        
        // Fetch sprints for selected project
        const sprintsResponse = await axios.get(`/api/projects/${selectedProject}/sprints`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSprints(sprintsResponse.data);
        
        // Set first sprint as default if any exists
        if (sprintsResponse.data.length > 0) {
          setSelectedSprint(sprintsResponse.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching sprints:', err);
        
        if (err.response && err.response.status === 401) {
          removeTokenAndRedirect();
        }
      }
    };
    
    if (activeTab === 'sprint') {
      fetchSprints();
    }
  }, [selectedProject, activeTab]);

  // Generate report based on selected parameters
  const generateReport = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      
      if (!token) {
        removeTokenAndRedirect();
        return;
      }
      
      // Determine endpoint based on active tab
      let endpoint = '';
      const params = new URLSearchParams();
      
      params.append('startDate', dateRange.start);
      params.append('endDate', dateRange.end);
      
      switch (activeTab) {
        case 'burndown':
          endpoint = `/api/analytics/projects/${selectedProject}/burndown`;
          break;
        case 'velocity':
          endpoint = `/api/analytics/teams/${selectedTeam}/velocity`;
          break;
        case 'project':
          endpoint = `/api/analytics/projects/${selectedProject}/report`;
          break;
        case 'team':
          endpoint = `/api/analytics/teams/${selectedTeam}/report`;
          break;
        case 'sprint':
          endpoint = `/api/analytics/projects/${selectedProject}/sprints/${selectedSprint}/performance`;
          break;
        default:
          endpoint = '/api/analytics/dashboard';
      }
      
      const response = await axios.get(`${endpoint}?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setReportData(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error generating report:', err);
      setLoading(false);
      
      if (err.response && err.response.status === 401) {
        removeTokenAndRedirect();
      } else {
        setError(err.response?.data?.message || 'Failed to generate report. Please try again.');
      }
    }
  };

  // Validate form based on active tab
  const validateForm = () => {
    if (activeTab === 'burndown' || activeTab === 'project' || activeTab === 'sprint') {
      if (!selectedProject) {
        setError('Please select a project');
        return false;
      }
    } else if (activeTab === 'velocity' || activeTab === 'team') {
      if (!selectedTeam) {
        setError('Please select a team');
        return false;
      }
    } else if (activeTab === 'sprint') {
      if (!selectedProject) {
        setError('Please select a project');
        return false;
      }
      if (!selectedSprint) {
        setError('Please select a sprint');
        return false;
      }
    }
    
    if (!dateRange.start || !dateRange.end) {
      setError('Please select a valid date range');
      return false;
    }
    
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    if (startDate > endDate) {
      setError('Start date cannot be after end date');
      return false;
    }
    
    return true;
  };

  // Export report as PDF
  const exportPDF = () => {
    if (!reportData) return;
    
    const doc = new jsPDF();
    doc.setFontSize(18);
    
    // Add title based on active tab
    let title = 'Report';
    switch (activeTab) {
      case 'burndown':
        title = 'Burndown Report';
        break;
      case 'velocity':
        title = 'Velocity Report';
        break;
      case 'project':
        title = 'Project Report';
        break;
      case 'team':
        title = 'Team Report';
        break;
      case 'sprint':
        title = 'Sprint Performance Report';
        break;
      default:
        title = 'Dashboard Report';
    }
    
    doc.text(title, 14, 22);
    doc.setFontSize(12);
    
    // Add date range
    doc.text(`Date Range: ${dateRange.start} to ${dateRange.end}`, 14, 32);
    
    // Add project or team info
    let infoText = '';
    if (activeTab === 'burndown' || activeTab === 'project' || activeTab === 'sprint') {
      const project = projects.find(p => p._id === selectedProject);
      infoText = `Project: ${project?.name || 'Unknown'}`;
      
      if (activeTab === 'sprint') {
        const sprint = sprints.find(s => s._id === selectedSprint);
        infoText += ` | Sprint: ${sprint?.name || 'Unknown'}`;
      }
    } else if (activeTab === 'velocity' || activeTab === 'team') {
      const team = teams.find(t => t._id === selectedTeam);
      infoText = `Team: ${team?.name || 'Unknown'}`;
    }
    
    doc.text(infoText, 14, 42);
    
    // Generate tables based on report data
    if (reportData) {
      // Different table structure based on report type
      if (activeTab === 'burndown') {
        const tableData = reportData.dates.map((date, index) => [
          date,
          reportData.remainingTasks[index],
          reportData.idealBurndown[index]
        ]);
        
        doc.autoTable({
          startY: 50,
          head: [['Date', 'Remaining Tasks', 'Ideal Burndown']],
          body: tableData
        });
      } else if (activeTab === 'velocity') {
        const tableData = reportData.sprints.map(sprint => [
          sprint.name,
          sprint.startDate,
          sprint.endDate,
          sprint.velocity,
          sprint.completedStoryPoints
        ]);
        
        doc.autoTable({
          startY: 50,
          head: [['Sprint', 'Start Date', 'End Date', 'Velocity', 'Completed Points']],
          body: tableData
        });
      } else if (activeTab === 'project') {
        // Project report
        const taskStatusData = Object.entries(reportData.tasksByStatus).map(([status, count]) => [
          status, count
        ]);
        
        doc.autoTable({
          startY: 50,
          head: [['Status', 'Count']],
          body: taskStatusData
        });
        
        // Add task priority table
        const taskPriorityData = Object.entries(reportData.tasksByPriority).map(([priority, count]) => [
          priority, count
        ]);
        
        doc.autoTable({
          startY: doc.previousAutoTable.finalY + 10,
          head: [['Priority', 'Count']],
          body: taskPriorityData
        });
      } else if (activeTab === 'team') {
        // Team report
        const membersData = reportData.members.map(member => [
          member.name,
          member.totalTasks,
          member.completedTasks,
          `${Math.round(member.completionRate)}%`
        ]);
        
        doc.autoTable({
          startY: 50,
          head: [['Team Member', 'Total Tasks', 'Completed', 'Completion Rate']],
          body: membersData
        });
      } else if (activeTab === 'sprint') {
        // Sprint performance report
        const tasksData = [
          ['Total Tasks', reportData.taskStats.total],
          ['Completed Tasks', reportData.taskStats.completed],
          ['Completion Rate', `${reportData.completionRate}%`],
          ['Story Points', reportData.storyPoints.total],
          ['Completed Points', reportData.storyPoints.completed],
        ];
        
        doc.autoTable({
          startY: 50,
          head: [['Metric', 'Value']],
          body: tasksData
        });
        
        // Add task status table
        if (reportData.tasksByStatus) {
          const taskStatusData = Object.entries(reportData.tasksByStatus).map(([status, count]) => [
            status, count
          ]);
          
          doc.autoTable({
            startY: doc.previousAutoTable.finalY + 10,
            head: [['Status', 'Count']],
            body: taskStatusData
          });
        }
      }
    }
    
    // Save the PDF
    doc.save(`${title.replace(' ', '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Export report as Excel
  const exportExcel = () => {
    if (!reportData) return;
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    
    // Different worksheet structure based on report type
    if (activeTab === 'burndown') {
      const wsData = [
        ['Date', 'Remaining Tasks', 'Ideal Burndown'],
        ...reportData.dates.map((date, index) => [
          date,
          reportData.remainingTasks[index],
          reportData.idealBurndown[index]
        ])
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Burndown');
    } else if (activeTab === 'velocity') {
      const wsData = [
        ['Sprint', 'Start Date', 'End Date', 'Velocity', 'Completed Points'],
        ...reportData.sprints.map(sprint => [
          sprint.name,
          sprint.startDate,
          sprint.endDate,
          sprint.velocity,
          sprint.completedStoryPoints
        ])
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Velocity');
    } else if (activeTab === 'project') {
      // Task status worksheet
      const statusData = [
        ['Status', 'Count'],
        ...Object.entries(reportData.tasksByStatus).map(([status, count]) => [
          status, count
        ])
      ];
      
      const statusWs = XLSX.utils.aoa_to_sheet(statusData);
      XLSX.utils.book_append_sheet(wb, statusWs, 'Task Status');
      
      // Task priority worksheet
      const priorityData = [
        ['Priority', 'Count'],
        ...Object.entries(reportData.tasksByPriority).map(([priority, count]) => [
          priority, count
        ])
      ];
      
      const priorityWs = XLSX.utils.aoa_to_sheet(priorityData);
      XLSX.utils.book_append_sheet(wb, priorityWs, 'Task Priority');
    } else if (activeTab === 'team') {
      const wsData = [
        ['Team Member', 'Total Tasks', 'Completed', 'Completion Rate'],
        ...reportData.members.map(member => [
          member.name,
          member.totalTasks,
          member.completedTasks,
          `${Math.round(member.completionRate)}%`
        ])
      ];
      
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, 'Team Performance');
    } else if (activeTab === 'sprint') {
      // Sprint overview worksheet
      const overviewData = [
        ['Metric', 'Value'],
        ['Total Tasks', reportData.taskStats.total],
        ['Completed Tasks', reportData.taskStats.completed],
        ['Completion Rate', `${reportData.completionRate}%`],
        ['Story Points Total', reportData.storyPoints.total],
        ['Story Points Completed', reportData.storyPoints.completed],
        ['Sprint Duration (days)', reportData.duration || 'N/A'],
      ];
      
      const overviewWs = XLSX.utils.aoa_to_sheet(overviewData);
      XLSX.utils.book_append_sheet(wb, overviewWs, 'Sprint Overview');
      
      // Task status worksheet if available
      if (reportData.tasksByStatus) {
        const statusData = [
          ['Status', 'Count'],
          ...Object.entries(reportData.tasksByStatus).map(([status, count]) => [
            status, count
          ])
        ];
        
        const statusWs = XLSX.utils.aoa_to_sheet(statusData);
        XLSX.utils.book_append_sheet(wb, statusWs, 'Task Status');
      }
      
      // Team members worksheet if available
      if (reportData.teamPerformance && reportData.teamPerformance.length > 0) {
        const teamData = [
          ['Team Member', 'Assigned Tasks', 'Completed Tasks', 'Completion Rate'],
          ...reportData.teamPerformance.map(member => [
            member.name,
            member.totalTasks,
            member.completedTasks,
            `${Math.round(member.completionRate)}%`
          ])
        ];
        
        const teamWs = XLSX.utils.aoa_to_sheet(teamData);
        XLSX.utils.book_append_sheet(wb, teamWs, 'Team Performance');
      }
    }
    
    // Generate file name
    let fileName = 'Report';
    switch (activeTab) {
      case 'burndown':
        fileName = 'Burndown_Report';
        break;
      case 'velocity':
        fileName = 'Velocity_Report';
        break;
      case 'project':
        fileName = 'Project_Report';
        break;
      case 'team':
        fileName = 'Team_Report';
        break;
      case 'sprint':
        fileName = 'Sprint_Performance_Report';
        break;
      default:
        fileName = 'Dashboard_Report';
    }
    
    // Save the Excel file
    XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Render the appropriate report component based on active tab
  const renderReport = () => {
    if (!reportData) return null;
    
    switch (activeTab) {
      case 'burndown':
        return <BurndownReport data={reportData} theme={theme} />;
      case 'velocity':
        return <VelocityReport data={reportData} theme={theme} />;
      case 'project':
        return <ProjectReport data={reportData} theme={theme} />;
      case 'team':
        return <TeamReport data={reportData} theme={theme} />;
      case 'sprint':
        return <SprintPerformanceReport data={reportData} theme={theme} />;
      default:
        return null;
    }
  };

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Advanced Reporting</h2>
      
      <Tab.Container activeKey={activeTab} onSelect={key => setActiveTab(key)}>
        <Row className="mb-4">
          <Col lg={12}>
            <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
              <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="burndown">
                      <FaChartLine className="me-2" />
                      Burndown Chart
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="velocity">
                      <FaChartLine className="me-2" />
                      Velocity Report
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="project">
                      <FaChartLine className="me-2" />
                      Project Report
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="team">
                      <FaChartLine className="me-2" />
                      Team Report
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="sprint">
                      <FaCalendarAlt className="me-2" />
                      Sprint Performance
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              
              <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                <Form>
                  <Row className="mb-3">
                    {(activeTab === 'burndown' || activeTab === 'project' || activeTab === 'sprint') && (
                      <Col md={activeTab === 'sprint' ? 4 : 4}>
                        <Form.Group>
                          <Form.Label>Project</Form.Label>
                          <Form.Select 
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                          >
                            <option value="">Select Project</option>
                            {projects.map(project => (
                              <option key={project._id} value={project._id}>
                                {project.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    )}
                    
                    {activeTab === 'sprint' && (
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Sprint</Form.Label>
                          <Form.Select 
                            value={selectedSprint}
                            onChange={(e) => setSelectedSprint(e.target.value)}
                            disabled={!selectedProject || sprints.length === 0}
                          >
                            <option value="">Select Sprint</option>
                            {sprints.map(sprint => (
                              <option key={sprint._id} value={sprint._id}>
                                {sprint.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    )}
                    
                    {(activeTab === 'velocity' || activeTab === 'team') && (
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Team</Form.Label>
                          <Form.Select 
                            value={selectedTeam}
                            onChange={(e) => setSelectedTeam(e.target.value)}
                          >
                            <option value="">Select Team</option>
                            {teams.map(team => (
                              <option key={team._id} value={team._id}>
                                {team.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    )}
                    
                    <Col md={activeTab === 'sprint' ? 2 : 4}>
                      <Form.Group>
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control 
                          type="date" 
                          value={dateRange.start}
                          onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                    
                    <Col md={activeTab === 'sprint' ? 2 : 4}>
                      <Form.Group>
                        <Form.Label>End Date</Form.Label>
                        <Form.Control 
                          type="date" 
                          value={dateRange.end}
                          onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Row className="mb-3">
                    <Col>
                      {error && (
                        <Alert variant="danger" className="mb-3">
                          {error}
                        </Alert>
                      )}
                      
                      <Button 
                        variant="primary" 
                        onClick={generateReport}
                        disabled={loading}
                        className="me-2"
                      >
                        {loading ? (
                          <>
                            <Spinner
                              as="span"
                              animation="border"
                              size="sm"
                              role="status"
                              aria-hidden="true"
                              className="me-2"
                            />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FaChartLine className="me-2" />
                            Generate Report
                          </>
                        )}
                      </Button>
                      
                      {reportData && (
                        <>
                          <Button 
                            variant="success" 
                            onClick={exportExcel}
                            className="me-2"
                          >
                            <FaFileExcel className="me-2" />
                            Export Excel
                          </Button>
                          
                          <Button 
                            variant="danger" 
                            onClick={exportPDF}
                          >
                            <FaFilePdf className="me-2" />
                            Export PDF
                          </Button>
                        </>
                      )}
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {reportData && (
          <Row>
            <Col lg={12}>
              <Card className={`border ${theme === 'dark' ? 'border-dark' : ''}`}>
                <Card.Header className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                  <h5 className="mb-0">
                    Report Results
                    <span className="ms-2 text-muted small">
                      {dateRange.start} to {dateRange.end}
                    </span>
                  </h5>
                </Card.Header>
                <Card.Body className={theme === 'dark' ? 'bg-dark text-light' : ''}>
                  {renderReport()}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Tab.Container>
    </Container>
  );
};

export default ReportingDashboard; 