const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

async function testeApiSamsungReal() {
  try {
    console.log('🧪 TESTE API SAMSUNG REAL - SIMULANDO FRONTEND');
    console.log('==================================================');

    // 1. Buscar a caixa Samsung
    const caixaSamsung = await prisma.case.findFirst({
      where: { 
        nome: { contains: 'SAMSUNG' },
        ativo: true 
      },
      select: { id: true, nome: true, preco: true }
    });

    if (!caixaSamsung) {
      console.log('❌ CAIXA SAMSUNG não encontrada');
      return;
    }

    console.log('📦 CAIXA SAMSUNG:');
    console.log(`   Nome: ${caixaSamsung.nome}`);
    console.log(`   Preço: R$ ${caixaSamsung.preco.toFixed(2)}`);
    console.log(`   ID: ${caixaSamsung.id}`);
    console.log('');

    // 2. Fazer login para obter token
    console.log('🔐 FAZENDO LOGIN...');
    const loginResponse = await axios.post('http://localhost:3001/auth/login', {
      email: 'junior@admin.com',
      senha: 'password123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');
    console.log(`   Token: ${token.substring(0, 20)}...`);
    console.log('');

    // 3. Verificar saldo antes da compra
    const userResponse = await axios.get('http://localhost:3001/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const saldoAntes = parseFloat(userResponse.data.saldo);
    console.log(`💰 Saldo antes: R$ ${saldoAntes.toFixed(2)}`);

    // 4. Fazer a compra da caixa Samsung
    console.log('\n🛒 COMPRANDO CAIXA SAMSUNG...');
    const compraResponse = await axios.post(
      `http://localhost:3001/cases/buy/${caixaSamsung.id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log('📦 RESPOSTA DA API:');
    console.log(`   Success: ${compraResponse.data.success}`);
    console.log(`   UserBalance: R$ ${compraResponse.data.userBalance || 'N/A'}`);
    console.log(`   Prize: ${compraResponse.data.wonPrize?.nome || 'N/A'}`);
    console.log(`   Prize Value: R$ ${compraResponse.data.wonPrize?.valor || 'N/A'}`);
    console.log(`   Message: ${compraResponse.data.message || 'N/A'}`);
    console.log('');

    // 5. Verificar saldo após a compra
    const userResponseDepois = await axios.get('http://localhost:3001/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const saldoDepois = parseFloat(userResponseDepois.data.saldo);
    const valorDebitado = saldoAntes - saldoDepois + (compraResponse.data.wonPrize?.valor || 0);

    console.log('💰 ANÁLISE DO DÉBITO:');
    console.log(`   Saldo antes: R$ ${saldoAntes.toFixed(2)}`);
    console.log(`   Saldo depois: R$ ${saldoDepois.toFixed(2)}`);
    console.log(`   Valor debitado: R$ ${valorDebitado.toFixed(2)}`);
    console.log(`   Preço esperado: R$ 3.00`);
    console.log(`   UserBalance retornado: R$ ${compraResponse.data.userBalance || 'N/A'}`);
    console.log('');

    if (Math.abs(valorDebitado - 3.00) < 0.01) {
      console.log('✅ DÉBITO CORRETO! O backend está funcionando');
    } else {
      console.log('❌ DÉBITO INCORRETO! Há problema no backend');
      console.log(`   Diferença: R$ ${Math.abs(valorDebitado - 3.00).toFixed(2)}`);
    }

    if (Math.abs((compraResponse.data.userBalance || 0) - saldoDepois) < 0.01) {
      console.log('✅ USERBALANCE CORRETO!');
    } else {
      console.log('❌ USERBALANCE INCORRETO!');
      console.log(`   Diferença: R$ ${Math.abs((compraResponse.data.userBalance || 0) - saldoDepois).toFixed(2)}`);
    }

    // 6. Verificar transações criadas
    console.log('\n📊 TRANSAÇÕES CRIADAS:');
    const transacoes = await prisma.transaction.findMany({
      where: {
        case_id: caixaSamsung.id,
        user_id: userResponse.data.id,
        criado_em: {
          gte: new Date(Date.now() - 2 * 60 * 1000) // Últimos 2 minutos
        }
      },
      orderBy: { criado_em: 'desc' }
    });

    transacoes.forEach((t, index) => {
      const valorAbsoluto = Math.abs(parseFloat(t.valor));
      console.log(`${index + 1}. ${t.tipo.toUpperCase()}`);
      console.log(`   Valor: R$ ${valorAbsoluto.toFixed(2)}`);
      console.log(`   Descrição: ${t.descricao}`);
      console.log(`   Data: ${t.criado_em.toLocaleString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testeApiSamsungReal();

