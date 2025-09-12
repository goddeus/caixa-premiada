const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugFrontendReal() {
  try {
    console.log('🔍 DEBUG FRONTEND REAL - VERIFICANDO O QUE ESTÁ ACONTECENDO');
    console.log('==================================================');

    const userId = 'cd325b64-eca7-4adf-bc77-7022473126b2'; // junior@admin.com
    
    // 1. Verificar saldo atual
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        nome: true, 
        email: true, 
        saldo: true,
        tipo_conta: true
      }
    });

    console.log('👤 USUÁRIO ATUAL:');
    console.log(`   Nome: ${usuario.nome}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Saldo: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);
    console.log(`   Tipo: ${usuario.tipo_conta}`);
    console.log('');

    // 2. Verificar transações recentes (últimos 10 minutos)
    const dezMinutosAtras = new Date(Date.now() - 10 * 60 * 1000);
    const transacoesRecentes = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        criado_em: {
          gte: dezMinutosAtras
        }
      },
      orderBy: { criado_em: 'desc' }
    });

    console.log('📊 TRANSAÇÕES RECENTES (ÚLTIMOS 10 MINUTOS):');
    console.log('----------------------------------------------');
    
    if (transacoesRecentes.length === 0) {
      console.log('   Nenhuma transação encontrada');
    } else {
      transacoesRecentes.forEach((t, index) => {
        const valorAbsoluto = Math.abs(parseFloat(t.valor));
        console.log(`${index + 1}. ${t.tipo.toUpperCase()}`);
        console.log(`   Valor: R$ ${valorAbsoluto.toFixed(2)}`);
        console.log(`   Descrição: ${t.descricao}`);
        console.log(`   Caixa ID: ${t.case_id || 'N/A'}`);
        console.log(`   Data: ${t.criado_em.toLocaleString()}`);
        console.log('');
      });
    }

    // 3. Verificar se há transações de abertura de caixa específicas
    const transacoesAbertura = transacoesRecentes.filter(t => t.tipo === 'abertura_caixa');
    
    if (transacoesAbertura.length > 0) {
      console.log('🎲 TRANSAÇÕES DE ABERTURA DE CAIXA:');
      console.log('-----------------------------------');
      
      // Buscar informações das caixas
      const caseIds = [...new Set(transacoesAbertura.map(t => t.case_id).filter(id => id))];
      const caixas = await prisma.case.findMany({
        where: { id: { in: caseIds } },
        select: { id: true, nome: true, preco: true }
      });
      
      const caixasMap = {};
      caixas.forEach(caixa => {
        caixasMap[caixa.id] = caixa;
      });
      
      let totalDebitado = 0;
      transacoesAbertura.forEach((t, index) => {
        const valorDebitado = Math.abs(parseFloat(t.valor));
        const caixa = caixasMap[t.case_id];
        totalDebitado += valorDebitado;
        
        console.log(`${index + 1}. ${caixa?.nome || 'N/A'}`);
        console.log(`   Valor debitado: R$ ${valorDebitado.toFixed(2)}`);
        console.log(`   Preço da caixa: R$ ${caixa?.preco ? parseFloat(caixa.preco).toFixed(2) : 'N/A'}`);
        console.log(`   Data: ${t.criado_em.toLocaleString()}`);
        console.log('');
      });
      
      console.log(`💰 TOTAL DEBITADO: R$ ${totalDebitado.toFixed(2)}`);
    } else {
      console.log('❌ NENHUMA TRANSAÇÃO DE ABERTURA DE CAIXA ENCONTRADA');
      console.log('💡 Isso indica que o frontend não está chamando a API corretamente');
    }

    // 4. Verificar se o servidor está rodando
    console.log('\n🔍 VERIFICANDO STATUS DO SERVIDOR:');
    console.log('-----------------------------------');
    console.log('💡 Para verificar se o servidor está rodando, execute:');
    console.log('   npm start (na pasta backend)');
    console.log('   ou');
    console.log('   node src/server.js');

    // 5. Verificar logs do centralizedDrawService
    console.log('\n🔍 VERIFICANDO LOGS DO CENTRALIZEDDRAWSERVICE:');
    console.log('----------------------------------------------');
    console.log('💡 Os logs do centralizedDrawService devem aparecer no console do servidor');
    console.log('💡 Procure por mensagens como:');
    console.log('   "🎲 INICIANDO SORTEIO CENTRALIZADO"');
    console.log('   "💰 Preço original da caixa"');
    console.log('   "💰 Alteração no Caixa"');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugFrontendReal();
