@echo off
echo 🧪 Testando API SalesCode Payments
echo ================================

echo.
echo 1. Health Check:
curl -s http://localhost:3000/api/v1/health | jq .

echo.
echo 2. Gateways disponíveis:
curl -s http://localhost:3000/api/v1/payments/gateways | jq .

echo.
echo 3. Testando pagamento (sem Stripe real):
curl -X POST http://localhost:3000/api/v1/payments ^
  -H "Content-Type: application/json" ^
  -d @tests/examples/payment.json | jq .

echo.
echo 4. Testando assinatura (sem Stripe real):
curl -X POST http://localhost:3000/api/v1/subscriptions ^
  -H "Content-Type: application/json" ^
  -d @tests/examples/subscription.json | jq .

echo.
echo ✅ Testes concluídos!
echo 📚 Documentação: http://localhost:3000/docs

pause
