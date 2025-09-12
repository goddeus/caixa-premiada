# 🔄 Sistema de Sincronização de Prêmios

Sistema completo para sincronizar prêmios com base nas pastas de imagens e lista definitiva fornecida pelo cliente.

## 🎯 Funcionalidades

- ✅ **Backup Automático**: Cria backup completo do banco e imagens antes de qualquer operação
- ✅ **Sincronização Inteligente**: Mapeia prêmios com base nas pastas de imagens
- ✅ **Regras de Ilustração**: Marca automaticamente prêmios > R$ 1.000 como ilustrativos
- ✅ **Segurança no Sorteio**: Impede sorteio de prêmios ilustrativos
- ✅ **Logs Detalhados**: Relatórios completos de todas as operações
- ✅ **Auditoria**: Sistema de validação e correção automática
- ✅ **Transações Seguras**: Todas as operações em transações do banco

## 🚀 Como Usar

### 1. Sincronização Completa (Todas as Caixas)

```bash
# Via script
node run-prize-sync.js

# Via API (requer autenticação admin)
POST /api/admin/sync-prizes-from-folders
```

### 2. Sincronização de Caixa Específica

```bash
# Via script (substitua CASE_ID pelo ID da caixa)
node run-prize-sync.js --case-id=CASE_ID

# Via API
POST /api/admin/sync-prizes-from-folders
{
  "caseId": "CASE_ID"
}
```

### 3. Executar Auditoria

```bash
# Via script
node run-prize-sync.js --audit

# Via API
GET /api/admin/audit-prizes
```

### 4. Executar Testes

```bash
# Via script
node run-prize-sync.js --test

# Via script de teste completo
node test-prize-sync.js
```

## 📁 Estrutura de Pastas de Imagens

O sistema espera as seguintes pastas de imagens:

```
frontend/public/imagens/
├── CAIXA APPLE/
│   ├── 1.png
│   ├── 2.png
│   ├── 5.png
│   ├── 10.png
│   ├── 500.webp
│   ├── air pods.png
│   ├── iphone 16 pro max.png
│   └── macbook.png
├── CAIXA CONSOLE DOS SONHOS/
│   ├── 1real.png
│   ├── 2reais.png
│   ├── 5reais.png
│   ├── 10reais.png
│   ├── 100reais.png
│   ├── ps5.png
│   ├── steamdeck.png
│   └── xboxone.webp
├── CAIXA KIT NIKE/
│   ├── 1.png
│   ├── 2.png
│   ├── 5.png
│   ├── 10.png
│   ├── airforce.webp
│   ├── boné nike.png
│   ├── camisa nike.webp
│   ├── jordan.png
│   └── nike dunk.webp
├── CAIXA PREMIUM MASTER/
│   ├── 2.png
│   ├── 5.png
│   ├── 10.png
│   ├── airpods.png
│   ├── ipad.png
│   ├── iphone 16 pro max.png
│   ├── macbook.png
│   └── samsung s25.png
├── CAIXA SAMSUNG/
│   ├── 1.png
│   ├── 2.png
│   ├── 5.png
│   ├── 10.png
│   ├── 100.png
│   ├── 500.webp
│   ├── fone samsung.png
│   ├── notebook samsung.png
│   └── s25.png
└── CAIXA WEEKEND/
    ├── 1.png
    ├── 2.png
    ├── 5.png
    ├── 10.png
    ├── 100.png
    └── 500.webp
```

## 🎯 Mapeamento Definitivo de Prêmios

### CAIXA APPLE (R$ 7,00)
- **Cash**: R$ 1,00, R$ 2,00, R$ 5,00, R$ 10,00, R$ 500,00
- **Ilustrativos**: IPHONE 16 PRO MAX (R$ 10.000), MACBOOK (R$ 15.000), AIRPODS (R$ 2.500)

### CAIXA CONSOLE DO SONHOS (R$ 3,50)
- **Cash**: R$ 1,00, R$ 2,00, R$ 5,00, R$ 10,00, R$ 100,00
- **Ilustrativos**: STEAM DECK (R$ 3.000), PLAYSTATION 5 (R$ 4.000), XBOX SERIES X (R$ 4.000)

### CAIXA KIT NIKE (R$ 2,50)
- **Cash**: R$ 1,00, R$ 2,00, R$ 5,00, R$ 10,00
- **Produtos**: BONÉ NIKE (R$ 50), CAMISA NIKE (R$ 100), NIKE DUNK (R$ 1.000), AIR FORCE 1 (R$ 700)
- **Ilustrativos**: AIR JORDAN (R$ 1.500)

### CAIXA PREMIUM MASTER (R$ 15,00)
- **Cash**: R$ 2,00, R$ 5,00, R$ 10,00
- **Ilustrativos**: AIRPODS (R$ 2.500), SAMSUNG S25 (R$ 5.000), IPAD (R$ 8.000), IPHONE 16 PRO MAX (R$ 10.000), MACBOOK (R$ 15.000)

