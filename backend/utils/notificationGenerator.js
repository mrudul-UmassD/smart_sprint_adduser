const notificationController = require('../controllers/notificationController');

/**
 * Generate a notification when a task is assigned to a user
 * @param {Object} task - The task that was assigned
 * @param {string} assignerId - The ID of the user who assigned the task
 * @param {string} assigneeId - The ID of the user who was assigned the task
 */
exports.taskAssigned = async (task, assignerId, assigneeId) => {
  try {
    await notificationController.createSystemNotification(
      assigneeId,
      'New Task Assigned',
      `You have been assigned to task "${task.title}"`,
      {
        type: 'task',
        relatedEntity: { 
          entityType: 'task', 
          entityId: task._id 
        },
        icon: 'clipboard-check'
      }
    );
  } catch (error) {
    console.error('Error creating task assigned notification:', error);
  }
};

/**
 * Generate a notification when a task's status is updated
 * @param {Object} task - The updated task
 * @param {string} updaterId - The ID of the user who updated the task
 * @param {string} oldStatus - The previous status of the task
 */
exports.taskStatusUpdated = async (task, updaterId, oldStatus) => {
  try {
    // Get assigned users to notify
    const assignedUsers = task.assignedTo || [];
    
    // Don't notify the updater
    const usersToNotify = assignedUsers.filter(userId => 
      userId.toString() !== updaterId.toString()
    );
    
    // Create notifications for all assigned users
    for (const userId of usersToNotify) {
      await notificationController.createSystemNotification(
        userId,
        'Task Status Updated',
        `Task "${task.title}" status changed from ${oldStatus} to ${task.status}`,
        {
          type: 'task',
          relatedEntity: { 
            entityType: 'task', 
            entityId: task._id 
          },
          icon: 'arrow-right-circle'
        }
      );
    }
  } catch (error) {
    console.error('Error creating task status update notification:', error);
  }
};

/**
 * Generate a notification when a task is nearing its due date
 * @param {Object} task - The task that's nearing its due date
 */
exports.taskDueSoon = async (task) => {
  try {
    // Get assigned users to notify
    const assignedUsers = task.assignedTo || [];
    
    // Create notifications for all assigned users
    for (const userId of assignedUsers) {
      await notificationController.createSystemNotification(
        userId,
        'Task Due Soon',
        `Task "${task.title}" is due in 2 days`,
        {
          type: 'warning',
          relatedEntity: { 
            entityType: 'task', 
            entityId: task._id 
          },
          icon: 'alarm'
        }
      );
    }
  } catch (error) {
    console.error('Error creating task due soon notification:', error);
  }
};

/**
 * Generate a notification when a user is added to a project
 * @param {Object} project - The project the user was added to
 * @param {string} userId - The ID of the user who was added
 * @param {string} addedById - The ID of the user who added them
 */
exports.addedToProject = async (project, userId, addedById) => {
  try {
    await notificationController.createSystemNotification(
      userId,
      'Added to Project',
      `You have been added to project "${project.name}"`,
      {
        type: 'project',
        relatedEntity: { 
          entityType: 'project', 
          entityId: project._id 
        },
        icon: 'kanban'
      }
    );
  } catch (error) {
    console.error('Error creating added to project notification:', error);
  }
};

/**
 * Generate a notification when a project status is updated
 * @param {Object} project - The updated project
 * @param {string} updaterId - The ID of the user who updated the project
 * @param {string} oldStatus - The previous status of the project
 */
exports.projectStatusUpdated = async (project, updaterId, oldStatus) => {
  try {
    // Get all team members to notify
    const teamMembers = project.team || [];
    
    // Don't notify the updater
    const usersToNotify = teamMembers.filter(userId => 
      userId.toString() !== updaterId.toString()
    );
    
    // Create notifications for all team members
    for (const userId of usersToNotify) {
      await notificationController.createSystemNotification(
        userId,
        'Project Status Updated',
        `Project "${project.name}" status changed from ${oldStatus} to ${project.status}`,
        {
          type: 'project',
          relatedEntity: { 
            entityType: 'project', 
            entityId: project._id 
          },
          icon: 'arrow-right-circle'
        }
      );
    }
  } catch (error) {
    console.error('Error creating project status update notification:', error);
  }
};

