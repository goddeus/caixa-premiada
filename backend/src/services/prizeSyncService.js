const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const backupService = require('./backupService');

const prisma = new PrismaClient();

/**
 * Serviço de Sincronização de Prêmios
 * Sincroniza prêmios com base nas pastas de imagens e lista definitiva
 */
class PrizeSyncService {

  // Mapeamento definitivo das caixas e prêmios
  static PRIZE_MAPPING = {
    'CAIXA APPLE': {
      preco: 7.00,
      slug: 'caixa_apple',
      prizes: [
        { nome: 'cash', valor: 1.00, tipo: 'cash' },
        { nome: 'cash', valor: 2.00, tipo: 'cash' },
        { nome: 'cash', valor: 5.00, tipo: 'cash' },
        { nome: 'cash', valor: 10.00, tipo: 'cash' },
        { nome: 'cash', valor: 500.00, tipo: 'cash' },
        { nome: 'IPHONE 16 PRO MAX', valor: 10000.00, tipo: 'ilustrativo' },
        { nome: 'MACBOOK', valor: 15000.00, tipo: 'ilustrativo' },
        { nome: 'AIRPODS', valor: 2500.00, tipo: 'ilustrativo' }
      ]
    },
    'CAIXA CONSOLE DO SONHOS!': {
      preco: 3.50,
      slug: 'caixa_console_dos_sonhos',
      prizes: [
        { nome: 'cash', valor: 1.00, tipo: 'cash' },
        { nome: 'cash', valor: 2.00, tipo: 'cash' },
        { nome: 'cash', valor: 5.00, tipo: 'cash' },
        { nome: 'cash', valor: 10.00, tipo: 'cash' },
        { nome: 'cash', valor: 100.00, tipo: 'cash' },
        { nome: 'STEAM DECK', valor: 3000.00, tipo: 'ilustrativo' },
        { nome: 'PLAYSTATION 5', valor: 4000.00, tipo: 'ilustrativo' },
        { nome: 'XBOX SERIES X', valor: 4000.00, tipo: 'ilustrativo' }
      ]
    },
    'CAIXA KIT NIKE': {
      preco: 2.50,
      slug: 'caixa_kit_nike',
      prizes: [
        { nome: 'cash', valor: 1.00, tipo: 'cash' },
        { nome: 'cash', valor: 2.00, tipo: 'cash' },
        { nome: 'cash', valor: 5.00, tipo: 'cash' },
        { nome: 'cash', valor: 10.00, tipo: 'cash' },
        { nome: 'BONÉ NIKE', valor: 50.00, tipo: 'produto' },
        { nome: 'CAMISA NIKE', valor: 100.00, tipo: 'produto' },
        { nome: 'NIKE DUNK', valor: 1000.00, tipo: 'produto' },
        { nome: 'AIR FORCE 1', valor: 700.00, tipo: 'produto' },
        { nome: 'AIR JORDAN', valor: 1500.00, tipo: 'ilustrativo' }
      ]
    },
    'CAIXA PREMIUM MASTER!': {
      preco: 15.00,
      slug: 'caixa_premium_master',
      prizes: [
        { nome: 'cash', valor: 2.00, tipo: 'cash' },
        { nome: 'cash', valor: 5.00, tipo: 'cash' },
        { nome: 'cash', valor: 10.00, tipo: 'cash' },
        { nome: 'AIRPODS', valor: 2500.00, tipo: 'ilustrativo' },
        { nome: 'SAMSUNG S25', valor: 5000.00, tipo: 'ilustrativo' },
        { nome: 'IPAD', valor: 8000.00, tipo: 'ilustrativo' },
        { nome: 'IPHONE 16 PRO MAX', valor: 10000.00, tipo: 'ilustrativo' },
        { nome: 'MACBOOK', valor: 15000.00, tipo: 'ilustrativo' }
      ]
    },
    'CAIXA SAMSUNG': {
      preco: 3.00,
      slug: 'caixa_samsung',
      prizes: [
        { nome: 'cash', valor: 1.00, tipo: 'cash' },
        { nome: 'cash', valor: 2.00, tipo: 'cash' },
        { nome: 'cash', valor: 5.00, tipo: 'cash' },
        { nome: 'cash', valor: 10.00, tipo: 'cash' },
        { nome: 'cash', valor: 100.00, tipo: 'cash' },
        { nome: 'cash', valor: 500.00, tipo: 'cash' },
        { nome: 'FONE SAMSUNG', valor: 1000.00, tipo: 'produto' },
        { nome: 'NOTEBOOK SAMSUNG', valor: 3000.00, tipo: 'ilustrativo' },
        { nome: 'SAMSUNG S25', valor: 5000.00, tipo: 'ilustrativo' }
      ]
    },
    'CAIXA WEEKEND': {
      preco: 1.50,
      slug: 'caixa_weekend',
      prizes: [
        { nome: 'cash', valor: 1.00, tipo: 'cash' },
        { nome: 'cash', valor: 2.00, tipo: 'cash' },
        { nome: 'cash', valor: 5.00, tipo: 'cash' },
        { nome: 'cash', valor: 10.00, tipo: 'cash' },
        { nome: 'cash', valor: 100.00, tipo: 'cash', valor_centavos: 0, sorteavel: false },
        { nome: 'cash', valor: 500.00, tipo: 'cash', valor_centavos: 0, sorteavel: false }
      ]
    }
  };

