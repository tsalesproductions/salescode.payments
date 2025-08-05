/**
 * Health check route
 */
async function healthRoutes(fastify, options) {
  
  fastify.get('/health', {
    schema: {
      summary: 'Health check',
      description: 'Verificar se a API está funcionando',
      tags: ['health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            version: { type: 'string' },
            environment: { type: 'string' },
            gateways: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const gatewayFactory = require('../gateways/GatewayFactory');
    const packageJson = require('../../package.json');
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: packageJson.version,
      environment: process.env.NODE_ENV || 'development',
      gateways: gatewayFactory.getAvailableGateways()
    };
  });

}

module.exports = healthRoutes;
