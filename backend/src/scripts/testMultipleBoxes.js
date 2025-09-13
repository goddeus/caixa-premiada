const { PrismaClient } = require('@prisma/client');
const globalDrawService = require('../services/globalDrawService');

const prisma = new PrismaClient();

async function testMultipleBoxes() {
  console.log('🧪 TESTE DE MÚLTIPLAS CAIXAS');
  console.log('============================');

  try {
    // Buscar uma caixa ativa
    const caseData = await prisma.case.findFirst({
      where: { ativo: true },
      include: {
        prizes: {
          where: { ativo: true, sorteavel: true }
        }
      }
    });

    if (!caseData) {
      console.log('❌ Nenhuma caixa ativa encontrada');
      return;
    }

    console.log(`📦 Caixa selecionada: ${caseData.nome} (R$ ${caseData.preco})`);
    console.log(`🎁 Prêmios disponíveis: ${caseData.prizes.length}`);

    // Criar usuário de teste
    const testUser = await prisma.user.create({
      data: {
        nome: 'Teste Múltiplas Caixas',
        email: `teste_multiplas_${Date.now()}@teste.com`,
        senha_hash: 'hash_teste',
        cpf: `${Date.now()}`,
        saldo_reais: 100.00,
        saldo_demo: 0
      }
    });

    // Criar carteira
    await prisma.wallet.create({
      data: {
        user_id: testUser.id,
        saldo_reais: 100.00,
        saldo_demo: 0
      }
    });

    console.log(`👤 Usuário criado: ${testUser.nome} (Saldo: R$ ${testUser.saldo})`);

    // Simular compra de 5 caixas
    const quantity = 5;
    const results = [];
    let totalWon = 0;

    console.log(`\n🎲 SIMULANDO ${quantity} CAIXAS...`);

    for (let i = 0; i < quantity; i++) {
      try {
        console.log(`\n📦 Processando Caixa ${i + 1}/${quantity}...`);
        
        const drawResult = await globalDrawService.sortearPremio(caseData.id, testUser.id);
        
        if (!drawResult.success) {
          console.log(`❌ Erro na caixa ${i + 1}: ${drawResult.message}`);
          results.push({
            boxNumber: i + 1,
            success: false,
            error: drawResult.message,
            prize: null
          });
          continue;
        }
        
        const wonPrize = drawResult.prize;
        console.log(`🎁 Prêmio: ${wonPrize.nome}`);
        console.log(`💰 Valor: R$ ${wonPrize.valor}`);
        console.log(`🖼️ Sem imagem: ${wonPrize.sem_imagem || false}`);
        console.log(`📝 Mensagem: ${wonPrize.message || 'N/A'}`);

        if (wonPrize.valor > 0) {
          totalWon += parseFloat(wonPrize.valor);
        }

        results.push({
          boxNumber: i + 1,
          success: true,
          prize: {
            id: wonPrize.id,
            nome: wonPrize.nome,
            valor: wonPrize.valor,
            imagem_url: wonPrize.imagem_url,
            sem_imagem: wonPrize.sem_imagem || false,
            is_illustrative: wonPrize.valor === 0,
            message: wonPrize.message || (wonPrize.valor === 0 ? 'Quem sabe na próxima!' : `Parabéns! Você ganhou R$ ${parseFloat(wonPrize.valor).toFixed(2)}!`)
          }
        });

      } catch (error) {
        console.error(`❌ Erro ao processar caixa ${i + 1}:`, error.message);
        results.push({
          boxNumber: i + 1,
          success: false,
          error: error.message,
          prize: null
        });
      }
    }

    // Verificar saldo final
    const finalUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { saldo_reais: true, saldo_demo: true, tipo_conta: true }
    });

    console.log('\n📊 RESULTADOS FINAIS:');
    console.log('====================');
    console.log(`💰 Total gasto: R$ ${(parseFloat(caseData.preco) * quantity).toFixed(2)}`);
    console.log(`🎁 Total ganho: R$ ${totalWon.toFixed(2)}`);
    console.log(`💸 Saldo final: R$ ${finalUser.saldo.toFixed(2)}`);
    console.log(`📈 Resultado líquido: R$ ${(totalWon - (parseFloat(caseData.preco) * quantity)).toFixed(2)}`);

    console.log('\n📋 DETALHES DAS CAIXAS:');
    console.log('======================');
    results.forEach(result => {
      if (result.success) {
        const prize = result.prize;
        console.log(`Caixa ${result.boxNumber}: ${prize.nome} - R$ ${prize.valor} ${prize.sem_imagem ? '(sem imagem)' : '(com imagem)'}`);
      } else {
        console.log(`Caixa ${result.boxNumber}: ERRO - ${result.error}`);
      }
    });

    // Verificar se prêmios ilustrativos não têm imagem
    const illustrativePrizes = results.filter(r => r.success && r.prize?.valor === 0);
    console.log(`\n🎭 Prêmios ilustrativos: ${illustrativePrizes.length}`);
    illustrativePrizes.forEach(result => {
      console.log(`- Caixa ${result.boxNumber}: ${result.prize.nome} (sem_imagem: ${result.prize.sem_imagem})`);
    });

    // Limpar dados de teste
    await prisma.transaction.deleteMany({
      where: { user_id: testUser.id }
    });
    await prisma.wallet.deleteMany({
      where: { user_id: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });

    console.log('\n✅ Teste concluído e dados limpos');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMultipleBoxes();
