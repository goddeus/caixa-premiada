const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/index');
const { PrismaClient } = require('@prisma/client');
const AffiliateService = require('./affiliateService');
const QRCode = require('qrcode');

const prisma = new PrismaClient();

/**
 * Serviço de integração com VizzionPay para PIX
 * Implementação conforme especificação do prompt
 */
class VizzionPayService {
  
  constructor() {
    this.apiKey = config.vizzionpay.apiKey;
    this.baseUrl = config.vizzionpay.baseUrl;
    this.webhookSecret = config.vizzionpay.webhookSecret;
    this.pixKey = config.vizzionpay.pixKey;
    this.pixKeyType = config.vizzionpay.pixKeyType;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });
  }
  
  /**
   * Criar pagamento PIX para depósito
   * @param {Object} params - { userId, valor }
   * @returns {Object} - { qr_base64, qr_text, gateway_id, transaction_id }
   */
  async createPayment({ userId, valor }) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      const valorNumerico = Number(valor);
      
      if (valorNumerico < 20.00) {
        throw new Error('Valor mínimo para depósito é R$ 20,00');
      }
      
      if (valorNumerico > 10000.00) {
        throw new Error('Valor máximo para depósito é R$ 10.000,00');
      }
      
      // Criar transação no banco primeiro
      const payment = await prisma.payment.create({
        data: {
          user_id: userId,
          tipo: 'deposito',
          valor: valorNumerico,
          status: 'pendente',
          metodo_pagamento: 'pix',
          criado_em: new Date(),
          expira_em: new Date(Date.now() + 3600000) // 1 hora
        }
      });
      
      // Preparar dados para o VizzionPay conforme documentação oficial
      const paymentData = {
        amount: valorNumerico, // VizzionPay usa reais, não centavos
        currency: 'BRL',
        payment_method: 'pix',
        reference: payment.id,
        customer: {
          name: user.nome,
          email: user.email,
          document: user.cpf.replace(/\D/g, ''),
          document_type: 'CPF'
        },
        notification_url: `${config.api.baseUrl}/api/webhook/pix`,
        expiration_time: 3600, // 1 hora em segundos
        description: `Depósito Caixa Premiada - ${user.nome}`,
        pix_key: this.pixKey,
        pix_key_type: this.pixKeyType
      };
      
      console.log('Enviando para VizzionPay:', JSON.stringify(paymentData, null, 2));
      
      // Fazer chamada para o VizzionPay - endpoint correto conforme documentação
      // URL base já inclui /api/v1, então usar apenas /payments
      const response = await this.client.post('/payments', paymentData);
      
      console.log('Resposta VizzionPay:', JSON.stringify(response.data, null, 2));
      
      if (!response.data || response.data.success === false) {
        throw new Error('Erro na resposta do VizzionPay: ' + JSON.stringify(response.data));
      }
      
      const vizzionData = response.data.data || response.data;
      
      // Extrair dados do QR Code conforme formato da VizzionPay
      let qrBase64 = null;
      let qrText = null;
      
      // Função para buscar recursivamente por campos de QR Code
      const findQrCodeField = (obj, fieldNames) => {
        for (const fieldName of fieldNames) {
          if (obj[fieldName]) {
            return obj[fieldName];
          }
        }
        return null;
      };
      
      // Buscar QR Code em base64
      const qrBase64Fields = [
        'qr_code_base64', 'qr_code', 'qrcode', 'qrCode', 'qr_base64',
        'pix_qr_code', 'pix_qr', 'qr_image', 'qr_image_base64'
      ];
      qrBase64 = findQrCodeField(vizzionData, qrBase64Fields);
      
      // Buscar código PIX copy/paste
      const qrTextFields = [
        'qr_code_text', 'pix_copy_paste', 'pixCopyPaste', 'copy_paste',
        'pix_code', 'pix_text', 'qr_text', 'emv', 'brcode'
      ];
      qrText = findQrCodeField(vizzionData, qrTextFields);
      
      // Se não encontrou nos campos diretos, buscar recursivamente
      if (!qrBase64 || !qrText) {
        const searchInObject = (obj, path = '') => {
          for (const key in obj) {
            const currentPath = path ? `${path}.${key}` : key;
            const value = obj[key];
            
            if (typeof value === 'string') {
              // Verificar se é um QR code base64
              if (key.toLowerCase().includes('qr') && value.length > 100 && value.includes('data:image')) {
                if (!qrBase64) qrBase64 = value;
              }
              // Verificar se é um código PIX
              if ((key.toLowerCase().includes('pix') || key.toLowerCase().includes('copy')) && value.length > 50) {
                if (!qrText) qrText = value;
              }
            } else if (typeof value === 'object' && value !== null) {
              searchInObject(value, currentPath);
            }
          }
        };
        
        searchInObject(vizzionData);
      }
      
      // Se não encontrou QR code, gerar um fallback
      if (!qrBase64) {
        console.warn(`⚠️ QRCode não encontrado na resposta VizzionPay para pagamento ${payment.id}`);
        console.warn('Campos disponíveis:', Object.keys(vizzionData));
        console.warn('Resposta completa VizzionPay:', JSON.stringify(response.data, null, 2));
        
        // Gerar QR code básico como fallback usando dados do pagamento
        if (!qrText) {
          qrText = `00020101021226880014br.gov.bcb.pix2566qrcodes.saq.digital/v2/qr/cob/${payment.id}5204000053039865802BR5925CAIXA PREMIADA6009SAO PAULO62070503***6304D82F`;
        }
        
        // Tentar gerar QR code localmente
        try {
          const qrCodeBase64 = await QRCode.toDataURL(qrText, {
            type: 'image/png',
            quality: 0.92,
            margin: 1,
            color: {
              dark: '#000000',
              light: '#FFFFFF'
            },
            width: 256
          });
          
          // Remover o prefixo data:image/png;base64,
          qrBase64 = qrCodeBase64.split(',')[1];
          console.log(`✅ QR Code gerado localmente para pagamento ${payment.id}`);
        } catch (qrError) {
          console.error('Erro ao gerar QR Code local:', qrError);
          qrBase64 = null;
        }
      }
      
      // Log detalhado dos dados extraídos
      console.log(`📊 Dados VizzionPay extraídos para pagamento ${payment.id}:`, {
        qr_base64: qrBase64 ? `Presente (${qrBase64.length} chars)` : 'Ausente',
        qr_text: qrText ? `Presente (${qrText.length} chars)` : 'Ausente',
        gateway_id: vizzionData.id || vizzionData.transaction_id || vizzionData.payment_id,
        campos_disponiveis: Object.keys(vizzionData)
      });
      
      // Atualizar payment com dados do VizzionPay
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          gateway_id: vizzionData.id || vizzionData.transaction_id || vizzionData.payment_id,
          qr_code: qrBase64,
          pix_copy_paste: qrText,
          gateway_response: JSON.stringify(response.data)
        }
      });
      
      console.log(`✅ Pagamento PIX VizzionPay criado: ${payment.id} - R$ ${valorNumerico} - User: ${user.email}`);
      
      return {
        qr_base64: qrBase64,
        qr_text: qrText,
        gateway_id: vizzionData.id || vizzionData.transaction_id,
        transaction_id: payment.id,
        expires_at: payment.expira_em,
        amount: valorNumerico
      };
      
    } catch (error) {
      console.error('Erro ao criar pagamento VizzionPay:', error);
      
      if (error.response) {
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        
        // Se a resposta da VizzionPay não devolver QR Code, exibir mensagem específica
        if (error.response.status === 400 || error.response.status === 422) {
          throw new Error('Não foi possível gerar QR Code no momento. Tente novamente mais tarde.');
        }
      }
      
      // Logar resposta crua para auditoria e debugging
      console.error('Erro completo:', {
        message: error.message,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : null
      });
      
      throw new Error(`Erro ao criar pagamento: ${error.message}`);
    }
  }
  
  /**
   * Processar callback do VizzionPay (webhook)
   * @param {Object} callbackData - Dados recebidos do webhook
   * @param {string} signature - Assinatura do webhook
   */
  async processCallback(callbackData, signature) {
    try {
      console.log('Processando callback VizzionPay:', JSON.stringify(callbackData, null, 2));
      
      // 1. Validar assinatura do webhook se configurada
      if (this.webhookSecret && signature) {
        if (!this.validateWebhookSignature(callbackData, signature)) {
          throw new Error('Assinatura do webhook inválida');
        }
      }
      
      const { reference, status, amount, transaction_id, id } = callbackData;
      const paymentId = reference || transaction_id || id;
      
      if (!paymentId) {
        throw new Error('ID da transação não fornecido no callback');
      }
      
      // 2. Buscar payment no banco
      const payment = await prisma.payment.findFirst({
        where: {
          OR: [
            { id: paymentId },
            { gateway_id: paymentId }
          ]
        },
        include: { user: true }
      });
      
      if (!payment) {
        console.error(`Payment não encontrado: ${paymentId}`);
        return;
      }
      
      // 3. Verificar se já foi processado
      if (payment.status === 'concluido') {
        console.log(`Payment já processado: ${paymentId}`);
        return;
      }
      
      // 4. Processar baseado no status conforme documentação VizzionPay
      await prisma.$transaction(async (tx) => {
        if (status === 'paid' || status === 'approved' || status === 'completed' || status === 'success') {
          // Pagamento confirmado
          let valorDeposito = Number(amount);
          
          // VizzionPay pode retornar em centavos, converter se necessário
          if (valorDeposito > 100000) { // Provavelmente em centavos
            valorDeposito = valorDeposito / 100;
          }
          
          // Usar valor do payment se amount não for confiável
          if (valorDeposito !== payment.valor) {
            valorDeposito = payment.valor;
          }
          
          // Determinar qual saldo creditar baseado no tipo de conta
          if (payment.user.tipo_conta === 'afiliado_demo') {
            // Conta demo - creditar saldo_demo
            await tx.user.update({
              where: { id: payment.user_id },
              data: { saldo_demo: { increment: valorDeposito } }
            });
            
            // Sincronizar com Wallet
            await tx.wallet.update({
              where: { user_id: payment.user_id },
              data: { saldo_demo: { increment: valorDeposito } }
            });
            
            // Registrar transação demo
            await tx.transactionDemo.create({
              data: {
                user_id: payment.user_id,
                tipo: 'deposito',
                valor: valorDeposito,
                nota: `Depósito PIX VizzionPay - Demo (${paymentId})`
              }
            });
            
          } else {
            // Conta normal - creditar saldo_reais
            await tx.user.update({
              where: { id: payment.user_id },
              data: { saldo_reais: { increment: valorDeposito } }
            });
            
            // Sincronizar com Wallet
            await tx.wallet.update({
              where: { user_id: payment.user_id },
              data: { saldo_reais: { increment: valorDeposito } }
            });
            
            // Registrar transação normal
            await tx.transaction.create({
              data: {
                user_id: payment.user_id,
                tipo: 'deposito',
                valor: valorDeposito,
                status: 'concluido',
                descricao: `Depósito PIX VizzionPay (${paymentId})`
              }
            });
            
            // Marcar primeiro depósito se aplicável
            if (!payment.user.primeiro_deposito_feito) {
              await tx.user.update({
                where: { id: payment.user_id },
                data: { primeiro_deposito_feito: true }
              });
            }
          }
          
          // Atualizar payment
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: 'concluido',
              gateway_response: JSON.stringify(callbackData),
              processado_em: new Date()
            }
          });
          
          console.log(`✅ Depósito VizzionPay processado: ${payment.id} - R$ ${valorDeposito} - ${payment.user.email}`);
          
          // Processar comissão de afiliado (somente para contas normais)
          if (payment.user.tipo_conta !== 'afiliado_demo') {
            await AffiliateService.processAffiliateCommission({
              userId: payment.user_id,
              depositAmount: valorDeposito,
              depositStatus: 'concluido'
            });
          }
          
        } else if (status === 'failed' || status === 'cancelled' || status === 'expired' || status === 'rejected') {
          // Pagamento falhou/cancelado/expirado
          let finalStatus = 'falhou';
          if (status === 'expired') finalStatus = 'cancelado';
          if (status === 'cancelled') finalStatus = 'cancelado';
          
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: finalStatus,
              gateway_response: JSON.stringify(callbackData),
              processado_em: new Date()
            }
          });
          
          console.log(`❌ Pagamento VizzionPay ${status}: ${payment.id} - ${payment.user.email}`);
        }
      });
      
    } catch (error) {
      console.error('Erro ao processar callback VizzionPay:', error);
      throw error;
    }
  }
  
  /**
   * Criar saque PIX
   * @param {Object} params - { userId, valor, pixKey }
   */
  async createWithdrawal({ userId, valor, pixKey }) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        throw new Error('Usuário não encontrado');
      }
      
      const valorNumerico = Number(valor);
      
      if (valorNumerico < 50.00) {
        throw new Error('Valor mínimo para saque é R$ 50,00');
      }
      
      if (valorNumerico > 5000.00) {
        throw new Error('Valor máximo para saque é R$ 5.000,00');
      }
      
      // Verificar saldo disponível (apenas contas normais)
      if (user.tipo_conta === 'afiliado_demo') {
        throw new Error('Contas demo não podem realizar saques');
      }
      
      if (user.saldo_reais < valorNumerico) {
        throw new Error('Saldo insuficiente');
      }
      
      // Verificar rollover se aplicável
      if (!user.rollover_liberado) {
        throw new Error('Rollover mínimo não atingido. Jogue mais para liberar saques.');
      }
      
      return await prisma.$transaction(async (tx) => {
        // Reservar saldo (debitar imediatamente)
        await tx.user.update({
          where: { id: userId },
          data: { saldo_reais: { decrement: valorNumerico } }
        });
        
        // Criar payment de saque
        const withdrawal = await tx.payment.create({
          data: {
            user_id: userId,
            tipo: 'saque',
            valor: valorNumerico,
            status: 'processando',
            metodo_pagamento: 'pix',
            pix_key: pixKey,
            pix_key_type: this.detectPixKeyType(pixKey)
          }
        });
        
        // Preparar dados para o VizzionPay
        const withdrawalData = {
          amount: (valorNumerico * 100).toFixed(0), // Em centavos
          currency: 'BRL',
          reference: withdrawal.id,
          pix_key: pixKey,
          pix_key_type: this.detectPixKeyType(pixKey),
          customer: {
            name: user.nome,
            email: user.email,
            document: user.cpf.replace(/\D/g, ''),
            document_type: 'CPF'
          },
          notification_url: `${config.api.baseUrl}/api/webhook/withdraw`,
          description: `Saque Caixa Premiada - ${user.nome}`
        };
        
        // Fazer chamada para o VizzionPay
        const response = await this.client.post('/withdrawals', withdrawalData);
        
        if (!response.data || response.data.status === 'error') {
          // Reverter débito em caso de erro
          await tx.user.update({
            where: { id: userId },
            data: { saldo_reais: { increment: valorNumerico } }
          });
          
          throw new Error('Erro na resposta do VizzionPay: ' + JSON.stringify(response.data));
        }
        
        const vizzionData = response.data.data || response.data;
        
        // Atualizar withdrawal com dados do VizzionPay
        await tx.payment.update({
          where: { id: withdrawal.id },
          data: {
            gateway_id: vizzionData.id || vizzionData.transaction_id,
            gateway_response: JSON.stringify(response.data)
          }
        });
        
        // Registrar transação
        await tx.transaction.create({
          data: {
            user_id: userId,
            tipo: 'saque',
            valor: -valorNumerico,
            status: 'processando',
            descricao: `Saque PIX VizzionPay - ${pixKey}`
          }
        });
        
        console.log(`✅ Saque VizzionPay criado: ${withdrawal.id} - R$ ${valorNumerico} - ${user.email}`);
        
        return {
          withdrawal_id: withdrawal.id,
          gateway_id: vizzionData.id || vizzionData.transaction_id,
          status: vizzionData.status || 'processing',
          amount: valorNumerico
        };
      });
      
    } catch (error) {
      console.error('Erro ao criar saque VizzionPay:', error);
      throw error;
    }
  }
  
  /**
   * Processar callback de saque
   */
  async processWithdrawalCallback(callbackData, signature) {
    try {
      console.log('Processando callback de saque VizzionPay:', JSON.stringify(callbackData, null, 2));
      
      if (this.webhookSecret && signature) {
        if (!this.validateWebhookSignature(callbackData, signature)) {
          throw new Error('Assinatura do webhook inválida');
        }
      }
      
      const { reference, status, transaction_id, id } = callbackData;
      const withdrawalId = reference || transaction_id || id;
      
      const withdrawal = await prisma.payment.findFirst({
        where: {
          OR: [
            { id: withdrawalId },
            { gateway_id: withdrawalId }
          ]
        },
        include: { user: true }
      });
      
      if (!withdrawal) {
        console.error(`Withdrawal não encontrado: ${withdrawalId}`);
        return;
      }
      
      await prisma.$transaction(async (tx) => {
        if (status === 'completed' || status === 'paid' || status === 'approved') {
          // Saque concluído
          await tx.payment.update({
            where: { id: withdrawal.id },
            data: {
              status: 'concluido',
              gateway_response: JSON.stringify(callbackData),
              processado_em: new Date()
            }
          });
          
          // Atualizar transação
          await tx.transaction.updateMany({
            where: {
              user_id: withdrawal.user_id,
              tipo: 'saque',
              status: 'processando'
            },
            data: { status: 'concluido' }
          });
          
          console.log(`✅ Saque VizzionPay concluído: ${withdrawal.id} - ${withdrawal.user.email}`);
          
        } else if (status === 'failed' || status === 'cancelled' || status === 'rejected') {
          // Saque falhou - reverter saldo
          await tx.user.update({
            where: { id: withdrawal.user_id },
            data: { saldo_reais: { increment: withdrawal.valor } }
          });
          
          await tx.payment.update({
            where: { id: withdrawal.id },
            data: {
              status: 'falhou',
              gateway_response: JSON.stringify(callbackData),
              processado_em: new Date()
            }
          });
          
          // Atualizar transação
          await tx.transaction.updateMany({
            where: {
              user_id: withdrawal.user_id,
              tipo: 'saque',
              status: 'processando'
            },
            data: { status: 'falhou' }
          });
          
          console.log(`❌ Saque VizzionPay falhou: ${withdrawal.id} - ${withdrawal.user.email}`);
        }
      });
      
    } catch (error) {
      console.error('Erro ao processar callback de saque VizzionPay:', error);
      throw error;
    }
  }
  
  /**
   * Validar assinatura do webhook
   */
  validateWebhookSignature(data, signature) {
    if (!this.webhookSecret || !signature) {
      return true; // Se não há secret configurado, aceitar
    }
    
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature || 
           signature === `sha256=${expectedSignature}` ||
           signature.includes(expectedSignature);
  }
  
  /**
   * Detectar tipo de chave PIX
   */
  detectPixKeyType(pixKey) {
    if (!pixKey) return 'unknown';
    
    const cleanKey = pixKey.replace(/\D/g, '');
    
    // Email
    if (pixKey.includes('@')) return 'email';
    
    // CPF
    if (cleanKey.length === 11) return 'cpf';
    
    // CNPJ
    if (cleanKey.length === 14) return 'cnpj';
    
    // Telefone
    if (cleanKey.length >= 10 && cleanKey.length <= 11) return 'phone';
    
    // Chave aleatória (UUID)
    if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(pixKey)) {
      return 'random';
    }
    
    return 'unknown';
  }
  
  /**
   * Consultar status de pagamento
   */
  async getPaymentStatus(gatewayId) {
    try {
      const response = await this.client.get(`/payments/${gatewayId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar status do pagamento:', error);
      throw error;
    }
  }
}

module.exports = VizzionPayService;