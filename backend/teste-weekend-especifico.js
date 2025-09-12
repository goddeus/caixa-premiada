const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testeWeekendEspecifico() {
  try {
    console.log('🧪 TESTE ESPECÍFICO - CAIXA FINAL DE SEMANA');
    console.log('==================================================');

    const userId = 'cd325b64-eca7-4adf-bc77-7022473126b2'; // junior@admin.com
    
    // 1. Verificar saldo atual
    const usuario = await prisma.user.findUnique({
      where: { id: userId },
      select: { saldo: true }
    });

    console.log(`💰 Saldo atual: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);

    // 2. Buscar CAIXA FINAL DE SEMANA
    const caixaWeekend = await prisma.case.findFirst({
      where: { 
        nome: 'CAIXA FINAL DE SEMANA',
        ativo: true 
      },
      select: { id: true, nome: true, preco: true }
    });

    if (!caixaWeekend) {
      console.log('❌ CAIXA FINAL DE SEMANA não encontrada');
      return;
    }

    console.log(`📦 Caixa encontrada: ${caixaWeekend.nome}`);
    console.log(`💰 Preço: R$ ${caixaWeekend.preco.toFixed(2)}`);

    // 3. Testar sorteio diretamente
    console.log('\n🎲 Testando sorteio da CAIXA FINAL DE SEMANA...');
    
    const centralizedDrawService = require('./src/services/centralizedDrawService');
    const saldoAntes = parseFloat(usuario.saldo);
    
    const resultado = await centralizedDrawService.sortearPremio(caixaWeekend.id, userId);
    
    console.log('📦 Resultado do sorteio:');
    console.log(`   Sucesso: ${resultado.success}`);
    console.log(`   Prêmio: ${resultado.prize?.nome || 'N/A'}`);
    console.log(`   Valor: R$ ${resultado.prize?.valor || 0}`);
    console.log(`   Saldo retornado: R$ ${resultado.userBalance || 'N/A'}`);

    // 4. Verificar saldo após
    const usuarioDepois = await prisma.user.findUnique({
      where: { id: userId },
      select: { saldo: true }
    });
    
    const saldoDepois = parseFloat(usuarioDepois.saldo);
    const valorDebitado = saldoAntes - saldoDepois + (resultado.prize?.valor || 0);
    const precoEsperado = parseFloat(caixaWeekend.preco);
    
    console.log('\n💰 ANÁLISE DO DÉBITO:');
    console.log(`   Saldo antes: R$ ${saldoAntes.toFixed(2)}`);
    console.log(`   Saldo depois: R$ ${saldoDepois.toFixed(2)}`);
    console.log(`   Valor debitado: R$ ${valorDebitado.toFixed(2)}`);
    console.log(`   Preço esperado: R$ ${precoEsperado.toFixed(2)}`);
    
    if (Math.abs(valorDebitado - precoEsperado) < 0.01) {
      console.log('✅ DÉBITO CORRETO! A CAIXA FINAL DE SEMANA está funcionando');
    } else {
      console.log('❌ DÉBITO INCORRETO! Há problema com a CAIXA FINAL DE SEMANA');
    }

    // 5. Verificar transações recentes
    console.log('\n📊 TRANSAÇÕES RECENTES:');
    const transacoesRecentes = await prisma.transaction.findMany({
      where: {
        user_id: userId,
        case_id: caixaWeekend.id,
        criado_em: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Últimos 5 minutos
        }
      },
      orderBy: { criado_em: 'desc' },
      take: 3
    });

    console.log(`   Transações encontradas: ${transacoesRecentes.length}`);
    transacoesRecentes.forEach((t, index) => {
      console.log(`   ${index + 1}. ${t.tipo} - R$ ${Math.abs(parseFloat(t.valor)).toFixed(2)} - ${t.descricao}`);
    });

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testeWeekendEspecifico();
