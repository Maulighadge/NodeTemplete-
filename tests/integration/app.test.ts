import request from 'supertest';
import app from '../../src/app';

describe('Express Application Integration Tests', () => {
  it('GET /health should return 200 with standard response envelope', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('requestId');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('method', 'GET');
    expect(res.body).toHaveProperty('path', '/health');
  });

  it('GET /api/v1/health should also return 200', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
  });

  it('GET /unknown-route should return 404 with standard error envelope', async () => {
    const res = await request(app).get('/random-path-that-does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('NOT_FOUND_404');
    expect(res.body.error).toContain('not found');
  });

  it('should block requests to dotfiles like /.env', async () => {
    const res = await request(app).get('/.env');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('FORBIDDEN_403');
  });

  it('POST /user with invalid body should return 400 validation error', async () => {
    const res = await request(app)
      .post('/user')
      .send({ name: 'A' }); // missing email, phone, and name is too short

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('VALIDATION_FAILED_400');
  });
});
