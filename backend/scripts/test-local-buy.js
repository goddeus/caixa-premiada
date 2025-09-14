// TESTE LOCAL DO ENDPOINT DE ABERTURA
const { PrismaClient } = require('@prisma/client');
const centralizedDrawService = require('../src/services/centralizedDrawService');

const prisma = new PrismaClient();

async function testLocalBuy() {
  console.log('🧪 TESTE LOCAL DO ENDPOINT DE ABERTURA');
  console.log('=====================================');
  
  try {
    // 1. Buscar uma caixa
    console.log('\n📦 1. BUSCANDO CAIXA...');
    const caseData = await prisma.case.findFirst({
      where: { ativo: true },
      include: {
        prizes: {
          where: {
            ativo: true,
            sorteavel: true
          }
        }
      }
    });
    
    if (!caseData) {
      console.log('❌ Nenhuma caixa ativa encontrada');
      return;
    }
    
    console.log(`✅ Caixa encontrada: ${caseData.nome} (ID: ${caseData.id})`);
    console.log(`   Preço: R$ ${caseData.preco}`);
    console.log(`   Prêmios: ${caseData.prizes.length}`);
    
    // 2. Buscar um usuário
    console.log('\n👤 2. BUSCANDO USUÁRIO...');
    const user = await prisma.user.findFirst({
      where: { ativo: true }
    });
    
    if (!user) {
      console.log('❌ Nenhum usuário ativo encontrado');
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${user.email} (ID: ${user.id})`);
    console.log(`   Tipo: ${user.tipo_conta}`);
    console.log(`   Saldo real: R$ ${user.saldo_reais}`);
    console.log(`   Saldo demo: R$ ${user.saldo_demo}`);
    
    // 3. Testar centralizedDrawService
    console.log('\n🎯 3. TESTANDO CENTRALIZEDDRAWSERVICE...');
    
    try {
      const result = await centralizedDrawService.sortearPremio(caseData.id, user.id);
      console.log('✅ Sorteio executado com sucesso!');
      console.log('📊 Resultado:', result);
      
      if (result.success) {
        console.log(`🎁 Prêmio: ${result.prize.nome} - R$ ${result.prize.valor}`);
        console.log(`💰 Saldo: R$ ${result.userBalance}`);
      } else {
        console.log(`❌ Erro no sorteio: ${result.message}`);
      }
      
    } catch (error) {
      console.error('❌ Erro no centralizedDrawService:', error.message);
      console.error('📊 Stack trace:', error.stack);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    console.error('📊 Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testLocalBuy();
