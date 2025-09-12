const { PrismaClient } = require('@prisma/client');
const globalDrawService = require('../services/globalDrawService');
const cashFlowService = require('../services/cashFlowService');

const prisma = new PrismaClient();

async function testPlatformCashUpdate() {
  console.log('💰 TESTANDO ATUALIZAÇÃO DO CAIXA DA PLATAFORMA');
  console.log('==============================================\n');

  try {
    // Verificar caixa inicial
    console.log('📊 CAIXA INICIAL:');
    const initialCash = await cashFlowService.calcularCaixaLiquido();
    console.log(`💰 Caixa Líquido: R$ ${initialCash.caixaLiquido.toFixed(2)}`);
    console.log(`📈 Total Depósitos: R$ ${initialCash.totalDepositos.toFixed(2)}`);
    console.log(`📉 Total Saques: R$ ${initialCash.totalSaques.toFixed(2)}`);
    console.log(`🎁 Total Prêmios Pagos: R$ ${initialCash.totalComissoesAfiliados.toFixed(2)}`);
    console.log(`🧪 Fundos Teste: R$ ${initialCash.fundosTeste.toFixed(2)}\n`);

    // Criar usuário de teste
    const timestamp = Date.now();
    const testUser = await prisma.user.create({
      data: {
        email: `teste.caixa.${timestamp}@teste.com`,
        nome: `Usuário Teste Caixa`,
        saldo: 50.00,
        senha_hash: 'teste123',
        cpf: `1234567890${timestamp}`
      }
    });

    console.log(`👤 Usuário criado: ${testUser.nome} (Saldo: R$ ${testUser.saldo})`);

    // Buscar caixa para teste
    const caseItem = await prisma.case.findFirst({
      where: { ativo: true },
      include: { prizes: true }
    });

    if (!caseItem) {
      throw new Error('Nenhuma caixa encontrada');
    }

    console.log(`📦 Caixa selecionada: ${caseItem.nome} (R$ ${caseItem.preco})\n`);

    // Simular 5 aberturas de caixa
    console.log('🎲 SIMULANDO 5 ABERTURAS DE CAIXA:\n');

    for (let i = 1; i <= 5; i++) {
      try {
        console.log(`--- ABERTURA ${i} ---`);
        
        // Verificar caixa antes
        const cashBefore = await cashFlowService.calcularCaixaLiquido();
        console.log(`💰 Caixa antes: R$ ${cashBefore.caixaLiquido.toFixed(2)}`);

        const result = await globalDrawService.sortearPremio(caseItem.id, testUser.id);
        
        if (result.success) {
          console.log(`🎁 Resultado: ${result.prize.nome} - R$ ${result.prize.valor.toFixed(2)}`);
        } else {
          console.log(`❌ Erro: ${result.message}`);
        }

        // Verificar caixa depois
        const cashAfter = await cashFlowService.calcularCaixaLiquido();
        console.log(`💰 Caixa depois: R$ ${cashAfter.caixaLiquido.toFixed(2)}`);
        console.log(`📊 Diferença: R$ ${(cashAfter.caixaLiquido - cashBefore.caixaLiquido).toFixed(2)}`);
        console.log('');

      } catch (error) {
        console.log(`❌ Erro na abertura ${i}: ${error.message}\n`);
      }
    }

    // Verificar caixa final
    console.log('📊 CAIXA FINAL:');
    const finalCash = await cashFlowService.calcularCaixaLiquido();
    console.log(`💰 Caixa Líquido: R$ ${finalCash.caixaLiquido.toFixed(2)}`);
    console.log(`📈 Total Depósitos: R$ ${finalCash.totalDepositos.toFixed(2)}`);
    console.log(`📉 Total Saques: R$ ${finalCash.totalSaques.toFixed(2)}`);
    console.log(`🎁 Total Prêmios Pagos: R$ ${finalCash.totalComissoesAfiliados.toFixed(2)}`);
    console.log(`🧪 Fundos Teste: R$ ${finalCash.fundosTeste.toFixed(2)}`);

    const totalDifference = finalCash.caixaLiquido - initialCash.caixaLiquido;
    console.log(`\n📊 DIFERENÇA TOTAL: R$ ${totalDifference.toFixed(2)}`);

    if (totalDifference < 0) {
      console.log('✅ SUCESSO: Caixa da plataforma aumentou (usuário perdeu dinheiro)');
    } else {
      console.log('⚠️ ATENÇÃO: Caixa da plataforma diminuiu (usuário ganhou dinheiro)');
    }

    // Verificar saldo final do usuário
    const finalUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });

    console.log(`\n👤 Saldo final do usuário: R$ ${finalUser.saldo.toFixed(2)}`);

    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    await prisma.transaction.deleteMany({
      where: { user_id: testUser.id }
    });
    await prisma.userSession.deleteMany({
      where: { user_id: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Dados de teste limpos');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPlatformCashUpdate();

