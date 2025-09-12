const { PrismaClient } = require('@prisma/client');
const prizeUtils = require('../utils/prizeUtils');

const prisma = new PrismaClient();

/**
 * Controller para gerenciamento de prêmios por caixa
 */
class CasePrizeController {
  
  /**
   * Busca todos os prêmios de uma caixa específica
   * GET /admin/caixas/:caixaId/premios
   */
  async getPrizesByCase(req, res) {
    try {
      const { caixaId } = req.params;
      
      // Validar se a caixa existe
      const caseExists = await prisma.case.findUnique({
        where: { id: caixaId }
      });
      
      if (!caseExists) {
        return res.status(404).json({
          success: false,
          error: 'Caixa não encontrada'
        });
      }
      
      // Buscar todos os prêmios da caixa
      const prizes = await prisma.prize.findMany({
        where: { case_id: caixaId },
        orderBy: { valor_centavos: 'asc' }
      });
      
      // Mapear prêmios usando função padronizada
      const mappedPrizes = prizes.map(prize => {
        try {
          const mapped = prizeUtils.mapPrizeToDisplay(prize);
          return {
            id: mapped.id,
            nome: mapped.nome,
            valorCentavos: mapped.valorCentavos,
            label: mapped.label,
            tipo: mapped.tipo,
            imagemUrl: mapped.imagem,
            ativo: mapped.ativo,
            sorteavel: mapped.sorteavel,
            probabilidade: mapped.probabilidade,
            caseId: mapped.case_id
          };
        } catch (error) {
          console.error(`Erro ao mapear prêmio ${prize.id}:`, error);
          return {
            id: prize.id,
            nome: prize.nome || 'Erro no mapeamento',
            valorCentavos: prize.valor_centavos || 0,
            label: 'Erro no mapeamento',
            tipo: prize.tipo || 'produto',
            imagemUrl: 'produto/default.png',
            ativo: prize.ativo !== false,
            sorteavel: false,
            probabilidade: prize.probabilidade || 0,
            caseId: prize.case_id,
            error: error.message
          };
        }
      });
      
      res.json({
        success: true,
        data: {
          case: {
            id: caseExists.id,
            nome: caseExists.nome,
            preco: caseExists.preco,
            imagem_url: caseExists.imagem_url
          },
          prizes: mappedPrizes,
          total: mappedPrizes.length,
          summary: {
            cash: mappedPrizes.filter(p => p.tipo === 'cash').length,
            produto: mappedPrizes.filter(p => p.tipo === 'produto').length,
            ilustrativo: mappedPrizes.filter(p => p.tipo === 'ilustrativo').length,
            ativos: mappedPrizes.filter(p => p.ativo).length,
            sorteaveis: mappedPrizes.filter(p => p.sorteavel).length
          }
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar prêmios da caixa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Lista todas as caixas disponíveis
   * GET /admin/caixas
   */
  async getAllCases(req, res) {
    try {
      const cases = await prisma.case.findMany({
        where: { ativo: true },
        select: {
          id: true,
          nome: true,
          preco: true,
          imagem_url: true,
          _count: {
            select: { prizes: true }
          }
        },
        orderBy: { nome: 'asc' }
      });
      
      res.json({
        success: true,
        data: cases.map(caseItem => ({
          id: caseItem.id,
          nome: caseItem.nome,
          preco: caseItem.preco,
          imagem_url: caseItem.imagem_url,
          total_prizes: caseItem._count.prizes
        }))
      });
      
    } catch (error) {
      console.error('Erro ao buscar caixas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Executa auditoria apenas nos prêmios de uma caixa específica
   * POST /admin/caixas/:caixaId/audit
   */
  async auditCasePrizes(req, res) {
    try {
      const { caixaId } = req.params;
      const { fix = false } = req.body;
      
      // Validar se a caixa existe
      const caseExists = await prisma.case.findUnique({
        where: { id: caixaId }
      });
      
      if (!caseExists) {
        return res.status(404).json({
          success: false,
          error: 'Caixa não encontrada'
        });
      }
      
      // Buscar prêmios da caixa
      const prizes = await prisma.prize.findMany({
        where: { case_id: caixaId }
      });
      
      if (prizes.length === 0) {
        return res.json({
          success: true,
          data: {
            case_id: caixaId,
            case_nome: caseExists.nome,
            total_prizes: 0,
            corrections_applied: 0,
            corrections: [],
            errors: [],
            warnings: []
          }
        });
      }
      
      // Executar auditoria individual para cada prêmio
      const prizeAuditServiceV2 = require('../services/prizeAuditServiceV2');
      const results = {
        case_id: caixaId,
        case_nome: caseExists.nome,
        total_prizes: prizes.length,
        corrections_applied: 0,
        corrections: [],
        errors: [],
        warnings: []
      };
      
      for (const prize of prizes) {
        try {
          const auditResult = await prizeAuditServiceV2.auditarPremioIndividual(prize, { fix, force: true });
          
          if (auditResult.corrections.length > 0) {
            results.corrections_applied += auditResult.corrections.length;
            results.corrections.push(...auditResult.corrections);
            
            if (fix) {
              await prizeAuditServiceV2.aplicarCorrecoes(prize.id, auditResult.corrections);
            }
          }
          
          if (auditResult.errors.length > 0) {
            results.errors.push(...auditResult.errors);
          }
          
          if (auditResult.warnings.length > 0) {
            results.warnings.push(...auditResult.warnings);
          }
          
        } catch (error) {
          results.errors.push({
            prize_id: prize.id,
            error: error.message,
            type: 'audit_error'
          });
        }
      }
      
      res.json({
        success: true,
        data: results
      });
      
    } catch (error) {
      console.error('Erro ao auditar prêmios da caixa:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Atualiza um prêmio específico
   * PUT /admin/premios/:prizeId
   */
  async updatePrize(req, res) {
    try {
      const { prizeId } = req.params;
      const { nome, valorCentavos, tipo, ativo } = req.body;
      
      // Validar se o prêmio existe
      const existingPrize = await prisma.prize.findUnique({
        where: { id: prizeId }
      });
      
      if (!existingPrize) {
        return res.status(404).json({
          success: false,
          error: 'Prêmio não encontrado'
        });
      }
      
      // Preparar dados para atualização
      const updateData = {};
      
      if (nome !== undefined) updateData.nome = nome;
      if (valorCentavos !== undefined) {
        updateData.valor_centavos = valorCentavos;
        updateData.valor = valorCentavos / 100; // Manter compatibilidade
      }
      if (tipo !== undefined) updateData.tipo = tipo;
      if (ativo !== undefined) updateData.ativo = ativo;
      
      // Se é prêmio cash, atualizar label e imagem automaticamente
      if (tipo === 'cash' && valorCentavos !== undefined) {
        updateData.label = prizeUtils.formatarBRL(valorCentavos);
        updateData.imagem_id = prizeUtils.assetKeyCash(valorCentavos);
      }
      
      // Atualizar prêmio
      const updatedPrize = await prisma.prize.update({
        where: { id: prizeId },
        data: updateData
      });
      
      // Mapear prêmio atualizado
      const mappedPrize = prizeUtils.mapPrizeToDisplay(updatedPrize);
      
      res.json({
        success: true,
        data: {
          id: mappedPrize.id,
          nome: mappedPrize.nome,
          valorCentavos: mappedPrize.valorCentavos,
          label: mappedPrize.label,
          tipo: mappedPrize.tipo,
          imagemUrl: mappedPrize.imagem,
          ativo: mappedPrize.ativo,
          sorteavel: mappedPrize.sorteavel,
          probabilidade: mappedPrize.probabilidade,
          caseId: mappedPrize.case_id
        }
      });
      
    } catch (error) {
      console.error('Erro ao atualizar prêmio:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = CasePrizeController;
