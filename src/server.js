require('dotenv').config();
const fastify = require('fastify')({ logger: true });

// Registrar plugins
async function build() {
  // CORS
  await fastify.register(require('@fastify/cors'), {
    origin: true,
    credentials: true
  });

  // Environment variables validation
  await fastify.register(require('@fastify/env'), {
    confKey: 'config',
    schema: {
      type: 'object',
      required: ['PORT', 'STRIPE_SECRET_KEY'],
      properties: {
        PORT: {
          type: 'string',
          default: '3000'
        },
        NODE_ENV: {
          type: 'string',
          default: 'development'
        },
        STRIPE_SECRET_KEY: {
          type: 'string'
        },
        STRIPE_PUBLISHABLE_KEY: {
          type: 'string'
        },
        API_BASE_URL: {
          type: 'string',
          default: 'http://localhost:3000'
        }
      }
    },
    dotenv: true
  });

  // Swagger documentation
  await fastify.register(require('@fastify/swagger'), {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'SalesCode Payments API',
        description: 'API para processamento de pagamentos com múltiplos gateways',
        version: '1.0.0'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server'
        }
      ],
      tags: [
        { name: 'payments', description: 'Endpoints de pagamentos únicos' },
        { name: 'subscriptions', description: 'Endpoints de assinaturas' },
        { name: 'webhooks', description: 'Endpoints de webhooks' },
        { name: 'health', description: 'Health check' }
      ]
    }
  });

  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    },
    staticCSP: true,
    transformStaticCSP: (header) => header
  });

  // Registrar routes
  await fastify.register(require('./routes/health'), { prefix: '/api/v1' });
  await fastify.register(require('./routes/payments'), { prefix: '/api/v1' });
  await fastify.register(require('./routes/subscriptions'), { prefix: '/api/v1' });
  await fastify.register(require('./routes/webhooks'), { prefix: '/api/v1' });

  return fastify;
}

// Start server
async function start() {
  try {
    const app = await build();
    
    const port = process.env.PORT || 3000;
    const host = process.env.API_HOST || '0.0.0.0';
    
    await app.listen({ port: parseInt(port), host });
    
    console.log(`🚀 Server running on http://${host}:${port}`);
    console.log(`📚 Documentation available at http://${host}:${port}/docs`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = { build, start };
