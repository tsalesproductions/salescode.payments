const gatewayFactory = require('../gateways/GatewayFactory');

/**
 * Webhook routes para receber notificações dos gateways
 */
async function webhookRoutes(fastify, options) {

  // Webhook do Stripe
  fastify.post('/webhooks/stripe', {
    schema: {
      summary: 'Webhook do Stripe',
      description: 'Receber notificações de eventos do Stripe',
      tags: ['webhooks'],
      headers: {
        type: 'object',
        properties: {
          'stripe-signature': { type: 'string' }
        },
        required: ['stripe-signature']
      }
    }
  }, async (request, reply) => {
    try {
      const signature = request.headers['stripe-signature'];
      const payload = request.body;

      // Validar webhook do Stripe
      const gateway = gatewayFactory.getGateway('stripe');
      const validation = await gateway.validateWebhook(payload, signature);

      if (!validation.valid) {
        fastify.log.warn('Invalid Stripe webhook signature');
        return reply.code(400).send({ error: 'Invalid signature' });
      }

      const event = validation.event;
      
      // Processar diferentes tipos de eventos
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object);
          break;
        
        case 'payment_intent.succeeded':
          await handlePaymentSucceeded(event.data.object);
          break;
        
        case 'invoice.payment_succeeded':
          await handleSubscriptionPayment(event.data.object);
          break;
        
        case 'customer.subscription.deleted':
          await handleSubscriptionCancelled(event.data.object);
          break;
        
        default:
          fastify.log.info(`Unhandled Stripe event type: ${event.type}`);
      }

      return { received: true };

    } catch (error) {
      fastify.log.error('Error processing Stripe webhook:', error);
      return reply.code(500).send({ error: 'Webhook processing failed' });
    }
  });

  // Webhook do MercadoPago (template)
  fastify.post('/webhooks/mercadopago', {
    schema: {
      summary: 'Webhook do MercadoPago',
      description: 'Receber notificações de eventos do MercadoPago',
      tags: ['webhooks']
    }
  }, async (request, reply) => {
    try {
      const payload = request.body;
      
      // Aqui você implementaria a validação do webhook do MercadoPago
      // e o processamento dos eventos
      
      fastify.log.info('MercadoPago webhook received:', payload);
      
      return { received: true };

    } catch (error) {
      fastify.log.error('Error processing MercadoPago webhook:', error);
      return reply.code(500).send({ error: 'Webhook processing failed' });
    }
  });

}

/**
 * Handlers para eventos específicos
 */

async function handleCheckoutSessionCompleted(session) {
  console.log('✅ Checkout session completed:', session.id);
  
  // Aqui você pode:
  // - Atualizar status do pedido no seu banco de dados
  // - Enviar email de confirmação
  // - Ativar acesso do usuário
  // - etc.
}

async function handlePaymentSucceeded(paymentIntent) {
  console.log('💰 Payment succeeded:', paymentIntent.id);
  
  // Processar pagamento bem-sucedido
}

async function handleSubscriptionPayment(invoice) {
  console.log('🔄 Subscription payment succeeded:', invoice.subscription);
  
  // Processar renovação de assinatura
}

async function handleSubscriptionCancelled(subscription) {
  console.log('❌ Subscription cancelled:', subscription.id);
  
  // Processar cancelamento de assinatura
}

module.exports = webhookRoutes;
