const axios = require('axios');
const crypto = require('crypto');
const QRCode = require('qrcode');
const config = require('../config/index');
const { PrismaClient } = require('@prisma/client');
const AffiliateService = require('./affiliateService');

const prisma = new PrismaClient();

/**
 * Serviço de integração com Pixup para PIX
 * Implementação conforme especificação do prompt
 */
class PixupService {
  
  constructor() {
    this.clientId = config.pixup.clientId;
    this.clientSecret = config.pixup.clientSecret;
    this.baseUrl = config.pixup.apiUrl; // URL já inclui /v2/
    this.accessToken = null;
    this.tokenExpiresAt = null;
    
    // Configurar cliente HTTP
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SlotBox-Render/1.0'
      }
    });
  }

  /**
   * Autenticar e obter token de acesso
   */
  async authenticate() {
    try {
      if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
        return this.accessToken;
      }

      console.log('[PIXUP] Autenticando...');
      
      // Pixup usa Basic Auth no header
      const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await this.client.post('/oauth/token', {}, {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000; // 1 minuto de margem
      
      console.log('[PIXUP] Token obtido com sucesso');
      return this.accessToken;
      
    } catch (error) {
      console.error('[PIXUP] Erro na autenticação:', error.response?.data || error.message);
      throw new Error('Falha na autenticação Pixup: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Criar pagamento PIX
   */
  async createPayment({ userId, valor }) {
    try {
      console.log('[PIXUP] Criando pagamento:', { userId, valor });
      
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
      
      // Preparar dados para o Pixup (estrutura correta)
      const paymentData = {
        amount: valorNumerico,
        external_id: externalId,
        payer: {
          name: user.nome || "Usuário SlotBox",
          document: user.cpf?.replace(/\D/g, '') || "00000000000"
        },
        description: `Depósito SlotBox - ${user.nome}`,
        postbackUrl: `${config.frontend.url}/api/pixup/webhook/payment`
      };
      
      console.log('[PIXUP] Enviando para API:', JSON.stringify(paymentData, null, 2));
      
      // Fazer chamada para o Pixup (endpoint correto)
      const response = await this.client.post('/pix/qrcode', paymentData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      console.log('[PIXUP] Resposta da API:', JSON.stringify(response.data, null, 2));
      
      if (!response.data) {
        throw new Error('Erro na resposta do Pixup: ' + JSON.stringify(response.data));
      }
      
      const pixupData = response.data;
      
      // Extrair dados do QR Code com fallbacks
      let qrCode = null;
      let qrCodeImage = null;
      
      // Extrair QR Code baseado na estrutura real da Pixup
      qrCode = pixupData.qrcode; // Campo correto da Pixup
      
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
          console.error('[PIXUP] Erro ao gerar imagem do QR Code:', qrError);
        }
      }
      
      // Log para debug
      console.log('[PIXUP] Dados extraídos:', {
        qrCode: qrCode ? 'Presente' : 'Ausente',
        qrCodeImage: qrCodeImage ? 'Presente' : 'Ausente',
        transactionId: pixupData.transactionId || 'Ausente',
        externalId: pixupData.external_id || 'Ausente',
        camposDisponiveis: Object.keys(pixupData)
      });
      
      // Validar se QR Code foi extraído
      if (!qrCode) {
        console.error('[PIXUP] ERRO: QR Code não encontrado na resposta da Pixup');
        console.error('[PIXUP] Resposta completa:', JSON.stringify(response.data, null, 2));
        throw new Error('QR Code não encontrado na resposta da Pixup');
      }
      
      // Atualizar depósito com dados do Pixup
      await prisma.deposit.update({
        where: { id: deposit.id },
        data: {
          qr_code: qrCode,
          qr_base64: qrCodeImage,
          provider_tx_id: pixupData.transaction_id || pixupData.id,
          updated_at: new Date()
        }
      });
      
      console.log(`[PIXUP] Depósito criado: ${deposit.id} - R$ ${valorNumerico}`);
      
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
      console.error('[PIXUP] Erro ao criar pagamento:', error);
      throw error;
    }
  }

  /**
   * Criar saque/transferência
   */
  async createWithdrawal({ userId, amount, pixKey, pixKeyType, ownerName, ownerDocument }) {
    try {
      console.log('[PIXUP] Criando saque:', { userId, amount, pixKey, pixKeyType });
      
      // Autenticar
      await this.authenticate();
      
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      const amountNumerico = parseFloat(amount);
      
      if (amountNumerico < 20.00) {
        throw new Error('Valor mínimo para saque é R$ 20,00');
      }
      
      // Verificar saldo
      if (user.saldo_reais < amountNumerico) {
        throw new Error('Saldo insuficiente para o saque');
      }
      
      // Gerar external_id único
      const externalId = `withdraw_${userId}_${Date.now()}`;
      
      // Criar saque no banco
      const withdrawal = await prisma.withdrawal.create({
        data: {
          user_id: userId,
          amount: amountNumerico,
          pix_key: pixKey,
          pix_key_type: pixKeyType,
          status: 'processing',
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      // Preparar dados para o Pixup (estrutura correta para saques)
      const withdrawalData = {
        amount: amountNumerico,
        external_id: externalId,
        pix_key: pixKey,
        pix_key_type: pixKeyType,
        payer: {
          name: ownerName || user.nome,
          document: ownerDocument || user.cpf?.replace(/\D/g, '') || "00000000000"
        },
        description: `Saque SlotBox - ${user.nome}`,
        postbackUrl: `${config.frontend.url}/api/pixup/webhook/transfer`
      };
      
      console.log('[PIXUP] Enviando saque para API:', JSON.stringify(withdrawalData, null, 2));
      
      // Fazer chamada para o Pixup (endpoint correto para saques)
      const response = await this.client.post('/pix/payment', withdrawalData, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      console.log('[PIXUP] Resposta do saque:', JSON.stringify(response.data, null, 2));
      
      if (!response.data) {
        throw new Error('Erro na resposta do Pixup: ' + JSON.stringify(response.data));
      }
      
      const pixupData = response.data;
      
      // Atualizar saque com dados do Pixup
      await prisma.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          provider_tx_id: pixupData.transactionId || pixupData.id,
          updated_at: new Date()
        }
      });
      
      console.log(`[PIXUP] Saque criado: ${withdrawal.id} - R$ ${amountNumerico}`);
      
      return {
        success: true,
        external_id: externalId,
        transaction_id: pixupData.transactionId || pixupData.id,
        amount: amountNumerico,
        status: 'processing'
      };
      
    } catch (error) {
      console.error('[PIXUP] Erro ao criar saque:', error);
      throw error;
    }
  }

  /**
   * Verificar status de pagamento
   */
  async checkPaymentStatus(externalId) {
    try {
      await this.authenticate();
      
      const response = await this.client.get(`/v2/pix/payment/status/${externalId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      return response.data;
      
    } catch (error) {
      console.error('[PIXUP] Erro ao verificar status:', error);
      throw error;
    }
  }

  /**
   * Verificar status de transferência
   */
  async checkWithdrawalStatus(externalId) {
    try {
      await this.authenticate();
      
      const response = await this.client.get(`/v2/pix/transfer/status/${externalId}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      return response.data;
      
    } catch (error) {
      console.error('[PIXUP] Erro ao verificar status do saque:', error);
      throw error;
    }
  }
}

module.exports = PixupService;
