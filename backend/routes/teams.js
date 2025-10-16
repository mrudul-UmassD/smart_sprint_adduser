const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all teams
router.get('/', auth, async (req, res) => {
  try {
    // Get unique teams from user records
    const teams = await User.aggregate([
      {
        $match: { 
          team: { $exists: true, $ne: null },
        }
      },
      {
        $group: {
          _id: '$team',
          name: { $first: '$team' },
          memberCount: { $sum: 1 }
        }
      },
      {
        $sort: { name: 1 }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          memberCount: 1
        }
      }
    ]);
    
    res.status(200).json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team members
router.get('/:teamName/members', auth, async (req, res) => {
  try {
    const { teamName } = req.params;
    
    if (!teamName) {
      return res.status(400).json({ message: 'Team name is required' });
    }
    
    const members = await User.find({ 
      team: teamName 
    }).select('_id username fullName email level profilePicture');
    
    res.status(200).json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get list of available teams (for dropdown selection)
router.get('/list', auth, async (req, res) => {
  try {
    const teams = await User.distinct('team', { 
      team: { $exists: true, $ne: null }
    });
    
    const formattedTeams = teams.filter(Boolean).map(team => ({
      _id: team,
      name: team
    }));
    
    res.status(200).json(formattedTeams);
  } catch (error) {
    console.error('Error fetching team list:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team statistics
router.get('/:teamName/stats', auth, async (req, res) => {
  try {
    const { teamName } = req.params;
    
    if (!teamName) {
      return res.status(400).json({ message: 'Team name is required' });
    }
    
    // Get team members
    const members = await User.find({ team: teamName })
      .select('_id username');
    
    const memberIds = members.map(member => member._id);
    
    // For a real implementation, you would query tasks related to these members
    // and calculate various statistics
    
    // This is a placeholder response
    res.status(200).json({
      teamName,
      memberCount: members.length,
      stats: {
        completedTasks: 0,
        tasksInProgress: 0,
        upcomingDeadlines: 0
      }
    });
  } catch (error) {
    console.error('Error fetching team statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 