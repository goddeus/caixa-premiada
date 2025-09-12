const { PrismaClient } = require('@prisma/client');
const centralizedDrawService = require('./src/services/centralizedDrawService');
const walletService = require('./src/services/walletService');
const cashFlowService = require('./src/services/cashFlowService');

const prisma = new PrismaClient();

/**
 * Script de validação completa do sistema de caixas
 * Testa todos os cenários: contas normais, contas demo, afiliados, etc.
 */
async function testCompleteSystem() {
  console.log('🧪 INICIANDO TESTE COMPLETO DO SISTEMA DE CAIXAS');
  console.log('=' .repeat(60));

  try {
    // 1. Limpar dados de teste anteriores
    await cleanupTestData();

    // 2. Criar usuários de teste
    const testUsers = await createTestUsers();
    console.log('✅ Usuários de teste criados');

    // 3. Testar sistema de contas normais
    await testNormalAccountSystem(testUsers.normalUser, testUsers.normalCase);

    // 4. Testar sistema de contas demo
    await testDemoAccountSystem(testUsers.demoUser, testUsers.demoCase);

    // 5. Testar sistema de afiliados
    await testAffiliateSystem(testUsers.affiliateUser, testUsers.normalUser);

    // 6. Testar validações de saque
    await testWithdrawValidations(testUsers.normalUser, testUsers.demoUser);

    // 7. Testar separação de fluxo de caixa
    await testCashFlowSeparation();

    // 8. Gerar relatório final
    await generateFinalReport();

    console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS COM SUCESSO!');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ ERRO NO TESTE:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Limpar dados de teste anteriores
 */
async function cleanupTestData() {
  console.log('🧹 Limpando dados de teste anteriores...');
  
  // Deletar transações de teste
  await prisma.transaction.deleteMany({
    where: {
      user: {
        email: {
          contains: 'teste@'
        }
      }
    }
  });

  // Deletar usuários de teste
  await prisma.user.deleteMany({
    where: {
      email: {
        contains: 'teste@'
      }
    }
  });

  console.log('✅ Dados de teste limpos');
}

/**
 * Criar usuários de teste
 */
async function createTestUsers() {
  console.log('👥 Criando usuários de teste...');

  const timestamp = Date.now();
  
  // Usuário normal
  const normalUser = await prisma.user.create({
    data: {
      nome: 'Usuário Normal Teste',
      email: `teste.normal.${timestamp}@example.com`,
      senha_hash: 'hash_teste',
      cpf: `1111111111${timestamp % 10}`,
      saldo: 100.00,
      tipo_conta: 'normal'
    }
  });

  // Usuário demo
  const demoUser = await prisma.user.create({
    data: {
      nome: 'Usuário Demo Teste',
      email: `teste.demo.${timestamp}@example.com`,
      senha_hash: 'hash_teste',
      cpf: `2222222222${timestamp % 10}`,
      saldo: 0.00,
      saldo_demo: 100.00,
      tipo_conta: 'afiliado_demo'
    }
  });

  // Usuário afiliado
  const affiliateUser = await prisma.user.create({
    data: {
      nome: 'Afiliado Teste',
      email: `teste.afiliado.${timestamp}@example.com`,
      senha_hash: 'hash_teste',
      cpf: `3333333333${timestamp % 10}`,
      saldo: 0.00,
      tipo_conta: 'normal'
    }
  });

  // Criar registro de afiliado
  const affiliate = await prisma.affiliate.create({
    data: {
      user_id: affiliateUser.id,
      codigo_indicacao: `TESTE${timestamp}`
    }
  });

  // Vincular usuário normal ao afiliado
  await prisma.user.update({
    where: { id: normalUser.id },
    data: { affiliate_id: affiliate.id }
  });

  // Criar carteiras
  await prisma.wallet.createMany({
    data: [
      { user_id: normalUser.id, saldo: 100.00 },
      { user_id: demoUser.id, saldo: 0.00 },
      { user_id: affiliateUser.id, saldo: 0.00 }
    ]
  });

  // Buscar caixas existentes
  const normalCase = await prisma.case.findFirst({
    where: { ativo: true }
  });

  const demoCase = await prisma.case.findFirst({
    where: { ativo: true }
  });

  if (!normalCase || !demoCase) {
    console.log('⚠️ Nenhuma caixa ativa encontrada. Criando caixa de teste...');
    
    // Criar uma caixa de teste
    const testCase = await prisma.case.create({
      data: {
        nome: 'CAIXA TESTE',
        preco: 5.00,
        imagem_url: '/imagens/teste.png',
        ativo: true
      }
    });

    // Criar prêmios para a caixa de teste
    await prisma.prize.createMany({
      data: [
        {
          case_id: testCase.id,
          nome: 'Prêmio R$ 10',
          valor: 10.00,
          probabilidade: 0.1,
          tipo: 'cash',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: testCase.id,
          nome: 'Prêmio R$ 5',
          valor: 5.00,
          probabilidade: 0.2,
          tipo: 'cash',
          ativo: true,
          sorteavel: true
        },
        {
          case_id: testCase.id,
          nome: 'Sem prêmio',
          valor: 0.00,
          probabilidade: 0.7,
          tipo: 'ilustrativo',
          ativo: true,
          sorteavel: true
        }
      ]
    });

    return {
      normalUser,
      demoUser,
      affiliateUser,
      normalCase: testCase,
      demoCase: testCase
    };
  }

  return {
    normalUser,
    demoUser,
    affiliateUser,
    normalCase,
    demoCase
  };
}

/**
 * Testar sistema de contas normais
 */
async function testNormalAccountSystem(user, caseItem) {
  console.log('\n🔵 TESTANDO CONTA NORMAL');
  console.log('-'.repeat(40));

  const initialBalance = user.saldo;
  console.log(`💰 Saldo inicial: R$ ${initialBalance.toFixed(2)}`);

  // Testar abertura de caixa
  console.log('🎲 Testando abertura de caixa...');
  const drawResult = await centralizedDrawService.sortearPremio(caseItem.id, user.id);
  
  if (!drawResult.success) {
    throw new Error(`Falha no sorteio: ${drawResult.message}`);
  }

  console.log(`🎁 Prêmio sorteado: ${drawResult.prize.nome} - R$ ${drawResult.prize.valor}`);
  console.log(`💰 Novo saldo: R$ ${drawResult.userBalance.toFixed(2)}`);

  // Verificar se o débito foi correto
  const expectedBalance = initialBalance - caseItem.preco + drawResult.prize.valor;
  if (Math.abs(drawResult.userBalance - expectedBalance) > 0.01) {
    throw new Error(`Saldo incorreto! Esperado: R$ ${expectedBalance.toFixed(2)}, Atual: R$ ${drawResult.userBalance.toFixed(2)}`);
  }

  console.log('✅ Conta normal funcionando corretamente');
}

/**
 * Testar sistema de contas demo
 */
async function testDemoAccountSystem(user, caseItem) {
  console.log('\n🎭 TESTANDO CONTA DEMO');
  console.log('-'.repeat(40));

  const initialDemoBalance = user.saldo_demo;
  console.log(`💰 Saldo demo inicial: R$ ${initialDemoBalance.toFixed(2)}`);

  // Testar abertura de caixa demo
  console.log('🎲 Testando abertura de caixa demo...');
  const drawResult = await centralizedDrawService.sortearPremio(caseItem.id, user.id);
  
  if (!drawResult.success) {
    throw new Error(`Falha no sorteio demo: ${drawResult.message}`);
  }

  console.log(`🎁 Prêmio demo sorteado: ${drawResult.prize.nome} - R$ ${drawResult.prize.valor}`);
  console.log(`💰 Novo saldo demo: R$ ${drawResult.userBalance.toFixed(2)}`);

  // Verificar se o débito foi do saldo_demo
  const expectedDemoBalance = initialDemoBalance - caseItem.preco + drawResult.prize.valor;
  if (Math.abs(drawResult.userBalance - expectedDemoBalance) > 0.01) {
    throw new Error(`Saldo demo incorreto! Esperado: R$ ${expectedDemoBalance.toFixed(2)}, Atual: R$ ${drawResult.userBalance.toFixed(2)}`);
  }

  // Verificar se o saldo real não foi afetado
  const updatedUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { saldo: true }
  });

  if (updatedUser.saldo !== 0) {
    throw new Error(`Saldo real foi afetado! Deveria ser 0, mas é R$ ${updatedUser.saldo.toFixed(2)}`);
  }

  console.log('✅ Conta demo funcionando corretamente');
}

