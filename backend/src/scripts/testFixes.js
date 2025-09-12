const { PrismaClient } = require('@prisma/client');
const globalDrawService = require('../services/globalDrawService');

const prisma = new PrismaClient();

async function testFixes() {
  console.log('🔧 TESTANDO CORREÇÕES IMPLEMENTADAS');
  console.log('===================================\n');

  try {
    // Criar usuário de teste
    const timestamp = Date.now();
    const testUser = await prisma.user.create({
      data: {
        email: `teste.correcoes.${timestamp}@teste.com`,
        nome: `Usuário Teste Correções`,
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

    // Simular 10 aberturas de caixa
    console.log('🎲 SIMULANDO 10 ABERTURAS DE CAIXA:\n');

    let premiosReaisGanhos = 0;
    let premiosIlustrativos = 0;

    for (let i = 1; i <= 10; i++) {
      try {
        console.log(`--- ABERTURA ${i} ---`);
        
        const result = await globalDrawService.sortearPremio(caseItem.id, testUser.id);
        
        console.log('📋 Resultado capturado:', result);
        
        if (result && result.success) {
          const resultType = result.audit_data?.result_type || result.result;
          
          if (resultType === 'PAID') {
            console.log(`✅ Prêmio real: ${result.prize.nome} - R$ ${result.prize.valor.toFixed(2)}`);
            console.log(`   Imagem: ${result.prize.imagem_url || 'N/A'}`);
            premiosReaisGanhos++;
          } else if (resultType === 'NO_PRIZE') {
            console.log(`🎭 Prêmio ilustrativo: ${result.prize.nome} - R$ ${result.prize.valor.toFixed(2)}`);
            console.log(`   Sem imagem: ${result.prize.sem_imagem ? 'SIM' : 'NÃO'}`);
            premiosIlustrativos++;
          }
        } else {
          console.log(`❌ Erro: ${result?.message || 'Resultado indefinido'}`);
        }
        console.log('');

      } catch (error) {
        console.log(`❌ Erro na abertura ${i}: ${error.message}\n`);
      }
    }

    // Verificar saldo final
    const finalUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });

    console.log('📊 RESUMO DO TESTE:');
    console.log(`💰 Saldo final: R$ ${finalUser.saldo.toFixed(2)}`);
    console.log(`🎁 Prêmios reais ganhos: ${premiosReaisGanhos}`);
    console.log(`🎭 Prêmios ilustrativos: ${premiosIlustrativos}`);
    console.log(`📈 Total de aberturas: ${premiosReaisGanhos + premiosIlustrativos}`);

    // Verificar se a contagem está correta
    if (premiosReaisGanhos + premiosIlustrativos === 10) {
      console.log('✅ Contagem de prêmios está correta!');
    } else {
      console.log('❌ Contagem de prêmios está incorreta!');
    }

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

testFixes();
