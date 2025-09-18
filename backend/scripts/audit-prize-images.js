const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

/**
 * Script de Auditoria de Imagens dos Prêmios
 * Verifica se as imagens dos prêmios estão corretas para cada caixa
 */
class PrizeImageAudit {
  
  async runAudit() {
    console.log('🔍 AUDITORIA DE IMAGENS DOS PRÊMIOS');
    console.log('===================================\n');
    
    const results = {
      total_cases: 0,
      total_prizes: 0,
      correct_images: 0,
      incorrect_images: 0,
      missing_images: 0,
      case_results: []
    };
    
    try {
      // 1. Obter todas as caixas ativas
      const cases = await prisma.case.findMany({
        where: { ativo: true },
        orderBy: { nome: 'asc' }
      });
      
      results.total_cases = cases.length;
      console.log(`📦 Encontradas ${cases.length} caixas ativas\n`);
      
      // 2. Processar cada caixa
      for (const caseData of cases) {
        console.log(`🔍 Auditando caixa: ${caseData.nome}`);
        const caseResult = await this.auditCaseImages(caseData);
        results.case_results.push(caseResult);
        results.total_prizes += caseResult.total_prizes;
        results.correct_images += caseResult.correct_images;
        results.incorrect_images += caseResult.incorrect_images;
        results.missing_images += caseResult.missing_images;
        console.log('');
      }
      
      // 3. Gerar relatório final
      this.generateFinalReport(results);
      
    } catch (error) {
      console.error('❌ Erro durante a auditoria:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  async auditCaseImages(caseData) {
    const caseResult = {
      case_id: caseData.id,
      case_name: caseData.nome,
      total_prizes: 0,
      correct_images: 0,
      incorrect_images: 0,
      missing_images: 0,
      prize_details: []
    };
    
    try {
      // 1. Obter prêmios da caixa
      const prizes = await prisma.prize.findMany({
        where: {
          case_id: caseData.id,
          ativo: true
        }
      });
      
      caseResult.total_prizes = prizes.length;
      console.log(`  📊 ${prizes.length} prêmios encontrados`);
      
      // 2. Obter imagens disponíveis na pasta
      const folderName = this.getFolderName(caseData.nome);
      const imagesPath = path.join(__dirname, '../../../frontend/public/imagens', folderName);
      const availableImages = await this.getAvailableImages(imagesPath);
      
      console.log(`  📁 Pasta: ${folderName}`);
      console.log(`  🖼️ ${availableImages.length} imagens disponíveis:`, availableImages);
      
      // 3. Verificar cada prêmio
      for (const prize of prizes) {
        const prizeResult = await this.auditPrizeImage(prize, availableImages, caseData.nome);
        caseResult.prize_details.push(prizeResult);
        
        if (prizeResult.status === 'correct') {
          caseResult.correct_images++;
        } else if (prizeResult.status === 'incorrect') {
          caseResult.incorrect_images++;
        } else if (prizeResult.status === 'missing') {
          caseResult.missing_images++;
        }
      }
      
      // 4. Resumo da caixa
      console.log(`  ✅ Imagens corretas: ${caseResult.correct_images}`);
      console.log(`  ❌ Imagens incorretas: ${caseResult.incorrect_images}`);
      console.log(`  ⚠️ Imagens faltando: ${caseResult.missing_images}`);
      
    } catch (error) {
      console.error(`❌ Erro ao auditar caixa ${caseData.nome}:`, error);
    }
    
    return caseResult;
  }
  
  async auditPrizeImage(prize, availableImages, caseName) {
    const prizeResult = {
      prize_id: prize.id,
      prize_name: prize.nome,
      prize_value: prize.valor,
      prize_type: prize.tipo,
      current_image: prize.imagem_url,
      expected_image: null,
      status: 'unknown',
      suggestions: []
    };
    
    try {
      // 1. Determinar imagem esperada
      const expectedImage = this.findExpectedImage(prize, availableImages, caseName);
      prizeResult.expected_image = expectedImage;
      
      // 2. Verificar se a imagem atual está correta
      if (!prize.imagem_url) {
        prizeResult.status = 'missing';
        prizeResult.suggestions.push('Prêmio não possui imagem definida');
      } else if (expectedImage && prize.imagem_url === expectedImage) {
        prizeResult.status = 'correct';
      } else {
        prizeResult.status = 'incorrect';
        if (expectedImage) {
          prizeResult.suggestions.push(`Imagem esperada: ${expectedImage}`);
        } else {
          prizeResult.suggestions.push('Nenhuma imagem correspondente encontrada na pasta');
        }
      }
      
      // 3. Log do resultado
      const statusIcon = prizeResult.status === 'correct' ? '✅' : 
                        prizeResult.status === 'incorrect' ? '❌' : '⚠️';
      console.log(`    ${statusIcon} ${prize.nome} (R$ ${prize.valor})`);
      if (prizeResult.status !== 'correct') {
        console.log(`      Atual: ${prize.imagem_url || 'Nenhuma'}`);
        console.log(`      Esperada: ${expectedImage || 'Nenhuma'}`);
        prizeResult.suggestions.forEach(suggestion => {
          console.log(`      💡 ${suggestion}`);
        });
      }
      
    } catch (error) {
      console.error(`❌ Erro ao auditar prêmio ${prize.nome}:`, error);
      prizeResult.status = 'error';
      prizeResult.suggestions.push(`Erro: ${error.message}`);
    }
    
    return prizeResult;
  }
  
  findExpectedImage(prize, availableImages, caseName) {
    if (!availableImages || availableImages.length === 0) {
      return null;
    }
    
    const prizeName = prize.nome.toLowerCase();
    const prizeValue = prize.valor;
    
    // 1. Buscar por nome exato do prêmio
    let image = availableImages.find(img => 
      img.toLowerCase().includes(prizeName.toLowerCase())
    );
    
    if (image) {
      return `/imagens/${this.getFolderName(caseName)}/${image}`;
    }
    
    // 2. Buscar por padrões específicos de produtos
    const productPatterns = {
      'iphone 16 pro max': ['iphone', '16', 'pro', 'max'],
      'macbook': ['macbook'],
      'airpods': ['air', 'pods'],
      'steam deck': ['steam', 'deck'],
      'playstation 5': ['ps5', 'playstation'],
      'xbox series x': ['xbox', 'series'],
      'boné nike': ['boné', 'nike'],
      'camisa nike': ['camisa', 'nike'],
      'nike dunk': ['dunk', 'nike'],
      'air force 1': ['air', 'force'],
      'air jordan': ['jordan', 'air'],
      'fone samsung': ['fone', 'samsung'],
      'notebook samsung': ['notebook', 'samsung'],
      'samsung s25': ['s25', 'samsung'],
      'ipad': ['ipad']
    };
    
    const patterns = productPatterns[prizeName.toLowerCase()];
    if (patterns) {
      for (const pattern of patterns) {
        image = availableImages.find(img => 
          img.toLowerCase().includes(pattern.toLowerCase())
        );
        if (image) {
          return `/imagens/${this.getFolderName(caseName)}/${image}`;
        }
      }
    }
    
    // 3. Buscar por valor (para cash)
    if (prize.tipo === 'cash') {
      const valuePatterns = [
        `${prizeValue}.png`,
        `${prizeValue}.webp`,
        `${prizeValue}.jpg`,
        `${prizeValue}reais.png`,
        `${prizeValue}reais.webp`,
        `${Math.round(prizeValue * 100)}.png`,
        `${Math.round(prizeValue * 100)}.webp`,
        `${prizeValue}00.png`,
        `${prizeValue}00.webp`
      ];
      
      for (const pattern of valuePatterns) {
        image = availableImages.find(img => 
          img.toLowerCase() === pattern.toLowerCase()
        );
        if (image) {
          return `/imagens/${this.getFolderName(caseName)}/${image}`;
        }
      }
    }
    
    // 4. Buscar por padrões parciais
    const partialPatterns = [
      prizeName.split(' ')[0], // Primeira palavra
      prizeName.replace(/\s+/g, ''), // Sem espaços
      prizeName.replace(/\s+/g, '-'), // Com hífens
      prizeName.replace(/\s+/g, '_') // Com underscores
    ];
    
    for (const pattern of partialPatterns) {
      image = availableImages.find(img => 
        img.toLowerCase().includes(pattern.toLowerCase())
      );
      if (image) {
        return `/imagens/${this.getFolderName(caseName)}/${image}`;
      }
    }
    
    return null;
  }
  
  getFolderName(caseName) {
    const folderMapping = {
      'CAIXA WEEKEND': 'CAIXA FINAL DE SEMANA',
      'CAIXA CONSOLE DO SONHOS!': 'CAIXA CONSOLE DOS SONHOS',
      'CAIXA PREMIUM MASTER!': 'CAIXA PREMIUM MASTER'
    };
    
    return folderMapping[caseName] || caseName.toUpperCase();
  }
  
  async getAvailableImages(imagesPath) {
    try {
      const files = await fs.readdir(imagesPath);
      return files.filter(file => 
        /\.(png|jpg|jpeg|webp|gif)$/i.test(file)
      );
    } catch (error) {
      console.warn(`⚠️ Pasta de imagens não encontrada: ${imagesPath}`);
      return [];
    }
  }
  
  generateFinalReport(results) {
    console.log('\n📊 RELATÓRIO FINAL DA AUDITORIA');
    console.log('================================');
    console.log(`📦 Total de caixas: ${results.total_cases}`);
    console.log(`🎁 Total de prêmios: ${results.total_prizes}`);
    console.log(`✅ Imagens corretas: ${results.correct_images}`);
    console.log(`❌ Imagens incorretas: ${results.incorrect_images}`);
    console.log(`⚠️ Imagens faltando: ${results.missing_images}`);
    
    const correctPercentage = results.total_prizes > 0 
      ? ((results.correct_images / results.total_prizes) * 100).toFixed(1)
      : 0;
    
    console.log(`📈 Taxa de acerto: ${correctPercentage}%`);
    
    if (results.incorrect_images > 0 || results.missing_images > 0) {
      console.log('\n🔧 CORREÇÕES NECESSÁRIAS:');
      console.log('==========================');
      
      results.case_results.forEach(caseResult => {
        if (caseResult.incorrect_images > 0 || caseResult.missing_images > 0) {
          console.log(`\n📦 ${caseResult.case_name}:`);
          
          caseResult.prize_details.forEach(prize => {
            if (prize.status !== 'correct') {
              console.log(`  ${prize.status === 'incorrect' ? '❌' : '⚠️'} ${prize.prize_name} (R$ ${prize.prize_value})`);
              console.log(`    Atual: ${prize.current_image || 'Nenhuma'}`);
              console.log(`    Esperada: ${prize.expected_image || 'Nenhuma'}`);
              prize.suggestions.forEach(suggestion => {
                console.log(`    💡 ${suggestion}`);
              });
            }
          });
        }
      });
    } else {
      console.log('\n🎉 TODAS AS IMAGENS ESTÃO CORRETAS!');
    }
    
    // Salvar relatório
    const reportPath = path.join(__dirname, '..', 'logs', 'prize-image-audit.json');
    fs.writeFile(reportPath, JSON.stringify(results, null, 2))
      .then(() => console.log(`\n📄 Relatório salvo em: ${reportPath}`))
      .catch(err => console.log(`⚠️ Erro ao salvar relatório: ${err.message}`));
  }
}

// Executar auditoria
if (require.main === module) {
  const audit = new PrizeImageAudit();
  audit.runAudit().catch(console.error);
}

module.exports = PrizeImageAudit;
