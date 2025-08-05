const gatewayFactory = require('../gateways/GatewayFactory');

/**
 * Subscriptions routes
 */
async function subscriptionsRoutes(fastify, options) {

  // Schema para criar assinatura
  const createSubscriptionSchema = {
    summary: 'Criar assinatura',
    description: 'Criar um link de checkout para assinatura recorrente',
    tags: ['subscriptions'],
    body: {
      type: 'object',
      required: ['gateway'],
      properties: {
        gateway: {
          type: 'string',
          description: 'Nome do gateway de pagamento',
          enum: ['stripe', 'mercadopago']
        },
        // Opção 1: Usar priceId existente do Stripe
        priceId: {
          type: 'string',
          description: 'ID do preço no Stripe (se já existe)'
        },
        // Opção 2: Criar produto e preço dinamicamente
        amount: {
          type: 'number',
          description: 'Valor da assinatura em reais',
          minimum: 0.01
        },
        currency: {
          type: 'string',
          description: 'Moeda da assinatura',
          default: 'brl'
        },
        interval: {
          type: 'string',
          description: 'Intervalo de cobrança',
          enum: ['month', 'year']
        },
        intervalCount: {
          type: 'integer',
          description: 'Quantidade de intervalos (ex: a cada 2 meses)',
          minimum: 1,
          default: 1
        },
        productName: {
          type: 'string',
          description: 'Nome do produto/serviço'
        },
        description: {
          type: 'string',
          description: 'Descrição da assinatura'
        },
        customerEmail: {
          type: 'string',
          description: 'Email do cliente'
        },
        trialPeriodDays: {
          type: 'integer',
          description: 'Dias de período de teste gratuito',
          minimum: 0
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
          subscriptionId: { type: 'string' },
          checkoutUrl: { type: 'string' },
          priceId: { type: 'string' },
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

  // POST /subscriptions - Criar assinatura
  fastify.post('/subscriptions', { schema: createSubscriptionSchema }, async (request, reply) => {
    try {
      const { gateway: gatewayName, ...subscriptionData } = request.body;

      // Verificar se o gateway está disponível
      if (!gatewayFactory.isGatewayAvailable(gatewayName)) {
        return reply.code(400).send({
          success: false,
          error: `Gateway '${gatewayName}' não está disponível. Gateways disponíveis: ${gatewayFactory.getAvailableGateways().join(', ')}`,
          gateway: gatewayName
        });
      }

      // Validar parâmetros necessários
      if (!subscriptionData.priceId && (!subscriptionData.amount || !subscriptionData.interval)) {
        return reply.code(400).send({
          success: false,
          error: 'É necessário fornecer priceId OU amount + interval para criar uma assinatura',
          gateway: gatewayName
        });
      }

      const gateway = gatewayFactory.getGateway(gatewayName);
      const result = await gateway.createSubscription(subscriptionData);

      if (!result.success) {
        return reply.code(400).send(result);
      }

      return result;

    } catch (error) {
      fastify.log.error('Erro ao criar assinatura:', error);
      return reply.code(500).send({
        success: false,
        error: 'Erro interno do servidor',
        gateway: request.body.gateway
      });
    }
  });

  // PUT /subscriptions/:subscriptionId/cancel - Cancelar assinatura
  fastify.put('/subscriptions/:subscriptionId/cancel', {
    schema: {
      summary: 'Cancelar assinatura',
      description: 'Cancelar uma assinatura existente (cancelamento no final do período)',
      tags: ['subscriptions'],
      params: {
        type: 'object',
        properties: {
          subscriptionId: {
            type: 'string',
            description: 'ID da assinatura'
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
            subscriptionId: { type: 'string' },
            status: { type: 'string' },
            cancelAtPeriodEnd: { type: 'boolean' },
            currentPeriodEnd: { type: 'string' },
            gateway: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { subscriptionId } = request.params;
      const { gateway: gatewayName } = request.query;

      if (!gatewayFactory.isGatewayAvailable(gatewayName)) {
        return reply.code(400).send({
          success: false,
          error: `Gateway '${gatewayName}' não está disponível`,
          gateway: gatewayName
        });
      }

      const gateway = gatewayFactory.getGateway(gatewayName);
      const result = await gateway.cancelSubscription(subscriptionId);

      if (!result.success) {
        return reply.code(400).send(result);
      }

      return result;

    } catch (error) {
      fastify.log.error('Erro ao cancelar assinatura:', error);
      return reply.code(500).send({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  });

  // GET /subscriptions/gateways - Listar gateways disponíveis para assinaturas
  fastify.get('/subscriptions/gateways', {
    schema: {
      summary: 'Listar gateways disponíveis para assinaturas',
      description: 'Obter lista de gateways configurados para processar assinaturas',
      tags: ['subscriptions'],
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

module.exports = subscriptionsRoutes;
