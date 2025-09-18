const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

/**
 * Script para corrigir as imagens dos prêmios
 * Mapeia corretamente as imagens baseado nas pastas disponíveis
 */
class PrizeImageFixer {
  
  // Mapeamento correto das imagens por caixa
  static IMAGE_MAPPING = {
    'CAIXA KIT NIKE': {
      'cash_1': '1.png',
      'cash_2': '2.png', 
      'cash_5': '5.png',
      'cash_10': '10.png',
      'BONÉ NIKE': 'boné nike.png',
      'CAMISA NIKE': 'camisa nike.webp',
      'NIKE DUNK': 'nike dunk.webp',
      'AIR FORCE 1': 'airforce.webp',
      'AIR JORDAN': 'jordan.png'
    },
    'CAIXA APPLE': {
      'cash_1': '1.png',
      'cash_2': '2.png',
      'cash_5': '5.png', 
      'cash_10': '10.png',
      'cash_500': '500.webp',
      'IPHONE 16 PRO MAX': 'iphone 16 pro max.png',
      'MACBOOK': 'macbook.png',
      'AIRPODS': 'air pods.png'
    },
    'CAIXA CONSOLE DOS SONHOS': {
      'cash_1': '1real.png',
      'cash_2': '2reais.png',
      'cash_5': '5reais.png',
      'cash_10': '10reais.png',
      'cash_100': '100reais.png',
      'STEAM DECK': 'steamdeck.png',
      'PLAYSTATION 5': 'ps5.png',
      'XBOX SERIES X': 'xboxone.webp'
    },
    'CAIXA SAMSUNG': {
      'cash_1': '1.png',
      'cash_2': '2.png',
      'cash_5': '5.png',
      'cash_10': '10.png',
      'cash_100': '100.png',
      'cash_500': '500.webp',
      'FONE SAMSUNG': 'fone samsung.png',
      'NOTEBOOK SAMSUNG': 'notebook samsung.png',
      'SAMSUNG S25': 's25.png'
    },
    'CAIXA PREMIUM MASTER': {
      'cash_2': '2.png',
      'cash_5': '5.png',
      'cash_10': '10.png',
      'cash_20': '20.png',
      'cash_500': '500.webp',
      'AIRPODS': 'airpods.png',
      'SAMSUNG S25': 'samsung s25.png',
      'IPAD': 'ipad.png',
      'IPHONE 16 PRO MAX': 'iphone 16 pro max.png',
      'MACBOOK': 'macbook.png'
    },
    'CAIXA FINAL DE SEMANA': {
      'cash_1': '1.png',
      'cash_2': '2.png',
      'cash_5': '5.png',
      'cash_10': '10.png',
      'cash_100': '100.png',
      'cash_500': '500.webp'
    }
  };
  
  async fixAllImages() {
    console.log('🔧 CORRIGINDO IMAGENS DOS PRÊMIOS');
    console.log('==================================\n');
    
    const results = {
      total_updated: 0,
      total_errors: 0,
      case_results: []
    };
    
    try {
      // 1. Obter todas as caixas ativas
      const cases = await prisma.case.findMany({
        where: { ativo: true },
        orderBy: { nome: 'asc' }
      });
      
      console.log(`📦 Encontradas ${cases.length} caixas ativas\n`);
      
      // 2. Processar cada caixa
      for (const caseData of cases) {
        console.log(`🔍 Corrigindo caixa: ${caseData.nome}`);
        const caseResult = await this.fixCaseImages(caseData);
        results.case_results.push(caseResult);
        results.total_updated += caseResult.updated;
        results.total_errors += caseResult.errors;
        console.log('');
      }
      
      // 3. Relatório final
      console.log('📊 RELATÓRIO FINAL');
      console.log('==================');
      console.log(`✅ Prêmios atualizados: ${results.total_updated}`);
      console.log(`❌ Erros: ${results.total_errors}`);
      
    } catch (error) {
      console.error('❌ Erro durante a correção:', error);
    } finally {
      await prisma.$disconnect();
    }
  }
  
