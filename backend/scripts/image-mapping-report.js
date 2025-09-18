const fs = require('fs').promises;
const path = require('path');

/**
 * Relatório de Mapeamento de Imagens
 * Analisa as pastas de imagens e gera um relatório de correções necessárias
 */
class ImageMappingReport {
  
  async generateReport() {
    console.log('🔍 RELATÓRIO DE MAPEAMENTO DE IMAGENS');
    console.log('=====================================\n');
    
    const results = {
      total_cases: 0,
      total_prizes: 0,
      correct_mappings: 0,
      incorrect_mappings: 0,
      missing_images: 0,
      case_results: []
    };
    
    try {
      // 1. Definir mapeamento esperado
      const expectedMappings = this.getExpectedMappings();
      
      // 2. Verificar cada caixa
      for (const [caseName, prizes] of Object.entries(expectedMappings)) {
        console.log(`📦 Analisando caixa: ${caseName}`);
        const caseResult = await this.analyzeCase(caseName, prizes);
        results.case_results.push(caseResult);
        results.total_cases++;
        results.total_prizes += caseResult.total_prizes;
        results.correct_mappings += caseResult.correct_mappings;
        results.incorrect_mappings += caseResult.incorrect_mappings;
        results.missing_images += caseResult.missing_images;
        console.log('');
      }
      
      // 3. Gerar relatório final
      this.generateFinalReport(results);
      
    } catch (error) {
      console.error('❌ Erro durante a análise:', error);
    }
  }
  
  getExpectedMappings() {
    return {
      'CAIXA KIT NIKE': [
        { name: 'cash', value: 1, expected_image: '1.png' },
        { name: 'cash', value: 2, expected_image: '2.png' },
        { name: 'cash', value: 5, expected_image: '5.png' },
        { name: 'cash', value: 10, expected_image: '10.png' },
        { name: 'BONÉ NIKE', value: 50, expected_image: 'boné nike.png' },
        { name: 'CAMISA NIKE', value: 100, expected_image: 'camisa nike.webp' },
        { name: 'NIKE DUNK', value: 1000, expected_image: 'nike dunk.webp' },
        { name: 'AIR FORCE 1', value: 700, expected_image: 'airforce.webp' },
        { name: 'AIR JORDAN', value: 1500, expected_image: 'jordan.png' }
      ],
      'CAIXA APPLE': [
        { name: 'cash', value: 1, expected_image: '1.png' },
        { name: 'cash', value: 2, expected_image: '2.png' },
        { name: 'cash', value: 5, expected_image: '5.png' },
        { name: 'cash', value: 10, expected_image: '10.png' },
        { name: 'cash', value: 500, expected_image: '500.webp' },
        { name: 'IPHONE 16 PRO MAX', value: 10000, expected_image: 'iphone 16 pro max.png' },
        { name: 'MACBOOK', value: 15000, expected_image: 'macbook.png' },
        { name: 'AIRPODS', value: 2500, expected_image: 'air pods.png' }
      ],
      'CAIXA CONSOLE DOS SONHOS': [
        { name: 'cash', value: 1, expected_image: '1real.png' },
        { name: 'cash', value: 2, expected_image: '2reais.png' },
        { name: 'cash', value: 5, expected_image: '5reais.png' },
        { name: 'cash', value: 10, expected_image: '10reais.png' },
        { name: 'cash', value: 100, expected_image: '100reais.png' },
        { name: 'STEAM DECK', value: 3000, expected_image: 'steamdeck.png' },
        { name: 'PLAYSTATION 5', value: 4000, expected_image: 'ps5.png' },
        { name: 'XBOX SERIES X', value: 4000, expected_image: 'xboxone.webp' }
      ],
      'CAIXA SAMSUNG': [
        { name: 'cash', value: 1, expected_image: '1.png' },
        { name: 'cash', value: 2, expected_image: '2.png' },
        { name: 'cash', value: 5, expected_image: '5.png' },
        { name: 'cash', value: 10, expected_image: '10.png' },
        { name: 'cash', value: 100, expected_image: '100.png' },
        { name: 'cash', value: 500, expected_image: '500.webp' },
        { name: 'FONE SAMSUNG', value: 1000, expected_image: 'fone samsung.png' },
        { name: 'NOTEBOOK SAMSUNG', value: 3000, expected_image: 'notebook samsung.png' },
        { name: 'SAMSUNG S25', value: 5000, expected_image: 's25.png' }
      ],
      'CAIXA PREMIUM MASTER': [
        { name: 'cash', value: 2, expected_image: '2.png' },
        { name: 'cash', value: 5, expected_image: '5.png' },
        { name: 'cash', value: 10, expected_image: '10.png' },
        { name: 'cash', value: 20, expected_image: '20.png' },
        { name: 'cash', value: 500, expected_image: '500.webp' },
        { name: 'AIRPODS', value: 2500, expected_image: 'airpods.png' },
        { name: 'SAMSUNG S25', value: 5000, expected_image: 'samsung s25.png' },
        { name: 'IPAD', value: 8000, expected_image: 'ipad.png' },
        { name: 'IPHONE 16 PRO MAX', value: 10000, expected_image: 'iphone 16 pro max.png' },
        { name: 'MACBOOK', value: 15000, expected_image: 'macbook.png' }
      ],
      'CAIXA FINAL DE SEMANA': [
        { name: 'cash', value: 1, expected_image: '1.png' },
        { name: 'cash', value: 2, expected_image: '2.png' },
        { name: 'cash', value: 5, expected_image: '5.png' },
        { name: 'cash', value: 10, expected_image: '10.png' },
        { name: 'cash', value: 100, expected_image: '100.png' },
        { name: 'cash', value: 500, expected_image: '500.webp' }
      ]
    };
  }
  
