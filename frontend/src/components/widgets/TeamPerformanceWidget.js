import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Table, Form, Badge, ProgressBar } from 'react-bootstrap';
import { FaUsers, FaStar, FaCheck, FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';
import { getToken, removeTokenAndRedirect } from '../../utils/authUtils';

const TeamPerformanceWidget = ({ config = {} }) => {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(config.teamId || '');
  const [sortBy, setSortBy] = useState('completionRate');  // completionRate, totalTasks, name

  // Fetch available teams if none are selected
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = getToken();
        if (!token) {
          removeTokenAndRedirect();
          return;
        }

        const response = await axios.get('/api/users/teams', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTeams(response.data);
        
        // If no team is selected but we have teams, select the first one
        if (!selectedTeamId && response.data.length > 0) {
          setSelectedTeamId(response.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        if (err.response && err.response.status === 401) {
          removeTokenAndRedirect();
        }
      }
    };

    fetchTeams();
  }, []);

  // Fetch team performance data when a team is selected
  useEffect(() => {
    const fetchTeamData = async () => {
      if (!selectedTeamId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = getToken();
        
        if (!token) {
          removeTokenAndRedirect();
          return;
        }
        
        const response = await axios.get(`/api/analytics/teams/${selectedTeamId}/performance`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTeamData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching team performance data:', err);
        
        if (err.response && err.response.status === 401) {
          removeTokenAndRedirect();
        } else {
          setError(err.response?.data?.message || 'Failed to load team performance data');
          setLoading(false);
        }
      }
    };
    
    fetchTeamData();
  }, [selectedTeamId]);

  const handleTeamChange = (e) => {
    setSelectedTeamId(e.target.value);
  };

  const getCompletionRateColor = (rate) => {
    if (rate >= 75) return 'success';
    if (rate >= 50) return 'info';
    if (rate >= 25) return 'warning';
    return 'danger';
  };
  
  const getSortedMembers = () => {
    if (!teamData || !teamData.members) return [];
    
    return [...teamData.members].sort((a, b) => {
      switch (sortBy) {
        case 'completionRate':
          return b.completionRate - a.completionRate;
        case 'totalTasks':
          return b.totalTasks - a.totalTasks;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!selectedTeamId) {
    return (
      <Alert variant="info">
        No team selected. Please select a team to view performance metrics.
      </Alert>
    );
  }

  if (!teamData || !teamData.members) {
    return (
      <Alert variant="info">
        No performance data available for this team.
      </Alert>
    );
  }

  const sortedMembers = getSortedMembers();
  const selectedTeam = teams.find(t => t._id === selectedTeamId);

  return (
    <div className="team-performance-widget h-100 d-flex flex-column">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="widget-title m-0">
          <FaUsers className="me-2" />
          Team Performance
        </h5>
        
        <Form.Select 
          size="sm"
          value={selectedTeamId}
          onChange={handleTeamChange}
          style={{ width: '150px' }}
        >
          <option value="">Select Team</option>
          {teams.map(team => (
            <option key={team._id} value={team._id}>
              {team.name}
            </option>
          ))}
        </Form.Select>
      </div>
      
      <Card className="flex-grow-1">
        <Card.Body className="p-0">
          <div className="team-overview p-3 bg-light border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>{selectedTeam?.name}</strong>
                <div className="text-muted small">{sortedMembers.length} members</div>
              </div>
              <div className="text-end">
                <div className="d-flex align-items-center">
                  <span className="me-2">Team Completion Rate:</span>
                  <Badge bg={getCompletionRateColor(teamData.teamCompletionRate)}>
                    {Math.round(teamData.teamCompletionRate)}%
                  </Badge>
                </div>
                <div className="text-muted small">Total Tasks: {teamData.teamTotalTasks}</div>
              </div>
            </div>
          </div>
          
          <div className="sort-options px-3 py-2 border-bottom">
            <small className="text-muted me-2">Sort by:</small>
            <Form.Check
              inline
              type="radio"
              id="sort-completion"
              label="Completion Rate"
              name="sortOption"
              checked={sortBy === 'completionRate'}
              onChange={() => setSortBy('completionRate')}
            />
            <Form.Check
              inline
              type="radio"
              id="sort-tasks"
              label="Total Tasks"
              name="sortOption"
              checked={sortBy === 'totalTasks'}
              onChange={() => setSortBy('totalTasks')}
            />
            <Form.Check
              inline
              type="radio"
              id="sort-name"
              label="Name"
              name="sortOption"
              checked={sortBy === 'name'}
              onChange={() => setSortBy('name')}
            />
          </div>
          
          <Table hover responsive className="mb-0">
            <thead>
              <tr>
                <th>Team Member</th>
                <th className="text-center">Total Tasks</th>
                <th className="text-center">Completed</th>
                <th>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {sortedMembers.map(member => (
                <tr key={member._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      {sortBy === 'completionRate' && member.completionRate >= 75 && (
                        <FaStar className="text-warning me-1" title="Top Performer" />
                      )}
                      {member.name}
                    </div>
                  </td>
                  <td className="text-center">{member.totalTasks}</td>
                  <td className="text-center">
                    <div className="d-flex align-items-center justify-content-center">
                      <FaCheck className="text-success me-1" />
                      {member.completedTasks}
                    </div>
                  </td>
                  <td style={{ width: '30%' }}>
                    <div className="d-flex align-items-center">
                      <ProgressBar 
                        variant={getCompletionRateColor(member.completionRate)}
                        now={member.completionRate} 
                        className="flex-grow-1 me-2"
                        style={{ height: '8px' }}
                      />
                      <span className="text-nowrap">
                        {Math.round(member.completionRate)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default TeamPerformanceWidget;