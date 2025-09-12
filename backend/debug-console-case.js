const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function debugConsoleCase() {
  console.log('🔍 DEBUG CONSOLE CASE - ANÁLISE COMPLETA');
  console.log('==================================================');
  
  try {
    // 1. Verificar se o servidor está rodando
    console.log('🔍 VERIFICANDO SERVIDOR...');
    try {
      await axios.get('http://localhost:3001/health');
      console.log('✅ Servidor está rodando');
    } catch (error) {
      console.log('❌ Servidor não está rodando');
      return;
    }

    // 2. Buscar caixa Console
    console.log('\n📦 CAIXA CONSOLE:');
    const consoleCase = await prisma.case.findFirst({
      where: { nome: { contains: 'CONSOLE' } }
    });
    
    if (!consoleCase) {
      console.log('❌ Caixa Console não encontrada');
      return;
    }
    
    console.log(`   Nome: ${consoleCase.nome}`);
    console.log(`   Preço: R$ ${consoleCase.preco}`);
    console.log(`   ID: ${consoleCase.id}`);

    // 3. Buscar usuário de teste
    console.log('\n👥 USUÁRIOS DISPONÍVEIS:');
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        nome: true,
        email: true,
        saldo: true,
        tipo_conta: true
      }
    });
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nome} (${user.email})`);
      console.log(`   Saldo: R$ ${user.saldo}`);
      console.log(`   Tipo: ${user.tipo_conta}`);
      console.log(`   ID: ${user.id}`);
    });

    // 4. Testar com primeiro usuário
    const testUser = users[0];
    console.log(`\n🧪 TESTANDO COM USUÁRIO: ${testUser.nome}`);
    console.log(`   Saldo antes: R$ ${testUser.saldo}`);
    
    // 5. Fazer compra da caixa Console
    console.log('\n🛒 COMPRANDO CAIXA CONSOLE...');
    try {
      const response = await axios.post(`http://localhost:3001/cases/buy/${consoleCase.id}`, {}, {
        headers: {
          'Authorization': `Bearer ${testUser.id}` // Usando ID como token para teste
        }
      });
      
      console.log('📦 RESPOSTA DA API:');
      console.log('   Success:', response.data.success);
      console.log('   Message:', response.data.message);
      console.log('   WonPrize:', response.data.wonPrize?.nome || 'Nenhum');
      console.log('   Prize Value:', response.data.wonPrize?.valor || 0);
      console.log('   UserBalance:', response.data.userBalance);
      
      // 6. Verificar saldo após compra
      const updatedUser = await prisma.user.findUnique({
        where: { id: testUser.id },
        select: { saldo: true }
      });
      
      console.log('\n💰 ANÁLISE DO DÉBITO:');
      console.log(`   Saldo antes: R$ ${testUser.saldo}`);
      console.log(`   Saldo depois: R$ ${updatedUser.saldo}`);
      console.log(`   Valor debitado: R$ ${(testUser.saldo - updatedUser.saldo).toFixed(2)}`);
      console.log(`   Preço esperado: R$ ${consoleCase.preco}`);
      
      const expectedDebit = parseFloat(consoleCase.preco);
      const actualDebit = testUser.saldo - updatedUser.saldo;
      
      if (Math.abs(actualDebit - expectedDebit) < 0.01) {
        console.log('✅ DÉBITO CORRETO!');
      } else {
        console.log('❌ DÉBITO INCORRETO!');
        console.log(`   Diferença: R$ ${(actualDebit - expectedDebit).toFixed(2)}`);
      }
      
      // 7. Verificar UserBalance retornado
      console.log('\n🔍 VERIFICANDO USERBALANCE:');
      console.log(`   UserBalance retornado: R$ ${response.data.userBalance}`);
      console.log(`   Saldo real no banco: R$ ${updatedUser.saldo}`);
      
      if (Math.abs(response.data.userBalance - updatedUser.saldo) < 0.01) {
        console.log('✅ USERBALANCE CORRETO!');
      } else {
        console.log('❌ USERBALANCE INCORRETO!');
        console.log(`   Diferença: R$ ${(response.data.userBalance - updatedUser.saldo).toFixed(2)}`);
      }
      
      // 8. Verificar transações criadas
      console.log('\n📊 TRANSAÇÕES CRIADAS:');
      const transactions = await prisma.transaction.findMany({
        where: { user_id: testUser.id },
        orderBy: { criado_em: 'desc' },
        take: 5,
        select: {
          tipo: true,
          valor: true,
          descricao: true,
          criado_em: true
        }
      });
      
      transactions.forEach((tx, index) => {
        console.log(`${index + 1}. ${tx.tipo}`);
        console.log(`   Valor: R$ ${tx.valor}`);
        console.log(`   Descrição: ${tx.descricao}`);
        console.log(`   Data: ${tx.criado_em.toLocaleString('pt-BR')}`);
      });
      
      // 9. Verificar se há débito duplicado
      console.log('\n🔍 VERIFICANDO DÉBITO DUPLICADO:');
      const aberturaTransactions = transactions.filter(tx => tx.tipo === 'abertura_caixa');
      if (aberturaTransactions.length > 1) {
        console.log('❌ DÉBITO DUPLICADO DETECTADO!');
        console.log(`   Transações de abertura: ${aberturaTransactions.length}`);
      } else {
        console.log('✅ Sem débito duplicado');
      }
      
    } catch (error) {
      console.error('❌ Erro ao comprar caixa:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugConsoleCase();
