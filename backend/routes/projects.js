const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const User = require('../models/User');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

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
        // Validate user has a valid team
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (user.team === 'None' && user.role !== 'Admin') {
            return res.status(400).json({ error: 'You must be assigned to a team before creating projects' });
        }
        
        if (req.user.role === 'Admin') {
            // Admin can directly create projects
            const project = new Project({
                ...req.body,
                createdBy: req.user.id
            });
            
            // Add the admin as a project member automatically
            project.members.push({
                userId: req.user.id,
                role: 'Project Manager'
            });
            
            await project.save();
            
            // Fetch the populated project to return
            const populatedProject = await Project.findById(project._id)
                .populate('members.userId', 'username team level role')
                .populate('createdBy', 'username');
                
            res.status(201).json(populatedProject);
        } else if (req.user.role === 'Project Manager') {
            // Project Managers must request project creation
            const projectRequest = {
                name: req.body.name,
                description: req.body.description || '',
                requestedBy: req.user.id,
                status: 'Pending'
            };
            
            // Store in the ProjectRequests collection
            const newProjectRequest = new ProjectRequest(projectRequest);
            await newProjectRequest.save();
            
            res.status(201).json({ 
                message: 'Project creation request submitted successfully',
                request: newProjectRequest
            });
        } else {
            return res.status(403).json({ error: 'Only Admin and Project Manager can create or request projects' });
        }
    } catch (error) {
        console.error('Project creation error:', error);
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
        
        // Validate user has a team
        if (user.team === 'None' && role !== 'Project Manager' && user.role !== 'Admin') {
            return res.status(400).json({ error: 'User must be assigned to a team before adding to a project' });
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
        
        // Validate user has a team
        if (user.team === 'None' && user.role !== 'Admin' && user.role !== 'Project Manager') {
            return res.status(400).json({ error: 'User must be assigned to a team before adding to a project' });
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

// Create the ProjectRequest model
const projectRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    requestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ProjectRequest = mongoose.model('ProjectRequest', projectRequestSchema);

// Get all project requests (Admin only)
router.get('/admin/project-requests', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const requests = await ProjectRequest.find()
            .populate('requestedBy', 'username role')
            .sort({ createdAt: -1 });
            
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get project requests by project manager
router.get('/my-project-requests', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Project Manager') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const requests = await ProjectRequest.find({ requestedBy: req.user.id })
            .sort({ createdAt: -1 });
            
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Approve/Reject project request (Admin only)
router.patch('/admin/project-requests/:requestId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ error: 'Only Admin can approve or reject project requests' });
        }
        
        const { status } = req.body;
        
        if (!status || !['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Valid status (Approved or Rejected) is required' });
        }
        
        const projectRequest = await ProjectRequest.findById(req.params.requestId);
        
        if (!projectRequest) {
            return res.status(404).json({ error: 'Project request not found' });
        }
        
        projectRequest.status = status;
        await projectRequest.save();
        
        // If approved, create the project
        if (status === 'Approved') {
            const newProject = new Project({
                name: projectRequest.name,
                description: projectRequest.description,
                createdBy: projectRequest.requestedBy,
                members: [{
                    userId: projectRequest.requestedBy,
                    role: 'Project Manager'
                }]
            });
            
            await newProject.save();
            
            const populatedProject = await Project.findById(newProject._id)
                .populate('members.userId', 'username team level role')
                .populate('createdBy', 'username');
                
            return res.json({ 
                message: 'Project request approved and project created',
                request: projectRequest,
                project: populatedProject
            });
        }
        
        res.json({
            message: `Project request ${status.toLowerCase()}`,
            request: projectRequest
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router; 