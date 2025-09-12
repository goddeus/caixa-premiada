# Configuração para Deploy na Hostinger

## 🚀 Instruções de Deploy

### 1. Configurar Variável de Ambiente

Crie um arquivo `.env` na raiz do frontend com:

```
VITE_API_URL=https://slotbox-api.onrender.com/api
```

### 2. Build para Produção

```bash
cd frontend
npm install
npm run build
```

### 3. Upload na Hostinger

1. Faça upload de **TODOS** os arquivos da pasta `dist/` para o diretório público do seu domínio
2. Certifique-se de que o arquivo `index.html` está na raiz
3. As pastas `assets/` e `imagens/` devem estar junto com o `index.html`

### 4. Configuração do Backend (Render)

O backend já está configurado para aceitar requests de:
- https://slotbox.shop
- https://www.slotbox.shop

### 5. Teste Final

Acesse https://slotbox.shop e teste:
- Login/Registro ✅
- Dashboard ✅
- Abrir Caixas ✅
- Depósito/Saque ✅
- Afiliados ✅

## 🔧 Troubleshooting

### Erro de CORS
- Verifique se FRONTEND_URL=https://slotbox.shop está configurado no backend

### API não conecta
- Verifique se VITE_API_URL está correto no .env
- Teste: https://slotbox-api.onrender.com/api/health

### Páginas em branco
- Verifique se todos os arquivos da pasta dist/ foram enviados
- Certifique-se que o index.html está na raiz do domínio
