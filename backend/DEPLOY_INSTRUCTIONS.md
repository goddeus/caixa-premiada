# Instruções de Deploy - Backend Caixa Premiada

## 🚀 Deploy no Render/Railway

### Pré-requisitos
- Conta no [Render](https://render.com) ou [Railway](https://railway.app)
- Repositório GitHub com o código do backend
- Banco PostgreSQL configurado

### 1. Configuração do Banco de Dados

#### Render
1. Vá em **Dashboard** → **New** → **PostgreSQL**
2. Configure o nome do banco
3. Anote a **DATABASE_URL** gerada

#### Railway
1. Vá em **New Project** → **Provision PostgreSQL**
2. Anote a **DATABASE_URL** na aba **Variables**

### 2. Deploy do Backend

#### Render
1. **Dashboard** → **New** → **Web Service**
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `slotbox-api` (ou nome de sua escolha)
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

#### Railway
1. **New Project** → **Deploy from GitHub repo**
2. Selecione seu repositório
3. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`

### 3. Variáveis de Ambiente

Configure as seguintes variáveis no painel do Render/Railway:

```bash
# Servidor
PORT=65002
NODE_ENV=production

# Database (use a URL do PostgreSQL criado)
DATABASE_URL=postgres://usuario:senha@host:5432/database

# JWT
JWT_SECRET=sua_chave_jwt_super_secreta_aqui_2024

# Frontend
FRONTEND_URL=https://slotbox.shop

# RTP
RTP_GLOBAL=10.0
RTP_DEMO=70.0
DEMO_PURCHASES_ENABLED=false

# VizzionPay/BullsPay
VIZZIONPAY_API_KEY=sua_api_key_vizzionpay_aqui
VIZZIONPAY_BASE_URL=https://api.vizzionpay.com.br
VIZZIONPAY_WEBHOOK_SECRET=seu_webhook_secret_aqui
VIZZIONPAY_PIX_KEY=seu_pix_key_aqui
VIZZIONPAY_PIX_KEY_TYPE=email

# URLs (substitua pela URL do seu backend)
BASE_URL=https://slotbox-api.onrender.com
API_BASE_URL=https://slotbox-api.onrender.com
```

### 4. Configuração do Frontend

No frontend hospedado na Hostinger, configure a variável:

```bash
VITE_API_URL=https://slotbox-api.onrender.com
```

### 5. Endpoints Disponíveis

Após o deploy, os seguintes endpoints estarão disponíveis:

#### Públicos
- `GET /` - Informações da API
- `GET /api/health` - Health check

#### Autenticação
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Dados do usuário

#### Caixas e Jogos
- `GET /api/caixas` - Listar caixas
- `POST /api/caixas/:id/abrir` - Abrir caixa
- `GET /api/cases` - Casos disponíveis
- `POST /api/bulk-purchase` - Compras múltiplas

#### Carteira e Transações
- `GET /api/wallet` - Saldo
- `POST /api/wallet/deposit` - Depósito
- `POST /api/wallet/withdraw` - Saque
- `GET /api/transactions` - Transações

#### Afiliados
- `GET /api/affiliate` - Dados de afiliado
- `POST /api/affiliate/generate-code` - Gerar código

#### Admin (requer permissões)
- `GET /api/admin/dashboard/stats` - Estatísticas
- `GET /api/admin/users` - Usuários
- Outros endpoints administrativos...

### 6. Verificação do Deploy

1. Acesse `https://sua-app.onrender.com/api/health`
2. Deve retornar: `{"success": true, "message": "API funcionando corretamente"}`
3. Teste o login/registro através do frontend

### 7. Monitoramento

- **Render**: Logs disponíveis no dashboard
- **Railway**: Logs na aba **Deployments**
- Health check automático em `/api/health`

### 8. Troubleshooting

#### Erro de CORS
- Verifique se `FRONTEND_URL` está correto
- Frontend deve usar HTTPS

#### Erro de Banco
- Verifique `DATABASE_URL`
- Execute migrations se necessário

#### Timeout
- Render tem limite de 30s para resposta
- Otimize consultas pesadas

### 9. Backup e Segurança

- Configure backups automáticos do PostgreSQL
- Use HTTPS sempre
- Mantenha `JWT_SECRET` seguro
- Configure rate limiting adequado

## ✅ Checklist Final

- [ ] Backend deployado e funcionando
- [ ] Health check retornando OK
- [ ] Frontend conectando com backend
- [ ] Login/registro funcionando
- [ ] Caixas abrindo corretamente
- [ ] Sistema de afiliados ativo
- [ ] Depósitos/saques funcionando
- [ ] RTP configurado corretamente
