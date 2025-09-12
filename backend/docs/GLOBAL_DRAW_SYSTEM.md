# Sistema de Sorteio Global Centralizado

## Visão Geral

O Sistema de Sorteio Global Centralizado foi implementado para centralizar toda a lógica de sorteio da plataforma, respeitando o RTP configurado no painel administrador e o caixa líquido da plataforma.

## Características Principais

### ✅ Centralização Completa
- **Nenhuma caixa tem autonomia de sorteio**
- Todas as caixas devem obrigatoriamente chamar a função global `sortearPremio(caixa_id, user_id)`
- Sistema único de controle de RTP e caixa líquido

### ✅ Respeito ao RTP Global
- Consulta o RTP alvo definido no painel administrador
- Ajusta probabilidades dinamicamente para manter o RTP respeitado
- Validação contínua do caixa líquido da plataforma

### ✅ Proteção Financeira
- Validação se o prêmio sorteado é compatível com o caixa líquido
- Sistema de retry automático se prêmio não for viável
- Travas para nunca permitir que o caixa líquido fique negativo

### ✅ Logs Detalhados
- Registro completo de cada sorteio para auditoria
- Logs de violações de segurança
- Estatísticas em tempo real do sistema

## Arquitetura

### Serviços Principais

1. **GlobalDrawService** (`globalDrawService.js`)
   - Função principal `sortearPremio(caixa_id, user_id)`
   - Coordena todo o processo de sorteio
   - Aplica validações e proteções

2. **SafetyService** (`safetyService.js`)
   - Validações de segurança
   - Controle de modo de emergência
   - Proteção do caixa líquido

3. **AuditLogService** (`auditLogService.js`)
   - Logs detalhados de auditoria
   - Estatísticas do sistema
   - Histórico de alterações

### Banco de Dados

#### Novas Tabelas

- **`caixa_liquido`**: Controle centralizado do caixa líquido
- **`draw_logs`**: Logs detalhados de sorteios
- **`rtp_config`**: Configuração global de RTP (já existia)
- **`system_configs`**: Configurações do sistema (modo de emergência)

## Como Usar

### Para Desenvolvedores

#### Sorteio de Caixa
```javascript
const globalDrawService = require('./services/globalDrawService');

// Em vez do método antigo:
// const prize = await prizeCalculationService.selectPrize(caseId);

// Use o novo sistema centralizado:
const result = await globalDrawService.sortearPremio(caseId, userId);

if (result.success) {
  const prize = result.prize;
  // Processar prêmio...
} else {
  console.error('Erro no sorteio:', result.message);
}
```

#### Validações de Segurança
```javascript
const safetyService = require('./services/safetyService');

// Verificar se usuário pode abrir caixa
const userValidation = await safetyService.validateUserOperation(userId, 'abrir_caixa');
if (!userValidation.isValid) {
  throw new Error(userValidation.motivo);
}

// Verificar modo de emergência
const emergencyMode = await safetyService.isEmergencyMode();
if (emergencyMode) {
  throw new Error('Sistema em modo de emergência');
}
```

### Para Administradores

#### Configurar RTP Global
```javascript
// Via painel administrativo ou API
const rtpConfig = {
  rtp_target: 50.0, // 50% de RTP
  updated_by: adminId
};
```

#### Monitorar Sistema
```javascript
// Obter estatísticas
const stats = await globalDrawService.getDrawStats();

// Obter relatório de segurança
const securityReport = await safetyService.getSecurityReport();

// Obter logs de auditoria
const logs = await auditLogService.getDrawLogs({
  date_from: '2024-01-01',
  date_to: '2024-01-31',
  limit: 100
});
```

#### Modo de Emergência
```javascript
// Ativar modo de emergência
await safetyService.activateEmergencyMode(adminId, 'Problema detectado');

// Desativar modo de emergência
await safetyService.deactivateEmergencyMode(adminId);
```

## APIs Disponíveis

### Sorteio Global
- `POST /api/global-draw/sortear/:caseId` - Realizar sorteio centralizado

