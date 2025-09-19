import api from './api';

/**
 * Serviço para gerenciar transações com sincronização automática
 * 
 * Funcionalidades:
 * - Abertura de caixas com sincronização automática
 * - Depósitos com atualização de saldo
 * - Saques com verificação de saldo
 * - Histórico de transações
 */
class TransactionService {
  constructor() {
    this.pendingTransactions = new Map();
    this.transactionListeners = new Set();
  }

  /**
   * Adiciona listener para eventos de transação
   */
  addTransactionListener(callback) {
    this.transactionListeners.add(callback);
  }

  /**
   * Remove listener de eventos de transação
   */
  removeTransactionListener(callback) {
    this.transactionListeners.delete(callback);
  }

  /**
   * Notifica todos os listeners sobre uma transação
   */
  notifyTransactionListeners(transaction) {
    this.transactionListeners.forEach(callback => {
      try {
        callback(transaction);
      } catch (error) {
        console.error('❌ Erro no listener de transação:', error);
      }
    });
  }

  /**
   * Dispara evento customizado para sincronização
   */
  dispatchTransactionEvent(type, amount, details = {}) {
    const event = new CustomEvent('transactionCompleted', {
      detail: {
        type,
        amount,
        timestamp: Date.now(),
        ...details
      }
    });
    
    window.dispatchEvent(event);
    this.notifyTransactionListeners(event.detail);
  }

  /**
   * Abre uma caixa com sincronização automática
   */
  async openCase(caseId, caseName, casePrice) {
    const transactionId = `case_${caseId}_${Date.now()}`;
    
    try {
      console.log(`🎲 Abrindo caixa: ${caseName} (R$ ${casePrice})`);
      
      // Marcar transação como pendente
      this.pendingTransactions.set(transactionId, {
        type: 'case_opening',
        amount: casePrice,
        status: 'pending',
        timestamp: Date.now()
      });

      // Fazer a requisição
      const response = await api.post(`/cases/buy/${caseId}`);
      
      if (response.success) {
        console.log('✅ Caixa aberta com sucesso!');
        
        // Atualizar status da transação
        this.pendingTransactions.set(transactionId, {
          type: 'case_opening',
          amount: casePrice,
          status: 'completed',
          timestamp: Date.now(),
          result: response.data
        });

        // Disparar evento de transação
        this.dispatchTransactionEvent('case_opening', casePrice, {
          caseId,
          caseName,
          prize: response.data.premio,
          remainingBalance: response.data.saldo_restante,
          transaction: response.data.transacao
        });

        return response;

      } else {
        throw new Error(response.message || 'Erro ao abrir caixa');
      }

    } catch (error) {
      console.error('❌ Erro ao abrir caixa:', error);
      
      // Marcar transação como falhada
      this.pendingTransactions.set(transactionId, {
        type: 'case_opening',
        amount: casePrice,
        status: 'failed',
        timestamp: Date.now(),
        error: error.message
      });

      throw error;
    } finally {
      // Limpar transação pendente após 30 segundos
      setTimeout(() => {
        this.pendingTransactions.delete(transactionId);
      }, 30000);
    }
  }

  /**
   * Faz um depósito com sincronização automática
   */
  async makeDeposit(amount, method = 'pix') {
    const transactionId = `deposit_${Date.now()}`;
    
    try {
      console.log(`💰 Fazendo depósito: R$ ${amount} via ${method}`);
      
      // Marcar transação como pendente
      this.pendingTransactions.set(transactionId, {
        type: 'deposit',
        amount,
        status: 'pending',
        timestamp: Date.now()
      });

      // Fazer a requisição
      const response = await api.post('/wallet/deposit', {
        amount,
        method
      });
      
      if (response.success) {
        console.log('✅ Depósito realizado com sucesso!');
        
        // Atualizar status da transação
        this.pendingTransactions.set(transactionId, {
          type: 'deposit',
          amount,
          status: 'completed',
          timestamp: Date.now(),
          result: response.data
        });

        // Disparar evento de transação
        this.dispatchTransactionEvent('deposit', amount, {
          method,
          newBalance: response.data.saldo_reais,
          transactionId: response.data.transaction_id
        });

        return response;

      } else {
        throw new Error(response.message || 'Erro ao fazer depósito');
      }

    } catch (error) {
      console.error('❌ Erro ao fazer depósito:', error);
      
      // Marcar transação como falhada
      this.pendingTransactions.set(transactionId, {
        type: 'deposit',
        amount,
        status: 'failed',
        timestamp: Date.now(),
        error: error.message
      });

      throw error;
    } finally {
      // Limpar transação pendente após 30 segundos
      setTimeout(() => {
        this.pendingTransactions.delete(transactionId);
      }, 30000);
    }
  }

