# 🚀 INICIALIZAÇÃO AUTOMÁTICA - SLOT BOX

## ✅ IMPLEMENTAÇÃO COMPLETA

### 🎯 **Objetivo**
Quando o backend inicia, ele automaticamente cria as 2 contas admin e as 15 contas demo com saldo inicial de R$ 100,00.

### 🔧 **Modificações Aplicadas**

#### 1. **Função `createAdminAndDemoAccounts()`**
- Criada função que é executada automaticamente na inicialização
- Cria 2 contas admin com senha `paineladm@`
- Cria 15 contas demo com senha `Afiliado@123`
- Todas as contas recebem saldo inicial de R$ 100,00

#### 2. **Contas ADMIN**
- **Eduarda**: `eduarda@admin.com` / `paineladm@`
- **Junior**: `junior@admin.com` / `paineladm@`
- **Saldo**: R$ 100,00 em `saldo_reais` e `saldo_demo`
- **Permissões**: Admin completas

#### 3. **Contas DEMO**
- **15 contas** com nomes e emails únicos
- **Senha**: `Afiliado@123` para todas
- **Saldo**: R$ 100,00 apenas em `saldo_demo`
- **Tipo**: Contas demo para testes

## 📁 **ARQUIVO MODIFICADO**

### Backend
- `backend/init-db.js` - Adicionada função de criação automática

## 🚀 **COMANDOS PARA DEPLOY**

```bash
# 1. Fazer commit das modificações
git add .
git commit -m "feat: Inicialização automática de contas

- Criar 2 contas admin automaticamente na inicialização
- Criar 15 contas demo automaticamente na inicialização
- Todas as contas recebem saldo inicial de R$ 100,00
- Senhas padronizadas para facilitar testes"

# 2. Fazer push
git push origin main
```

## 🧪 **COMPORTAMENTO PÓS-DEPLOY**

### **Na Inicialização do Backend**
```
🚀 Inicializando banco de dados...
✅ Conexão estabelecida!
👑 Criando contas ADMIN...
✅ Admin criado: eduarda@admin.com / paineladm@
✅ Admin criado: junior@admin.com / paineladm@
🎭 Criando contas DEMO...
✅ Demo criado: joao.ferreira@test.com / Afiliado@123
✅ Demo criado: lucas.almeida@test.com / Afiliado@123
... (13 contas demo adicionais)
🎯 Contas admin e demo criadas com sucesso!
```

### **Se Contas Já Existem**
```
👑 Criando contas ADMIN...
ℹ️ Admin já existe: eduarda@admin.com
ℹ️ Admin já existe: junior@admin.com
🎭 Criando contas DEMO...
ℹ️ Demo já existe: joao.ferreira@test.com
... (contas existentes são ignoradas)
```

## 📊 **CREDENCIAIS DE TESTE**

### **Contas ADMIN**
| Nome | Email | Senha | Saldo |
|------|-------|-------|-------|
| Eduarda | eduarda@admin.com | paineladm@ | R$ 100,00 |
| Junior | junior@admin.com | paineladm@ | R$ 100,00 |

### **Contas DEMO**
| Nome | Email | Senha | Saldo Demo |
|------|-------|-------|------------|
| João Ferreira | joao.ferreira@test.com | Afiliado@123 | R$ 100,00 |
| Lucas Almeida | lucas.almeida@test.com | Afiliado@123 | R$ 100,00 |
| Pedro Henrique | pedro.henrique@test.com | Afiliado@123 | R$ 100,00 |
| ... | ... | ... | ... |
| Eduardo Ramos | eduardo.ramos@test.com | Afiliado@123 | R$ 100,00 |

## 🔍 **CARACTERÍSTICAS**

### **Contas ADMIN**
- ✅ Acesso ao painel admin
- ✅ Saldo em reais e demo
- ✅ Primeiro depósito já feito
- ✅ Rollover liberado
- ✅ Permissões administrativas

### **Contas DEMO**
- ✅ Acesso ao sistema normal
- ✅ Saldo apenas em demo
- ✅ Primeiro depósito não feito
- ✅ Rollover não liberado
- ✅ Ideal para testes

## 🎯 **VANTAGENS**

### **Para Desenvolvimento**
- ✅ Contas prontas para teste
- ✅ Senhas padronizadas
- ✅ Saldo inicial configurado
- ✅ Não precisa criar manualmente

### **Para Produção**
- ✅ Inicialização automática
- ✅ Contas de teste disponíveis
- ✅ Admin configurado
- ✅ Sistema pronto para uso

## 🚨 **IMPORTANTE**

### **Segurança**
- ⚠️ Senhas são hasheadas com bcrypt
- ⚠️ Contas demo são para testes
- ⚠️ Admin tem acesso total
- ⚠️ Alterar senhas em produção

### **Manutenção**
- 🔄 Contas existentes são ignoradas
- 🔄 Não há duplicação
- 🔄 Inicialização é idempotente
- 🔄 Logs detalhados

---

**Status**: ✅ IMPLEMENTAÇÃO COMPLETA
**Pronto para**: Deploy e inicialização automática