# 🚀 **COMANDOS PARA CONFIGURAÇÃO E TESTES EM PRODUÇÃO**

## 📋 **PASSO A PASSO COMPLETO**

### **1. 🔧 CONFIGURAR VARIÁVEIS DE AMBIENTE**

```bash
# 1. Copiar arquivo de exemplo
cp env.production.example .env.production

# 2. Editar com suas credenciais reais
nano .env.production
```

**Variáveis obrigatórias para VizzionPay:**
```bash
VIZZION_API_KEY=sua_api_key_real_aqui
VIZZION_PUBLIC_KEY=sua_public_key_real_aqui  
VIZZION_SECRET_KEY=sua_secret_key_real_aqui
VIZZION_WEBHOOK_SECRET=sua_webhook_secret_real_aqui
VIZZION_PIX_KEY=sua_chave_pix@slotbox.shop
VIZZION_PIX_KEY_TYPE=email
```

### **2. 🧪 TESTAR VIZZIONPAY**

```bash
# Testar conectividade e endpoints
node scripts/test-vizzionpay-production.js

# Verificar configuração de deploy
node scripts/production-deploy.js
```

### **3. 🚀 DEPLOY EM PRODUÇÃO**

```bash
# Verificar se tudo está pronto
node scripts/production-deploy.js

# Fazer deploy (Render.com)
git add .
git commit -m "Deploy: Sistema de saque VizzionPay"
git push origin main
```

### **4. 📊 MONITORAR EM PRODUÇÃO**

```bash
# Verificar logs
tail -f logs/app.log

# Testar endpoint de saúde
curl https://slotbox-api.onrender.com/api/health

# Testar saque (valor baixo)
curl -X POST https://slotbox-api.onrender.com/api/withdraw/pix \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1.00,
    "pixKey": "teste@exemplo.com",
    "pixKeyType": "email"
  }'
```

## 🔑 **OBTER CREDENCIAIS VIZZIONPAY**

### **1. Acessar Painel VizzionPay**
- URL: https://vizzionpay.com
- Login com suas credenciais
- Ir para "Configurações" → "API"

### **2. Gerar Chaves**
- **API Key**: Chave principal para autenticação
- **Public Key**: Chave pública para identificação
- **Secret Key**: Chave secreta para assinatura
- **Webhook Secret**: Para validar webhooks

### **3. Configurar Webhook**
- URL: `https://slotbox-api.onrender.com/api/webhook/vizzionpay`
- Eventos: `withdraw.completed`, `withdraw.failed`

## 🧪 **TESTES RECOMENDADOS**

### **1. Teste de Conectividade**
```bash
# Verificar se API está respondendo
curl -X GET "https://api.vizzionpay.com/v1/status" \
  -H "Authorization: Bearer SUA_API_KEY"
```

### **2. Teste de Saque (R$ 1,00)**
```bash
# Teste com valor mínimo
curl -X POST "https://api.vizzionpay.com/v1/pix/transfer" \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1.00,
    "pixKey": "teste@exemplo.com",
    "pixKeyType": "email"
  }'
```

### **3. Teste de Webhook**
```bash
# Simular webhook de retorno
curl -X POST "https://slotbox-api.onrender.com/api/webhook/vizzionpay" \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test_withdraw_123",
    "status": "completed",
    "transactionId": "vizzion_123"
  }'
```

## 📊 **MONITORAMENTO**

### **1. Logs Importantes**
```bash
# Logs de saque
grep "WITHDRAW" logs/app.log

# Logs de erro
grep "ERROR" logs/app.log

# Logs VizzionPay
grep "VIZZION" logs/app.log
```

### **2. Métricas a Acompanhar**
- Taxa de sucesso dos saques
- Tempo de resposta da VizzionPay
- Erros por endpoint
- Volume de transações

## 🚨 **PLANO DE CONTINGÊNCIA**

### **1. VizzionPay Indisponível**
- Sistema já tem fallback implementado
- Saques ficam como "processando"
- Processar manualmente depois

### **2. Erro de Configuração**
- Verificar logs: `tail -f logs/app.log`
- Testar endpoints: `node scripts/test-vizzionpay-production.js`
- Reconfigurar variáveis de ambiente

### **3. Problemas de Webhook**
- Verificar URL do webhook
- Testar manualmente
- Verificar assinatura

## 📞 **SUPORTE**

### **VizzionPay**
- Email: suporte@vizzionpay.com
- Documentação: https://docs.vizzionpay.com
- Status: https://status.vizzionpay.com

### **Sistema Slotbox**
- Logs: `logs/app.log`
- Health check: `/api/health`
- Admin panel: `/admin`

## ✅ **CHECKLIST FINAL**

- [ ] Credenciais VizzionPay configuradas
- [ ] Variáveis de ambiente definidas
- [ ] Testes de conectividade realizados
- [ ] Webhooks configurados
- [ ] Deploy realizado
- [ ] Testes em produção executados
- [ ] Monitoramento ativo
- [ ] Equipe treinada

---

**🎉 Sistema pronto para produção!**
