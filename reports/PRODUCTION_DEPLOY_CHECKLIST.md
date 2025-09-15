# 🚀 CHECKLIST DE DEPLOY EM PRODUÇÃO - SLOTBOX

**Data:** 15/09/2025, 11:31:15  
**Branch:** audit/full-rebuild-20250915-100238  
**Status:** ✅ Sistema Pronto para Deploy

---

## 📋 Pré-Deploy

### ✅ Verificações Obrigatórias
- [x] **Branch Correta:** audit/full-rebuild-20250915-100238
- [x] **Working Directory Limpo:** Sem mudanças não commitadas
- [x] **Build Frontend:** Diretório dist/ gerado com sucesso
- [x] **Configurações:** env.production configurado
- [x] **Scripts Deploy:** deploy.sh, rollback.sh, monitor-deployment.sh
- [x] **Backups:** Arquivos de backup disponíveis
- [x] **Testes:** Relatórios de teste gerados

### 🔧 Configurações de Produção
- [x] **Backend:** backend/env.production configurado
- [x] **Frontend:** frontend/.env.production configurado
- [x] **Database:** DATABASE_URL configurado
- [x] **VizzionPay:** Chaves de API configuradas
- [x] **JWT:** JWT_SECRET configurado

---

## 🚀 Deploy

### 1. Backup Final
```bash
# Executar backup final do banco
cd backend
node scripts/backup-database.js
```

### 2. Deploy Backend (Render)
```bash
# Deploy automático via webhook
curl -X POST "$RENDER_DEPLOY_WEBHOOK"
```

### 3. Deploy Frontend (Hostinger)
```bash
# Upload via FTP
./scripts/deploy.sh production
```

### 4. Aplicar Migrations
```bash
# Aplicar migrations em produção
cd backend
npx prisma migrate deploy
```

---

## ✅ Pós-Deploy

### 1. Smoke Tests
```bash
# Executar smoke tests
./scripts/monitor-deployment.sh
```

### 2. Verificações Críticas
- [ ] **API Health:** https://slotbox-api.onrender.com/api/health
- [ ] **Frontend:** https://slotbox.shop
- [ ] **Login:** Testar login de usuário
- [ ] **Depósito PIX:** Testar geração de QR Code
- [ ] **Abertura de Caixas:** Testar compra e sorteio
- [ ] **Saque:** Testar sistema de saques
- [ ] **Admin Panel:** Verificar acesso administrativo

### 3. Monitoramento
- [ ] **Logs de Erro:** Verificar logs do backend
- [ ] **Performance:** Monitorar tempos de resposta
- [ ] **Database:** Verificar conexão e queries
- [ ] **VizzionPay:** Verificar integração PIX
- [ ] **RTP:** Monitorar estatísticas de RTP

---

## 🔄 Rollback (Se Necessário)

### 1. Rollback Automático
```bash
# Executar rollback
./scripts/rollback.sh
```

### 2. Rollback Manual
```bash
# Restaurar backup do banco
psql $DATABASE_URL < backups/db_before_audit_*.sql

# Redeploy da versão anterior
git checkout main
./scripts/deploy.sh production
```

---

## 📊 Métricas de Sucesso

### ✅ Critérios de Sucesso
- [ ] **API Response Time:** < 2 segundos
- [ ] **Frontend Load Time:** < 3 segundos
- [ ] **Error Rate:** < 1%
- [ ] **Uptime:** > 99.9%
- [ ] **Database Connection:** Estável
- [ ] **VizzionPay Integration:** Funcionando

### 📈 Monitoramento Contínuo
- [ ] **Health Checks:** A cada 5 minutos
- [ ] **Performance Metrics:** A cada hora
- [ ] **Error Logs:** Revisão diária
- [ ] **RTP Statistics:** Revisão semanal

---

## 🆘 Contatos de Emergência

### Em Caso de Problemas
1. **Verificar logs:** backend/logs/
2. **Executar rollback:** ./scripts/rollback.sh
3. **Contatar equipe:** [Contatos da equipe]
4. **Documentar problema:** [Sistema de tickets]

---

**Checklist gerado em:** 15/09/2025, 11:31:15  
**Sistema:** SlotBox  
**Status:** ✅ Pronto para Deploy em Produção