/**
 * Middleware para log de requisições
 */
function loggerMiddleware(request, reply, done) {
  const start = Date.now();
  
  reply.addHook('onSend', (request, reply, payload, done) => {
    const duration = Date.now() - start;
    request.log.info({
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      duration: `${duration}ms`,
      userAgent: request.headers['user-agent'],
      ip: request.ip
    }, 'Request completed');
    done();
  });

  done();
}

/**
 * Middleware para tratamento de erros
 */
function errorHandler(error, request, reply) {
  // Log do erro
  request.log.error({
    error: error.message,
    stack: error.stack,
    method: request.method,
    url: request.url
  }, 'Request error');

  // Retornar erro formatado
  const statusCode = error.statusCode || 500;
  
  reply.code(statusCode).send({
    success: false,
    error: statusCode === 500 ? 'Erro interno do servidor' : error.message,
    timestamp: new Date().toISOString()
  });
}

/**
 * Middleware de rate limiting simples
 */
function rateLimitMiddleware() {
  const requests = new Map();
  
  return function(request, reply, done) {
    const ip = request.ip;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minuto
    const maxRequests = 100; // máximo 100 requests por minuto

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip);
    
    // Remover requests antigas
    const validRequests = userRequests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return reply.code(429).send({
        success: false,
        error: 'Muitas requisições. Tente novamente em um minuto.',
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }

    validRequests.push(now);
    requests.set(ip, validRequests);
    
    done();
  };
}

module.exports = {
  loggerMiddleware,
  errorHandler,
  rateLimitMiddleware
};
