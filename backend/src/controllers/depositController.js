const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

class DepositController {
  
  /**
   * POST /api/deposit/pix
   * Criar depósito via PIX usando VizzionPay
   */
  static async createPixDeposit(req, res) {
    try {
      console.log('[DEBUG] Depósito PIX iniciado:', req.body);
      
      const { userId, amount } = req.body;
      
      // Validações
      if (!userId || !amount) {
        return res.status(400).json({
          success: false,
          error: 'userId e amount são obrigatórios'
        });
      }
      
      const valorNumerico = Number(amount);
      
      if (valorNumerico < 20.00) {
        return res.status(400).json({
          success: false,
          error: 'Valor mínimo para depósito é R$ 20,00'
        });
      }
      
      if (valorNumerico > 10000.00) {
        return res.status(400).json({
          success: false,
          error: 'Valor máximo para depósito é R$ 10.000,00'
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
      
      // Gerar identifier único
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
      const response = await axios.post('https://app.vizzionpay.com/api/v1/gateway/pix/receive', vizzionData, {
        headers: {
          'Content-Type': 'application/json',
          'x-public-key': process.env.VIZZION_PUBLIC_KEY,
          'x-secret-key': process.env.VIZZION_SECRET_KEY
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
        error: error.message || 'Erro interno do servidor'
      });
    }
  }
}

module.exports = DepositController;
