const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function corrigirTodosPrecos() {
  try {
    console.log('🔧 CORRIGINDO TODOS OS PREÇOS DAS CAIXAS');
    console.log('==================================================');

    // Preços corretos
    const precosCorretos = {
      'CAIXA APPLE': 7.00,
      'CAIXA CONSOLE DOS SONHOS': 3.50,
      'CAIXA FINAL DE SEMANA': 1.50,
      'CAIXA KIT NIKE': 2.50,
      'CAIXA PREMIUM MASTER': 15.00,
      'CAIXA SAMSUNG': 3.00
    };

    console.log('📦 PREÇOS CORRETOS:');
    console.log('-------------------');
    Object.entries(precosCorretos).forEach(([nome, preco]) => {
      console.log(`${nome}: R$ ${preco.toFixed(2)}`);
    });
    console.log('');

    // 1. Buscar todas as caixas ativas
    const todasCaixas = await prisma.case.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, preco: true },
      orderBy: { nome: 'asc' }
    });

    console.log('🔍 CAIXAS ENCONTRADAS:');
    console.log('----------------------');
    todasCaixas.forEach((caixa, index) => {
      console.log(`${index + 1}. ${caixa.nome} - R$ ${caixa.preco.toFixed(2)}`);
    });
    console.log('');

    let caixasCorrigidas = 0;

    // 2. Corrigir cada caixa
    for (const caixa of todasCaixas) {
      const precoCorreto = precosCorretos[caixa.nome];
      
      if (precoCorreto !== undefined) {
        const precoAtual = parseFloat(caixa.preco);
        const diferenca = Math.abs(precoAtual - precoCorreto);
        
        if (diferenca > 0.01) {
          console.log(`🔧 Corrigindo ${caixa.nome}:`);
          console.log(`   Preço atual: R$ ${precoAtual.toFixed(2)}`);
          console.log(`   Preço correto: R$ ${precoCorreto.toFixed(2)}`);
          console.log(`   Diferença: R$ ${diferenca.toFixed(2)}`);
          
          await prisma.case.update({
            where: { id: caixa.id },
            data: { preco: precoCorreto }
          });
          
          console.log(`   ✅ Corrigido para R$ ${precoCorreto.toFixed(2)}`);
          caixasCorrigidas++;
        } else {
          console.log(`✅ ${caixa.nome} já está com o preço correto: R$ ${precoAtual.toFixed(2)}`);
        }
      } else {
        console.log(`⚠️ ${caixa.nome} não encontrada na lista de preços corretos`);
      }
      console.log('');
    }

    // 3. Verificar resultado final
    console.log('📋 RESULTADO FINAL:');
    console.log('==================');
    
    const caixasAtualizadas = await prisma.case.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, preco: true },
      orderBy: { nome: 'asc' }
    });

    caixasAtualizadas.forEach((caixa, index) => {
      const precoCorreto = precosCorretos[caixa.nome];
      const precoAtual = parseFloat(caixa.preco);
      const status = precoCorreto !== undefined && Math.abs(precoAtual - precoCorreto) < 0.01 ? '✅' : '❌';
      
      console.log(`${index + 1}. ${caixa.nome} - R$ ${precoAtual.toFixed(2)} ${status}`);
    });

    console.log(`\n🔧 Total de caixas corrigidas: ${caixasCorrigidas}`);
    
    if (caixasCorrigidas > 0) {
      console.log('✅ CORREÇÃO CONCLUÍDA COM SUCESSO!');
    } else {
      console.log('✅ Todas as caixas já estavam com os preços corretos');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corrigirTodosPrecos();
