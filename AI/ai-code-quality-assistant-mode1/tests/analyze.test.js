const request = require('supertest');
const app = require('../server');

describe('API AI Code Quality Assistant', () => {
  test('health endpoint responds without exposing the API key', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body.status).toBe('ok');
    expect(response.body).not.toHaveProperty('apiKey');
  });

  test('rejects missing code', async () => {
    const response = await request(app).post('/api/analyze').send({}).expect(400);
    expect(response.body.error.code).toBe('CODE_REQUIRED');
  });

  test('rejects invalid JavaScript before calling the LLM', async () => {
    const response = await request(app).post('/api/analyze').send({ code: 'function {' }).expect(400);
    expect(response.body.error.code).toBe('INVALID_JAVASCRIPT');
  });
});
