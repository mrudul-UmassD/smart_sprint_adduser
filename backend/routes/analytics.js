const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const auth = require('../middleware/auth');

// Get project analytics
router.get('/project/:projectId', auth, async (req, res) => {
  try {
    const analytics = await analyticsService.getProjectAnalytics(req.params.projectId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get team performance
router.get('/team/:team', auth, async (req, res) => {
  try {
    const performance = await analyticsService.getTeamPerformance(req.params.team);
    res.json(performance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get project timeline
router.get('/timeline/:projectId', auth, async (req, res) => {
  try {
    const timeline = await analyticsService.getProjectTimeline(req.params.projectId);
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get burndown chart data
router.get('/burndown/:projectId', auth, async (req, res) => {
  try {
    const burndownData = await analyticsService.getBurndownData(req.params.projectId);
    res.json(burndownData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 