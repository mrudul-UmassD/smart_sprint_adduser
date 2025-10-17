import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import { BsCalendar3, BsArrowClockwise, BsGear, BsFullscreen, BsFullscreenExit, BsXLg } from 'react-icons/bs';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarWidget = ({ 
  config = {}, 
  onRemove, 
  onUpdateConfig = () => {},
  isFullScreen = false,
  onToggleFullScreen = () => {}
}) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  // Fetch calendar events
  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch tasks with deadlines
      const tasksResponse = await axios.get('/api/tasks', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          hasDeadline: true,
          status: 'active'
        }
      });

      // Fetch sprints
      const sprintsResponse = await axios.get('/api/sprints', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Convert tasks to calendar events
      const taskEvents = tasksResponse.data.map(task => ({
        id: `task-${task._id}`,
        title: `Task: ${task.title}`,
        start: new Date(task.dueDate),
        end: new Date(task.dueDate),
        resource: {
          type: 'task',
          data: task,
          color: getPriorityColor(task.priority)
        }
      }));

      // Convert sprints to calendar events
      const sprintEvents = sprintsResponse.data.map(sprint => ({
        id: `sprint-${sprint._id}`,
        title: `Sprint: ${sprint.name}`,
        start: new Date(sprint.startDate),
        end: new Date(sprint.endDate),
        resource: {
          type: 'sprint',
          data: sprint,
          color: getSprintColor(sprint.status)
        }
      }));

      setEvents([...taskEvents, ...sprintEvents]);
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  // Get color based on task priority
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '#dc3545';
      case 'medium': return '#fd7e14';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  // Get color based on sprint status
  const getSprintColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#007bff';
      case 'completed': return '#28a745';
      case 'planned': return '#6c757d';
      default: return '#6c757d';
    }
  };

  // Custom event component
  const EventComponent = ({ event }) => (
    <div 
      style={{ 
        backgroundColor: event.resource.color,
        color: 'white',
        padding: '2px 4px',
        borderRadius: '3px',
        fontSize: '12px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}
    >
      {event.title}
    </div>
  );

  // Handle event selection
  const handleSelectEvent = (event) => {
    const { type, data } = event.resource;
    
    if (type === 'task') {
      // Could open task details modal
      console.log('Selected task:', data);
    } else if (type === 'sprint') {
      // Could open sprint details modal
      console.log('Selected sprint:', data);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <Card className="h-100 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <BsCalendar3 className="me-2" />
            <h6 className="mb-0">Calendar</h6>
          </div>
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
      <Card className="h-100 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <BsCalendar3 className="me-2" />
            <h6 className="mb-0">Calendar</h6>
          </div>
          <Button
            variant="link"
            size="sm"
            className="p-0"
            onClick={fetchEvents}
            title="Retry"
          >
            <BsArrowClockwise />
          </Button>
        </Card.Header>
        <Card.Body>
          <Alert variant="danger" className="mb-0">
            <Alert.Heading>Error Loading Calendar</Alert.Heading>
            <p className="mb-0">{error}</p>
          </Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="h-100 shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <BsCalendar3 className="me-2" />
          <h6 className="mb-0">Calendar</h6>
          <Badge bg="secondary" className="ms-2">
            {events.length} events
          </Badge>
        </div>
        <div>
          <Button
            variant="link"
            size="sm"
            className="p-0 me-2"
            onClick={fetchEvents}
            title="Refresh calendar"
          >
            <BsArrowClockwise />
          </Button>
          <Button
            variant="link"
            size="sm"
            className="p-0 me-2"
            onClick={() => onUpdateConfig(config)}
            title="Configure widget"
          >
            <BsGear />
          </Button>
          <Button
            variant="link"
            size="sm"
            className="p-0 me-2"
            onClick={onToggleFullScreen}
            title={isFullScreen ? "Exit full screen" : "Full screen"}
          >
            {isFullScreen ? <BsFullscreenExit /> : <BsFullscreen />}
          </Button>
          {onRemove && (
            <Button
              variant="link"
              size="sm"
              className="p-0 text-danger"
              onClick={onRemove}
              title="Remove widget"
            >
              <BsXLg />
            </Button>
          )}
        </div>
      </Card.Header>
      <Card.Body className="p-2">
        <div style={{ height: isFullScreen ? '600px' : '400px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectEvent={handleSelectEvent}
            components={{
              event: EventComponent
            }}
            style={{ height: '100%' }}
            popup
            showMultiDayTimes
            step={60}
            showAllEvents
          />
        </div>
        
        {/* Legend */}
        <Row className="mt-2">
          <Col>
            <div className="d-flex flex-wrap gap-2">
              <div className="d-flex align-items-center">
                <div 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: '#dc3545', 
                    marginRight: '4px',
                    borderRadius: '2px'
                  }}
                ></div>
                <small>High Priority Tasks</small>
              </div>
              <div className="d-flex align-items-center">
                <div 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: '#fd7e14', 
                    marginRight: '4px',
                    borderRadius: '2px'
                  }}
                ></div>
                <small>Medium Priority Tasks</small>
              </div>
              <div className="d-flex align-items-center">
                <div 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: '#28a745', 
                    marginRight: '4px',
                    borderRadius: '2px'
                  }}
                ></div>
                <small>Low Priority Tasks</small>
              </div>
              <div className="d-flex align-items-center">
                <div 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: '#007bff', 
                    marginRight: '4px',
                    borderRadius: '2px'
                  }}
                ></div>
                <small>Active Sprints</small>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default CalendarWidget;