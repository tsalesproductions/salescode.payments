/**
 * Interface base para gateways de pagamento
 * Todos os gateways devem implementar esta interface
 */
class PaymentGateway {
  constructor(config) {
    this.config = config;
    this.name = this.constructor.name.toLowerCase().replace('gateway', '');
  }

  /**
   * Criar um pagamento único
   * @param {Object} paymentData - Dados do pagamento
   * @returns {Object} - Resultado do pagamento
   */
  async createPayment(paymentData) {
    throw new Error('createPayment method must be implemented');
  }

  /**
   * Criar uma assinatura
   * @param {Object} subscriptionData - Dados da assinatura
   * @returns {Object} - Resultado da assinatura
   */
  async createSubscription(subscriptionData) {
    throw new Error('createSubscription method must be implemented');
  }

  /**
   * Verificar status de pagamento
   * @param {string} paymentId - ID do pagamento
   * @returns {Object} - Status do pagamento
   */
  async getPaymentStatus(paymentId) {
    throw new Error('getPaymentStatus method must be implemented');
  }

  /**
   * Cancelar assinatura
   * @param {string} subscriptionId - ID da assinatura
   * @returns {Object} - Resultado do cancelamento
   */
  async cancelSubscription(subscriptionId) {
    throw new Error('cancelSubscription method must be implemented');
  }

  /**
   * Validar webhook
   * @param {Object} payload - Payload do webhook
   * @param {string} signature - Assinatura do webhook
   * @returns {boolean} - Se o webhook é válido
   */
  async validateWebhook(payload, signature) {
    throw new Error('validateWebhook method must be implemented');
  }
}

module.exports = PaymentGateway;
