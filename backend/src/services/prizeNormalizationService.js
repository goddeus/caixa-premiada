const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de Normalização de Nomes de Prêmios
 * Garante que todos os nomes de prêmios sejam claros e compatíveis com seus valores
 */
class PrizeNormalizationService {

  /**
   * Mapeamento de produtos conhecidos com seus valores de referência
   */
  static PRODUCT_MAPPING = {
    // Apple Products
    'iphone': { baseName: 'IPHONE', category: 'smartphone', minValue: 3000 },
    'iphone 16': { baseName: 'IPHONE 16', category: 'smartphone', minValue: 5000 },
    'iphone 16 pro': { baseName: 'IPHONE 16 PRO', category: 'smartphone', minValue: 7000 },
    'iphone 16 pro max': { baseName: 'IPHONE 16 PRO MAX', category: 'smartphone', minValue: 10000 },
    'macbook': { baseName: 'MACBOOK', category: 'notebook', minValue: 8000 },
    'macbook pro': { baseName: 'MACBOOK PRO', category: 'notebook', minValue: 12000 },
    'airpods': { baseName: 'AIRPODS', category: 'fone', minValue: 1500 },
    'airpods pro': { baseName: 'AIRPODS PRO', category: 'fone', minValue: 2500 },
    'apple watch': { baseName: 'APPLE WATCH', category: 'smartwatch', minValue: 2000 },
    'ipad': { baseName: 'IPAD', category: 'tablet', minValue: 3000 },

    // Gaming
    'ps5': { baseName: 'PLAYSTATION 5', category: 'console', minValue: 4000 },
    'playstation 5': { baseName: 'PLAYSTATION 5', category: 'console', minValue: 4000 },
    'xbox': { baseName: 'XBOX SERIES X', category: 'console', minValue: 4000 },
    'xbox series x': { baseName: 'XBOX SERIES X', category: 'console', minValue: 4000 },
    'steamdeck': { baseName: 'STEAM DECK', category: 'console', minValue: 3000 },
    'steam deck': { baseName: 'STEAM DECK', category: 'console', minValue: 3000 },

    // Samsung
    'samsung': { baseName: 'SAMSUNG GALAXY', category: 'smartphone', minValue: 2000 },
    'galaxy': { baseName: 'SAMSUNG GALAXY', category: 'smartphone', minValue: 2000 },
    'galaxy s24': { baseName: 'SAMSUNG GALAXY S24', category: 'smartphone', minValue: 4000 },
    'galaxy buds': { baseName: 'SAMSUNG GALAXY BUDS', category: 'fone', minValue: 500 },

    // Xiaomi/Redmi
    'xiaomi': { baseName: 'XIAOMI', category: 'smartphone', minValue: 1000 },
    'redmi': { baseName: 'REDMI', category: 'smartphone', minValue: 800 },
    'redmi note': { baseName: 'REDMI NOTE', category: 'smartphone', minValue: 1000 },
    'redmi note 12': { baseName: 'REDMI NOTE 12', category: 'smartphone', minValue: 1200 },
    'redmi note 13': { baseName: 'REDMI NOTE 13', category: 'smartphone', minValue: 1500 },

    // Nike/Jordan
    'jordan': { baseName: 'AIR JORDAN', category: 'tenis', minValue: 500 },
    'air jordan': { baseName: 'AIR JORDAN', category: 'tenis', minValue: 500 },
    'nike': { baseName: 'NIKE', category: 'tenis', minValue: 300 },
    'nike dunk': { baseName: 'NIKE DUNK', category: 'tenis', minValue: 400 },
    'air force': { baseName: 'AIR FORCE 1', category: 'tenis', minValue: 700 },
    'air force 1': { baseName: 'AIR FORCE 1', category: 'tenis', minValue: 700 },

    // Notebooks
    'notebook': { baseName: 'NOTEBOOK', category: 'notebook', minValue: 2000 },
    'laptop': { baseName: 'LAPTOP', category: 'notebook', minValue: 2000 },
    'pc': { baseName: 'PC GAMER', category: 'computador', minValue: 3000 },
    'computador': { baseName: 'PC GAMER', category: 'computador', minValue: 3000 },

    // Roupas
    'camiseta': { baseName: 'CAMISETA', category: 'roupa', minValue: 50 },
    'camisa': { baseName: 'CAMISETA', category: 'roupa', minValue: 50 },
    'boné': { baseName: 'BONÉ', category: 'acessorio', minValue: 80 },
    'boné nike': { baseName: 'BONÉ NIKE', category: 'acessorio', minValue: 120 },

    // Acessórios
    'powerbank': { baseName: 'POWERBANK', category: 'acessorio', minValue: 100 },
    'power bank': { baseName: 'POWERBANK', category: 'acessorio', minValue: 100 },
    'controle': { baseName: 'CONTROLE', category: 'acessorio', minValue: 200 },
    'controle ps5': { baseName: 'CONTROLE PS5', category: 'acessorio', minValue: 300 }
  };

