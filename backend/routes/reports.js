const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');
const excel = require('xlsx');
const PDFDocument = require('pdf-lib').PDFDocument;
const dayjs = require('dayjs');

// Generate burndown chart data for a sprint/project
router.get('/burndown/:projectId', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Start date and end date are required'
            });
        }
        
        // Find project
        const project = await Project.findById(req.params.projectId);
        
        if (!project) {
            return res.status(404).json({
                success: false,
                error: 'Project not found'
            });
        }
        
        // Check user permissions
        const isAdmin = req.user.role === 'Admin';
        const isProjectMember = project.members.some(
            member => member.userId.toString() === req.user._id.toString()
        );
        
        if (!isAdmin && !isProjectMember) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to view this project'
            });
        }
        
        // Get all tasks for this project
        const tasks = await Task.find({
            project: req.params.projectId
        });
        
        // Calculate total estimated time
        const totalEstimatedHours = tasks.reduce((total, task) => total + (task.estimatedTime || 0), 0);
        
        // Generate dates array between start and end dates
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        const dateRange = [];
        let currentDate = start;
        
        while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
            dateRange.push(currentDate.format('YYYY-MM-DD'));
            currentDate = currentDate.add(1, 'day');
        }
        
        // Calculate ideal burndown line
        const idealBurndown = dateRange.map((date, index) => {
            const progress = index / (dateRange.length - 1);
            return {
                date,
                remaining: Math.round((1 - progress) * totalEstimatedHours)
            };
        });
        
        // Calculate actual burndown line
        const actualBurndown = [];
        
        for (const date of dateRange) {
            const dateEnd = dayjs(date).endOf('day').toDate();
            
            // Calculate completed hours until this date
            const completedHours = tasks.reduce((total, task) => {
                // If task is completed and completion date is before or equal to current date
                if (task.status === 'Completed' && task.updatedAt <= dateEnd) {
                    return total + (task.estimatedTime || 0);
                }
                return total;
            }, 0);
            
            // Add to actual burndown
            actualBurndown.push({
                date,
                remaining: Math.max(0, totalEstimatedHours - completedHours)
            });
        }
        
        res.json({
            success: true,
            burndownData: {
                dateRange,
                ideal: idealBurndown,
                actual: actualBurndown,
                totalEstimatedHours
            }
        });
    } catch (error) {
        console.error('Error generating burndown chart:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Generate velocity tracking report
router.get('/velocity/:projectId?', auth, async (req, res) => {
    try {
        const { timeframe, limit } = req.query;
        const maxSprints = limit ? parseInt(limit) : 10;
        
        // Build query
        const query = {};
        
        if (req.params.projectId) {
            query.project = req.params.projectId;
        }
        
        // Get completed tasks
        const tasks = await Task.find({
            ...query,
            status: 'Completed'
        }).sort({ updatedAt: -1 });
        
        // Group by sprint/time periods
        const getSprintPeriod = (date) => {
            const dateObj = dayjs(date);
            
            switch (timeframe) {
                case 'weekly':
                    return dateObj.startOf('week').format('YYYY-MM-DD');
                case 'biweekly':
                    // Get start of week, then adjust for 2-week periods
                    const weekStart = dateObj.startOf('week');
                    const weekNumber = weekStart.week();
                    const isOddWeek = weekNumber % 2 === 1;
                    return isOddWeek ? 
                        weekStart.format('YYYY-MM-DD') : 
                        weekStart.subtract(1, 'week').format('YYYY-MM-DD');
                case 'monthly':
                    return dateObj.startOf('month').format('YYYY-MM-DD');
                default:
                    // Default to weekly
                    return dateObj.startOf('week').format('YYYY-MM-DD');
            }
        };
        
        // Group tasks by sprint
        const sprintMap = new Map();
        
        tasks.forEach(task => {
            const sprintStart = getSprintPeriod(task.updatedAt);
            
            if (!sprintMap.has(sprintStart)) {
                sprintMap.set(sprintStart, {
                    sprintStart,
                    tasks: [],
                    totalEstimated: 0,
                    totalActual: 0,
                    count: 0
                });
            }
            
            const sprint = sprintMap.get(sprintStart);
            sprint.tasks.push(task);
            sprint.totalEstimated += task.estimatedTime || 0;
            sprint.totalActual += task.timeSpent || 0;
            sprint.count += 1;
        });
        
        // Convert to array and sort
        let sprints = Array.from(sprintMap.values())
            .sort((a, b) => new Date(b.sprintStart) - new Date(a.sprintStart))
            .slice(0, maxSprints)
            .reverse(); // Reverse to show oldest first
        
        // Calculate velocity
        const velocityData = {
            sprints: sprints.map(sprint => ({
                sprintStart: sprint.sprintStart,
                sprintLabel: `${timeframe === 'weekly' ? 'Week of ' : timeframe === 'biweekly' ? 'Sprint ' : 'Month of '} ${dayjs(sprint.sprintStart).format('MMM D, YYYY')}`,
                totalEstimated: sprint.totalEstimated,
                totalActual: sprint.totalActual,
                taskCount: sprint.count,
                accuracy: sprint.totalEstimated > 0 ? 
                    Math.round((sprint.totalActual / sprint.totalEstimated) * 100) : 0
            })),
            averageVelocity: sprints.length > 0 ? 
                Math.round(sprints.reduce((sum, sprint) => sum + sprint.totalActual, 0) / sprints.length) : 0
        };
        
        res.json({
            success: true,
            velocityData
        });
    } catch (error) {
        console.error('Error generating velocity report:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Export time tracking report
router.get('/timeTracking/export', auth, async (req, res) => {
    try {
        const { startDate, endDate, projectId, format } = req.query;
        
        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'Start date and end date are required'
            });
        }
        
        // Build filter
        const filter = {};
        
        if (projectId) {
            filter.project = projectId;
        }
        
        // Find all tasks with time entries
        const tasks = await Task.find(filter)
            .populate('project', 'name')
            .populate('assignee', 'username')
            .populate('timeEntries.user', 'username');
        
        // Extract all time entries
        let allTimeEntries = [];
        
        tasks.forEach(task => {
            if (task.timeEntries && task.timeEntries.length > 0) {
                task.timeEntries.forEach(entry => {
                    // Check if within date range
                    const entryDate = new Date(entry.startTime);
                    const start = new Date(startDate);
                    const end = new Date(endDate);
                    
                    if (entryDate >= start && entryDate <= end) {
                        allTimeEntries.push({
                            taskId: task._id,
                            taskTitle: task.title,
                            projectName: task.project ? task.project.name : 'Unknown',
                            username: entry.user ? entry.user.username : 'Unknown',
                            startTime: entry.startTime,
                            endTime: entry.endTime,
                            duration: entry.duration, // in minutes
                            durationHours: Math.round(entry.duration / 60 * 100) / 100, // to 2 decimal places
                            description: entry.description || ''
                        });
                    }
                });
            }
        });
        
        // Sort by date
        allTimeEntries.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        
        // Export in requested format
        const exportFormat = format || 'CSV';
        let fileData, fileName, mimeType;
        
        switch (exportFormat.toUpperCase()) {
            case 'CSV':
                const csvFields = [
                    'taskTitle', 'projectName', 'username', 
                    'startTime', 'endTime', 'durationHours', 'description'
                ];
                const parser = new Parser({ fields: csvFields });
                fileData = parser.parse(allTimeEntries);
                fileName = `timetracking_${startDate}_to_${endDate}.csv`;
                mimeType = 'text/csv';
                break;
                
            case 'EXCEL':
                const worksheet = excel.utils.json_to_sheet(allTimeEntries);
                const workbook = excel.utils.book_new();
                excel.utils.book_append_sheet(workbook, worksheet, 'Time Entries');
                fileData = excel.write(workbook, { type: 'buffer', bookType: 'xlsx' });
                fileName = `timetracking_${startDate}_to_${endDate}.xlsx`;
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
                
            case 'PDF':
                // Create PDF
                const pdfDoc = await PDFDocument.create();
                const page = pdfDoc.addPage([600, 800]);
                const { width, height } = page.getSize();
                
                // Add title and headers
                page.drawText('Time Tracking Report', {
                    x: 50,
                    y: height - 50,
                    size: 20
                });
                
                page.drawText(`From ${startDate} to ${endDate}`, {
                    x: 50,
                    y: height - 80,
                    size: 12
                });
                
                // More PDF creation logic would go here
                
                fileData = await pdfDoc.save();
                fileName = `timetracking_${startDate}_to_${endDate}.pdf`;
                mimeType = 'application/pdf';
                break;
                
            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid export format'
                });
        }
        
        // Set headers and send file
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(fileData);
    } catch (error) {
        console.error('Error exporting time tracking report:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router; 