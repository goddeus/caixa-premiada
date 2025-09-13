const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

class WithdrawController {
  
  /**
   * POST /api/withdraw/pix
   * Criar saque via PIX usando VizzionPay
   */
  static async createPixWithdraw(req, res) {
    try {
      console.log('[DEBUG] Saque PIX iniciado:', req.body);
      
      const { userId, amount, pixKey } = req.body;
      
      // Validações
      if (!userId || !amount || !pixKey) {
        return res.status(400).json({
          success: false,
          error: 'userId, amount e pixKey são obrigatórios'
        });
      }
      
      const valorNumerico = Number(amount);
      
      if (valorNumerico < 50.00) {
        return res.status(400).json({
          success: false,
          error: 'Valor mínimo para saque é R$ 50,00'
        });
      }
      
      if (valorNumerico > 5000.00) {
        return res.status(400).json({
          success: false,
          error: 'Valor máximo para saque é R$ 5.000,00'
        });
      }
      
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }
      
      // Verificar se é conta demo (não pode sacar)
      if (user.tipo_conta === 'afiliado_demo') {
        return res.status(400).json({
          success: false,
          error: 'Contas demo não podem realizar saques'
        });
      }
      
      // Verificar saldo
      if (user.saldo_reais < valorNumerico) {
        return res.status(400).json({
          success: false,
          error: 'Saldo insuficiente'
        });
      }
      
      // Gerar identifier único
      const timestamp = Date.now();
      const identifier = `withdraw_${userId}_${timestamp}`;
      
      // Preparar dados para VizzionPay
      const vizzionData = {
        identifier,
        amount: valorNumerico,
        pixKey: pixKey.trim(),
        client: {
          name: user.nome || "Usuário SlotBox",
          document: user.cpf || "00000000000",
          email: user.email || "teste@slotbox.shop"
        }
      };
      
      console.log('[DEBUG] Enviando saque para VizzionPay:', JSON.stringify(vizzionData, null, 2));
      
      // Fazer requisição para VizzionPay
      const response = await axios.post('https://app.vizzionpay.com/api/v1/gateway/pix/transfer', vizzionData, {
        headers: {
          'Content-Type': 'application/json',
          'x-public-key': process.env.VIZZION_PUBLIC_KEY,
          'x-secret-key': process.env.VIZZION_SECRET_KEY
        },
        timeout: 30000
      });
      
      console.log('[DEBUG] Resposta VizzionPay saque:', JSON.stringify(response.data, null, 2));
      
      // Processar transação no banco
      await prisma.$transaction(async (tx) => {
        // Debitar saldo do usuário imediatamente
        await tx.user.update({
          where: { id: userId },
          data: { saldo_reais: { decrement: valorNumerico } }
        });
        
        // Criar transação de saque
        await tx.transaction.create({
          data: {
            user_id: userId,
            tipo: 'saque',
            valor: valorNumerico,
            status: 'processando',
            identifier,
            descricao: `Saque PIX para ${pixKey}`,
            criado_em: new Date()
          }
        });
      });
      
      console.log(`[DEBUG] Saque criado: ${identifier} - R$ ${valorNumerico} - Chave: ${pixKey}`);
      
      res.json({
        success: true,
        message: 'Saque em processamento',
        data: {
          identifier,
          amount: valorNumerico,
          pixKey: pixKey,
          status: 'processing'
        }
      });
      
    } catch (error) {
      console.error('[DEBUG] Erro ao criar saque PIX:', error);
      
      if (error.response) {
        console.error('[DEBUG] Resposta de erro VizzionPay:', JSON.stringify(error.response.data, null, 2));
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  }
}

module.exports = WithdrawController;
