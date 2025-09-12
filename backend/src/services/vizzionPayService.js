const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/index');
const { PrismaClient } = require('@prisma/client');
const AffiliateService = require('./affiliateService');

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
      
      // Preparar dados para o VizzionPay
      const paymentData = {
        amount: (valorNumerico * 100).toFixed(0), // VizzionPay usa centavos
        currency: 'BRL',
        payment_method: 'pix',
        reference: payment.id,
        customer: {
          name: user.nome,
          email: user.email,
          document: user.cpf.replace(/\D/g, ''),
          document_type: 'CPF'
        },
        notification_url: `${config.api.baseUrl}/api/deposit/callback`,
        expiration_time: 3600, // 1 hora em segundos
        description: `Depósito Caixa Premiada - ${user.nome}`,
        pix_key: this.pixKey,
        pix_key_type: this.pixKeyType
      };
      
      console.log('Enviando para VizzionPay:', JSON.stringify(paymentData, null, 2));
      
      // Fazer chamada para o VizzionPay
      const response = await this.client.post('/v1/payments', paymentData);
      
      if (!response.data || response.data.status === 'error') {
        throw new Error('Erro na resposta do VizzionPay: ' + JSON.stringify(response.data));
      }
      
      const vizzionData = response.data.data || response.data;
      
      // Atualizar payment com dados do VizzionPay
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          gateway_id: vizzionData.id || vizzionData.transaction_id,
          qr_code: vizzionData.qr_code_base64 || vizzionData.qr_code,
          pix_copy_paste: vizzionData.qr_code_text || vizzionData.pix_copy_paste,
          gateway_response: JSON.stringify(response.data)
        }
      });
      
      console.log(`✅ Pagamento PIX VizzionPay criado: ${payment.id} - R$ ${valorNumerico} - User: ${user.email}`);
      
      return {
        qr_base64: vizzionData.qr_code_base64 || vizzionData.qr_code,
        qr_text: vizzionData.qr_code_text || vizzionData.pix_copy_paste,
        gateway_id: vizzionData.id || vizzionData.transaction_id,
        transaction_id: payment.id,
        expires_at: payment.expira_em,
        amount: valorNumerico
      };
      
    } catch (error) {
      console.error('Erro ao criar pagamento VizzionPay:', error);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
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
      
      // 4. Processar baseado no status
      await prisma.$transaction(async (tx) => {
        if (status === 'paid' || status === 'approved' || status === 'completed') {
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
          notification_url: `${config.api.baseUrl}/api/withdraw/callback`,
          description: `Saque Caixa Premiada - ${user.nome}`
        };
        
        // Fazer chamada para o VizzionPay
        const response = await this.client.post('/v1/withdrawals', withdrawalData);
        
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
      const response = await this.client.get(`/v1/payments/${gatewayId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar status do pagamento:', error);
      throw error;
    }
  }
}

module.exports = VizzionPayService;