  /**
   * Normaliza o nome de um produto baseado no valor e referências
   */
  static normalizarNomeProduto(nomeAtual, valor) {
    if (!nomeAtual || !valor) {
      return nomeAtual;
    }

    const valorNumerico = parseFloat(valor);
    const nomeLower = nomeAtual.toLowerCase().trim();

    // Se já é um valor monetário, manter como está
    if (nomeLower.match(/^r?\$?\s*\d+([.,]\d+)?$/)) {
      return nomeAtual;
    }

    // Buscar correspondência exata primeiro
    for (const [keyword, mapping] of Object.entries(this.PRODUCT_MAPPING)) {
      if (nomeLower.includes(keyword)) {
        // Verificar se o valor é compatível
        if (valorNumerico >= mapping.minValue) {
          return mapping.baseName;
        } else {
          // Valor muito baixo para o produto, ajustar nome
          return this.ajustarNomeParaValor(mapping.baseName, valorNumerico);
        }
      }
    }

    // Buscar correspondência parcial
    for (const [keyword, mapping] of Object.entries(this.PRODUCT_MAPPING)) {
      if (nomeLower.includes(keyword.split(' ')[0])) {
        if (valorNumerico >= mapping.minValue) {
          return mapping.baseName;
        } else {
          return this.ajustarNomeParaValor(mapping.baseName, valorNumerico);
        }
      }
    }

    // Se não encontrou correspondência, verificar se precisa de nome de produto
    if (valorNumerico >= 500) {
      return this.sugerirNomePorValor(valorNumerico);
    }

    return nomeAtual;
  }

  /**
   * Ajusta o nome do produto baseado no valor real
   */
  static ajustarNomeParaValor(nomeProduto, valor) {
    const valorNumerico = parseFloat(valor);

    if (valorNumerico < 100) {
      return `R$ ${valorNumerico.toFixed(2).replace('.', ',')}`;
    } else if (valorNumerico < 500) {
      return `${nomeProduto} (USADO)`;
    } else if (valorNumerico < 1000) {
      return `${nomeProduto} (REMOVIDO)`;
    } else {
      return nomeProduto;
    }
  }

  /**
   * Sugere nome de produto baseado no valor
   */
  static sugerirNomePorValor(valor) {
    const valorNumerico = parseFloat(valor);

    if (valorNumerico >= 10000) {
      return 'IPHONE 16 PRO MAX';
    } else if (valorNumerico >= 8000) {
      return 'MACBOOK PRO';
    } else if (valorNumerico >= 5000) {
      return 'IPHONE 16';
    } else if (valorNumerico >= 3000) {
      return 'PLAYSTATION 5';
    } else if (valorNumerico >= 2000) {
      return 'SAMSUNG GALAXY';
    } else if (valorNumerico >= 1000) {
      return 'REDMI NOTE 13';
    } else {
      return `R$ ${valorNumerico.toFixed(2).replace('.', ',')}`;
    }
  }

  /**
   * Verifica se um prêmio deve ser marcado como ilustrativo
   */
  static deveSerIlustrativo(valor) {
    const valorNumerico = parseFloat(valor);
    return valorNumerico > 5000;
  }