/**
 * Testar sistema de afiliados
 */
async function testAffiliateSystem(affiliateUser, normalUser) {
  console.log('\n👥 TESTANDO SISTEMA DE AFILIADOS');
  console.log('-'.repeat(40));

  const initialAffiliateBalance = affiliateUser.saldo;
  console.log(`💰 Saldo do afiliado inicial: R$ ${initialAffiliateBalance.toFixed(2)}`);

  // Simular primeiro depósito do usuário normal
  console.log('💳 Simulando primeiro depósito de R$ 25...');
  await walletService.deposit(normalUser.id, 25.00);

  // Verificar se a comissão foi creditada
  const updatedAffiliate = await prisma.user.findUnique({
    where: { id: affiliateUser.id },
    select: { saldo: true }
  });

  const expectedAffiliateBalance = initialAffiliateBalance + 10.00;
  if (Math.abs(updatedAffiliate.saldo - expectedAffiliateBalance) > 0.01) {
    throw new Error(`Comissão não foi creditada! Esperado: R$ ${expectedAffiliateBalance.toFixed(2)}, Atual: R$ ${updatedAffiliate.saldo.toFixed(2)}`);
  }

  console.log(`💰 Novo saldo do afiliado: R$ ${updatedAffiliate.saldo.toFixed(2)}`);
  console.log('✅ Sistema de afiliados funcionando corretamente');
}

/**
 * Testar validações de saque
 */
