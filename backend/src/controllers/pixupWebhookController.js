const { PrismaClient } = require('@prisma/client');
const AffiliateService = require('../services/affiliateService');

const prisma = new PrismaClient();

class PixupWebhookController {
  
  /**
   * POST /api/webhook/pixup/payment
   * Webhook do Pixup para confirmar depósitos PIX
   */
  static async handlePaymentWebhook(req, res) {
    const startTime = Date.now();
    let webhookData = null;
    
    try {
      // Log do webhook recebido
      webhookData = {
        timestamp: new Date().toISOString(),
        headers: req.headers,
        body: req.body,
        ip: req.ip || req.connection.remoteAddress
      };
      
      await this.logWebhookReceived(webhookData);
      
      console.log('[PIXUP WEBHOOK] Pagamento recebido:', JSON.stringify(req.body, null, 2));
      
      const { external_id, status, transaction_id, amount } = req.body;
      
      if (!external_id || !status) {
        console.log('[PIXUP WEBHOOK] Dados incompletos no webhook');
        return res.status(400).json({ success: false, message: 'Dados incompletos' });
      }
      
      // Buscar depósito no banco
      const deposit = await prisma.deposit.findFirst({
        where: { identifier: external_id },
        include: { user: true }
      });
      
      if (!deposit) {
        console.log('[PIXUP WEBHOOK] Depósito não encontrado:', external_id);
        return res.status(404).json({ success: false, message: 'Depósito não encontrado' });
      }
      
      console.log('[PIXUP WEBHOOK] Depósito encontrado:', deposit.id, 'Status atual:', deposit.status);
      
      // Verificar se já foi processado
      if (deposit.status === 'paid') {
        console.log('[PIXUP WEBHOOK] Depósito já foi processado');
        return res.status(200).json({ success: true, message: 'Já processado' });
      }
      
      // Processar apenas se status for PAID ou equivalente
      if (status === 'PAID' || status === 'paid' || status === 'APPROVED' || status === 'approved') {
        console.log('[PIXUP WEBHOOK] Processando depósito pago:', deposit.id);
        
        await this.processPaidDeposit(deposit, webhookData);
        
        console.log('[PIXUP WEBHOOK] Depósito processado com sucesso:', deposit.id);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Depósito processado com sucesso',
          deposit_id: deposit.id
        });
      } else if (status === 'EXPIRED' || status === 'expired' || status === 'FAILED' || status === 'failed') {
        console.log('[PIXUP WEBHOOK] Depósito expirado/falhado:', deposit.id, 'Status:', status);
        
        await prisma.deposit.update({
          where: { id: deposit.id },
          data: { 
            status: 'expired',
            updated_at: new Date()
          }
        });
        
        return res.status(200).json({ 
          success: true, 
          message: 'Depósito marcado como expirado',
          deposit_id: deposit.id
        });
      } else {
        console.log('[PIXUP WEBHOOK] Status não reconhecido:', status);
        return res.status(200).json({ 
          success: true, 
          message: 'Status não reconhecido, mantendo pendente' 
        });
      }
      
    } catch (error) {
      console.error('[PIXUP WEBHOOK] Erro ao processar webhook:', error);
      
      // Log do erro
      await this.logWebhookError(webhookData, error);
      
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }
  
  /**
   * POST /api/webhook/pixup/transfer
   * Webhook do Pixup para confirmar transferências/saques
   */
  static async handleTransferWebhook(req, res) {
    const startTime = Date.now();
    let webhookData = null;
    
    try {
      // Log do webhook recebido
      webhookData = {
        timestamp: new Date().toISOString(),
        headers: req.headers,
        body: req.body,
        ip: req.ip || req.connection.remoteAddress
      };
      
      await this.logWebhookReceived(webhookData);
      
      console.log('[PIXUP WEBHOOK] Transferência recebida:', JSON.stringify(req.body, null, 2));
      
      const { external_id, status, transaction_id, amount } = req.body;
      
      if (!external_id || !status) {
        console.log('[PIXUP WEBHOOK] Dados incompletos no webhook de transferência');
        return res.status(400).json({ success: false, message: 'Dados incompletos' });
      }
      
      // Buscar saque no banco
      const withdrawal = await prisma.withdrawal.findFirst({
        where: { 
          OR: [
            { provider_tx_id: external_id },
            { provider_tx_id: transaction_id }
          ]
        },
        include: { user: true }
      });
      
      if (!withdrawal) {
        console.log('[PIXUP WEBHOOK] Saque não encontrado:', external_id);
        return res.status(404).json({ success: false, message: 'Saque não encontrado' });
      }
      
      console.log('[PIXUP WEBHOOK] Saque encontrado:', withdrawal.id, 'Status atual:', withdrawal.status);
      
      // Verificar se já foi processado
      if (withdrawal.status === 'approved' || withdrawal.status === 'failed') {
        console.log('[PIXUP WEBHOOK] Saque já foi processado');
        return res.status(200).json({ success: true, message: 'Já processado' });
      }
      
      // Processar status do saque
      if (status === 'APPROVED' || status === 'approved' || status === 'COMPLETED' || status === 'completed') {
        console.log('[PIXUP WEBHOOK] Saque aprovado:', withdrawal.id);
        
        await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: { 
            status: 'approved',
            updated_at: new Date()
          }
        });
        
        // Atualizar transação
        await prisma.transaction.updateMany({
          where: { 
            identifier: external_id,
            tipo: 'withdraw'
          },
          data: { 
            status: 'completed',
            processado_em: new Date()
          }
        });
        
        return res.status(200).json({ 
          success: true, 
          message: 'Saque aprovado com sucesso',
          withdrawal_id: withdrawal.id
        });
        
      } else if (status === 'FAILED' || status === 'failed' || status === 'REJECTED' || status === 'rejected') {
        console.log('[PIXUP WEBHOOK] Saque falhado:', withdrawal.id, 'Status:', status);
        
        await prisma.withdrawal.update({
          where: { id: withdrawal.id },
          data: { 
            status: 'failed',
            updated_at: new Date()
          }
        });
        
        // Reverter saldo do usuário
        await prisma.user.update({
          where: { id: withdrawal.user_id },
          data: {
            saldo_reais: {
              increment: withdrawal.amount
            }
          }
        });
        
        // Atualizar transação
        await prisma.transaction.updateMany({
          where: { 
            identifier: external_id,
            tipo: 'withdraw'
          },
          data: { 
            status: 'failed',
            processado_em: new Date()
          }
        });
        
        // Criar transação de reversão
        await prisma.transaction.create({
          data: {
            user_id: withdrawal.user_id,
            tipo: 'withdraw_reversal',
            valor: withdrawal.amount,
            status: 'completed',
            identifier: `reversal_${external_id}`,
            descricao: `Reversão de saque falhado - ${external_id}`,
            criado_em: new Date()
          }
        });
        
        return res.status(200).json({ 
          success: true, 
          message: 'Saque marcado como falhado e saldo revertido',
          withdrawal_id: withdrawal.id
        });
      } else {
        console.log('[PIXUP WEBHOOK] Status de saque não reconhecido:', status);
        return res.status(200).json({ 
          success: true, 
          message: 'Status não reconhecido, mantendo processando' 
        });
      }
      
    } catch (error) {
      console.error('[PIXUP WEBHOOK] Erro ao processar webhook de transferência:', error);
      
      // Log do erro
      await this.logWebhookError(webhookData, error);
      
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }
  
  /**
   * Processar depósito pago
   */
  static async processPaidDeposit(deposit, webhookData) {
    try {
      // Atualizar status do depósito
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: { 
          status: 'paid',
          updated_at: new Date()
        }
      });
      
      // Atualizar saldo do usuário
      await prisma.user.update({
        where: { id: deposit.user_id },
        data: {
          saldo_reais: {
            increment: deposit.amount
          },
          primeiro_deposito_feito: true
        }
      });
      
      // Criar transação de depósito
      await prisma.transaction.create({
        data: {
          user_id: deposit.user_id,
          tipo: 'deposit',
          valor: deposit.amount,
          status: 'completed',
          identifier: deposit.identifier,
          related_id: deposit.id,
          descricao: `Depósito PIX - ${deposit.amount.toFixed(2)}`,
          criado_em: new Date(),
          processado_em: new Date()
        }
      });
      
      // Processar afiliados se aplicável
      if (deposit.user.affiliate_id) {
        try {
          await AffiliateService.processAffiliateCommission({
            userId: deposit.user_id,
            amount: deposit.amount,
            type: 'deposit'
          });
        } catch (affiliateError) {
          console.error('[PIXUP WEBHOOK] Erro ao processar comissão de afiliado:', affiliateError);
        }
      }
      
      console.log('[PIXUP WEBHOOK] Depósito processado:', deposit.id, 'Valor:', deposit.amount);
      
    } catch (error) {
      console.error('[PIXUP WEBHOOK] Erro ao processar depósito pago:', error);
      throw error;
    }
  }
  
  /**
   * Log webhook recebido
   */
  static async logWebhookReceived(webhookData) {
    try {
      const logFile = `logs/pixup_webhook_${new Date().toISOString().split('T')[0]}.log`;
      const logEntry = `${new Date().toISOString()} - WEBHOOK RECEBIDO:\n${JSON.stringify(webhookData, null, 2)}\n\n`;
      
      require('fs').appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error('[PIXUP WEBHOOK] Erro ao logar webhook:', error);
    }
  }
  
  /**
   * Log erro de webhook
   */
  static async logWebhookError(webhookData, error) {
    try {
      const logFile = `logs/pixup_webhook_error_${new Date().toISOString().split('T')[0]}.log`;
      const logEntry = `${new Date().toISOString()} - ERRO WEBHOOK:\n${JSON.stringify(webhookData, null, 2)}\nERRO: ${error.message}\n${error.stack}\n\n`;
      
      require('fs').appendFileSync(logFile, logEntry);
    } catch (logError) {
      console.error('[PIXUP WEBHOOK] Erro ao logar erro de webhook:', logError);
    }
  }
}

module.exports = PixupWebhookController;
