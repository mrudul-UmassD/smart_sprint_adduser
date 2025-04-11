const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

class AnalyticsService {
  // Project analytics
  async getProjectAnalytics(projectId) {
    const project = await Project.findById(projectId);
    const tasks = await Task.find({ project: projectId });

    const taskStatusCount = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});

    const taskPriorityCount = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {});

    const completionRate = tasks.length > 0 
      ? (taskStatusCount.done || 0) / tasks.length * 100 
      : 0;

    return {
      projectDetails: {
        name: project.name,
        startDate: project.startDate,
        endDate: project.endDate,
        totalTasks: tasks.length
      },
      taskMetrics: {
        statusDistribution: taskStatusCount,
        priorityDistribution: taskPriorityCount,
        completionRate: completionRate.toFixed(2)
      }
    };
  }

  // Team performance analytics
  async getTeamPerformance(team) {
    const users = await User.find({ team });
    const tasks = await Task.find({ team });

    const userPerformance = await Promise.all(users.map(async (user) => {
      const userTasks = tasks.filter(task => task.assignee.toString() === user._id.toString());
      const completedTasks = userTasks.filter(task => task.status === 'done').length;
      
      return {
        username: user.username,
        totalTasks: userTasks.length,
        completedTasks,
        completionRate: userTasks.length > 0 
          ? (completedTasks / userTasks.length * 100).toFixed(2) 
          : 0
      };
    }));

    return {
      team,
      totalMembers: users.length,
      totalTasks: tasks.length,
      userPerformance
    };
  }

  // Project timeline analytics
  async getProjectTimeline(projectId) {
    const tasks = await Task.find({ project: projectId })
      .sort({ dueDate: 1 });

    const timeline = tasks.map(task => ({
      title: task.title,
      startDate: task.createdAt,
      dueDate: task.dueDate,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee
    }));

    return {
      projectId,
      timeline
    };
  }

  // Burndown chart data
  async getBurndownData(projectId) {
    const tasks = await Task.find({ project: projectId });
    const project = await Project.findById(projectId);

    const dates = [];
    const remainingTasks = [];
    let currentDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);

    while (currentDate <= endDate) {
      const tasksBeforeDate = tasks.filter(task => 
        new Date(task.createdAt) <= currentDate
      );
      const completedTasks = tasksBeforeDate.filter(task => 
        task.status === 'done' && new Date(task.updatedAt) <= currentDate
      ).length;

      dates.push(new Date(currentDate));
      remainingTasks.push(tasksBeforeDate.length - completedTasks);

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      dates,
      remainingTasks,
      idealBurndown: Array(dates.length).fill(tasks.length)
        .map((val, i) => Math.max(0, val - (val / (dates.length - 1) * i)))
    };
  }
}

module.exports = new AnalyticsService(); 