# Configuração do Frontend para Backend Separado

## 🔧 Configuração da Variável de Ambiente

Para conectar o frontend (hospedado na Hostinger) com o backend (no Render/Railway), configure a seguinte variável de ambiente no frontend:

### Na Hostinger

1. Acesse o painel da Hostinger
2. Vá em **File Manager** do seu domínio
3. Edite ou crie o arquivo `.env` na raiz do projeto frontend
4. Adicione:

```bash
VITE_API_URL=https://sua-app.onrender.com/api
```

**Substitua `sua-app.onrender.com` pela URL real do seu backend.**

### Exemplo de URLs

- **Render**: `https://slotbox-api.onrender.com/api`
- **Railway**: `https://slotbox-api.up.railway.app/api`

### Verificação

1. Após configurar, teste acessando:
   - `https://slotbox.shop` (seu frontend)
   - Login/registro deve funcionar
   - Abertura de caixas deve funcionar

### Troubleshooting

#### Frontend não conecta com backend
- Verifique se `VITE_API_URL` está correto
- URL deve terminar com `/api`
- Backend deve estar rodando

#### Erro de CORS
- Verifique se `FRONTEND_URL=https://slotbox.shop` está configurado no backend
- Ambos devem usar HTTPS

#### 404 nas chamadas da API
- Verifique se todas as rotas estão implementadas no backend
- Teste diretamente: `https://sua-app.onrender.com/api/health`

### Endpoints que devem funcionar

- `/api/auth/login` - Login
- `/api/auth/register` - Registro  
- `/api/caixas` - Listar caixas
- `/api/caixas/:id/abrir` - Abrir caixa
- `/api/payments/deposit` - Depósito
- `/api/payments/withdraw` - Saque
- `/api/affiliate/*` - Sistema de afiliados

## ✅ Teste Final

Execute este teste no console do navegador (F12):

```javascript
// Teste de conectividade
fetch('https://sua-app.onrender.com/api/health')
  .then(r => r.json())
  .then(data => console.log('Backend OK:', data))
  .catch(err => console.error('Erro:', err));
```

Deve retornar: `Backend OK: {success: true, message: "API funcionando corretamente"}`
