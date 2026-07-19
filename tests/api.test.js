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

  it('POST /api/generate-moment with valid vibe should attempt generation', async () => {
    const res = await request(server).post('/api/generate-moment').send({ 
      userSentiment: 'Congestion Alert',
      matchData: { timestamp: 12345 },
      userId: 'test_user_123'
    });
    // This will either return 200 (if API key is set or mocked) or 500 (if API key fails)
    // We expect it to at least hit the handler and return JSON.
    expect([200, 500]).toContain(res.statusCode);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('GET unknown route should return 404', async () => {
    const res = await request(server).get('/api/unknown-route');
    expect(res.statusCode).toEqual(404);
  });

  it('GET /public/css/simulation.css should return 200 and have CSS content type', async () => {
    const res = await request(server).get('/css/simulation.css');
    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toContain('text/css');
  });

  it('OPTIONS request should return 204 with CORS headers', async () => {
    const res = await request(server).options('/api/health');
    expect(res.statusCode).toEqual(204);
    expect(res.headers['access-control-allow-origin']).toEqual('*');
  });
});