### CAIXA SAMSUNG (R$ 3,00)
- **Cash**: R$ 1,00, R$ 2,00, R$ 5,00, R$ 10,00, R$ 100,00, R$ 500,00
- **Produtos**: FONE SAMSUNG (R$ 1.000)
- **Ilustrativos**: NOTEBOOK SAMSUNG (R$ 3.000), SAMSUNG S25 (R$ 5.000)

### CAIXA WEEKEND (R$ 1,50)
- **Cash**: R$ 1,00, R$ 2,00, R$ 5,00, R$ 10,00
- **Não Sorteáveis**: R$ 100,00 e R$ 500,00 (valor 0, apenas ilustrativos)

## 🔧 Regras Técnicas

### Prêmios Ilustrativos
- **Critério**: Valor > R$ 1.000,00 (100.000 centavos)
- **Marcação**: `ilustrativo = true`, `sorteavel = false`
- **Comportamento**: Exibidos na vitrine, mas nunca sorteados

### Mapeamento de Imagens
- **Prioridade 1**: Nome exato do prêmio
- **Prioridade 2**: Valor do prêmio (para cash)
- **Prioridade 3**: Padrões parciais
- **Fallback**: Sem imagem (marcado como warning)

### Validações de Segurança
- ✅ Prêmios ilustrativos nunca são sorteados
- ✅ Prêmios inativos são excluídos do sorteio
- ✅ Prêmios não sorteáveis são excluídos
- ✅ Valores em centavos são calculados corretamente
- ✅ Probabilidades são válidas (0 < p <= 1)

## 📊 Endpoints da API

### Sincronização
- `POST /api/admin/sync-prizes-from-folders` - Sincronizar prêmios
- `GET /api/admin/sync-report/:timestamp` - Obter relatório

### Backup
- `GET /api/admin/backups` - Listar backups
- `POST /api/admin/restore-database` - Restaurar banco
- `POST /api/admin/restore-images` - Restaurar imagens

### Auditoria
- `GET /api/admin/audit-prizes` - Executar auditoria

## 📝 Logs e Relatórios

### Localização dos Logs
- **Logs de Sincronização**: `backend/logs/sync_prizes_TIMESTAMP.log`
- **Logs de Auditoria**: `backend/logs/auditoria-premios.log`
- **Backups**: `backend/backups/`

### Conteúdo dos Relatórios
- ✅ Resumo de operações realizadas
- ✅ Prêmios inseridos/atualizados/desativados
- ✅ Imagens encontradas/faltando
- ✅ Erros e warnings
- ✅ Estatísticas detalhadas

## 🚨 Segurança

### Backup Automático
- ✅ Backup completo antes de qualquer operação
- ✅ Backup do banco de dados (SQLite dump)
- ✅ Backup das pastas de imagens
- ✅ Timestamp único para cada operação

### Transações
- ✅ Todas as operações em transações do banco
- ✅ Rollback automático em caso de erro
- ✅ Validações antes de cada operação

### Validações
- ✅ Verificação de permissões de admin
- ✅ Validação de dados antes de inserir/atualizar
- ✅ Verificação de integridade dos prêmios

## 🧪 Testes

### Executar Testes Completos
```bash
node test-prize-sync.js
```

### Executar Testes Específicos
```bash
# Teste de sincronização
node run-prize-sync.js --test

# Teste de auditoria
node run-prize-sync.js --audit
```

### Validações dos Testes
- ✅ Backup criado com sucesso
- ✅ Sincronização executada sem erros
- ✅ Prêmios ilustrativos marcados corretamente
- ✅ Nenhum prêmio ilustrativo sorteado
- ✅ Imagens mapeadas corretamente
- ✅ Dados consistentes no banco

## 🔄 Fluxo de Sincronização

1. **Backup**: Cria backup completo do sistema
2. **Mapeamento**: Lê pastas de imagens e mapeia prêmios
3. **Sincronização**: Atualiza/insere prêmios no banco
4. **Desativação**: Remove prêmios não mapeados
5. **Validação**: Verifica consistência dos dados
6. **Relatório**: Gera log detalhado da operação

## 📈 Monitoramento

### Métricas Importantes
- ✅ Taxa de sucesso da sincronização
- ✅ Número de prêmios processados
- ✅ Imagens encontradas vs. faltando
- ✅ Prêmios ilustrativos vs. sorteáveis
- ✅ Tempo de execução das operações

### Alertas
- ⚠️ Imagens faltando para prêmios
- ❌ Erros durante sincronização
- 🚨 Prêmios ilustrativos sendo sorteados
- 📊 Inconsistências nos dados

## 🎉 Conclusão

O sistema de sincronização de prêmios está **100% funcional** e pronto para uso em produção. Todas as funcionalidades solicitadas foram implementadas com segurança, logs detalhados e validações rigorosas.

**Status**: ✅ **IMPLEMENTADO E TESTADO**
**Data**: 20/12/2024
**Versão**: 1.0.0
