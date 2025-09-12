const { PrismaClient } = require('@prisma/client');
const VizzionPayService = require('../services/vizzionPayService');

const prisma = new PrismaClient();
const vizzionPay = new VizzionPayService();

class PaymentController {
  
  /**
   * POST /api/deposit
   * Criar depósito via PIX
   */
  static async createDeposit(req, res) {
    try {
      const { valor } = req.body;
      const userId = req.user.userId;
      
      if (!valor || Number(valor) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valor deve ser maior que zero'
        });
      }
      
      const valorNumerico = Number(valor);
      
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
      
      // Criar pagamento via VizzionPay
      const payment = await vizzionPay.createPayment({
        userId,
        valor: valorNumerico
      });
      
      console.log(`✅ Depósito PIX criado: ${payment.transaction_id} - R$ ${valorNumerico}`);
      
      res.json({
        success: true,
        message: 'QR Code PIX gerado com sucesso',
        data: {
          transaction_id: payment.transaction_id,
          gateway_id: payment.gateway_id,
          qr_base64: payment.qr_base64,
          qr_text: payment.qr_text,
          amount: payment.amount,
          expires_at: payment.expires_at
        }
      });
      
    } catch (error) {
      console.error('Erro ao criar depósito:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * POST /api/deposit/callback
   * Webhook do VizzionPay para depósitos
   */
  static async depositCallback(req, res) {
    try {
      const signature = req.get('X-Signature') || req.get('signature') || req.get('Authorization');
      const callbackData = req.body;
      
      console.log('📥 Callback de depósito recebido:', JSON.stringify(callbackData, null, 2));
      
      // Processar callback
      await vizzionPay.processCallback(callbackData, signature);
      
      res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('Erro no callback de depósito:', error);
      res.status(200).json({ success: false }); // Retornar 200 para não reenviar
    }
  }
  
  /**
   * POST /api/withdraw
   * Criar saque via PIX
   */
  static async createWithdraw(req, res) {
    try {
      const { valor, pix_key } = req.body;
      const userId = req.user.userId;
      
      if (!valor || Number(valor) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Valor deve ser maior que zero'
        });
      }
      
      if (!pix_key || pix_key.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Chave PIX é obrigatória'
        });
      }
      
      const valorNumerico = Number(valor);
      
      if (valorNumerico < 50.00) {
        return res.status(400).json({
          success: false,
          message: 'Valor mínimo para saque é R$ 50,00'
        });
      }
      
      if (valorNumerico > 5000.00) {
        return res.status(400).json({
          success: false,
          message: 'Valor máximo para saque é R$ 5.000,00'
        });
      }
      
      // Criar saque via VizzionPay
      const withdrawal = await vizzionPay.createWithdrawal({
        userId,
        valor: valorNumerico,
        pixKey: pix_key.trim()
      });
      
      console.log(`✅ Saque PIX criado: ${withdrawal.withdrawal_id} - R$ ${valorNumerico}`);
      
      res.json({
        success: true,
        message: 'Saque solicitado com sucesso',
        data: {
          withdrawal_id: withdrawal.withdrawal_id,
          gateway_id: withdrawal.gateway_id,
          amount: withdrawal.amount,
          status: withdrawal.status,
          pix_key: pix_key
        }
      });
      
    } catch (error) {
      console.error('Erro ao criar saque:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * POST /api/withdraw/callback
   * Webhook do VizzionPay para saques
   */
  static async withdrawCallback(req, res) {
    try {
      const signature = req.get('X-Signature') || req.get('signature') || req.get('Authorization');
      const callbackData = req.body;
      
      console.log('📥 Callback de saque recebido:', JSON.stringify(callbackData, null, 2));
      
      // Processar callback de saque
      await vizzionPay.processWithdrawalCallback(callbackData, signature);
      
      res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('Erro no callback de saque:', error);
      res.status(200).json({ success: false }); // Retornar 200 para não reenviar
    }
  }
  
  /**
   * GET /api/payments/history
   * Histórico de pagamentos do usuário
   */
  static async history(req, res) {
    try {
      const userId = req.user.userId;
      const { page = 1, limit = 20, tipo } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const where = { user_id: userId };
      if (tipo && ['deposito', 'saque'].includes(tipo)) {
        where.tipo = tipo;
      }
      
      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          orderBy: { criado_em: 'desc' },
          skip,
          take: Number(limit),
          select: {
            id: true,
            tipo: true,
            valor: true,
            status: true,
            metodo_pagamento: true,
            pix_key: true,
            criado_em: true,
            processado_em: true,
            expira_em: true
          }
        }),
        prisma.payment.count({ where })
      ]);
      
      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar histórico de pagamentos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/payments/:id
   * Obter detalhes de um pagamento específico
   */
  static async getPayment(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      const payment = await prisma.payment.findFirst({
        where: {
          id,
          user_id: userId
        }
      });
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pagamento não encontrado'
        });
      }
      
      // Não retornar dados sensíveis
      const { gateway_response, ...paymentData } = payment;
      
      res.json({
        success: true,
        data: paymentData
      });
      
    } catch (error) {
      console.error('Erro ao buscar pagamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/payments/:id/status
   * Consultar status atualizado de um pagamento
   */
  static async checkStatus(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      
      const payment = await prisma.payment.findFirst({
        where: {
          id,
          user_id: userId
        }
      });
      
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Pagamento não encontrado'
        });
      }
      
      // Se tem gateway_id, consultar status no VizzionPay
      let statusAtualizado = payment.status;
      
      if (payment.gateway_id && payment.status === 'pendente') {
        try {
          const vizzionStatus = await vizzionPay.getPaymentStatus(payment.gateway_id);
          if (vizzionStatus && vizzionStatus.status) {
            statusAtualizado = vizzionStatus.status;
          }
        } catch (error) {
          console.error('Erro ao consultar status no VizzionPay:', error);
        }
      }
      
      res.json({
        success: true,
        data: {
          id: payment.id,
          status: statusAtualizado,
          valor: payment.valor,
          tipo: payment.tipo,
          criado_em: payment.criado_em,
          processado_em: payment.processado_em,
          expira_em: payment.expira_em
        }
      });
      
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = PaymentController;