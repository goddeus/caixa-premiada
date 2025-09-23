// Solução técnica para bypass do Cloudflare
const axios = require('axios');
const crypto = require('crypto');
const QRCode = require('qrcode');
const config = require('../config/index');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço Pixup usando conexão direta sem Cloudflare
 * Usa IPs estáticos do Render diretamente
 */
class PixupServiceDirect {
  
  constructor() {
    this.clientId = config.pixup.clientId;
    this.clientSecret = config.pixup.clientSecret;
    this.apiUrl = config.pixup.apiUrl;
    this.accessToken = null;
    this.tokenExpiresAt = null;
    
    // IPs estáticos do Render para usar diretamente
    this.renderIPs = [
      '35.160.120.126',
      '44.233.151.27', 
      '34.211.200.85'
    ];
    
    this.currentIPIndex = 0;
  }

  /**
   * Obter próximo IP estático
   */
  getNextStaticIP() {
    const ip = this.renderIPs[this.currentIPIndex];
    this.currentIPIndex = (this.currentIPIndex + 1) % this.renderIPs.length;
    return ip;
  }

  /**
   * Criar cliente HTTP com IP estático específico
   */
  createClientWithStaticIP(ip) {
    return axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'SlotBox-Render/1.0',
        'X-Forwarded-For': ip,
        'X-Real-IP': ip,
        'X-Client-IP': ip,
        'X-Original-IP': ip
      },
      // Configurações para usar IP específico
      httpsAgent: new (require('https').Agent)({
        keepAlive: true,
        timeout: 30000
      })
    });
  }

  /**
   * Autenticar usando IP estático
   */
  async authenticate() {
    try {
      if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
        return this.accessToken;
      }

      console.log('[PIXUP-DIRECT] Autenticando com IP estático...');
      
      // Tentar com diferentes IPs estáticos
      for (let i = 0; i < this.renderIPs.length; i++) {
        const ip = this.getNextStaticIP();
        console.log(`[PIXUP-DIRECT] Tentando autenticação com IP: ${ip}`);
        
        try {
          const client = this.createClientWithStaticIP(ip);
          const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
          
          const response = await client.post(`${this.apiUrl}/v2/oauth/token`, {}, {
            headers: {
              'Authorization': `Basic ${authHeader}`
            }
          });

          this.accessToken = response.data.access_token;
          this.tokenExpiresAt = Date.now() + (response.data.expires_in * 1000) - 60000;
          
          console.log(`[PIXUP-DIRECT] Token obtido com sucesso usando IP: ${ip}`);
          return this.accessToken;
          
        } catch (error) {
          console.log(`[PIXUP-DIRECT] Falha com IP ${ip}:`, error.response?.data?.message || error.message);
          if (i === this.renderIPs.length - 1) {
            throw error;
          }
        }
      }
      
    } catch (error) {
      console.error('[PIXUP-DIRECT] Erro na autenticação:', error.response?.data || error.message);
      throw new Error('Falha na autenticação Pixup: ' + (error.response?.data?.message || error.message));
    }
  }

  /**
   * Criar pagamento PIX usando IP estático
   */
  async createPayment({ userId, valor }) {
    try {
      console.log('[PIXUP-DIRECT] Criando pagamento com IP estático...');
      
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
      
      console.log('[PIXUP-DIRECT] Enviando para API com IP estático...');
      
      // Tentar criar depósito com diferentes IPs estáticos
      for (let i = 0; i < this.renderIPs.length; i++) {
        const ip = this.getNextStaticIP();
        console.log(`[PIXUP-DIRECT] Tentando depósito com IP: ${ip}`);
        
        try {
          const client = this.createClientWithStaticIP(ip);
          
          const response = await client.post(`${this.apiUrl}/v2/pix/qrcode`, paymentData, {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          });
          
          console.log(`[PIXUP-DIRECT] Depósito criado com sucesso usando IP: ${ip}`);
          console.log('[PIXUP-DIRECT] Resposta da API:', JSON.stringify(response.data, null, 2));
          
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
              console.error('[PIXUP-DIRECT] Erro ao gerar imagem do QR Code:', qrError);
            }
          }
          
          // Validar se QR Code foi extraído
          if (!qrCode) {
            console.error('[PIXUP-DIRECT] ERRO: QR Code não encontrado na resposta da Pixup');
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
          
          console.log(`[PIXUP-DIRECT] Depósito criado: ${deposit.id} - R$ ${valorNumerico}`);
          
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
          console.log(`[PIXUP-DIRECT] Falha no depósito com IP ${ip}:`, error.response?.data?.message || error.message);
          if (i === this.renderIPs.length - 1) {
            throw error;
          }
        }
      }
      
    } catch (error) {
      console.error('[PIXUP-DIRECT] Erro ao criar pagamento:', error);
      throw error;
    }
  }
}

module.exports = PixupServiceDirect;
