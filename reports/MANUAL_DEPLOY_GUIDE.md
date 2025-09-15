# 🚀 GUIA DE DEPLOY MANUAL - SLOTBOX

**Data:** 15 de Setembro de 2025  
**Status:** Backend funcionando, Frontend para deploy manual

---

## 📊 **STATUS ATUAL**

### ✅ **BACKEND - FUNCIONANDO**
- **API:** https://slotbox-api.onrender.com ✅ **ONLINE**
- **Health Check:** ✅ Funcionando
- **Rotas Críticas:** ✅ Todas respondendo
- **Performance:** ✅ Rápida (247ms)

### ⏳ **FRONTEND - PENDENTE DEPLOY MANUAL**
- **URL:** https://slotbox.shop ❌ **403 Forbidden**
- **Arquivos:** ✅ Prontos em `frontend/dist/`
- **Status:** Aguardando upload manual para Hostinger

---

## 🎯 **PRÓXIMOS PASSOS**

### 1. **DEPLOY MANUAL DO FRONTEND NO HOSTINGER**

#### 📁 **Arquivos Prontos para Upload:**
```
frontend/dist/
├── index.html
├── assets/
│   ├── index-2vyOSPKb.css (70.44 kB)
│   ├── ui-B3KIqm52.js (0.40 kB)
│   ├── vendor-gH-7aFTg.js (11.83 kB)
│   ├── router-Cj7dMlqZ.js (32.44 kB)
│   ├── utils-BgsGIbzM.js (66.44 kB)
│   └── index-BLCj0hNU.js (772.32 kB)
```

#### 🔧 **Instruções de Upload:**

1. **Acessar o painel do Hostinger**
   - Fazer login no painel de controle
   - Ir para "Gerenciador de Arquivos"

2. **Navegar para o diretório correto**
   - Ir para `public_html/` (ou diretório raiz do domínio)

3. **Fazer backup do conteúdo atual**
   - Renomear pasta atual para `backup_$(date)`
   - Criar nova pasta `public_html/`

4. **Upload dos arquivos**
   - Upload de todos os arquivos de `frontend/dist/`
   - Manter estrutura de pastas
   - Verificar permissões (644 para arquivos, 755 para pastas)

5. **Configurar .htaccess (se necessário)**
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

6. **Testar o site**
   - Acessar https://slotbox.shop
   - Verificar se carrega corretamente
   - Testar navegação

---

### 2. **DEPLOY DO BACKEND NO RENDER (OPCIONAL)**

Se quiser fazer deploy do backend também:

#### 🔧 **Opção 1: Deploy Automático via Webhook**
```bash
# Configurar variável de ambiente
export RENDER_DEPLOY_WEBHOOK="https://api.render.com/deploy/srv-xxxxx"

# Executar deploy
curl -X POST "$RENDER_DEPLOY_WEBHOOK"
```

#### 🔧 **Opção 2: Deploy Manual via Git**
1. Fazer merge da branch `audit/full-rebuild-20250915-100238` para `main`
2. O Render fará deploy automático
3. Verificar logs no painel do Render

---

## 🧪 **VALIDAÇÃO PÓS-DEPLOY**

### ✅ **Checklist de Validação:**

#### **Backend (já funcionando):**
- [x] API Health: https://slotbox-api.onrender.com/api/health
- [x] Lista de Caixas: https://slotbox-api.onrender.com/api/cases
- [x] Lista de Prêmios: https://slotbox-api.onrender.com/api/prizes
- [x] Teste de Banco: https://slotbox-api.onrender.com/api/db-test

#### **Frontend (após upload):**
- [ ] Site carrega: https://slotbox.shop
- [ ] Login funciona
- [ ] Navegação entre páginas
- [ ] Modal de depósito PIX
- [ ] Abertura de caixas
- [ ] Sistema de saques
- [ ] Painel administrativo

#### **Integração:**
- [ ] Frontend conecta com API
- [ ] Autenticação JWT
- [ ] Webhooks VizzionPay
- [ ] Sistema de RTP

---

## 🔍 **MONITORAMENTO**

### **Script de Monitoramento:**
```bash
# Monitorar apenas backend (já funcionando)
node scripts/monitor-backend-only.js

# Monitorar sistema completo (após deploy frontend)
node scripts/monitor-post-deploy.js
```

### **URLs para Testar:**
- **API Health:** https://slotbox-api.onrender.com/api/health
- **Frontend:** https://slotbox.shop (após upload)
- **Admin:** https://slotbox-api.onrender.com/admin (se configurado)

---

## 🆘 **SUPORTE E ROLLBACK**

### **Em Caso de Problemas:**

#### **Rollback Frontend:**
1. Restaurar backup anterior do Hostinger
2. Verificar se site volta a funcionar
3. Investigar problema nos novos arquivos

#### **Rollback Backend:**
```bash
# Executar rollback
./scripts/rollback.sh
```

#### **Logs e Debug:**
- **Backend:** Verificar logs no Render
- **Frontend:** Verificar console do navegador
- **API:** Testar endpoints individualmente

---

## 📋 **RESUMO EXECUTIVO**

### ✅ **O que está funcionando:**
- **Backend completo** rodando no Render
- **API** respondendo corretamente
- **Banco de dados** conectado
- **Arquivos do frontend** buildados e prontos

### ⏳ **O que precisa ser feito:**
- **Upload manual** do frontend para Hostinger
- **Validação** das funcionalidades
- **Testes** de integração

### 🎯 **Resultado esperado:**
Sistema completo funcionando em produção com:
- Frontend em https://slotbox.shop
- Backend em https://slotbox-api.onrender.com
- Todas as funcionalidades operacionais

---

**Guia criado em:** 15 de Setembro de 2025, 11:50  
**Status:** ✅ Backend funcionando, ⏳ Frontend aguardando upload manual
