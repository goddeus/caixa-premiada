const { PrismaClient } = require('@prisma/client');
const PixupServiceRotating = require('../services/pixupServiceRotating');

const prisma = new PrismaClient();
const pixupService = new PixupServiceRotating();

class PixupController {
  
  /**
   * POST /api/pixup/deposit
   * Criar depósito via PIX usando Pixup
   */
  static async createDeposit(req, res) {
    try {
      console.log('[PIXUP] Depósito PIX iniciado:', req.body);
      
      const { userId, amount } = req.body;
      
      if (!userId || !amount) {
        return res.status(400).json({
          success: false,
          message: 'userId e amount são obrigatórios'
        });
      }
      
      const valorNumerico = Number(amount);
      
      if (valorNumerico < 20.00) {
        return res.status(400).json({
          success: false,
          message: 'Valor mínimo para depósito é R$ 20,00'
        });
      }
      
      if (valorNumerico > 10000.00) {
        return res.status(400).json({
          success: false,
          message: 'Valor máximo para depósito é R$ 10.000,00'
        });
      }
      
      // Criar pagamento via Pixup
      const result = await pixupService.createPayment({ userId, valor: valorNumerico });
      
      console.log('[PIXUP] Depósito criado com sucesso:', result);
      
      res.json({
        success: true,
        qrCode: result.qrCode,
        qrCodeImage: result.qrCodeImage,
        identifier: result.external_id,
        transaction_id: result.transaction_id,
        amount: result.amount,
        expires_at: result.expires_at
      });
      
    } catch (error) {
      console.error('[PIXUP] Erro ao criar depósito PIX:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * POST /api/pixup/withdraw
   * Criar saque via PIX usando Pixup
   */
  static async createWithdraw(req, res) {
    try {
      console.log('[PIXUP] Saque PIX iniciado:', req.body);
      
      const { userId, amount, pixKey, pixKeyType, ownerName, ownerDocument } = req.body;
      
      if (!userId || !amount || !pixKey) {
        return res.status(400).json({
          success: false,
          message: 'userId, amount e pixKey são obrigatórios'
        });
      }
      
      const valorNumerico = Number(amount);
      
      if (valorNumerico < 20.00) {
        return res.status(400).json({
          success: false,
          message: 'Valor mínimo para saque é R$ 20,00'
        });
      }
      
      // Buscar usuário para verificar saldo
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      if (user.saldo_reais < valorNumerico) {
        return res.status(400).json({
          success: false,
          message: 'Saldo insuficiente para o saque'
        });
      }
      
      // Verificar rollover se necessário
      if (!user.rollover_liberado) {
        return res.status(400).json({
          success: false,
          message: `Você precisa apostar mais R$ ${(user.rollover_minimo - user.total_giros).toFixed(2)} para liberar saques`
        });
      }
      
      // Criar saque via Pixup
      const result = await pixupService.createWithdrawal({
        userId,
        amount: valorNumerico,
        pixKey,
        pixKeyType: pixKeyType || 'random',
        ownerName: ownerName || user.nome,
        ownerDocument: ownerDocument || user.cpf?.replace(/\D/g, '') || "00000000000"
      });
      
      console.log('[PIXUP] Saque criado com sucesso:', result);
      
      // Criar transação de débito
      await prisma.transaction.create({
        data: {
          user_id: userId,
          tipo: 'withdraw',
          valor: valorNumerico,
          saldo_antes: user.saldo_reais,
          saldo_depois: user.saldo_reais - valorNumerico,
          status: 'processing',
          identifier: result.external_id,
          related_id: result.transaction_id,
          descricao: `Saque PIX - ${pixKey}`,
          criado_em: new Date()
        }
      });
      
      // Atualizar saldo do usuário
      await prisma.user.update({
        where: { id: userId },
        data: {
          saldo_reais: user.saldo_reais - valorNumerico
        }
      });
      
      res.json({
        success: true,
        message: 'Saque solicitado com sucesso! Aguarde a aprovação.',
        external_id: result.external_id,
        transaction_id: result.transaction_id,
        amount: result.amount,
        status: result.status
      });
      
    } catch (error) {
      console.error('[PIXUP] Erro ao criar saque PIX:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/pixup/deposit/status/:externalId
   * Verificar status de depósito
   */
  static async checkDepositStatus(req, res) {
    try {
      const { externalId } = req.params;
      
      if (!externalId) {
        return res.status(400).json({
          success: false,
          message: 'externalId é obrigatório'
        });
      }
      
      const status = await pixupService.checkPaymentStatus(externalId);
      
      res.json({
        success: true,
        status: status
      });
      
    } catch (error) {
      console.error('[PIXUP] Erro ao verificar status do depósito:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/pixup/withdraw/status/:externalId
   * Verificar status de saque
   */
  static async checkWithdrawStatus(req, res) {
    try {
      const { externalId } = req.params;
      
      if (!externalId) {
        return res.status(400).json({
          success: false,
          message: 'externalId é obrigatório'
        });
      }
      
      const status = await pixupService.checkWithdrawalStatus(externalId);
      
      res.json({
        success: true,
        status: status
      });
      
    } catch (error) {
      console.error('[PIXUP] Erro ao verificar status do saque:', error);
      
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
}

module.exports = PixupController;
