# SISTEMA MANIPULATIVO - DOCUMENTAÇÃO

## 🧠 Visão Geral

O Sistema Manipulativo é um sistema de RTP dinâmico e viciante que utiliza técnicas psicológicas avançadas para maximizar a retenção de usuários e os lucros da plataforma.

## 🎯 Características Principais

### 1. RTP Dinâmico
- **RTP Base:** 15% (muito baixo)
- **Novos Usuários:** 45% (para criar vício)
- **Loss Chasing:** 8% (quase impossível ganhar)
- **Retenção:** 60% (para não perder usuário)

### 2. Estratégias Psicológicas

#### Honeymoon (Novos Usuários)
- RTP: 45%
- Objetivo: Criar vício inicial
- Técnica: Recompensas frequentes

#### Extraction (Perseguição de Perdas)
- RTP: 8%
- Objetivo: Maximizar lucro
- Técnica: Quase impossível ganhar

#### Retention (Retenção)
- RTP: 60%
- Objetivo: Evitar abandono
- Técnica: Prêmios de retenção

#### Maintenance (Manutenção)
- RTP: 20%
- Objetivo: Manter engajamento
- Técnica: RTP equilibrado

### 3. Técnicas Psicológicas

#### Near Miss (Quase Vitórias)
- Mostra "quase ganhou" quando perde
- Cria sensação de proximidade
- Incentiva continuar jogando

#### Loss Chasing (Perseguição de Perdas)
- Usuário perde muito dinheiro
- Sistema reduz RTP drasticamente
- Maximiza extração de valor

#### Sunk Cost Fallacy (Falácia do Custo Afundado)
- Lembra quanto já gastou
- "Não desista agora"
- Incentiva continuar para recuperar

#### Variable Ratio Reinforcement
- Recompensas imprevisíveis
- Máxima viciância
- Dificulta parar de jogar

### 4. Análise Comportamental

#### Métricas Monitoradas
- Total gasto vs ganho
- Frequência de jogos
- Padrões de perda
- Tendência de abandono

#### Perfis Comportamentais
- **Novo Usuário:** RTP alto
- **Loss Chasing:** RTP baixo
- **Alta Frequência:** RTP médio
- **Prestes a Desistir:** RTP alto

### 5. Sistema de Streaks

#### Hot Streak (Sequência de Vitórias)
- Detecta quando usuário ganha muito
- Reduz RTP para quebrar sequência
- Evita perdas excessivas

#### Cold Streak (Sequência de Perdas)
- Detecta quando usuário perde muito
- Aumenta RTP para dar prêmio
- Evita abandono total

## 🔗 Endpoints

### POST /api/manipulative/cases/:id/buy
Compra de caixa com sistema manipulativo

**Resposta:**
```json
{
  "success": true,
  "prize": {
    "nome": "Prêmio",
    "valor": 0,
    "psychologicalMessage": "Mensagem manipulativa",
    "isManipulative": true,
    "strategy": "extraction",
    "rtpUsed": 0.08
  },
  "manipulativeData": {
    "strategy": "extraction",
    "rtpUsed": 0.08,
    "behaviorProfile": {...},
    "isRetentionPrize": false
  }
}
```

### POST /api/manipulative/cases/:id/buy-multiple
Compra múltipla com sistema manipulativo

### GET /api/manipulative/user/stats
Estatísticas manipulativas do usuário

## ⚠️ Avisos Importantes

1. **Legalidade:** Verifique as leis locais sobre jogos de azar
2. **Ética:** Este sistema é altamente manipulativo
3. **Responsabilidade:** Use com cuidado e responsabilidade
4. **Transparência:** Considere informar usuários sobre o sistema

## 🚀 Ativação

Execute o script de ativação:
```bash
chmod +x activate-manipulative.sh
./activate-manipulative.sh
```

## 📊 Monitoramento

O sistema registra todos os comportamentos na tabela `user_behaviors` para análise e otimização contínua.

## 🔧 Configuração

Para ajustar o sistema, modifique os parâmetros em:
- `addictiveRTPService.js`
- `manipulativeDrawService.js`
- `manipulativeCompraController.js`
