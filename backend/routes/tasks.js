const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOCX, and images are allowed.'));
        }
    }
});

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
router.post('/', auth, upload.array('attachments', 5), async (req, res) => {
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
        res.status(400).json({ error: error.message });
    }
});

// Update task
router.patch('/:taskId', auth, upload.array('attachments', 5), async (req, res) => {
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
router.post('/:taskId/comments', auth, upload.array('attachments', 3), async (req, res) => {
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

module.exports = router; 