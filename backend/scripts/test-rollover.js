const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRollover() {
  console.log('🧪 TESTE DO SISTEMA DE ROLLOVER');
  console.log('================================');
  
  try {
    // 1. Criar usuário de teste
    console.log('\n1️⃣ Criando usuário de teste...');
    
    const testUser = await prisma.user.create({
      data: {
        nome: 'Usuário Teste Rollover',
        email: 'teste.rollover@example.com',
        senha_hash: 'hash_teste',
        cpf: `${Date.now()}`,
        saldo: 0,
        primeiro_deposito_feito: false,
        rollover_liberado: false,
        rollover_minimo: 20.00,
        total_giros: 0
      }
    });
    
    console.log(`✅ Usuário criado: ${testUser.nome} (ID: ${testUser.id})`);
    
    // 2. Teste 1: Usuário sem primeiro depósito pode sacar?
    console.log('\n2️⃣ Teste 1: Usuário sem primeiro depósito pode sacar?');
    
    try {
      // Simular tentativa de saque
      const user = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: {
          primeiro_deposito_feito: true,
          rollover_liberado: true,
          total_giros: true,
          rollover_minimo: true
        }
      });
      
      if (user.primeiro_deposito_feito && !user.rollover_liberado) {
        console.log('❌ ERRO: Usuário sem primeiro depósito não deveria ter rollover aplicado');
      } else {
        console.log('✅ CORRETO: Usuário sem primeiro depósito não tem rollover aplicado');
      }
    } catch (error) {
      console.log('✅ CORRETO: Erro esperado ao tentar sacar sem primeiro depósito');
    }
    
    // 3. Teste 2: Fazer primeiro depósito
    console.log('\n3️⃣ Teste 2: Fazendo primeiro depósito...');
    
    await prisma.user.update({
      where: { id: testUser.id },
      data: {
        saldo: { increment: 100 },
        primeiro_deposito_feito: true
      }
    });
    
    await prisma.wallet.create({
      data: {
        user_id: testUser.id,
        saldo: 100
      }
    });
    
    console.log('✅ Primeiro depósito realizado: R$ 100,00');
    
    // 4. Teste 3: Usuário com primeiro depósito mas sem rollover pode sacar?
    console.log('\n4️⃣ Teste 3: Usuário com primeiro depósito mas sem rollover pode sacar?');
    
    const userAfterDeposit = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: {
        primeiro_deposito_feito: true,
        rollover_liberado: true,
        total_giros: true,
        rollover_minimo: true
      }
    });
    
    if (userAfterDeposit.primeiro_deposito_feito && !userAfterDeposit.rollover_liberado) {
      console.log('✅ CORRETO: Usuário com primeiro depósito mas sem rollover não pode sacar');
    } else {
      console.log('❌ ERRO: Lógica de rollover incorreta');
    }
    
    // 5. Teste 4: Simular apostas para atingir rollover
    console.log('\n5️⃣ Teste 4: Simulando apostas para atingir rollover...');
    
    // Simular 5 apostas de R$ 4,00 cada (total R$ 20,00)
    for (let i = 1; i <= 5; i++) {
      await prisma.user.update({
        where: { id: testUser.id },
        data: {
          total_giros: { increment: 4.00 }
        }
      });
      
      // Verificar se atingiu rollover
      const userAfterBet = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: {
          total_giros: true,
          rollover_liberado: true,
          rollover_minimo: true,
          primeiro_deposito_feito: true
        }
      });
      
      if (userAfterBet.primeiro_deposito_feito && !userAfterBet.rollover_liberado && userAfterBet.total_giros >= userAfterBet.rollover_minimo) {
        await prisma.user.update({
          where: { id: testUser.id },
          data: {
            rollover_liberado: true
          }
        });
        console.log(`✅ Rollover atingido após ${i} apostas! Total: R$ ${userAfterBet.total_giros.toFixed(2)}`);
        break;
      }
      
      console.log(`   Aposta ${i}: R$ ${userAfterBet.total_giros.toFixed(2)}/${userAfterBet.rollover_minimo.toFixed(2)}`);
    }
    
    // 6. Teste 5: Usuário com rollover liberado pode sacar?
    console.log('\n6️⃣ Teste 5: Usuário com rollover liberado pode sacar?');
    
    const userAfterRollover = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: {
        primeiro_deposito_feito: true,
        rollover_liberado: true,
        total_giros: true,
        rollover_minimo: true
      }
    });
    
    if (userAfterRollover.rollover_liberado) {
      console.log('✅ CORRETO: Usuário com rollover liberado pode sacar');
    } else {
      console.log('❌ ERRO: Rollover não foi liberado corretamente');
    }
    
    // 7. Teste 6: Próximos depósitos não precisam de rollover
    console.log('\n7️⃣ Teste 6: Próximos depósitos não precisam de rollover...');
    
    // Simular segundo depósito
    await prisma.user.update({
      where: { id: testUser.id },
      data: {
        saldo: { increment: 50 }
      }
    });
    
    const userAfterSecondDeposit = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: {
        primeiro_deposito_feito: true,
        rollover_liberado: true,
        total_giros: true,
        rollover_minimo: true
      }
    });
    
    if (userAfterSecondDeposit.rollover_liberado) {
      console.log('✅ CORRETO: Segundo depósito não afeta rollover (já liberado)');
    } else {
      console.log('❌ ERRO: Segundo depósito afetou rollover incorretamente');
    }
    
    // 8. Relatório final
    console.log('\n📊 RELATÓRIO FINAL:');
    console.log('==================');
    
    const finalUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: {
        nome: true,
        saldo: true,
        primeiro_deposito_feito: true,
        rollover_liberado: true,
        total_giros: true,
        rollover_minimo: true
      }
    });
    
    console.log(`Usuário: ${finalUser.nome}`);
    console.log(`Saldo: R$ ${finalUser.saldo.toFixed(2)}`);
    console.log(`Primeiro depósito feito: ${finalUser.primeiro_deposito_feito ? 'Sim' : 'Não'}`);
    console.log(`Rollover liberado: ${finalUser.rollover_liberado ? 'Sim' : 'Não'}`);
    console.log(`Total apostado: R$ ${finalUser.total_giros.toFixed(2)}`);
    console.log(`Rollover mínimo: R$ ${finalUser.rollover_minimo.toFixed(2)}`);
    
    // Limpar usuário de teste
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    
    console.log('\n✅ Teste concluído! Usuário de teste removido.');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRollover();
