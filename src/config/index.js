/**
 * Configurações da aplicação
 */

const config = {
  // Configurações do servidor
  server: {
    port: process.env.PORT || 3000,
    host: process.env.API_HOST || '0.0.0.0',
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000'
  },

  // Configurações de ambiente
  env: {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test'
  },

  // Configurações de gateways
  gateways: {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
      enabled: !!process.env.STRIPE_SECRET_KEY
    },
    mercadopago: {
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      publicKey: process.env.MERCADOPAGO_PUBLIC_KEY,
      enabled: !!process.env.MERCADOPAGO_ACCESS_TOKEN
    }
  },

  // Configurações de segurança
  security: {
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    rateLimitWindow: 60 * 1000, // 1 minuto
    rateLimitMax: 100 // máximo de requests por janela
  },

  // Configurações de logging
  logging: {
    level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
  }
};

module.exports = config;
