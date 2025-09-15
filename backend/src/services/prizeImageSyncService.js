/**
 * Serviço de Sincronização de Prêmios e Imagens
 * Sincroniza pasta de imagens com banco de dados
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

class PrizeImageSyncService {
  
  constructor() {
    this.imagesPath = path.join(__dirname, '../../../frontend/public/imagens');
    this.syncReport = {
      timestamp: new Date().toISOString(),
      casesProcessed: 0,
      prizesProcessed: 0,
      imagesFound: 0,
      imagesMissing: 0,
      prizesWithoutImages: 0,
      inconsistencies: [],
      actions: []
    };
  }

  /**
   * Executar sincronização completa
   */
  async syncAll() {
    console.log('🔄 Iniciando sincronização de prêmios e imagens...');
    
    try {
      // 1. Mapear estrutura de pastas
      const folderStructure = await this.mapFolderStructure();
      
      // 2. Sincronizar caixas
      await this.syncCases(folderStructure);
      
      // 3. Sincronizar prêmios
      await this.syncPrizes(folderStructure);
      
      // 4. Validar consistência
      await this.validateConsistency();
      
      // 5. Gerar relatório
      this.generateReport();
      
      console.log('✅ Sincronização concluída com sucesso!');
      return this.syncReport;
      
    } catch (error) {
      console.error('❌ Erro durante sincronização:', error);
      throw error;
    }
  }

  /**
   * Mapear estrutura de pastas de imagens
   */
  async mapFolderStructure() {
    console.log('📁 Mapeando estrutura de pastas...');
    
    const structure = {};
    
    if (!fs.existsSync(this.imagesPath)) {
      throw new Error(`Diretório de imagens não encontrado: ${this.imagesPath}`);
    }
    
    const items = fs.readdirSync(this.imagesPath);
    
    for (const item of items) {
      const itemPath = path.join(this.imagesPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && item.startsWith('CAIXA ')) {
        // É uma pasta de caixa
        const caseName = item.replace('CAIXA ', '');
        structure[caseName] = {
          type: 'case',
          path: itemPath,
          images: []
        };
        
        // Mapear imagens da caixa
        const images = fs.readdirSync(itemPath);
        for (const image of images) {
          if (this.isImageFile(image)) {
            structure[caseName].images.push({
              filename: image,
              path: path.join(itemPath, image),
              size: fs.statSync(path.join(itemPath, image)).size
            });
          }
        }
        
        this.syncReport.imagesFound += structure[caseName].images.length;
      }
    }
    
    console.log(`📊 Estrutura mapeada: ${Object.keys(structure).length} caixas encontradas`);
    return structure;
  }

  /**
   * Sincronizar caixas
   */
  async syncCases(folderStructure) {
    console.log('📦 Sincronizando caixas...');
    
    for (const [caseName, caseData] of Object.entries(folderStructure)) {
      if (caseData.type !== 'case') continue;
      
      try {
        // Buscar caixa no banco
        let existingCase = await prisma.case.findFirst({
          where: { nome: { contains: caseName, mode: 'insensitive' } }
        });
        
        if (!existingCase) {
          // Criar nova caixa
          const newCase = await prisma.case.create({
            data: {
              nome: caseName,
              descricao: `Caixa ${caseName}`,
              preco: this.estimateCasePrice(caseName),
              ativo: true
            }
          });
          
          this.syncReport.actions.push(`Criada nova caixa: ${caseName}`);
          existingCase = newCase;
        }
        
        // Atualizar imagem da caixa se existir
        const caseImage = this.findCaseImage(caseName);
        if (caseImage && !existingCase.imagem) {
          await prisma.case.update({
            where: { id: existingCase.id },
            data: { imagem: caseImage }
          });
          
          this.syncReport.actions.push(`Atualizada imagem da caixa: ${caseName}`);
        }
        
        this.syncReport.casesProcessed++;
        
      } catch (error) {
        console.error(`Erro ao sincronizar caixa ${caseName}:`, error);
        this.syncReport.inconsistencies.push({
          type: 'case_sync_error',
          case: caseName,
          error: error.message
        });
      }
    }
  }

  /**
   * Sincronizar prêmios
   */
  async syncPrizes(folderStructure) {
    console.log('🎁 Sincronizando prêmios...');
    
    for (const [caseName, caseData] of Object.entries(folderStructure)) {
      if (caseData.type !== 'case') continue;
      
      try {
        // Buscar caixa no banco
        const existingCase = await prisma.case.findFirst({
          where: { nome: { contains: caseName, mode: 'insensitive' } }
        });
        
        if (!existingCase) {
          this.syncReport.inconsistencies.push({
            type: 'case_not_found',
            case: caseName,
            message: 'Caixa não encontrada no banco para sincronizar prêmios'
          });
          continue;
        }
        
        // Processar imagens da caixa
        for (const image of caseData.images) {
          await this.syncPrizeFromImage(existingCase, image, caseName);
        }
        
      } catch (error) {
        console.error(`Erro ao sincronizar prêmios da caixa ${caseName}:`, error);
        this.syncReport.inconsistencies.push({
          type: 'prize_sync_error',
          case: caseName,
          error: error.message
        });
      }
    }
  }

  /**
   * Sincronizar prêmio a partir de imagem
   */
  async syncPrizeFromImage(caseData, image, caseName) {
    try {
      const prizeName = this.extractPrizeName(image.filename);
      const prizeValue = this.extractPrizeValue(image.filename, caseName);
      const prizeType = this.determinePrizeType(image.filename, prizeValue);
      
      // Buscar prêmio existente
      let existingPrize = await prisma.prize.findFirst({
        where: {
          case_id: caseData.id,
          nome: { contains: prizeName, mode: 'insensitive' }
        }
      });
      
      if (!existingPrize) {
        // Criar novo prêmio
        const newPrize = await prisma.prize.create({
          data: {
            case_id: caseData.id,
            nome: prizeName,
            descricao: `Prêmio ${prizeName}`,
            valor: prizeValue,
            probabilidade: this.calculateProbability(prizeValue, caseName),
            imagem: image.filename,
            ativo: true
          }
        });
        
        this.syncReport.actions.push(`Criado novo prêmio: ${prizeName} (R$ ${prizeValue})`);
        existingPrize = newPrize;
      } else {
        // Atualizar prêmio existente se necessário
        const updates = {};
        
        if (!existingPrize.imagem) {
          updates.imagem = image.filename;
        }
        
        if (existingPrize.valor !== prizeValue) {
          updates.valor = prizeValue;
          this.syncReport.inconsistencies.push({
            type: 'value_mismatch',
            prize: prizeName,
            dbValue: existingPrize.valor,
            fileValue: prizeValue
          });
        }
        
        if (Object.keys(updates).length > 0) {
          await prisma.prize.update({
            where: { id: existingPrize.id },
            data: updates
          });
          
          this.syncReport.actions.push(`Atualizado prêmio: ${prizeName}`);
        }
      }
      
      this.syncReport.prizesProcessed++;
      
    } catch (error) {
      console.error(`Erro ao sincronizar prêmio ${image.filename}:`, error);
      this.syncReport.inconsistencies.push({
        type: 'prize_creation_error',
        image: image.filename,
        error: error.message
      });
    }
  }

  /**
   * Validar consistência
   */
  async validateConsistency() {
    console.log('🔍 Validando consistência...');
    
    // 1. Verificar prêmios sem imagens
    const prizesWithoutImages = await prisma.prize.findMany({
      where: {
        ativo: true,
        imagem: null
      },
      include: { case: true }
    });
    
    this.syncReport.prizesWithoutImages = prizesWithoutImages.length;
    
    for (const prize of prizesWithoutImages) {
      this.syncReport.inconsistencies.push({
        type: 'prize_without_image',
        prize: prize.nome,
        case: prize.case.nome,
        message: 'Prêmio ativo sem imagem'
      });
    }
    
    // 2. Verificar imagens órfãs (imagens sem prêmios correspondentes)
    const allPrizes = await prisma.prize.findMany({
      where: { ativo: true },
      select: { imagem: true }
    });
    
    const usedImages = new Set(allPrizes.map(p => p.imagem).filter(Boolean));
    
    // Verificar todas as imagens nas pastas
    for (const [caseName, caseData] of Object.entries(await this.mapFolderStructure())) {
      if (caseData.type !== 'case') continue;
      
      for (const image of caseData.images) {
        if (!usedImages.has(image.filename)) {
          this.syncReport.imagesMissing++;
          this.syncReport.inconsistencies.push({
            type: 'orphan_image',
            image: image.filename,
            case: caseName,
            message: 'Imagem sem prêmio correspondente'
          });
        }
      }
    }
    
    // 3. Verificar prêmios com valores inconsistentes
    const inconsistentPrizes = await prisma.prize.findMany({
      where: {
        ativo: true,
        valor: { lt: 0 }
      },
      include: { case: true }
    });
    
    for (const prize of inconsistentPrizes) {
      this.syncReport.inconsistencies.push({
        type: 'negative_value',
        prize: prize.nome,
        case: prize.case.nome,
        value: prize.valor,
        message: 'Prêmio com valor negativo'
      });
    }
  }

  /**
   * Extrair nome do prêmio do filename
   */
  extractPrizeName(filename) {
    const nameWithoutExt = path.parse(filename).name;
    
    // Remover números do início
    const cleanName = nameWithoutExt.replace(/^\d+/, '').trim();
    
    // Capitalizar primeira letra
    return cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
  }

  /**
   * Extrair valor do prêmio do filename
   */
  extractPrizeValue(filename, caseName) {
    const nameWithoutExt = path.parse(filename).name;
    
    // Tentar extrair valor do nome
    const valueMatch = nameWithoutExt.match(/(\d+)/);
    if (valueMatch) {
      return parseFloat(valueMatch[1]);
    }
    
    // Valores padrão baseados no nome
    const lowerName = nameWithoutExt.toLowerCase();
    
    if (lowerName.includes('iphone') || lowerName.includes('macbook')) {
      return 5000.00;
    } else if (lowerName.includes('ipad') || lowerName.includes('airpods')) {
      return 2000.00;
    } else if (lowerName.includes('ps5') || lowerName.includes('xbox')) {
      return 3000.00;
    } else if (lowerName.includes('steamdeck')) {
      return 2500.00;
    } else if (lowerName.includes('samsung') || lowerName.includes('s25')) {
      return 4000.00;
    } else if (lowerName.includes('nike') || lowerName.includes('jordan')) {
      return 500.00;
    } else if (lowerName.includes('honda') || lowerName.includes('cg')) {
      return 8000.00;
    }
    
    // Valor padrão baseado na caixa
    return this.estimateCasePrice(caseName) * 0.1;
  }

  /**
   * Determinar tipo do prêmio
   */
  determinePrizeType(filename, value) {
    if (value === 0) return 'ilustrativo';
    if (value < 10) return 'cash';
    if (value < 100) return 'cash';
    return 'cash';
  }

  /**
   * Calcular probabilidade baseada no valor
   */
  calculateProbability(value, caseName) {
    const casePrice = this.estimateCasePrice(caseName);
    
    if (value === 0) return 0.1; // 10% para prêmios ilustrativos
    if (value < casePrice) return 0.4; // 40% para prêmios menores
    if (value < casePrice * 2) return 0.3; // 30% para prêmios médios
    if (value < casePrice * 5) return 0.15; // 15% para prêmios grandes
    return 0.05; // 5% para prêmios muito grandes
  }

  /**
   * Estimar preço da caixa baseado no nome
   */
  estimateCasePrice(caseName) {
    const lowerName = caseName.toLowerCase();
    
    if (lowerName.includes('premium') || lowerName.includes('master')) {
      return 50.00;
    } else if (lowerName.includes('apple') || lowerName.includes('samsung')) {
      return 30.00;
    } else if (lowerName.includes('console')) {
      return 25.00;
    } else if (lowerName.includes('nike')) {
      return 20.00;
    } else if (lowerName.includes('weekend') || lowerName.includes('semana')) {
      return 15.00;
    }
    
    return 10.00; // Preço padrão
  }

  /**
   * Encontrar imagem da caixa
   */
  findCaseImage(caseName) {
    const possibleNames = [
      `caixa ${caseName.toLowerCase()}.png`,
      `caixa ${caseName.toLowerCase()}.jpg`,
      `${caseName.toLowerCase()}.png`,
      `${caseName.toLowerCase()}.jpg`
    ];
    
    for (const name of possibleNames) {
      const imagePath = path.join(this.imagesPath, name);
      if (fs.existsSync(imagePath)) {
        return name;
      }
    }
    
    return null;
  }

  /**
   * Verificar se arquivo é imagem
   */
  isImageFile(filename) {
    const ext = path.extname(filename).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
  }

  /**
   * Gerar relatório de sincronização
   */
  generateReport() {
    console.log('\n📋 RELATÓRIO DE SINCRONIZAÇÃO:');
    console.log('=' .repeat(50));
    console.log(`📦 Caixas processadas: ${this.syncReport.casesProcessed}`);
    console.log(`🎁 Prêmios processados: ${this.syncReport.prizesProcessed}`);
    console.log(`🖼️ Imagens encontradas: ${this.syncReport.imagesFound}`);
    console.log(`❌ Imagens órfãs: ${this.syncReport.imagesMissing}`);
    console.log(`⚠️ Prêmios sem imagem: ${this.syncReport.prizesWithoutImages}`);
    console.log(`🔧 Inconsistências: ${this.syncReport.inconsistencies.length}`);
    console.log(`✅ Ações realizadas: ${this.syncReport.actions.length}`);
    
    if (this.syncReport.inconsistencies.length > 0) {
      console.log('\n⚠️ INCONSISTÊNCIAS ENCONTRADAS:');
      this.syncReport.inconsistencies.forEach((inc, index) => {
        console.log(`${index + 1}. ${inc.type}: ${inc.message || inc.error}`);
      });
    }
    
    if (this.syncReport.actions.length > 0) {
      console.log('\n✅ AÇÕES REALIZADAS:');
      this.syncReport.actions.forEach((action, index) => {
        console.log(`${index + 1}. ${action}`);
      });
    }
    
    // Salvar relatório em arquivo
    const fs = require('fs');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = `logs/prize_sync_report_${timestamp}.json`;
    
    fs.writeFileSync(reportFile, JSON.stringify(this.syncReport, null, 2));
    console.log(`\n📄 Relatório salvo em: ${reportFile}`);
  }
}

module.exports = new PrizeImageSyncService();
