const { PrismaClient } = require('@prisma/client');
const globalDrawService = require('../services/globalDrawService');

const prisma = new PrismaClient();

async function ultraUltraAggressiveRTPTest() {
  console.log('💀 TESTE COM RTP ULTRA ULTRA AGRESSIVO (1%)');
  console.log('============================================\n');
  console.log('🎯 Objetivo: FORÇAR quebra total dos usuários');
  console.log('💰 RTP alvo: 1% (extremamente agressivo)\n');

  try {
    // Ajustar RTP para 1% (ultra ultra agressivo)
    console.log('⚙️ Ajustando RTP para 1%...');
    await prisma.rTPConfig.updateMany({
      data: {
        rtp_target: 1.0
      }
    });
    console.log('✅ RTP ajustado para 1%\n');

    // Criar 3 usuários de teste com R$ 20,00 cada
    const testUsers = [];
    const timestamp = Date.now();
    
    console.log('👥 Criando 3 usuários de teste...');
    for (let i = 1; i <= 3; i++) {
      const user = await prisma.user.create({
        data: {
          email: `teste.ultra.ultra.${timestamp}.${i}@teste.com`,
          nome: `Usuário Ultra Ultra ${i}`,
          saldo: 20.00,
          senha_hash: 'teste123',
          cpf: `1234567890${timestamp}${i}`
        }
      });
      testUsers.push(user);
    }
    console.log(`✅ ${testUsers.length} usuários criados com R$ 20,00 cada\n`);

    // Buscar todas as caixas disponíveis
    const cases = await prisma.case.findMany({
      where: { ativo: true },
      include: { prizes: true }
    });

    console.log(`📦 Caixas disponíveis: ${cases.length}`);
    cases.forEach(caseItem => {
      console.log(`  - ${caseItem.nome}: R$ ${caseItem.preco}`);
    });
    console.log('');

    // Estatísticas do teste
    const results = [];
    let totalSystemProfit = 0;
    let totalRounds = 0;
    let totalTime = 0;
    let usersBankrupted = 0;

    console.log('🎲 INICIANDO TESTE ULTRA ULTRA AGRESSIVO...\n');

    // Testar cada usuário até zerar COMPLETAMENTE o saldo
    for (let userIndex = 0; userIndex < testUsers.length; userIndex++) {
      const user = testUsers[userIndex];
      const startTime = Date.now();
      
      console.log(`👤 Usuário ${userIndex + 1}/3: ${user.nome}`);
      console.log(`💰 Saldo inicial: R$ ${user.saldo.toFixed(2)}`);

      let rounds = 0;
      let totalSpent = 0;
      let totalWon = 0;
      let currentBalance = user.saldo;
      let belowWithdrawalLimit = false;
      let roundsBelowLimit = 0;
      const userStartTime = Date.now();

      // Continuar até zerar COMPLETAMENTE o saldo
      while (currentBalance > 0) {
        rounds++;
        
        // Escolher caixa aleatória
        const randomCase = cases[Math.floor(Math.random() * cases.length)];
        
        // Verificar se tem saldo suficiente
        if (currentBalance < randomCase.preco) {
          console.log(`  💸 Saldo insuficiente para ${randomCase.nome} (R$ ${randomCase.preco})`);
          break;
        }

        try {
          // 1. DEBITAR o preço da caixa
          await prisma.user.update({
            where: { id: user.id },
            data: { saldo: { decrement: randomCase.preco } }
          });

          // 2. Criar transação de abertura
          await prisma.transaction.create({
            data: {
              user_id: user.id,
              case_id: randomCase.id,
              tipo: 'abertura_caixa',
              valor: randomCase.preco,
              descricao: `Abertura de caixa ${randomCase.nome}`,
              status: 'completed'
            }
          });

          totalSpent += randomCase.preco;
          currentBalance -= randomCase.preco;

          // 3. Sortear prêmio
          const result = await globalDrawService.sortearPremio(randomCase.id, user.id);
          
          if (result.success) {
            totalWon += result.prize.valor;
            currentBalance += result.prize.valor;
            
            // Verificar se está abaixo do limite de saque
            if (currentBalance < 20.00 && !belowWithdrawalLimit) {
              belowWithdrawalLimit = true;
              console.log(`  🚨 ATINGIU LIMITE DE SAQUE! Saldo: R$ ${currentBalance.toFixed(2)} (abaixo de R$ 20,00)`);
            }
            
            if (belowWithdrawalLimit) {
              roundsBelowLimit++;
            }
            
            // Log detalhado para todos os rounds
            const status = belowWithdrawalLimit ? '🚨' : '🎲';
            console.log(`  ${status} Round ${rounds}: ${randomCase.nome} → ${result.prize.nome} (R$ ${result.prize.valor}) | Saldo: R$ ${currentBalance.toFixed(2)}`);
          }

        } catch (error) {
          console.log(`  ❌ Erro no round ${rounds}: ${error.message}`);
          break;
        }
      }

      const userEndTime = Date.now();
      const userTime = userEndTime - userStartTime;
      const userProfit = totalSpent - totalWon;
      const rtp = totalSpent > 0 ? (totalWon / totalSpent) * 100 : 0;
      const isBankrupted = currentBalance <= 0.01;

      // Buscar saldo final real
      const finalUser = await prisma.user.findUnique({
        where: { id: user.id }
      });

      if (isBankrupted) {
        usersBankrupted++;
      }

      const result = {
        userId: user.id,
        userName: user.nome,
        rounds: rounds,
        totalSpent: totalSpent,
        totalWon: totalWon,
        finalBalance: finalUser.saldo,
        profit: userProfit,
        rtp: rtp,
        timeMs: userTime,
        timeSeconds: Math.round(userTime / 1000),
        belowWithdrawalLimit: belowWithdrawalLimit,
        roundsBelowLimit: roundsBelowLimit,
        isBankrupted: isBankrupted
      };

      results.push(result);
      totalSystemProfit += userProfit;
      totalRounds += rounds;
      totalTime += userTime;

      const status = isBankrupted ? '💀 QUEBROU' : '💰 SOBREVIVEU';
      console.log(`  📊 ${status}: ${rounds} rounds | Gasto: R$ ${totalSpent.toFixed(2)} | Ganho: R$ ${totalWon.toFixed(2)} | RTP: ${rtp.toFixed(1)}% | Tempo: ${Math.round(userTime/1000)}s`);
      console.log(`  💰 Lucro do sistema: R$ ${userProfit.toFixed(2)} | Saldo final: R$ ${finalUser.saldo.toFixed(2)}`);
      if (belowWithdrawalLimit) {
        console.log(`  🚨 Rounds abaixo do limite de saque: ${roundsBelowLimit}`);
      }
      console.log('');
    }

    // Relatório final
    console.log('📋 RELATÓRIO FINAL - RTP ULTRA ULTRA AGRESSIVO (1%)');
    console.log('====================================================\n');

    // Estatísticas gerais
    const avgRounds = totalRounds / results.length;
    const avgTime = totalTime / results.length;
    const avgRTP = results.reduce((sum, r) => sum + r.rtp, 0) / results.length;
    const usersBelowLimit = results.filter(r => r.belowWithdrawalLimit).length;

    console.log('📊 ESTATÍSTICAS GERAIS:');
    console.log(`👥 Total de usuários: ${results.length}`);
    console.log(`💀 Usuários que quebraram: ${usersBankrupted}/${results.length} (${((usersBankrupted/results.length)*100).toFixed(1)}%)`);
    console.log(`🚨 Usuários abaixo do limite de saque: ${usersBelowLimit}/${results.length} (${((usersBelowLimit/results.length)*100).toFixed(1)}%)`);
    console.log(`💰 Lucro total do sistema: R$ ${totalSystemProfit.toFixed(2)}`);
    console.log(`📈 Lucro médio por usuário: R$ ${(totalSystemProfit / results.length).toFixed(2)}`);
    console.log(`🎲 Rounds médios por usuário: ${avgRounds.toFixed(1)}`);
    console.log(`⏱️ Tempo médio por usuário: ${Math.round(avgTime/1000)}s`);
    console.log(`📊 RTP médio: ${avgRTP.toFixed(1)}%`);
    console.log(`💰 Margem de lucro: ${((totalSystemProfit / (results.length * 20)) * 100).toFixed(1)}%\n`);

    // Análise de quebra
    console.log('💀 ANÁLISE DE QUEBRA:');
    results.forEach((analysis, index) => {
      const status = analysis.finalBalance <= 0.01 ? '💀' : '💰';
      const limitStatus = analysis.belowWithdrawalLimit ? '🚨' : '✅';
      console.log(`${index + 1}. ${status} ${analysis.userName}: ${analysis.rounds} rounds, RTP: ${analysis.rtp.toFixed(1)}%, Saldo: R$ ${analysis.finalBalance.toFixed(2)} ${limitStatus}`);
    });
    console.log('');

    // Conclusão
    console.log('🎯 CONCLUSÃO:');
    if (totalSystemProfit > 0) {
      console.log(`✅ SISTEMA LUCRATIVO: R$ ${totalSystemProfit.toFixed(2)} de lucro total`);
    } else {
      console.log(`❌ SISTEMA PREJUDICIAL: R$ ${Math.abs(totalSystemProfit).toFixed(2)} de prejuízo`);
    }
    
    console.log(`⏱️ Tempo médio para quebrar usuário: ${Math.round(avgTime/1000)} segundos`);
    console.log(`🎲 Rounds médios para quebrar: ${avgRounds.toFixed(1)}`);
    console.log(`🚨 Taxa de usuários abaixo do limite de saque: ${((usersBelowLimit/results.length)*100).toFixed(1)}%`);
    console.log(`💀 Taxa de quebra total: ${((usersBankrupted/results.length)*100).toFixed(1)}%`);

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
    for (const user of testUsers) {
      await prisma.transaction.deleteMany({
        where: { user_id: user.id }
      });
      await prisma.user.delete({
        where: { id: user.id }
      });
    }
    console.log('✅ Dados de teste limpos');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ultraUltraAggressiveRTPTest();

