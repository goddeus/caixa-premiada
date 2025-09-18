# 🚀 INSTRUÇÕES DE DEPLOY - CORREÇÃO AUTOMÁTICA

## 📋 **PROBLEMAS IDENTIFICADOS**
- **Depósito de R$ 20,00** não foi creditado (paulotest@gmail.com)
- **Webhook falhando** com erro: "The column Transaction.related_id does not exist"
- **Sistema de afiliados** não processou comissão
- **Pagamento confirmado** pela VizzionPay, mas não processado

## ✅ **SOLUÇÃO IMPLEMENTADA**

### **🔧 Scripts Criados:**
1. **`backend/src/scripts/autoFixDeposit.js`** - Correção automática do depósito
2. **`backend/src/scripts/checkAffiliateSystem.js`** - Verificação do sistema de afiliados
3. **`backend/src/scripts/fixAffiliateLink.js`** - Correção da vinculação de afiliado
4. **`backend/src/scripts/checkUserBalance.js`** - Verificação e correção do saldo
5. **`fix_webhook_server.js`** - Script manual (se necessário)
6. **`fix_deposit_sql.sql`** - Script SQL direto
7. **`fix_database_schema.sql`** - Correção do schema do banco
8. **`fix_affiliate_link.sql`** - Correção SQL do afiliado
9. **`check_user_balance.sql`** - Verificação SQL do saldo

### **⚙️ Configuração Automática:**
- Script executa **automaticamente** quando o servidor inicia
- Adiciona colunas `related_id` e `metadata` se não existirem
- Processa o depósito pendente
- Credita R$ 20,00 na conta do usuário
- Verifica e processa comissão de afiliado (se aplicável)
- Corrige o webhook para futuros depósitos
- Verifica sistema de afiliados completo

---

## 🚀 **COMO FAZER O DEPLOY**

### **1. Commit e Push:**
```bash
git add .
git commit -m "fix: correção automática do depósito pendente e webhook"
git push origin main
```

### **2. O que acontece automaticamente:**
- ✅ **Render detecta** o novo commit
- ✅ **Servidor reinicia** automaticamente
- ✅ **Script executa** na inicialização
- ✅ **Depósito é processado** automaticamente
- ✅ **Webhook funciona** para futuros depósitos

### **3. Verificação:**
Após o deploy, verifique os logs do Render:
```
🔧 Iniciando correção automática do depósito...
✅ Coluna related_id adicionada com sucesso!
✅ Usuário encontrado: paulotest@gmail.com
✅ Depósito processado com sucesso
✅ Creditado R$ 20,00 no saldo real
🎉 CORREÇÃO AUTOMÁTICA CONCLUÍDA!
```

---

## 🛠️ **COMANDOS MANUAIS (SE NECESSÁRIO)**

### **No Render (via SSH ou Console):**
```bash
# Correção apenas do depósito
npm run fix:deposit

# Verificar sistema de afiliados
npm run check:affiliate

# Verificar saldo do usuário
npm run check:balance

# Correção completa (schema + depósito + afiliados + saldo)
npm run fix:all
```

### **Scripts SQL (PostgreSQL):**
```sql
-- Executar no banco de dados
\i fix_deposit_sql.sql
```

---

## 📊 **RESULTADO ESPERADO**

### **✅ Após o Deploy:**
- **Usuário:** paulotest@gmail.com
- **Saldo:** R$ 20,00 creditado
- **Status:** Depósito concluído
- **Webhook:** Funcionando normalmente
- **Sistema de Afiliados:** Verificado e corrigido
- **Comissão:** Processada (se aplicável)

### **🔍 Verificação:**
1. Acesse o painel admin
2. Verifique o usuário paulotest@gmail.com
3. Confirme o saldo de R$ 20,00
4. Verifique a transação como "concluido"
5. Verifique se tem afiliado vinculado
6. Confirme se a comissão foi processada (R$ 10,00)

---

## 🚨 **IMPORTANTE**

### **⚠️ Este deploy irá:**
- ✅ Corrigir o problema do webhook
- ✅ Processar o depósito pendente
- ✅ Creditar R$ 20,00 na conta
- ✅ Verificar e corrigir sistema de afiliados
- ✅ Processar comissão de R$ 10,00 (se aplicável)
- ✅ Funcionar para futuros depósitos

### **🔄 Não afeta:**
- ❌ Outros usuários
- ❌ Transações já processadas
- ❌ Funcionalidades existentes

---

## 📞 **SUPORTE**

Se houver algum problema:
1. Verifique os logs do Render
2. Execute `npm run fix:deposit` manualmente
3. Use o script SQL como backup

**O depósito será processado automaticamente no próximo deploy!** 🎯
