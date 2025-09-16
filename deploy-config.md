# Configuração de Deploy - SlotBox

## Ambientes

### Staging
- **URL Frontend**: https://slotbox-staging.shop
- **URL Backend**: https://slotbox-api-staging.onrender.com
- **Database**: PostgreSQL (Render)
- **Variáveis de Ambiente**:
  ```bash
  NODE_ENV=staging
  DATABASE_URL=postgresql://staging_user:staging_password@staging_host:5432/slotbox_staging
  JWT_SECRET=staging-jwt-secret-key-very-long-and-secure
  VIZZION_PUBLIC_KEY=staging_public_key
  VIZZION_SECRET_KEY=staging_secret_key
  FRONTEND_URL=https://slotbox-staging.shop
  CORS_ORIGIN=https://slotbox-staging.shop,https://www.slotbox-staging.shop,http://localhost:5173
  ```

### Produção
- **URL Frontend**: https://slotbox.shop
- **URL Backend**: https://slotbox-api.onrender.com
- **Database**: PostgreSQL (Render)
- **Variáveis de Ambiente**:
  ```bash
  NODE_ENV=production
  DATABASE_URL=postgresql://production_user:production_password@production_host:5432/slotbox_production
  JWT_SECRET=production-jwt-secret-key-very-long-and-secure
  VIZZION_PUBLIC_KEY=production_public_key
  VIZZION_SECRET_KEY=production_secret_key
  FRONTEND_URL=https://slotbox.shop
  CORS_ORIGIN=https://slotbox.shop,https://www.slotbox.shop
  ```

## Processo de Deploy

### 1. Deploy para Staging
```bash
# 1. Fazer merge da branch develop para staging
git checkout staging
git merge develop

# 2. Deploy automático via GitHub Actions
# O pipeline CI/CD irá:
# - Executar todos os testes
# - Fazer build do frontend
# - Deploy para Render (staging)
# - Executar smoke tests

# 3. Verificar deploy
npm run test:smoke -- --backend-url=https://slotbox-api-staging.onrender.com
```

### 2. Deploy para Produção
```bash
# 1. Fazer merge da branch staging para main
git checkout main
git merge staging

# 2. Deploy automático via GitHub Actions
# O pipeline CI/CD irá:
# - Executar todos os testes
# - Fazer build do frontend
# - Deploy para Render (production)
# - Executar smoke tests

# 3. Verificar deploy
npm run test:smoke -- --backend-url=https://slotbox-api.onrender.com
```

## Rollback

### Rollback de Staging
```bash
# 1. Reverter para commit anterior
git checkout staging
git reset --hard HEAD~1
git push --force-with-lease origin staging

# 2. Deploy automático irá reverter
```

### Rollback de Produção
```bash
# 1. Reverter para commit anterior
git checkout main
git reset --hard HEAD~1
git push --force-with-lease origin main

# 2. Deploy automático irá reverter
```

## Monitoramento

### Health Checks
- **Staging**: https://slotbox-api-staging.onrender.com/api/health
- **Produção**: https://slotbox-api.onrender.com/api/health

### Logs
- **Render Dashboard**: Acessar painel do Render para visualizar logs
- **Logs Locais**: `backend/logs/` (desenvolvimento)

### Métricas
- **Performance**: Tempo de resposta < 2s
- **Disponibilidade**: > 99.9%
- **Taxa de Erro**: < 1%

## Troubleshooting

### Problemas Comuns

1. **CORS Errors**
   - Verificar se `CORS_ORIGIN` está configurado corretamente
   - Verificar se frontend está usando a URL correta do backend

2. **Database Connection**
   - Verificar se `DATABASE_URL` está correto
   - Verificar se o banco está acessível

3. **VizzionPay Integration**
   - Verificar se as chaves estão corretas
   - Verificar se o webhook está configurado

4. **Build Failures**
   - Verificar se todas as dependências estão instaladas
   - Verificar se não há erros de lint

### Comandos Úteis

```bash
# Verificar status do deploy
curl https://slotbox-api.onrender.com/api/health

# Executar smoke tests
npm run test:smoke

# Ver logs do Render
# Acessar dashboard do Render

# Verificar variáveis de ambiente
# Acessar dashboard do Render > Settings > Environment Variables
```
