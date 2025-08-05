const StripeGateway = require('./StripeGateway');
// Adicione outros gateways aqui conforme necessário
// const MercadoPagoGateway = require('./MercadoPagoGateway');

/**
 * Factory para criar instâncias de gateways de pagamento
 */
class GatewayFactory {
  constructor() {
    this.gateways = new Map();
    this.initializeGateways();
  }

  /**
   * Inicializar gateways disponíveis
   */
  initializeGateways() {
    // Stripe Gateway
    if (process.env.STRIPE_SECRET_KEY) {
      const stripeGateway = new StripeGateway({
        secretKey: process.env.STRIPE_SECRET_KEY,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
      });
      this.gateways.set('stripe', stripeGateway);
    }

    // MercadoPago Gateway (exemplo para implementação futura)
    // if (process.env.MERCADOPAGO_ACCESS_TOKEN) {
    //   const mercadoPagoGateway = new MercadoPagoGateway({
    //     accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
    //     publicKey: process.env.MERCADOPAGO_PUBLIC_KEY
    //   });
    //   this.gateways.set('mercadopago', mercadoPagoGateway);
    // }
  }

  /**
   * Obter gateway por nome
   * @param {string} gatewayName - Nome do gateway
   * @returns {PaymentGateway} - Instância do gateway
   */
  getGateway(gatewayName) {
    const gateway = this.gateways.get(gatewayName.toLowerCase());
    if (!gateway) {
      throw new Error(`Gateway '${gatewayName}' não encontrado ou não configurado`);
    }
    return gateway;
  }

  /**
   * Listar gateways disponíveis
   * @returns {Array} - Lista de gateways disponíveis
   */
  getAvailableGateways() {
    return Array.from(this.gateways.keys());
  }

  /**
   * Verificar se um gateway está disponível
   * @param {string} gatewayName - Nome do gateway
   * @returns {boolean} - Se o gateway está disponível
   */
  isGatewayAvailable(gatewayName) {
    return this.gateways.has(gatewayName.toLowerCase());
  }
}

// Singleton instance
const gatewayFactory = new GatewayFactory();

module.exports = gatewayFactory;
