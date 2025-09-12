# 🔧 CONFIGURAÇÃO HOSTINGER - SLOT BOX

## 📁 ESTRUTURA DE ARQUIVOS

Após o build, você deve ter esta estrutura na pasta `deploy-files/`:

```
deploy-files/
├── .htaccess          ← Arquivo de configuração Apache
├── index.html         ← Página principal
├── vite.svg          ← Ícone
├── assets/           ← Pasta com JS e CSS
│   ├── index-*.js
│   ├── index-*.css
│   └── ...
└── imagens/          ← Pasta com imagens
    ├── banner.png
    ├── caixa-*.png
    └── ...
```

## 🚀 INSTRUÇÕES DE UPLOAD

### 1. Acessar cPanel da Hostinger
- Login: https://hpanel.hostinger.com
- Acessar: **Gerenciador de Arquivos**

### 2. Navegar para public_html
- Ir para: `public_html/`
- **IMPORTANTE**: Limpar pasta atual (fazer backup se necessário)

### 3. Upload dos Arquivos
- Upload da pasta `deploy-files/` inteira
- Ou upload arquivo por arquivo:
  - `.htaccess` (na raiz)
  - `index.html` (na raiz)
  - `vite.svg` (na raiz)
  - Pasta `assets/` completa
  - Pasta `imagens/` completa

### 4. Verificar Permissões
- `.htaccess`: 644
- `index.html`: 644
- Arquivos JS/CSS: 644
- Imagens: 644

## ⚙️ CONFIGURAÇÕES IMPORTANTES

### Arquivo .htaccess
O arquivo `.htaccess` já está configurado para:
- ✅ Roteamento SPA (Single Page Application)
- ✅ Headers de segurança
- ✅ Compressão Gzip
- ✅ Cache de arquivos estáticos

### URLs de Teste
Após o upload, testar estas URLs:
- `https://slotbox.shop/` - Página principal
- `https://slotbox.shop/admin` - Painel admin
- `https://slotbox.shop/dashboard` - Dashboard
- `https://slotbox.shop/nike-case` - Caixa Nike

## 🔍 TROUBLESHOOTING

### Problema: 404 em rotas do React
**Solução**: Verificar se o arquivo `.htaccess` foi uploadado corretamente

### Problema: Arquivos não carregam
**Solução**: Verificar permissões dos arquivos (644)

### Problema: CSS/JS não aplicam
**Solução**: Limpar cache do navegador (Ctrl+F5)

### Problema: Imagens não aparecem
**Solução**: Verificar se a pasta `imagens/` foi uploadada

## 📱 TESTE MOBILE

Após o upload, testar em dispositivos móveis:
- [ ] Página carrega corretamente
- [ ] Navegação funciona
- [ ] Imagens aparecem
- [ ] CSS responsivo aplicado

## 🔄 ATUALIZAÇÕES FUTURAS

Para atualizar o site:
1. Executar `build-production.bat`
2. Fazer upload apenas dos arquivos modificados
3. Ou fazer upload completo da pasta `deploy-files/`

## 📞 SUPORTE

Se houver problemas:
1. Verificar logs de erro no cPanel
2. Testar URLs individualmente
3. Verificar se todos os arquivos foram uploadados
4. Limpar cache do navegador

---

**Status**: ✅ PRONTO PARA UPLOAD
**Arquivos**: deploy-files/
**Destino**: public_html/