  /**
   * Sincroniza prêmios de uma caixa específica ou todas as caixas
   * @param {string} caseId - ID da caixa (opcional, se não informado sincroniza todas)
   * @returns {Object} Resultado da sincronização
   */
  async syncPrizes(caseId = null) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const syncResult = {
      success: false,
      timestamp: timestamp,
      case_id: caseId,
      total_cases_processed: 0,
      total_prizes_updated: 0,
      total_prizes_inserted: 0,
      total_prizes_deactivated: 0,
      total_images_missing: 0,
      errors: [],
      case_results: [],
      log_file: null
    };

    try {
      console.log('🔄 Iniciando sincronização de prêmios...');
      
      // 1. Criar backup completo antes de iniciar
      console.log('💾 Criando backup de segurança...');
      const backupResult = await backupService.createFullBackup(timestamp);
      if (!backupResult.success) {
        throw new Error('Falha ao criar backup de segurança');
      }
      console.log('✅ Backup criado com sucesso!');

      // 2. Determinar quais caixas processar
      const casesToProcess = caseId 
        ? [await this.getCaseById(caseId)]
        : await this.getAllCases();

      if (!casesToProcess || casesToProcess.length === 0) {
        throw new Error('Nenhuma caixa encontrada para sincronização');
      }

      // 3. Processar cada caixa
      for (const caseData of casesToProcess) {
        try {
          const caseResult = await this.syncCasePrizes(caseData, timestamp);
          syncResult.case_results.push(caseResult);
          syncResult.total_cases_processed++;
          syncResult.total_prizes_updated += caseResult.prizes_updated;
          syncResult.total_prizes_inserted += caseResult.prizes_inserted;
          syncResult.total_prizes_deactivated += caseResult.prizes_deactivated;
          syncResult.total_images_missing += caseResult.images_missing;
        } catch (error) {
          console.error(`❌ Erro ao processar caixa ${caseData.nome}:`, error);
          syncResult.errors.push(`Caixa ${caseData.nome}: ${error.message}`);
        }
      }

      // 4. Gerar relatório de sincronização
      syncResult.log_file = await this.generateSyncReport(syncResult, timestamp);
      
      syncResult.success = true;
      console.log('✅ Sincronização concluída com sucesso!');
      console.log(`📊 Resumo: ${syncResult.total_cases_processed} caixas, ${syncResult.total_prizes_updated} atualizados, ${syncResult.total_prizes_inserted} inseridos, ${syncResult.total_prizes_deactivated} desativados`);

    } catch (error) {
      console.error('❌ Erro durante sincronização:', error);
      syncResult.errors.push(error.message);
    }

