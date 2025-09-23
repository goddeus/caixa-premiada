// Sistema de rotação de IPs para contornar bloqueio da Pixup
const axios = require('axios');
const crypto = require('crypto');
const QRCode = require('qrcode');
const config = require('../config/index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de integração com Pixup usando rotação de IPs
 * Tenta diferentes estratégias para contornar o bloqueio
 */
class PixupServiceRotating {
  
  constructor() {
    this.clientId = config.pixup.clientId;
    this.clientSecret = config.pixup.clientSecret;
    this.apiUrl = config.pixup.apiUrl;
    this.accessToken = null;
    this.tokenExpiresAt = null;
    
    // Lista de IPs estáticos do Render para rotação
    this.renderIPs = [
      '35.160.120.126',
      '44.233.151.27', 
      '34.211.200.85'
    ];
    
    this.currentIPIndex = 0;
  }

  /**
   * Obter próximo IP da lista
   */
  getNextIP() {
    const ip = this.renderIPs[this.currentIPIndex];
    this.currentIPIndex = (this.currentIPIndex + 1) % this.renderIPs.length;
    return ip;
  }

  /**
   * Criar cliente HTTP com IP específico
   */
  createClient(ip) {
    return axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SlotBox-Render/1.0',
        'X-Forwarded-For': ip,
        'X-Real-IP': ip,
        'X-Client-IP': ip
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

      console.log('[PIXUP-ROTATING] Autenticando...');
      
      // Tentar com diferentes IPs
      for (let i = 0; i < this.renderIPs.length; i++) {
        const ip = this.getNextIP();
        console.log(`[PIXUP-ROTATING] Tentando com IP: ${ip}`);
        
        try {
          const client = this.createClient(ip);
          const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
          
          const response = await client.post(`${this.apiUrl}/v2/oauth/token`, {}, {
            headers: {
              'Authorization': `Basic ${authHeader}`
            }
          });

          this.accessToken = response.data.access_token;
          this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000;
          
          console.log(`[PIXUP-ROTATING] Token obtido com sucesso usando IP: ${ip}`);
          return this.accessToken;
          
        } catch (error) {
          console.log(`[PIXUP-ROTATING] Falha com IP ${ip}:`, error.response?.data?.message || error.message);
          if (i === this.renderIPs.length - 1) {
            throw error;
          }
        }
      }
      
    } catch (error) {
      console.error('[PIXUP-ROTATING] Erro na autenticação:', error.response?.data || error.message);
      throw new Error('Falha na autenticação Pixup: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Criar pagamento PIX
   */
  async createPayment({ userId, valor }) {
    try {
      console.log('[PIXUP-ROTATING] Criando pagamento:', { userId, valor });
      
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
      
      console.log('[PIXUP-ROTATING] Enviando para API:', JSON.stringify(paymentData, null, 2));
      
      // Tentar criar depósito com diferentes IPs
      for (let i = 0; i < this.renderIPs.length; i++) {
        const ip = this.getNextIP();
        console.log(`[PIXUP-ROTATING] Tentando depósito com IP: ${ip}`);
        
        try {
          const client = this.createClient(ip);
          
          const response = await client.post(`${this.apiUrl}/v2/pix/qrcode`, paymentData, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          });
          
          console.log(`[PIXUP-ROTATING] Depósito criado com sucesso usando IP: ${ip}`);
          console.log('[PIXUP-ROTATING] Resposta da API:', JSON.stringify(response.data, null, 2));
          
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
              console.error('[PIXUP-ROTATING] Erro ao gerar imagem do QR Code:', qrError);
            }
          }
          
          // Validar se QR Code foi extraído
          if (!qrCode) {
            console.error('[PIXUP-ROTATING] ERRO: QR Code não encontrado na resposta da Pixup');
            console.error('[PIXUP-ROTATING] Resposta completa:', JSON.stringify(response.data, null, 2));
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
          
          console.log(`[PIXUP-ROTATING] Depósito criado: ${deposit.id} - R$ ${valorNumerico}`);
          
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
          console.log(`[PIXUP-ROTATING] Falha no depósito com IP ${ip}:`, error.response?.data?.message || error.message);
          if (i === this.renderIPs.length - 1) {
            throw error;
          }
        }
      }
      
    } catch (error) {
      console.error('[PIXUP-ROTATING] Erro ao criar pagamento:', error);
      throw error;
    }
  }
}

module.exports = PixupServiceRotating;
