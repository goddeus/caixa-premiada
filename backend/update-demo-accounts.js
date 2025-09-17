const { PrismaClient } = require('@prisma/client');

/**
 * SCRIPT PARA ATUALIZAR CONTAS DEMO
 * 
 * Este script atualiza contas existentes para o tipo 'afiliado_demo'
 * para que recebam RTP mais alto.
 */

const prisma = new PrismaClient();

async function updateDemoAccounts() {
  try {
    console.log('🎯 Atualizando contas para tipo demo...\n');
    
    // 1. Listar contas existentes
    console.log('1. 📋 Listando contas existentes...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_conta: true,
        saldo_reais: true,
        saldo_demo: true
      }
    });
    
    console.log(`✅ ${users.length} contas encontradas\n`);
    
    // 2. Mostrar contas por tipo
    const normalAccounts = users.filter(u => u.tipo_conta === 'normal');
    const demoAccounts = users.filter(u => u.tipo_conta === 'afiliado_demo');
    const adminAccounts = users.filter(u => u.tipo_conta === 'admin');
    
    console.log('📊 DISTRIBUIÇÃO ATUAL:');
    console.log(`   - Contas normais: ${normalAccounts.length}`);
    console.log(`   - Contas demo: ${demoAccounts.length}`);
    console.log(`   - Contas admin: ${adminAccounts.length}\n`);
    
    // 3. Mostrar contas normais
    if (normalAccounts.length > 0) {
      console.log('👤 CONTAS NORMAIS:');
      normalAccounts.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.nome} (${user.email}) - Saldo: R$ ${user.saldo_reais || 0}`);
      });
      console.log('');
    }
    
    // 4. Mostrar contas demo
    if (demoAccounts.length > 0) {
      console.log('🎯 CONTAS DEMO:');
      demoAccounts.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.nome} (${user.email}) - Saldo Demo: R$ ${user.saldo_demo || 0}`);
      });
      console.log('');
    }
    
    // 5. Perguntar quais contas converter para demo
    console.log('🔄 OPÇÕES DE CONVERSÃO:');
    console.log('   1. Converter TODAS as contas normais para demo');
    console.log('   2. Converter contas específicas');
    console.log('   3. Criar novas contas demo');
    console.log('   4. Apenas mostrar estatísticas');
    console.log('');
    
    // Para este script, vamos converter todas as contas normais para demo
    // (em produção, você pode modificar esta lógica)
    const convertAll = true; // Mudar para false se não quiser converter automaticamente
    
    if (convertAll && normalAccounts.length > 0) {
      console.log('🔄 Convertendo TODAS as contas normais para demo...');
      
      for (const user of normalAccounts) {
        try {
          // Converter conta normal para demo
          await prisma.user.update({
            where: { id: user.id },
            data: {
              tipo_conta: 'afiliado_demo',
              // Transferir saldo real para saldo demo
              saldo_demo: (user.saldo_reais || 0) + (user.saldo_demo || 0),
              saldo_reais: 0
            }
          });
          
          console.log(`   ✅ ${user.nome} convertida para demo`);
          console.log(`      Saldo transferido: R$ ${user.saldo_reais || 0} → Demo`);
          
        } catch (error) {
          console.log(`   ❌ Erro ao converter ${user.nome}:`, error.message);
        }
      }
      
      console.log('\n✅ Conversão concluída!');
    }
    
    // 6. Criar contas demo de exemplo
    console.log('\n6. 👤 Criando contas demo de exemplo...');
    
    const demoAccountsToCreate = [
      {
        nome: 'Afiliado Demo 1',
        email: 'demo1@afiliado.com',
        senha_hash: 'demo123',
        cpf: '11111111111',
        tipo_conta: 'afiliado_demo',
        saldo_demo: 100.00,
        saldo_reais: 0
      },
      {
        nome: 'Afiliado Demo 2',
        email: 'demo2@afiliado.com',
        senha_hash: 'demo123',
        cpf: '22222222222',
        tipo_conta: 'afiliado_demo',
        saldo_demo: 200.00,
        saldo_reais: 0
      },
      {
        nome: 'Afiliado Demo 3',
        email: 'demo3@afiliado.com',
        senha_hash: 'demo123',
        cpf: '33333333333',
        tipo_conta: 'afiliado_demo',
        saldo_demo: 500.00,
        saldo_reais: 0
      }
    ];
    
    for (const demoAccount of demoAccountsToCreate) {
      try {
        // Verificar se já existe
        const existing = await prisma.user.findFirst({
          where: {
            OR: [
              { email: demoAccount.email },
              { cpf: demoAccount.cpf }
            ]
          }
        });
        
        if (existing) {
          console.log(`   ⚠️ Conta ${demoAccount.nome} já existe`);
          continue;
        }
        
        // Criar conta demo
        const newDemoAccount = await prisma.user.create({
          data: demoAccount
        });
        
        console.log(`   ✅ ${demoAccount.nome} criada com sucesso`);
        console.log(`      Email: ${demoAccount.email}`);
        console.log(`      Saldo Demo: R$ ${demoAccount.saldo_demo}`);
        
      } catch (error) {
        console.log(`   ❌ Erro ao criar ${demoAccount.nome}:`, error.message);
      }
    }
    
    // 7. Estatísticas finais
    console.log('\n7. 📊 ESTATÍSTICAS FINAIS:');
    
    const finalUsers = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_conta: true,
        saldo_reais: true,
        saldo_demo: true
      }
    });
    
    const finalNormalAccounts = finalUsers.filter(u => u.tipo_conta === 'normal');
    const finalDemoAccounts = finalUsers.filter(u => u.tipo_conta === 'afiliado_demo');
    const finalAdminAccounts = finalUsers.filter(u => u.tipo_conta === 'admin');
    
    console.log(`   - Contas normais: ${finalNormalAccounts.length}`);
    console.log(`   - Contas demo: ${finalDemoAccounts.length}`);
    console.log(`   - Contas admin: ${finalAdminAccounts.length}`);
    
    const totalDemoBalance = finalDemoAccounts.reduce((sum, u) => sum + (u.saldo_demo || 0), 0);
    const totalNormalBalance = finalNormalAccounts.reduce((sum, u) => sum + (u.saldo_reais || 0), 0);
    
    console.log(`   - Saldo total demo: R$ ${totalDemoBalance.toFixed(2)}`);
    console.log(`   - Saldo total normal: R$ ${totalNormalBalance.toFixed(2)}`);
    
    console.log('\n✅ SCRIPT CONCLUÍDO!');
    console.log('💡 As contas demo agora receberão RTP mais alto (70-95%)');
    console.log('💡 As contas normais continuarão com RTP baixo (5-80%)');
    
  } catch (error) {
    console.error('❌ Erro no script:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar script
updateDemoAccounts();
