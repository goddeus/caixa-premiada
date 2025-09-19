const withdrawService = require('../services/withdrawService');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class WithdrawController {
  
  /**
   * Verificar e criar tabelas se necessário
   */
  static async ensureTablesExist() {
    try {
      // Verificar se a tabela withdrawals existe
      await prisma.$queryRaw`SELECT 1 FROM "withdrawals" LIMIT 1`;
      return true;
    } catch (error) {
      console.log('🔧 Tabela withdrawals não existe, criando...');
      
      try {
        await prisma.$executeRaw`
          CREATE TABLE "withdrawals" (
            "id" TEXT NOT NULL,
            "user_id" TEXT NOT NULL,
            "amount" DOUBLE PRECISION NOT NULL,
            "pix_key" TEXT NOT NULL,
            "pix_key_type" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'processing',
            "provider_tx_id" TEXT,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "withdrawals_pkey" PRIMARY KEY ("id")
          );
        `;
        
        await prisma.$executeRaw`CREATE INDEX "withdrawals_user_id_idx" ON "withdrawals"("user_id");`;
        await prisma.$executeRaw`CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");`;
        
        console.log('✅ Tabela withdrawals criada com sucesso');
        return true;
      } catch (createError) {
        console.error('❌ Erro ao criar tabela withdrawals:', createError);
        return false;
      }
    }
  }
  
  /**
   * POST /api/withdraw/pix
   * Criar saque via PIX usando VizzionPay
   */
  static async createPixWithdraw(req, res) {
    try {
      console.log('[WITHDRAW] Saque PIX iniciado:', req.body);
      
      // Verificar e criar tabelas se necessário
      const tablesReady = await this.ensureTablesExist();
      if (!tablesReady) {
        return res.status(500).json({
          success: false,
          error: 'Erro ao inicializar tabelas de saque'
        });
      }
      
      const { amount, pixKey, pixKeyType } = req.body;
      const userId = req.user.id; // Usar ID do usuário autenticado
      
      // Usar serviço de saques
      const result = await withdrawService.createWithdraw({
        userId,
        amount,
        pixKey,
        pixKeyType
      });
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json({
        success: true,
        message: 'Saque em processamento',
        data: result.data
      });
      
    } catch (error) {
      console.error('[WITHDRAW] Erro ao criar saque PIX:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/withdraw/history
   * Obter histórico de saques do usuário
   */
  static async getWithdrawHistory(req, res) {
    try {
      const userId = req.user.id; // Usar ID do usuário autenticado
      const { page = 1, limit = 20 } = req.query;
      
      const result = await withdrawService.getWithdrawHistory(userId, {
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json(result);
      
    } catch (error) {
      console.error('[WITHDRAW] Erro ao obter histórico:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * GET /api/withdraw/stats (Admin)
   * Obter estatísticas de saques
   */
  static async getWithdrawStats(req, res) {
    try {
      const result = await withdrawService.getWithdrawStats();
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json(result);
      
    } catch (error) {
      console.error('[WITHDRAW] Erro ao obter estatísticas:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }

  /**
   * GET /api/withdraw/all (Admin)
   * Obter todos os saques
   */
  static async getAllWithdrawals(req, res) {
    try {
      const { page = 1, limit = 50, status } = req.query;
      
      const result = await withdrawService.getAllWithdrawals({
        page: parseInt(page),
        limit: parseInt(limit),
        status
      });
      
      if (!result.success) {
        return res.status(500).json(result);
      }
      
      res.json(result);
      
    } catch (error) {
      console.error('[WITHDRAW] Erro ao obter todos os saques:', error);
      
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = WithdrawController;
