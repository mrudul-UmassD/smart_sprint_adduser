const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all projects
router.get('/', auth, async (req, res) => {
    try {
        let projects;
        
        if (req.user.role === 'Admin') {
            // Admin can see all projects
            projects = await Project.find().populate('members.userId', 'username team level role');
        } else if (req.user.role === 'Project Manager') {
            // Project Manager can see projects they are assigned to or created
            projects = await Project.find({
                $or: [
                    { 'members.userId': req.user.id },
                    { 'createdBy': req.user.id }
                ]
            }).populate('members.userId', 'username team level role');
        } else {
            // Developers can only see projects they are assigned to
            projects = await Project.find({
                'members.userId': req.user.id
            }).populate('members.userId', 'username team level role');
        }
        
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get specific project
router.get('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('members.userId', 'username team level role')
            .populate('createdBy', 'username')
            .populate('requests.userId', 'username team level role')
            .populate('requests.requestedBy', 'username');
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check if user has access to the project
        if (req.user.role !== 'Admin') {
            const isMember = project.members.some(member => 
                member.userId._id.toString() === req.user.id
            );
            
            if (!isMember && project.createdBy._id.toString() !== req.user.id) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }
        
        res.json(project);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new project (Admin only)
router.post('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Only Admin can create projects' });
        }
        
        const project = new Project({
            ...req.body,
            createdBy: req.user.id
        });
        
        await project.save();
        res.status(201).json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update project (Admin only)
router.patch('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Only Admin can update projects' });
        }
        
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'description'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        
        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates' });
        }
        
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        updates.forEach(update => project[update] = req.body[update]);
        project.updatedAt = Date.now();
        
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete project (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Only Admin can delete projects' });
        }
        
        const project = await Project.findByIdAndDelete(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add user to project (Admin only)
router.post('/:id/members', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Only Admin can add members directly' });
        }
        
        const { userId, role } = req.body;
        
        if (!userId || !role) {
            return res.status(400).json({ error: 'User ID and role are required' });
        }
        
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if user is already a member
        const isAlreadyMember = project.members.some(member => 
            member.userId.toString() === userId
        );
        
        if (isAlreadyMember) {
            return res.status(400).json({ error: 'User is already a member of this project' });
        }
        
        // Add member
        project.members.push({ userId, role });
        await project.save();
        
        const updatedProject = await Project.findById(req.params.id)
            .populate('members.userId', 'username team level role');
            
        res.json(updatedProject);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Remove user from project (Admin only)
router.delete('/:id/members/:userId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Only Admin can remove members' });
        }
        
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Filter out the member
        project.members = project.members.filter(member => 
            member.userId.toString() !== req.params.userId
        );
        
        await project.save();
        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Request to add a user to project (Project Manager only)
router.post('/:id/requests', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Project Manager') {
            return res.status(403).json({ error: 'Only Project Managers can request to add members' });
        }
        
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check if PM is associated with this project
        const isPMAssociated = project.members.some(member => 
            member.userId.toString() === req.user.id && member.role === 'Project Manager'
        );
        
        if (!isPMAssociated) {
            return res.status(403).json({ error: 'You are not a Project Manager for this project' });
        }
        
        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Check if user is already a member
        const isAlreadyMember = project.members.some(member => 
            member.userId.toString() === userId
        );
        
        if (isAlreadyMember) {
            return res.status(400).json({ error: 'User is already a member of this project' });
        }
        
        // Check if there's already a pending request for this user
        const pendingRequest = project.requests.find(request => 
            request.userId.toString() === userId && request.status === 'Pending'
        );
        
        if (pendingRequest) {
            return res.status(400).json({ error: 'There is already a pending request for this user' });
        }
        
        // Add request
        project.requests.push({
            userId,
            requestedBy: req.user.id,
            status: 'Pending'
        });
        
        await project.save();
        
        const updatedProject = await Project.findById(req.params.id)
            .populate('requests.userId', 'username team level role')
            .populate('requests.requestedBy', 'username');
            
        res.json(updatedProject);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Approve/Reject user request (Admin only)
router.patch('/:id/requests/:requestId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Only Admin can approve or reject requests' });
        }
        
        const { status } = req.body;
        
        if (!status || !['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Valid status (Approved or Rejected) is required' });
        }
        
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Find the request
        const requestIndex = project.requests.findIndex(request => 
            request._id.toString() === req.params.requestId
        );
        
        if (requestIndex === -1) {
            return res.status(404).json({ error: 'Request not found' });
        }
        
        // Update request status
        project.requests[requestIndex].status = status;
        
        // If approved, add user to project members
        if (status === 'Approved') {
            const userId = project.requests[requestIndex].userId;
            
            // Check if the user is already a member (safety check)
            const isAlreadyMember = project.members.some(member => 
                member.userId.toString() === userId.toString()
            );
            
            if (!isAlreadyMember) {
                // Add as Developer by default
                project.members.push({
                    userId,
                    role: 'Developer'
                });
            }
        }
        
        await project.save();
        
        const updatedProject = await Project.findById(req.params.id)
            .populate('members.userId', 'username team level role')
            .populate('requests.userId', 'username team level role')
            .populate('requests.requestedBy', 'username');
            
        res.json(updatedProject);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 