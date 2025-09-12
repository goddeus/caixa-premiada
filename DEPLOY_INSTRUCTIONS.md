# 🚀 INSTRUÇÕES DE DEPLOY - CAIXA PREMIADA

## 📋 CHECKLIST PRÉ-DEPLOY

### ✅ 1. BACKEND (Render.com)
- [ ] Criar conta no Render.com
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente
- [ ] Configurar banco PostgreSQL
- [ ] Deploy do backend

### ✅ 2. FRONTEND (Hostinger)
- [ ] Criar conta no Hostinger
- [ ] Configurar domínio slotbox.shop
- [ ] Upload dos arquivos do frontend
- [ ] Configurar SSL

### ✅ 3. BANCO DE DADOS
- [ ] Configurar PostgreSQL no Render
- [ ] Executar migrações do Prisma
- [ ] Criar contas essenciais

### ✅ 4. PAGAMENTOS
- [ ] Configurar VizzionPay
- [ ] Configurar webhooks
- [ ] Testar pagamentos

---

## 🔧 CONFIGURAÇÃO DO BACKEND (Render.com)

### 1. Criar Novo Serviço Web
```bash
# Conectar repositório GitHub
# Branch: main
# Root Directory: backend
# Build Command: npm install && npx prisma generate && npx prisma db push
# Start Command: npm start
```

### 2. Variáveis de Ambiente
```env
NODE_ENV=production
PORT=65002
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=chave_super_secreta_2024
FRONTEND_URL=https://slotbox.shop
API_BASE_URL=https://slotbox-api.onrender.com
VIZZIONPAY_API_KEY=sua_api_key_real
VIZZIONPAY_BASE_URL=https://api.vizzionpay.com.br
VIZZIONPAY_WEBHOOK_SECRET=seu_webhook_secret
VIZZIONPAY_PIX_KEY=seu_pix_key
VIZZIONPAY_PIX_KEY_TYPE=email
```

### 3. Banco de Dados PostgreSQL
```bash
# Criar banco PostgreSQL no Render
# Nome: slotbox-db
# Plano: Free
```

---

## 🌐 CONFIGURAÇÃO DO FRONTEND (Hostinger)

### 1. Upload dos Arquivos
```bash
# Executar script de deploy
./deploy-production.bat

# Upload da pasta 'deploy-files' para o Hostinger
# Via File Manager ou FTP
```

### 2. Configuração do .htaccess
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]
```

### 3. Configuração do Domínio
```bash
# Configurar DNS
# A Record: @ -> IP do Hostinger
# CNAME: www -> slotbox.shop
```

---

## 💳 CONFIGURAÇÃO DO VIZZIONPAY

### 1. Criar Conta
- [ ] Acessar https://vizzionpay.com.br
- [ ] Criar conta de desenvolvedor
- [ ] Configurar dados da empresa

### 2. Configurar Webhooks
```bash
# URL do Webhook: https://slotbox-api.onrender.com/api/payments/deposit/callback
# Eventos: payment.approved, payment.rejected
```

### 3. Configurar PIX
```bash
# Chave PIX: seu_email@exemplo.com
# Tipo: email
# Valor mínimo: R$ 20,00
```

---

## 🧪 TESTES PÓS-DEPLOY

### 1. Teste de Conectividade
```bash
# Health Check
curl https://slotbox-api.onrender.com/api/health

# Frontend
curl https://slotbox.shop
```

### 2. Teste de Autenticação
- [ ] Registro de usuário
- [ ] Login
- [ ] Logout

### 3. Teste de Pagamentos
- [ ] Criar depósito
- [ ] Simular aprovação
- [ ] Verificar saldo

### 4. Teste de Caixas
- [ ] Listar caixas
- [ ] Comprar caixa
- [ ] Verificar sorteio

---

## 🚨 TROUBLESHOOTING

### Erro 500 no Backend
```bash
# Verificar logs no Render
# Verificar variáveis de ambiente
# Verificar conexão com banco
```

### Erro 404 no Frontend
```bash
# Verificar .htaccess
# Verificar upload dos arquivos
# Verificar configuração do domínio
```

### Erro de CORS
```bash
# Verificar FRONTEND_URL no backend
# Verificar CORS_ORIGIN
```

---

## 📞 SUPORTE

- **Backend**: Render.com Dashboard
- **Frontend**: Hostinger File Manager
- **Banco**: Render PostgreSQL
- **Pagamentos**: VizzionPay Dashboard

---

## 🎉 DEPLOY FINALIZADO!

Após seguir todos os passos, seu sistema estará online em:
- **Frontend**: https://slotbox.shop
- **Backend**: https://slotbox-api.onrender.com
- **Admin**: https://slotbox.shop/admin
