# Deploy Simplificado - SlotBox

## 🎯 Usando Domínios Existentes

Você está correto! Não precisamos criar novos domínios. Vamos usar os que já existem:

- **Frontend:** https://slotbox.shop (já existe)
- **Backend:** https://slotbox-api.onrender.com (já existe)

## 🚀 Deploy Direto para Produção

### 1. Deploy do Backend (Render)

**O que fazer:**
1. Acessar https://dashboard.render.com
2. Ir para o serviço `slotbox-api` existente
3. Configurar as novas variáveis de ambiente (se necessário)
4. Fazer deploy da branch `staging` ou `main`

**Variáveis de Ambiente (verificar se estão corretas):**
```bash
NODE_ENV=production
DATABASE_URL=postgresql://... (já configurado)
JWT_SECRET=... (já configurado)
VIZZION_PUBLIC_KEY=... (já configurado)
VIZZION_SECRET_KEY=... (já configurado)
FRONTEND_URL=https://slotbox.shop
CORS_ORIGIN=https://slotbox.shop,https://www.slotbox.shop
```

### 2. Deploy do Frontend (Hostinger)

**O que fazer:**
1. Acessar painel da Hostinger
2. Ir para o domínio `slotbox.shop`
3. Fazer upload da nova versão do frontend (pasta `dist/`)

**Variáveis de Ambiente:**
```bash
VITE_API_URL=https://slotbox-api.onrender.com/api
```

## 📋 Processo Simplificado

### Opção 1: Deploy Automático (Recomendado)

```bash
# 1. Fazer merge para main
git checkout main
git merge staging
git push origin main

# 2. Deploy automático via GitHub Actions
# O pipeline já está configurado para fazer deploy automático
```

### Opção 2: Deploy Manual

```bash
# 1. Build do frontend
cd frontend
npm run build

# 2. Upload da pasta dist/ para Hostinger
# 3. Deploy do backend via Render dashboard
```

## ✅ Vantagens do Deploy Simplificado

1. **Sem novos domínios** - Usa os existentes
2. **Sem configuração extra** - Aproveita o que já está funcionando
3. **Deploy mais rápido** - Menos passos
4. **Menos complexidade** - Foco no essencial

## 🔍 Validação Pós-Deploy

```bash
# 1. Verificar health check
curl https://slotbox-api.onrender.com/api/health

# 2. Verificar frontend
# Acessar https://slotbox.shop

# 3. Executar smoke tests
cd tests
node smoke-tests.js
```

## 🚨 Rollback (Se necessário)

```bash
# Reverter para commit anterior
git checkout main
git reset --hard HEAD~1
git push --force-with-lease origin main
```

---

**Resumo:** Usar os domínios existentes e fazer deploy direto para produção. Muito mais simples! 🎯
