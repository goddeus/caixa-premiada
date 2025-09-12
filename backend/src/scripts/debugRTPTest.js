const { PrismaClient } = require('@prisma/client');
const globalDrawService = require('../services/globalDrawService');

const prisma = new PrismaClient();

async function debugRTPTest() {
  console.log('🔍 TESTE DE DEBUG - RTP SYSTEM');
  console.log('================================\n');

  try {
    // Ajustar RTP para 10% (ultra agressivo)
    console.log('⚙️ Ajustando RTP para 10%...');
    await prisma.rTPConfig.updateMany({
      data: {
        rtp_target: 10.0
      }
    });
    console.log('✅ RTP ajustado para 10%\n');

    // Criar 1 usuário de teste
    const timestamp = Date.now();
    const testUser = await prisma.user.create({
      data: {
        email: `debug.${timestamp}@teste.com`,
        nome: `Usuário Debug`,
        saldo: 20.00,
        senha_hash: 'teste123',
        cpf: `1234567890${timestamp}`
      }
    });

    console.log(`👤 Usuário criado: ${testUser.nome} (Saldo: R$ ${testUser.saldo})`);

    // Buscar uma caixa específica
    const caseItem = await prisma.case.findFirst({
      where: { ativo: true },
      include: { prizes: true }
    });

    if (!caseItem) {
      throw new Error('Nenhuma caixa encontrada');
    }

    console.log(`📦 Caixa selecionada: ${caseItem.nome} (R$ ${caseItem.preco})`);
    console.log(`🎁 Prêmios disponíveis: ${caseItem.prizes.length}`);
    
    // Mostrar prêmios originais
    console.log('\n📊 PRÊMIOS ORIGINAIS:');
    caseItem.prizes.forEach((prize, index) => {
      console.log(`${index + 1}. ${prize.nome}: R$ ${prize.valor} (${prize.probabilidade}%)`);
    });

    // Fazer 5 sorteios e mostrar detalhes
    console.log('\n🎲 REALIZANDO 5 SORTEIOS DE DEBUG...\n');

    let totalSpent = 0;
    let totalWon = 0;

    for (let i = 1; i <= 5; i++) {
      console.log(`--- SORTEIO ${i} ---`);
      
      // Verificar saldo antes
      const userBefore = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      console.log(`💰 Saldo antes: R$ ${userBefore.saldo.toFixed(2)}`);

      // Verificar se tem saldo suficiente
      if (userBefore.saldo < caseItem.preco) {
        console.log(`❌ Saldo insuficiente para ${caseItem.nome} (R$ ${caseItem.preco})`);
        break;
      }

      try {
        // 1. DEBITAR o preço da caixa
        await prisma.user.update({
          where: { id: testUser.id },
          data: { saldo: { decrement: caseItem.preco } }
        });

        // 2. Criar transação de abertura
        await prisma.transaction.create({
          data: {
            user_id: testUser.id,
            case_id: caseItem.id,
            tipo: 'abertura_caixa',
            valor: caseItem.preco,
            descricao: `Abertura de caixa ${caseItem.nome}`,
            status: 'completed'
          }
        });

        totalSpent += caseItem.preco;
        console.log(`💸 Débito: R$ ${caseItem.preco} | Total gasto: R$ ${totalSpent.toFixed(2)}`);

        // 3. Sortear prêmio
        console.log('🎲 Chamando globalDrawService.sortearPremio...');
        const result = await globalDrawService.sortearPremio(caseItem.id, testUser.id);
        
        if (result.success) {
          totalWon += result.prize.valor;
          console.log(`🎁 Prêmio sorteado: ${result.prize.nome} - R$ ${result.prize.valor}`);
          console.log(`📈 Total ganho: R$ ${totalWon.toFixed(2)}`);
          
          // Verificar saldo depois
          const userAfter = await prisma.user.findUnique({
            where: { id: testUser.id }
          });
          console.log(`💰 Saldo depois: R$ ${userAfter.saldo.toFixed(2)}`);
          
          // Calcular RTP atual
          const currentRTP = totalSpent > 0 ? (totalWon / totalSpent) * 100 : 0;
          console.log(`📊 RTP atual: ${currentRTP.toFixed(1)}%`);
        } else {
          console.log(`❌ Erro no sorteio: ${result.message}`);
        }

      } catch (error) {
        console.log(`❌ Erro no sorteio ${i}: ${error.message}`);
        break;
      }

      console.log('');
    }

    // Relatório final
    console.log('📋 RELATÓRIO FINAL DE DEBUG:');
    console.log('============================');
    console.log(`💰 Total gasto: R$ ${totalSpent.toFixed(2)}`);
    console.log(`🎁 Total ganho: R$ ${totalWon.toFixed(2)}`);
    console.log(`📊 RTP final: ${totalSpent > 0 ? ((totalWon / totalSpent) * 100).toFixed(1) : 0}%`);
    console.log(`🎯 RTP esperado: 10.0%`);
    console.log(`📈 Diferença: ${totalSpent > 0 ? (((totalWon / totalSpent) * 100) - 10).toFixed(1) : 0}%`);

    // Verificar configuração RTP atual
    const rtpConfig = await prisma.rTPConfig.findFirst();
    console.log(`⚙️ RTP configurado no banco: ${rtpConfig.rtp_target}%`);

    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    await prisma.transaction.deleteMany({
      where: { user_id: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Dados de teste limpos');

  } catch (error) {
    console.error('❌ Erro no teste de debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugRTPTest();

