import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

/**
 * Hook personalizado para sincronização automática de saldo
 * 
 * Funcionalidades:
 * - Atualização automática após transações
 * - Verificação periódica de sincronização
 * - Usa API como fonte da verdade
 * - Cache inteligente com invalidação
 */
export const useBalanceSync = () => {
  const { user, setUser } = useAuth();
  const [balance, setBalance] = useState({
    saldo_reais: 0,
    saldo_demo: 0,
    tipo_conta: 'normal',
    loading: false,
    lastUpdated: null,
    error: null
  });

  // Referências para controle de sincronização
  const syncIntervalRef = useRef(null);
  const lastTransactionRef = useRef(null);
  const isOnlineRef = useRef(navigator.onLine);

  // Configurações
  const SYNC_INTERVAL = 30000; // 30 segundos
  const RETRY_DELAY = 5000; // 5 segundos
  const MAX_RETRIES = 3;

  /**
   * Busca dados atualizados da API
   */
  const fetchBalanceFromAPI = useCallback(async (retryCount = 0) => {
    try {
      setBalance(prev => ({ ...prev, loading: true, error: null }));

      const response = await api.get('/wallet');
      
      if (response.success && response.data) {
        const newBalance = {
          saldo_reais: response.data.saldo_reais || 0,
          saldo_demo: response.data.saldo_demo || 0,
          tipo_conta: response.data.tipo_conta || 'normal',
          loading: false,
          lastUpdated: new Date(),
          error: null
        };

        setBalance(newBalance);

        // Atualizar dados do usuário no contexto
        if (user) {
          const updatedUser = {
            ...user,
            saldo_reais: newBalance.saldo_reais,
            saldo_demo: newBalance.saldo_demo,
            tipo_conta: newBalance.tipo_conta
          };
          setUser(updatedUser);

          // Atualizar localStorage
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        console.log('✅ Saldo sincronizado:', newBalance);
        return newBalance;

      } else {
        throw new Error('Resposta inválida da API');
      }

    } catch (error) {
      console.error('❌ Erro ao sincronizar saldo:', error);
      
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      
      setBalance(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      // Retry automático se não for o último retry
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Tentativa ${retryCount + 1}/${MAX_RETRIES} em ${RETRY_DELAY}ms...`);
        setTimeout(() => {
          fetchBalanceFromAPI(retryCount + 1);
        }, RETRY_DELAY);
      }

      throw error;
    }
  }, [user, setUser]);

  /**
   * Força sincronização imediata
   */
  const forceSync = useCallback(async () => {
    console.log('🔄 Forçando sincronização de saldo...');
    return await fetchBalanceFromAPI();
  }, [fetchBalanceFromAPI]);

  /**
   * Marca que uma transação foi realizada
   */
  const markTransaction = useCallback((transactionType, amount) => {
    lastTransactionRef.current = {
      type: transactionType,
      amount,
      timestamp: Date.now()
    };
    
    console.log(`💰 Transação marcada: ${transactionType} - R$ ${amount}`);
    
    // Sincronizar imediatamente após transação
    setTimeout(() => {
      fetchBalanceFromAPI();
    }, 1000); // Aguardar 1 segundo para o backend processar
  }, [fetchBalanceFromAPI]);

  /**
   * Verifica se os dados estão sincronizados
   */
  const checkSyncStatus = useCallback(async () => {
    try {
      const response = await api.get('/wallet');
      
      if (response.success && response.data) {
        const apiBalance = response.data.saldo_reais;
        const localBalance = balance.saldo_reais;
        
        if (Math.abs(apiBalance - localBalance) > 0.01) { // Tolerância de 1 centavo
          console.log('⚠️ Dados desincronizados detectados!');
          console.log(`   Local: R$ ${localBalance}`);
          console.log(`   API: R$ ${apiBalance}`);
          
          // Sincronizar automaticamente
          await fetchBalanceFromAPI();
          return false;
        }
        
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao verificar sincronização:', error);
      return false;
    }
  }, [balance.saldo_reais, fetchBalanceFromAPI]);

  /**
   * Inicia sincronização periódica
   */
  const startPeriodicSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    console.log('🔄 Iniciando sincronização periódica...');
    
    syncIntervalRef.current = setInterval(async () => {
      if (isOnlineRef.current) {
        await checkSyncStatus();
      }
    }, SYNC_INTERVAL);
  }, [checkSyncStatus]);

  /**
   * Para sincronização periódica
   */
  const stopPeriodicSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
      console.log('⏹️ Sincronização periódica parada');
    }
  }, []);

  /**
   * Verifica status de conectividade
   */
  const handleOnlineStatus = useCallback(() => {
    isOnlineRef.current = navigator.onLine;
    
    if (navigator.onLine) {
      console.log('🌐 Conexão restaurada - sincronizando...');
      fetchBalanceFromAPI();
      startPeriodicSync();
    } else {
      console.log('📴 Conexão perdida - parando sincronização');
      stopPeriodicSync();
    }
  }, [fetchBalanceFromAPI, startPeriodicSync, stopPeriodicSync]);

  // Efeitos
  useEffect(() => {
    // Sincronização inicial
    fetchBalanceFromAPI();
    
    // Iniciar sincronização periódica
    startPeriodicSync();
    
    // Listeners de conectividade
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    // Listener para eventos de transação
    const handleTransactionEvent = (event) => {
      const { type, amount } = event.detail;
      markTransaction(type, amount);
    };
    
    window.addEventListener('transactionCompleted', handleTransactionEvent);
    
    // Cleanup
    return () => {
      stopPeriodicSync();
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      window.removeEventListener('transactionCompleted', handleTransactionEvent);
    };
  }, [fetchBalanceFromAPI, startPeriodicSync, stopPeriodicSync, handleOnlineStatus, markTransaction]);

  // Sincronização quando o usuário muda
  useEffect(() => {
    if (user) {
      fetchBalanceFromAPI();
    }
  }, [user?.id, fetchBalanceFromAPI]);

  return {
    balance,
    forceSync,
    markTransaction,
    checkSyncStatus,
    startPeriodicSync,
    stopPeriodicSync,
    isOnline: isOnlineRef.current
  };
};

export default useBalanceSync;
