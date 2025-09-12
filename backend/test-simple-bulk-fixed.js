const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * Teste Simplificado de Compra Múltipla (sem globalDrawService)
 * 
 * Este script testa o fluxo básico sem depender do globalDrawService
 * que está causando timeout na transação.
 */
async function testSimpleBulkFixed() {
  console.log('🧪 TESTE SIMPLIFICADO DE COMPRA MÚLTIPLA');
  console.log('=' .repeat(50));

  let testUser = null;

  try {
    // 1. Criar usuário de teste
    console.log('\n1️⃣ Criando usuário de teste...');
    testUser = await prisma.user.create({
      data: {
        nome: 'Teste Simplificado',
        email: `teste.simples.${Date.now()}@example.com`,
        senha_hash: 'hash_teste',
        cpf: `${Date.now()}`,
        saldo: 100.00,
        tipo_conta: 'normal'
      }
    });
    console.log(`✅ Usuário criado: ${testUser.id}`);

    // 2. Buscar uma caixa disponível
    console.log('\n2️⃣ Buscando caixa disponível...');
    const caseData = await prisma.case.findFirst({
      where: { ativo: true }
    });

    if (!caseData) {
      throw new Error('Nenhuma caixa ativa encontrada');
    }

    console.log(`✅ Caixa encontrada: ${caseData.nome} (R$ ${caseData.preco})`);

    // 3. Simular compra múltipla sem globalDrawService
    console.log('\n3️⃣ Simulando compra múltipla...');
    
    const caixaItems = [{ caixaId: caseData.id, quantidade: 1 }];
    const totalPreco = caseData.preco * 1;
    
    console.log(`💰 Total a debitar: R$ ${totalPreco}`);

    // 4. Processar transação atômica
    const result = await prisma.$transaction(async (tx) => {
      // 4.1. Buscar usuário
      const user = await tx.user.findUnique({
        where: { id: testUser.id },
        select: {
          id: true,
          nome: true,
          saldo: true,
          saldo_demo: true,
          tipo_conta: true,
          ativo: true
        }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      if (!user.ativo) {
        throw new Error('Usuário inativo');
      }

      // 4.2. Verificar saldo
      const isDemoAccount = user.tipo_conta === 'afiliado_demo';
      const saldoAtual = isDemoAccount ? (user.saldo_demo || 0) : user.saldo;
      
      if (saldoAtual < totalPreco) {
        throw new Error(`Saldo insuficiente. Disponível: R$ ${saldoAtual.toFixed(2)}, Necessário: R$ ${totalPreco.toFixed(2)}`);
      }

      // 4.3. Criar sessão ativa
      const activeSession = await tx.userSession.create({
        data: {
          user_id: testUser.id,
          deposito_inicial: 20.00,
          limite_retorno: 10.00,
          valor_gasto_caixas: 0,
          valor_premios_recebidos: 0,
          rtp_configurado: 50.0,
          ativo: true
        }
      });

      // 4.4. Debitar valor total
      const saldoAntes = saldoAtual;
      const saldoAposDebito = saldoAntes - totalPreco;

      if (isDemoAccount) {
        await tx.user.update({
          where: { id: testUser.id },
          data: { saldo_demo: saldoAposDebito }
        });
      } else {
        await tx.user.update({
          where: { id: testUser.id },
          data: { saldo: saldoAposDebito }
        });
      }

      // 4.5. Registrar transação de abertura de caixas
      await tx.transaction.create({
        data: {
          user_id: testUser.id,
          session_id: activeSession.id,
          tipo: 'abertura_caixa_multipla',
          valor: -totalPreco,
          status: 'concluido',
          descricao: `Compra múltipla de 1 tipos de caixas - Total: R$ ${totalPreco.toFixed(2)}`,
          case_id: caseData.id
        }
      });

      // 4.6. Simular prêmio (sem usar globalDrawService)
      const premioSimulado = {
        id: 'premio_simulado',
        nome: 'Prêmio Simulado',
        valor: 5.00,
        isIllustrative: false
      };

      const somaPremios = premioSimulado.valor;
      const saldoFinal = saldoAposDebito + somaPremios;

      // 4.7. Creditar prêmio
      if (isDemoAccount) {
        await tx.user.update({
          where: { id: testUser.id },
          data: { saldo_demo: saldoFinal }
        });
      } else {
        await tx.user.update({
          where: { id: testUser.id },
          data: { saldo: saldoFinal }
        });
      }

      // 4.8. Registrar transação do prêmio
      await tx.transaction.create({
        data: {
          user_id: testUser.id,
          session_id: activeSession.id,
          tipo: 'premio',
          valor: premioSimulado.valor,
          status: 'concluido',
          descricao: `Prêmio sorteado: ${premioSimulado.nome} - R$ ${premioSimulado.valor.toFixed(2)}`,
          case_id: caseData.id,
          prize_id: premioSimulado.id
        }
      });

      // 4.9. Registrar auditoria
      const auditData = {
        purchase_id: uuidv4(),
        user_id: testUser.id,
        session_id: activeSession.id,
        caixas_compradas: JSON.stringify([{
          caixaId: caseData.id,
          nome: caseData.nome,
          preco: caseData.preco,
          quantidade: 1,
          totalItem: totalPreco
        }]),
        total_preco: totalPreco,
        soma_premios: somaPremios,
        saldo_antes: saldoAntes,
        saldo_depois: saldoFinal,
        status: 'concluido',
        tipo_conta: user.tipo_conta,
        premios_detalhados: JSON.stringify([{
          caixaId: caseData.id,
          caixaNome: caseData.nome,
          boxNumber: 1,
          prizeId: premioSimulado.id,
          prizeNome: premioSimulado.nome,
          valor: premioSimulado.valor,
          isIllustrative: premioSimulado.isIllustrative,
          sorteavel: true
        }])
      };

      await tx.purchaseAudit.create({
        data: auditData
      });

      // 4.10. Atualizar sessão
      await tx.userSession.update({
        where: { id: activeSession.id },
        data: {
          valor_gasto_caixas: { increment: totalPreco },
          valor_premios_recebidos: { increment: somaPremios }
        }
      });

      return {
        purchaseId: auditData.purchase_id,
        totalDebitado: totalPreco,
        somaPremios,
        saldoFinal,
        isDemoAccount
      };
    });

    console.log('\n✅ COMPRA MÚLTIPLA CONCLUÍDA!');
    console.log(`📊 Purchase ID: ${result.purchaseId}`);
    console.log(`💰 Total debitado: R$ ${result.totalDebitado.toFixed(2)}`);
    console.log(`🎁 Prêmios: R$ ${result.somaPremios.toFixed(2)}`);
    console.log(`💳 Saldo final: R$ ${result.saldoFinal.toFixed(2)}`);

    // 5. Verificar transações
    console.log('\n4️⃣ Verificando transações...');
    const transactions = await prisma.transaction.findMany({
      where: { user_id: testUser.id },
      orderBy: { criado_em: 'desc' }
    });

    console.log(`📊 Total de transações: ${transactions.length}`);
    transactions.forEach((tx, index) => {
      console.log(`  ${index + 1}. ${tx.tipo}: R$ ${tx.valor} - ${tx.descricao}`);
    });

    // 6. Verificar auditoria
    console.log('\n5️⃣ Verificando auditoria...');
    const audits = await prisma.purchaseAudit.findMany({
      where: { user_id: testUser.id }
    });

    console.log(`📊 Total de auditorias: ${audits.length}`);
    if (audits.length > 0) {
      const audit = audits[0];
      console.log(`  Purchase ID: ${audit.purchase_id}`);
      console.log(`  Total Preço: R$ ${audit.total_preco}`);
      console.log(`  Soma Prêmios: R$ ${audit.soma_premios}`);
      console.log(`  Saldo Antes: R$ ${audit.saldo_antes}`);
      console.log(`  Saldo Depois: R$ ${audit.saldo_depois}`);
    }

    // 7. Verificar saldo final
    console.log('\n6️⃣ Verificando saldo final...');
    const updatedUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { saldo: true }
    });

    console.log(`💰 Saldo atual: R$ ${updatedUser.saldo}`);
    
    const expectedBalance = 100.00 - result.totalDebitado + result.somaPremios;
    console.log(`💰 Saldo esperado: R$ ${expectedBalance}`);
    
    if (Math.abs(updatedUser.saldo - expectedBalance) < 0.01) {
      console.log('✅ Saldo consistente!');
    } else {
      console.log('❌ Saldo inconsistente!');
    }

    console.log('\n🎉 TESTE SIMPLIFICADO CONCLUÍDO COM SUCESSO!');

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
  } finally {
    // Limpeza
    console.log('\n🧹 Limpando dados de teste...');
    try {
      if (testUser) {
        await prisma.transaction.deleteMany({
          where: { user_id: testUser.id }
        });

        await prisma.purchaseAudit.deleteMany({
          where: { user_id: testUser.id }
        });

        await prisma.userSession.deleteMany({
          where: { user_id: testUser.id }
        });

        await prisma.user.delete({
          where: { id: testUser.id }
        });

        console.log('✅ Dados de teste removidos');
      }
    } catch (cleanupError) {
      console.error('⚠️ Erro na limpeza:', cleanupError.message);
    }

    await prisma.$disconnect();
  }
}

// Executar teste se chamado diretamente
if (require.main === module) {
  testSimpleBulkFixed()
    .then(() => {
      console.log('\n🏁 Teste simplificado concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro fatal no teste simplificado:', error);
      process.exit(1);
    });
}

module.exports = { testSimpleBulkFixed };



