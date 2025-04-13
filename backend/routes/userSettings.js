const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const UserSettings = require('../models/UserSettings');
const User = require('../models/User');
const { authenticateToken, checkRole } = require('../middleware/authMiddleware');

// Get user settings
router.get('/', auth, async (req, res) => {
    try {
        // Use the getOrCreateSettings static method to ensure settings exist
        const settings = await UserSettings.getOrCreateSettings(req.user._id);
        
        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update dashboard layout
router.patch('/dashboard/layout', auth, async (req, res) => {
    try {
        const { layout } = req.body;
        
        if (!layout || !['Grid', 'List', 'Compact'].includes(layout)) {
            return res.status(400).json({
                success: false,
                error: 'Valid layout is required (Grid, List, or Compact)'
            });
        }
        
        // Get or create settings
        let settings = await UserSettings.getOrCreateSettings(req.user._id);
        
        // Update layout
        settings.dashboardConfig.layout = layout;
        settings.dashboardConfig.lastModified = Date.now();
        await settings.save();
        
        res.json({
            success: true,
            message: 'Dashboard layout updated successfully',
            settings
        });
    } catch (error) {
        console.error('Error updating dashboard layout:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update dashboard theme
router.patch('/dashboard/theme', auth, async (req, res) => {
    try {
        const { theme } = req.body;
        
        if (!theme || !['Light', 'Dark', 'System'].includes(theme)) {
            return res.status(400).json({
                success: false,
                error: 'Valid theme is required (Light, Dark, or System)'
            });
        }
        
        // Get or create settings
        let settings = await UserSettings.getOrCreateSettings(req.user._id);
        
        // Update theme
        settings.dashboardConfig.theme = theme;
        settings.dashboardConfig.lastModified = Date.now();
        await settings.save();
        
        res.json({
            success: true,
            message: 'Dashboard theme updated successfully',
            settings
        });
    } catch (error) {
        console.error('Error updating dashboard theme:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add a dashboard widget
router.post('/dashboard/widgets', auth, async (req, res) => {
    try {
        const { type, title, position, config } = req.body;
        
        if (!type || !title) {
            return res.status(400).json({
                success: false,
                error: 'Widget type and title are required'
            });
        }
        
        // Get or create settings
        let settings = await UserSettings.getOrCreateSettings(req.user._id);
        
        // Create widget
        const widget = {
            type,
            title,
            position: position || { x: 0, y: 0, width: 6, height: 4 },
            config: config || {},
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        // Add widget
        settings.dashboardConfig.widgets.push(widget);
        settings.dashboardConfig.lastModified = Date.now();
        await settings.save();
        
        res.json({
            success: true,
            message: 'Widget added successfully',
            widget,
            settings
        });
    } catch (error) {
        console.error('Error adding widget:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update a dashboard widget
router.patch('/dashboard/widgets/:widgetId', auth, async (req, res) => {
    try {
        const { title, position, config } = req.body;
        
        // Get settings
        let settings = await UserSettings.getOrCreateSettings(req.user._id);
        
        // Find widget
        const widget = settings.dashboardConfig.widgets.id(req.params.widgetId);
        
        if (!widget) {
            return res.status(404).json({
                success: false,
                error: 'Widget not found'
            });
        }
        
        // Update widget
        if (title) widget.title = title;
        if (position) widget.position = position;
        if (config) widget.config = config;
        widget.updatedAt = Date.now();
        
        settings.dashboardConfig.lastModified = Date.now();
        await settings.save();
        
        res.json({
            success: true,
            message: 'Widget updated successfully',
            widget,
            settings
        });
    } catch (error) {
        console.error('Error updating widget:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete a dashboard widget
router.delete('/dashboard/widgets/:widgetId', auth, async (req, res) => {
    try {
        // Get settings
        let settings = await UserSettings.getOrCreateSettings(req.user._id);
        
        // Find widget
        const widget = settings.dashboardConfig.widgets.id(req.params.widgetId);
        
        if (!widget) {
            return res.status(404).json({
                success: false,
                error: 'Widget not found'
            });
        }
        
        // Remove widget
        widget.remove();
        settings.dashboardConfig.lastModified = Date.now();
        await settings.save();
        
        res.json({
            success: true,
            message: 'Widget removed successfully',
            settings
        });
    } catch (error) {
        console.error('Error removing widget:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update notification preferences
router.patch('/notifications', auth, async (req, res) => {
    try {
        const { email, inApp } = req.body;
        
        // Get settings
        let settings = await UserSettings.getOrCreateSettings(req.user._id);
        
        // Update preferences
        if (email) {
            settings.notificationPreferences.email = {
                ...settings.notificationPreferences.email,
                ...email
            };
        }
        
        if (inApp) {
            settings.notificationPreferences.inApp = {
                ...settings.notificationPreferences.inApp,
                ...inApp
            };
        }
        
        await settings.save();
        
        res.json({
            success: true,
            message: 'Notification preferences updated successfully',
            settings
        });
    } catch (error) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update time tracking settings
router.patch('/timeTracking', auth, async (req, res) => {
    try {
        const { reminderInterval, autoStop, workingHours } = req.body;
        
        // Get settings
        let settings = await UserSettings.getOrCreateSettings(req.user._id);
        
        // Update settings
        if (reminderInterval !== undefined) settings.timeTrackingSettings.reminderInterval = reminderInterval;
        if (autoStop !== undefined) settings.timeTrackingSettings.autoStop = autoStop;
        
        if (workingHours) {
            if (workingHours.start) settings.timeTrackingSettings.workingHours.start = workingHours.start;
            if (workingHours.end) settings.timeTrackingSettings.workingHours.end = workingHours.end;
            if (workingHours.workingDays) settings.timeTrackingSettings.workingHours.workingDays = workingHours.workingDays;
        }
        
        await settings.save();
        
        res.json({
            success: true,
            message: 'Time tracking settings updated successfully',
            settings
        });
    } catch (error) {
        console.error('Error updating time tracking settings:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Save a report configuration
router.post('/reports', auth, async (req, res) => {
    try {
        const { name, type, config } = req.body;
        
        if (!name || !type) {
            return res.status(400).json({
                success: false,
                error: 'Report name and type are required'
            });
        }
        
        // Get settings
        let settings = await UserSettings.getOrCreateSettings(req.user._id);
        
        // Create report
        const report = {
            name,
            type,
            config: config || {},
            createdAt: Date.now()
        };
        
        // Add report
        settings.reportPreferences.savedReports.push(report);
        await settings.save();
        
        res.json({
            success: true,
            message: 'Report saved successfully',
            report,
            settings
        });
    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Delete a saved report
router.delete('/reports/:reportId', auth, async (req, res) => {
    try {
        // Get settings
        let settings = await UserSettings.getOrCreateSettings(req.user._id);
        
        // Find report
        const report = settings.reportPreferences.savedReports.id(req.params.reportId);
        
        if (!report) {
            return res.status(404).json({
                success: false,
                error: 'Report not found'
            });
        }
        
        // Remove report
        report.remove();
        await settings.save();
        
        res.json({
            success: true,
            message: 'Report removed successfully',
            settings
        });
    } catch (error) {
        console.error('Error removing report:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Update default export format
router.patch('/reports/format', auth, async (req, res) => {
    try {
        const { format } = req.body;
        
        if (!format || !['PDF', 'Excel', 'CSV'].includes(format)) {
            return res.status(400).json({
                success: false,
                error: 'Valid format is required (PDF, Excel, or CSV)'
            });
        }
        
        // Get settings
        let settings = await UserSettings.getOrCreateSettings(req.user._id);
        
        // Update format
        settings.reportPreferences.defaultExportFormat = format;
        await settings.save();
        
        res.json({
            success: true,
            message: 'Default export format updated successfully',
            settings
        });
    } catch (error) {
        console.error('Error updating export format:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Add or update an integration
router.post('/integrations', auth, async (req, res) => {
    try {
        const { type, accessToken, refreshToken, tokenExpiry, config } = req.body;
        
        if (!type || !accessToken) {
            return res.status(400).json({
                success: false,
                error: 'Integration type and access token are required'
            });
        }
        
        // Get settings
        let settings = await UserSettings.getOrCreateSettings(req.user._id);
        
        // Check if integration exists
        let integration = settings.integrations.find(i => i.type === type);
        
        if (integration) {
            // Update existing
            integration.accessToken = accessToken;
            integration.refreshToken = refreshToken || integration.refreshToken;
            integration.tokenExpiry = tokenExpiry || integration.tokenExpiry;
            integration.config = config || integration.config;
            integration.isConnected = true;
            integration.updatedAt = Date.now();
        } else {
            // Add new integration
            settings.integrations.push({
                type,
                accessToken,
                refreshToken,
                tokenExpiry,
                config: config || {},
                isConnected: true,
                updatedAt: Date.now()
            });
        }
        
        await settings.save();
        
        res.json({
            success: true,
            message: 'Integration updated successfully',
            settings
        });
    } catch (error) {
        console.error('Error updating integration:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Remove an integration
router.delete('/integrations/:type', auth, async (req, res) => {
    try {
        // Get settings
        let settings = await UserSettings.getOrCreateSettings(req.user._id);
        
        // Find integration
        const integrationIndex = settings.integrations.findIndex(i => i.type === req.params.type);
        
        if (integrationIndex === -1) {
            return res.status(404).json({
                success: false,
                error: 'Integration not found'
            });
        }
        
        // Remove integration
        settings.integrations.splice(integrationIndex, 1);
        await settings.save();
        
        res.json({
            success: true,
            message: 'Integration removed successfully',
            settings
        });
    } catch (error) {
        console.error('Error removing integration:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get user dashboard configuration
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return dashboard settings if they exist, otherwise return empty defaults
    const dashboardSettings = user.dashboardSettings || { widgets: [], layouts: {} };
    
    return res.status(200).json(dashboardSettings);
  } catch (error) {
    console.error('Error fetching dashboard settings:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update user dashboard configuration
router.post('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { widgets, layouts } = req.body;
    
    // Validate request body
    if (!widgets || !Array.isArray(widgets)) {
      return res.status(400).json({ error: 'Invalid dashboard configuration: widgets array is required' });
    }
    
    // Update user with new dashboard settings
    const user = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          dashboardSettings: {
            widgets,
            layouts: layouts || {}
          } 
        } 
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json({ message: 'Dashboard settings updated successfully' });
  } catch (error) {
    console.error('Error updating dashboard settings:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get dashboard template suggestions for user
router.get('/dashboard/templates', authenticateToken, async (req, res) => {
  try {
    const { role } = req.user;
    
    // Define templates based on user role
    const templates = {
      Admin: ['admin', 'projectManager', 'minimal'],
      'Project Manager': ['projectManager', 'minimal'],
      Developer: ['developer', 'minimal'],
      default: ['minimal']
    };
    
    return res.status(200).json({ 
      suggestions: templates[role] || templates.default
    });
  } catch (error) {
    console.error('Error fetching dashboard templates:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Get user theme preferences
router.get('/theme', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return theme settings if they exist, otherwise return default theme
    const theme = user.themePreference || 'light';
    
    return res.status(200).json({ theme });
  } catch (error) {
    console.error('Error fetching theme preference:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update user theme preferences
router.post('/theme', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;
    
    // Validate theme value
    if (!theme || (theme !== 'light' && theme !== 'dark')) {
      return res.status(400).json({ error: 'Invalid theme preference: must be "light" or "dark"' });
    }
    
    // Update user with new theme preference
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { themePreference: theme } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json({ message: 'Theme preference updated successfully' });
  } catch (error) {
    console.error('Error updating theme preference:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// Update user notification settings
router.post('/notifications', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { settings } = req.body;
    
    // Validate settings object
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Invalid notification settings' });
    }
    
    // Update user with new notification settings
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { notificationSettings: settings } },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json({ message: 'Notification settings updated successfully' });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 