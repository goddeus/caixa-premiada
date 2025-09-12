const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function corrigirPrecoNike() {
  try {
    console.log('🔧 CORRIGINDO PREÇO DA CAIXA NIKE');
    console.log('==================================================');

    // 1. Buscar a CAIXA NIKE
    const caixaNike = await prisma.case.findFirst({
      where: { 
        nome: { contains: 'NIKE' },
        ativo: true 
      },
      select: { id: true, nome: true, preco: true }
    });

    if (!caixaNike) {
      console.log('❌ CAIXA NIKE não encontrada');
      return;
    }

    console.log('📦 CAIXA NIKE ENCONTRADA:');
    console.log(`   Nome: ${caixaNike.nome}`);
    console.log(`   Preço atual: R$ ${caixaNike.preco.toFixed(2)}`);
    console.log('');

    // 2. Alterar preço para R$ 2,50
    const novoPreco = 2.50;
    
    await prisma.case.update({
      where: { id: caixaNike.id },
      data: { preco: novoPreco }
    });

    console.log('✅ PREÇO ALTERADO COM SUCESSO!');
    console.log(`   Novo preço: R$ ${novoPreco.toFixed(2)}`);
    console.log('');

    // 3. Verificar se a alteração foi aplicada
    const caixaAtualizada = await prisma.case.findUnique({
      where: { id: caixaNike.id },
      select: { id: true, nome: true, preco: true }
    });

    console.log('🔍 VERIFICAÇÃO:');
    console.log(`   Nome: ${caixaAtualizada.nome}`);
    console.log(`   Preço: R$ ${caixaAtualizada.preco.toFixed(2)}`);
    
    if (Math.abs(caixaAtualizada.preco - novoPreco) < 0.01) {
      console.log('✅ Preço alterado com sucesso!');
    } else {
      console.log('❌ Erro na alteração do preço');
    }

    // 4. Listar todas as caixas para verificar
    console.log('\n📦 TODAS AS CAIXAS ATIVAS:');
    console.log('----------------------------');
    
    const todasCaixas = await prisma.case.findMany({
      where: { ativo: true },
      select: { id: true, nome: true, preco: true },
      orderBy: { nome: 'asc' }
    });

    todasCaixas.forEach((caixa, index) => {
      console.log(`${index + 1}. ${caixa.nome} - R$ ${caixa.preco.toFixed(2)}`);
    });

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corrigirPrecoNike();
