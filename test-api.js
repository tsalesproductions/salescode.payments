#!/usr/bin/env node

const axios = require('axios').default;

async function testAPI() {
  console.log('🧪 Testando SalesCode Payments API');
  console.log('===================================\n');

  const baseURL = 'http://localhost:3000/api/v1';

  try {
    // 1. Health Check
    console.log('1. 🔍 Health Check...');
    const health = await axios.get(`${baseURL}/health`);
    console.log('✅ Status:', health.data.status);
    console.log('🔧 Gateways:', health.data.gateways.join(', '));

    // 2. Test Payment
    console.log('\n2. 💳 Testando criação de pagamento...');
    const paymentData = {
      gateway: 'stripe',
      amount: 99.90,
      currency: 'brl',
      description: 'Teste de pagamento',
      customerEmail: 'teste@exemplo.com',
      metadata: { test: true }
    };

    try {
      const payment = await axios.post(`${baseURL}/payments`, paymentData);
      if (payment.data.success) {
        console.log('✅ Pagamento criado:', payment.data.paymentId);
        console.log('🔗 URL checkout:', payment.data.checkoutUrl);
      } else {
        console.log('❌ Erro:', payment.data.error);
      }
    } catch (err) {
      if (err.response) {
        console.log('❌ Erro de validação:', err.response.data.message || err.response.data.error);
      } else {
        console.log('❌ Erro de conexão:', err.message);
      }
    }

    // 3. Test Subscription
    console.log('\n3. 🔄 Testando criação de assinatura...');
    const subscriptionData = {
      gateway: 'stripe',
      amount: 29.90,
      currency: 'brl',
      interval: 'month',
      productName: 'Plano Teste',
      description: 'Teste de assinatura',
      customerEmail: 'teste@exemplo.com',
      metadata: { test: true }
    };

    try {
      const subscription = await axios.post(`${baseURL}/subscriptions`, subscriptionData);
      if (subscription.data.success) {
        console.log('✅ Assinatura criada:', subscription.data.subscriptionId);
        console.log('🔗 URL checkout:', subscription.data.checkoutUrl);
      } else {
        console.log('❌ Erro:', subscription.data.error);
      }
    } catch (err) {
      if (err.response) {
        console.log('❌ Erro de validação:', err.response.data.message || err.response.data.error);
      } else {
        console.log('❌ Erro de conexão:', err.message);
      }
    }

    console.log('\n✅ Testes concluídos!');
    console.log('📚 Documentação: http://localhost:3000/docs');

  } catch (error) {
    console.log('❌ Erro ao conectar com a API:', error.message);
    console.log('💡 Certifique-se de que o servidor está rodando: npm run dev');
  }
}

testAPI();
