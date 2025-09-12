# 🤝 SISTEMA DE AFILIADOS - EXPLICAÇÃO COMPLETA

## 🎯 COMO FUNCIONA

### 1. **CRIAÇÃO DE AFILIADO**
- Qualquer usuário pode se tornar afiliado
- Gera código único automaticamente (ex: `JOAO1234`)
- Acesso via `/api/affiliate/create`

### 2. **INDICAÇÃO DE NOVOS USUÁRIOS**
- Novo usuário se registra com código do afiliado
- Campo `codigo_indicacao_usado` é preenchido
- Relacionamento criado na tabela `affiliate_history`

### 3. **COMISSÃO AUTOMÁTICA** 
**⚡ TRIGGER: Primeiro depósito ≥ R$ 20,00**

#### **Quando acontece:**
- ✅ Usuário indicado faz **primeiro depósito**
- ✅ Valor ≥ **R$ 20,00**
- ✅ Depósito **confirmado** (status: 'concluido')

#### **O que acontece automaticamente:**
1. **✅ R$ 10,00** creditados no `saldo_reais` do afiliado
2. **✅ Wallet** do afiliado atualizada
3. **✅ Registro** na tabela `affiliate_commissions`
4. **✅ Transação** registrada no histórico
5. **✅ Saldo disponível** para saque atualizado

### 4. **ESTRUTURA DE DADOS**

#### **Tabela `affiliates`:**
```sql
- id: UUID do afiliado
- user_id: ID do usuário afiliado
- codigo_indicacao: Código único (ex: JOAO1234)
- ganhos: Total ganho em comissões
- saldo_disponivel: Saldo disponível para saque
- total_sacado: Total já sacado
```

#### **Tabela `affiliate_commissions`:**
```sql
- affiliate_id: ID do afiliado
- referred_user_id: ID do usuário indicado
- valor: 10.00 (fixo)
- status: 'creditado'
- criado_em: Data da comissão
```

### 5. **FLUXO COMPLETO**

```
👤 João se torna afiliado
    ↓ (gera código JOAO1234)
    
👥 Maria se registra com código JOAO1234
    ↓ (campo codigo_indicacao_usado = JOAO1234)
    
💰 Maria deposita R$ 25,00
    ↓ (primeiro depósito ≥ R$ 20)
    
🎉 AUTOMÁTICO:
    ✅ João recebe R$ 10,00 no saldo_reais
    ✅ Pode sacar imediatamente
    ✅ Histórico registrado
```

## 📊 ENDPOINTS DISPONÍVEIS

### **Para Afiliados:**
- `POST /api/affiliate/create` - Criar conta afiliado
- `GET /api/affiliate/me` - Dados do afiliado
- `GET /api/affiliate/stats` - Estatísticas
- `GET /api/affiliate/referrals` - Indicados
- `GET /api/affiliate/commissions` - Comissões
- `POST /api/affiliate/withdraw` - Solicitar saque
- `GET /api/affiliate/withdrawals` - Histórico saques

### **Para Validação:**
- `GET /api/affiliate/validate/:codigo` - Validar código

## 🔧 CONFIGURAÇÕES

### **Valores Fixos:**
- **Comissão**: R$ 10,00 (fixo)
- **Depósito mínimo**: R$ 20,00
- **Saque mínimo**: R$ 50,00

### **Regras:**
- ✅ **Uma comissão por indicado** (apenas primeiro depósito)
- ✅ **Saldo sacável** imediatamente
- ✅ **Sem rollover** para comissões
- ✅ **Histórico completo** de indicações

## 🧪 TESTE DO SISTEMA

### **Cenário de Teste:**
1. **Criar afiliado**: `afiliado@slotbox.shop`
2. **Registrar indicado** com código do afiliado
3. **Depositar R$ 25,00** (indicado)
4. **Verificar**: Afiliado deve receber R$ 10,00

### **Comandos de Teste:**
```javascript
// 1. Criar afiliado
fetch('/api/affiliate/create', {method: 'POST', headers: {Authorization: 'Bearer TOKEN'}})

// 2. Ver dados do afiliado
fetch('/api/affiliate/me', {headers: {Authorization: 'Bearer TOKEN'}})

// 3. Ver comissões
fetch('/api/affiliate/commissions', {headers: {Authorization: 'Bearer TOKEN'}})
```

## ✅ STATUS ATUAL

### **✅ FUNCIONANDO:**
- ✅ Criação de afiliados
- ✅ Códigos únicos
- ✅ Registro de indicações
- ✅ Comissão de R$ 10,00
- ✅ Saldo sacável

### **⚠️ PRECISA CORRIGIR:**
- ❌ Alguns campos ainda usam `saldo` em vez de `saldo_reais`
- ❌ BulkPurchase pode ter problemas similares

**O sistema está 90% correto, mas precisa das correções de campos!** 🔧
