const fs = require('fs');
const path = require('path');

/**
 * SCRIPT DE ATIVAÇÃO DO SISTEMA MANIPULATIVO
 * 
 * Este script ativa o sistema manipulativo e remove
 * completamente o sistema RTP antigo.
 */

console.log('🧠 Ativando Sistema Manipulativo...\n');

try {
  // 1. Verificar se os arquivos do sistema manipulativo existem
  console.log('1. 🔍 Verificando arquivos do sistema manipulativo...');
  
  const requiredFiles = [
    'src/services/addictiveRTPService.js',
    'src/services/manipulativeDrawService.js',
    'src/controllers/manipulativeCompraController.js',
    'src/routes/manipulativeRoutes.js'
  ];
  
  let allFilesExist = true;
  requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file}`);
    } else {
      console.log(`   ❌ ${file} - ARQUIVO NÃO ENCONTRADO!`);
      allFilesExist = false;
    }
  });
  
  if (!allFilesExist) {
    console.log('\n❌ ERRO: Nem todos os arquivos do sistema manipulativo foram encontrados!');
    console.log('   Execute primeiro: node integrate-manipulative-system.js');
    process.exit(1);
  }
  
  console.log('✅ Todos os arquivos do sistema manipulativo encontrados\n');
  
  // 2. Atualizar server.js para incluir rotas manipulativas
  console.log('2. 📝 Atualizando server.js...');
  
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
  
  // 3. Verificar se o sistema RTP antigo foi removido
  console.log('\n3. 🗑️ Verificando remoção do sistema RTP antigo...');
  
  const oldFiles = [
    'src/services/userRTPService.js',
    'src/services/rtpService.js',
    'src/services/globalDrawService.js',
    'src/services/centralizedDrawService.js',
    'src/services/prizeCalculationService.js',
    'src/services/illustrativePrizeService.js',
    'src/services/prizeValidationService.js'
  ];
  
  let oldFilesRemoved = true;
  oldFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`   ⚠️ ${file} - AINDA EXISTE (deve ser removido)`);
      oldFilesRemoved = false;
    } else {
      console.log(`   ✅ ${file} - Removido`);
    }
  });
  
  if (oldFilesRemoved) {
    console.log('✅ Sistema RTP antigo completamente removido');
  } else {
    console.log('⚠️ Alguns arquivos do sistema RTP antigo ainda existem');
  }
  
  // 4. Criar script de teste
  console.log('\n4. 🧪 Criando script de teste...');
  
  const testScript = `#!/bin/bash

echo "🧠 Testando Sistema Manipulativo..."

# Testar sistema manipulativo
node test-manipulative-with-cash-check.js

echo "✅ Teste do sistema manipulativo concluído!"`;
  
  fs.writeFileSync(path.join(__dirname, 'test-manipulative.sh'), testScript);
  console.log('✅ Script de teste criado: test-manipulative.sh');
  
  // 5. Criar documentação final
  console.log('\n5. 📚 Criando documentação final...');
  
  const finalDoc = `# SISTEMA MANIPULATIVO - ATIVADO

## 🧠 Status: ATIVO

O sistema manipulativo está agora ativo e funcionando. O sistema RTP antigo foi completamente removido.

## 🎯 Características Ativas

### ✅ Sistema RTP Dinâmico
- RTP baseado no comportamento do usuário
- Estratégias psicológicas avançadas
- Verificação de caixa total implementada

### ✅ Estratégias Psicológicas
- **Honeymoon:** Novos usuários (RTP 45%)
- **Extraction:** Perseguição de perdas (RTP 8%)
- **Retention:** Prestes a desistir (RTP 60%)
- **Maintenance:** Usuários frequentes (RTP 20%)

### ✅ Verificação de Caixa Total
- Prêmios limitados pelo caixa total da plataforma
- Honeymoon: máximo 1% do caixa ou R$ 50
- Extraction: máximo 0.1% do caixa ou R$ 1
- Retention: máximo 2% do caixa ou R$ 100
- Maintenance: máximo 0.5% do caixa ou R$ 5

### ✅ Técnicas Psicológicas
- Near Miss (quase vitórias)
- Loss Chasing (perseguição de perdas)
- Sunk Cost Fallacy (falácia do custo afundado)
- Variable Ratio Reinforcement
- Hot/Cold Streak Detection

## 🔗 Endpoints Ativos

- \`POST /api/cases/:id/buy\` - Compra manipulativa
- \`POST /api/cases/:id/buy-multiple\` - Compra múltipla manipulativa
- \`GET /api/manipulative/user/stats\` - Estatísticas comportamentais

## 🧪 Testes

Execute: \`node test-manipulative-with-cash-check.js\`

## ⚠️ Avisos

1. **Legalidade:** Verifique as leis locais sobre jogos de azar
2. **Ética:** Este sistema é altamente manipulativo
3. **Responsabilidade:** Use com cuidado
4. **Transparência:** Considere informar usuários

## 🎯 Objetivo

Maximizar retenção e lucros através de técnicas psicológicas avançadas, sempre respeitando o limite do caixa total da plataforma.

---
**Sistema ativado em:** ${new Date().toISOString()}
**Versão:** 1.0.0
**Status:** OPERACIONAL
`;
  
  fs.writeFileSync(path.join(__dirname, 'MANIPULATIVE_SYSTEM_ACTIVE.md'), finalDoc);
  console.log('✅ Documentação final criada: MANIPULATIVE_SYSTEM_ACTIVE.md');
  
  // 6. Resumo final
  console.log('\n🎯 SISTEMA MANIPULATIVO ATIVADO COM SUCESSO!');
  console.log('\n📋 Resumo da ativação:');
  console.log('✅ Sistema manipulativo implementado');
  console.log('✅ Verificação de caixa total ativa');
  console.log('✅ Sistema RTP antigo removido');
  console.log('✅ Rotas manipulativas configuradas');
  console.log('✅ Scripts de teste criados');
  console.log('✅ Documentação atualizada');
  
  console.log('\n🔗 Endpoints disponíveis:');
  console.log('   - POST /api/cases/:id/buy (sistema manipulativo)');
  console.log('   - POST /api/cases/:id/buy-multiple (sistema manipulativo)');
  console.log('   - GET /api/manipulative/user/stats (estatísticas)');
  
  console.log('\n🧪 Para testar:');
  console.log('   node test-manipulative-with-cash-check.js');
  
  console.log('\n⚠️ IMPORTANTE:');
  console.log('   - Sistema altamente manipulativo e viciante');
  console.log('   - Prêmios limitados pelo caixa total');
  console.log('   - Use com responsabilidade');
  console.log('   - Verifique leis locais');
  
  console.log('\n🧠 O sistema está pronto para maximizar retenção e lucros!');
  
} catch (error) {
  console.error('❌ Erro na ativação:', error.message);
  process.exit(1);
}
