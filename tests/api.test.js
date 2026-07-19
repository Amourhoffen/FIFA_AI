import request from 'supertest';
import { server } from '../server/index.js';

describe('Smart Stadium API Endpoints', () => {


  it('GET /api/health should return 200 OK', async () => {
    const res = await request(server).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('ok', true);
  });

  it('GET /api/live-matches should return a list of matches', async () => {
    const res = await request(server).get('/api/live-matches');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.Matchsummary)).toBe(true);
  });

  it('GET /api/trending-shorts should return simulated telemetry videos', async () => {
    const res = await request(server).get('/api/trending-shorts');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.shorts)).toBe(true);
  });

  it('POST /api/generate-moment should require a POST body', async () => {
    const res = await request(server).post('/api/generate-moment').send({});
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/generate-moment should return 405 Method Not Allowed', async () => {
    const res = await request(server).get('/api/generate-moment');
    expect(res.statusCode).toEqual(405);
  });
});
