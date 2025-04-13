import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Form, Row, Col, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { useTimer } from 'react-timer-hook';
import API_CONFIG from '../config';

const TimeTracker = ({ taskId, onTimeAdded }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeEntries, setTimeEntries] = useState([]);
  const [task, setTask] = useState(null);
  const [description, setDescription] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualStartTime, setManualStartTime] = useState('');
  const [manualEndTime, setManualEndTime] = useState('');
  const [manualDate, setManualDate] = useState(moment().format('YYYY-MM-DD'));
  const [manualDescription, setManualDescription] = useState('');
  
  const startTimeRef = useRef(null);
  
  // Timer setup
  const expiryTimestamp = new Date();
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + 3600); // 1 hour default
  
  const {
    seconds,
    minutes,
    hours,
    isRunning,
    start,
    pause,
    resume,
    restart
  } = useTimer({ expiryTimestamp, autoStart: false, onExpire: () => console.log('Timer expired') });

  useEffect(() => {
    if (taskId) {
      fetchTask();
      fetchTimeEntries();
    }
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.TASKS_ENDPOINT}/${taskId}`);
      setTask(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching task:', err);
      setError('Error loading task details');
      setLoading(false);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_CONFIG.TASKS_ENDPOINT}/${taskId}`);
      
      if (response.data && response.data.timeEntries) {
        // Sort time entries by start time (newest first)
        const sortedEntries = [...response.data.timeEntries].sort((a, b) => 
          new Date(b.startTime) - new Date(a.startTime)
        );
        setTimeEntries(sortedEntries);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching time entries:', err);
      setError('Error loading time entries');
      setLoading(false);
    }
  };

  const startTimer = () => {
    const time = new Date();
    startTimeRef.current = time;
    
    // Reset timer
    time.setSeconds(time.getSeconds() + 3600); // Add 1 hour for display
    restart(time);
    
    setIsTracking(true);
  };

  const stopTimer = async () => {
    pause();
    setIsTracking(false);
    
    if (!startTimeRef.current) return;
    
    const endTime = new Date();
    const durationMinutes = Math.round((endTime - startTimeRef.current) / 60000);
    
    try {
      setLoading(true);
      
      const timeEntry = {
        startTime: startTimeRef.current.toISOString(),
        endTime: endTime.toISOString(),
        description: description
      };
      
      const response = await axios.post(`${API_CONFIG.TASKS_ENDPOINT}/${taskId}/time`, timeEntry);
      
      if (response.data && response.data.success) {
        fetchTimeEntries();
        setDescription('');
        if (onTimeAdded) onTimeAdded(durationMinutes);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error logging time:', err);
      setError('Failed to save time entry');
      setLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    
    if (!manualStartTime || !manualEndTime || !manualDate) {
      setError('Please fill in all time fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create datetime objects
      const startDateTime = new Date(`${manualDate}T${manualStartTime}`);
      const endDateTime = new Date(`${manualDate}T${manualEndTime}`);
      
      // Validate times
      if (endDateTime <= startDateTime) {
        setError('End time must be after start time');
        setLoading(false);
        return;
      }
      
      const timeEntry = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        description: manualDescription
      };
      
      const response = await axios.post(`${API_CONFIG.TASKS_ENDPOINT}/${taskId}/time`, timeEntry);
      
      if (response.data && response.data.success) {
        // Calculate duration in minutes
        const durationMinutes = Math.round((endDateTime - startDateTime) / 60000);
        
        fetchTimeEntries();
        setManualDescription('');
        setShowManualEntry(false);
        if (onTimeAdded) onTimeAdded(durationMinutes);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error logging manual time:', err);
      setError('Failed to save time entry');
      setLoading(false);
    }
  };

  const deleteTimeEntry = async (timeEntryId) => {
    if (!window.confirm('Are you sure you want to delete this time entry?')) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.delete(`${API_CONFIG.TASKS_ENDPOINT}/${taskId}/time/${timeEntryId}`);
      
      if (response.data && response.data.success) {
        fetchTimeEntries();
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error deleting time entry:', err);
      setError('Failed to delete time entry');
      setLoading(false);
    }
  };

  const formatTime = (hours, minutes, seconds) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0 min';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    } else {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} min`;
    }
  };

  return (
    <Card className="shadow-sm mb-4">
      <Card.Header className="bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Time Tracking</h5>
          <Button 
            variant="outline-secondary" 
            size="sm"
            onClick={() => setShowManualEntry(!showManualEntry)}
          >
            {showManualEntry ? 'Cancel' : 'Manual Entry'}
          </Button>
        </div>
      </Card.Header>
      
      <Card.Body>
        {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        
        {loading && !timeEntries.length ? (
          <div className="text-center py-3">
            <Spinner animation="border" variant="primary" size="sm" />
            <span className="ms-2">Loading...</span>
          </div>
        ) : (
          <>
            {!showManualEntry ? (
              <div className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="timer-display me-3 px-3 py-2 border rounded bg-light">
                    <span className="fs-4">{formatTime(hours, minutes, seconds)}</span>
                  </div>
                  
                  {!isTracking ? (
                    <Button 
                      variant="success" 
                      onClick={startTimer}
                      disabled={loading}
                    >
                      Start Timer
                    </Button>
                  ) : (
                    <Button 
                      variant="danger" 
                      onClick={stopTimer}
                      disabled={loading}
                    >
                      Stop Timer
                    </Button>
                  )}
                </div>
                
                <Form.Group>
                  <Form.Label>Description (optional)</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    placeholder="What are you working on?" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                  />
                </Form.Group>
              </div>
            ) : (
              <Form onSubmit={handleManualSubmit} className="mb-4">
                <Row className="mb-3">
                  <Form.Group as={Col}>
                    <Form.Label>Date</Form.Label>
                    <Form.Control 
                      type="date" 
                      value={manualDate}
                      onChange={(e) => setManualDate(e.target.value)}
                      max={moment().format('YYYY-MM-DD')}
                      required
                    />
                  </Form.Group>
                </Row>
                
                <Row className="mb-3">
                  <Form.Group as={Col}>
                    <Form.Label>Start Time</Form.Label>
                    <Form.Control 
                      type="time" 
                      value={manualStartTime}
                      onChange={(e) => setManualStartTime(e.target.value)}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group as={Col}>
                    <Form.Label>End Time</Form.Label>
                    <Form.Control 
                      type="time" 
                      value={manualEndTime}
                      onChange={(e) => setManualEndTime(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Description (optional)</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    placeholder="What did you work on?" 
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                  />
                </Form.Group>
                
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? <Spinner size="sm" animation="border" /> : 'Save Time Entry'}
                </Button>
              </Form>
            )}
            
            <h6 className="mb-3 mt-4">Recent Time Entries</h6>
            
            {timeEntries.length === 0 ? (
              <p className="text-muted">No time entries recorded yet.</p>
            ) : (
              <ListGroup>
                {timeEntries.slice(0, 5).map((entry) => (
                  <ListGroup.Item key={entry._id} className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="text-primary">
                        {moment(entry.startTime).format('MMM D, YYYY')} | {moment(entry.startTime).format('h:mm A')} - {moment(entry.endTime).format('h:mm A')}
                      </div>
                      <div className="text-muted small">
                        {entry.description || 'No description'}
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <Badge bg="secondary" className="me-2">{formatDuration(entry.duration)}</Badge>
                      <Button 
                        variant="link" 
                        className="p-0 text-danger" 
                        size="sm"
                        onClick={() => deleteTimeEntry(entry._id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default TimeTracker; 