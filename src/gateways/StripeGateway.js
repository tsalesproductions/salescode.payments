const PaymentGateway = require('./PaymentGateway');
const Stripe = require('stripe');

class StripeGateway extends PaymentGateway {
  constructor(config) {
    super(config);
    this.stripe = new Stripe(config.secretKey);
  }

  /**
   * Criar um pagamento único via Stripe Checkout
   */
  async createPayment(paymentData) {
    try {
      const {
        amount,
        currency = 'brl',
        description,
        customerEmail,
        successUrl,
        cancelUrl,
        metadata = {}
      } = paymentData;

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency,
            product_data: {
              name: description || 'Pagamento',
            },
            unit_amount: Math.round(amount * 100), // Stripe usa centavos
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: successUrl || `${process.env.API_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.API_BASE_URL}/cancel`,
        customer_email: customerEmail,
        metadata: {
          ...metadata,
          gateway: 'stripe',
          type: 'payment'
        }
      });

      return {
        success: true,
        paymentId: session.id,
        checkoutUrl: session.url,
        amount,
        currency,
        status: session.status,
        gateway: 'stripe'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        gateway: 'stripe'
      };
    }
  }

  /**
   * Criar uma assinatura via Stripe Checkout
   */
  async createSubscription(subscriptionData) {
    try {
      const {
        priceId,
        customerEmail,
        successUrl,
        cancelUrl,
        metadata = {},
        trialPeriodDays
      } = subscriptionData;

      // Se não temos um priceId, criamos um produto e preço
      let finalPriceId = priceId;
      
      if (!priceId && subscriptionData.amount && subscriptionData.interval) {
        const product = await this.stripe.products.create({
          name: subscriptionData.productName || 'Assinatura',
          description: subscriptionData.description
        });

        const price = await this.stripe.prices.create({
          unit_amount: Math.round(subscriptionData.amount * 100),
          currency: subscriptionData.currency || 'brl',
          recurring: {
            interval: subscriptionData.interval, // 'month' ou 'year'
            interval_count: subscriptionData.intervalCount || 1
          },
          product: product.id,
        });

        finalPriceId = price.id;
      }

      const sessionParams = {
        payment_method_types: ['card'],
        line_items: [{
          price: finalPriceId,
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: successUrl || `${process.env.API_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${process.env.API_BASE_URL}/cancel`,
        customer_email: customerEmail,
        metadata: {
          ...metadata,
          gateway: 'stripe',
          type: 'subscription'
        }
      };

      if (trialPeriodDays) {
        sessionParams.subscription_data = {
          trial_period_days: trialPeriodDays
        };
      }

      const session = await this.stripe.checkout.sessions.create(sessionParams);

      return {
        success: true,
        subscriptionId: session.subscription,
        checkoutUrl: session.url,
        priceId: finalPriceId,
        status: session.status,
        gateway: 'stripe'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        gateway: 'stripe'
      };
    }
  }

  /**
   * Verificar status de pagamento
   */
  async getPaymentStatus(paymentId) {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(paymentId);
      
      return {
        success: true,
        status: session.status,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total / 100,
        currency: session.currency,
        customerEmail: session.customer_email,
        gateway: 'stripe'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        gateway: 'stripe'
      };
    }
  }

  /**
   * Cancelar assinatura
   */
  async cancelSubscription(subscriptionId) {
    try {
      const subscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true
      });

      return {
        success: true,
        subscriptionId: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        gateway: 'stripe'
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        gateway: 'stripe'
      };
    }
  }

  /**
   * Validar webhook do Stripe
   */
  async validateWebhook(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return { valid: true, event };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = StripeGateway;
