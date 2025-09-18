const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixImages() {
  try {
    console.log('🔧 Corrigindo imagens dos prêmios...');
    
    // Mapeamento correto das imagens
    const imageMappings = [
      // CAIXA KIT NIKE
      { case_name: 'CAIXA KIT NIKE', prize_name: 'cash', valor: 1, new_image: '/imagens/CAIXA KIT NIKE/1.png' },
      { case_name: 'CAIXA KIT NIKE', prize_name: 'cash', valor: 2, new_image: '/imagens/CAIXA KIT NIKE/2.png' },
      { case_name: 'CAIXA KIT NIKE', prize_name: 'cash', valor: 5, new_image: '/imagens/CAIXA KIT NIKE/5.png' },
      { case_name: 'CAIXA KIT NIKE', prize_name: 'cash', valor: 10, new_image: '/imagens/CAIXA KIT NIKE/10.png' },
      { case_name: 'CAIXA KIT NIKE', prize_name: 'BONÉ NIKE', valor: 50, new_image: '/imagens/CAIXA KIT NIKE/boné nike.png' },
      { case_name: 'CAIXA KIT NIKE', prize_name: 'CAMISA NIKE', valor: 100, new_image: '/imagens/CAIXA KIT NIKE/camisa nike.webp' },
      { case_name: 'CAIXA KIT NIKE', prize_name: 'NIKE DUNK', valor: 1000, new_image: '/imagens/CAIXA KIT NIKE/nike dunk.webp' },
      { case_name: 'CAIXA KIT NIKE', prize_name: 'AIR FORCE 1', valor: 700, new_image: '/imagens/CAIXA KIT NIKE/airforce.webp' },
      { case_name: 'CAIXA KIT NIKE', prize_name: 'AIR JORDAN', valor: 1500, new_image: '/imagens/CAIXA KIT NIKE/jordan.png' },
      
      // CAIXA APPLE
      { case_name: 'CAIXA APPLE', prize_name: 'cash', valor: 1, new_image: '/imagens/CAIXA APPLE/1.png' },
      { case_name: 'CAIXA APPLE', prize_name: 'cash', valor: 2, new_image: '/imagens/CAIXA APPLE/2.png' },
      { case_name: 'CAIXA APPLE', prize_name: 'cash', valor: 5, new_image: '/imagens/CAIXA APPLE/5.png' },
      { case_name: 'CAIXA APPLE', prize_name: 'cash', valor: 10, new_image: '/imagens/CAIXA APPLE/10.png' },
      { case_name: 'CAIXA APPLE', prize_name: 'cash', valor: 500, new_image: '/imagens/CAIXA APPLE/500.webp' },
      { case_name: 'CAIXA APPLE', prize_name: 'IPHONE 16 PRO MAX', valor: 10000, new_image: '/imagens/CAIXA APPLE/iphone 16 pro max.png' },
      { case_name: 'CAIXA APPLE', prize_name: 'MACBOOK', valor: 15000, new_image: '/imagens/CAIXA APPLE/macbook.png' },
      { case_name: 'CAIXA APPLE', prize_name: 'AIRPODS', valor: 2500, new_image: '/imagens/CAIXA APPLE/air pods.png' },
      
      // CAIXA CONSOLE DOS SONHOS
      { case_name: 'CAIXA CONSOLE DO SONHOS!', prize_name: 'cash', valor: 1, new_image: '/imagens/CAIXA CONSOLE DOS SONHOS/1real.png' },
      { case_name: 'CAIXA CONSOLE DO SONHOS!', prize_name: 'cash', valor: 2, new_image: '/imagens/CAIXA CONSOLE DOS SONHOS/2reais.png' },
      { case_name: 'CAIXA CONSOLE DO SONHOS!', prize_name: 'cash', valor: 5, new_image: '/imagens/CAIXA CONSOLE DOS SONHOS/5reais.png' },
      { case_name: 'CAIXA CONSOLE DO SONHOS!', prize_name: 'cash', valor: 10, new_image: '/imagens/CAIXA CONSOLE DOS SONHOS/10reais.png' },
      { case_name: 'CAIXA CONSOLE DO SONHOS!', prize_name: 'cash', valor: 100, new_image: '/imagens/CAIXA CONSOLE DOS SONHOS/100reais.png' },
      { case_name: 'CAIXA CONSOLE DO SONHOS!', prize_name: 'STEAM DECK', valor: 3000, new_image: '/imagens/CAIXA CONSOLE DOS SONHOS/steamdeck.png' },
      { case_name: 'CAIXA CONSOLE DO SONHOS!', prize_name: 'PLAYSTATION 5', valor: 4000, new_image: '/imagens/CAIXA CONSOLE DOS SONHOS/ps5.png' },
      { case_name: 'CAIXA CONSOLE DO SONHOS!', prize_name: 'XBOX SERIES X', valor: 4000, new_image: '/imagens/CAIXA CONSOLE DOS SONHOS/xboxone.webp' },
      
      // CAIXA SAMSUNG
      { case_name: 'CAIXA SAMSUNG', prize_name: 'cash', valor: 1, new_image: '/imagens/CAIXA SAMSUNG/1.png' },
      { case_name: 'CAIXA SAMSUNG', prize_name: 'cash', valor: 2, new_image: '/imagens/CAIXA SAMSUNG/2.png' },
      { case_name: 'CAIXA SAMSUNG', prize_name: 'cash', valor: 5, new_image: '/imagens/CAIXA SAMSUNG/5.png' },
      { case_name: 'CAIXA SAMSUNG', prize_name: 'cash', valor: 10, new_image: '/imagens/CAIXA SAMSUNG/10.png' },
      { case_name: 'CAIXA SAMSUNG', prize_name: 'cash', valor: 100, new_image: '/imagens/CAIXA SAMSUNG/100.png' },
      { case_name: 'CAIXA SAMSUNG', prize_name: 'cash', valor: 500, new_image: '/imagens/CAIXA SAMSUNG/500.webp' },
      { case_name: 'CAIXA SAMSUNG', prize_name: 'FONE SAMSUNG', valor: 1000, new_image: '/imagens/CAIXA SAMSUNG/fone samsung.png' },
      { case_name: 'CAIXA SAMSUNG', prize_name: 'NOTEBOOK SAMSUNG', valor: 3000, new_image: '/imagens/CAIXA SAMSUNG/notebook samsung.png' },
      { case_name: 'CAIXA SAMSUNG', prize_name: 'SAMSUNG S25', valor: 5000, new_image: '/imagens/CAIXA SAMSUNG/s25.png' },
      
      // CAIXA PREMIUM MASTER
      { case_name: 'CAIXA PREMIUM MASTER!', prize_name: 'cash', valor: 2, new_image: '/imagens/CAIXA PREMIUM MASTER/2.png' },
      { case_name: 'CAIXA PREMIUM MASTER!', prize_name: 'cash', valor: 5, new_image: '/imagens/CAIXA PREMIUM MASTER/5.png' },
      { case_name: 'CAIXA PREMIUM MASTER!', prize_name: 'cash', valor: 10, new_image: '/imagens/CAIXA PREMIUM MASTER/10.png' },
      { case_name: 'CAIXA PREMIUM MASTER!', prize_name: 'cash', valor: 20, new_image: '/imagens/CAIXA PREMIUM MASTER/20.png' },
      { case_name: 'CAIXA PREMIUM MASTER!', prize_name: 'cash', valor: 500, new_image: '/imagens/CAIXA PREMIUM MASTER/500.webp' },
      { case_name: 'CAIXA PREMIUM MASTER!', prize_name: 'AIRPODS', valor: 2500, new_image: '/imagens/CAIXA PREMIUM MASTER/airpods.png' },
      { case_name: 'CAIXA PREMIUM MASTER!', prize_name: 'SAMSUNG S25', valor: 5000, new_image: '/imagens/CAIXA PREMIUM MASTER/samsung s25.png' },
      { case_name: 'CAIXA PREMIUM MASTER!', prize_name: 'IPAD', valor: 8000, new_image: '/imagens/CAIXA PREMIUM MASTER/ipad.png' },
      { case_name: 'CAIXA PREMIUM MASTER!', prize_name: 'IPHONE 16 PRO MAX', valor: 10000, new_image: '/imagens/CAIXA PREMIUM MASTER/iphone 16 pro max.png' },
      { case_name: 'CAIXA PREMIUM MASTER!', prize_name: 'MACBOOK', valor: 15000, new_image: '/imagens/CAIXA PREMIUM MASTER/macbook.png' },
      
      // CAIXA WEEKEND
      { case_name: 'CAIXA WEEKEND', prize_name: 'cash', valor: 1, new_image: '/imagens/CAIXA FINAL DE SEMANA/1.png' },
      { case_name: 'CAIXA WEEKEND', prize_name: 'cash', valor: 2, new_image: '/imagens/CAIXA FINAL DE SEMANA/2.png' },
      { case_name: 'CAIXA WEEKEND', prize_name: 'cash', valor: 5, new_image: '/imagens/CAIXA FINAL DE SEMANA/5.png' },
      { case_name: 'CAIXA WEEKEND', prize_name: 'cash', valor: 10, new_image: '/imagens/CAIXA FINAL DE SEMANA/10.png' },
      { case_name: 'CAIXA WEEKEND', prize_name: 'cash', valor: 100, new_image: '/imagens/CAIXA FINAL DE SEMANA/100.png' },
      { case_name: 'CAIXA WEEKEND', prize_name: 'cash', valor: 500, new_image: '/imagens/CAIXA FINAL DE SEMANA/500.webp' }
    ];
    
    let updated = 0;
    let errors = 0;
    
    for (const mapping of imageMappings) {
      try {
        // Buscar o prêmio
        const prize = await prisma.prize.findFirst({
          where: {
            case: {
              nome: mapping.case_name
            },
            nome: mapping.prize_name,
            valor: mapping.valor,
            ativo: true
          }
        });
        
        if (prize) {
          // Atualizar a imagem
          await prisma.prize.update({
            where: { id: prize.id },
            data: {
              imagem_url: mapping.new_image,
              imagem_id: mapping.new_image.split('/').pop()
            }
          });
          
          console.log(`✅ ${mapping.case_name} - ${mapping.prize_name} (R$ ${mapping.valor})`);
          console.log(`   Imagem: ${mapping.new_image}`);
          updated++;
        } else {
          console.log(`⚠️ Prêmio não encontrado: ${mapping.case_name} - ${mapping.prize_name} (R$ ${mapping.valor})`);
        }
      } catch (error) {
        console.log(`❌ Erro ao atualizar ${mapping.case_name} - ${mapping.prize_name}: ${error.message}`);
        errors++;
      }
    }
    
    console.log(`\n📊 RELATÓRIO FINAL:`);
    console.log(`✅ Prêmios atualizados: ${updated}`);
    console.log(`❌ Erros: ${errors}`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixImages();
