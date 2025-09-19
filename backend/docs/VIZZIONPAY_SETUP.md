# 🔧 Configuração da VizzionPay para Produção

## 📋 **PRÉ-REQUISITOS**

1. **Conta VizzionPay Ativa**
   - Acesse: https://vizzionpay.com
   - Crie uma conta de comerciante
   - Complete a verificação de documentos

2. **Credenciais de API**
   - API Key (Chave de API)
   - Public Key (Chave Pública)
   - Secret Key (Chave Secreta)
   - Webhook Secret (Chave do Webhook)

## 🔑 **CONFIGURAÇÃO DAS VARIÁVEIS DE AMBIENTE**

### **1. Arquivo `.env.production`**

```bash
# VizzionPay Configuration - PRODUÇÃO
VIZZION_API_KEY=sua_api_key_real_aqui
VIZZION_PUBLIC_KEY=sua_public_key_real_aqui
VIZZION_SECRET_KEY=sua_secret_key_real_aqui
VIZZION_WEBHOOK_SECRET=sua_webhook_secret_real_aqui

# URLs da VizzionPay
VIZZION_BASE_URL=https://api.vizzionpay.com
VIZZION_WEBHOOK_URL=https://slotbox-api.onrender.com/api/webhook/vizzionpay

# Configurações PIX
VIZZION_PIX_KEY=sua_chave_pix@slotbox.shop
VIZZION_PIX_KEY_TYPE=email
```

### **2. Verificar Endpoints Disponíveis**

A VizzionPay pode usar diferentes endpoints. Teste estes:

```javascript
// Endpoints para testar:
const endpoints = [
  'https://api.vizzionpay.com/v1/pix/transfer',
  'https://api.vizzionpay.com/v1/pix/payout',
  'https://api.vizzionpay.com/v1/gateway/pix/transfer',
  'https://api.vizzionpay.com/v1/gateway/pix/payout',
  'https://app.vizzionpay.com/api/v1/pix/transfer',
  'https://app.vizzionpay.com/api/v1/pix/payout'
];
```

## 🧪 **TESTES EM PRODUÇÃO**

### **1. Teste de Conectividade**

```bash
# Testar conexão com VizzionPay
curl -X GET "https://api.vizzionpay.com/v1/status" \
  -H "Authorization: Bearer SUA_API_KEY" \
  -H "Content-Type: application/json"
```

### **2. Teste de Saque (Valor Baixo)**

```javascript
// Dados de teste
const testData = {
  identifier: "test_withdraw_" + Date.now(),
  amount: 1.00, // R$ 1,00 para teste
  pixKey: "teste@exemplo.com",
  pixKeyType: "email",
  client: {
    name: "Teste Slotbox",
    document: "12345678901",
    email: "teste@slotbox.shop"
  }
};
```

### **3. Monitoramento de Logs**

```bash
# Acompanhar logs em tempo real
tail -f logs/vizzionpay.log

# Verificar status das transações
grep "WITHDRAW" logs/app.log
```

## 🔒 **SEGURANÇA**

### **1. Validação de Webhooks**

```javascript
// Verificar assinatura do webhook
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}
```

### **2. Rate Limiting**

```javascript
// Limitar tentativas de saque
const rateLimit = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutos
  message: 'Muitas tentativas de saque. Tente novamente em 15 minutos.'
};
```

## 📊 **MONITORAMENTO**

### **1. Métricas Importantes**

- Taxa de sucesso dos saques
- Tempo médio de processamento
- Erros por endpoint
- Volume de transações

### **2. Alertas**

```javascript
// Configurar alertas para:
- Falha em > 5% dos saques
- Tempo de resposta > 30 segundos
- Erro 500 da VizzionPay
- Saldo insuficiente
```

## 🚨 **PLANO DE CONTINGÊNCIA**

### **1. VizzionPay Indisponível**

```javascript
// Sistema de fallback já implementado
if (vizzionPayUnavailable) {
  // 1. Simular resposta de sucesso
  // 2. Marcar como "processando"
  // 3. Processar manualmente depois
  // 4. Notificar administradores
}
```

### **2. Processamento Manual**

```javascript
// Para casos de emergência
const manualProcess = {
  status: 'manual_review',
  requiresApproval: true,
  adminNotification: true
};
```

## 📞 **SUPORTE VIZZIONPAY**

- **Email**: suporte@vizzionpay.com
- **Telefone**: (11) 99999-9999
- **Documentação**: https://docs.vizzionpay.com
- **Status**: https://status.vizzionpay.com

## ✅ **CHECKLIST DE PRODUÇÃO**

- [ ] Credenciais de produção configuradas
- [ ] Endpoints testados e funcionando
- [ ] Webhooks configurados
- [ ] Monitoramento ativo
- [ ] Plano de contingência implementado
- [ ] Testes com valores baixos realizados
- [ ] Documentação atualizada
- [ ] Equipe treinada

## 🔄 **ATUALIZAÇÕES**

Este documento deve ser atualizado sempre que:
- Novos endpoints forem disponibilizados
- Mudanças na API da VizzionPay
- Novos recursos de segurança
- Alterações no sistema de saques
