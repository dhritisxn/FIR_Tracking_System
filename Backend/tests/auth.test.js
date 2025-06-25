const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/User');

describe('Auth API', () => {
  beforeAll(async () => {
    // Remove the test user if it exists
    await User.deleteOne({ username: 'testuser1' });
  });

  it('should register a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser1', password: 'testpass' });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
});
