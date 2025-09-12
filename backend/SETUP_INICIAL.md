# 🚀 SETUP INICIAL DO BANCO - EXECUTAR APENAS UMA VEZ

## ⚠️ IMPORTANTE: 

**Este setup deve ser executado APENAS UMA VEZ após o primeiro deploy!**

## 🔧 COMO EXECUTAR (PLANO GRATUITO):

### **1. Via Environment Variables (Recomendado):**

1. **Render Dashboard** → **Seu serviço**
2. **Settings** → **Environment Variables**
3. **Add Environment Variable**:
   ```
   Key: RUN_SETUP
   Value: true
   ```
4. **Save Changes** → **Manual Deploy**
5. **Aguardar deploy** (2-3 minutos)
6. **Verificar logs** → Deve aparecer "SETUP CONCLUÍDO"
7. **⚠️ IMPORTANTE**: **REMOVER** a variável `RUN_SETUP` após setup

### **2. Verificar se funcionou:**

- **Logs** devem mostrar: "🎉 SETUP CONCLUÍDO COM SUCESSO!"
- **Testar login** com conta demo: `joao.ferreira@test.com` / `Afiliado@123`

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
