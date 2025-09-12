const axios = require('axios');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const API_BASE_URL = 'http://localhost:3001';

async function testarCompraCaixa() {
  try {
    console.log('🧪 TESTANDO COMPRA DE CAIXA APÓS CORREÇÃO');
    console.log('==================================================');

    const testUserEmail = 'junior@admin.com';
    const testCaseName = 'CAIXA FINAL DE SEMANA';

    // 1. Fazer login
    console.log('1. Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: testUserEmail,
      password: 'password123'
    });
    
    const authToken = loginResponse.data.token;
    const userId = loginResponse.data.user.id;
    const saldoAntes = loginResponse.data.user.saldo;
    
    console.log(`✅ Login realizado`);
    console.log(`👤 Usuário: ${loginResponse.data.user.nome}`);
    console.log(`💰 Saldo antes: R$ ${saldoAntes.toFixed(2)}`);

    // 2. Buscar caixa
    console.log('\n2. Buscando caixa...');
    const casesResponse = await axios.get(`${API_BASE_URL}/cases`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const caseData = casesResponse.data.cases.find(c => c.nome === testCaseName);
    if (!caseData) {
      console.error(`❌ Caixa "${testCaseName}" não encontrada`);
      return;
    }
    
    console.log(`✅ Caixa encontrada: ${caseData.nome}`);
    console.log(`💰 Preço: R$ ${caseData.preco.toFixed(2)}`);

    // 3. Comprar caixa
    console.log('\n3. Comprando caixa...');
    const buyResponse = await axios.post(`${API_BASE_URL}/cases/buy/${caseData.id}`, {}, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    console.log('✅ Compra realizada!');
    console.log('📦 Resposta:', {
      message: buyResponse.data.message,
      wonPrize: buyResponse.data.wonPrize?.nome,
      prizeValue: buyResponse.data.wonPrize?.valor,
      userBalance: buyResponse.data.userBalance
    });

    // 4. Verificar saldo após compra
    console.log('\n4. Verificando saldo após compra...');
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { saldo: true }
    });

    const saldoDepois = parseFloat(updatedUser.saldo);
    const valorDebitado = saldoAntes - saldoDepois + (buyResponse.data.wonPrize?.valor || 0);
    const precoEsperado = parseFloat(caseData.preco);

    console.log(`💰 Saldo antes: R$ ${saldoAntes.toFixed(2)}`);
    console.log(`💰 Saldo depois: R$ ${saldoDepois.toFixed(2)}`);
    console.log(`💰 Valor debitado: R$ ${valorDebitado.toFixed(2)}`);
    console.log(`💰 Preço esperado: R$ ${precoEsperado.toFixed(2)}`);

    if (Math.abs(valorDebitado - precoEsperado) < 0.01) {
      console.log('✅ DÉBITO CORRETO! O valor debitado confere com o preço da caixa');
    } else {
      console.log('❌ DÉBITO INCORRETO! O valor debitado não confere com o preço da caixa');
    }

    // 5. Verificar transações
    console.log('\n5. Verificando transações...');
    const transacoes = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        case_id: caseData.id,
        criado_em: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Últimos 5 minutos
        }
      },
      orderBy: { criado_em: 'desc' },
      take: 5
    });

    console.log(`📊 Transações encontradas: ${transacoes.length}`);
    transacoes.forEach((t, index) => {
      console.log(`${index + 1}. ${t.tipo} - R$ ${Math.abs(parseFloat(t.valor)).toFixed(2)} - ${t.descricao}`);
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testarCompraCaixa();
