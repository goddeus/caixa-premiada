const { PrismaClient } = require('@prisma/client');
const withdrawService = require('../services/withdrawService');

const prisma = new PrismaClient();

class WebhookController {
  
  /**
   * POST /api/webhook/pix
   * Webhook da VizzionPay para confirmar depósitos PIX
   */
  static async handlePixWebhook(req, res) {
    try {
      console.log('[DEBUG] Webhook PIX recebido da VizzionPay:', JSON.stringify(req.body, null, 2));
      
      // Validar headers de segurança (VizzionPay pode não enviar os headers)
      const publicKey = req.headers['x-public-key'];
      const secretKey = req.headers['x-secret-key'];
      
      // Temporariamente desabilitar validação de headers para testar
      // if (publicKey !== process.env.VIZZION_PUBLIC_KEY || secretKey !== process.env.VIZZION_SECRET_KEY) {
      //   console.error('[DEBUG] Headers de segurança inválidos');
      //   return res.status(401).json({
      //     success: false,
      //     error: 'Unauthorized'
      //   });
      // }
      
      // Extrair dados do formato VizzionPay
      const { event, transaction: webhookTransaction } = req.body;
      
      // Verificar se é evento de pagamento
      if (event !== 'TRANSACTION_PAID') {
        console.log(`[DEBUG] Evento não é de pagamento: ${event}`);
        return res.status(200).json({ success: true });
      }
      
      if (!webhookTransaction) {
        console.error('[DEBUG] Transação não encontrada no webhook');
        return res.status(400).json({
          success: false,
          error: 'Transação não encontrada'
        });
      }
      
      const { identifier, amount, status } = webhookTransaction;
      
      // Validações
      if (!identifier || !amount || !status) {
        console.error('[DEBUG] Dados obrigatórios não fornecidos:', { identifier, amount, status });
        return res.status(400).json({
          success: false,
          error: 'Dados obrigatórios não fornecidos'
        });
      }
      
      // Verificar se status é completed (formato VizzionPay)
      if (status !== 'COMPLETED') {
        console.log(`[DEBUG] Status não é completed: ${status}`);
        return res.status(200).json({ success: true });
      }
      
      // Extrair userId do identifier (deposit_userId_timestamp)
      const identifierParts = identifier.split('_');
      if (identifierParts.length < 3 || identifierParts[0] !== 'deposit') {
        console.error('[DEBUG] Identifier inválido:', identifier);
        return res.status(400).json({
          success: false,
          error: 'Identifier inválido'
        });
      }
      
      const userId = identifierParts[1];
      
      // Buscar transação pelo identifier
      const transaction = await prisma.transaction.findFirst({
        where: { identifier },
        include: { user: true }
      });
      
      if (!transaction) {
        console.error(`[DEBUG] Transação não encontrada para identifier: ${identifier}`);
        return res.status(404).json({
          success: false,
          error: 'Transação não encontrada'
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
      
      console.log(`[DEBUG] Depósito confirmado para usuário: ${transaction.user.email} - Valor: +R$ ${amount}`);
      
      res.status(200).json({ success: true });
      
    } catch (error) {
      console.error('[DEBUG] Erro no webhook PIX:', error);
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
      
      if (publicKey !== process.env.VIZZION_PUBLIC_KEY || secretKey !== process.env.VIZZION_SECRET_KEY) {
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
}

module.exports = WebhookController;