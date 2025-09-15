# 📁 INSTRUÇÕES ESPECÍFICAS PARA UPLOAD DO FRONTEND

**Data:** 15 de Setembro de 2025  
**Status:** ✅ Arquivos prontos | ❌ Erro 403 no site  
**Solução:** Upload manual para Hostinger

---

## 📊 **ARQUIVOS PRONTOS PARA UPLOAD**

### **Localização:** `C:\Users\USER\Desktop\Caixa Premiada\frontend\dist\`

### **Estrutura Completa:**
```
frontend/dist/
├── index.html (910 bytes) ✅
├── .htaccess (1,139 bytes) ✅
├── vite.svg (1,497 bytes) ✅
├── assets/ (6 arquivos) ✅
│   ├── index-2vyOSPKb.css (70,435 bytes)
│   ├── index-BLCj0hNU.js (772,315 bytes)
│   ├── router-Cj7dMlqZ.js (32,440 bytes)
│   ├── ui-B3KIqm52.js (403 bytes)
│   ├── utils-BgsGIbzM.js (66,478 bytes)
│   └── vendor-gH-7aFTg.js (11,827 bytes)
└── imagens/ (todas as imagens) ✅
    ├── CAIXA APPLE/
    ├── CAIXA CONSOLE DOS SONHOS/
    ├── CAIXA FINAL DE SEMANA/
    ├── CAIXA KIT NIKE/
    ├── CAIXA PREMIUM MASTER/
    ├── CAIXA SAMSUNG/
    └── [outras imagens]
```

**Total:** ~1.1 MB de arquivos

---

## 🚀 **PASSO-A-PASSO PARA UPLOAD**

### **PASSO 1: Acessar Hostinger**
1. **Ir para:** https://hpanel.hostinger.com
2. **Fazer login** com suas credenciais
3. **Procurar por:** "Gerenciador de Arquivos" ou "File Manager"

### **PASSO 2: Navegar para o Diretório Correto**
1. **Encontrar o domínio:** `slotbox.shop`
2. **Clicar no domínio**
3. **Entrar na pasta:** `public_html/`

### **PASSO 3: Fazer Backup (Recomendado)**
1. **Verificar o que existe** em `public_html/`
2. **Se houver arquivos antigos:**
   - Selecionar todos os arquivos
   - Criar pasta `backup_15set2025`
   - Mover arquivos para backup

### **PASSO 4: Upload dos Arquivos**

#### **4.1 Upload do index.html**
1. **No Hostinger, clicar em "Upload"**
2. **Selecionar:** `C:\Users\USER\Desktop\Caixa Premiada\frontend\dist\index.html`
3. **Upload para:** `public_html/index.html`

#### **4.2 Upload da pasta assets/**
1. **Clicar em "Upload" novamente**
2. **Selecionar todos os 6 arquivos** de `frontend\dist\assets\`:
   - `index-2vyOSPKb.css`
   - `index-BLCj0hNU.js`
   - `router-Cj7dMlqZ.js`
   - `ui-B3KIqm52.js`
   - `utils-BgsGIbzM.js`
   - `vendor-gH-7aFTg.js`
3. **Upload para:** `public_html/assets/`

#### **4.3 Upload da pasta imagens/**
1. **Clicar em "Upload"**
2. **Selecionar toda a pasta** `imagens/` e seu conteúdo
3. **Upload para:** `public_html/imagens/`

#### **4.4 Upload do .htaccess**
1. **Clicar em "Upload"**
2. **Selecionar:** `frontend\dist\.htaccess`
3. **Upload para:** `public_html/.htaccess`

### **PASSO 5: Verificar Estrutura Final**
Após upload, `public_html/` deve conter:
```
public_html/
├── index.html ✅
├── .htaccess ✅
├── vite.svg ✅
├── assets/ ✅
│   ├── index-2vyOSPKb.css
│   ├── index-BLCj0hNU.js
│   ├── router-Cj7dMlqZ.js
│   ├── ui-B3KIqm52.js
│   ├── utils-BgsGIbzM.js
│   └── vendor-gH-7aFTg.js
└── imagens/ ✅
    └── [todas as subpastas e imagens]
```

---

## 🧪 **TESTE IMEDIATO APÓS UPLOAD**

### **Teste 1: Acesso Básico**
1. **Abrir:** https://slotbox.shop
2. **Resultado esperado:** Site carrega (sem erro 403)

### **Teste 2: Verificar Assets**
1. **Testar CSS:** https://slotbox.shop/assets/index-2vyOSPKb.css
2. **Testar JS:** https://slotbox.shop/assets/index-BLCj0hNU.js
3. **Resultado esperado:** Arquivos carregam

### **Teste 3: Console do Navegador**
1. **Abrir:** https://slotbox.shop
2. **Pressionar F12** (DevTools)
3. **Ir para aba Console**
4. **Verificar se há erros**

---

## 🔧 **SE AINDA DER ERRO 403**

### **Verificações:**

1. **Permissões dos arquivos:**
   - Arquivos: 644 (rw-r--r--)
   - Pastas: 755 (rwxr-xr-x)

2. **Localização do index.html:**
   - Deve estar em `public_html/index.html`
   - NÃO em subpastas

3. **Verificar se .htaccess está correto:**
   - Deve estar em `public_html/.htaccess`
   - Conteúdo correto

4. **Verificar se assets carregam:**
   - Testar URLs dos assets individualmente
   - Verificar se retornam os arquivos

---

## 📋 **CHECKLIST RÁPIDO**

### **Antes do Upload:**
- [ ] Arquivos prontos em `frontend/dist/`
- [ ] Acesso ao painel do Hostinger
- [ ] Backup do conteúdo atual (se necessário)

### **Durante o Upload:**
- [ ] Upload `index.html` → `public_html/`
- [ ] Upload pasta `assets/` → `public_html/assets/`
- [ ] Upload pasta `imagens/` → `public_html/imagens/`
- [ ] Upload `.htaccess` → `public_html/`

### **Após o Upload:**
- [ ] Testar https://slotbox.shop (sem 403)
- [ ] Verificar se assets carregam
- [ ] Verificar console do navegador
- [ ] Testar funcionalidades básicas

---

## 🎯 **RESULTADO ESPERADO**

Após o upload:

**✅ Frontend funcionando:**
- https://slotbox.shop carrega corretamente
- Sem erro 403
- Assets carregam
- Imagens carregam
- Funcionalidades operacionais

**✅ Sistema completo:**
- Frontend: https://slotbox.shop ✅
- Backend: https://slotbox-api.onrender.com ✅
- Integração: Frontend ↔ Backend ✅

---

## 🆘 **SUPORTE**

### **Se precisar de ajuda:**
1. **Verificar logs do Hostinger** (no painel)
2. **Testar URLs individuais** dos assets
3. **Verificar permissões** dos arquivos
4. **Contatar suporte do Hostinger** se necessário

---

**Instruções criadas em:** 15 de Setembro de 2025, 11:58  
**Status:** ✅ Arquivos prontos | ❌ Aguardando upload manual  
**Próxima ação:** Upload dos arquivos para Hostinger
