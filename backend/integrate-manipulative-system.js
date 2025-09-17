const fs = require('fs');
const path = require('path');

/**
 * SCRIPT DE INTEGRAÇÃO DO SISTEMA MANIPULATIVO
 * 
 * Este script integra o sistema manipulativo no servidor principal
 * adicionando as rotas e configurações necessárias.
 */

console.log('🧠 Integrando sistema manipulativo no servidor...');

try {
  // 1. Adicionar rotas manipulativas no server.js
  console.log('1. 📝 Adicionando rotas manipulativas no server.js...');
  
  const serverPath = path.join(__dirname, 'src', 'server.js');
  let serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Verificar se já existe a importação das rotas manipulativas
  if (!serverContent.includes('manipulativeRoutes')) {
    // Adicionar importação das rotas manipulativas
    const importLine = "const manipulativeRoutes = require('./routes/manipulativeRoutes');";
    const routesImportIndex = serverContent.indexOf("const routes = require('./routes');");
    
    if (routesImportIndex !== -1) {
      serverContent = serverContent.slice(0, routesImportIndex) + 
                     importLine + '\n' + 
                     serverContent.slice(routesImportIndex);
    }
    
    // Adicionar uso das rotas manipulativas
    const appUseIndex = serverContent.indexOf("app.use('/api', routes);");
    if (appUseIndex !== -1) {
      const manipulativeRouteLine = "app.use('/api/manipulative', manipulativeRoutes);";
      serverContent = serverContent.slice(0, appUseIndex) + 
                     manipulativeRouteLine + '\n' + 
                     serverContent.slice(appUseIndex);
    }
    
    fs.writeFileSync(serverPath, serverContent);
    console.log('✅ Rotas manipulativas adicionadas ao server.js');
  } else {
    console.log('⚠️ Rotas manipulativas já existem no server.js');
  }
  
  // 2. Criar tabela de comportamento do usuário (se não existir)
  console.log('2. 🗄️ Verificando tabela de comportamento do usuário...');
  
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  let schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  if (!schemaContent.includes('model UserBehavior')) {
    const userBehaviorModel = `
model UserBehavior {
  id            String   @id @default(uuid())
  user_id       String
  case_id       String
  prize_value   Float
  rtp_used      Float
  strategy      String
  timestamp     DateTime @default(now())
  
  user          User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  case          Case     @relation(fields: [case_id], references: [id], onDelete: Cascade)
  
  @@map("user_behaviors")
}`;
    
    // Adicionar o modelo antes do fechamento do schema
    const lastModelIndex = schemaContent.lastIndexOf('}');
    schemaContent = schemaContent.slice(0, lastModelIndex) + 
                   userBehaviorModel + '\n' + 
                   schemaContent.slice(lastModelIndex);
    
    // Adicionar relação no modelo User
    if (!schemaContent.includes('behaviors UserBehavior[]')) {
      const userModelIndex = schemaContent.indexOf('model User {');
      const userModelEndIndex = schemaContent.indexOf('}', userModelIndex);
      const userModelContent = schemaContent.slice(userModelIndex, userModelEndIndex + 1);
      
      if (!userModelContent.includes('behaviors UserBehavior[]')) {
        const newUserModel = userModelContent.slice(0, -1) + 
                           '\n  behaviors UserBehavior[]\n' + 
                           userModelContent.slice(-1);
        schemaContent = schemaContent.replace(userModelContent, newUserModel);
      }
    }
    
    // Adicionar relação no modelo Case
    if (!schemaContent.includes('behaviors UserBehavior[]')) {
      const caseModelIndex = schemaContent.indexOf('model Case {');
      const caseModelEndIndex = schemaContent.indexOf('}', caseModelIndex);
      const caseModelContent = schemaContent.slice(caseModelIndex, caseModelEndIndex + 1);
      
      if (!caseModelContent.includes('behaviors UserBehavior[]')) {
        const newCaseModel = caseModelContent.slice(0, -1) + 
                           '\n  behaviors UserBehavior[]\n' + 
                           caseModelContent.slice(-1);
        schemaContent = schemaContent.replace(caseModelContent, newCaseModel);
      }
    }
    
    fs.writeFileSync(schemaPath, schemaContent);
    console.log('✅ Modelo UserBehavior adicionado ao schema.prisma');
  } else {
    console.log('⚠️ Modelo UserBehavior já existe no schema.prisma');
  }
  
  // 3. Criar migration para a tabela de comportamento
  console.log('3. 📊 Criando migration para tabela de comportamento...');
  
  const migrationDir = path.join(__dirname, 'prisma', 'migrations');
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }
  
  const migrationName = `add_user_behavior_${Date.now()}`;
  const migrationPath = path.join(migrationDir, migrationName);
  fs.mkdirSync(migrationPath, { recursive: true });
  
  const migrationSQL = `-- CreateTable
CREATE TABLE "user_behaviors" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "prize_value" DOUBLE PRECISION NOT NULL,
    "rtp_used" DOUBLE PRECISION NOT NULL,
    "strategy" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_behaviors_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "user_behaviors" ADD CONSTRAINT "user_behaviors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_behaviors" ADD CONSTRAINT "user_behaviors_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;`;
  
  fs.writeFileSync(path.join(migrationPath, 'migration.sql'), migrationSQL);
  console.log('✅ Migration criada:', migrationName);
  
  // 4. Criar script de ativação do sistema manipulativo
  console.log('4. 🚀 Criando script de ativação...');
  
  const activationScript = `#!/bin/bash

echo "🧠 Ativando Sistema Manipulativo..."

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 2. Gerar cliente Prisma
echo "🗄️ Gerando cliente Prisma..."
npx prisma generate

# 3. Aplicar migrations
echo "📊 Aplicando migrations..."
npx prisma db push

# 4. Reiniciar servidor
echo "🔄 Reiniciando servidor..."
pm2 restart slotbox-api || npm start

echo "✅ Sistema Manipulativo ativado com sucesso!"
echo "🎯 O sistema agora está configurado para:"
echo "   - RTP dinâmico baseado no comportamento"
echo "   - Técnicas de manipulação psicológica"
echo "   - Sistema de retenção inteligente"
echo "   - Análise comportamental em tempo real"
echo "   - Estratégias de extração de valor"
echo ""
echo "🔗 Endpoints disponíveis:"
echo "   - POST /api/manipulative/cases/:id/buy"
echo "   - POST /api/manipulative/cases/:id/buy-multiple"
echo "   - GET /api/manipulative/user/stats"
echo ""
echo "⚠️ ATENÇÃO: Este sistema é altamente manipulativo e viciante!"
echo "   Use com responsabilidade e em conformidade com as leis locais."`;
  
  fs.writeFileSync(path.join(__dirname, 'activate-manipulative.sh'), activationScript);
  console.log('✅ Script de ativação criado: activate-manipulative.sh');
  
  // 5. Criar documentação do sistema
  console.log('5. 📚 Criando documentação...');
  
  const documentation = `# SISTEMA MANIPULATIVO - DOCUMENTAÇÃO

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
\`\`\`json
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
\`\`\`

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
\`\`\`bash
chmod +x activate-manipulative.sh
./activate-manipulative.sh
\`\`\`

## 📊 Monitoramento

O sistema registra todos os comportamentos na tabela \`user_behaviors\` para análise e otimização contínua.

## 🔧 Configuração

Para ajustar o sistema, modifique os parâmetros em:
- \`addictiveRTPService.js\`
- \`manipulativeDrawService.js\`
- \`manipulativeCompraController.js\`
`;
  
  fs.writeFileSync(path.join(__dirname, 'MANIPULATIVE_SYSTEM.md'), documentation);
  console.log('✅ Documentação criada: MANIPULATIVE_SYSTEM.md');
  
  console.log('\n🎯 INTEGRAÇÃO DO SISTEMA MANIPULATIVO CONCLUÍDA!');
  console.log('\n📋 Próximos passos:');
  console.log('1. Execute: chmod +x activate-manipulative.sh');
  console.log('2. Execute: ./activate-manipulative.sh');
  console.log('3. Teste o sistema com: node test-manipulative-system.js');
  console.log('\n⚠️ ATENÇÃO: Este sistema é altamente manipulativo e viciante!');
  console.log('   Use com responsabilidade e em conformidade com as leis locais.');
  
} catch (error) {
  console.error('❌ Erro na integração:', error.message);
}
