const { PrismaClient } = require('@prisma/client');
const prizeUtils = require('./src/utils/prizeUtils');
const prizeAuditServiceV2 = require('./src/services/prizeAuditServiceV2');

const prisma = new PrismaClient();

async function migrateAndFix() {
  console.log('🚀 INICIANDO MIGRAÇÃO E CORREÇÃO DO SISTEMA DE PRÊMIOS V2...\n');

  try {
    // 1. Executar migration do Prisma
    console.log('1️⃣ Executando migration do Prisma...');
    const { execSync } = require('child_process');
    
    try {
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ Migration executada com sucesso!\n');
    } catch (error) {
      console.error('❌ Erro na migration:', error.message);
      throw error;
    }

    // 2. Atualizar dados existentes
    console.log('2️⃣ Atualizando dados existentes...');
    
    // Buscar todos os prêmios
    const prizes = await prisma.prize.findMany();
    console.log(`📦 Encontrados ${prizes.length} prêmios para atualizar`);

    let updatedCount = 0;
    for (const prize of prizes) {
      try {
        // Normalizar prêmio
        const normalized = prizeUtils.normalizarPremio(prize);
        
        // Verificar se precisa atualizar
        const needsUpdate = 
          prize.tipo !== normalized.tipo ||
          prize.valor_centavos !== normalized.valor_centavos ||
          prize.label !== normalized.label ||
          prize.imagem_id !== normalized.imagem_id ||
          prize.ativo !== normalized.ativo;

        if (needsUpdate) {
          await prisma.prize.update({
            where: { id: prize.id },
            data: {
              tipo: normalized.tipo,
              valor_centavos: normalized.valor_centavos,
              label: normalized.label,
              imagem_id: normalized.imagem_id,
              ativo: normalized.ativo
            }
          });
          
          updatedCount++;
          console.log(`✅ Prêmio ${prize.id} atualizado: ${prize.tipo} → ${normalized.tipo}`);
        }
      } catch (error) {
        console.error(`❌ Erro ao atualizar prêmio ${prize.id}:`, error.message);
      }
    }

    console.log(`✅ ${updatedCount} prêmios atualizados!\n`);

    // 3. Corrigir caso específico reportado
    console.log('3️⃣ Corrigindo caso específico reportado...');
    
    const specificPrizeId = '97b6c851-55e7-40a0-abac-6b1826302c32';
    const specificPrize = await prisma.prize.findUnique({
      where: { id: specificPrizeId }
    });

    if (specificPrize) {
      console.log(`📋 Caso específico encontrado:`);
      console.log(`   - ID: ${specificPrize.id}`);
      console.log(`   - Nome: "${specificPrize.nome}"`);
      console.log(`   - Valor: R$ ${specificPrize.valor}`);
      console.log(`   - Valor centavos: ${specificPrize.valor_centavos}`);
      console.log(`   - Tipo: ${specificPrize.tipo}`);
      console.log(`   - Label: "${specificPrize.label}"`);
      console.log(`   - Imagem ID: "${specificPrize.imagem_id}"`);

      // Aplicar correção
      const correctionResult = await prizeAuditServiceV2.corrigirCasoEspecifico(specificPrizeId);
      
      if (correctionResult.success) {
        console.log(`✅ Caso específico corrigido: ${correctionResult.corrections_applied} correções aplicadas`);
        
        if (correctionResult.corrections.length > 0) {
          console.log('📝 Correções aplicadas:');
          correctionResult.corrections.forEach((correction, index) => {
            console.log(`   ${index + 1}. ${correction.field}: "${correction.old_value}" → "${correction.new_value}"`);
          });
        }
      } else {
        console.error(`❌ Erro ao corrigir caso específico: ${correctionResult.error}`);
      }
    } else {
      console.log(`⚠️ Caso específico não encontrado (ID: ${specificPrizeId})`);
    }

    console.log('');

    // 4. Executar auditoria completa
    console.log('4️⃣ Executando auditoria completa...');
    
    const auditResult = await prizeAuditServiceV2.auditarPremios({ fix: true, force: true });
    
    console.log('📊 Resultado da auditoria:');
    console.log(`   - Sucesso: ${auditResult.success}`);
    console.log(`   - Caixas processadas: ${auditResult.total_cases}`);
    console.log(`   - Prêmios processados: ${auditResult.total_prizes}`);
    console.log(`   - Correções aplicadas: ${auditResult.corrections_applied}`);
    console.log(`   - Erros: ${auditResult.errors.length}`);
    console.log(`   - Warnings: ${auditResult.warnings.length}`);
    console.log(`   - Tempo: ${auditResult.processing_time_ms}ms`);

    if (auditResult.prizes_by_type) {
      console.log('📈 Distribuição por tipo:');
      Object.entries(auditResult.prizes_by_type).forEach(([tipo, count]) => {
        console.log(`   - ${tipo}: ${count}`);
      });
    }

    console.log('');

    // 5. Testar sistema atualizado
    console.log('5️⃣ Testando sistema atualizado...');
    
    // Testar funções utilitárias
    console.log('🧪 Testando funções utilitárias:');
    
    const testValues = [200, 500, 1000, 5000, 10000];
    testValues.forEach(valor => {
      const formatted = prizeUtils.formatarBRL(valor);
      const assetKey = prizeUtils.assetKeyCash(valor);
      console.log(`   ${valor} centavos → ${formatted} (${assetKey})`);
    });

    // Testar alguns prêmios
    const testPrizes = await prisma.prize.findMany({ take: 5 });
    console.log('\n🧪 Testando mapeamento de prêmios:');
    
    for (const prize of testPrizes) {
      try {
        const mapped = prizeUtils.mapPrizeToDisplay(prize);
        console.log(`   ${prize.id}: ${mapped.tipo} - ${mapped.label} (sorteável: ${mapped.sorteavel})`);
      } catch (error) {
        console.error(`   ❌ Erro ao mapear prêmio ${prize.id}:`, error.message);
      }
    }

    console.log('\n✅ MIGRAÇÃO E CORREÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('🎯 Sistema de prêmios V2 está funcionando corretamente!');

  } catch (error) {
    console.error('❌ ERRO FATAL durante migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
migrateAndFix().then(() => {
  console.log('\n🎉 PROCESSO CONCLUÍDO!');
  process.exit(0);
}).catch(error => {
  console.error('❌ ERRO FATAL:', error);
  process.exit(1);
});
