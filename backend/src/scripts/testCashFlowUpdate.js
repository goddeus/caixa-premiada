const { PrismaClient } = require('@prisma/client');
const cashFlowService = require('../services/cashFlowService');

const prisma = new PrismaClient();

async function testCashFlowUpdate() {
  console.log('🧪 TESTE DE ATUALIZAÇÃO DO CAIXA');
  console.log('================================');
  
  try {
    // 1. Verificar caixa inicial
    console.log('\n📊 CAIXA INICIAL:');
    const caixaInicial = await cashFlowService.calcularCaixaLiquido();
    console.log(`💰 Caixa líquido: R$ ${caixaInicial.caixaLiquido.toFixed(2)}`);
    
    // 2. Criar usuário de teste
    console.log('\n👤 CRIANDO USUÁRIO DE TESTE:');
    const testUser = await prisma.user.create({
      data: {
        nome: 'Teste Caixa Flow',
        email: `teste.caixa.${Date.now()}@teste.com`,
        senha_hash: 'hash_teste',
        cpf: `${Date.now()}`,
        saldo_reais: 50,
        saldo_demo: 0
      }
    });
    
    // Criar carteira
    await prisma.wallet.create({
      data: {
        user_id: testUser.id,
        saldo_reais: 50,
        saldo_demo: 0
      }
    });
    
    console.log(`✅ Usuário criado: ${testUser.nome} (Saldo: R$ ${testUser.saldo})`);
    
    // 3. Simular abertura de caixa (R$ 20,00)
    console.log('\n🎲 SIMULANDO ABERTURA DE CAIXA (R$ 20,00):');
    
    // Simular abertura de caixa
    await cashFlowService.logCashFlowChange({
      tipo: 'abertura_caixa',
      valor: -20, // Negativo porque é gasto
      user_id: testUser.id,
      transaction_id: 'teste_abertura_caixa',
      descricao: 'Abertura de caixa teste - R$ 20,00'
    });
    
    // 4. Simular prêmio pago (R$ 5,00)
    console.log('\n🎁 SIMULANDO PRÊMIO PAGO (R$ 5,00):');
    
    await cashFlowService.logCashFlowChange({
      tipo: 'premio',
      valor: -5, // Negativo porque é saída do caixa
      user_id: testUser.id,
      transaction_id: 'teste_premio',
      descricao: 'Prêmio pago teste - R$ 5,00'
    });
    
    // 5. Verificar caixa final
    console.log('\n📊 CAIXA FINAL:');
    const caixaFinal = await cashFlowService.calcularCaixaLiquido();
    console.log(`💰 Caixa líquido: R$ ${caixaFinal.caixaLiquido.toFixed(2)}`);
    
    // 6. Calcular diferença esperada
    const diferencaEsperada = -20 - 5; // -25 (gasto total)
    const diferencaReal = caixaFinal.caixaLiquido - caixaInicial.caixaLiquido;
    
    console.log('\n📈 ANÁLISE:');
    console.log(`📉 Diferença esperada: R$ ${diferencaEsperada.toFixed(2)}`);
    console.log(`📊 Diferença real: R$ ${diferencaReal.toFixed(2)}`);
    
    if (Math.abs(diferencaReal - diferencaEsperada) < 0.01) {
      console.log('✅ SUCESSO: Caixa atualizado corretamente!');
    } else {
      console.log('❌ ERRO: Caixa não foi atualizado corretamente!');
    }
    
    // 7. Verificar transações registradas
    console.log('\n📋 TRANSAÇÕES REGISTRADAS:');
    const transacoes = await prisma.transaction.findMany({
      where: {
        user_id: testUser.id,
        tipo: {
          in: ['abertura_caixa', 'premio']
        }
      },
      orderBy: { criado_em: 'desc' }
    });
    
    transacoes.forEach(tx => {
      console.log(`- ${tx.tipo}: R$ ${tx.valor.toFixed(2)} - ${tx.descricao}`);
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    // Limpar dados de teste
    console.log('\n🧹 LIMPANDO DADOS DE TESTE...');
    await prisma.transaction.deleteMany({
      where: {
        user_id: {
          in: await prisma.user.findMany({
            where: { nome: 'Teste Caixa Flow' },
            select: { id: true }
          }).then(users => users.map(u => u.id))
        }
      }
    });
    
    await prisma.wallet.deleteMany({
      where: {
        user_id: {
          in: await prisma.user.findMany({
            where: { nome: 'Teste Caixa Flow' },
            select: { id: true }
          }).then(users => users.map(u => u.id))
        }
      }
    });
    
    await prisma.user.deleteMany({
      where: { nome: 'Teste Caixa Flow' }
    });
    
    console.log('✅ Dados de teste limpos');
    await prisma.$disconnect();
  }
}

testCashFlowUpdate();
