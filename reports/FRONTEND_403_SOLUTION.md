# 🚨 SOLUÇÃO PARA ERRO 403 NO FRONTEND

**Data:** 15 de Setembro de 2025  
**Problema:** Frontend retornando erro 403 (Forbidden)  
**Causa:** Arquivos não foram uploadados para o Hostinger  
**Solução:** Upload manual dos arquivos buildados

---

## 🔍 **DIAGNÓSTICO**

### ✅ **Status Atual:**
- **Backend:** ✅ Funcionando perfeitamente (https://slotbox-api.onrender.com)
- **Frontend:** ❌ Erro 403 (https://slotbox.shop)
- **Arquivos:** ✅ Prontos em `frontend/dist/`

### 📊 **Confirmação do Erro:**
```bash
# Teste realizado:
Invoke-WebRequest -Uri "https://slotbox.shop" -Method Head
# Resultado: (403) Proibido
```

---

## 🚀 **SOLUÇÃO: UPLOAD MANUAL PARA HOSTINGER**

### **PASSO 1: Acessar o Painel do Hostinger**

1. **Fazer login no Hostinger**
   - Acessar: https://hpanel.hostinger.com
   - Fazer login com suas credenciais

2. **Navegar para o Gerenciador de Arquivos**
   - No painel principal, procurar por "Gerenciador de Arquivos"
   - Ou acessar diretamente: https://hpanel.hostinger.com/file-manager

### **PASSO 2: Localizar o Diretório Correto**

1. **Encontrar o domínio**
   - Procurar por `slotbox.shop` ou `public_html`
   - Clicar no domínio correto

2. **Navegar para public_html**
   - Entrar na pasta `public_html`
   - Esta é a pasta raiz do seu site

### **PASSO 3: Fazer Backup do Conteúdo Atual**

1. **Verificar o que existe atualmente**
   - Listar arquivos na pasta `public_html`
   - Anotar o que está lá

2. **Fazer backup (se necessário)**
   - Selecionar todos os arquivos atuais
   - Criar uma pasta `backup_$(data_atual)`
   - Mover arquivos para a pasta de backup

### **PASSO 4: Upload dos Arquivos do Frontend**

1. **Preparar os arquivos localmente**
   - Navegar para: `C:\Users\USER\Desktop\Caixa Premiada\frontend\dist\`
   - Verificar se os arquivos estão lá:
     ```
     frontend/dist/
     ├── index.html
     ├── assets/
     │   ├── index-2vyOSPKb.css
     │   ├── ui-B3KIqm52.js
     │   ├── vendor-gH-7aFTg.js
     │   ├── router-Cj7dMlqZ.js
     │   ├── utils-BgsGIbzM.js
     │   └── index-BLCj0hNU.js
     ```

2. **Upload via Gerenciador de Arquivos**
   - No Hostinger, clicar em "Upload"
   - Selecionar todos os arquivos de `frontend/dist/`
   - Fazer upload para `public_html/`

3. **Verificar estrutura final**
   - `public_html/index.html` ✅
   - `public_html/assets/` (pasta com 6 arquivos) ✅

### **PASSO 5: Configurar Permissões**

1. **Verificar permissões dos arquivos**
   - Arquivos: 644 (rw-r--r--)
   - Pastas: 755 (rwxr-xr-x)

2. **Ajustar se necessário**
   - Selecionar arquivos → Propriedades → Permissões
   - Definir permissões corretas

### **PASSO 6: Configurar .htaccess (Opcional)**

1. **Criar arquivo .htaccess**
   - Criar arquivo `.htaccess` em `public_html/`
   - Conteúdo:
   ```apache
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

2. **Salvar o arquivo**
   - Upload do `.htaccess` para `public_html/`

---

## 🧪 **VALIDAÇÃO PÓS-UPLOAD**

### **Teste 1: Acesso Básico**
```bash
# Testar se o site carrega
https://slotbox.shop
```
**Resultado esperado:** Site carrega sem erro 403

### **Teste 2: Verificar Console do Navegador**
1. Abrir https://slotbox.shop
2. Pressionar F12 (DevTools)
3. Verificar se há erros no Console
4. Verificar se os assets carregam

### **Teste 3: Testar Funcionalidades**
- [ ] Página inicial carrega
- [ ] Navegação entre páginas
- [ ] Login/registro
- [ ] Modal de depósito PIX
- [ ] Abertura de caixas
- [ ] Sistema de saques

---

## 🔧 **ALTERNATIVAS SE O UPLOAD NÃO FUNCIONAR**

### **Opção 1: Upload via FTP**
1. **Configurar cliente FTP**
   - Usar FileZilla ou similar
   - Conectar com credenciais do Hostinger

2. **Upload via FTP**
   - Conectar ao servidor
   - Navegar para `public_html/`
   - Upload dos arquivos

### **Opção 2: Upload via cPanel (se disponível)**
1. **Acessar cPanel**
   - Procurar por "File Manager" no cPanel
   - Navegar para `public_html/`

2. **Upload via cPanel**
   - Usar interface do cPanel
   - Upload dos arquivos

### **Opção 3: Verificar Configurações do Hostinger**
1. **Verificar se o domínio está ativo**
   - No painel do Hostinger
   - Verificar status do domínio

2. **Verificar se há redirecionamentos**
   - Verificar configurações de DNS
   - Verificar se há redirecionamentos ativos

---

## 🆘 **TROUBLESHOOTING**

### **Se ainda der erro 403 após upload:**

1. **Verificar permissões**
   - Arquivos: 644
   - Pastas: 755
   - `public_html/`: 755

2. **Verificar se index.html existe**
   - Deve estar em `public_html/index.html`
   - Não em subpastas

3. **Verificar se assets carregam**
   - Testar: `https://slotbox.shop/assets/index-2vyOSPKb.css`
   - Deve retornar o arquivo CSS

4. **Verificar logs do Hostinger**
   - No painel, procurar por "Logs"
   - Verificar se há erros específicos

### **Se o site carregar mas não funcionar:**

1. **Verificar console do navegador**
   - F12 → Console
   - Verificar erros JavaScript

2. **Verificar se API está acessível**
   - Testar: `https://slotbox-api.onrender.com/api/health`
   - Deve retornar status 200

3. **Verificar CORS**
   - Verificar se frontend consegue acessar API
   - Verificar configurações de CORS no backend

---

## 📋 **CHECKLIST FINAL**

### **Antes do Upload:**
- [ ] Arquivos prontos em `frontend/dist/`
- [ ] Backup do conteúdo atual (se necessário)
- [ ] Acesso ao painel do Hostinger

### **Durante o Upload:**
- [ ] Upload de `index.html` para `public_html/`
- [ ] Upload da pasta `assets/` para `public_html/`
- [ ] Verificar permissões (644 para arquivos, 755 para pastas)
- [ ] Criar `.htaccess` (opcional)

### **Após o Upload:**
- [ ] Testar https://slotbox.shop (sem erro 403)
- [ ] Verificar se assets carregam
- [ ] Testar funcionalidades básicas
- [ ] Verificar console do navegador
- [ ] Testar integração com API

---

## 🎯 **RESULTADO ESPERADO**

Após seguir todos os passos:

**✅ Frontend funcionando:**
- https://slotbox.shop carrega corretamente
- Sem erro 403
- Assets carregam
- Funcionalidades operacionais

**✅ Sistema completo:**
- Frontend: https://slotbox.shop ✅
- Backend: https://slotbox-api.onrender.com ✅
- Integração: Frontend ↔ Backend ✅

---

**Guia criado em:** 15 de Setembro de 2025, 11:55  
**Status:** ❌ Frontend com erro 403 | ✅ Backend funcionando  
**Solução:** Upload manual dos arquivos para Hostinger