  async fixCaseImages(caseData) {
    const caseResult = {
      case_name: caseData.nome,
      updated: 0,
      errors: 0,
      details: []
    };
    
    try {
      // 1. Obter prêmios da caixa
      const prizes = await prisma.prize.findMany({
        where: {
          case_id: caseData.id,
          ativo: true
        }
      });
      
      console.log(`  📊 ${prizes.length} prêmios encontrados`);
      
      // 2. Obter mapeamento de imagens para esta caixa
      const folderName = this.getFolderName(caseData.nome);
      const imageMapping = PrizeImageFixer.IMAGE_MAPPING[folderName];
      
      if (!imageMapping) {
        console.log(`  ⚠️ Nenhum mapeamento encontrado para ${folderName}`);
        return caseResult;
      }
      
      console.log(`  📁 Pasta: ${folderName}`);
      
      // 3. Corrigir cada prêmio
      for (const prize of prizes) {
        try {
          const newImageUrl = this.getCorrectImageUrl(prize, imageMapping, folderName);
          
          if (newImageUrl && newImageUrl !== prize.imagem_url) {
            await prisma.prize.update({
              where: { id: prize.id },
              data: {
                imagem_url: newImageUrl,
                imagem_id: path.basename(newImageUrl)
              }
            });
            
            console.log(`    ✅ ${prize.nome} (R$ ${prize.valor})`);
            console.log(`      Antes: ${prize.imagem_url || 'Nenhuma'}`);
            console.log(`      Depois: ${newImageUrl}`);
            
            caseResult.updated++;
            caseResult.details.push({
              prize_name: prize.nome,
              old_image: prize.imagem_url,
              new_image: newImageUrl
            });
          } else if (newImageUrl === prize.imagem_url) {
            console.log(`    ✅ ${prize.nome} (R$ ${prize.valor}) - Já correto`);
          } else {
            console.log(`    ⚠️ ${prize.nome} (R$ ${prize.valor}) - Nenhuma imagem correspondente`);
          }
          
        } catch (error) {
          console.log(`    ❌ Erro ao corrigir ${prize.nome}: ${error.message}`);
          caseResult.errors++;
        }
      }
      
    } catch (error) {
      console.error(`❌ Erro ao processar caixa ${caseData.nome}:`, error);
      caseResult.errors++;
    }
    
    return caseResult;
  }
  
  getCorrectImageUrl(prize, imageMapping, folderName) {
    const prizeName = prize.nome.toLowerCase();
    const prizeValue = prize.valor;
    
    // 1. Buscar por nome exato
    const exactMatch = imageMapping[prizeName.toUpperCase()];
    if (exactMatch) {
      return `/imagens/${folderName}/${exactMatch}`;
    }
    
    // 2. Buscar por padrões específicos
    const productPatterns = {
      'iphone 16 pro max': 'IPHONE 16 PRO MAX',
      'macbook': 'MACBOOK',
      'airpods': 'AIRPODS',
      'steam deck': 'STEAM DECK',
      'playstation 5': 'PLAYSTATION 5',
      'xbox series x': 'XBOX SERIES X',
      'boné nike': 'BONÉ NIKE',
      'camisa nike': 'CAMISA NIKE',
      'nike dunk': 'NIKE DUNK',
      'air force 1': 'AIR FORCE 1',
      'air jordan': 'AIR JORDAN',
      'fone samsung': 'FONE SAMSUNG',
      'notebook samsung': 'NOTEBOOK SAMSUNG',
      'samsung s25': 'SAMSUNG S25',
      'ipad': 'IPAD'
    };
    
    for (const [pattern, key] of Object.entries(productPatterns)) {
      if (prizeName.includes(pattern) && imageMapping[key]) {
        return `/imagens/${folderName}/${imageMapping[key]}`;
      }
    }
    
    // 3. Buscar por valor (para cash)
    if (prize.tipo === 'cash') {
      const cashKey = `cash_${prizeValue}`;
      if (imageMapping[cashKey]) {
        return `/imagens/${folderName}/${imageMapping[cashKey]}`;
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
}

// Executar correção
if (require.main === module) {
  const fixer = new PrizeImageFixer();
  fixer.fixAllImages().catch(console.error);
}

module.exports = PrizeImageFixer;
