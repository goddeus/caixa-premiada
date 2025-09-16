const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

class DepositController {
  
  /**
   * POST /api/deposit/pix
   * Criar depósito via PIX usando VizzionPay
   * Implementa idempotência e logging estruturado
   */
  static async createPixDeposit(req, res) {
    const startTime = Date.now();
    let deposit = null;
    
    try {
      console.log('[DEPOSIT] Iniciando criação de depósito PIX:', req.body);
      
      const { userId, amount } = req.body;
      
      // Validações básicas
      if (!userId || !amount) {
        return res.status(400).json({
          success: false,
          error: 'userId e amount são obrigatórios'
        });
      }
      
      const valorNumerico = Number(amount);
      const MIN_DEPOSIT = 20.00;
      const MAX_DEPOSIT = 10000.00;
      
      if (valorNumerico < MIN_DEPOSIT) {
        return res.status(400).json({
          success: false,
          error: `Valor mínimo para depósito é R$ ${MIN_DEPOSIT.toFixed(2)}`
        });
      }
      
      if (valorNumerico > MAX_DEPOSIT) {
        return res.status(400).json({
          success: false,
          error: `Valor máximo para depósito é R$ ${MAX_DEPOSIT.toFixed(2)}`
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
      
      // Gerar identifier único com idempotência
      const timestamp = Date.now();
      const identifier = `deposit_${userId}_${timestamp}`;
      
      // Verificar se já existe depósito pendente para este usuário (idempotência)
      const existingDeposit = await prisma.deposit.findFirst({
        where: {
          user_id: userId,
          status: 'pending',
          amount: valorNumerico,
          created_at: {
            gte: new Date(Date.now() - 5 * 60 * 1000) // Últimos 5 minutos
          }
        }
      });
      
      if (existingDeposit) {
        console.log('[DEPOSIT] Depósito idempotente encontrado:', existingDeposit.identifier);
        return res.json({
          success: true,
          qrCode: existingDeposit.qr_code,
          qrCodeImage: existingDeposit.qr_base64,
          identifier: existingDeposit.identifier
        });
      }
      
      // Criar registro de depósito no banco (com status pending)
      deposit = await prisma.deposit.create({
        data: {
          user_id: userId,
          amount: valorNumerico,
          status: 'pending',
          identifier,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      console.log('[DEPOSIT] Registro criado no banco:', deposit.id);
      
      // Preparar dados para VizzionPay
      const vizzionData = {
        identifier,
        amount: valorNumerico,
        client: {
          name: user.nome || "Usuário SlotBox",
          document: user.cpf || "00000000000",
          email: user.email || "teste@slotbox.shop",
          phone: user.telefone || "11999999999"
        },
        products: [
          {
            id: `deposit_${timestamp}`,
            name: "Depósito em saldo",
            price: valorNumerico,
            quantity: 1
          }
        ]
      };
      
      // Log da requisição (sanitizada)
      const logData = {
        timestamp: new Date().toISOString(),
        identifier,
        userId,
        amount: valorNumerico,
        request: {
          ...vizzionData,
          client: {
            ...vizzionData.client,
            document: vizzionData.client.document ? '***sanitized***' : null
          }
        }
      };
      
      await this.logVizzionRequest(logData);
      
      console.log('[DEPOSIT] Enviando para VizzionPay:', JSON.stringify(vizzionData, null, 2));
      
      // Fazer requisição para VizzionPay
      const response = await axios.post('https://app.vizzionpay.com/api/v1/gateway/pix/receive', vizzionData, {
        headers: {
          'Content-Type': 'application/json',
          'x-public-key': process.env.VIZZION_PUBLIC_KEY,
          'x-secret-key': process.env.VIZZION_SECRET_KEY
        },
        timeout: 30000
      });
      
      console.log('[DEPOSIT] Resposta VizzionPay:', JSON.stringify(response.data, null, 2));
      
      // Log da resposta
      await this.logVizzionResponse({
        timestamp: new Date().toISOString(),
        identifier,
        response: response.data
      });
      
      // Extrair dados da resposta
      const responseData = response.data;
      let qrCode = null;
      let qrCodeImage = null;
      let transactionId = responseData.transactionId || responseData.id || null;
      
      // Extrair dados do formato VizzionPay
      if (responseData.pix && responseData.pix.code) {
        qrCode = responseData.pix.code;
      }
      
      if (responseData.pix && responseData.pix.base64) {
        qrCodeImage = responseData.pix.base64;
      }
      
      // Fallback para outros formatos possíveis
      if (!qrCode) {
        if (responseData.qrCode) {
          qrCode = responseData.qrCode;
        } else if (responseData.pix_copy_paste) {
          qrCode = responseData.pix_copy_paste;
        } else if (responseData.qr_code_text) {
          qrCode = responseData.qr_code_text;
        } else if (responseData.emv) {
          qrCode = responseData.emv;
        }
      }
      
      if (!qrCodeImage) {
        if (responseData.qrCodeImage) {
          qrCodeImage = responseData.qrCodeImage;
        } else if (responseData.qr_code_base64) {
          qrCodeImage = responseData.qr_code_base64;
        } else if (responseData.qr_code) {
          qrCodeImage = responseData.qr_code;
        }
      }
      
      // Atualizar registro no banco com dados do PIX
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: {
          qr_code: qrCode,
          qr_base64: qrCodeImage,
          provider_tx_id: transactionId,
          updated_at: new Date()
        }
      });
      
      console.log(`[DEPOSIT] Depósito criado com sucesso: ${deposit.id} - R$ ${valorNumerico}`);
      
      const processingTime = Date.now() - startTime;
      console.log(`[DEPOSIT] Tempo de processamento: ${processingTime}ms`);
      
      res.json({
        success: true,
        qrCode,
        qrCodeImage,
        identifier
      });
      
    } catch (error) {
      console.error('[DEPOSIT] Erro ao criar depósito PIX:', error);
      
      // Log do erro
      await this.logVizzionError({
        timestamp: new Date().toISOString(),
        identifier: deposit?.identifier || 'unknown',
        error: error.message,
        response: error.response?.data || null
      });
      
      // Se o depósito foi criado mas falhou na integração, marcar como erro
      if (deposit) {
        try {
          await prisma.deposit.update({
            where: { id: deposit.id },
            data: {
              status: 'error',
              updated_at: new Date()
            }
          });
        } catch (updateError) {
          console.error('[DEPOSIT] Erro ao atualizar status do depósito:', updateError);
        }
      }
      
      if (error.response) {
        console.error('[DEPOSIT] Resposta de erro VizzionPay:', JSON.stringify(error.response.data, null, 2));
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Log estruturado para requisições VizzionPay
   */
  static async logVizzionRequest(data) {
    try {
      const logDir = path.join(__dirname, '../../logs/vizzion');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, `requests_${new Date().toISOString().split('T')[0]}.log`);
      const logEntry = JSON.stringify(data) + '\n';
      
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error('[DEPOSIT] Erro ao salvar log de requisição:', error);
    }
  }
  
  /**
   * Log estruturado para respostas VizzionPay
   */
  static async logVizzionResponse(data) {
    try {
      const logDir = path.join(__dirname, '../../logs/vizzion');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, `responses_${new Date().toISOString().split('T')[0]}.log`);
      const logEntry = JSON.stringify(data) + '\n';
      
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error('[DEPOSIT] Erro ao salvar log de resposta:', error);
    }
  }
  
  /**
   * Log estruturado para erros VizzionPay
   */
  static async logVizzionError(data) {
    try {
      const logDir = path.join(__dirname, '../../logs/vizzion');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, `errors_${new Date().toISOString().split('T')[0]}.log`);
      const logEntry = JSON.stringify(data) + '\n';
      
      fs.appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error('[DEPOSIT] Erro ao salvar log de erro:', error);
    }
  }
}

module.exports = DepositController;
