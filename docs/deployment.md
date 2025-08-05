# Deployment Guide

Este guia explica como fazer o deploy da SalesCode Payments API em diferentes ambientes.

## 🚀 Deploy em Produção

### Preparação

1. **Configure as variáveis de ambiente de produção**:
```bash
# Copie o arquivo de exemplo
cp .env.example .env.production

# Edite com credenciais reais
nano .env.production
```

2. **Variáveis obrigatórias para produção**:
```env
NODE_ENV=production
PORT=3000
STRIPE_SECRET_KEY=sk_live_...  # Chave LIVE do Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
API_BASE_URL=https://seudominio.com
JWT_SECRET=sua_chave_secreta_super_forte_aqui
```

### Deploy com Docker

1. **Build da imagem**:
```bash
docker build -t salescode-payments .
```

2. **Executar com Docker Compose**:
```bash
docker-compose up -d
```

### Deploy em VPS/Servidor

1. **Instalar dependências**:
```bash
npm ci --only=production
```

2. **Usar PM2 para gerenciamento de processo**:
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar arquivo de configuração
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'salescode-payments',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_file: '.env.production',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Deploy na Vercel

1. **Instalar Vercel CLI**:
```bash
npm i -g vercel
```

2. **Configurar vercel.json**:
```json
{
  "version": 2,
  "name": "salescode-payments",
  "builds": [
    {
      "src": "src/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

3. **Deploy**:
```bash
vercel --prod
```

### Deploy no Heroku

1. **Criar Procfile**:
```
web: node src/server.js
```

2. **Deploy**:
```bash
heroku create salescode-payments
heroku config:set NODE_ENV=production
heroku config:set STRIPE_SECRET_KEY=sk_live_...
# ... outras variáveis
git push heroku main
```

## 🔒 Configurações de Segurança

### HTTPS
- **Sempre use HTTPS em produção**
- Configure certificado SSL/TLS
- Use um proxy reverso (Nginx) se necessário

### Firewall
```bash
# Permitir apenas portas necessárias
ufw allow 22    # SSH
ufw allow 80    # HTTP (redirect para HTTPS)
ufw allow 443   # HTTPS
ufw enable
```

### Nginx como Proxy Reverso
```nginx
server {
    listen 80;
    server_name seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name seudominio.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoramento

### Health Check
- Configure monitoramento no endpoint `/api/v1/health`
- Use ferramentas como UptimeRobot, Pingdom, etc.

### Logs
```bash
# Configurar logrotate para logs do PM2
sudo nano /etc/logrotate.d/pm2

# Conteúdo:
/home/usuario/app/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 0644 usuario usuario
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Backup
- Backup regular das configurações
- Backup das chaves de API
- Documentar procedimentos de recuperação

## 🔧 Configuração de Webhooks

### Stripe
1. Acesse o Dashboard do Stripe
2. Vá em "Developers" > "Webhooks"
3. Adicione endpoint: `https://seudominio.com/api/v1/webhooks/stripe`
4. Selecione eventos relevantes:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`

### Testando Webhooks
```bash
# Use Stripe CLI para testar localmente
stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe
```

## 📈 Escalabilidade

### Load Balancer
- Use multiple instâncias da aplicação
- Configure load balancer (Nginx, HAProxy, ou cloud provider)

### Cache
- Implemente cache para consultas frequentes
- Use Redis para cache distribuído

### Database
- Configure banco de dados para logs/histórico
- Implemente backup automático

## 🚨 Troubleshooting

### Logs Importantes
```bash
# Logs do PM2
pm2 logs salescode-payments

# Logs do sistema
sudo journalctl -u salescode-payments

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
```

### Problemas Comuns

1. **Erro de certificado SSL**:
   - Verifique se os certificados estão corretos
   - Teste com `openssl s_client -connect seudominio.com:443`

2. **Webhook não funciona**:
   - Verifique se a URL está acessível externamente
   - Teste a validação da assinatura

3. **Alta latência**:
   - Verifique conexão com APIs dos gateways
   - Analise logs de performance

4. **Erro de memória**:
   - Aumente recursos do servidor
   - Configure limits no PM2

## 📞 Suporte

Para questões específicas de deploy:
1. Verifique a documentação do provedor
2. Consulte os logs da aplicação
3. Teste endpoints individualmente
4. Valide configuração de webhooks