/**
 * Generate a notification when a user is added to a team
 * @param {Object} team - The team the user was added to
 * @param {string} userId - The ID of the user who was added
 * @param {string} addedById - The ID of the user who added them
 */
exports.addedToTeam = async (team, userId, addedById) => {
  try {
    await notificationController.createSystemNotification(
      userId,
      'Added to Team',
      `You have been added to team "${team.name}"`,
      {
        type: 'team',
        relatedEntity: { 
          entityType: 'team', 
          entityId: team._id 
        },
        icon: 'people'
      }
    );
  } catch (error) {
    console.error('Error creating added to team notification:', error);
  }
};

/**
 * Generate a notification when a sprint is started
 * @param {Object} sprint - The sprint that was started
 * @param {Object} project - The project the sprint belongs to
 */
exports.sprintStarted = async (sprint, project) => {
  // This function is temporarily disabled due to Sprint model unavailability
  console.log('Sprint notification functionality is temporarily disabled');
  
  /* Original implementation commented out
  try {
    // Get all team members to notify
    const teamMembers = project.team || [];
    
    // Create notifications for all team members
    for (const userId of teamMembers) {
      await notificationController.createSystemNotification(
        userId,
        'Sprint Started',
        `Sprint "${sprint.name}" has started for project "${project.name}"`,
        {
          type: 'project',
          relatedEntity: { 
            entityType: 'project', 
            entityId: project._id 
          },
          icon: 'play-circle'
        }
      );
    }
  } catch (error) {
    console.error('Error creating sprint started notification:', error);
  }
  */
};

/**
 * Generate a notification when a sprint is ending soon
 * @param {Object} sprint - The sprint that's ending soon
 * @param {Object} project - The project the sprint belongs to
 */
exports.sprintEndingSoon = async (sprint, project) => {
  // This function is temporarily disabled due to Sprint model unavailability
  console.log('Sprint notification functionality is temporarily disabled');
  
  /* Original implementation commented out
  try {
    // Get all team members to notify
    const teamMembers = project.team || [];
    
    // Create notifications for all team members
    for (const userId of teamMembers) {
      await notificationController.createSystemNotification(
        userId,
        'Sprint Ending Soon',
        `Sprint "${sprint.name}" for project "${project.name}" is ending in 2 days`,
        {
          type: 'warning',
          relatedEntity: { 
            entityType: 'project', 
            entityId: project._id 
          },
          icon: 'hourglass-split'
        }
      );
    }
  } catch (error) {
    console.error('Error creating sprint ending soon notification:', error);
  }
  */
};

/**
 * Generate a notification for a new comment on a task
 * @param {Object} task - The task that was commented on
 * @param {Object} comment - The comment that was added
 * @param {string} commenterId - The ID of the user who commented
 */
exports.newTaskComment = async (task, comment, commenterId) => {
  try {
    // Get assigned users to notify
    const assignedUsers = task.assignedTo || [];
    
    // Don't notify the commenter
    const usersToNotify = assignedUsers.filter(userId => 
      userId.toString() !== commenterId.toString()
    );
    
    // Create notifications for all assigned users
    for (const userId of usersToNotify) {
      await notificationController.createSystemNotification(
        userId,
        'New Comment on Task',
        `New comment on task "${task.title}": "${comment.text.substring(0, 50)}${comment.text.length > 50 ? '...' : ''}"`,
        {
          type: 'task',
          relatedEntity: { 
            entityType: 'task', 
            entityId: task._id 
          },
          icon: 'chat-dots'
        }
      );
    }
  } catch (error) {
    console.error('Error creating new task comment notification:', error);
  }
};

/**
 * Generate a system-wide announcement notification
 * @param {string} title - The announcement title
 * @param {string} message - The announcement message
 * @param {Array} userIds - Array of user IDs to notify
 */
exports.systemAnnouncement = async (title, message, userIds) => {
  try {
    // Create notifications for all specified users
    for (const userId of userIds) {
      await notificationController.createSystemNotification(
        userId,
        title,
        message,
        {
          type: 'system',
          icon: 'megaphone'
        }
      );
    }
  } catch (error) {
    console.error('Error creating system announcement notification:', error);
  }
}; 