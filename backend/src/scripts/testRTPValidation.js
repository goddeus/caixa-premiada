const { PrismaClient } = require('@prisma/client');
const globalDrawService = require('../services/globalDrawService');

const prisma = new PrismaClient();

async function testRTPValidation() {
  console.log('🧪 TESTE DE VALIDAÇÃO RTP - 1.000 SIMULAÇÕES');
  console.log('==============================================\n');
  console.log('🎯 Objetivo: Validar RTP = 0.01% com 1.000 simulações');
  console.log('📊 Verificações: RTP final ≤ 0.01%, banca não quebra, apenas R$1,00 após limite\n');

  try {
    // Ajustar RTP para 0.01% (ultra agressivo)
    console.log('⚙️ Ajustando RTP para 0.01%...');
    await prisma.rTPConfig.updateMany({
      data: {
        rtp_target: 0.01
      }
    });
    console.log('✅ RTP ajustado para 0.01%\n');

    // Criar usuário de teste
    const timestamp = Date.now();
    const testUser = await prisma.user.create({
      data: {
        email: `teste.validacao.${timestamp}@teste.com`,
        nome: `Usuário Validação RTP`,
        saldo: 1000.00, // Saldo alto para 1.000 simulações
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

    console.log(`📦 Caixa selecionada: ${caseItem.nome} (R$ ${caseItem.preco})`);
    console.log(`🎁 Prêmios disponíveis: ${caseItem.prizes.length}\n`);

    // Estatísticas do teste
    let totalSpent = 0;
    let totalWon = 0;
    let rounds = 0;
    let roundsAfterLimit = 0;
    let prizesAfterLimit = [];
    let maxPrizeAfterLimit = 0;
    let startTime = Date.now();

    console.log('🎲 INICIANDO 1.000 SIMULAÇÕES...\n');

    // Realizar 1.000 simulações
    for (let i = 1; i <= 1000; i++) {
      // Verificar se tem saldo suficiente
      if (testUser.saldo < caseItem.preco) {
        console.log(`💸 Saldo insuficiente na simulação ${i} (R$ ${testUser.saldo.toFixed(2)})`);
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
        rounds++;

        // 3. Sortear prêmio
        const result = await globalDrawService.sortearPremio(caseItem.id, testUser.id);
        
        if (result.success) {
          totalWon += result.prize.valor;
          
          // Verificar se está após o limite de RTP individual
          const userRTPSession = await prisma.userRTPSession.findFirst({
            where: {
              user_id: testUser.id,
              case_id: caseItem.id
            }
          });
          
          if (userRTPSession && userRTPSession.limite_atingido) {
            roundsAfterLimit++;
            prizesAfterLimit.push(result.prize.valor);
            maxPrizeAfterLimit = Math.max(maxPrizeAfterLimit, result.prize.valor);
          }
        }

        // Log de progresso a cada 100 simulações
        if (i % 100 === 0) {
          const currentRTP = totalSpent > 0 ? (totalWon / totalSpent) * 100 : 0;
          console.log(`📊 Simulação ${i}/1000 - RTP atual: ${currentRTP.toFixed(3)}% - Saldo: R$ ${testUser.saldo.toFixed(2)}`);
        }

      } catch (error) {
        console.log(`❌ Erro na simulação ${i}: ${error.message}`);
        break;
      }
    }

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // Buscar saldo final real
    const finalUser = await prisma.user.findUnique({
      where: { id: testUser.id }
    });

    // Calcular RTP final
    const finalRTP = totalSpent > 0 ? (totalWon / totalSpent) * 100 : 0;
    const expectedRTP = 0.01;
    const rtpDifference = finalRTP - expectedRTP;

    // Relatório final
    console.log('\n📋 RELATÓRIO FINAL DE VALIDAÇÃO RTP');
    console.log('====================================\n');

    console.log('📊 ESTATÍSTICAS GERAIS:');
    console.log(`🎲 Total de simulações: ${rounds}`);
    console.log(`💰 Total gasto: R$ ${totalSpent.toFixed(2)}`);
    console.log(`🎁 Total ganho: R$ ${totalWon.toFixed(2)}`);
    console.log(`📊 RTP final: ${finalRTP.toFixed(3)}%`);
    console.log(`🎯 RTP esperado: ${expectedRTP}%`);
    console.log(`📈 Diferença: ${rtpDifference.toFixed(3)}%`);
    console.log(`⏱️ Tempo total: ${Math.round(totalTime/1000)}s`);
    console.log(`💰 Saldo final: R$ ${finalUser.saldo.toFixed(2)}`);

    console.log('\n🔍 VALIDAÇÕES APÓS LIMITE INDIVIDUAL:');
    console.log(`🎲 Rounds após limite: ${roundsAfterLimit}`);
    console.log(`🎁 Prêmios após limite: ${prizesAfterLimit.length}`);
    if (prizesAfterLimit.length > 0) {
      console.log(`💰 Maior prêmio após limite: R$ ${maxPrizeAfterLimit.toFixed(2)}`);
      console.log(`📊 Prêmios após limite: ${prizesAfterLimit.slice(0, 10).map(p => `R$ ${p.toFixed(2)}`).join(', ')}${prizesAfterLimit.length > 10 ? '...' : ''}`);
    }

    console.log('\n✅ VALIDAÇÕES:');
    
    // Validação 1: RTP final ≤ 0.01%
    const rtpValid = finalRTP <= expectedRTP + 0.001; // Margem de 0.001%
    console.log(`${rtpValid ? '✅' : '❌'} RTP final ≤ 0.01%: ${finalRTP.toFixed(3)}% (${rtpValid ? 'PASSOU' : 'FALHOU'})`);

    // Validação 2: Banca não quebra
    const bankNotBroken = finalUser.saldo > 0;
    console.log(`${bankNotBroken ? '✅' : '❌'} Banca não quebra: R$ ${finalUser.saldo.toFixed(2)} (${bankNotBroken ? 'PASSOU' : 'FALHOU'})`);

    // Validação 3: Apenas R$1,00 após limite
    const onlySmallPrizesAfterLimit = prizesAfterLimit.length === 0 || maxPrizeAfterLimit <= 1.00;
    console.log(`${onlySmallPrizesAfterLimit ? '✅' : '❌'} Apenas R$1,00 após limite: R$ ${maxPrizeAfterLimit.toFixed(2)} (${onlySmallPrizesAfterLimit ? 'PASSOU' : 'FALHOU'})`);

    // Resultado final
    const allValidationsPassed = rtpValid && bankNotBroken && onlySmallPrizesAfterLimit;
    console.log(`\n🎯 RESULTADO FINAL: ${allValidationsPassed ? '✅ TODAS AS VALIDAÇÕES PASSARAM' : '❌ ALGUMAS VALIDAÇÕES FALHARAM'}`);

    // Restaurar RTP original
    console.log('\n⚙️ Restaurando RTP para 50%...');
    await prisma.rTPConfig.updateMany({
      data: {
        rtp_target: 50.0
      }
    });
    console.log('✅ RTP restaurado para 50%');

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
    console.error('❌ Erro no teste de validação:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRTPValidation();

