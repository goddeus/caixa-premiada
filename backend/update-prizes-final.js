const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePrizesFinal() {
  console.log('🔄 ATUALIZANDO PRÊMIOS FINAIS COM NOVOS VALORES...\n');

  try {
    // 1. CAIXA APPLE (R$ 7,00)
    console.log('🍎 Atualizando CAIXA APPLE...');
    
    const appleCase = await prisma.case.findFirst({
      where: { nome: 'CAIXA APPLE' }
    });

    if (appleCase) {
      // Remover prêmios antigos
      await prisma.prize.deleteMany({
        where: { case_id: appleCase.id }
      });

      // Adicionar novos prêmios
      const applePrizes = [
        // Prêmios em Dinheiro
        { nome: 'R$ 1,00', valor_centavos: 100, tipo: 'cash', label: 'R$ 1,00', ativo: true },
        { nome: 'R$ 2,00', valor_centavos: 200, tipo: 'cash', label: 'R$ 2,00', ativo: true },
        { nome: 'R$ 5,00', valor_centavos: 500, tipo: 'cash', label: 'R$ 5,00', ativo: true },
        { nome: 'R$ 10,00', valor_centavos: 1000, tipo: 'cash', label: 'R$ 10,00', ativo: true },
        { nome: 'R$ 100,00', valor_centavos: 10000, tipo: 'cash', label: 'R$ 100,00', ativo: true },
        { nome: 'R$ 500,00', valor_centavos: 50000, tipo: 'cash', label: 'R$ 500,00', ativo: true },
        // Prêmios Produtos (NÃO SORTEÁVEIS - acima de R$ 1.000)
        { nome: 'APPLE WATCH', valor_centavos: 350000, tipo: 'ilustrativo', label: 'APPLE WATCH', ativo: true },
        { nome: 'IPHONE', valor_centavos: 1000000, tipo: 'ilustrativo', label: 'IPHONE', ativo: true },
        { nome: 'MACBOOK', valor_centavos: 1500000, tipo: 'ilustrativo', label: 'MACBOOK', ativo: true }
      ];

      for (const prize of applePrizes) {
        await prisma.prize.create({
          data: {
            id: require('crypto').randomUUID(),
            case_id: appleCase.id,
            nome: prize.nome,
            valor: prize.valor_centavos / 100,
            valor_centavos: prize.valor_centavos,
            tipo: prize.tipo,
            label: prize.label,
            ativo: prize.ativo,
            probabilidade: 0.1,
            imagem_url: `/imagens/CAIXA APPLE/${prize.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`,
            imagem_id: `/imagens/CAIXA APPLE/${prize.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`
          }
        });
      }
      console.log(`   ✅ Adicionados ${applePrizes.length} prêmios`);
    }

    // 2. CAIXA CONSOLE DO SONHOS! (R$ 3,50)
    console.log('\n🎮 Atualizando CAIXA CONSOLE DO SONHOS!...');
    
    const consoleCase = await prisma.case.findFirst({
      where: { nome: 'CAIXA CONSOLE DO SONHOS!' }
    });

    if (consoleCase) {
      await prisma.prize.deleteMany({
        where: { case_id: consoleCase.id }
      });

      const consolePrizes = [
        // Prêmios em Dinheiro
        { nome: 'R$ 1,00', valor_centavos: 100, tipo: 'cash', label: 'R$ 1,00', ativo: true },
        { nome: 'R$ 2,00', valor_centavos: 200, tipo: 'cash', label: 'R$ 2,00', ativo: true },
        { nome: 'R$ 5,00', valor_centavos: 500, tipo: 'cash', label: 'R$ 5,00', ativo: true },
        { nome: 'R$ 10,00', valor_centavos: 1000, tipo: 'cash', label: 'R$ 10,00', ativo: true },
        { nome: 'R$ 100,00', valor_centavos: 10000, tipo: 'cash', label: 'R$ 100,00', ativo: true },
        // Prêmios Produtos (NÃO SORTEÁVEIS - acima de R$ 1.000)
        { nome: 'STEAM DECK', valor_centavos: 300000, tipo: 'ilustrativo', label: 'STEAM DECK', ativo: true },
        { nome: 'PLAYSTATION 5', valor_centavos: 400000, tipo: 'ilustrativo', label: 'PLAYSTATION 5', ativo: true },
        { nome: 'XBOX SERIES X', valor_centavos: 400000, tipo: 'ilustrativo', label: 'XBOX SERIES X', ativo: true }
      ];

      for (const prize of consolePrizes) {
        await prisma.prize.create({
          data: {
            id: require('crypto').randomUUID(),
            case_id: consoleCase.id,
            nome: prize.nome,
            valor: prize.valor_centavos / 100,
            valor_centavos: prize.valor_centavos,
            tipo: prize.tipo,
            label: prize.label,
            ativo: prize.ativo,
            probabilidade: 0.1,
            imagem_url: `/imagens/CAIXA CONSOLE DOS SONHOS/${prize.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`,
            imagem_id: `/imagens/CAIXA CONSOLE DOS SONHOS/${prize.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`
          }
        });
      }
      console.log(`   ✅ Adicionados ${consolePrizes.length} prêmios`);
    }

    // 3. CAIXA KIT NIKE (R$ 2,50)
    console.log('\n👟 Atualizando CAIXA KIT NIKE...');
    
    const nikeCase = await prisma.case.findFirst({
      where: { nome: 'CAIXA KIT NIKE' }
    });

    if (nikeCase) {
      await prisma.prize.deleteMany({
        where: { case_id: nikeCase.id }
      });

      const nikePrizes = [
        // Prêmios em Dinheiro
        { nome: 'R$ 1,00', valor_centavos: 100, tipo: 'cash', label: 'R$ 1,00', ativo: true },
        { nome: 'R$ 2,00', valor_centavos: 200, tipo: 'cash', label: 'R$ 2,00', ativo: true },
        { nome: 'R$ 5,00', valor_centavos: 500, tipo: 'cash', label: 'R$ 5,00', ativo: true },
        { nome: 'R$ 10,00', valor_centavos: 1000, tipo: 'cash', label: 'R$ 10,00', ativo: true },
        // Prêmios Produtos (SORTEÁVEIS - abaixo de R$ 1.000)
        { nome: 'BONÉ NIKE', valor_centavos: 5000, tipo: 'produto', label: 'BONÉ NIKE', ativo: true },
        { nome: 'CAMISA NIKE', valor_centavos: 10000, tipo: 'produto', label: 'CAMISA NIKE', ativo: true },
        { nome: 'AIR FORCE 1', valor_centavos: 70000, tipo: 'produto', label: 'AIR FORCE 1', ativo: true },
        { nome: 'AIR JORDAN', valor_centavos: 150000, tipo: 'produto', label: 'AIR JORDAN', ativo: true },
        // Prêmios Produtos (NÃO SORTEÁVEIS - acima de R$ 1.000)
        { nome: 'NIKE DUNK', valor_centavos: 100000, tipo: 'ilustrativo', label: 'NIKE DUNK', ativo: true }
      ];

      for (const prize of nikePrizes) {
        await prisma.prize.create({
          data: {
            id: require('crypto').randomUUID(),
            case_id: nikeCase.id,
            nome: prize.nome,
            valor: prize.valor_centavos / 100,
            valor_centavos: prize.valor_centavos,
            tipo: prize.tipo,
            label: prize.label,
            ativo: prize.ativo,
            probabilidade: 0.1,
            imagem_url: `/imagens/CAIXA KIT NIKE/${prize.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`,
            imagem_id: `/imagens/CAIXA KIT NIKE/${prize.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`
          }
        });
      }
      console.log(`   ✅ Adicionados ${nikePrizes.length} prêmios`);
    }

    // 4. CAIXA PREMIUM MASTER! (R$ 15,00)
    console.log('\n💎 Atualizando CAIXA PREMIUM MASTER!...');
    
    const premiumCase = await prisma.case.findFirst({
      where: { nome: 'CAIXA PREMIUM MASTER!' }
    });

    if (premiumCase) {
      await prisma.prize.deleteMany({
        where: { case_id: premiumCase.id }
      });

      const premiumPrizes = [
        // Prêmios Produtos (NÃO SORTEÁVEIS - acima de R$ 1.000)
        { nome: 'AIRPODS', valor_centavos: 250000, tipo: 'ilustrativo', label: 'AIRPODS', ativo: true },
        { nome: 'SAMSUNG S25', valor_centavos: 500000, tipo: 'ilustrativo', label: 'SAMSUNG S25', ativo: true },
        { nome: 'IPAD', valor_centavos: 800000, tipo: 'ilustrativo', label: 'IPAD', ativo: true },
        { nome: 'IPHONE', valor_centavos: 1000000, tipo: 'ilustrativo', label: 'IPHONE', ativo: true },
        { nome: 'MACBOOK', valor_centavos: 1500000, tipo: 'ilustrativo', label: 'MACBOOK', ativo: true },
        // Prêmios Ilustrativos (não sorteáveis)
        { nome: 'PC GAMER', valor_centavos: 500000, tipo: 'ilustrativo', label: 'PC GAMER', ativo: true },
        { nome: 'IPHONE 16 PRO MAX', valor_centavos: 1000000, tipo: 'ilustrativo', label: 'IPHONE 16 PRO MAX', ativo: true }
      ];

      for (const prize of premiumPrizes) {
        await prisma.prize.create({
          data: {
            id: require('crypto').randomUUID(),
            case_id: premiumCase.id,
            nome: prize.nome,
            valor: prize.valor_centavos / 100,
            valor_centavos: prize.valor_centavos,
            tipo: prize.tipo,
            label: prize.label,
            ativo: prize.ativo,
            probabilidade: 0.1,
            imagem_url: `/imagens/CAIXA PREMIUM MASTER!/${prize.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`,
            imagem_id: `/imagens/CAIXA PREMIUM MASTER!/${prize.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`
          }
        });
      }
      console.log(`   ✅ Adicionados ${premiumPrizes.length} prêmios`);
    }

    // 5. CAIXA SAMSUNG (R$ 3,00)
    console.log('\n📱 Atualizando CAIXA SAMSUNG...');
    
    const samsungCase = await prisma.case.findFirst({
      where: { nome: 'CAIXA SAMSUNG' }
    });

    if (samsungCase) {
      await prisma.prize.deleteMany({
        where: { case_id: samsungCase.id }
      });

      const samsungPrizes = [
        // Prêmios em Dinheiro
        { nome: 'R$ 1,00', valor_centavos: 100, tipo: 'cash', label: 'R$ 1,00', ativo: true },
        { nome: 'R$ 2,00', valor_centavos: 200, tipo: 'cash', label: 'R$ 2,00', ativo: true },
        { nome: 'R$ 5,00', valor_centavos: 500, tipo: 'cash', label: 'R$ 5,00', ativo: true },
        { nome: 'R$ 10,00', valor_centavos: 1000, tipo: 'cash', label: 'R$ 10,00', ativo: true },
        { nome: 'R$ 100,00', valor_centavos: 10000, tipo: 'cash', label: 'R$ 100,00', ativo: true },
        { nome: 'R$ 500,00', valor_centavos: 50000, tipo: 'cash', label: 'R$ 500,00', ativo: true },
        // Prêmios Produtos (NÃO SORTEÁVEIS - acima de R$ 1.000)
        { nome: 'FONE SAMSUNG', valor_centavos: 100000, tipo: 'ilustrativo', label: 'FONE SAMSUNG', ativo: true },
        { nome: 'NOTEBOOK SAMSUNG', valor_centavos: 300000, tipo: 'ilustrativo', label: 'NOTEBOOK SAMSUNG', ativo: true },
        { nome: 'SAMSUNG S25', valor_centavos: 500000, tipo: 'ilustrativo', label: 'SAMSUNG S25', ativo: true }
      ];

      for (const prize of samsungPrizes) {
        await prisma.prize.create({
          data: {
            id: require('crypto').randomUUID(),
            case_id: samsungCase.id,
            nome: prize.nome,
            valor: prize.valor_centavos / 100,
            valor_centavos: prize.valor_centavos,
            tipo: prize.tipo,
            label: prize.label,
            ativo: prize.ativo,
            probabilidade: 0.1,
            imagem_url: `/imagens/CAIXA SAMSUNG/${prize.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`,
            imagem_id: `/imagens/CAIXA SAMSUNG/${prize.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`
          }
        });
      }
      console.log(`   ✅ Adicionados ${samsungPrizes.length} prêmios`);
    }

    // 6. CAIXA WEEKEND (R$ 1,50)
    console.log('\n🎯 Atualizando CAIXA WEEKEND...');
    
    const weekendCase = await prisma.case.findFirst({
      where: { nome: 'CAIXA WEEKEND' }
    });

    if (weekendCase) {
      await prisma.prize.deleteMany({
        where: { case_id: weekendCase.id }
      });

      const weekendPrizes = [
        // Prêmios Produtos (SORTEÁVEIS - abaixo de R$ 1.000)
        { nome: 'SAMSUNG GALAXY BUDS', valor_centavos: 30000, tipo: 'produto', label: 'SAMSUNG GALAXY BUDS', ativo: true },
        { nome: 'R$ 1,00', valor_centavos: 100, tipo: 'cash', label: 'R$ 1,00', ativo: true },
        { nome: 'R$ 50,00', valor_centavos: 5000, tipo: 'cash', label: 'R$ 50,00', ativo: true },
        // Prêmios Produtos (NÃO SORTEÁVEIS - acima de R$ 1.000)
        { nome: 'REDMI NOTE 13', valor_centavos: 100000, tipo: 'ilustrativo', label: 'REDMI NOTE 13', ativo: true },
        // Prêmios com valor 0 (não sorteáveis)
        { nome: 'R$ 500,00', valor_centavos: 0, tipo: 'ilustrativo', label: 'R$ 500,00', ativo: false },
        { nome: 'R$ 100,00', valor_centavos: 0, tipo: 'ilustrativo', label: 'R$ 100,00', ativo: false },
        { nome: 'R$ 2,00', valor_centavos: 0, tipo: 'ilustrativo', label: 'R$ 2,00', ativo: false }
      ];

      for (const prize of weekendPrizes) {
        await prisma.prize.create({
          data: {
            id: require('crypto').randomUUID(),
            case_id: weekendCase.id,
            nome: prize.nome,
            valor: prize.valor_centavos / 100,
            valor_centavos: prize.valor_centavos,
            tipo: prize.tipo,
            label: prize.label,
            ativo: prize.ativo,
            probabilidade: 0.1,
            imagem_url: `/imagens/CAIXA WEEKEND/${prize.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`,
            imagem_id: `/imagens/CAIXA WEEKEND/${prize.nome.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`
          }
        });
      }
      console.log(`   ✅ Adicionados ${weekendPrizes.length} prêmios`);
    }

    // 7. Relatório final
    console.log('\n📊 RELATÓRIO FINAL ATUALIZADO:');
    console.log('=' * 80);

    const allCases = await prisma.case.findMany({
      orderBy: { nome: 'asc' }
    });

    for (const caseItem of allCases) {
      console.log(`\n🎁 CAIXA: ${caseItem.nome} (R$ ${caseItem.preco})`);
      console.log('-'.repeat(60));

      const prizes = await prisma.prize.findMany({
        where: { case_id: caseItem.id },
        orderBy: { valor_centavos: 'asc' }
      });

      const cashPrizes = prizes.filter(p => p.tipo === 'cash');
      const productPrizes = prizes.filter(p => p.tipo === 'produto');
      const illustrativePrizes = prizes.filter(p => p.tipo === 'ilustrativo');

      if (cashPrizes.length > 0) {
        console.log('💰 PRÊMIOS EM DINHEIRO:');
        cashPrizes.forEach(prize => {
          const valorFormatado = `R$ ${(prize.valor_centavos / 100).toFixed(2).replace('.', ',')}`;
          console.log(`   - ${prize.nome} → ${valorFormatado}`);
        });
      }

      if (productPrizes.length > 0) {
        console.log('🎁 PRÊMIOS PRODUTOS (SORTEÁVEIS):');
        productPrizes.forEach(prize => {
          const valorFormatado = `R$ ${(prize.valor_centavos / 100).toFixed(2).replace('.', ',')}`;
          console.log(`   - ${prize.nome} → ${valorFormatado}`);
        });
      }

      if (illustrativePrizes.length > 0) {
        console.log('🖼️ PRÊMIOS ILUSTRATIVOS (NÃO SORTEÁVEIS):');
        illustrativePrizes.forEach(prize => {
          const valorFormatado = `R$ ${(prize.valor_centavos / 100).toFixed(2).replace('.', ',')}`;
          const status = prize.ativo ? 'ATIVO' : 'INATIVO';
          console.log(`   - ${prize.nome} → ${valorFormatado} (${status})`);
        });
      }

      console.log(`📊 Total: ${prizes.length} prêmios`);
    }

    console.log('\n🎉 ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!');

  } catch (error) {
    console.error('❌ Erro durante atualização:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar atualização
updatePrizesFinal().then(() => {
  console.log('\n✅ SCRIPT FINALIZADO!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
