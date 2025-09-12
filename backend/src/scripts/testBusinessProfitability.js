const { PrismaClient } = require('@prisma/client');
const globalDrawService = require('../services/globalDrawService');
const cashFlowService = require('../services/cashFlowService');

const prisma = new PrismaClient();

async function testBusinessProfitability() {
  console.log('💼 TESTE DE LUCRATIVIDADE DO NEGÓCIO');
  console.log('=====================================');
  console.log('🎯 Simulando 30 usuários com R$ 20,00 cada');
  console.log('💰 Incluindo comissões de afiliados (R$ 10,00 por indicação)\n');

  try {
    // Verificar caixa inicial
    console.log('📊 CAIXA INICIAL:');
    const initialCash = await cashFlowService.calcularCaixaLiquido();
    console.log(`💰 Caixa Líquido: R$ ${initialCash.caixaLiquido.toFixed(2)}`);
    console.log(`📈 Total Depósitos: R$ ${initialCash.totalDepositos.toFixed(2)}`);
    console.log(`📉 Total Saques: R$ ${initialCash.totalSaques.toFixed(2)}`);
    console.log(`🎁 Total Prêmios Pagos: R$ ${initialCash.totalComissoesAfiliados.toFixed(2)}`);
    console.log(`🧪 Fundos Teste: R$ ${initialCash.fundosTeste.toFixed(2)}\n`);

    // Buscar caixa para teste
    const caseItem = await prisma.case.findFirst({
      where: { ativo: true },
      include: { prizes: true }
    });

    if (!caseItem) {
      throw new Error('Nenhuma caixa encontrada');
    }

    console.log(`📦 Caixa selecionada: ${caseItem.nome} (R$ ${caseItem.preco})\n`);

    // Criar 30 usuários de teste
    const users = [];
    const timestamp = Date.now();
    
    console.log('👥 CRIANDO 30 USUÁRIOS...');
    for (let i = 1; i <= 30; i++) {
      const user = await prisma.user.create({
        data: {
          email: `usuario.${i}.${timestamp}@teste.com`,
          nome: `Usuário ${i}`,
          saldo: 20.00, // R$ 20,00 de saldo inicial
          senha_hash: 'teste123',
          cpf: `1234567890${timestamp}${i}`,
          primeiro_deposito_feito: true // Marcar como já fez primeiro depósito
        }
      });
      users.push(user);
    }
    console.log(`✅ ${users.length} usuários criados\n`);

    // Simular indicações (50% dos usuários foram indicados)
    const affiliateUsers = users.slice(0, 15); // Primeiros 15 usuários
    const referredUsers = users.slice(15, 30); // Últimos 15 usuários
    
    console.log('🤝 SIMULANDO INDICAÇÕES...');
    for (let i = 0; i < referredUsers.length; i++) {
      const affiliate = affiliateUsers[i];
      const referred = referredUsers[i];
      
      // Criar afiliado se não existir
      let affiliateRecord = await prisma.affiliate.findUnique({
        where: { user_id: affiliate.id }
      });
      
      if (!affiliateRecord) {
        affiliateRecord = await prisma.affiliate.create({
          data: {
            user_id: affiliate.id,
            codigo_indicacao: `AFF${affiliate.id.slice(-6).toUpperCase()}`,
            ganhos: 0,
            saldo_disponivel: 0,
            total_sacado: 0
          }
        });
      }
      
      // Registrar indicação
      await prisma.affiliateHistory.create({
        data: {
          affiliate_id: affiliateRecord.id,
          indicado_id: referred.id,
          deposito_valido: true
        }
      });
      
      // Pagar comissão de R$ 10,00
      await prisma.$transaction(async (tx) => {
        // Atualizar ganhos do afiliado
        await tx.affiliate.update({
          where: { id: affiliateRecord.id },
          data: {
            ganhos: { increment: 10 },
            saldo_disponivel: { increment: 10 }
          }
        });
        
        // Creditar saldo do afiliado
        await tx.user.update({
          where: { id: affiliate.id },
          data: {
            saldo: { increment: 10 }
          }
        });
        
        // Criar ou atualizar carteira
        await tx.wallet.upsert({
          where: { user_id: affiliate.id },
          update: {
            saldo: { increment: 10 }
          },
          create: {
            user_id: affiliate.id,
            saldo: 10
          }
        });
        
        // Registrar transação de comissão
        await tx.transaction.create({
          data: {
            user_id: affiliate.id,
            tipo: 'afiliado',
            valor: 10,
            status: 'concluido',
            descricao: `Comissão de indicação: ${referred.nome}`
          }
        });
      });
    }
    console.log(`✅ ${referredUsers.length} indicações processadas (R$ 10,00 cada)\n`);

    // Simular aberturas de caixa até zerar ou ficar com menos de R$ 2,50
    console.log('🎲 SIMULANDO ABERTURAS DE CAIXA...');
    let totalBoxesOpened = 0;
    let totalPrizesPaid = 0;
    let usersBroke = 0;
    let usersWithBalance = 0;
    
    const results = [];
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      let userBoxesOpened = 0;
      let userPrizesWon = 0;
      let userSpent = 0;
      
      console.log(`👤 Usuário ${i + 1}: ${user.nome}`);
      
      // Abrir caixas até não conseguir mais
      while (true) {
        try {
          // Verificar se tem saldo suficiente
          const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { saldo: true }
          });
          
          if (currentUser.saldo < caseItem.preco) {
            break; // Não tem saldo suficiente
          }
          
          const result = await globalDrawService.sortearPremio(caseItem.id, user.id);
          
          if (result && result.success) {
            userBoxesOpened++;
            totalBoxesOpened++;
            userSpent += caseItem.preco;
            
            const resultType = result.audit_data?.result_type || result.result;
            
            if (resultType === 'PAID') {
              userPrizesWon += result.prize.valor;
              totalPrizesPaid += result.prize.valor;
            }
          }
          
        } catch (error) {
          console.log(`   ❌ Erro: ${error.message}`);
          break;
        }
      }
      
      // Verificar saldo final
      const finalUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { saldo: true }
      });
      
      const isBroke = finalUser.saldo < 2.50; // Menos que o preço de uma caixa
      
      if (isBroke) {
        usersBroke++;
      } else {
        usersWithBalance++;
      }
      
      results.push({
        user: user.nome,
        initialBalance: 20.00,
        finalBalance: finalUser.saldo,
        boxesOpened: userBoxesOpened,
        prizesWon: userPrizesWon,
        spent: userSpent,
        isBroke: isBroke,
        netResult: finalUser.saldo - 20.00
      });
      
      console.log(`   💰 Saldo final: R$ ${finalUser.saldo.toFixed(2)}`);
      console.log(`   🎲 Caixas abertas: ${userBoxesOpened}`);
      console.log(`   🎁 Prêmios ganhos: R$ ${userPrizesWon.toFixed(2)}`);
      console.log(`   💸 Gasto total: R$ ${userSpent.toFixed(2)}`);
      console.log(`   📊 Resultado: ${isBroke ? 'QUEBROU' : 'SALDO RESTANTE'}\n`);
    }

    // Verificar caixa final
    console.log('📊 CAIXA FINAL:');
    const finalCash = await cashFlowService.calcularCaixaLiquido();
    console.log(`💰 Caixa Líquido: R$ ${finalCash.caixaLiquido.toFixed(2)}`);
    console.log(`📈 Total Depósitos: R$ ${finalCash.totalDepositos.toFixed(2)}`);
    console.log(`📉 Total Saques: R$ ${finalCash.totalSaques.toFixed(2)}`);
    console.log(`🎁 Total Prêmios Pagos: R$ ${finalCash.totalComissoesAfiliados.toFixed(2)}`);
    console.log(`🧪 Fundos Teste: R$ ${finalCash.fundosTeste.toFixed(2)}`);

    // Calcular lucro
    const totalDeposits = 30 * 20; // R$ 600,00
    const totalAffiliateCommissions = 15 * 10; // R$ 150,00
    const totalRevenue = totalDeposits + totalAffiliateCommissions; // R$ 750,00
    const totalBoxRevenue = totalBoxesOpened * caseItem.preco; // R$ 2,50 por caixa
    const netProfit = totalBoxRevenue - totalPrizesPaid;
    const totalProfit = netProfit - totalAffiliateCommissions;

    console.log('\n💰 ANÁLISE FINANCEIRA:');
    console.log('======================');
    console.log(`💵 Receita total: R$ ${totalRevenue.toFixed(2)}`);
    console.log(`   - Depósitos: R$ ${totalDeposits.toFixed(2)}`);
    console.log(`   - Vendas de caixas: R$ ${totalBoxRevenue.toFixed(2)}`);
    console.log(`💸 Custos:`);
    console.log(`   - Prêmios pagos: R$ ${totalPrizesPaid.toFixed(2)}`);
    console.log(`   - Comissões afiliados: R$ ${totalAffiliateCommissions.toFixed(2)}`);
    console.log(`💰 LUCRO LÍQUIDO: R$ ${totalProfit.toFixed(2)}`);
    console.log(`📈 Margem de lucro: ${((totalProfit / totalRevenue) * 100).toFixed(2)}%`);

    console.log('\n📊 ESTATÍSTICAS DOS USUÁRIOS:');
    console.log('=============================');
    console.log(`👥 Total de usuários: ${users.length}`);
    console.log(`💀 Usuários que quebraram: ${usersBroke} (${((usersBroke / users.length) * 100).toFixed(1)}%)`);
    console.log(`💰 Usuários com saldo: ${usersWithBalance} (${((usersWithBalance / users.length) * 100).toFixed(1)}%)`);
    console.log(`🎲 Total de caixas abertas: ${totalBoxesOpened}`);
    console.log(`🎁 Total de prêmios pagos: R$ ${totalPrizesPaid.toFixed(2)}`);
    console.log(`📊 RTP efetivo: ${((totalPrizesPaid / totalBoxRevenue) * 100).toFixed(2)}%`);

    // Mostrar top 5 usuários que mais ganharam
    const topWinners = results
      .filter(r => r.prizesWon > 0)
      .sort((a, b) => b.prizesWon - a.prizesWon)
      .slice(0, 5);

    if (topWinners.length > 0) {
      console.log('\n🏆 TOP 5 MAIORES GANHADORES:');
      console.log('============================');
      topWinners.forEach((winner, index) => {
        console.log(`${index + 1}. ${winner.user}: R$ ${winner.prizesWon.toFixed(2)} (${winner.boxesOpened} caixas)`);
      });
    }

    // Mostrar usuários que quebraram
    const brokeUsers = results.filter(r => r.isBroke);
    if (brokeUsers.length > 0) {
      console.log('\n💀 USUÁRIOS QUE QUEBRARAM:');
      console.log('==========================');
      brokeUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.user}: R$ ${user.finalBalance.toFixed(2)} (${user.boxesOpened} caixas)`);
      });
    }

    // Limpar dados de teste
    console.log('\n🧹 Limpando dados de teste...');
    await prisma.transaction.deleteMany({
      where: { 
        user_id: { in: users.map(u => u.id) }
      }
    });
    await prisma.userSession.deleteMany({
      where: { 
        user_id: { in: users.map(u => u.id) }
      }
    });
    await prisma.affiliateHistory.deleteMany({
      where: { 
        indicado_id: { in: users.map(u => u.id) }
      }
    });
    await prisma.affiliate.deleteMany({
      where: { 
        user_id: { in: users.map(u => u.id) }
      }
    });
    await prisma.user.deleteMany({
      where: { 
        id: { in: users.map(u => u.id) }
      }
    });
    console.log('✅ Dados de teste limpos');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBusinessProfitability();
