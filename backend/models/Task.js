const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    attachments: [{
        filename: String,
        path: String,
        mimetype: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        version: {
            type: Number,
            default: 1
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const timeEntrySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const documentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    path: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    versions: [{
        path: String,
        updatedAt: {
            type: Date,
            default: Date.now
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        versionNumber: Number
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['Todo', 'In Progress', 'Review', 'Needs Work', 'Completed'],
        default: 'Todo'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium'
    },
    stage: {
        type: String,
        enum: ['Requirements', 'Design', 'Development', 'Testing', 'Deployment', 'Maintenance'],
        default: 'Development'
    },
    attachments: [{
        filename: String,
        path: String,
        mimetype: String,
        createdAt: {
            type: Date,
            default: Date.now
        },
        version: {
            type: Number,
            default: 1
        }
    }],
    assignee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    team: {
        type: String,
        enum: ['Design', 'Database', 'Backend', 'Frontend', 'DevOps', 'Tester/Security'],
        required: true
    },
    dueDate: {
        type: Date
    },
    // New fields for task dependencies
    dependencies: [{
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task'
        },
        type: {
            type: String,
            enum: ['Start-to-Start', 'Start-to-Finish', 'Finish-to-Start', 'Finish-to-Finish'],
            default: 'Finish-to-Start'
        },
        lag: {
            type: Number, // in days
            default: 0
        }
    }],
    dependents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    }],
    // Fields for time tracking
    estimatedTime: {
        type: Number, // in hours
        default: 0
    },
    timeSpent: {
        type: Number, // in hours, calculated from timeEntries
        default: 0
    },
    timeEntries: [timeEntrySchema],
    // Document management
    documents: [documentSchema],
    // Original fields
    comments: [commentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // Additional fields for Gantt chart
    startDate: {
        type: Date,
        default: function() {
            return new Date();
        }
    },
    endDate: {
        type: Date,
        default: function() {
            const date = new Date();
            date.setDate(date.getDate() + 1);
            return date;
        }
    },
    completion: {
        type: Number, // percentage
        default: 0,
        min: 0,
        max: 100
    }
});

taskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    
    // Calculate time spent from time entries
    if (this.timeEntries && this.timeEntries.length > 0) {
        this.timeSpent = this.timeEntries.reduce((total, entry) => {
            return total + (entry.duration / 60); // Convert minutes to hours
        }, 0);
    }
    
    // Update end date based on start date and estimated time if not set
    if (this.startDate && !this.endDate && this.estimatedTime) {
        const endDate = new Date(this.startDate);
        endDate.setHours(endDate.getHours() + this.estimatedTime);
        this.endDate = endDate;
    }
    
    next();
});

// Middleware to update dependent tasks when a task is completed
taskSchema.post('save', async function(doc) {
    if (doc.status === 'Completed' && doc.dependents && doc.dependents.length > 0) {
        const Task = this.model('Task');
        for (const dependentId of doc.dependents) {
            const dependentTask = await Task.findById(dependentId);
            if (dependentTask) {
                // Check if all dependencies are completed
                const dependencies = await Promise.all(
                    dependentTask.dependencies.map(dep => Task.findById(dep.task))
                );
                
                const allDependenciesCompleted = dependencies.every(dep => 
                    dep && dep.status === 'Completed'
                );
                
                if (allDependenciesCompleted) {
                    // Update the start date based on the latest dependency completion
                    const latestCompletionDate = dependencies.reduce((latest, dep) => {
                        return dep.updatedAt > latest ? dep.updatedAt : latest;
                    }, new Date(0));
                    
                    dependentTask.startDate = latestCompletionDate;
                    await dependentTask.save();
                }
            }
        }
    }
});

module.exports = mongoose.model('Task', taskSchema); 