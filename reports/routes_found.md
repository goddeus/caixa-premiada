# Análise de Rotas do Backend

**Data:** 2025-09-16T12:25:10.191Z
**Total de rotas encontradas:** 148

## Resumo por Método HTTP

- **GET:** 77 rotas
- **PUT:** 7 rotas
- **POST:** 61 rotas
- **PATCH:** 1 rotas
- **DELETE:** 2 rotas

## Rotas Detalhadas

| Método | Rota | Arquivo | Handler |
|--------|------|---------|----------|
| GET | /dashboard/stats | admin.js | N/A |
| GET | /users | admin.js | N/A |
| PUT | /users/:userId | admin.js | N/A |
| POST | /users/:userId/reset-password | admin.js | N/A |
| GET | /deposits | admin.js | N/A |
| GET | /withdrawals | admin.js | N/A |
| PUT | /withdrawals/:withdrawalId/status | admin.js | N/A |
| GET | /affiliates | admin.js | N/A |
| PUT | /affiliate-withdrawals/:withdrawalId/status | admin.js | N/A |
| GET | /logs | admin.js | N/A |
| GET | /login-history | admin.js | N/A |
| POST | /add-test-funds | admin.js | N/A |
| POST | /clear-house-data | admin.js | N/A |
| GET | /settings | admin.js | N/A |
| PUT | /settings/:key | admin.js | N/A |
| POST | /add-test-balance/:userId | admin.js | N/A |
| GET | /rtp/config | admin.js | N/A |
| PUT | /rtp/target | admin.js | N/A |
| GET | /rtp/recommended | admin.js | N/A |
| POST | /rtp/apply-recommendation | admin.js | N/A |
| GET | /rtp/cashflow-stats | admin.js | N/A |
| GET | /rtp/history | admin.js | N/A |
| GET | /cashflow/liquido | admin.js | N/A |
| GET | /cashflow/stats | admin.js | N/A |
| POST | /cashflow/transacao | admin.js | N/A |
| GET | /cashflow/history | admin.js | N/A |
| POST | /cashflow/validar | admin.js | N/A |
| GET | /audit/logs | admin.js | N/A |
| GET | /rtp/protection-stats | admin.js | N/A |
| POST | /fix-case-prices | admin.js | N/A |
| POST | /sync-prizes-images | admin.js | N/A |
| GET | /prizes-consistency-report | admin.js | N/A |
| GET | /migrations/status | admin.js | N/A |
| POST | /migrations/seed-audit | admin.js | N/A |
| POST | /run-full-prize-check | adminPrizeCheck.js | N/A |
| GET | /full-prize-check-report/:timestamp | adminPrizeCheck.js | N/A |
| GET | /prize-status | adminPrizeCheck.js | N/A |
| GET | /validate/:code | affiliate.js | N/A |
| POST | /create | affiliate.js | N/A |
| GET | / | affiliate.js | N/A |
| GET | /me | affiliate.js | N/A |
| GET | /stats | affiliate.js | N/A |
| GET | /referrals | affiliate.js | N/A |
| GET | /commissions | affiliate.js | N/A |
| POST | /withdraw | affiliate.js | N/A |
| GET | /withdrawals | affiliate.js | N/A |
| POST | /register | auth.js | N/A |
| POST | /login | auth.js | N/A |
| GET | /me | auth.js | N/A |
| POST | /refresh | auth.js | N/A |
| POST | /bulk | bulkPurchase.js | N/A |
| GET | /audit/:purchaseId | bulkPurchase.js | N/A |
| GET | /audit | bulkPurchase.js | N/A |
| GET | /audit-report | bulkPurchase.js | N/A |
| POST | /verify-discrepancies | bulkPurchase.js | N/A |
| GET | / | caixas.js | N/A |
| GET | /stats | caixas.js | N/A |
| GET | /:id | caixas.js | N/A |
| GET | /:id/historico | caixas.js | N/A |
| POST | /:id/abrir | caixas.js | N/A |
| GET | /caixas | casePrize.js | N/A |
| GET | /caixas/:caixaId/premios | casePrize.js | N/A |
| POST | /caixas/:caixaId/audit | casePrize.js | N/A |
| PUT | /premios/:prizeId | casePrize.js | N/A |
| GET | / | cases.js | N/A |
| GET | /premios | cases.js | N/A |
| GET | /map/:frontendId | cases.js | N/A |
| GET | /:id | cases.js | N/A |
| POST | /debit/:id | cases.js | N/A |
| POST | /draw/:id | cases.js | N/A |
| POST | /buy/:id | cases.js | N/A |
| POST | /buy-multiple/:id | cases.js | N/A |
| POST | /credit/:id | cases.js | N/A |
| GET | /history | cases.js | N/A |
| GET | /rtp/stats | cases.js | N/A |
| GET | /rtp/stats/:caseId | cases.js | N/A |
| POST | /rtp/end/:caseId | cases.js | N/A |
| GET | /cases | compra.js | N/A |
| GET | /cases/:id | compra.js | N/A |
| POST | /buy/:id | compra.js | N/A |
| POST | /buy-multiple/:id | compra.js | N/A |
| POST | /pix | depositRoutes.js | N/A |
| GET | / | gatewayConfig.js | N/A |
| GET | /supported | gatewayConfig.js | N/A |
| GET | /active | gatewayConfig.js | N/A |
| GET | /:gatewayName | gatewayConfig.js | N/A |
| POST | /:gatewayName | gatewayConfig.js | N/A |
| PATCH | /:gatewayName/toggle | gatewayConfig.js | N/A |
| POST | /:gatewayName/test | gatewayConfig.js | N/A |
| POST | /:gatewayName/validate | gatewayConfig.js | N/A |
| DELETE | /:gatewayName | gatewayConfig.js | N/A |
| POST | /sortear/:caseId | globalDraw.js | N/A |
| GET | /stats | globalDraw.js | N/A |
| GET | /logs | globalDraw.js | N/A |
| GET | /security-report | globalDraw.js | N/A |
| POST | /emergency-mode/activate | globalDraw.js | N/A |
| POST | /emergency-mode/deactivate | globalDraw.js | N/A |
| GET | /audit-stats | globalDraw.js | N/A |
| POST | /premios/upload-image | imageUpload.js | N/A |
| DELETE | /premios/:prizeId/image | imageUpload.js | N/A |
| POST | /deposit | payments.js | N/A |
| POST | /deposit/pix | payments.js | N/A |
| POST | /deposit/callback | payments.js | N/A |
| POST | /webhook/vizzion | payments.js | N/A |
| POST | /withdraw | payments.js | N/A |
| POST | /withdraw/callback | payments.js | N/A |
| GET | /history | payments.js | N/A |
| GET | /:id | payments.js | N/A |
| GET | /:id/status | payments.js | N/A |
| POST | /run | prizeAudit.js | N/A |
| POST | /normalize | prizeAudit.js | N/A |
| GET | /stats | prizeAudit.js | N/A |
| POST | /case/:caseId | prizeAudit.js | N/A |
| GET | /validate/:prizeId | prizeAudit.js | N/A |
| GET | /normalization-stats | prizeAudit.js | N/A |
| GET | /stats | prizes.js | N/A |
| GET | /caixa-liquido | prizes.js | N/A |
| GET | /fundo-premios | prizes.js | N/A |
| POST | /simulate | prizes.js | N/A |
| POST | /sync-prizes-from-folders | prizeSync.js | N/A |
| GET | /sync-report/:timestamp | prizeSync.js | N/A |
| GET | /backups | prizeSync.js | N/A |
| POST | /restore-database | prizeSync.js | N/A |
| POST | /restore-images | prizeSync.js | N/A |
| GET | /audit-prizes | prizeSync.js | N/A |
| POST | /verificar | prizeValidation.js | N/A |
| POST | /corrigir-automaticamente | prizeValidation.js | N/A |
| GET | /estatisticas | prizeValidation.js | N/A |
| GET | /validar/:prizeId | prizeValidation.js | N/A |
| GET | / | profile.js | N/A |
| PUT | / | profile.js | N/A |
| GET | /game-history | profile.js | N/A |
| POST | /seed-demo-users | seedRoutes.js | N/A |
| POST | /update-all-affiliates | seedRoutes.js | N/A |
| POST | /initialize-prizes | seedRoutes.js | N/A |
| GET | / | transactions.js | N/A |
| GET | /recent-winners | transactions.js | N/A |
| GET | /daily-ranking | transactions.js | N/A |
| POST | /deposit | transactions.js | N/A |
| GET | / | wallet.js | N/A |
| POST | /deposit | wallet.js | N/A |
| POST | /withdraw | wallet.js | N/A |
| POST | /recharge-demo | wallet.js | N/A |
| POST | /pix | webhookRoutes.js | N/A |
| POST | /withdraw | webhookRoutes.js | N/A |
| POST | /pix | withdrawRoutes.js | N/A |
| GET | /history/:userId | withdrawRoutes.js | N/A |
| GET | /stats | withdrawRoutes.js | N/A |

