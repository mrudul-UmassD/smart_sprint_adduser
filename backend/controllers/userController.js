const User = require('../models/User');
const Project = require('../models/Project');
const mongoose = require('mongoose');

// Add a function to get user's assigned projects for dashboard widgets

/**
 * Get projects assigned to the current user
 * @route GET /api/users/projects
 * @access Private
 */
exports.getUserProjects = async (req, res) => {
  try {
    // Get the user ID from the authenticated request
    const userId = req.user.id;
    
    // Find the user with their assigned projects
    const user = await User.findById(userId).populate('projects');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // For admins and project managers, return all projects
    if (user.role === 'Admin' || user.role === 'Project Manager') {
      const allProjects = await Project.find().select('_id name description status startDate endDate');
      return res.json(allProjects);
    }
    
    // For other roles, return only assigned projects
    return res.json(user.projects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Assign a project to a user
 * @route POST /api/users/:userId/projects/:projectId
 * @access Private (Admin, Project Manager)
 */
exports.assignProjectToUser = async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    
    // Check if project is already assigned to user
    if (user.projects.includes(projectId)) {
      return res.status(400).json({ success: false, message: 'Project already assigned to this user' });
    }
    
    // Add project to user's projects
    user.projects.push(projectId);
    await user.save();
    
    res.json({ success: true, message: 'Project assigned successfully' });
  } catch (error) {
    console.error('Error assigning project to user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Remove a project assignment from a user
 * @route DELETE /api/users/:userId/projects/:projectId
 * @access Private (Admin, Project Manager)
 */
exports.removeProjectFromUser = async (req, res) => {
  try {
    const { userId, projectId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if project is assigned to user
    if (!user.projects.includes(projectId)) {
      return res.status(400).json({ success: false, message: 'Project is not assigned to this user' });
    }
    
    // Remove project from user's projects
    user.projects = user.projects.filter(p => p.toString() !== projectId);
    await user.save();
    
    res.json({ success: true, message: 'Project removed successfully' });
  } catch (error) {
    console.error('Error removing project from user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * Save a dashboard layout for the current user
 * @route POST /api/users/dashboard-layouts
 * @access Private
 */
exports.saveDashboardLayout = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create a new dashboard layout
    const newLayout = {
      name: req.body.name || 'My Dashboard',
      layouts: req.body.layouts || {},
      widgets: req.body.widgets || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add the new layout to the user's dashboardLayouts
    if (!user.dashboardLayouts) {
      user.dashboardLayouts = [];
    }
    
    user.dashboardLayouts.push(newLayout);
    await user.save();
    
    // Return the new layout with its ID
    const savedLayout = user.dashboardLayouts[user.dashboardLayouts.length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Dashboard layout saved successfully',
      data: savedLayout
    });
  } catch (error) {
    console.error('Error saving dashboard layout:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while saving dashboard layout'
    });
  }
};

/**
 * Get all dashboard layouts for the current user
 * @route GET /api/users/dashboard-layouts
 * @access Private
 */
exports.getDashboardLayouts = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find the user and select just the dashboardLayouts field
    const user = await User.findById(userId).select('dashboardLayouts');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Return the dashboard layouts
    res.json(user.dashboardLayouts || []);
  } catch (error) {
    console.error('Error fetching dashboard layouts:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard layouts'
    });
  }
};

/**
 * Get a specific dashboard layout by ID
 * @route GET /api/users/dashboard-layouts/:id
 * @access Private
 */
exports.getDashboardLayoutById = async (req, res) => {
  try {
    const userId = req.user.id;
    const layoutId = req.params.id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find the layout in the user's dashboardLayouts
    const layout = user.dashboardLayouts.id(layoutId);
    if (!layout) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard layout not found'
      });
    }
    
    // Return the layout
    res.json(layout);
  } catch (error) {
    console.error('Error fetching dashboard layout:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard layout'
    });
  }
};

/**
 * Update a dashboard layout
 * @route PUT /api/users/dashboard-layouts/:id
 * @access Private
 */
exports.updateDashboardLayout = async (req, res) => {
  try {
    const userId = req.user.id;
    const layoutId = req.params.id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find the layout in the user's dashboardLayouts
    const layout = user.dashboardLayouts.id(layoutId);
    if (!layout) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard layout not found'
      });
    }
    
    // Update the layout fields
    if (req.body.name) layout.name = req.body.name;
    if (req.body.layouts) layout.layouts = req.body.layouts;
    if (req.body.widgets) layout.widgets = req.body.widgets;
    layout.updatedAt = new Date();
    
    // Save the user document
    await user.save();
    
    // Return the updated layout
    res.json({
      success: true,
      message: 'Dashboard layout updated successfully',
      data: layout
    });
  } catch (error) {
    console.error('Error updating dashboard layout:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating dashboard layout'
    });
  }
};

/**
 * Delete a dashboard layout
 * @route DELETE /api/users/dashboard-layouts/:id
 * @access Private
 */
exports.deleteDashboardLayout = async (req, res) => {
  try {
    const userId = req.user.id;
    const layoutId = req.params.id;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Find the layout in the user's dashboardLayouts
    const layout = user.dashboardLayouts.id(layoutId);
    if (!layout) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard layout not found'
      });
    }
    
    // Remove the layout from the array
    user.dashboardLayouts.pull(layoutId);
    
    // Save the user document
    await user.save();
    
    // Return success message
    res.json({
      success: true,
      message: 'Dashboard layout deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dashboard layout:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting dashboard layout'
    });
  }
}; 