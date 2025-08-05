const { build } = require('../src/server');

describe('API Tests', () => {
  let app;

  beforeAll(async () => {
    app = await build();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    test('GET /api/v1/health should return 200', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health'
      });

      expect(response.statusCode).toBe(200);
      
      const payload = JSON.parse(response.payload);
      expect(payload.status).toBe('ok');
      expect(payload).toHaveProperty('timestamp');
      expect(payload).toHaveProperty('version');
      expect(payload).toHaveProperty('gateways');
    });
  });

  describe('Gateways', () => {
    test('GET /api/v1/payments/gateways should return available gateways', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/payments/gateways'
      });

      expect(response.statusCode).toBe(200);
      
      const payload = JSON.parse(response.payload);
      expect(payload.success).toBe(true);
      expect(Array.isArray(payload.gateways)).toBe(true);
    });
  });

  describe('Payments', () => {
    test('POST /api/v1/payments should require gateway parameter', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/payments',
        payload: {
          amount: 100,
          description: 'Test payment'
        }
      });

      expect(response.statusCode).toBe(400);
    });

    test('POST /api/v1/payments should validate amount', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/payments',
        payload: {
          gateway: 'stripe',
          amount: -10,
          description: 'Test payment'
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('Subscriptions', () => {
    test('POST /api/v1/subscriptions should require gateway parameter', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/subscriptions',
        payload: {
          amount: 29.90,
          interval: 'month'
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
