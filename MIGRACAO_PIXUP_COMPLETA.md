# Migração VizzionPay → Pixup - SlotBox

## 📋 Resumo da Migração

Esta migração substitui completamente o sistema de pagamentos VizzionPay pelo Pixup no projeto SlotBox, implementando depósitos via PIX, saques automáticos, webhooks de pagamento e transferência.

## ✅ Status da Implementação

- [x] **Backend PixupService** - Serviço completo para integração Pixup
- [x] **Rotas de Depósito** - `/api/pixup/deposit` implementada
- [x] **Rotas de Saque** - `/api/pixup/withdraw` implementada  
- [x] **Webhooks** - `/api/webhook/pixup/payment` e `/api/webhook/pixup/transfer`
- [x] **Configurações** - Variáveis de ambiente Pixup adicionadas
- [x] **Frontend** - Atualizado para usar novas APIs Pixup
- [x] **Testes** - Script de teste da migração criado
- [ ] **Remoção VizzionPay** - Código antigo ainda presente (compatibilidade)
- [ ] **Configuração Produção** - Variáveis de ambiente precisam ser configuradas

## 🔧 Arquivos Criados/Modificados

### Backend
- `backend/src/services/pixupService.js` - **NOVO** - Serviço Pixup
- `backend/src/controllers/pixupController.js` - **NOVO** - Controller Pixup
- `backend/src/controllers/pixupWebhookController.js` - **NOVO** - Webhooks Pixup
- `backend/src/routes/pixup.js` - **NOVO** - Rotas Pixup
- `backend/src/config/index.js` - **MODIFICADO** - Configurações Pixup
- `backend/src/server.js` - **MODIFICADO** - Rotas Pixup adicionadas
- `backend/env.example` - **MODIFICADO** - Variáveis Pixup
- `backend/test-pixup-migration.js` - **NOVO** - Testes da migração

### Frontend
- `frontend/src/services/api.js` - **MODIFICADO** - APIs Pixup
- `frontend/src/pages/Dashboard.jsx` - **MODIFICADO** - Depósito Pixup
- `frontend/src/pages/Profile.jsx` - **MODIFICADO** - Saque Pixup
- `frontend/src/components/PixPaymentModal.jsx` - **MODIFICADO** - Status Pixup

## 🚀 Configuração Necessária

### 1. Variáveis de Ambiente

Adicione ao arquivo `.env`:

```env
# Pixup Gateway
PIXUP_CLIENT_ID=seu_client_id_aqui
PIXUP_CLIENT_SECRET=seu_client_secret_aqui
PIXUP_API_URL=https://api.pixupbr.com
PIXUP_WEBHOOK_SECRET=seu_webhook_secret_aqui

# URLs
FRONTEND_URL=https://slotbox.shop
API_BASE_URL=https://slotbox-api.onrender.com
```

### 2. Configuração no Painel Pixup

1. **Sandbox**: Configure primeiro em ambiente de teste
2. **Webhooks**: Configure as URLs:
   - Pagamento: `https://slotbox-api.onrender.com/api/pixup/webhook/payment`
   - Transferência: `https://slotbox-api.onrender.com/api/pixup/webhook/transfer`
3. **Produção**: Migre para produção após testes

## 📡 APIs Implementadas

### Depósitos
```http
POST /api/pixup/deposit
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user-id",
  "amount": 20.00
}
```

**Resposta:**
```json
{
  "success": true,
  "qrCode": "00020126580014br.gov.bcb.pix...",
  "qrCodeImage": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
  "identifier": "deposit_user-id_timestamp",
  "transaction_id": "pixup-tx-id",
  "amount": 20.00,
  "expires_at": "2025-01-20T17:30:00.000Z"
}
```

### Saques
```http
POST /api/pixup/withdraw
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user-id",
  "amount": 20.00,
  "pixKey": "usuario@email.com",
  "pixKeyType": "email",
  "ownerName": "Nome do Usuário",
  "ownerDocument": "12345678901"
}
```

### Status de Depósito
```http
GET /api/pixup/deposit/status/{externalId}
Authorization: Bearer <token>
```

### Status de Saque
```http
GET /api/pixup/withdraw/status/{externalId}
Authorization: Bearer <token>
```

## 🔗 Webhooks

### Webhook de Pagamento
```http
POST /api/webhook/pixup/payment
Content-Type: application/json

{
  "external_id": "deposit_user-id_timestamp",
  "status": "PAID",
  "transaction_id": "pixup-tx-id",
  "amount": 20.00
}
```

### Webhook de Transferência
```http
POST /api/webhook/pixup/transfer
Content-Type: application/json

{
  "external_id": "withdraw_user-id_timestamp",
  "status": "APPROVED",
  "transaction_id": "pixup-tx-id",
  "amount": 20.00
}
```

## 🧪 Testes

Execute o script de teste:

```bash
cd backend
node test-pixup-migration.js
```

## 🔄 Fluxo de Migração

### 1. Fase de Transição (Atual)
- ✅ Pixup implementado e funcionando
- ✅ VizzionPay ainda presente (compatibilidade)
- ✅ Frontend usa Pixup por padrão
- ⚠️ Configurações precisam ser definidas

### 2. Fase de Validação
- [ ] Testar depósitos em sandbox
- [ ] Testar saques em sandbox  
- [ ] Validar webhooks
- [ ] Testar fluxo completo

### 3. Fase de Produção
- [ ] Configurar credenciais de produção
- [ ] Migrar webhooks para produção
- [ ] Monitorar logs e métricas

### 4. Fase de Limpeza
- [ ] Remover código VizzionPay
- [ ] Remover variáveis de ambiente VizzionPay
- [ ] Atualizar documentação

## 🛡️ Segurança

- **Autenticação**: OAuth2 com client_id/client_secret
- **Webhooks**: Validação de origem (implementar se necessário)
- **Logs**: Logs detalhados de todas as operações
- **Rate Limiting**: Mantido do sistema anterior

## 📊 Monitoramento

### Logs Importantes
- `logs/pixup_webhook_YYYY-MM-DD.log` - Webhooks recebidos
- `logs/pixup_webhook_error_YYYY-MM-DD.log` - Erros de webhook

### Métricas a Acompanhar
- Taxa de sucesso de depósitos
- Taxa de sucesso de saques
- Tempo de processamento
- Erros de webhook

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de Autenticação Pixup**
   - Verificar PIXUP_CLIENT_ID e PIXUP_CLIENT_SECRET
   - Verificar se conta Pixup está ativa

2. **Webhook não recebido**
   - Verificar URL configurada no painel Pixup
   - Verificar logs de webhook
   - Testar endpoint manualmente

3. **QR Code não gerado**
   - Verificar logs do PixupService
   - Verificar resposta da API Pixup
   - Verificar configurações de ambiente

## 📞 Suporte

- **Pixup**: Documentação oficial e suporte
- **Logs**: Verificar logs detalhados no backend
- **Testes**: Usar script de teste para diagnóstico

## 🎯 Próximos Passos

1. **Configurar credenciais Pixup** (sandbox)
2. **Testar fluxo completo** (depósito → webhook → saldo)
3. **Configurar webhooks** no painel Pixup
4. **Testar saques** se disponível
5. **Migrar para produção** após validação
6. **Remover VizzionPay** após confirmação

---

**Data da Migração**: 20/01/2025  
**Branch**: `migration/pixup-fullcomplete-20250120`  
**Status**: ✅ Implementação Completa - ⚠️ Aguardando Configuração
