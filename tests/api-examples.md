# Scripts de Teste da API

Este arquivo contém exemplos de como testar a API usando curl ou outras ferramentas.

## Health Check

```bash
curl -X GET http://localhost:3000/api/v1/health
```

## Listar Gateways Disponíveis

```bash
curl -X GET http://localhost:3000/api/v1/payments/gateways
```

## Criar Pagamento Único (Stripe)

```bash
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "stripe",
    "amount": 99.90,
    "currency": "brl",
    "description": "Teste de pagamento",
    "customerEmail": "teste@exemplo.com",
    "metadata": {
      "orderId": "test123"
    }
  }'
```

## Criar Assinatura (Stripe)

```bash
curl -X POST http://localhost:3000/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "stripe",
    "amount": 29.90,
    "currency": "brl",
    "interval": "month",
    "productName": "Plano Teste",
    "description": "Assinatura de teste",
    "customerEmail": "teste@exemplo.com",
    "trialPeriodDays": 7
  }'
```

## Verificar Status de Pagamento

```bash
# Substitua PAYMENT_ID pelo ID retornado na criação do pagamento
curl -X GET "http://localhost:3000/api/v1/payments/PAYMENT_ID/status?gateway=stripe"
```

## Cancelar Assinatura

```bash
# Substitua SUBSCRIPTION_ID pelo ID da assinatura
curl -X PUT "http://localhost:3000/api/v1/subscriptions/SUBSCRIPTION_ID/cancel?gateway=stripe"
```

## Usando arquivo JSON para testes

Você também pode salvar os payloads em arquivos JSON e usar com curl:

### payment.json
```json
{
  "gateway": "stripe",
  "amount": 199.90,
  "currency": "brl",
  "description": "Produto Premium",
  "customerEmail": "cliente@exemplo.com",
  "successUrl": "https://meusite.com/sucesso",
  "cancelUrl": "https://meusite.com/cancelado",
  "metadata": {
    "orderId": "ORDER-12345",
    "userId": "USER-789"
  }
}
```

```bash
curl -X POST http://localhost:3000/api/v1/payments \
  -H "Content-Type: application/json" \
  -d @payment.json
```

### subscription.json
```json
{
  "gateway": "stripe",
  "amount": 49.90,
  "currency": "brl",
  "interval": "month",
  "intervalCount": 1,
  "productName": "Plano Profissional",
  "description": "Acesso completo à plataforma",
  "customerEmail": "cliente@exemplo.com",
  "trialPeriodDays": 14,
  "metadata": {
    "planId": "PLAN-PRO",
    "userId": "USER-789"
  }
}
```

```bash
curl -X POST http://localhost:3000/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -d @subscription.json
```