  /**
   * Normaliza todos os prêmios do banco de dados
   */
  async normalizarTodosPremios() {
    console.log('🔧 Iniciando normalização de todos os prêmios...');
    
    const results = {
      total_processed: 0,
      names_updated: 0,
      illustrative_marked: 0,
      errors: []
    };

    try {
      const prizes = await prisma.prize.findMany({
        include: {
          case: true
        }
      });

      results.total_processed = prizes.length;

      for (const prize of prizes) {
        try {
          const valorNumerico = parseFloat(prize.valor);
          
          // Normalizar nome
          const nomeNormalizado = PrizeNormalizationService.normalizarNomeProduto(prize.nome, valorNumerico);
          
          // Verificar se deve ser ilustrativo
          const deveSerIlustrativo = PrizeNormalizationService.deveSerIlustrativo(valorNumerico);
          
          const updateData = {};
          let needsUpdate = false;

          // Atualizar nome se necessário
          if (nomeNormalizado !== prize.nome) {
            updateData.nome = nomeNormalizado;
            needsUpdate = true;
            results.names_updated++;
          }

          // Marcar como ilustrativo se necessário
          if (deveSerIlustrativo && !prize.ilustrativo) {
            updateData.ilustrativo = true;
            needsUpdate = true;
            results.illustrative_marked++;
          }

          // Aplicar atualizações
          if (needsUpdate) {
            await prisma.prize.update({
              where: { id: prize.id },
              data: updateData
            });

            console.log(`✅ Prêmio atualizado: ${prize.nome} → ${nomeNormalizado} ${deveSerIlustrativo ? '(ILUSTRATIVO)' : ''}`);
          }

        } catch (error) {
          console.error(`❌ Erro ao processar prêmio ${prize.id}:`, error);
          results.errors.push({
            prize_id: prize.id,
            error: error.message
          });
        }
      }

      console.log(`✅ Normalização concluída:`);
      console.log(`- Total processados: ${results.total_processed}`);
      console.log(`- Nomes atualizados: ${results.names_updated}`);
      console.log(`- Marcados como ilustrativos: ${results.illustrative_marked}`);
      console.log(`- Erros: ${results.errors.length}`);

      return {
        success: true,
        ...results
      };

    } catch (error) {
      console.error('❌ Erro durante normalização:', error);
      return {
        success: false,
        error: error.message,
        ...results
      };
    }
  }

  /**
   * Normaliza prêmios de uma caixa específica
   */
  async normalizarPremiosCaixa(caseId) {
    console.log(`🔧 Normalizando prêmios da caixa ${caseId}...`);
    
    const results = {
      case_id: caseId,
      total_processed: 0,
      names_updated: 0,
      illustrative_marked: 0,
      errors: []
    };

    try {
      const prizes = await prisma.prize.findMany({
        where: { case_id: caseId },
        include: {
          case: true
        }
      });

      results.total_processed = prizes.length;

      for (const prize of prizes) {
        try {
          const valorNumerico = parseFloat(prize.valor);
          
          // Normalizar nome
          const nomeNormalizado = PrizeNormalizationService.normalizarNomeProduto(prize.nome, valorNumerico);
          
          // Verificar se deve ser ilustrativo
          const deveSerIlustrativo = PrizeNormalizationService.deveSerIlustrativo(valorNumerico);
          
          const updateData = {};
          let needsUpdate = false;

          // Atualizar nome se necessário
          if (nomeNormalizado !== prize.nome) {
            updateData.nome = nomeNormalizado;
            needsUpdate = true;
            results.names_updated++;
          }

          // Marcar como ilustrativo se necessário
          if (deveSerIlustrativo && !prize.ilustrativo) {
            updateData.ilustrativo = true;
            needsUpdate = true;
            results.illustrative_marked++;
          }

          // Aplicar atualizações
          if (needsUpdate) {
            await prisma.prize.update({
              where: { id: prize.id },
              data: updateData
            });

            console.log(`✅ Prêmio atualizado: ${prize.nome} → ${nomeNormalizado} ${deveSerIlustrativo ? '(ILUSTRATIVO)' : ''}`);
          }

        } catch (error) {
          console.error(`❌ Erro ao processar prêmio ${prize.id}:`, error);
          results.errors.push({
            prize_id: prize.id,
            error: error.message
          });
        }
      }

      return {
        success: true,
        ...results
      };

    } catch (error) {
      console.error('❌ Erro durante normalização da caixa:', error);
      return {
        success: false,
        error: error.message,
        ...results
      };
    }
  }

  /**
   * Obtém estatísticas de normalização
   */
  async getNormalizationStats() {
    try {
      const totalPrizes = await prisma.prize.count();
      const illustrativePrizes = await prisma.prize.count({
        where: { ilustrativo: true }
      });
      const highValuePrizes = await prisma.prize.count({
        where: { valor: { gt: 5000 } }
      });

      return {
        total_prizes: totalPrizes,
        illustrative_prizes: illustrativePrizes,
        high_value_prizes: highValuePrizes,
        normalization_needed: highValuePrizes - illustrativePrizes
      };

    } catch (error) {
      console.error('Erro ao obter estatísticas de normalização:', error);
      throw error;
    }
  }

  /**
   * Métodos de instância para facilitar testes
   */
  normalizarNomeProduto(nomeAtual, valor) {
    return PrizeNormalizationService.normalizarNomeProduto(nomeAtual, valor);
  }

  deveSerIlustrativo(valor) {
    return PrizeNormalizationService.deveSerIlustrativo(valor);
  }
}

module.exports = new PrizeNormalizationService();
