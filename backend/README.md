# 🎁 Backend - Caixa Premiada

Backend da plataforma Caixa Premiada desenvolvido com Node.js, Express, Prisma e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **bcrypt** - Hash de senhas
- **Helmet** - Segurança
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Proteção contra spam

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL 15+
- Docker (opcional)

## 🛠️ Instalação

### 1. Clone o repositório
```bash
git clone <repository-url>
cd caixa-premiada/backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/caixa_premiada?schema=public"
JWT_SECRET="sua_chave_secreta_muito_segura_aqui_2024"
PORT=3001
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"
```

### 4. Configure o banco de dados
```bash
# Gerar cliente Prisma
npm run db:generate

# Criar tabelas no banco
npm run db:push

# Executar seed (dados iniciais)
npm run db:seed
```

### 5. Inicie o servidor
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 🐳 Docker

### Usando Docker Compose (recomendado)
```bash
# Na raiz do projeto
docker-compose up -d
```

### Usando Docker individual
```bash
# Construir imagem
docker build -t caixa-premiada-backend .

# Executar container
docker run -p 3001:3001 --env-file .env caixa-premiada-backend
```

## 📚 API Endpoints

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login
- `GET /auth/me` - Dados do usuário logado

### Carteira
- `GET /wallet` - Consultar saldo
- `POST /wallet/deposit` - Fazer depósito
- `POST /wallet/withdraw` - Solicitar saque

### Caixas
- `GET /cases` - Listar caixas
- `GET /cases/:id` - Buscar caixa específica
- `POST /cases/open/:id` - Abrir caixa
- `GET /cases/history` - Histórico do usuário
- `GET /cases/winners/recent` - Ganhadores recentes

### Transações
- `GET /transactions` - Listar transações

### Afiliados
- `GET /affiliate` - Link de indicação
- `GET /affiliate/stats` - Estatísticas
- `POST /affiliate/register` - Registrar indicação

### Admin
- `GET /admin/cases` - Listar caixas (admin)
- `POST /admin/cases` - Criar caixa
- `PUT /admin/cases/:id` - Atualizar caixa
- `DELETE /admin/cases/:id` - Deletar caixa
- `GET /admin/users` - Listar usuários
- `GET /admin/transactions` - Listar transações
- `GET /admin/stats` - Estatísticas gerais

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação. Para endpoints protegidos, inclua o header:

```
Authorization: Bearer <token>
```

## 📊 Banco de Dados

### Tabelas principais:
- `users` - Usuários
- `wallets` - Carteiras
- `cases` - Caixas
- `prizes` - Prêmios
- `transactions` - Transações
- `affiliates` - Afiliados
- `affiliate_history` - Histórico de indicações

### Comandos úteis:
```bash
# Abrir Prisma Studio
npm run db:studio

# Criar migration
npx prisma migrate dev

# Resetar banco
npx prisma migrate reset
```

## 🧪 Dados de Teste

O seed cria automaticamente:
- **Admin**: admin@caixapremiada.com / admin123
- **Usuário teste**: teste@caixapremiada.com / test123
- **3 caixas** com prêmios configurados

## 🔧 Scripts Disponíveis

- `npm start` - Iniciar em produção
- `npm run dev` - Iniciar em desenvolvimento
- `npm run db:generate` - Gerar cliente Prisma
- `npm run db:push` - Sincronizar banco
- `npm run db:migrate` - Executar migrations
- `npm run db:studio` - Abrir Prisma Studio
- `npm run db:seed` - Executar seed

## 🚀 Deploy

### Railway
1. Conecte seu repositório ao Railway
2. Configure as variáveis de ambiente
3. Deploy automático

### AWS
1. Use Docker para containerização
2. Deploy no ECS ou EC2
3. Configure RDS para PostgreSQL

### Vercel
1. Configure como Node.js app
2. Use PostgreSQL externo
3. Configure variáveis de ambiente

## 📝 Licença

MIT License - veja o arquivo LICENSE para detalhes.
