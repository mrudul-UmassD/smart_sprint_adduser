const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./test-server');
const User = require('../models/User');
const Project = require('../models/Project');
const jwt = require('jsonwebtoken');

let server;

beforeAll(async () => {
  server = app.listen(0); // Use port 0 to let the OS assign a random available port
});

afterAll(async () => {
  await server.close();
});

describe('Project Tests', () => {
  let adminToken;
  let pmToken;
  let devToken;
  let adminId;
  let pmId;
  let devId;
  let projectId;

  beforeEach(async () => {
    // Create test users
    const adminUser = await User.create({
      username: 'adminuser',
      password: 'Admin@123456',
      role: 'Admin'
    });
    adminId = adminUser._id;
    adminToken = jwt.sign(
      { id: adminId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    const pmUser = await User.create({
      username: 'pmuser',
      password: 'Manager@123456',
      role: 'Project Manager'
    });
    pmId = pmUser._id;
    pmToken = jwt.sign(
      { id: pmId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    const devUser = await User.create({
      username: 'devuser',
      password: 'Developer@123456',
      role: 'Developer',
      team: 'Frontend',
      level: 'Junior'
    });
    devId = devUser._id;
    devToken = jwt.sign(
      { id: devId },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Clear projects
    await Project.deleteMany({});
  });

  describe('Project Creation', () => {
    test('Admin should create a project successfully', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Project',
          description: 'Test Description'
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Test Project');
      expect(response.body.description).toBe('Test Description');
      expect(response.body.members).toHaveLength(1);
      expect(response.body.members[0].userId.username).toBe('adminuser');
      projectId = response.body._id;
    });

    test('Project Manager should submit project creation request', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          name: 'PM Project',
          description: 'PM Description'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Project creation request submitted successfully');
    });

    test('Developer should not create projects', async () => {
      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${devToken}`)
        .send({
          name: 'Dev Project',
          description: 'Dev Description'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Project Retrieval', () => {
    test('Admin should get all projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Project Manager should get assigned projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${pmToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Developer should get only assigned projects', async () => {
      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${devToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Project Update', () => {
    let projectId;

    beforeEach(async () => {
      // Create a project first
      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Project',
          description: 'Test Description'
        });
      projectId = createResponse.body._id;
    });

    test('Admin should update project', async () => {
      const response = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Updated Project',
          description: 'Updated Description'
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Updated Project');
      expect(response.body.description).toBe('Updated Description');
    });

    test('Project Manager should not update project', async () => {
      const response = await request(app)
        .patch(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          name: 'PM Update',
          description: 'PM Update Description'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Project Members', () => {
    let projectId;

    beforeEach(async () => {
      // Create a project first
      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Project',
          description: 'Test Description'
        });
      projectId = createResponse.body._id;
    });

    test('Admin should add members to project', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: devId,
          role: 'Developer'
        });

      expect(response.status).toBe(200);
      expect(response.body.members).toHaveLength(2);
    });

    test('Project Manager should not add members', async () => {
      const response = await request(app)
        .post(`/api/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          userId: devId,
          role: 'Developer'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Project Deletion', () => {
    let projectId;

    beforeEach(async () => {
      // Create a project first
      const createResponse = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Project',
          description: 'Test Description'
        });
      projectId = createResponse.body._id;
    });

    test('Admin should delete project', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Project deleted successfully');
    });

    test('Project Manager should not delete project', async () => {
      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${pmToken}`);

      expect(response.status).toBe(403);
    });
  });
}); 