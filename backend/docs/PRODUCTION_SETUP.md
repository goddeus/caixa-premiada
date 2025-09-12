# 🚀 Configuração para Produção - VizzionPay

## 📋 Checklist de Produção

### 1. ✅ Configuração do Servidor

#### Variáveis de Ambiente (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/caixa_premiada"

# JWT
JWT_SECRET="sua_chave_secreta_muito_segura_para_producao"

# Server
PORT=3001
NODE_ENV=production

# CORS
CORS_ORIGIN="https://seudominio.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# VizzionPay Gateway - CHAVES REAIS
VIZZIONPAY_API_KEY="sua_api_key_real"
VIZZIONPAY_PUBLIC_KEY="sua_public_key_real"
VIZZIONPAY_BASE_URL="https://api.vizzionpay.com"
VIZZIONPAY_WEBHOOK_SECRET="seu_webhook_secret_real"

# Base URL para webhooks
BASE_URL="https://seudominio.com"
```

### 2. 🔐 Configuração SSL/HTTPS

#### Opção 1: Nginx + Let's Encrypt
```nginx
server {
    listen 80;
    server_name seudominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com;

    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
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

#### Opção 2: Cloudflare
1. Configure seu domínio no Cloudflare
2. Ative SSL/TLS (Full)
3. Configure proxy para seu servidor

### 3. 🔗 Configuração de Webhooks

#### URL do Webhook
```
https://seudominio.com/payments/webhook/vizzionpay
```

#### Headers Necessários
- `Content-Type: application/json`
- `X-VizzionPay-Signature: [assinatura_hmac_sha256]`

#### Eventos Suportados
- `payment.created` - Pagamento criado
- `payment.updated` - Status atualizado
- `payment.paid` - Pagamento confirmado
- `payment.expired` - Pagamento expirado
- `payment.cancelled` - Pagamento cancelado

### 4. 🐳 Deploy com Docker

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/caixa_premiada
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=caixa_premiada
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 5. 📊 Monitoramento

#### Health Check
```bash
curl https://seudominio.com/health
```

#### Logs
```bash
# Docker
docker logs -f container_name

# PM2
pm2 logs caixa-premiada

# Systemd
journalctl -u caixa-premiada -f
```

### 6. 🔒 Segurança

#### Firewall
```bash
# UFW
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable

# iptables
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -j DROP
```

#### Rate Limiting
- Configurado no Express
- 100 requisições por minuto por IP
- Ajustável via variáveis de ambiente

### 7. 🚀 Deploy Automático

#### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          ssh user@server 'cd /path/to/app && git pull && npm install && pm2 restart caixa-premiada'
```

### 8. 📈 Backup

#### Banco de Dados
```bash
# PostgreSQL
pg_dump -h localhost -U user caixa_premiada > backup_$(date +%Y%m%d_%H%M%S).sql

# Automatizar
0 2 * * * pg_dump -h localhost -U user caixa_premiada > /backups/backup_$(date +\%Y\%m\%d_\%H\%M\%S).sql
```

#### Arquivos
```bash
# Backup das imagens
tar -czf imagens_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/uploads/
```

### 9. 🧪 Testes de Produção

#### Teste de Webhook
```bash
curl -X POST https://seudominio.com/payments/test/webhook \
  -H "Content-Type: application/json" \
  -d '{"payment_id":"test_123","status":"paid"}'
```

#### Teste de PIX
```bash
curl -X POST https://seudominio.com/payments/deposit/pix \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"valor": 50.00}'
```

### 10. 📞 Suporte VizzionPay

- **Documentação**: https://docs.vizzionpay.com
- **Suporte**: suporte@vizzionpay.com
- **Status**: https://status.vizzionpay.com

## ✅ Checklist Final

- [ ] Chaves reais configuradas
- [ ] SSL/HTTPS ativo
- [ ] Webhook configurado
- [ ] Banco de dados em produção
- [ ] Monitoramento ativo
- [ ] Backup configurado
- [ ] Firewall configurado
- [ ] Testes realizados
- [ ] Documentação atualizada

**🎉 Sistema pronto para produção!**
