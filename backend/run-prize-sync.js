#!/usr/bin/env node

/**
 * Script para executar sincronização de prêmios
 * Uso: node run-prize-sync.js [--case-id=ID] [--test] [--audit]
 */

const prizeSyncService = require('./src/services/prizeSyncService');
const backupService = require('./src/services/backupService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const caseId = args.find(arg => arg.startsWith('--case-id='))?.split('=')[1];
  const testMode = args.includes('--test');
  const auditMode = args.includes('--audit');

  console.log('🔄 Sistema de Sincronização de Prêmios');
  console.log('=====================================\n');

  try {
    if (auditMode) {
      console.log('🔍 Executando auditoria de prêmios...');
      await runAudit();
    } else if (testMode) {
      console.log('🧪 Executando testes do sistema...');
      await runTests();
    } else {
      console.log('🔄 Executando sincronização de prêmios...');
      await runSync(caseId);
    }
  } catch (error) {
    console.error('❌ Erro durante execução:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function runSync(caseId) {
  console.log(`📦 Sincronizando ${caseId ? 'caixa específica' : 'todas as caixas'}...`);
  
  const startTime = Date.now();
  const syncResult = await prizeSyncService.syncPrizes(caseId);
  const endTime = Date.now();
  
  console.log('\n📊 RESULTADO DA SINCRONIZAÇÃO:');
  console.log('==============================');
  console.log(`✅ Sucesso: ${syncResult.success ? 'SIM' : 'NÃO'}`);
  console.log(`⏱️ Tempo: ${endTime - startTime}ms`);
  console.log(`📦 Caixas processadas: ${syncResult.total_cases_processed}`);
  console.log(`📊 Prêmios atualizados: ${syncResult.total_prizes_updated}`);
  console.log(`➕ Prêmios inseridos: ${syncResult.total_prizes_inserted}`);
  console.log(`🚫 Prêmios desativados: ${syncResult.total_prizes_deactivated}`);
  console.log(`🖼️ Imagens faltando: ${syncResult.total_images_missing}`);
  
  if (syncResult.errors.length > 0) {
    console.log('\n❌ ERROS ENCONTRADOS:');
    syncResult.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  if (syncResult.log_file) {
    console.log(`\n📄 Log detalhado: ${syncResult.log_file}`);
  }
  
  console.log('\n🎉 Sincronização concluída!');
}

async function runTests() {
  const { testPrizeSync } = require('./test-prize-sync');
  await testPrizeSync();
}

async function runAudit() {
  console.log('🔍 Executando auditoria completa...');
  
  // Buscar todas as caixas com prêmios
  const cases = await prisma.case.findMany({
    where: { ativo: true },
    include: {
      prizes: {
        where: { ativo: true },
        orderBy: { valor_centavos: 'asc' }
      }
    },
    orderBy: { nome: 'asc' }
  });

  console.log(`\n📊 AUDITORIA DE PRÊMIOS:`);
  console.log('========================');
  console.log(`📦 Total de caixas: ${cases.length}`);
  
  let totalPrizes = 0;
  let totalOk = 0;
  let totalWarning = 0;
  let totalError = 0;
  let totalIllustrative = 0;
  let totalSorteable = 0;

  for (const caseData of cases) {
    console.log(`\n📦 ${caseData.nome} (R$ ${caseData.preco}):`);
    console.log(`   Prêmios: ${caseData.prizes.length}`);
    
    let caseOk = 0;
    let caseWarning = 0;
    let caseError = 0;
    let caseIllustrative = 0;
    let caseSorteable = 0;

    for (const prize of caseData.prizes) {
      const validation = validatePrize(prize);
      
      if (validation.status === 'ok') caseOk++;
      else if (validation.status === 'warning') caseWarning++;
      else if (validation.status === 'error') caseError++;
      
      if (prize.ilustrativo) caseIllustrative++;
      if (prize.sorteavel) caseSorteable++;
      
      totalPrizes++;
    }

    totalOk += caseOk;
    totalWarning += caseWarning;
    totalError += caseError;
    totalIllustrative += caseIllustrative;
    totalSorteable += caseSorteable;

    console.log(`   ✅ OK: ${caseOk}`);
    console.log(`   ⚠️ Warning: ${caseWarning}`);
    console.log(`   ❌ Error: ${caseError}`);
    console.log(`   🎨 Ilustrativos: ${caseIllustrative}`);
    console.log(`   🎲 Sorteáveis: ${caseSorteable}`);
  }

  console.log('\n📊 RESUMO GERAL:');
  console.log('================');
  console.log(`📦 Total de caixas: ${cases.length}`);
  console.log(`🎁 Total de prêmios: ${totalPrizes}`);
  console.log(`✅ Prêmios OK: ${totalOk} (${((totalOk/totalPrizes)*100).toFixed(1)}%)`);
  console.log(`⚠️ Prêmios com Warning: ${totalWarning} (${((totalWarning/totalPrizes)*100).toFixed(1)}%)`);
  console.log(`❌ Prêmios com Error: ${totalError} (${((totalError/totalPrizes)*100).toFixed(1)}%)`);
  console.log(`🎨 Prêmios ilustrativos: ${totalIllustrative} (${((totalIllustrative/totalPrizes)*100).toFixed(1)}%)`);
  console.log(`🎲 Prêmios sorteáveis: ${totalSorteable} (${((totalSorteable/totalPrizes)*100).toFixed(1)}%)`);
}

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

// Executar script
if (require.main === module) {
  main();
}

module.exports = { main, runSync, runTests, runAudit };