  async analyzeCase(caseName, expectedPrizes) {
    const caseResult = {
      case_name: caseName,
      total_prizes: expectedPrizes.length,
      correct_mappings: 0,
      incorrect_mappings: 0,
      missing_images: 0,
      prize_details: []
    };
    
    try {
      // 1. Obter pasta de imagens
      const folderName = this.getFolderName(caseName);
      const imagesPath = path.join(__dirname, '../../frontend/public/imagens', folderName);
      
      console.log(`  📁 Pasta: ${folderName}`);
      
      // 2. Verificar se a pasta existe
      let availableImages = [];
      try {
        const files = await fs.readdir(imagesPath);
        availableImages = files.filter(file => 
          /\.(png|jpg|jpeg|webp|gif)$/i.test(file)
        );
        console.log(`  🖼️ ${availableImages.length} imagens disponíveis:`, availableImages);
      } catch (error) {
        console.log(`  ❌ Pasta não encontrada: ${imagesPath}`);
        caseResult.missing_images = expectedPrizes.length;
        return caseResult;
      }
      
      // 3. Verificar cada prêmio
      for (const prize of expectedPrizes) {
        const prizeResult = this.analyzePrize(prize, availableImages, folderName);
        caseResult.prize_details.push(prizeResult);
        
        if (prizeResult.status === 'correct') {
          caseResult.correct_mappings++;
        } else if (prizeResult.status === 'incorrect') {
          caseResult.incorrect_mappings++;
        } else if (prizeResult.status === 'missing') {
          caseResult.missing_images++;
        }
      }
      
      // 4. Resumo da caixa
      console.log(`  ✅ Mapeamentos corretos: ${caseResult.correct_mappings}`);
      console.log(`  ❌ Mapeamentos incorretos: ${caseResult.incorrect_mappings}`);
      console.log(`  ⚠️ Imagens faltando: ${caseResult.missing_images}`);
      
    } catch (error) {
      console.error(`❌ Erro ao analisar caixa ${caseName}:`, error);
    }
    
    return caseResult;
  }
  
  analyzePrize(prize, availableImages, folderName) {
    const prizeResult = {
      prize_name: prize.name,
      prize_value: prize.value,
      expected_image: prize.expected_image,
      status: 'unknown',
      suggestions: []
    };
    
    try {
      // Verificar se a imagem esperada existe
      const imageExists = availableImages.includes(prize.expected_image);
      
      if (imageExists) {
        prizeResult.status = 'correct';
        console.log(`    ✅ ${prize.name} (R$ ${prize.value}) - ${prize.expected_image}`);
      } else {
        prizeResult.status = 'missing';
        prizeResult.suggestions.push(`Imagem esperada não encontrada: ${prize.expected_image}`);
        console.log(`    ❌ ${prize.name} (R$ ${prize.value}) - ${prize.expected_image} (NÃO ENCONTRADA)`);
      }
      
    } catch (error) {
      prizeResult.status = 'error';
      prizeResult.suggestions.push(`Erro: ${error.message}`);
    }
    
    return prizeResult;
  }
  
  getFolderName(caseName) {
    const folderMapping = {
      'CAIXA WEEKEND': 'CAIXA FINAL DE SEMANA',
      'CAIXA CONSOLE DO SONHOS!': 'CAIXA CONSOLE DOS SONHOS',
      'CAIXA PREMIUM MASTER!': 'CAIXA PREMIUM MASTER'
    };
    
    return folderMapping[caseName] || caseName.toUpperCase();
  }
  
  generateFinalReport(results) {
    console.log('\n📊 RELATÓRIO FINAL');
    console.log('==================');
    console.log(`📦 Total de caixas: ${results.total_cases}`);
    console.log(`🎁 Total de prêmios: ${results.total_prizes}`);
    console.log(`✅ Mapeamentos corretos: ${results.correct_mappings}`);
    console.log(`❌ Mapeamentos incorretos: ${results.incorrect_mappings}`);
    console.log(`⚠️ Imagens faltando: ${results.missing_images}`);
    
    const correctPercentage = results.total_prizes > 0 
      ? ((results.correct_mappings / results.total_prizes) * 100).toFixed(1)
      : 0;
    
    console.log(`📈 Taxa de acerto: ${correctPercentage}%`);
    
    if (results.incorrect_mappings > 0 || results.missing_images > 0) {
      console.log('\n🔧 CORREÇÕES NECESSÁRIAS:');
      console.log('==========================');
      
      results.case_results.forEach(caseResult => {
        if (caseResult.incorrect_mappings > 0 || caseResult.missing_images > 0) {
          console.log(`\n📦 ${caseResult.case_name}:`);
          
          caseResult.prize_details.forEach(prize => {
            if (prize.status !== 'correct') {
              console.log(`  ${prize.status === 'incorrect' ? '❌' : '⚠️'} ${prize.prize_name} (R$ ${prize.prize_value})`);
              console.log(`    Esperada: ${prize.expected_image}`);
              prize.suggestions.forEach(suggestion => {
                console.log(`    💡 ${suggestion}`);
              });
            }
          });
        }
      });
    } else {
      console.log('\n🎉 TODOS OS MAPEAMENTOS ESTÃO CORRETOS!');
    }
    
    // Salvar relatório
    const reportPath = path.join(__dirname, '..', 'logs', 'image-mapping-report.json');
    fs.writeFile(reportPath, JSON.stringify(results, null, 2))
      .then(() => console.log(`\n📄 Relatório salvo em: ${reportPath}`))
      .catch(err => console.log(`⚠️ Erro ao salvar relatório: ${err.message}`));
  }
}

// Executar relatório
if (require.main === module) {
  const report = new ImageMappingReport();
  report.generateReport().catch(console.error);
}

module.exports = ImageMappingReport;
