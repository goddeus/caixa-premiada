# Inventário de Rotas - SlotBox API

**Data:** 15/09/2025, 11:18:50
**Base URL:** https://slotbox-api.onrender.com

## Resumo

- **Total de rotas:** 34
- **Sucessos:** 10
- **Falhas:** 24
- **Tempo médio de resposta:** 526ms

## Detalhes das Rotas

| Método | Rota | Descrição | Auth | Admin | Status | Tempo (ms) | Erro |
|--------|------|-----------|------|-------|--------|------------|------|
| GET | / | Rota raiz | ❌ | ❌ | ✅ 200 | 608 | - |
| GET | /api/health | Health check | ❌ | ❌ | ✅ 200 | 245 | - |
| GET | /api/cases | Listar caixas | ❌ | ❌ | ✅ 200 | 808 | - |
| GET | /api/prizes | Listar prêmios | ❌ | ❌ | ✅ 200 | 364 | - |
| POST | /api/auth/register | Registrar usuário | ❌ | ❌ | ❌ 400 | 420 | Request failed with status code 400... |
| POST | /api/auth/login | Login | ❌ | ❌ | ✅ 200 | 2566 | - |
| GET | /api/wallet | Consultar saldo | ✅ | ❌ | ❌ 401 | 233 | Request failed with status code 401... |
| GET | /api/profile | Dados do perfil | ✅ | ❌ | ❌ 401 | 241 | Request failed with status code 401... |
| GET | /api/transactions | Histórico de transações | ✅ | ❌ | ❌ 401 | 252 | Request failed with status code 401... |
| GET | /api/transactions/demo | Histórico de transações demo | ✅ | ❌ | ❌ 401 | 251 | Request failed with status code 401... |
| GET | /api/payments/history | Histórico de pagamentos | ✅ | ❌ | ❌ 401 | 241 | Request failed with status code 401... |
| POST | /api/deposit/pix | Criar depósito PIX | ✅ | ❌ | ❌ 400 | 230 | Request failed with status code 400... |
| POST | /api/withdraw/pix | Criar saque PIX | ✅ | ❌ | ❌ 400 | 233 | Request failed with status code 400... |
| GET | /api/cases/premios | Listar prêmios de todas as caixas | ❌ | ❌ | ❌ 404 | 554 | Request failed with status code 404... |
| GET | /api/cases/history | Histórico de aberturas | ✅ | ❌ | ❌ 404 | 472 | Request failed with status code 404... |
| GET | /api/cases/rtp/stats | Estatísticas RTP | ✅ | ❌ | ❌ 401 | 591 | Request failed with status code 401... |
| GET | /api/admin/dashboard/stats | Estatísticas do dashboard | ✅ | ✅ | ❌ 401 | 235 | Request failed with status code 401... |
| GET | /api/admin/users | Listar usuários | ✅ | ✅ | ❌ 401 | 234 | Request failed with status code 401... |
| GET | /api/admin/deposits | Listar depósitos | ✅ | ✅ | ❌ 401 | 239 | Request failed with status code 401... |
| GET | /api/admin/withdrawals | Listar saques | ✅ | ✅ | ❌ 401 | 241 | Request failed with status code 401... |
| GET | /api/admin/affiliates | Listar afiliados | ✅ | ✅ | ❌ 401 | 335 | Request failed with status code 401... |
| GET | /api/admin/logs | Logs administrativos | ✅ | ✅ | ❌ 401 | 255 | Request failed with status code 401... |
| GET | /api/admin/login-history | Histórico de login | ✅ | ✅ | ❌ 401 | 227 | Request failed with status code 401... |
| GET | /api/admin/settings | Configurações do sistema | ✅ | ✅ | ❌ 401 | 244 | Request failed with status code 401... |
| GET | /api/admin/rtp/config | Configuração RTP | ✅ | ✅ | ❌ 401 | 243 | Request failed with status code 401... |
| GET | /api/admin/cashflow/liquido | Caixa líquido | ✅ | ✅ | ❌ 401 | 235 | Request failed with status code 401... |
| GET | /api/admin/cashflow/stats | Estatísticas de fluxo de caixa | ✅ | ✅ | ❌ 401 | 242 | Request failed with status code 401... |
| GET | /api/admin/audit/logs | Logs de auditoria | ✅ | ✅ | ❌ 401 | 248 | Request failed with status code 401... |
| POST | /api/webhook/pix | Webhook PIX | ❌ | ❌ | ✅ 200 | 235 | - |
| POST | /api/webhook/withdraw | Webhook saque | ❌ | ❌ | ❌ 401 | 238 | Request failed with status code 401... |
| GET | /api/db-test | Teste de conexão com banco | ❌ | ❌ | ✅ 200 | 424 | - |
| GET | /api/vizzionpay-test | Teste VizzionPay | ❌ | ❌ | ✅ 200 | 237 | - |
| POST | /api/init-db | Inicializar banco | ❌ | ❌ | ✅ 200 | 458 | - |
| POST | /api/init-demo-accounts | Inicializar contas demo | ❌ | ❌ | ✅ 200 | 4993 | - |

