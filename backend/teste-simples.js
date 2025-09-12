const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testeSimples() {
  try {
    console.log('🧪 TESTE SIMPLES - VERIFICANDO SISTEMA');
    console.log('==================================================');

    // 1. Verificar se o centralizedDrawService funciona
    console.log('1. Testando centralizedDrawService...');
    
    const centralizedDrawService = require('./src/services/centralizedDrawService');
    
    // Buscar uma caixa
    const caixa = await prisma.case.findFirst({
      where: { ativo: true },
      select: { id: true, nome: true, preco: true }
    });
    
    if (!caixa) {
      console.log('❌ Nenhuma caixa ativa encontrada');
      return;
    }
    
    console.log(`✅ Caixa encontrada: ${caixa.nome} (R$ ${caixa.preco})`);
    
    // Buscar um usuário
    const usuario = await prisma.user.findFirst({
      where: { 
        is_admin: true,
        saldo: { gt: 0 }
      },
      select: { id: true, nome: true, email: true, saldo: true }
    });
    
    if (!usuario) {
      console.log('❌ Nenhum usuário admin com saldo encontrado');
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${usuario.nome} (R$ ${usuario.saldo})`);
    
    // Testar sorteio
    console.log('\n2. Testando sorteio...');
    const saldoAntes = parseFloat(usuario.saldo);
    
    const resultado = await centralizedDrawService.sortearPremio(caixa.id, usuario.id);
    
    console.log('📦 Resultado do sorteio:');
    console.log(`   Sucesso: ${resultado.success}`);
    console.log(`   Prêmio: ${resultado.prize?.nome || 'N/A'}`);
    console.log(`   Valor: R$ ${resultado.prize?.valor || 0}`);
    
    // Verificar saldo após
    const usuarioDepois = await prisma.user.findUnique({
      where: { id: usuario.id },
      select: { saldo: true }
    });
    
    const saldoDepois = parseFloat(usuarioDepois.saldo);
    const valorDebitado = saldoAntes - saldoDepois + (resultado.prize?.valor || 0);
    const precoEsperado = parseFloat(caixa.preco);
    
    console.log('\n💰 ANÁLISE DO DÉBITO:');
    console.log(`   Saldo antes: R$ ${saldoAntes.toFixed(2)}`);
    console.log(`   Saldo depois: R$ ${saldoDepois.toFixed(2)}`);
    console.log(`   Valor debitado: R$ ${valorDebitado.toFixed(2)}`);
    console.log(`   Preço esperado: R$ ${precoEsperado.toFixed(2)}`);
    
    if (Math.abs(valorDebitado - precoEsperado) < 0.01) {
      console.log('✅ DÉBITO CORRETO! O sistema está funcionando');
    } else {
      console.log('❌ DÉBITO INCORRETO! Há problema no sistema');
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testeSimples();
