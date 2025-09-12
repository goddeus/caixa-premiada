# 🚀 SETUP INICIAL DO BANCO - EXECUTAR APENAS UMA VEZ

## ⚠️ IMPORTANTE: 

**Este setup deve ser executado APENAS UMA VEZ após o primeiro deploy!**

## 🔧 COMO EXECUTAR:

### **1. Após Deploy no Render:**

1. **Acesse o painel do Render**
2. **Seu serviço** → **Shell** (aba lateral)
3. **Execute**:
   ```bash
   node setup-database.js
   ```

### **2. Ou via Logs (Alternativa):**

1. **Settings** → **Environment Variables**
2. **Adicionar temporariamente**:
   ```
   RUN_SETUP=true
   ```
3. **Deploy** → Aguardar setup
4. **REMOVER** a variável `RUN_SETUP`

## 📊 O QUE O SETUP FAZ:

1. **✅ Aplica schema** (cria tabelas)
2. **✅ Cria 2 admins**: eduarda@admin.com, junior@admin.com
3. **✅ Cria 15 demos**: R$ 100 cada (afiliado_demo)
4. **✅ Cria 6 caixas**: Com preços corretos
5. **✅ Configura RTP**: 10% normal, 70% demo
6. **✅ Preserva dados**: Não apaga mais a cada deploy

## 🎯 APÓS SETUP:

- ✅ **Contas demo**: Parecem normais (sem indicação "demo")
- ✅ **Saldo R$ 100**: Aparece normalmente
- ✅ **RTP 70%**: Ganham mais (para prints/divulgação)
- ✅ **Depósito/Saque**: Bloqueados discretamente
- ✅ **Dados preservados**: Não resetam mais

## 🚨 NUNCA MAIS EXECUTAR:

- ❌ `npx prisma db push` (apaga dados)
- ❌ `recreate-essential-accounts.js` (duplica contas)

**Execute o setup UMA VEZ e o sistema funcionará perfeitamente!** 🎉
