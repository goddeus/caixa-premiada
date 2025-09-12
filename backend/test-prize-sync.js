const prizeSyncService = require('./src/services/prizeSyncService');
const backupService = require('./src/services/backupService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Script de teste para o sistema de sincronização de prêmios
 */
async function testPrizeSync() {
  console.log('🧪 Iniciando testes do sistema de sincronização de prêmios...\n');

  try {
    // 1. Teste de backup
    console.log('1️⃣ Testando sistema de backup...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupResult = await backupService.createFullBackup(timestamp);
    
    if (backitResult.success) {
      console.log('✅ Backup criado com sucesso!');
      console.log(`📁 Banco: ${backupResult.database_backup?.file_path}`);
      console.log(`🖼️ Imagens: ${backupResult.images_backup?.backup_path}`);
    } else {
      console.log('❌ Falha no backup:', backupResult.errors);
    }

    // 2. Teste de auditoria antes da sincronização
    console.log('\n2️⃣ Executando auditoria antes da sincronização...');
    const auditBefore = await prisma.prize.findMany({
      where: { ativo: true },
      include: { case: true },
      orderBy: [{ case: { nome: 'asc' } }, { valor_centavos: 'asc' }]
    });

    console.log(`📊 Prêmios ativos encontrados: ${auditBefore.length}`);
    console.log(`📦 Caixas com prêmios: ${new Set(auditBefore.map(p => p.case.nome)).size}`);

    // 3. Teste de sincronização de uma caixa específica
    console.log('\n3️⃣ Testando sincronização da CAIXA APPLE...');
    const appleCase = await prisma.case.findFirst({
      where: { nome: 'CAIXA APPLE' }
    });

    if (appleCase) {
      const syncResult = await prizeSyncService.syncPrizes(appleCase.id);
      
      if (syncResult.success) {
        console.log('✅ Sincronização da CAIXA APPLE concluída!');
        console.log(`📊 Prêmios atualizados: ${syncResult.total_prizes_updated}`);
        console.log(`➕ Prêmios inseridos: ${syncResult.total_prizes_inserted}`);
        console.log(`🚫 Prêmios desativados: ${syncResult.total_prizes_deactivated}`);
        console.log(`🖼️ Imagens faltando: ${syncResult.total_images_missing}`);
      } else {
        console.log('❌ Falha na sincronização:', syncResult.errors);
      }
    } else {
      console.log('⚠️ CAIXA APPLE não encontrada');
    }

    // 4. Teste de sincronização de todas as caixas
    console.log('\n4️⃣ Testando sincronização de todas as caixas...');
    const fullSyncResult = await prizeSyncService.syncPrizes();
    
    if (fullSyncResult.success) {
      console.log('✅ Sincronização completa concluída!');
      console.log(`📦 Caixas processadas: ${fullSyncResult.total_cases_processed}`);
      console.log(`📊 Prêmios atualizados: ${fullSyncResult.total_prizes_updated}`);
      console.log(`➕ Prêmios inseridos: ${fullSyncResult.total_prizes_inserted}`);
      console.log(`🚫 Prêmios desativados: ${fullSyncResult.total_prizes_deactivated}`);
      console.log(`🖼️ Imagens faltando: ${fullSyncResult.total_images_missing}`);
    } else {
      console.log('❌ Falha na sincronização completa:', fullSyncResult.errors);
    }

    // 5. Teste de auditoria após sincronização
    console.log('\n5️⃣ Executando auditoria após sincronização...');
    const auditAfter = await prisma.prize.findMany({
      where: { ativo: true },
      include: { case: true },
      orderBy: [{ case: { nome: 'asc' } }, { valor_centavos: 'asc' }]
    });

    console.log(`📊 Prêmios ativos após sincronização: ${auditAfter.length}`);
    
    // Verificar prêmios ilustrativos
    const illustrativePrizes = auditAfter.filter(p => p.ilustrativo || p.tipo === 'ilustrativo');
    console.log(`🎨 Prêmios ilustrativos: ${illustrativePrizes.length}`);
    
    // Verificar prêmios não sorteáveis
    const nonSorteablePrizes = auditAfter.filter(p => p.sorteavel === false);
    console.log(`🚫 Prêmios não sorteáveis: ${nonSorteablePrizes.length}`);

    // 6. Teste de validação de prêmios
    console.log('\n6️⃣ Testando validação de prêmios...');
    const validationResults = [];
    
    for (const prize of auditAfter) {
      const validation = validatePrize(prize);
      if (validation.status !== 'ok') {
        validationResults.push({
          case: prize.case.nome,
          prize: prize.nome,
          status: validation.status,
          issues: validation.issues
        });
      }
    }

    if (validationResults.length === 0) {
      console.log('✅ Todos os prêmios estão válidos!');
    } else {
      console.log(`⚠️ ${validationResults.length} prêmios com problemas:`);
      validationResults.forEach(result => {
        console.log(`  - ${result.case}: ${result.prize} (${result.status})`);
        result.issues.forEach(issue => console.log(`    * ${issue}`));
      });
    }

    // 7. Teste de simulação de sorteio
    console.log('\n7️⃣ Testando simulação de sorteio...');
    await testDrawSimulation();

    // 8. Relatório final
    console.log('\n📋 RELATÓRIO FINAL DOS TESTES:');
    console.log('================================');
    console.log(`✅ Backup: ${backupResult.success ? 'SUCESSO' : 'FALHA'}`);
    console.log(`✅ Sincronização: ${fullSyncResult.success ? 'SUCESSO' : 'FALHA'}`);
    console.log(`📊 Prêmios antes: ${auditBefore.length}`);
    console.log(`📊 Prêmios depois: ${auditAfter.length}`);
    console.log(`🎨 Prêmios ilustrativos: ${illustrativePrizes.length}`);
    console.log(`🚫 Prêmios não sorteáveis: ${nonSorteablePrizes.length}`);
    console.log(`⚠️ Prêmios com problemas: ${validationResults.length}`);

  } catch (error) {
    console.error('❌ Erro durante os testes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Valida um prêmio específico
 */
function validatePrize(prize) {
  const issues = [];
  let status = 'ok';

  // Verificar se tem imagem
  if (!prize.imagem_url || prize.imagem_url.trim() === '') {
    issues.push('Sem imagem');
    status = 'warning';
  }

  // Verificar consistência de dados
  if (prize.tipo === 'cash' && prize.nome !== prize.label) {
    issues.push('Nome e label inconsistentes para cash');
    status = 'warning';
  }

  // Verificar se prêmio ilustrativo está marcado corretamente
  const shouldBeIllustrative = prize.valor_centavos > 100000; // R$ 1.000,00
  if (shouldBeIllustrative && !prize.ilustrativo) {
    issues.push('Deve ser marcado como ilustrativo (valor > R$ 1.000)');
    status = 'error';
  }

  // Verificar se prêmio ilustrativo não é sorteável
  if (prize.ilustrativo && prize.sorteavel) {
    issues.push('Prêmio ilustrativo não deve ser sorteável');
    status = 'error';
  }

  // Verificar probabilidade
  if (prize.probabilidade <= 0 || prize.probabilidade > 1) {
    issues.push('Probabilidade inválida');
    status = 'error';
  }

  // Verificar valor em centavos
  const expectedCentavos = Math.round(prize.valor * 100);
  if (prize.valor_centavos !== expectedCentavos) {
    issues.push(`Valor em centavos incorreto (esperado: ${expectedCentavos}, atual: ${prize.valor_centavos})`);
    status = 'error';
  }

  return { status, issues };
}

/**
 * Testa simulação de sorteio
 */
async function testDrawSimulation() {
  try {
    const globalDrawService = require('./src/services/globalDrawService');
    
    // Buscar uma caixa para teste
    const testCase = await prisma.case.findFirst({
      where: { ativo: true }
    });

    if (!testCase) {
      console.log('⚠️ Nenhuma caixa ativa encontrada para teste de sorteio');
      return;
    }

    console.log(`🎲 Testando sorteio na caixa: ${testCase.nome}`);
    
    // Executar 10 simulações
    const results = [];
    for (let i = 0; i < 10; i++) {
      try {
        const drawResult = await globalDrawService.sortearPremio(testCase.id, 'test-user-id');
        results.push({
          success: drawResult.success,
          prize: drawResult.prize,
          isIllustrative: drawResult.prize?.valor > 1000
        });
      } catch (error) {
        results.push({
          success: false,
          error: error.message
        });
      }
    }

    const successfulDraws = results.filter(r => r.success);
    const illustrativeDraws = results.filter(r => r.success && r.isIllustrative);
    
    console.log(`✅ Sorteios bem-sucedidos: ${successfulDraws.length}/10`);
    console.log(`🎨 Prêmios ilustrativos sorteados: ${illustrativeDraws.length}`);
    
    if (illustrativeDraws.length > 0) {
      console.log('❌ ERRO: Prêmios ilustrativos foram sorteados!');
      illustrativeDraws.forEach(draw => {
        console.log(`  - ${draw.prize.nome} (R$ ${draw.prize.valor})`);
      });
    } else {
      console.log('✅ Nenhum prêmio ilustrativo foi sorteado - sistema funcionando corretamente!');
    }

  } catch (error) {
    console.error('❌ Erro no teste de sorteio:', error);
  }
}

// Executar testes
if (require.main === module) {
  testPrizeSync();
}

module.exports = { testPrizeSync, validatePrize };
