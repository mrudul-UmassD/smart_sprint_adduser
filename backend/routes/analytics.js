const express = require('express');
const router = express.Router();
const analyticsService = require('../services/analyticsService');
const { authenticateToken } = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');

// Get project analytics
router.get('/projects/:projectId', authenticateToken, async (req, res) => {
  try {
    const analytics = await analyticsService.getProjectAnalytics(req.params.projectId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get team performance analytics
router.get('/team/:team', authenticateToken, async (req, res) => {
  try {
    const performance = await analyticsService.getTeamPerformance(req.params.team);
    res.json(performance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get project timeline analytics
router.get('/timeline/:projectId', authenticateToken, async (req, res) => {
  try {
    const timeline = await analyticsService.getProjectTimeline(req.params.projectId);
    res.json(timeline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get burndown chart data
router.get('/burndown/:projectId', authenticateToken, async (req, res) => {
  try {
    const burndown = await analyticsService.getBurndownData(req.params.projectId);
    res.json(burndown);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { timeRange, projectId } = req.query;
    const userId = req.user.id;
    
    // Default to last 30 days if no time range is specified
    const days = timeRange ? parseInt(timeRange) : 30;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Query parameters for filtering
    const dateFilter = {
      createdAt: { $gte: startDate, $lte: endDate }
    };
    
    // Project filter based on user role and projectId
    let projectFilter = {};
    
    if (projectId) {
      projectFilter = { _id: projectId };
    } else if (req.user.role === 'Developer') {
      // For developers, only show projects they're part of
      const projects = await Project.find({ 'members.user': userId });
      projectFilter = { _id: { $in: projects.map(p => p._id) } };
    }
    
    // Get projects data
    const projects = await Project.find(projectFilter)
      .select('name startDate endDate members');
    
    // Get tasks data within date range
    const tasks = await Task.find({ 
      ...dateFilter,
      project: projectId ? projectId : { $in: projects.map(p => p._id) }
    });
    
    // Calculate task metrics
    const taskStatusCount = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, { todo: 0, inProgress: 0, review: 0, done: 0 });
    
    // Calculate task completion trend over time
    const completionTrend = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const date = currentDate.toISOString().split('T')[0];
      const completedTasks = tasks.filter(task => 
        task.status === 'done' && 
        new Date(task.updatedAt).toISOString().split('T')[0] === date
      ).length;
      
      completionTrend.push({ date, count: completedTasks });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Calculate high priority task count
    const highPriorityCount = tasks.filter(task => 
      task.priority === 'high' && task.status !== 'done'
    ).length;
    
    // Calculate project health
    const projectHealth = projects.map(project => {
      const projectTasks = tasks.filter(task => 
        task.project.toString() === project._id.toString()
      );
      
      const completedTasks = projectTasks.filter(task => task.status === 'done').length;
      const totalTasks = projectTasks.length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      // Calculate health based on completion rate and time elapsed
      const startDate = new Date(project.startDate);
      const endDate = new Date(project.endDate);
      const totalDuration = endDate - startDate;
      const elapsed = Date.now() - startDate;
      const timeProgress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
      
      let health = 'good';
      if (timeProgress > completionRate + 20) {
        health = 'critical';
      } else if (timeProgress > completionRate + 10) {
        health = 'at-risk';
      }
      
      return {
        projectId: project._id,
        name: project.name,
        completionRate: completionRate.toFixed(1),
        timeProgress: timeProgress.toFixed(1),
        health
      };
    });
    
    res.json({
      taskMetrics: {
        statusDistribution: taskStatusCount,
        highPriorityCount,
        total: tasks.length
      },
      completionTrend,
      projectHealth,
      timeRange: days,
      projects: projects.map(p => ({ id: p._id, name: p.name }))
    });
    
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Project summary
router.get('/projects/:projectId/summary', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    let project;
    
    // If projectId is 'all', return summary across all accessible projects
    if (projectId === 'all') {
      // Get tasks accessible to the user based on role
      const tasks = await getTasksForUser(req.user);
      
      // Calculate summary data from tasks
      const completedTasks = tasks.filter(task => task.status === 'Completed').length;
      const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
      
      return res.status(200).json({
        name: 'All Projects',
        taskStats: {
          total: tasks.length,
          completed: completedTasks,
          inProgress: inProgressTasks
        },
        completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
        dueDate: null  // No specific due date for all projects view
      });
    }
    
    // Verify project exists
    project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Verify user has access to the project
    if (!await userHasAccessToProject(req.user, project)) {
      return res.status(403).json({ error: 'You do not have access to this project' });
    }
    
    // Get tasks for this project
    const tasks = await Task.find({ project: projectId });
    
    // Calculate summary data
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    
    return res.status(200).json({
      name: project.name,
      taskStats: {
        total: tasks.length,
        completed: completedTasks,
        inProgress: inProgressTasks
      },
      completionRate: tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0,
      dueDate: project.dueDate
    });
  } catch (error) {
    console.error('Error fetching project summary:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Burndown chart data
router.get('/projects/:projectId/burndown', authenticateToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // If projectId is 'all', return burndown data across all accessible projects
    if (projectId === 'all') {
      // Generate dates for the past 14 days
      const today = new Date();
      const dates = [];
      const remainingTasks = [];
      const idealBurndown = [];
      
      // Get tasks accessible to the user
      const tasks = await getTasksForUser(req.user);
      const totalTasks = tasks.length;
      
      // Create date and data points for each day
      for (let i = 14; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
        
        // Calculate tasks remaining on this date
        const tasksCompleted = tasks.filter(task => {
          if (task.completedAt) {
            const completedDate = new Date(task.completedAt);
            return completedDate <= date;
          }
          return false;
        }).length;
        
        remainingTasks.push(totalTasks - tasksCompleted);
        
        // Generate ideal burndown line
        const idealTasksRemaining = Math.round(totalTasks * (i / 14));
        idealBurndown.push(idealTasksRemaining);
      }
      
      return res.status(200).json({
        dates,
        remainingTasks,
        idealBurndown
      });
    }
    
    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // Verify user has access to the project
    if (!await userHasAccessToProject(req.user, project)) {
      return res.status(403).json({ error: 'You do not have access to this project' });
    }
    
    // Get tasks for this project
    const tasks = await Task.find({ project: projectId });
    const totalTasks = tasks.length;
    
    // Generate dates from project start to due date (or today + 7 days if no due date)
    const startDate = project.startDate || new Date(Date.now() - (14 * 24 * 60 * 60 * 1000)); // 14 days ago if no start date
    const endDate = project.dueDate || new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now if no due date
    
    const dates = [];
    const remainingTasks = [];
    const idealBurndown = [];
    
    // Create dates and data points
    const numberOfDays = Math.ceil((endDate - startDate) / (24 * 60 * 60 * 1000));
    
    for (let i = 0; i <= numberOfDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Skip future dates beyond today
      if (date > new Date()) break;
      
      dates.push(date.toISOString().split('T')[0]);
      
      // Calculate tasks remaining on this date
      const tasksCompleted = tasks.filter(task => {
        if (task.completedAt) {
          const completedDate = new Date(task.completedAt);
          return completedDate <= date;
        }
        return false;
      }).length;
      
      remainingTasks.push(totalTasks - tasksCompleted);
      
      // Generate ideal burndown line
      const idealTasksRemaining = Math.max(0, Math.round(totalTasks * (1 - (i / numberOfDays))));
      idealBurndown.push(idealTasksRemaining);
    }
    
    return res.status(200).json({
      dates,
      remainingTasks,
      idealBurndown
    });
  } catch (error) {
    console.error('Error generating burndown chart data:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Team performance data
router.get('/teams/:team/performance', authenticateToken, async (req, res) => {
  try {
    const { team } = req.params;
    
    // Get all users in the team (or all users if team is 'all')
    const userQuery = team === 'all' ? {} : { team };
    const users = await User.find(userQuery).select('_id username team role');
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'No users found for this team' });
    }
    
    // Prepare array to collect performance data
    const teamPerformance = [];
    
    // For each user, calculate performance metrics
    for (const user of users) {
      // Get tasks assigned to this user
      const tasks = await Task.find({ assignedTo: user._id });
      
      // Calculate performance metrics
      const tasksAssigned = tasks.length;
      const tasksCompleted = tasks.filter(task => task.status === 'Completed').length;
      const completionRate = tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 0;
      
      // Add to team performance data
      teamPerformance.push({
        userId: user._id,
        name: user.username,
        team: user.team,
        role: user.role,
        tasksAssigned,
        tasksCompleted,
        completionRate
      });
    }
    
    // Sort by completion rate (highest first)
    teamPerformance.sort((a, b) => b.completionRate - a.completionRate);
    
    return res.status(200).json(teamPerformance);
  } catch (error) {
    console.error('Error calculating team performance:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get task data for "My Tasks" widget
router.get('/tasks/my-tasks', authenticateToken, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const userId = req.user.id;
    
    // Get tasks assigned to the user
    const tasks = await Task.find({ assignedTo: userId })
      .sort({ dueDate: 1 }) // Sort by due date (ascending)
      .limit(parseInt(limit))
      .populate('project', 'name');
    
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to get tasks accessible to a user based on role
async function getTasksForUser(user) {
  // If admin, return all tasks
  if (user.role === 'Admin') {
    return await Task.find({});
  }
  
  // If project manager, return tasks for projects they manage
  if (user.role === 'Project Manager') {
    const projects = await Project.find({ manager: user.id });
    const projectIds = projects.map(project => project._id);
    return await Task.find({ project: { $in: projectIds } });
  }
  
  // If developer, return tasks assigned to them
  return await Task.find({ assignedTo: user.id });
}

// Helper function to check if a user has access to a project
async function userHasAccessToProject(user, project) {
  // Admins have access to all projects
  if (user.role === 'Admin') {
    return true;
  }
  
  // Project managers have access to projects they manage
  if (user.role === 'Project Manager' && project.manager.toString() === user.id) {
    return true;
  }
  
  // Developers have access to projects they're members of
  if (user.role === 'Developer') {
    return project.members.some(member => member.user.toString() === user.id);
  }
  
  return false;
}

module.exports = router; 