#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 SalesCode Payments API - Setup');
console.log('==================================\n');

// Verificar se o .env existe
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');

if (!fs.existsSync(envPath)) {
  console.log('📋 Criando arquivo .env...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Arquivo .env criado com base no .env.example');
  } else {
    // Criar .env básico
    const envContent = `# Environment Variables
NODE_ENV=development
PORT=3000

# Stripe Configuration (CONFIGURE SUAS CREDENCIAIS AQUI)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# API Configuration
API_HOST=0.0.0.0
API_BASE_URL=http://localhost:3000

# Security
JWT_SECRET=your_jwt_secret_here
`;
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Arquivo .env criado');
  }
} else {
  console.log('ℹ️  Arquivo .env já existe');
}

console.log('\n🔧 Próximos passos:');
console.log('1. Edite o arquivo .env com suas credenciais do Stripe');
console.log('2. Execute: npm run test-server (para testar)');
console.log('3. Execute: npm run dev (para desenvolvimento)');
console.log('4. Acesse: http://localhost:3000/docs (documentação)');

console.log('\n💡 Dicas:');
console.log('- Obtenha suas chaves do Stripe em: https://dashboard.stripe.com/apikeys');
console.log('- Use chaves de TESTE (sk_test_...) para desenvolvimento');
console.log('- Configure webhooks em: https://dashboard.stripe.com/webhooks');

console.log('\n✨ Setup concluído com sucesso!');

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function setup() {
  console.log('🚀 Configuração inicial da SalesCode Payments API\n');

  try {
    // Verificar se .env já existe
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
      const overwrite = await question('Arquivo .env já existe. Deseja sobrescrever? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Configuração cancelada.');
        rl.close();
        return;
      }
    }

    console.log('Configurando Stripe...');
    const stripeSecretKey = await question('Stripe Secret Key (sk_test_...): ');
    const stripePublishableKey = await question('Stripe Publishable Key (pk_test_...): ');
    const stripeWebhookSecret = await question('Stripe Webhook Secret (opcional): ');

    const port = await question('Porta do servidor (3000): ') || '3000';
    const baseUrl = await question(`URL base (http://localhost:${port}): `) || `http://localhost:${port}`;

    // Criar arquivo .env
    const envContent = `# Environment Variables
NODE_ENV=development
PORT=${port}

# Stripe Configuration
STRIPE_SECRET_KEY=${stripeSecretKey}
STRIPE_PUBLISHABLE_KEY=${stripePublishableKey}
STRIPE_WEBHOOK_SECRET=${stripeWebhookSecret}

# API Configuration
API_HOST=0.0.0.0
API_BASE_URL=${baseUrl}

# Security
JWT_SECRET=${generateRandomString(32)}

# MercadoPago Configuration (para futuro uso)
# MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token_here
# MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key_here
`;

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Arquivo .env criado com sucesso!');

    console.log('\n📝 Próximos passos:');
    console.log('1. Execute: npm install');
    console.log('2. Execute: npm run dev');
    console.log(`3. Acesse: ${baseUrl}/docs para ver a documentação`);
    console.log('\n🎉 Configuração concluída!');

  } catch (error) {
    console.error('❌ Erro durante a configuração:', error.message);
  }

  rl.close();
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

if (require.main === module) {
  setup();
}

module.exports = { setup };