## Rotas por Arquivo

### admin.js

- **GET** /dashboard/stats
- **GET** /users
- **PUT** /users/:userId
- **POST** /users/:userId/reset-password
- **GET** /deposits
- **GET** /withdrawals
- **PUT** /withdrawals/:withdrawalId/status
- **GET** /affiliates
- **PUT** /affiliate-withdrawals/:withdrawalId/status
- **GET** /logs
- **GET** /login-history
- **POST** /add-test-funds
- **POST** /clear-house-data
- **GET** /settings
- **PUT** /settings/:key
- **POST** /add-test-balance/:userId
- **GET** /rtp/config
- **PUT** /rtp/target
- **GET** /rtp/recommended
- **POST** /rtp/apply-recommendation
- **GET** /rtp/cashflow-stats
- **GET** /rtp/history
- **GET** /cashflow/liquido
- **GET** /cashflow/stats
- **POST** /cashflow/transacao
- **GET** /cashflow/history
- **POST** /cashflow/validar
- **GET** /audit/logs
- **GET** /rtp/protection-stats
- **POST** /fix-case-prices
- **POST** /sync-prizes-images
- **GET** /prizes-consistency-report
- **GET** /migrations/status
- **POST** /migrations/seed-audit

### adminPrizeCheck.js

- **POST** /run-full-prize-check
- **GET** /full-prize-check-report/:timestamp
- **GET** /prize-status

