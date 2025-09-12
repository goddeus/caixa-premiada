const walletService = require('../services/walletService');

class WalletController {
  // Consultar saldo
  async getBalance(req, res) {
    try {
      const balance = await walletService.getBalance(req.user.id);

      res.json({
        success: true,
        balance
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error.message
      });
    }
  }

  // Fazer depósito
  async deposit(req, res) {
    try {
      const { valor } = req.body;

      if (!valor || valor < 20) {
        return res.status(400).json({
          success: false,
          error: 'Valor mínimo para depósito é R$ 20,00'
        });
      }

      const result = await walletService.deposit(req.user.id, parseFloat(valor));

      res.json({
        success: true,
        message: result.message,
        transaction: result.transaction,
        novo_saldo: result.novo_saldo
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Solicitar saque
  async withdraw(req, res) {
    try {
      const { valor, pix_key } = req.body;

      if (!valor || valor < 20) {
        return res.status(400).json({
          success: false,
          error: 'Valor mínimo para saque é R$ 20,00'
        });
      }

      if (!pix_key) {
        return res.status(400).json({
          success: false,
          error: 'Chave PIX é obrigatória'
        });
      }

      const result = await walletService.withdraw(req.user.id, parseFloat(valor), pix_key);

      res.json({
        success: true,
        message: result.message,
        transaction: result.transaction,
        novo_saldo: result.novo_saldo
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Recarregar saldo demo (apenas para contas demo)
  async rechargeDemo(req, res) {
    try {
      const { valor } = req.body;
      const amount = valor ? parseFloat(valor) : 1000; // Default R$ 1000

      if (amount < 100) {
        return res.status(400).json({
          success: false,
          error: 'Valor mínimo para recarga demo é R$ 100,00'
        });
      }

      if (amount > 10000) {
        return res.status(400).json({
          success: false,
          error: 'Valor máximo para recarga demo é R$ 10.000,00'
        });
      }

      const result = await walletService.rechargeDemoBalance(req.user.id, amount);

      res.json({
        success: true,
        message: result.message,
        novo_saldo_demo: result.novo_saldo_demo
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = WalletController;