### Estatísticas e Monitoramento
- `GET /api/global-draw/stats` - Estatísticas do sistema
- `GET /api/global-draw/logs` - Logs de auditoria
- `GET /api/global-draw/security-report` - Relatório de segurança
- `GET /api/global-draw/audit-stats` - Estatísticas de auditoria

### Controle de Emergência
- `POST /api/global-draw/emergency-mode/activate` - Ativar modo de emergência
- `POST /api/global-draw/emergency-mode/deactivate` - Desativar modo de emergência

## Fluxo de Sorteio

1. **Validações Iniciais**
   - Verificar modo de emergência
   - Validar usuário e caixa
   - Obter configurações atuais

2. **Cálculo de Limites**
   - Consultar RTP configurado
   - Calcular limite máximo de prêmio
   - Filtrar prêmios seguros

3. **Sorteio Inteligente**
   - Ajustar probabilidades para RTP
   - Realizar sorteio ponderado
   - Validar compatibilidade com caixa líquido

4. **Proteções Finais**
   - Aplicar limites de segurança
   - Validar caixa líquido final
   - Registrar resultado

5. **Auditoria**
   - Log detalhado do sorteio
   - Atualização de estatísticas
   - Registro de transação

## Benefícios

### Para a Plataforma
- **Controle total** sobre o RTP global
- **Proteção financeira** garantida
- **Auditoria completa** de todos os sorteios
- **Flexibilidade** para ajustar configurações

### Para os Usuários
- **Transparência** no sistema de sorteio
- **Justiça** garantida pelo RTP global
- **Confiabilidade** do sistema

### Para Administradores
- **Visibilidade completa** do sistema
- **Controle granular** sobre configurações
- **Ferramentas de emergência** para situações críticas
- **Relatórios detalhados** para análise

## Migração do Sistema Antigo

### Alterações Realizadas

1. **Controllers Atualizados**
   - `casesController.js`: Usa novo sistema global
   - `casesService.js`: Método antigo marcado como deprecated

2. **Banco de Dados**
   - Novas tabelas criadas
   - Migração automática executada
   - Índices otimizados para performance

3. **Rotas Adicionadas**
   - `/api/global-draw/*` - Novas APIs de controle
   - Integração com sistema existente

### Compatibilidade

- ✅ Sistema antigo continua funcionando
- ✅ Migração gradual possível
- ✅ Rollback disponível se necessário
- ✅ Logs de transição mantidos

## Monitoramento e Alertas

### Métricas Importantes

- **Taxa de Sucesso**: % de sorteios bem-sucedidos
- **Tempo de Processamento**: Latência média dos sorteios
- **Taxa de Proteção**: % de sorteios com proteção aplicada
- **Caixa Líquido**: Valor atual e tendências

### Alertas Automáticos

- Caixa líquido abaixo de limite crítico
- Taxa de erro acima do normal
- Tentativas de violação de segurança
- Modo de emergência ativado

## Troubleshooting

### Problemas Comuns

1. **Erro "Sistema em modo de emergência"**
   - Verificar configuração `emergency_mode`
   - Desativar via API ou painel admin

2. **Prêmios sempre mínimos**
   - Verificar RTP configurado
   - Analisar caixa líquido atual
   - Revisar configurações de segurança

3. **Performance lenta**
   - Verificar índices do banco
   - Analisar logs de processamento
   - Otimizar consultas se necessário

### Logs Úteis

```bash
# Logs de sorteio
grep "SORTEIO GLOBAL" logs/app.log

# Logs de segurança
grep "VIOLAÇÃO DE SEGURANÇA" logs/app.log

# Logs de auditoria
grep "AUDITORIA" logs/app.log
```

## Conclusão

O Sistema de Sorteio Global Centralizado oferece controle total sobre a lógica de sorteio da plataforma, garantindo:

- ✅ Respeito ao RTP configurado
- ✅ Proteção do caixa líquido
- ✅ Auditoria completa
- ✅ Flexibilidade administrativa
- ✅ Segurança robusta

Este sistema substitui completamente a lógica de sorteio isolada de cada caixa, centralizando todo o controle em uma função global que garante a integridade financeira da plataforma.