### affiliate.js

- **GET** /validate/:code
- **POST** /create
- **GET** /
- **GET** /me
- **GET** /stats
- **GET** /referrals
- **GET** /commissions
- **POST** /withdraw
- **GET** /withdrawals

### auth.js

- **POST** /register
- **POST** /login
- **GET** /me
- **POST** /refresh

### bulkPurchase.js

- **POST** /bulk
- **GET** /audit/:purchaseId
- **GET** /audit
- **GET** /audit-report
- **POST** /verify-discrepancies

### caixas.js

- **GET** /
- **GET** /stats
- **GET** /:id
- **GET** /:id/historico
- **POST** /:id/abrir

### casePrize.js

- **GET** /caixas
- **GET** /caixas/:caixaId/premios
- **POST** /caixas/:caixaId/audit
- **PUT** /premios/:prizeId

### cases.js

- **GET** /
- **GET** /premios
- **GET** /map/:frontendId
- **GET** /:id
- **POST** /debit/:id
- **POST** /draw/:id
- **POST** /buy/:id
- **POST** /buy-multiple/:id
- **POST** /credit/:id
- **GET** /history
- **GET** /rtp/stats
- **GET** /rtp/stats/:caseId
- **POST** /rtp/end/:caseId

### compra.js

- **GET** /cases
- **GET** /cases/:id
- **POST** /buy/:id
- **POST** /buy-multiple/:id

### depositRoutes.js

- **POST** /pix

### gatewayConfig.js

- **GET** /
- **GET** /supported
- **GET** /active
- **GET** /:gatewayName
- **POST** /:gatewayName
- **PATCH** /:gatewayName/toggle
- **POST** /:gatewayName/test
- **POST** /:gatewayName/validate
- **DELETE** /:gatewayName

### globalDraw.js

- **POST** /sortear/:caseId
- **GET** /stats
- **GET** /logs
- **GET** /security-report
- **POST** /emergency-mode/activate
- **POST** /emergency-mode/deactivate
- **GET** /audit-stats

### imageUpload.js

- **POST** /premios/upload-image
- **DELETE** /premios/:prizeId/image

### payments.js

- **POST** /deposit
- **POST** /deposit/pix
- **POST** /deposit/callback
- **POST** /webhook/vizzion
- **POST** /withdraw
- **POST** /withdraw/callback
- **GET** /history
- **GET** /:id
- **GET** /:id/status

### prizeAudit.js

- **POST** /run
- **POST** /normalize
- **GET** /stats
- **POST** /case/:caseId
- **GET** /validate/:prizeId
- **GET** /normalization-stats

### prizes.js

- **GET** /stats
- **GET** /caixa-liquido
- **GET** /fundo-premios
- **POST** /simulate

### prizeSync.js

- **POST** /sync-prizes-from-folders
- **GET** /sync-report/:timestamp
- **GET** /backups
- **POST** /restore-database
- **POST** /restore-images
- **GET** /audit-prizes

### prizeValidation.js

- **POST** /verificar
- **POST** /corrigir-automaticamente
- **GET** /estatisticas
- **GET** /validar/:prizeId

### profile.js

- **GET** /
- **PUT** /
- **GET** /game-history

### seedRoutes.js

- **POST** /seed-demo-users
- **POST** /update-all-affiliates
- **POST** /initialize-prizes

### transactions.js

- **GET** /
- **GET** /recent-winners
- **GET** /daily-ranking
- **POST** /deposit

### wallet.js

- **GET** /
- **POST** /deposit
- **POST** /withdraw
- **POST** /recharge-demo

### webhookRoutes.js

- **POST** /pix
- **POST** /withdraw

### withdrawRoutes.js

- **POST** /pix
- **GET** /history/:userId
- **GET** /stats