  /**
   * Faz um saque com sincronização automática
   */
  async makeWithdrawal(amount, method = 'pix') {
    const transactionId = `withdrawal_${Date.now()}`;
    
    try {
      console.log(`💸 Fazendo saque: R$ ${amount} via ${method}`);
      
      // Marcar transação como pendente
      this.pendingTransactions.set(transactionId, {
        type: 'withdrawal',
        amount,
        status: 'pending',
        timestamp: Date.now()
      });

      // Fazer a requisição
      const response = await api.post('/wallet/withdraw', {
        amount,
        method
      });
      
      if (response.success) {
        console.log('✅ Saque realizado com sucesso!');
        
        // Atualizar status da transação
        this.pendingTransactions.set(transactionId, {
          type: 'withdrawal',
          amount,
          status: 'completed',
          timestamp: Date.now(),
          result: response.data
        });

        // Disparar evento de transação
        this.dispatchTransactionEvent('withdrawal', amount, {
          method,
          newBalance: response.data.saldo_reais,
          transactionId: response.data.transaction_id
        });

        return response;

      } else {
        throw new Error(response.message || 'Erro ao fazer saque');
      }

    } catch (error) {
      console.error('❌ Erro ao fazer saque:', error);
      
      // Marcar transação como falhada
      this.pendingTransactions.set(transactionId, {
        type: 'withdrawal',
        amount,
        status: 'failed',
        timestamp: Date.now(),
        error: error.message
      });

      throw error;
    } finally {
      // Limpar transação pendente após 30 segundos
      setTimeout(() => {
        this.pendingTransactions.delete(transactionId);
      }, 30000);
    }
  }

  /**
   * Credita um prêmio com sincronização automática
   */
  async creditPrize(caseId, prizeId, prizeValue) {
    const transactionId = `credit_${prizeId}_${Date.now()}`;
    
    try {
      console.log(`🎁 Creditando prêmio: R$ ${prizeValue}`);
      
      // Marcar transação como pendente
      this.pendingTransactions.set(transactionId, {
        type: 'prize_credit',
        amount: prizeValue,
        status: 'pending',
        timestamp: Date.now()
      });

      // Fazer a requisição
      const response = await api.post(`/cases/credit/${caseId}`, {
        prizeId,
        prizeValue
      });
      
      if (response.success || response.credited) {
        console.log('✅ Prêmio creditado com sucesso!');
        
        // Atualizar status da transação
        this.pendingTransactions.set(transactionId, {
          type: 'prize_credit',
          amount: prizeValue,
          status: 'completed',
          timestamp: Date.now(),
          result: response.data
        });

        // Disparar evento de transação
        this.dispatchTransactionEvent('prize_credit', prizeValue, {
          caseId,
          prizeId,
          newBalance: response.data?.saldo_reais
        });

        return response;

      } else {
        throw new Error(response.message || 'Erro ao creditar prêmio');
      }

    } catch (error) {
      console.error('❌ Erro ao creditar prêmio:', error);
      
      // Marcar transação como falhada
      this.pendingTransactions.set(transactionId, {
        type: 'prize_credit',
        amount: prizeValue,
        status: 'failed',
        timestamp: Date.now(),
        error: error.message
      });

      throw error;
    } finally {
      // Limpar transação pendente após 30 segundos
      setTimeout(() => {
        this.pendingTransactions.delete(transactionId);
      }, 30000);
    }
  }

  /**
   * Obtém histórico de transações
   */
  async getTransactionHistory(limit = 50, offset = 0) {
    try {
      const response = await api.get(`/wallet/history?limit=${limit}&offset=${offset}`);
      return response;
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      throw error;
    }
  }

  /**
   * Obtém transações pendentes
   */
  getPendingTransactions() {
    return Array.from(this.pendingTransactions.values());
  }

  /**
   * Limpa transações pendentes antigas
   */
  clearOldPendingTransactions() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutos
    
    for (const [id, transaction] of this.pendingTransactions.entries()) {
      if (now - transaction.timestamp > maxAge) {
        this.pendingTransactions.delete(id);
      }
    }
  }
}

// Instância singleton
const transactionService = new TransactionService();

export default transactionService;
