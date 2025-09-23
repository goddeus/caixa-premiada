// Solução temporária usando proxy externo
const axios = require('axios');
const crypto = require('crypto');
const QRCode = require('qrcode');
const config = require('../config/index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço temporário usando proxy externo para contornar bloqueio
 */
class PixupServiceProxyExternal {
  
  constructor() {
    this.clientId = config.pixup.clientId;
    this.clientSecret = config.pixup.clientSecret;
    this.apiUrl = config.pixup.apiUrl;
    this.accessToken = null;
    this.tokenExpiresAt = null;
    
    // Usar proxy externo para contornar bloqueio
    this.proxyConfig = {
      host: 'proxy-server.com', // Substituir por proxy real
      port: 8080,
      auth: {
        username: 'username',
        password: 'password'
      }
    };
  }

  /**
   * Autenticar usando proxy externo
   */
  async authenticate() {
    try {
      if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
        return this.accessToken;
      }

      console.log('[PIXUP-PROXY-EXTERNAL] Autenticando via proxy externo...');
      
      const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(`${this.apiUrl}/v2/oauth/token`, {}, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Configuração do proxy (se disponível)
        // proxy: this.proxyConfig,
        timeout: 30000
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000;
      
      console.log('[PIXUP-PROXY-EXTERNAL] Token obtido com sucesso');
      return this.accessToken;
      
    } catch (error) {
      console.error('[PIXUP-PROXY-EXTERNAL] Erro na autenticação:', error.response?.data || error.message);
      throw new Error('Falha na autenticação Pixup: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Criar pagamento PIX
   */
  async createPayment({ userId, valor }) {
    try {
      console.log('[PIXUP-PROXY-EXTERNAL] Criando pagamento:', { userId, valor });
      
      // Autenticar
      await this.authenticate();
      
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      const valorNumerico = parseFloat(valor);
      
      if (valorNumerico < 20.00) {
        throw new Error('Valor mínimo para depósito é R$ 20,00');
      }
      
      if (valorNumerico > 10000.00) {
        throw new Error('Valor máximo para depósito é R$ 10.000,00');
      }
      
      // Gerar external_id único
      const externalId = `deposit_${userId}_${Date.now()}`;
      
      // Criar depósito no banco primeiro
      const deposit = await prisma.deposit.create({
        data: {
          user_id: userId,
          amount: valorNumerico,
          status: 'pending',
          identifier: externalId,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      // Preparar dados para o Pixup
      const paymentData = {
        amount: valorNumerico,
        external_id: externalId,
        payer: {
          name: user.nome || "Usuário SlotBox",
          document: user.cpf?.replace(/\D/g, '') || "00000000000"
        },
        description: `Depósito SlotBox - ${user.nome}`
      };
      
      console.log('[PIXUP-PROXY-EXTERNAL] Enviando para API via proxy externo');
      
      // Fazer chamada para o Pixup via proxy externo
      const response = await axios.post(`${this.apiUrl}/v2/pix/qrcode`, paymentData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Configuração do proxy (se disponível)
        // proxy: this.proxyConfig,
        timeout: 30000
      });
      
      console.log('[PIXUP-PROXY-EXTERNAL] Resposta da API:', JSON.stringify(response.data, null, 2));
      
      if (!response.data) {
        throw new Error('Erro na resposta do Pixup: ' + JSON.stringify(response.data));
      }
      
      const pixupData = response.data;
      
      // Extrair QR Code
      let qrCode = pixupData.qrcode;
      let qrCodeImage = null;
      
      // Gerar imagem do QR Code
      if (qrCode) {
        try {
          qrCodeImage = await QRCode.toDataURL(qrCode, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            }
          });
        } catch (qrError) {
          console.error('[PIXUP-PROXY-EXTERNAL] Erro ao gerar imagem do QR Code:', qrError);
        }
      }
      
      // Validar se QR Code foi extraído
      if (!qrCode) {
        console.error('[PIXUP-PROXY-EXTERNAL] ERRO: QR Code não encontrado na resposta da Pixup');
        throw new Error('QR Code não encontrado na resposta da Pixup');
      }
      
      // Atualizar depósito com dados do Pixup
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: {
          qr_code: qrCode,
          qr_base64: qrCodeImage,
          provider_tx_id: pixupData.transactionId || pixupData.id,
          updated_at: new Date()
        }
      });
      
      console.log(`[PIXUP-PROXY-EXTERNAL] Depósito criado: ${deposit.id} - R$ ${valorNumerico}`);
      
      return {
        success: true,
        external_id: externalId,
        qrCode: qrCode,
        qrCodeImage: qrCodeImage,
        transaction_id: pixupData.transactionId,
        amount: valorNumerico,
        expires_at: new Date(Date.now() + 3600000)
      };
      
    } catch (error) {
      console.error('[PIXUP-PROXY-EXTERNAL] Erro ao criar pagamento:', error);
      throw error;
    }
  }
}

module.exports = PixupServiceProxyExternal;
