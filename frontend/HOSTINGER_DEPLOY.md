# 🚀 DEPLOY NA HOSTINGER - SLOT BOX

## 📋 INSTRUÇÕES PASSO A PASSO

### 1. 📁 PREPARAR ARQUIVOS
- A pasta `frontend/dist/` já está pronta com todos os arquivos
- O arquivo `.htaccess` já foi criado para funcionar na Hostinger

### 2. 🌐 FAZER UPLOAD NA HOSTINGER

#### Opção A: File Manager (Recomendado)
1. Acesse o **Painel de Controle** da Hostinger
2. Vá em **File Manager**
3. Navegue até a pasta `public_html`
4. **Delete todos os arquivos** da pasta `public_html` (se houver)
5. Faça upload de **TODOS os arquivos** da pasta `frontend/dist/` para `public_html`

#### Opção B: FTP
1. Use um cliente FTP (FileZilla, WinSCP)
2. Conecte com os dados da Hostinger
3. Navegue até `public_html`
4. Faça upload de todos os arquivos da pasta `frontend/dist/`

### 3. ⚙️ CONFIGURAR DOMÍNIO

#### Se usar subdomínio:
- Acesse: `https://seu-subdominio.hostinger.com`

#### Se usar domínio próprio:
- Acesse: `https://seudominio.com`

### 4. 🔧 CONFIGURAR API

**IMPORTANTE:** Antes de fazer o upload, configure a URL da API:

1. Abra o arquivo `frontend/env.production.txt`
2. Substitua `SEU_DOMINIO.com` pela URL do seu backend
3. Renomeie para `.env.production`
4. Regenere o build:
   ```bash
   cd frontend
   npm run build
   ```

### 5. 🎯 ESTRUTURA FINAL NO HOSTINGER

```
public_html/
├── index.html
├── .htaccess          # Configuração do Apache
├── assets/
│   ├── index-XXXXX.js
│   └── index-XXXXX.css
├── imagens/           # Todas as imagens das caixas
└── vite.svg
```

### 6. ✅ VERIFICAR SE FUNCIONOU

1. Acesse seu site
2. Deve aparecer a página do Slot Box
3. Teste o login/registro
4. Verifique se as imagens carregam
5. Teste uma caixa

### 7. 🚨 PROBLEMAS COMUNS

#### Página em branco:
- Verifique se todos os arquivos foram enviados
- Confirme se o `.htaccess` está na raiz
- Verifique o console do navegador (F12)

#### Erro 404 nas rotas:
- O `.htaccess` deve estar funcionando
- Verifique se o mod_rewrite está ativo na Hostinger

#### Imagens não carregam:
- Verifique se a pasta `imagens/` foi enviada
- Confirme se os caminhos estão corretos

#### API não funciona:
- Configure a URL correta no `.env.production`
- Verifique se o backend está rodando
- Confirme se o CORS está configurado no backend

### 8. 📞 SUPORTE

Se ainda não funcionar:
1. Verifique o console do navegador (F12)
2. Confirme se todos os arquivos foram enviados
3. Teste em modo incógnito
4. Verifique se o backend está respondendo

---

**🎉 SUCESSO!** Seu site estará funcionando na Hostinger!
