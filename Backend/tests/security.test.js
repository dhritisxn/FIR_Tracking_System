// Security regression tests. Models are mocked, so no database is touched.
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-for-the-startup-check';

const mongoose = require('mongoose');
jest.spyOn(mongoose, 'connect').mockResolvedValue();

jest.mock('../models/FIR');
jest.mock('../models/User');
jest.mock('../models/Notification');
jest.mock('../models/Counter');

const request = require('supertest');
const jwt = require('jsonwebtoken');
const FIR = require('../models/FIR');
const User = require('../models/User');
const Notification = require('../models/Notification');
const app = require('../app');

const ids = {
  citizen: new mongoose.Types.ObjectId().toString(),
  other: new mongoose.Types.ObjectId().toString(),
  officer: new mongoose.Types.ObjectId().toString(),
  admin: new mongoose.Types.ObjectId().toString(),
  fir: new mongoose.Types.ObjectId().toString()
};
const tokenFor = (role, id = ids[role]) =>
  'Bearer ' + jwt.sign({ id, email: `${role}@example.com`, role }, process.env.JWT_SECRET);

const otherUsersFir = {
  _id: ids.fir, firNumber: 'FIR2026001', userId: ids.other, email: 'other@example.com',
  complainantName: 'Someone Else', description: 'private', updates: []
};

beforeEach(() => jest.clearAllMocks());

describe('JWT secret', () => {
  const { getJwtSecret } = require('../middleware/auth');
  const saved = process.env.JWT_SECRET;
  afterEach(() => { process.env.JWT_SECRET = saved; });

  it('refuses to run without a secret', () => {
    delete process.env.JWT_SECRET;
    expect(() => getJwtSecret()).toThrow(/JWT_SECRET/);
  });

  it('refuses the old fallback values', () => {
    for (const weak of ['secret', 'your-secret-key']) {
      process.env.JWT_SECRET = weak;
      expect(() => getJwtSecret()).toThrow(/JWT_SECRET/);
    }
  });

  it('rejects tokens signed with the old fallback secret', async () => {
    const forged = jwt.sign({ id: ids.admin, role: 'admin' }, 'secret');
    const res = await request(app).get('/api/firs').set('Authorization', 'Bearer ' + forged);
    expect(res.status).toBe(401);
  });
});

describe('FIR details ownership', () => {
  beforeEach(() => FIR.findOne.mockResolvedValue(otherUsersFir));

  it("hides another citizen's FIR", async () => {
    const res = await request(app).get('/api/firs/FIR2026001').set('Authorization', tokenFor('citizen'));
    expect(res.status).toBe(404);
    expect(res.body.complainantName).toBeUndefined();
  });

  it('shows a citizen their own FIR', async () => {
    const res = await request(app).get('/api/firs/FIR2026001').set('Authorization', tokenFor('citizen', ids.other));
    expect(res.status).toBe(200);
    expect(res.body.firNumber).toBe('FIR2026001');
  });

  it.each(['officer', 'admin'])('lets an %s view any FIR', async (role) => {
    const res = await request(app).get('/api/firs/FIR2026001').set('Authorization', tokenFor(role));
    expect(res.status).toBe(200);
  });

  it('requires login', async () => {
    const res = await request(app).get('/api/firs/FIR2026001');
    expect(res.status).toBe(401);
  });
});

describe('FIR staff actions', () => {
  it('stops citizens changing FIR status', async () => {
    const res = await request(app).patch(`/api/firs/${ids.fir}/status`)
      .set('Authorization', tokenFor('citizen')).send({ status: 'closed', message: 'x' });
    expect(res.status).toBe(403);
  });

  it('stops officers assigning FIRs', async () => {
    const res = await request(app).patch(`/api/firs/${ids.fir}/assign`)
      .set('Authorization', tokenFor('officer')).send({ officerId: ids.officer, officerName: 'X' });
    expect(res.status).toBe(403);
  });
});

