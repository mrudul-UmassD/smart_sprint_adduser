const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('Created uploads directory');
    }
} catch (err) {
    console.error('Error creating uploads directory:', err);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        try {
            cb(null, uploadsDir);
        } catch (err) {
            console.error('Error with upload destination:', err);
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        try {
            const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
            cb(null, `${Date.now()}-${safeName}`);
        } catch (err) {
            console.error('Error with filename generation:', err);
            cb(err);
        }
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        try {
            const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif'];
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only PDF, DOCX, and images are allowed.'));
            }
        } catch (err) {
            console.error('Error in file filter:', err);
            cb(err);
        }
    }
});

// Error handling middleware for multer errors
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        console.error('Multer error:', err);
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
        // An unknown error occurred
        console.error('Unknown upload error:', err);
        return res.status(500).json({ error: `Server error during upload: ${err.message}` });
    }
    // No error occurred, continue
    next();
};

// Get tasks for a project
router.get('/project/:projectId', auth, async (req, res) => {
    try {
        const { projectId } = req.params;
        
        // Check if user has access to the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check if user is admin, PM, or member of the project
        let hasAccess = req.user.role === 'Admin';
        
        if (!hasAccess) {
            const isMember = project.members.some(member => 
                member.userId.toString() === req.user.id
            );
            
            if (!isMember) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        
        // For regular developers, only return tasks for their team
        let query = { project: projectId };
        
        if (req.user.role === 'Developer') {
            const user = await User.findById(req.user.id);
            if (user) {
                query.team = user.team;
            }
        }
        
        const tasks = await Task.find(query)
            .populate('assignee', 'username team level role')
            .populate('assignedBy', 'username')
            .sort({ createdAt: -1 });
        
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get completed tasks for a project
router.get('/project/:projectId/completed', auth, async (req, res) => {
    try {
        const { projectId } = req.params;
        
        // Check if user has access to the project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check if user is admin, PM, or member of the project
        let hasAccess = req.user.role === 'Admin';
        
        if (!hasAccess) {
            const isMember = project.members.some(member => 
                member.userId.toString() === req.user.id
            );
            
            if (!isMember) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        
        // For regular developers, only return tasks for their team
        let query = { 
            project: projectId,
            status: 'Completed'
        };
        
        if (req.user.role === 'Developer') {
            const user = await User.findById(req.user.id);
            if (user) {
                query.team = user.team;
            }
        }
        
        const tasks = await Task.find(query)
            .populate('assignee', 'username team level role')
            .populate('assignedBy', 'username')
            .sort({ updatedAt: -1 });
        
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get individual task details
router.get('/:taskId', auth, async (req, res) => {
    try {
        const { taskId } = req.params;
        
        const task = await Task.findById(taskId)
            .populate('assignee', 'username team level role')
            .populate('assignedBy', 'username')
            .populate('comments.author', 'username role team level');
            
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Check if user has access to the project
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check if user is admin, PM, or member of the project
        let hasAccess = req.user.role === 'Admin';
        
        if (!hasAccess) {
            const isMember = project.members.some(member => 
                member.userId.toString() === req.user.id
            );
            
            if (!isMember) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        
        // For developers, check if the task is for their team
        if (req.user.role === 'Developer') {
            const user = await User.findById(req.user.id);
            if (user && task.team !== user.team) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        
        res.json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new task
router.post('/', auth, (req, res, next) => {
    // Make attachments optional
    if (req.is('multipart/form-data')) {
        upload.array('attachments', 5)(req, res, (err) => {
            if (err) {
                return handleMulterError(err, req, res, next);
            }
            next();
        });
    } else {
        next();
    }
}, async (req, res) => {
    try {
        // Only Admin and Project Manager can create tasks
        if (req.user.role !== 'Admin' && req.user.role !== 'Project Manager') {
            return res.status(403).json({ error: 'Only Admin and Project Manager can create tasks' });
        }
        
        const { projectId, title, description, assigneeId, team, priority, stage, dueDate } = req.body;
        
        // Check if project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check if user is a member of the project
        if (req.user.role !== 'Admin') {
            const isPMMember = project.members.some(member => 
                member.userId.toString() === req.user.id && 
                member.role === 'Project Manager'
            );
            
            if (!isPMMember) {
                return res.status(403).json({ error: 'You must be a Project Manager of this project to create tasks' });
            }
        }
        
        // Process file attachments
        const attachments = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                attachments.push({
                    filename: file.originalname,
                    path: file.path,
                    mimetype: file.mimetype
                });
            });
        }
        
        // Create task
        const task = new Task({
            title,
            description,
            assignee: assigneeId,
            assignedBy: req.user.id,
            project: projectId,
            team,
            priority: priority || 'Medium',
            stage: stage || 'Development',
            dueDate: dueDate ? new Date(dueDate) : null,
            attachments
        });
        
        await task.save();
        
        // Populate references
        const populatedTask = await Task.findById(task._id)
            .populate('assignee', 'username team level role')
            .populate('assignedBy', 'username');
            
        res.status(201).json(populatedTask);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(400).json({ error: error.message });
    }
});

// Update task
router.patch('/:taskId', auth, (req, res, next) => {
    // Make attachments optional
    if (req.is('multipart/form-data')) {
        upload.array('attachments', 5)(req, res, (err) => {
            if (err) {
                return handleMulterError(err, req, res, next);
            }
            next();
        });
    } else {
        next();
    }
}, async (req, res) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;
        
        // Find the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Check if project exists
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check permissions
        if (req.user.role === 'Developer') {
            // Developers can only update status to "In Progress" or "Review"
            const allowedUpdates = ['status'];
            const isValidOperation = Object.keys(updates).every(update => allowedUpdates.includes(update));
            
            if (!isValidOperation) {
                return res.status(400).json({ error: 'Developers can only update task status' });
            }
            
            if (!['In Progress', 'Review'].includes(updates.status)) {
                return res.status(400).json({ error: 'Developers can only set status to "In Progress" or "Review"' });
            }
            
            // Must be the assignee
            if (task.assignee.toString() !== req.user.id) {
                return res.status(403).json({ error: 'You can only update tasks assigned to you' });
            }
        } else if (req.user.role === 'Project Manager') {
            // Project Manager must be a PM for this project
            const isPMMember = project.members.some(member => 
                member.userId.toString() === req.user.id && 
                member.role === 'Project Manager'
            );
            
            if (!isPMMember) {
                return res.status(403).json({ error: 'You must be a Project Manager of this project to update tasks' });
            }
        } else if (req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Process file attachments
        if (req.files && req.files.length > 0) {
            const newAttachments = req.files.map(file => ({
                filename: file.originalname,
                path: file.path,
                mimetype: file.mimetype
            }));
            
            if (!task.attachments) {
                task.attachments = [];
            }
            
            task.attachments = [...task.attachments, ...newAttachments];
        }
        
        // Apply updates
        const allowedUpdates = ['title', 'description', 'status', 'priority', 'stage', 'assignee', 'team', 'dueDate'];
        Object.keys(updates).forEach(update => {
            if (allowedUpdates.includes(update)) {
                if (update === 'dueDate' && updates[update]) {
                    task[update] = new Date(updates[update]);
                } else {
                    task[update] = updates[update];
                }
            }
        });
        
        task.updatedAt = Date.now();
        await task.save();
        
        // Populate references
        const populatedTask = await Task.findById(task._id)
            .populate('assignee', 'username team level role')
            .populate('assignedBy', 'username')
            .populate('comments.author', 'username role team level');
            
        res.json(populatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update task status only
router.patch('/:taskId/status', auth, async (req, res) => {
    try {
        const { taskId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ error: 'Status is required' });
        }
        
        // Find the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Check if project exists
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check permissions
        if (req.user.role === 'Developer') {
            // Must be the assignee
            if (task.assignee && task.assignee.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'You can only update tasks assigned to you' });
            }
        } else if (req.user.role === 'Project Manager') {
            // Project Manager must be a PM for this project
            const isPMMember = project.members.some(member => 
                member.userId.toString() === req.user._id.toString() && 
                member.role === 'Project Manager'
            );
            
            if (!isPMMember) {
                return res.status(403).json({ error: 'You must be a Project Manager of this project to update tasks' });
            }
        } else if (req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        // Update status
        task.status = status;
        task.updatedAt = Date.now();
        await task.save();
        
        // Populate references
        const populatedTask = await Task.findById(task._id)
            .populate('assignee', 'username team level role')
            .populate('assignedBy', 'username');
            
        res.json(populatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete task
router.delete('/:taskId', auth, async (req, res) => {
    try {
        const { taskId } = req.params;
        
        // Find the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Check if project exists
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Only Admin or the Project Manager who created the task can delete it
        if (req.user.role !== 'Admin') {
            if (req.user.role !== 'Project Manager' || task.assignedBy.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Only Admin or the Project Manager who created the task can delete it' });
            }
            
            // Project Manager must be a PM for this project
            const isPMMember = project.members.some(member => 
                member.userId.toString() === req.user.id && 
                member.role === 'Project Manager'
            );
            
            if (!isPMMember) {
                return res.status(403).json({ error: 'You must be a Project Manager of this project to delete tasks' });
            }
        }
        
        // Delete any file attachments
        if (task.attachments && task.attachments.length > 0) {
            task.attachments.forEach(attachment => {
                try {
                    fs.unlinkSync(attachment.path);
                } catch (err) {
                    console.error(`Error deleting file ${attachment.path}:`, err);
                }
            });
        }
        
        // Delete task comments' attachments
        if (task.comments && task.comments.length > 0) {
            task.comments.forEach(comment => {
                if (comment.attachments && comment.attachments.length > 0) {
                    comment.attachments.forEach(attachment => {
                        try {
                            fs.unlinkSync(attachment.path);
                        } catch (err) {
                            console.error(`Error deleting file ${attachment.path}:`, err);
                        }
                    });
                }
            });
        }
        
        await Task.findByIdAndDelete(taskId);
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add comment to task
router.post('/:taskId/comments', auth, upload.array('attachments', 3), handleMulterError, async (req, res) => {
    try {
        const { taskId } = req.params;
        const { text } = req.body;
        
        // Find the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Check if project exists
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check if user is assignee, assignedBy, admin, or project PM
        let canComment = req.user.role === 'Admin' || 
                        task.assignee?.toString() === req.user.id ||
                        task.assignedBy.toString() === req.user.id;
                        
        if (!canComment && req.user.role === 'Project Manager') {
            // Check if user is a PM for this project
            canComment = project.members.some(member => 
                member.userId.toString() === req.user.id && 
                member.role === 'Project Manager'
            );
        }
        
        if (!canComment) {
            return res.status(403).json({ error: 'You cannot comment on this task' });
        }
        
        // Process file attachments
        const attachments = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                attachments.push({
                    filename: file.originalname,
                    path: file.path,
                    mimetype: file.mimetype
                });
            });
        }
        
        // Add comment
        const comment = {
            author: req.user.id,
            text,
            attachments,
            createdAt: Date.now()
        };
        
        task.comments.push(comment);
        task.updatedAt = Date.now();
        await task.save();
        
        // Get the populated task with the new comment
        const updatedTask = await Task.findById(taskId)
            .populate('assignee', 'username team level role')
            .populate('assignedBy', 'username')
            .populate('comments.author', 'username role team level');
            
        res.status(201).json(updatedTask);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete comment
router.delete('/:taskId/comments/:commentId', auth, async (req, res) => {
    try {
        const { taskId, commentId } = req.params;
        
        // Find the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ error: 'Task not found' });
        }
        
        // Find the comment
        const commentIndex = task.comments.findIndex(c => c._id.toString() === commentId);
        if (commentIndex === -1) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        const comment = task.comments[commentIndex];
        
        // Check if user is the comment author or admin
        if (req.user.role !== 'Admin' && comment.author.toString() !== req.user.id) {
            return res.status(403).json({ error: 'You can only delete your own comments' });
        }
        
        // Delete any file attachments
        if (comment.attachments && comment.attachments.length > 0) {
            comment.attachments.forEach(attachment => {
                try {
                    fs.unlinkSync(attachment.path);
                } catch (err) {
                    console.error(`Error deleting file ${attachment.path}:`, err);
                }
            });
        }
        
        // Remove comment
        task.comments.splice(commentIndex, 1);
        task.updatedAt = Date.now();
        await task.save();
        
        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve uploaded files
router.get('/uploads/:filename', auth, async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '../uploads', filename);
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }
        
        res.sendFile(filePath);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add dependencies to a task
router.post('/:id/dependencies', auth, async (req, res) => {
    try {
        const { dependencies } = req.body;
        
        if (!dependencies || !Array.isArray(dependencies)) {
            return res.status(400).json({ 
                success: false,
                error: 'Dependencies are required and must be an array' 
            });
        }
        
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ 
                success: false,
                error: 'Task not found' 
            });
        }
        
        // Check if user has permission to update the task
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ 
                success: false,
                error: 'Project not found' 
            });
        }
        
        // Check if user is Admin, Project Manager, or task assignee
        const isAdmin = req.user.role === 'Admin';
        const isPM = req.user.role === 'Project Manager' && project.members.some(
            member => member.userId.toString() === req.user._id.toString() && member.role === 'Project Manager'
        );
        const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
        
        if (!isAdmin && !isPM && !isAssignee) {
            return res.status(403).json({ 
                success: false,
                error: 'Not authorized to update this task' 
            });
        }
        
        // Validate all dependency IDs exist and add them
        for (const dep of dependencies) {
            const dependencyTask = await Task.findById(dep.task);
            if (!dependencyTask) {
                return res.status(400).json({ 
                    success: false,
                    error: `Dependency task ${dep.task} not found` 
                });
            }
            
            // Add this task as a dependent to the dependency task
            if (!dependencyTask.dependents.includes(task._id)) {
                dependencyTask.dependents.push(task._id);
                await dependencyTask.save();
            }
        }
        
        // Update task dependencies
        task.dependencies = dependencies;
        await task.save();
        
        res.json({ 
            success: true,
            message: 'Dependencies added successfully',
            task 
        });
    } catch (error) {
        console.error('Error adding dependencies:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Remove a dependency from a task
router.delete('/:id/dependencies/:dependencyId', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ 
                success: false,
                error: 'Task not found' 
            });
        }
        
        // Check if user has permission to update the task
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ 
                success: false,
                error: 'Project not found' 
            });
        }
        
        // Check if user is Admin, Project Manager, or task assignee
        const isAdmin = req.user.role === 'Admin';
        const isPM = req.user.role === 'Project Manager' && project.members.some(
            member => member.userId.toString() === req.user._id.toString() && member.role === 'Project Manager'
        );
        const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
        
        if (!isAdmin && !isPM && !isAssignee) {
            return res.status(403).json({ 
                success: false,
                error: 'Not authorized to update this task' 
            });
        }
        
        // Remove dependency
        task.dependencies = task.dependencies.filter(
            dep => dep.task.toString() !== req.params.dependencyId
        );
        await task.save();
        
        // Remove this task from the dependency's dependents
        const dependencyTask = await Task.findById(req.params.dependencyId);
        if (dependencyTask) {
            dependencyTask.dependents = dependencyTask.dependents.filter(
                depId => depId.toString() !== task._id.toString()
            );
            await dependencyTask.save();
        }
        
        res.json({ 
            success: true,
            message: 'Dependency removed successfully',
            task 
        });
    } catch (error) {
        console.error('Error removing dependency:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Add a time entry to a task
router.post('/:id/time', auth, async (req, res) => {
    try {
        const { startTime, endTime, description } = req.body;
        
        if (!startTime || !endTime) {
            return res.status(400).json({ 
                success: false,
                error: 'Start time and end time are required' 
            });
        }
        
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ 
                success: false,
                error: 'Task not found' 
            });
        }
        
        // Only assignee and admins can log time
        const isAdmin = req.user.role === 'Admin';
        const isAssignee = task.assignee && task.assignee.toString() === req.user._id.toString();
        
        if (!isAdmin && !isAssignee) {
            return res.status(403).json({ 
                success: false,
                error: 'Not authorized to log time on this task' 
            });
        }
        
        // Calculate duration in minutes
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMinutes = Math.round((end - start) / 60000);
        
        if (durationMinutes <= 0) {
            return res.status(400).json({ 
                success: false,
                error: 'End time must be after start time' 
            });
        }
        
        // Add time entry
        const timeEntry = {
            user: req.user._id,
            startTime: start,
            endTime: end,
            duration: durationMinutes,
            description
        };
        
        task.timeEntries.push(timeEntry);
        await task.save();
        
        res.json({ 
            success: true,
            message: 'Time entry added successfully',
            task,
            timeEntry 
        });
    } catch (error) {
        console.error('Error adding time entry:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Delete a time entry
router.delete('/:id/time/:timeEntryId', auth, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ 
                success: false,
                error: 'Task not found' 
            });
        }
        
        // Find the time entry
        const timeEntry = task.timeEntries.id(req.params.timeEntryId);
        
        if (!timeEntry) {
            return res.status(404).json({ 
                success: false,
                error: 'Time entry not found' 
            });
        }
        
        // Check if user is the creator of the time entry or admin
        const isAdmin = req.user.role === 'Admin';
        const isCreator = timeEntry.user.toString() === req.user._id.toString();
        
        if (!isAdmin && !isCreator) {
            return res.status(403).json({ 
                success: false,
                error: 'Not authorized to delete this time entry' 
            });
        }
        
        // Remove time entry
        timeEntry.remove();
        await task.save();
        
        res.json({ 
            success: true,
            message: 'Time entry deleted successfully',
            task 
        });
    } catch (error) {
        console.error('Error deleting time entry:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Upload a document to a task
router.post('/:id/documents', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No file uploaded' 
            });
        }
        
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ 
                success: false,
                error: 'Task not found' 
            });
        }
        
        // Check if user is allowed to add documents
        const project = await Project.findById(task.project);
        if (!project) {
            return res.status(404).json({ 
                success: false,
                error: 'Project not found' 
            });
        }
        
        const isAdmin = req.user.role === 'Admin';
        const isPM = req.user.role === 'Project Manager' && project.members.some(
            member => member.userId.toString() === req.user._id.toString() && member.role === 'Project Manager'
        );
        const isTeamMember = project.members.some(
            member => member.userId.toString() === req.user._id.toString()
        );
        
        if (!isAdmin && !isPM && !isTeamMember) {
            return res.status(403).json({ 
                success: false,
                error: 'Not authorized to add documents to this task' 
            });
        }
        
        // Create document
        const document = {
            name: req.file.originalname,
            path: req.file.path,
            mimetype: req.file.mimetype,
            size: req.file.size,
            uploadedBy: req.user._id,
            versions: [{
                path: req.file.path,
                updatedBy: req.user._id,
                versionNumber: 1
            }]
        };
        
        task.documents.push(document);
        await task.save();
        
        res.json({ 
            success: true,
            message: 'Document uploaded successfully',
            document 
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Upload a new version of a document
router.post('/:id/documents/:documentId/versions', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false,
                error: 'No file uploaded' 
            });
        }
        
        const task = await Task.findById(req.params.id);
        
        if (!task) {
            return res.status(404).json({ 
                success: false,
                error: 'Task not found' 
            });
        }
        
        // Find document
        const document = task.documents.id(req.params.documentId);
        
        if (!document) {
            return res.status(404).json({ 
                success: false,
                error: 'Document not found' 
            });
        }
        
        // Check permissions
        const isAdmin = req.user.role === 'Admin';
        const isUploader = document.uploadedBy.toString() === req.user._id.toString();
        const project = await Project.findById(task.project);
        const isPM = req.user.role === 'Project Manager' && project.members.some(
            member => member.userId.toString() === req.user._id.toString() && member.role === 'Project Manager'
        );
        
        if (!isAdmin && !isUploader && !isPM) {
            return res.status(403).json({ 
                success: false,
                error: 'Not authorized to update this document' 
            });
        }
        
        // Add new version
        const newVersionNumber = document.versions.length + 1;
        document.versions.push({
            path: req.file.path,
            updatedBy: req.user._id,
            versionNumber: newVersionNumber
        });
        
        // Update document details
        document.path = req.file.path;
        document.size = req.file.size;
        document.updatedAt = Date.now();
        
        await task.save();
        
        res.json({ 
            success: true,
            message: 'Document version uploaded successfully',
            document 
        });
    } catch (error) {
        console.error('Error uploading document version:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

// Get all time entries for a specific user across all tasks
router.get('/timeEntries/user', auth, async (req, res) => {
    try {
        const { startDate, endDate, projectId } = req.query;
        
        // Build filter
        const filter = {};
        
        if (projectId) {
            filter.project = projectId;
        }
        
        // Find all tasks with time entries for this user
        const tasks = await Task.find(filter)
            .populate('project', 'name')
            .populate('assignee', 'username')
            .populate('timeEntries.user', 'username');
        
        // Extract time entries for this user
        let userTimeEntries = [];
        
        tasks.forEach(task => {
            const taskTimeEntries = task.timeEntries.filter(
                entry => entry.user._id.toString() === req.user._id.toString()
            );
            
            if (taskTimeEntries.length > 0) {
                taskTimeEntries.forEach(entry => {
                    userTimeEntries.push({
                        taskId: task._id,
                        taskTitle: task.title,
                        projectId: task.project._id,
                        projectName: task.project.name,
                        timeEntryId: entry._id,
                        startTime: entry.startTime,
                        endTime: entry.endTime,
                        duration: entry.duration,
                        description: entry.description,
                        createdAt: entry.createdAt
                    });
                });
            }
        });
        
        // Filter by date if provided
        if (startDate) {
            const start = new Date(startDate);
            userTimeEntries = userTimeEntries.filter(entry => entry.startTime >= start);
        }
        
        if (endDate) {
            const end = new Date(endDate);
            userTimeEntries = userTimeEntries.filter(entry => entry.startTime <= end);
        }
        
        // Sort by start time
        userTimeEntries.sort((a, b) => b.startTime - a.startTime);
        
        res.json({ 
            success: true,
            timeEntries: userTimeEntries 
        });
    } catch (error) {
        console.error('Error fetching user time entries:', error);
        res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
});

module.exports = router; 