const { PrismaClient } = require('@prisma/client');
const VizzionPayService = require('../services/vizzionPayService');

const prisma = new PrismaClient();
const vizzionPay = new VizzionPayService();

class PaymentController {
  
  /**
   * POST /api/deposit/pix
   * Criar depósito via PIX usando nova integração VizzionPay
   */
  static async createDepositPix(req, res) {
    try {
      console.log('[DEBUG] Depósito PIX iniciado:', req.body);
      
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
      
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }
      
      // Criar identifier único
      const timestamp = Date.now();
      const identifier = `deposit_${userId}_${timestamp}`;
      
      // Preparar dados para VizzionPay
      const vizzionData = {
        identifier,
        amount: valorNumerico,
        client: {
          name: user.nome || "Usuário SlotBox",
          document: user.cpf || "00000000000",
          email: user.email || "teste@slotbox.shop"
        },
        products: [
          {
            title: "Depósito em saldo",
            unitPrice: valorNumerico,
            quantity: 1
          }
        ]
      };
      
      console.log('[DEBUG] Enviando para VizzionPay:', JSON.stringify(vizzionData, null, 2));
      
      // Fazer requisição para VizzionPay
      const axios = require('axios');
      const response = await axios.post('https://app.vizzionpay.com/api/v1/gateway/pix/receive', vizzionData, {
        headers: {
          'Content-Type': 'application/json',
          'x-public-key': 'juniorcoxtaa_m5mbahi4jiqphich',
          'x-secret-key': '6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513'
        },
        timeout: 30000
      });
      
      console.log('[DEBUG] Resposta VizzionPay:', JSON.stringify(response.data, null, 2));
      
      // Extrair dados da resposta
      const responseData = response.data;
      let qrCode = null;
      let qrCodeImage = null;
      
      // Buscar QR Code na resposta (diferentes formatos possíveis)
      if (responseData.qrCode) {
        qrCode = responseData.qrCode;
      } else if (responseData.pix_copy_paste) {
        qrCode = responseData.pix_copy_paste;
      } else if (responseData.qr_code_text) {
        qrCode = responseData.qr_code_text;
      } else if (responseData.emv) {
        qrCode = responseData.emv;
      }
      
      // Buscar imagem do QR Code
      if (responseData.qrCodeImage) {
        qrCodeImage = responseData.qrCodeImage;
      } else if (responseData.qr_code_base64) {
        qrCodeImage = responseData.qr_code_base64;
      } else if (responseData.qr_code) {
        qrCodeImage = responseData.qr_code;
      }
      
      // Salvar transação no banco
      const transaction = await prisma.transaction.create({
        data: {
          user_id: userId,
          tipo: 'deposito',
          valor: valorNumerico,
          status: 'pendente',
          identifier,
          criado_em: new Date()
        }
      });
      
      console.log(`[DEBUG] Transação criada: ${transaction.id} - R$ ${valorNumerico}`);
      
      res.json({
        success: true,
        qrCode,
        qrCodeImage,
        identifier
      });
      
    } catch (error) {
      console.error('[DEBUG] Erro ao criar depósito PIX:', error);
      
      if (error.response) {
        console.error('[DEBUG] Resposta de erro VizzionPay:', JSON.stringify(error.response.data, null, 2));
      }
      
      res.status(500).json({
        success: false,
        message: error.message || 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * POST /api/deposit
   * Criar depósito via PIX
   */
  static async createDeposit(req, res) {
    try {
      const { valor } = req.body;
      const userId = req.user.id;
      
      // Bloquear depósitos para contas demo (sem mencionar que é demo)
      if (req.user.tipo_conta === 'afiliado_demo') {
        return res.status(400).json({
          success: false,
          message: 'Depósito temporariamente indisponível. Tente novamente mais tarde.'
        });
      }
      
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
   * POST /api/webhook/vizzion
   * Webhook da VizzionPay para processar pagamentos
   */
  static async vizzionWebhook(req, res) {
    try {
      console.log('[DEBUG] Webhook VizzionPay recebido:', JSON.stringify(req.body, null, 2));
      
      const { evento } = req.body;
      
      if (!evento) {
        return res.status(400).json({
          success: false,
          message: 'Evento não fornecido'
        });
      }
      
      // Processar apenas eventos de pagamento confirmado
      if (evento.event === "TRANSACTION_PAID") {
        const { identifier, amount } = evento;
        
        if (!identifier || !amount) {
          console.error('[DEBUG] Webhook sem identifier ou amount:', evento);
          return res.status(400).json({
            success: false,
            message: 'Identifier ou amount não fornecidos'
          });
        }
        
        // Buscar transação pelo identifier
        const transaction = await prisma.transaction.findFirst({
          where: { identifier },
          include: { user: true }
        });
        
        if (!transaction) {
          console.error(`[DEBUG] Transação não encontrada para identifier: ${identifier}`);
          return res.status(404).json({
            success: false,
            message: 'Transação não encontrada'
          });
        }
        
        // Verificar se já foi processada
        if (transaction.status === 'concluido') {
          console.log(`[DEBUG] Transação já processada: ${identifier}`);
          return res.status(200).json({ success: true });
        }
        
        // Processar pagamento
        await prisma.$transaction(async (tx) => {
          // Atualizar status da transação
          await tx.transaction.update({
            where: { id: transaction.id },
            data: {
              status: 'concluido',
              processado_em: new Date()
            }
          });
          
          // Creditar saldo do usuário
          if (transaction.user.tipo_conta === 'afiliado_demo') {
            // Conta demo - creditar saldo_demo
            await tx.user.update({
              where: { id: transaction.user_id },
              data: { saldo_demo: { increment: amount } }
            });
          } else {
            // Conta normal - creditar saldo_reais
            await tx.user.update({
              where: { id: transaction.user_id },
              data: { saldo_reais: { increment: amount } }
            });
          }
        });
        
        console.log(`[DEBUG] Pagamento processado com sucesso: ${identifier} - R$ ${amount} - ${transaction.user.email}`);
      }
      
      res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('[DEBUG] Erro no webhook VizzionPay:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
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
      const userId = req.user.id;
      
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
      const userId = req.user.id;
      
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