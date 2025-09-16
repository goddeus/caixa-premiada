# Guia de Deploy - SlotBox

## Status Atual ✅

- ✅ **Auditoria Completa** - Todas as 14 tarefas concluídas
- ✅ **Código Commitado** - Branch `audit/fix-all-20250916-092114` pronta
- ✅ **Backend Produção** - Funcionando (health check OK)
- ✅ **Frontend Produção** - Acessível
- ⚠️ **Smoke Tests** - 50% passando (alguns endpoints precisam de ajustes)

## Próximos Passos

### 1. Deploy para Staging (Recomendado)

```bash
# 1. Criar branch de staging
git checkout -b staging
git merge audit/fix-all-20250916-092114

# 2. Configurar variáveis de ambiente no Render (Staging)
NODE_ENV=staging
DATABASE_URL=postgresql://staging_user:staging_password@staging_host:5432/slotbox_staging
JWT_SECRET=staging-jwt-secret-key-very-long-and-secure
VIZZION_PUBLIC_KEY=staging_public_key
VIZZION_SECRET_KEY=staging_secret_key
FRONTEND_URL=https://slotbox-staging.shop
CORS_ORIGIN=https://slotbox-staging.shop,https://www.slotbox-staging.shop,http://localhost:5173

# 3. Deploy automático via GitHub Actions
git push origin staging

# 4. Executar smoke tests em staging
npm run test:smoke -- --backend-url=https://slotbox-api-staging.onrender.com
```

### 2. Deploy Direto para Produção (Se necessário)

```bash
# 1. Fazer merge para main
git checkout main
git merge audit/fix-all-20250916-092114

# 2. Deploy automático via GitHub Actions
git push origin main

# 3. Executar smoke tests em produção
npm run test:smoke -- --backend-url=https://slotbox-api.onrender.com
```

## Configurações Necessárias

### Backend (Render)

**Variáveis de Ambiente:**
- `NODE_ENV=production`
- `DATABASE_URL` (já configurado)
- `JWT_SECRET` (já configurado)
- `VIZZION_PUBLIC_KEY` (já configurado)
- `VIZZION_SECRET_KEY` (já configurado)
- `FRONTEND_URL=https://slotbox.shop`
- `CORS_ORIGIN=https://slotbox.shop,https://www.slotbox.shop`

### Frontend (Hostinger)

**Variáveis de Ambiente:**
- `VITE_API_URL=https://slotbox-api.onrender.com/api`

## Monitoramento Pós-Deploy

### 1. Verificar Logs
- Acessar dashboard do Render
- Verificar logs de aplicação
- Monitorar métricas

### 2. Verificar Funcionalidades
- ✅ Health check: `/api/health`
- ✅ Frontend: https://slotbox.shop
- ⚠️ Registro/Login: Precisa de ajustes
- ⚠️ Listagem de caixas: Precisa de ajustes
- ⚠️ Depósito PIX: Precisa de token

### 3. Alertas Configurados
- Taxa de erro > 5%
- Tempo de resposta > 5s
- Webhook atrasado > 5min
- Saldo baixo < R$ 1000

## Rollback (Se necessário)

```bash
# Reverter para commit anterior
git checkout main
git reset --hard HEAD~1
git push --force-with-lease origin main
```

## Status dos Smoke Tests

### ✅ Funcionando
- Health check
- CORS
- Frontend acessível
- Performance

### ⚠️ Precisa de Ajustes
- Registro de usuário (400)
- Login (401)
- Listagem de caixas
- Depósito PIX (precisa de token)

## Recomendação

**Deploy para Staging primeiro** para validar todas as funcionalidades antes de ir para produção.

---

**Próximo passo:** Executar deploy para staging e validar funcionalidades.
