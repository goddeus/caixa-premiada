# 🚀 INSTRUÇÕES DE UPLOAD - HOSTINGER

## 📋 CHECKLIST DE UPLOAD

### ✅ 1. ACESSAR HOSTINGER
- [ ] Acesse: https://hpanel.hostinger.com
- [ ] Faça login na sua conta
- [ ] Vá para "File Manager"

### ✅ 2. LIMPAR ARQUIVOS ANTIGOS
- [ ] Navegue para `public_html`
- [ ] Delete todos os arquivos antigos
- [ ] Mantenha apenas a pasta `imagens` se existir

### ✅ 3. UPLOAD DOS ARQUIVOS
- [ ] Faça upload de TODOS os arquivos da pasta `deploy-files`
- [ ] Certifique-se de que o `index.html` está na raiz
- [ ] Verifique se a pasta `imagens` foi criada
- [ ] Verifique se a pasta `assets` foi criada

### ✅ 4. VERIFICAR ESTRUTURA
A estrutura deve ficar assim:
```
public_html/
├── index.html
├── vite.svg
├── .htaccess
├── assets/
│   ├── index-B86QGSNH.js
│   ├── index-GfG6far8.css
│   ├── router-DDWpEpS-.js
│   ├── ui-DSoVV75L.js
│   ├── utils-DdvONtCs.js
│   └── vendor-gH-7aFTg.js
└── imagens/
    ├── aovivo.png
    ├── banner.png
    ├── CAIXA APPLE/
    ├── CAIXA CONSOLE DOS SONHOS/
    ├── CAIXA FINAL DE SEMANA/
    ├── CAIXA KIT NIKE/
    ├── CAIXA PREMIUM MASTER/
    ├── CAIXA SAMSUNG/
    └── ... (todas as imagens)
```

### ✅ 5. CONFIGURAR DOMÍNIO
- [ ] Vá para "Domains" no painel
- [ ] Configure o domínio `slotbox.shop`
- [ ] Aponte para `public_html`

### ✅ 6. TESTAR SITE
- [ ] Acesse: https://slotbox.shop
- [ ] Verifique se carrega corretamente
- [ ] Teste navegação entre páginas
- [ ] Verifique se imagens carregam

## 🔧 CONFIGURAÇÕES IMPORTANTES

### .htaccess
O arquivo `.htaccess` já está incluído e configurado para:
- ✅ Redirecionamento HTTPS
- ✅ SPA Routing (React Router)
- ✅ Compressão GZIP
- ✅ Cache de arquivos
- ✅ Segurança

### Variáveis de Ambiente
O frontend está configurado para usar:
- ✅ API Backend: `https://slotbox-api.onrender.com`
- ✅ Ambiente: Produção
- ✅ URLs corretas

## 🚨 TROUBLESHOOTING

### Erro 404 em rotas
- Verifique se o `.htaccess` foi uploadado
- Verifique se o mod_rewrite está habilitado

### Imagens não carregam
- Verifique se a pasta `imagens` foi uploadada
- Verifique permissões da pasta

### API não conecta
- Verifique se o backend está rodando
- Verifique CORS no backend

## 📞 SUPORTE

Se houver problemas:
1. Verifique os logs do Hostinger
2. Teste o backend: https://slotbox-api.onrender.com/api/health
3. Verifique o console do navegador (F12)

## 🎉 SUCESSO!

Após seguir todos os passos, seu site estará online em:
**https://slotbox.shop**
