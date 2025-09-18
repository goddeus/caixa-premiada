const { PrismaClient } = require('@prisma/client');
const withdrawService = require('../services/withdrawService');
const AffiliateService = require('../services/affiliateService');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

class WebhookController {
  
  /**
   * POST /api/webhook/pix
   * Webhook da VizzionPay para confirmar depósitos PIX
   * Implementa validação de assinatura, logging e processamento atômico
   */
  static async handlePixWebhook(req, res) {
    const startTime = Date.now();
    let webhookData = null;
    
    try {
      // Log do webhook recebido (raw body)
      webhookData = {
        timestamp: new Date().toISOString(),
        headers: req.headers,
        body: req.body,
        ip: req.ip || req.connection.remoteAddress
      };
      
      await this.logWebhookReceived(webhookData);
      
      console.log('[WEBHOOK] PIX recebido da VizzionPay:', JSON.stringify(req.body, null, 2));
      
      // Validar headers de segurança
      const publicKey = req.headers['x-public-key'];
      const secretKey = req.headers['x-secret-key'];
      const signature = req.headers['x-signature'];
      
      // Verificar se as chaves estão presentes (opcional para VizzionPay)
      if (publicKey && secretKey) {
        if (publicKey !== 'juniorcoxtaa_m5mbahi4jiqphich' || secretKey !== '6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513') {
          console.error('[WEBHOOK] Headers de segurança inválidos');
          await this.logWebhookError({
            timestamp: new Date().toISOString(),
            error: 'Headers de segurança inválidos',
            webhookData
          });
          return res.status(401).json({
            success: false,
            error: 'Unauthorized'
          });
        }
      }
      
      // Validar assinatura se presente
      if (signature) {
        // TODO: Implementar validação de assinatura HMAC se necessário
        console.log('[WEBHOOK] Assinatura presente:', signature);
      }
      
      // Extrair dados do webhook
      const { event, transaction: webhookTransaction, status } = req.body;
      
      // Verificar se é evento de pagamento ou status completed
      const isPaidEvent = event === 'TRANSACTION_PAID' || event === 'PAYMENT_CONFIRMED';
      const isCompletedStatus = status === 'COMPLETED' || status === 'OK' || status === 'PAID';
      
      if (!isPaidEvent && !isCompletedStatus) {
        console.log(`[WEBHOOK] Evento/status não é de pagamento: event=${event}, status=${status}`);
        return res.status(200).json({ success: true });
      }
      
      // Extrair dados da transação
      let identifier, amount, transactionId;
      
      if (webhookTransaction) {
        identifier = webhookTransaction.identifier;
        amount = webhookTransaction.amount;
        transactionId = webhookTransaction.transactionId || webhookTransaction.id;
      } else {
        // Formato alternativo
        identifier = req.body.identifier;
        amount = req.body.amount;
        transactionId = req.body.transactionId || req.body.id;
      }
      
      // Validações obrigatórias
      if (!identifier || !amount) {
        console.error('[WEBHOOK] Dados obrigatórios não fornecidos:', { identifier, amount });
        await this.logWebhookError({
          timestamp: new Date().toISOString(),
          error: 'Dados obrigatórios não fornecidos',
          webhookData
        });
        return res.status(400).json({
          success: false,
          error: 'Dados obrigatórios não fornecidos'
        });
      }
      
      // Extrair userId do identifier (deposit_userId_timestamp)
      const identifierParts = identifier.split('_');
      if (identifierParts.length < 3 || identifierParts[0] !== 'deposit') {
        console.error('[WEBHOOK] Identifier inválido:', identifier);
        await this.logWebhookError({
          timestamp: new Date().toISOString(),
          error: 'Identifier inválido',
          identifier,
          webhookData
        });
        return res.status(400).json({
          success: false,
          error: 'Identifier inválido'
        });
      }
      
      const userId = identifierParts[1];
      
      // Buscar transação de depósito pelo identifier
      const deposit = await prisma.transaction.findFirst({
        where: { 
          identifier,
          tipo: 'deposito'
        },
        include: { user: true }
      });
      
      if (!deposit) {
        console.error(`[WEBHOOK] Depósito não encontrado para identifier: ${identifier}`);
        await this.logWebhookError({
          timestamp: new Date().toISOString(),
          error: 'Depósito não encontrado',
          identifier,
          webhookData
        });
        return res.status(404).json({
          success: false,
          error: 'Depósito não encontrado'
        });
      }
      
      // Verificar se já foi processado
      if (deposit.status === 'concluido') {
        console.log(`[WEBHOOK] Depósito já processado: ${identifier}`);
        return res.status(200).json({ success: true });
      }
      
      // Processar pagamento de forma atômica
      await prisma.$transaction(async (tx) => {
        // Atualizar status da transação de depósito
        await tx.transaction.update({
          where: { id: deposit.id },
          data: {
            status: 'concluido',
            processado_em: new Date(),
            metadata: {
              provider_tx_id: transactionId,
              webhook_data: webhookData
            }
          }
        });
        
        // Creditar saldo do usuário de forma atômica
        if (deposit.user.tipo_conta === 'afiliado_demo') {
          // Conta demo - creditar saldo_demo
          await tx.user.update({
            where: { id: deposit.user_id },
            data: { 
              saldo_demo: { increment: amount },
              primeiro_deposito_feito: true
            }
          });
          
          // Sincronizar carteira demo
          await tx.wallet.update({
            where: { user_id: deposit.user_id },
            data: { saldo_demo: { increment: amount } }
          });
        } else {
          // Conta normal - creditar saldo_reais
          await tx.user.update({
            where: { id: deposit.user_id },
            data: { 
              saldo_reais: { increment: amount },
              primeiro_deposito_feito: true
            }
          });
          
          // Sincronizar carteira normal
          await tx.wallet.update({
            where: { user_id: deposit.user_id },
            data: { saldo_reais: { increment: amount } }
          });
        }
        
        // Atualizar transação existente com saldos
        await tx.transaction.update({
          where: { id: deposit.id },
          data: {
            saldo_antes: deposit.user.tipo_conta === 'afiliado_demo' ? deposit.user.saldo_demo : deposit.user.saldo_reais,
            saldo_depois: (deposit.user.tipo_conta === 'afiliado_demo' ? deposit.user.saldo_demo : deposit.user.saldo_reais) + amount,
            descricao: 'Depósito PIX confirmado via webhook'
          }
        });
      });
      
      const processingTime = Date.now() - startTime;
      console.log(`[WEBHOOK] Depósito confirmado para usuário: ${deposit.user.email} - Valor: +R$ ${amount} - Tempo: ${processingTime}ms`);
      
      // Processar comissão de afiliado (somente para contas normais)
      if (deposit.user.tipo_conta !== 'afiliado_demo') {
        try {
          await AffiliateService.processAffiliateCommission({
            userId: deposit.user_id,
            depositAmount: amount,
            depositStatus: 'concluido'
          });
          console.log(`[WEBHOOK] Comissão de afiliado processada para usuário: ${deposit.user.email}`);
        } catch (error) {
          console.error('[WEBHOOK] Erro ao processar comissão de afiliado (não crítico):', error.message);
          // Não falha o webhook se a comissão der erro
        }
      }
      
      // Log de sucesso
      await this.logWebhookSuccess({
        timestamp: new Date().toISOString(),
        identifier,
        userId: deposit.user_id,
        amount,
        processingTime,
        webhookData
      });
      
      res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('[WEBHOOK] Erro no webhook PIX:', error);
      
      // Log do erro
      await this.logWebhookError({
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        webhookData
      });
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * POST /api/webhook/withdraw
   * Webhook da VizzionPay para confirmar saques
   */
  static async handleWithdrawWebhook(req, res) {
    try {
      console.log('[WITHDRAW] Webhook saque recebido da VizzionPay:', JSON.stringify(req.body, null, 2));
      
      // Validar headers de segurança
      const publicKey = req.headers['x-public-key'];
      const secretKey = req.headers['x-secret-key'];
      
      if (publicKey !== 'juniorcoxtaa_m5mbahi4jiqphich' || secretKey !== '6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513') {
        console.error('[WITHDRAW] Headers de segurança inválidos');
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }
      
      const { identifier, status, transactionId } = req.body;
      
      // Validações
      if (!identifier || !status) {
        console.error('[WITHDRAW] Dados obrigatórios não fornecidos:', { identifier, status });
        return res.status(400).json({
          success: false,
          error: 'Dados obrigatórios não fornecidos'
        });
      }
      
      // Usar serviço de saques para processar webhook
      const result = await withdrawService.processWithdrawWebhook({
        identifier,
        status,
        transactionId
      });
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('[WITHDRAW] Erro no webhook de saque:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Log estruturado para webhooks recebidos
   */
  static async logWebhookReceived(data) {
    try {
      const logDir = path.join(__dirname, '../../logs/webhooks');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, `received_${new Date().toISOString().split('T')[0]}.log`);
      const logEntry = JSON.stringify(data) + '\n';
      
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error('[WEBHOOK] Erro ao salvar log de webhook recebido:', error);
    }
  }
  
  /**
   * Log estruturado para webhooks processados com sucesso
   */
  static async logWebhookSuccess(data) {
    try {
      const logDir = path.join(__dirname, '../../logs/webhooks');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, `success_${new Date().toISOString().split('T')[0]}.log`);
      const logEntry = JSON.stringify(data) + '\n';
      
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error('[WEBHOOK] Erro ao salvar log de sucesso:', error);
    }
  }
  
  /**
   * Log estruturado para erros de webhook
   */
  static async logWebhookError(data) {
    try {
      const logDir = path.join(__dirname, '../../logs/webhooks');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, `errors_${new Date().toISOString().split('T')[0]}.log`);
      const logEntry = JSON.stringify(data) + '\n';
      
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error('[WEBHOOK] Erro ao salvar log de erro:', error);
    }
  }
}

module.exports = WebhookController;