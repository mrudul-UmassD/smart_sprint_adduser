const request = require('supertest');
const app = require('./test-server');

describe('Security Features Tests', () => {
  describe('Rate Limiting', () => {
    test('should limit login attempts', async () => {
      const loginAttempts = [];
      for (let i = 0; i < 15; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({ username: 'testuser', password: 'wrongpassword' });
        loginAttempts.push(response.status);
      }
      expect(loginAttempts.filter(status => status === 429).length).toBeGreaterThan(0);
    });

    test('should limit registration attempts', async () => {
      const registerAttempts = [];
      for (let i = 0; i < 4; i++) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({ username: `testuser${i}`, password: 'password123' });
        registerAttempts.push(response.status);
      }
      expect(registerAttempts.filter(status => status === 429).length).toBeGreaterThan(0);
    });
  });

  describe('Request Size Limits', () => {
    test('should reject large JSON payloads', async () => {
      const largePayload = { data: 'a'.repeat(2 * 1024 * 1024) }; // 2MB payload
      const response = await request(app)
        .post('/api/tasks')
        .send(largePayload);
      expect(response.status).toBe(413);
    });
  });

  describe('Security Headers', () => {
    test('should include security headers', async () => {
      const response = await request(app).get('/health');
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(response.headers['strict-transport-security']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('CORS Configuration', () => {
    test('should allow requests from allowed origin', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    test('should reject requests from disallowed origin', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://malicious-site.com');
      expect(response.status).toBe(403);
    });
  });
}); 