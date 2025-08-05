# SalesCode Payments API

API de pagamentos desenvolvida com Fastify para integração com múltiplos gateways de pagamento de forma dinâmica e escalável.

## 🚀 Características

- **Arquitetura modular**: Fácil adição de novos gateways de pagamento
- **Documentação automática**: Swagger/OpenAPI integrado
- **Suporte a múltiplos gateways**: Stripe (implementado), MercadoPago (template)
- **Pagamentos únicos e assinaturas**: Suporte completo a ambos os tipos
- **Configuração via variáveis de ambiente**: Seguro e flexível
- **API RESTful**: Endpoints bem definidos e documentados

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn
- Conta no Stripe (para gateway de pagamentos)

## 🛠️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd salescode.payments
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` com suas credenciais:
```env
# Environment Variables
NODE_ENV=development
PORT=3000

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# API Configuration
API_HOST=0.0.0.0
API_BASE_URL=http://localhost:3000
```

## 🚀 Execução

### Desenvolvimento
```bash
# Primeiro execute o setup (apenas uma vez)
npm run setup

# Em seguida, inicie o servidor
npm run dev
```

### Teste rápido
```bash
# Testar se o servidor inicia corretamente
npm run test-server
```

### Produção
```bash
npm start
```

A API estará disponível em `http://localhost:3000`

## 📚 Documentação

Após iniciar o servidor, acesse a documentação interativa em:
- **Swagger UI**: `http://localhost:3000/docs`

## 📖 Endpoints Principais

### Health Check
- `GET /api/v1/health` - Verificar status da API

### Pagamentos
- `POST /api/v1/payments` - Criar pagamento único
- `GET /api/v1/payments/:paymentId/status` - Verificar status do pagamento
- `GET /api/v1/payments/gateways` - Listar gateways disponíveis

### Assinaturas
- `POST /api/v1/subscriptions` - Criar assinatura
- `PUT /api/v1/subscriptions/:subscriptionId/cancel` - Cancelar assinatura
- `GET /api/v1/subscriptions/gateways` - Listar gateways disponíveis

## 💳 Exemplos de Uso

### Criar Pagamento Único (Stripe)

```bash
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "stripe",
    "amount": 99.90,
    "currency": "brl",
    "description": "Pagamento do produto XYZ",
    "customerEmail": "cliente@exemplo.com",
    "metadata": {
      "orderId": "12345",
      "userId": "user123"
    }
  }'
```

### Criar Assinatura (Stripe)

```bash
curl -X POST http://localhost:3000/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "stripe",
    "amount": 29.90,
    "currency": "brl",
    "interval": "month",
    "productName": "Plano Premium",
    "description": "Acesso completo ao sistema",
    "customerEmail": "cliente@exemplo.com",
    "trialPeriodDays": 7
  }'
```

### Usando arquivos JSON

```bash
# Pagamento usando arquivo
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Content-Type: application/json" \
  -d @tests/examples/payment.json

# Assinatura usando arquivo
curl -X POST http://localhost:3000/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -d @tests/examples/subscription.json
```

## 🔧 Adicionando Novos Gateways

Para adicionar um novo gateway de pagamento:

1. Crie uma nova classe que estenda `PaymentGateway`:

```javascript
// src/gateways/NovoGateway.js
const PaymentGateway = require('./PaymentGateway');

class NovoGateway extends PaymentGateway {
  constructor(config) {
    super(config);
    // Inicializar SDK do gateway
  }

  async createPayment(paymentData) {
    // Implementar criação de pagamento
  }

  async createSubscription(subscriptionData) {
    // Implementar criação de assinatura
  }

  // ... outros métodos obrigatórios
}

module.exports = NovoGateway;
```

2. Registre o gateway no `GatewayFactory.js`:

```javascript
// src/gateways/GatewayFactory.js
const NovoGateway = require('./NovoGateway');

// No método initializeGateways()
if (process.env.NOVO_GATEWAY_API_KEY) {
  const novoGateway = new NovoGateway({
    apiKey: process.env.NOVO_GATEWAY_API_KEY
  });
  this.gateways.set('novo_gateway', novoGateway);
}
```

3. Adicione as variáveis de ambiente necessárias no `.env`.

## 🏗️ Estrutura do Projeto

```
src/
├── server.js              # Servidor principal
├── routes/                # Rotas da API
│   ├── health.js          # Health check
│   ├── payments.js        # Endpoints de pagamentos
│   └── subscriptions.js   # Endpoints de assinaturas
└── gateways/              # Gateways de pagamento
    ├── PaymentGateway.js  # Classe base abstrata
    ├── StripeGateway.js   # Implementação Stripe
    ├── MercadoPagoGateway.js # Template MercadoPago
    └── GatewayFactory.js  # Factory para gateways
```

## 🔒 Segurança

- Todas as credenciais devem ser configuradas via variáveis de ambiente
- Nunca commite o arquivo `.env` no repositório
- Use HTTPS em produção
- Implemente validação de webhooks para cada gateway

## 🧪 Testes

```bash
npm test
```

## 📝 Logs

A aplicação usa o sistema de logs do Fastify. Em produção, configure um sistema de logs adequado.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Se você encontrar algum problema ou tiver dúvidas:

1. Verifique a [documentação](#-documentação)
2. Consulte os [exemplos de uso](#-exemplos-de-uso)
3. Abra uma [issue](issues) no GitHub

## 🔄 Changelog

### v1.0.0
- Implementação inicial
- Suporte ao Stripe
- Documentação Swagger
- Arquitetura modular para gateways
- Endpoints para pagamentos e assinaturas
