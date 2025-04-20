const cron = require('cron');
const Task = require('../models/Task');
const Project = require('../models/Project');
// Comment out missing model import to fix crash
// const Sprint = require('../models/Sprint');
const User = require('../models/User');
const notificationGenerator = require('./notificationGenerator');
const mongoose = require('mongoose');

// Function to check for tasks due soon (tasks due in 2 days)
const checkTasksDueSoon = async () => {
  try {
    console.log('Running scheduled task: checkTasksDueSoon');
    
    // Get current date and date 2 days from now
    const now = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);
    
    // Set time to end of day for twoDaysFromNow
    twoDaysFromNow.setHours(23, 59, 59, 999);
    
    // Find tasks that are due in 2 days and not completed
    const tasks = await Task.find({
      dueDate: {
        $gte: now,
        $lte: twoDaysFromNow
      },
      status: { $ne: 'Completed' },
      // Only include tasks that haven't already been notified about
      dueDateNotified: { $ne: true }
    });
    
    console.log(`Found ${tasks.length} tasks due soon`);
    
    // Create notifications for each task
    for (const task of tasks) {
      await notificationGenerator.taskDueSoon(task);
      
      // Mark task as notified
      await Task.findByIdAndUpdate(task._id, { dueDateNotified: true });
    }
  } catch (error) {
    console.error('Error in checkTasksDueSoon:', error);
  }
};

// Function to check for sprints ending soon (sprints ending in 2 days)
const checkSprintsEndingSoon = async () => {
  try {
    console.log('Running scheduled task: checkSprintsEndingSoon');
    
    // Comment out Sprint-related code to prevent errors
    console.log('Sprint functionality is temporarily disabled');
    
    /* Original code commented out to fix crash
    // Get current date and date 2 days from now
    const now = new Date();
    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(now.getDate() + 2);
    
    // Set time to end of day for twoDaysFromNow
    twoDaysFromNow.setHours(23, 59, 59, 999);
    
    // Find active sprints that are ending in 2 days
    const sprints = await Sprint.find({
      endDate: {
        $gte: now,
        $lte: twoDaysFromNow
      },
      status: 'Active',
      // Only include sprints that haven't already been notified about
      endDateNotified: { $ne: true }
    });
    
    console.log(`Found ${sprints.length} sprints ending soon`);
    
    // Create notifications for each sprint
    for (const sprint of sprints) {
      // Get the project for this sprint
      const project = await Project.findById(sprint.project);
      
      if (project) {
        await notificationGenerator.sprintEndingSoon(sprint, project);
        
        // Mark sprint as notified
        await Sprint.findByIdAndUpdate(sprint._id, { endDateNotified: true });
      }
    }
    */
  } catch (error) {
    console.error('Error in checkSprintsEndingSoon:', error);
  }
};

// Function to clean up old notifications
const cleanupOldNotifications = async () => {
  try {
    console.log('Running scheduled task: cleanupOldNotifications');
    
    // Get date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Delete read notifications older than 30 days
    const result = await mongoose.connection.collection('notifications').deleteMany({
      read: true,
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    console.log(`Deleted ${result.deletedCount} old notifications`);
  } catch (error) {
    console.error('Error in cleanupOldNotifications:', error);
  }
};

// Schedule daily tasks (run at 8:00 AM every day)
const scheduleDailyTasks = () => {
  // Check for tasks due soon - runs at 8:00 AM every day
  const tasksDueSoonJob = new cron.CronJob(
    '0 8 * * *', // Cron expression: minute hour day-of-month month day-of-week
    checkTasksDueSoon,
    null, // onComplete
    false, // start
    'UTC'  // timezone
  );
  
  // Check for sprints ending soon - runs at 8:30 AM every day
  const sprintsEndingSoonJob = new cron.CronJob(
    '30 8 * * *',
    checkSprintsEndingSoon,
    null,
    false,
    'UTC'
  );
  
  // Cleanup old notifications - runs at 3:00 AM every Sunday
  const cleanupNotificationsJob = new cron.CronJob(
    '0 3 * * 0',
    cleanupOldNotifications,
    null,
    false,
    'UTC'
  );
  
  // Start the scheduled jobs
  tasksDueSoonJob.start();
  sprintsEndingSoonJob.start();
  cleanupNotificationsJob.start();
  
  console.log('Scheduled notification tasks initialized');
};

module.exports = {
  scheduleDailyTasks,
  // Export for manual testing
  checkTasksDueSoon,
  checkSprintsEndingSoon,
  cleanupOldNotifications
}; 