describe('Role checks on police and user routes', () => {
  it('blocks citizens from police routes', async () => {
    const res = await request(app).get('/api/police/firs').set('Authorization', tokenFor('citizen'));
    expect(res.status).toBe(403);
  });

  it('lets officers use police routes', async () => {
    FIR.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });
    const res = await request(app).get('/api/police/firs').set('Authorization', tokenFor('officer'));
    expect(res.status).toBe(200);
  });

  it('keeps the officer list admin-only', async () => {
    const res = await request(app).get('/api/police/officers').set('Authorization', tokenFor('officer'));
    expect(res.status).toBe(403);
  });

  it('lets citizens use their user routes', async () => {
    FIR.find.mockResolvedValue([]);
    const res = await request(app).get('/api/user/my_firs').set('Authorization', tokenFor('citizen'));
    expect(res.status).toBe(200);
    expect(FIR.find).toHaveBeenCalledWith({ userId: ids.citizen });
  });
});

describe('Audio uploads', () => {
  it('rejects non-audio files', async () => {
    const res = await request(app).post('/api/police/register_fir_audio')
      .set('Authorization', tokenFor('officer'))
      .attach('audio', Buffer.from('<?php echo 1; ?>'), { filename: 'shell.php', contentType: 'application/x-php' });
    expect(res.status).toBe(400);
  });
});

describe('FIR numbers', () => {
  it('hands out a distinct number to each concurrent submission', async () => {
    const Counter = require('../models/Counter');
    let seq = 0;
    Counter.exists.mockResolvedValue(true);
    Counter.findOneAndUpdate.mockImplementation(async () => ({ seq: ++seq })); // atomic $inc
    const saved = [];
    FIR.mockImplementation(function (doc) {
      Object.assign(this, doc);
      this.save = jest.fn(async () => saved.push(doc.firNumber));
    });
    const body = {
      complainantName: 'A', phoneNumber: '1', email: 'a@example.com', incidentType: 'theft',
      location: 'X', dateTime: '2026-10-01T10:00:00Z', description: 'Bike stolen'
    };
    const results = await Promise.all(Array.from({ length: 5 }, () =>
      request(app).post('/api/register_fir').set('Authorization', tokenFor('citizen')).send(body)));
    expect(results.map(r => r.status)).toEqual([201, 201, 201, 201, 201]);
    expect(new Set(saved).size).toBe(5);
    FIR.mockReset();
  });
});

describe('Notifications', () => {
  it('stops citizens creating notifications', async () => {
    const res = await request(app).post('/api/notifications').set('Authorization', tokenFor('citizen'))
      .send({ userId: 'victim@example.com', firId: ids.fir, title: 'Hi', message: 'Spoof', type: 'system' });
    expect(res.status).toBe(403);
    expect(Notification).not.toHaveBeenCalled();
  });

  it("addresses staff notifications to the FIR's complainant, ignoring userId", async () => {
    FIR.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ email: 'owner@example.com' }) });
    const res = await request(app).post('/api/notifications').set('Authorization', tokenFor('officer'))
      .send({ userId: 'victim@example.com', firId: ids.fir, title: 'Update', message: 'Status changed', type: 'fir_update' });
    expect(res.status).toBe(201);
    expect(Notification).toHaveBeenCalledWith(expect.objectContaining({ userId: 'owner@example.com' }));
  });
});

describe('Request limits', () => {
  it('rejects oversized JSON bodies', async () => {
    const res = await request(app).post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ email: 'a@b.co', password: 'x'.repeat(200 * 1024) }));
    expect(res.status).toBe(413);
  });

  it('rate-limits repeated failed logins', async () => {
    User.findOne.mockResolvedValue(null);
    let last;
    for (let i = 0; i < 11; i++) {
      last = await request(app).post('/api/auth/officer/login').send({ email: 'x@example.com', password: 'wrong' });
    }
    expect(last.status).toBe(429);
  });

  it('does not let sign-up create admins', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'A', email: 'a@example.com', phoneNumber: '1', password: 'longenough1', role: 'admin' });
    expect(res.status).toBe(400);
  });
});

afterAll(() => jest.restoreAllMocks());
