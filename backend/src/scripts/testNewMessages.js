const { PrismaClient } = require('@prisma/client');
const globalDrawService = require('../services/globalDrawService');

const prisma = new PrismaClient();

async function testNewMessages() {
  console.log('🎮 TESTANDO NOVAS MENSAGENS REALISTAS');
  console.log('=====================================\n');

  try {
    // Criar usuário de teste
    const timestamp = Date.now();
    const testUser = await prisma.user.create({
      data: {
        email: `teste.mensagens.${timestamp}@teste.com`,
        nome: `Usuário Teste Mensagens`,
        saldo: 100.00,
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

    // Simular 10 aberturas para ver as mensagens
    console.log('🎲 SIMULANDO 10 ABERTURAS DE CAIXA:\n');

    for (let i = 1; i <= 10; i++) {
      try {
        const result = await globalDrawService.sortearPremio(caseItem.id, testUser.id);
        
        if (result.success) {
          console.log(`${i}. ${result.prize.nome} - R$ ${result.prize.valor.toFixed(2)}`);
        } else {
          console.log(`${i}. ERRO: ${result.message}`);
        }
      } catch (error) {
        console.log(`${i}. ERRO: ${error.message}`);
      }
    }

    // Verificar saldo final
    const finalUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });

    console.log(`\n💰 Saldo final: R$ ${finalUser.saldo.toFixed(2)}`);

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

testNewMessages();