## Rotas por Categoria

### Públicas

- ✅ **GET** / - Rota raiz
- ✅ **GET** /api/health - Health check
- ✅ **GET** /api/cases - Listar caixas
- ✅ **GET** /api/prizes - Listar prêmios
- ❌ **POST** /api/auth/register - Registrar usuário
- ✅ **POST** /api/auth/login - Login
- ❌ **GET** /api/cases/premios - Listar prêmios de todas as caixas
- ✅ **POST** /api/webhook/pix - Webhook PIX
- ❌ **POST** /api/webhook/withdraw - Webhook saque
- ✅ **GET** /api/db-test - Teste de conexão com banco
- ✅ **GET** /api/vizzionpay-test - Teste VizzionPay
- ✅ **POST** /api/init-db - Inicializar banco
- ✅ **POST** /api/init-demo-accounts - Inicializar contas demo

### Autenticadas

- ❌ **GET** /api/wallet - Consultar saldo
- ❌ **GET** /api/profile - Dados do perfil
- ❌ **GET** /api/transactions - Histórico de transações
- ❌ **GET** /api/transactions/demo - Histórico de transações demo
- ❌ **GET** /api/payments/history - Histórico de pagamentos
- ❌ **POST** /api/deposit/pix - Criar depósito PIX
- ❌ **POST** /api/withdraw/pix - Criar saque PIX
- ❌ **GET** /api/cases/history - Histórico de aberturas
- ❌ **GET** /api/cases/rtp/stats - Estatísticas RTP

### Admin

- ❌ **GET** /api/admin/dashboard/stats - Estatísticas do dashboard
- ❌ **GET** /api/admin/users - Listar usuários
- ❌ **GET** /api/admin/deposits - Listar depósitos
- ❌ **GET** /api/admin/withdrawals - Listar saques
- ❌ **GET** /api/admin/affiliates - Listar afiliados
- ❌ **GET** /api/admin/logs - Logs administrativos
- ❌ **GET** /api/admin/login-history - Histórico de login
- ❌ **GET** /api/admin/settings - Configurações do sistema
- ❌ **GET** /api/admin/rtp/config - Configuração RTP
- ❌ **GET** /api/admin/cashflow/liquido - Caixa líquido
- ❌ **GET** /api/admin/cashflow/stats - Estatísticas de fluxo de caixa
- ❌ **GET** /api/admin/audit/logs - Logs de auditoria

## Problemas Identificados

- **POST /api/auth/register**: Request failed with status code 400
- **GET /api/wallet**: Request failed with status code 401
- **GET /api/profile**: Request failed with status code 401
- **GET /api/transactions**: Request failed with status code 401
- **GET /api/transactions/demo**: Request failed with status code 401
- **GET /api/payments/history**: Request failed with status code 401
- **POST /api/deposit/pix**: Request failed with status code 400
- **POST /api/withdraw/pix**: Request failed with status code 400
- **GET /api/cases/premios**: Request failed with status code 404
- **GET /api/cases/history**: Request failed with status code 404
- **GET /api/cases/rtp/stats**: Request failed with status code 401
- **GET /api/admin/dashboard/stats**: Request failed with status code 401
- **GET /api/admin/users**: Request failed with status code 401
- **GET /api/admin/deposits**: Request failed with status code 401
- **GET /api/admin/withdrawals**: Request failed with status code 401
- **GET /api/admin/affiliates**: Request failed with status code 401
- **GET /api/admin/logs**: Request failed with status code 401
- **GET /api/admin/login-history**: Request failed with status code 401
- **GET /api/admin/settings**: Request failed with status code 401
- **GET /api/admin/rtp/config**: Request failed with status code 401
- **GET /api/admin/cashflow/liquido**: Request failed with status code 401
- **GET /api/admin/cashflow/stats**: Request failed with status code 401
- **GET /api/admin/audit/logs**: Request failed with status code 401
- **POST /api/webhook/withdraw**: Request failed with status code 401