    return syncResult;
  }

  /**
   * Sincroniza prêmios de uma caixa específica
   * @param {Object} caseData - Dados da caixa
   * @param {string} timestamp - Timestamp da sincronização
   * @returns {Object} Resultado da sincronização da caixa
   */
  async syncCasePrizes(caseData, timestamp) {
    const caseResult = {
      case_id: caseData.id,
      case_name: caseData.nome,
      prizes_updated: 0,
      prizes_inserted: 0,
      prizes_deactivated: 0,
      images_missing: 0,
      prize_details: [],
      errors: []
    };

    try {
      console.log(`📦 Processando caixa: ${caseData.nome}`);

      // 1. Obter mapeamento da caixa
      const mapping = this.getCaseMapping(caseData.nome);
      if (!mapping) {
        throw new Error(`Mapeamento não encontrado para caixa: ${caseData.nome}`);
      }

      // 2. Obter imagens da pasta
      let folderName = caseData.nome.toUpperCase();
      
      // Mapear nomes de caixas para nomes de pastas
      const folderMapping = {
        'CAIXA WEEKEND': 'CAIXA FINAL DE SEMANA',
        'CAIXA CONSOLE DO SONHOS!': 'CAIXA CONSOLE DOS SONHOS',
        'CAIXA PREMIUM MASTER!': 'CAIXA PREMIUM MASTER'
      };
      
      if (folderMapping[caseData.nome]) {
        folderName = folderMapping[caseData.nome];
      }
      
      const imagesPath = path.join(__dirname, '../../../frontend/public/imagens', folderName);
      const availableImages = await this.getAvailableImages(imagesPath);

      // 3. Processar cada prêmio do mapeamento
      for (const prizeMapping of mapping.prizes) {
        try {
          const prizeResult = await this.syncPrize(caseData.id, prizeMapping, availableImages, caseData.nome);
          caseResult.prize_details.push(prizeResult);
          
          if (prizeResult.action === 'updated') caseResult.prizes_updated++;
          else if (prizeResult.action === 'inserted') caseResult.prizes_inserted++;
          else if (prizeResult.action === 'deactivated') caseResult.prizes_deactivated++;
          if (prizeResult.image_missing) caseResult.images_missing++;
          
        } catch (error) {
          console.error(`❌ Erro ao processar prêmio ${prizeMapping.nome}:`, error);
          caseResult.errors.push(`Prêmio ${prizeMapping.nome}: ${error.message}`);
        }
      }

      // 4. Desativar prêmios que não estão no mapeamento
      const deactivatedPrizes = await this.deactivateUnmappedPrizes(caseData.id, mapping.prizes);
      caseResult.prizes_deactivated += deactivatedPrizes.length;

    } catch (error) {
      console.error(`❌ Erro ao processar caixa ${caseData.nome}:`, error);
      caseResult.errors.push(error.message);
    }

    return caseResult;
  }

  /**
   * Sincroniza um prêmio específico
   * @param {string} caseId - ID da caixa
   * @param {Object} prizeMapping - Mapeamento do prêmio
   * @param {Array} availableImages - Imagens disponíveis
   * @param {string} caseSlug - Slug da caixa
   * @returns {Object} Resultado da sincronização do prêmio
   */
  async syncPrize(caseId, prizeMapping, availableImages, caseSlug) {
    const prizeResult = {
      prize_name: prizeMapping.nome,
      prize_value: prizeMapping.valor,
      prize_type: prizeMapping.tipo,
      action: null,
      image_found: false,
      image_missing: false,
      image_url: null,
      before: null,
      after: null,
      error: null
    };

    try {
      // 1. Determinar se é ilustrativo
      const isIllustrative = prizeMapping.tipo === 'ilustrativo' || prizeMapping.valor > 1000;
      
      // 2. Calcular valor em centavos
      const valorCentavos = prizeMapping.valor_centavos !== undefined 
        ? prizeMapping.valor_centavos 
        : Math.round(prizeMapping.valor * 100);

      // 3. Gerar label
      const label = prizeMapping.tipo === 'cash' 
        ? this.formatarBRL(valorCentavos)
        : prizeMapping.nome;

      // 4. Buscar imagem correspondente
      const imageUrl = this.findMatchingImage(prizeMapping, availableImages, caseSlug);
      prizeResult.image_found = !!imageUrl;
      prizeResult.image_missing = !imageUrl;
      prizeResult.image_url = imageUrl;

      // 5. Buscar prêmio existente
      const existingPrize = await this.findExistingPrize(caseId, prizeMapping, valorCentavos);

      if (existingPrize) {
        // Atualizar prêmio existente
        prizeResult.before = {
          nome: existingPrize.nome,
          valor_centavos: existingPrize.valor_centavos,
          tipo: existingPrize.tipo,
          label: existingPrize.label,
          imagem_url: existingPrize.imagem_url,
          ativo: existingPrize.ativo,
          ilustrativo: existingPrize.ilustrativo
        };

        const updatedPrize = await prisma.prize.update({
          where: { id: existingPrize.id },
          data: {
            nome: prizeMapping.nome,
            valor: prizeMapping.valor,
            valor_centavos: valorCentavos,
            tipo: prizeMapping.tipo,
            label: label,
            imagem_url: imageUrl,
            imagem_id: imageUrl ? path.basename(imageUrl) : '',
            ativo: true,
            ilustrativo: isIllustrative,
            probabilidade: existingPrize.probabilidade // Manter probabilidade existente
          }
        });

        prizeResult.after = {
          nome: updatedPrize.nome,
          valor_centavos: updatedPrize.valor_centavos,
          tipo: updatedPrize.tipo,
          label: updatedPrize.label,
          imagem_url: updatedPrize.imagem_url,
          ativo: updatedPrize.ativo,
          ilustrativo: updatedPrize.ilustrativo
        };

        prizeResult.action = 'updated';
        console.log(`✅ Prêmio atualizado: ${prizeMapping.nome} (R$ ${prizeMapping.valor})`);

      } else {
        // Inserir novo prêmio
        const newPrize = await prisma.prize.create({
          data: {
            case_id: caseId,
            nome: prizeMapping.nome,
            valor: prizeMapping.valor,
            valor_centavos: valorCentavos,
            tipo: prizeMapping.tipo,
            label: label,
            imagem_url: imageUrl,
            imagem_id: imageUrl ? path.basename(imageUrl) : '',
            ativo: true,
            ilustrativo: isIllustrative,
            probabilidade: this.calculateDefaultProbability(prizeMapping.valor, prizeMapping.tipo)
          }
        });

        prizeResult.after = {
          nome: newPrize.nome,
          valor_centavos: newPrize.valor_centavos,
          tipo: newPrize.tipo,
          label: newPrize.label,
          imagem_url: newPrize.imagem_url,
          ativo: newPrize.ativo,
          ilustrativo: newPrize.ilustrativo
        };

        prizeResult.action = 'inserted';
        console.log(`➕ Prêmio inserido: ${prizeMapping.nome} (R$ ${prizeMapping.valor})`);
      }

    } catch (error) {
      console.error(`❌ Erro ao sincronizar prêmio ${prizeMapping.nome}:`, error);
      prizeResult.error = error.message;
    }

    return prizeResult;
  }

  /**
   * Busca prêmio existente na caixa
   * @param {string} caseId - ID da caixa
   * @param {Object} prizeMapping - Mapeamento do prêmio
   * @param {number} valorCentavos - Valor em centavos
   * @returns {Object|null} Prêmio existente ou null
   */
  async findExistingPrize(caseId, prizeMapping, valorCentavos) {
    // Buscar por nome e valor
    let existingPrize = await prisma.prize.findFirst({
      where: {
        case_id: caseId,
        nome: prizeMapping.nome,
        valor_centavos: valorCentavos,
        ativo: true
      }
    });

    // Se não encontrou, buscar por valor e tipo para cash
    if (!existingPrize && prizeMapping.tipo === 'cash') {
      existingPrize = await prisma.prize.findFirst({
        where: {
          case_id: caseId,
          valor_centavos: valorCentavos,
          tipo: 'cash',
          ativo: true
        }
      });
    }

    return existingPrize;
  }

  /**
   * Desativa prêmios que não estão no mapeamento
   * @param {string} caseId - ID da caixa
   * @param {Array} mappedPrizes - Prêmios do mapeamento
   * @returns {Array} Prêmios desativados
   */
  async deactivateUnmappedPrizes(caseId, mappedPrizes) {
    const mappedValues = mappedPrizes.map(p => ({
      nome: p.nome,
      valor_centavos: p.valor_centavos !== undefined ? p.valor_centavos : Math.round(p.valor * 100)
    }));

    const existingPrizes = await prisma.prize.findMany({
      where: {
        case_id: caseId,
        ativo: true
      }
    });

    const prizesToDeactivate = existingPrizes.filter(prize => {
      return !mappedValues.some(mapped => 
        mapped.nome === prize.nome && mapped.valor_centavos === prize.valor_centavos
      );
    });

    for (const prize of prizesToDeactivate) {
      await prisma.prize.update({
        where: { id: prize.id },
        data: { ativo: false }
      });
      console.log(`🚫 Prêmio desativado: ${prize.nome} (R$ ${prize.valor})`);
    }

    return prizesToDeactivate;
  }

  /**
   * Obtém mapeamento de uma caixa
   * @param {string} caseName - Nome da caixa
   * @returns {Object|null} Mapeamento da caixa
   */
  getCaseMapping(caseName) {
    return PrizeSyncService.PRIZE_MAPPING[caseName] || null;
  }

  /**
   * Obtém todas as caixas do banco
   * @returns {Array} Lista de caixas
   */
  async getAllCases() {
    return await prisma.case.findMany({
      where: { ativo: true },
      orderBy: { nome: 'asc' }
    });
  }

  /**
   * Obtém caixa por ID
   * @param {string} caseId - ID da caixa
   * @returns {Object|null} Dados da caixa
   */
  async getCaseById(caseId) {
    return await prisma.case.findUnique({
      where: { id: caseId }
    });
  }

  /**
   * Obtém imagens disponíveis em uma pasta
   * @param {string} imagesPath - Caminho da pasta de imagens
   * @returns {Array} Lista de imagens disponíveis
   */
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

  /**
   * Encontra imagem correspondente ao prêmio
   * @param {Object} prizeMapping - Mapeamento do prêmio
   * @param {Array} availableImages - Imagens disponíveis
   * @param {string} caseName - Nome da caixa
   * @returns {string|null} URL da imagem ou null
   */
  findMatchingImage(prizeMapping, availableImages, caseName) {
    if (!availableImages || availableImages.length === 0) {
      return null;
    }

    const prizeName = prizeMapping.nome.toLowerCase();
    const prizeValue = prizeMapping.valor;

    // 1. Buscar por nome exato do prêmio
    let image = availableImages.find(img => 
      img.toLowerCase().includes(prizeName.toLowerCase())
    );

    if (image) {
      return `/imagens/${caseName.toUpperCase()}/${image}`;
    }

    // 1.1. Buscar por padrões específicos de produtos
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
          return `/imagens/${caseName.toUpperCase()}/${image}`;
        }
      }
    }

    // 2. Buscar por valor (para cash)
    if (prizeMapping.tipo === 'cash') {
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
          return `/imagens/${caseName.toUpperCase()}/${image}`;
        }
      }
    }

    // 3. Buscar por padrões parciais
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
        return `/imagens/${caseName.toUpperCase()}/${image}`;
      }
    }

    return null;
  }

  /**
   * Calcula probabilidade padrão para um prêmio
   * @param {number} valor - Valor do prêmio
   * @param {string} tipo - Tipo do prêmio
   * @returns {number} Probabilidade
   */
  calculateDefaultProbability(valor, tipo) {
    if (tipo === 'ilustrativo') {
      return 0.001; // 0.1% para ilustrativos
    }
    
    if (valor <= 10) {
      return 0.3; // 30% para valores baixos
    } else if (valor <= 100) {
      return 0.1; // 10% para valores médios
    } else if (valor <= 1000) {
      return 0.01; // 1% para valores altos
    } else {
      return 0.001; // 0.1% para valores muito altos
    }
  }

  /**
   * Formata valor em BRL
   * @param {number} valorCentavos - Valor em centavos
   * @returns {string} Valor formatado
   */
  formatarBRL(valorCentavos) {
    const valor = valorCentavos / 100;
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
  }

  /**
   * Gera relatório de sincronização
   * @param {Object} syncResult - Resultado da sincronização
   * @param {string} timestamp - Timestamp da sincronização
   * @returns {string} Caminho do arquivo de log
   */
  async generateSyncReport(syncResult, timestamp) {
    try {
      const logDir = path.join(__dirname, '../../logs');
      await fs.mkdir(logDir, { recursive: true });
      
      const logFile = path.join(logDir, `sync_prizes_${timestamp}.log`);
      
      const logContent = {
        timestamp: timestamp,
        success: syncResult.success,
        summary: {
          total_cases_processed: syncResult.total_cases_processed,
          total_prizes_updated: syncResult.total_prizes_updated,
          total_prizes_inserted: syncResult.total_prizes_inserted,
          total_prizes_deactivated: syncResult.total_prizes_deactivated,
          total_images_missing: syncResult.total_images_missing
        },
        case_results: syncResult.case_results,
        errors: syncResult.errors
      };

      await fs.writeFile(logFile, JSON.stringify(logContent, null, 2));
      
      console.log(`📄 Relatório gerado: ${logFile}`);
      return logFile;
      
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      return null;
    }
  }
}

module.exports = new PrizeSyncService();
