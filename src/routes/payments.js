const gatewayFactory = require('../gateways/GatewayFactory');

/**
 * Payments routes
 */
async function paymentsRoutes(fastify, options) {

  // Schema para criar pagamento
  const createPaymentSchema = {
    summary: 'Criar pagamento único',
    description: 'Criar um link de checkout para pagamento único',
    tags: ['payments'],
    body: {
      type: 'object',
      required: ['gateway', 'amount', 'description'],
      properties: {
        gateway: {
          type: 'string',
          description: 'Nome do gateway de pagamento',
          enum: ['stripe', 'mercadopago']
        },
        amount: {
          type: 'number',
          description: 'Valor do pagamento em reais',
          minimum: 0.01
        },
        currency: {
          type: 'string',
          description: 'Moeda do pagamento',
          default: 'brl'
        },
        description: {
          type: 'string',
          description: 'Descrição do pagamento'
        },
        customerEmail: {
          type: 'string',
          description: 'Email do cliente'
        },
        successUrl: {
          type: 'string',
          description: 'URL de redirecionamento após sucesso'
        },
        cancelUrl: {
          type: 'string',
          description: 'URL de redirecionamento após cancelamento'
        },
        metadata: {
          type: 'object',
          description: 'Metadados adicionais'
        }
      }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          paymentId: { type: 'string' },
          checkoutUrl: { type: 'string' },
          amount: { type: 'number' },
          currency: { type: 'string' },
          status: { type: 'string' },
          gateway: { type: 'string' }
        }
      },
      400: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          error: { type: 'string' },
          gateway: { type: 'string' }
        }
      }
    }
  };

  // POST /payments - Criar pagamento
  fastify.post('/payments', { schema: createPaymentSchema }, async (request, reply) => {
    try {
      const { gateway: gatewayName, ...paymentData } = request.body;

      // Verificar se o gateway está disponível
      if (!gatewayFactory.isGatewayAvailable(gatewayName)) {
        return reply.code(400).send({
          success: false,
          error: `Gateway '${gatewayName}' não está disponível. Gateways disponíveis: ${gatewayFactory.getAvailableGateways().join(', ')}`,
          gateway: gatewayName
        });
      }

      const gateway = gatewayFactory.getGateway(gatewayName);
      const result = await gateway.createPayment(paymentData);

      if (!result.success) {
        return reply.code(400).send(result);
      }

      return result;

    } catch (error) {
      fastify.log.error('Erro ao criar pagamento:', error);
      return reply.code(500).send({
        success: false,
        error: 'Erro interno do servidor',
        gateway: request.body.gateway
      });
    }
  });

  // GET /payments/:paymentId/status - Verificar status do pagamento
  fastify.get('/payments/:paymentId/status', {
    schema: {
      summary: 'Verificar status do pagamento',
      description: 'Consultar o status atual de um pagamento',
      tags: ['payments'],
      params: {
        type: 'object',
        properties: {
          paymentId: {
            type: 'string',
            description: 'ID do pagamento'
          }
        }
      },
      querystring: {
        type: 'object',
        properties: {
          gateway: {
            type: 'string',
            description: 'Nome do gateway',
            enum: ['stripe', 'mercadopago']
          }
        },
        required: ['gateway']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            status: { type: 'string' },
            paymentStatus: { type: 'string' },
            amountTotal: { type: 'number' },
            currency: { type: 'string' },
            customerEmail: { type: 'string' },
            gateway: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { paymentId } = request.params;
      const { gateway: gatewayName } = request.query;

      if (!gatewayFactory.isGatewayAvailable(gatewayName)) {
        return reply.code(400).send({
          success: false,
          error: `Gateway '${gatewayName}' não está disponível`,
          gateway: gatewayName
        });
      }

      const gateway = gatewayFactory.getGateway(gatewayName);
      const result = await gateway.getPaymentStatus(paymentId);

      if (!result.success) {
        return reply.code(400).send(result);
      }

      return result;

    } catch (error) {
      fastify.log.error('Erro ao verificar status do pagamento:', error);
      return reply.code(500).send({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // GET /payments/gateways - Listar gateways disponíveis
  fastify.get('/payments/gateways', {
    schema: {
      summary: 'Listar gateways disponíveis',
      description: 'Obter lista de gateways de pagamento configurados',
      tags: ['payments'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            gateways: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    return {
      success: true,
      gateways: gatewayFactory.getAvailableGateways()
    };
  });

}

module.exports = paymentsRoutes;