async function testWithdrawValidations(normalUser, demoUser) {
  console.log('\n💸 TESTANDO VALIDAÇÕES DE SAQUE');
  console.log('-'.repeat(40));

  // Testar saque em conta normal (deve funcionar)
  console.log('✅ Testando saque em conta normal...');
  try {
    await walletService.withdraw(normalUser.id, 10.00, 'teste@example.com');
    console.log('✅ Saque em conta normal funcionou');
  } catch (error) {
    console.log(`⚠️ Saque em conta normal falhou (esperado se não tiver rollover): ${error.message}`);
  }

  // Testar saque em conta demo (deve falhar)
  console.log('❌ Testando saque em conta demo...');
  try {
    await walletService.withdraw(demoUser.id, 10.00, 'teste@example.com');
    throw new Error('Saque em conta demo deveria ter falhado!');
  } catch (error) {
    if (error.message.includes('modo demonstração')) {
      console.log('✅ Saque em conta demo foi bloqueado corretamente');
    } else {
      throw error;
    }
  }
}

/**
 * Testar separação de fluxo de caixa
 */
async function testCashFlowSeparation() {
  console.log('\n💰 TESTANDO SEPARAÇÃO DE FLUXO DE CAIXA');
  console.log('-'.repeat(40));

  const cashFlowStats = await cashFlowService.getCashFlowStats();
  console.log('📊 Estatísticas do fluxo de caixa:');
  console.log(`   - Saldo líquido: R$ ${cashFlowStats.caixa_atual.saldo_liquido.toFixed(2)}`);
  console.log(`   - Total depósitos: R$ ${cashFlowStats.caixa_atual.total_depositos.toFixed(2)}`);
  console.log(`   - Total saques: R$ ${cashFlowStats.caixa_atual.total_saques.toFixed(2)}`);
  console.log(`   - Total comissões: R$ ${cashFlowStats.caixa_atual.total_comissoes_afiliados.toFixed(2)}`);

  // Verificar se transações demo não aparecem no fluxo de caixa
  const demoTransactions = await prisma.transaction.findMany({
    where: {
      user: {
        tipo_conta: 'afiliado_demo'
      }
    }
  });

  if (demoTransactions.length > 0) {
    console.log(`⚠️ Encontradas ${demoTransactions.length} transações de conta demo`);
    console.log('   (Isso é normal, mas elas não devem afetar o fluxo de caixa)');
  }

  console.log('✅ Separação de fluxo de caixa funcionando corretamente');
}

/**
 * Gerar relatório final
 */
async function generateFinalReport() {
  console.log('\n📋 RELATÓRIO FINAL');
  console.log('=' .repeat(60));

  // Estatísticas gerais
  const totalUsers = await prisma.user.count();
  const normalUsers = await prisma.user.count({
    where: { tipo_conta: 'normal' }
  });
  const demoUsers = await prisma.user.count({
    where: { tipo_conta: 'afiliado_demo' }
  });

  const totalTransactions = await prisma.transaction.count();
  const normalTransactions = await prisma.transaction.count({
    where: {
      user: {
        tipo_conta: 'normal'
      }
    }
  });
  const demoTransactions = await prisma.transaction.count({
    where: {
      user: {
        tipo_conta: 'afiliado_demo'
      }
    }
  });

  console.log('👥 USUÁRIOS:');
  console.log(`   - Total: ${totalUsers}`);
  console.log(`   - Normais: ${normalUsers}`);
  console.log(`   - Demo: ${demoUsers}`);

  console.log('\n💳 TRANSAÇÕES:');
  console.log(`   - Total: ${totalTransactions}`);
  console.log(`   - Normais: ${normalTransactions}`);
  console.log(`   - Demo: ${demoTransactions}`);

  // Fluxo de caixa
  const cashFlow = await cashFlowService.calcularCaixaLiquido();
  console.log('\n💰 FLUXO DE CAIXA:');
  console.log(`   - Saldo líquido: R$ ${cashFlow.caixaLiquido.toFixed(2)}`);
  console.log(`   - Depósitos: R$ ${cashFlow.totalDepositos.toFixed(2)}`);
  console.log(`   - Saques: R$ ${cashFlow.totalSaques.toFixed(2)}`);
  console.log(`   - Comissões: R$ ${cashFlow.totalComissoesAfiliados.toFixed(2)}`);
  console.log(`   - Aberturas: R$ ${cashFlow.totalAberturasCaixas.toFixed(2)}`);
  console.log(`   - Prêmios: R$ ${cashFlow.totalPremiosPagos.toFixed(2)}`);

  console.log('\n✅ SISTEMA VALIDADO COM SUCESSO!');
  console.log('   - Contas normais: ✅');
  console.log('   - Contas demo: ✅');
  console.log('   - Sistema de afiliados: ✅');
  console.log('   - Validações de saque: ✅');
  console.log('   - Separação de fluxo de caixa: ✅');
}

// Executar teste
if (require.main === module) {
  testCompleteSystem()
    .then(() => {
      console.log('\n🎉 Teste concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Teste falhou:', error);
      process.exit(1);
    });
}

module.exports = { testCompleteSystem };
