const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Script para corrigir as imagens dos prêmios no banco de dados
 * Baseado no mapeamento correto identificado
 */
class DatabaseImageFixer {
  
  // Mapeamento correto das imagens por caixa
  static IMAGE_MAPPINGS = [
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
  
  async fixAllImages() {
    console.log('🔧 CORRIGINDO IMAGENS DOS PRÊMIOS NO BANCO DE DADOS');
    console.log('==================================================\n');
    
    const results = {
      total_processed: 0,
      total_updated: 0,
      total_errors: 0,
      total_not_found: 0,
      details: []
    };
    
    try {
      // Testar conexão com banco
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Conexão com banco de dados estabelecida\n');
      
      // Processar cada mapeamento
      for (const mapping of DatabaseImageFixer.IMAGE_MAPPINGS) {
        results.total_processed++;
        
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
            // Verificar se a imagem precisa ser atualizada
            if (prize.imagem_url !== mapping.new_image) {
              await prisma.prize.update({
                where: { id: prize.id },
                data: {
                  imagem_url: mapping.new_image,
                  imagem_id: mapping.new_image.split('/').pop()
                }
              });
              
              console.log(`✅ ${mapping.case_name} - ${mapping.prize_name} (R$ ${mapping.valor})`);
              console.log(`   Antes: ${prize.imagem_url || 'Nenhuma'}`);
              console.log(`   Depois: ${mapping.new_image}`);
              results.total_updated++;
            } else {
              console.log(`✅ ${mapping.case_name} - ${mapping.prize_name} (R$ ${mapping.valor}) - Já correto`);
            }
            
            results.details.push({
              case_name: mapping.case_name,
              prize_name: mapping.prize_name,
              prize_value: mapping.valor,
              status: 'updated',
              old_image: prize.imagem_url,
              new_image: mapping.new_image
            });
          } else {
            console.log(`⚠️ Prêmio não encontrado: ${mapping.case_name} - ${mapping.prize_name} (R$ ${mapping.valor})`);
            results.total_not_found++;
            results.details.push({
              case_name: mapping.case_name,
              prize_name: mapping.prize_name,
              prize_value: mapping.valor,
              status: 'not_found',
              old_image: null,
              new_image: mapping.new_image
            });
          }
        } catch (error) {
          console.log(`❌ Erro ao processar ${mapping.case_name} - ${mapping.prize_name}: ${error.message}`);
          results.total_errors++;
          results.details.push({
            case_name: mapping.case_name,
            prize_name: mapping.prize_name,
            prize_value: mapping.valor,
            status: 'error',
            error: error.message,
            old_image: null,
            new_image: mapping.new_image
          });
        }
      }
      
      // Relatório final
      console.log(`\n📊 RELATÓRIO FINAL:`);
      console.log(`📦 Total processado: ${results.total_processed}`);
      console.log(`✅ Prêmios atualizados: ${results.total_updated}`);
      console.log(`⚠️ Prêmios não encontrados: ${results.total_not_found}`);
      console.log(`❌ Erros: ${results.total_errors}`);
      
      if (results.total_updated > 0) {
        console.log('\n🎉 CORREÇÕES APLICADAS COM SUCESSO!');
        console.log('As imagens dos prêmios foram corrigidas no banco de dados.');
      } else if (results.total_not_found > 0) {
        console.log('\n⚠️ ALGUNS PRÊMIOS NÃO FORAM ENCONTRADOS');
        console.log('Verifique se os prêmios existem no banco de dados.');
      } else {
        console.log('\n✅ TODAS AS IMAGENS JÁ ESTÃO CORRETAS!');
      }
      
    } catch (error) {
      console.error('❌ Erro geral:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
}

// Executar correção
if (require.main === module) {
  const fixer = new DatabaseImageFixer();
  fixer.fixAllImages().catch(console.error);
}

module.exports = DatabaseImageFixer;
