import { useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

/**
 * Hook para tratamento otimizado de erros
 */
export const useErrorHandler = () => {
  const errorCountRef = useRef(new Map());
  const lastErrorRef = useRef(new Map());

  // Função para tratar erros de forma inteligente
  const handleError = useCallback((error, context = '') => {
    const errorKey = `${context}-${error.message}`;
    const now = Date.now();
    
    // Evitar spam de erros (máximo 3 por minuto por contexto)
    const errorCount = errorCountRef.current.get(errorKey) || 0;
    const lastError = lastErrorRef.current.get(errorKey) || 0;
    
    if (errorCount >= 3 && (now - lastError) < 60000) {
      return; // Ignorar erro se já foi mostrado muitas vezes recentemente
    }
    
    // Atualizar contadores
    errorCountRef.current.set(errorKey, errorCount + 1);
    lastErrorRef.current.set(errorKey, now);
    
    // Log detalhado do erro
    console.error(`[${context}] Erro capturado:`, {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context
    });
    
    // Determinar tipo de erro e mostrar toast apropriado
    let errorMessage = 'Ocorreu um erro inesperado';
    let errorType = 'error';
    
    if (error.response) {
      // Erro de API
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 400:
          errorMessage = data?.error || 'Dados inválidos';
          break;
        case 401:
          errorMessage = 'Sessão expirada. Faça login novamente.';
          errorType = 'warning';
          break;
        case 403:
          errorMessage = 'Acesso negado';
          break;
        case 404:
          errorMessage = 'Recurso não encontrado';
          break;
        case 429:
          errorMessage = 'Muitas tentativas. Aguarde um momento.';
          errorType = 'warning';
          break;
        case 500:
          errorMessage = 'Erro interno do servidor';
          break;
        default:
          errorMessage = data?.error || `Erro ${status}`;
      }
    } else if (error.name === 'NetworkError' || error.message.includes('Network')) {
      errorMessage = 'Erro de conexão. Verifique sua internet.';
      errorType = 'warning';
    } else if (error.name === 'TimeoutError') {
      errorMessage = 'Tempo limite excedido. Tente novamente.';
      errorType = 'warning';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Mostrar toast
    if (errorType === 'warning') {
      toast.warning(errorMessage);
    } else {
      toast.error(errorMessage);
    }
    
    // Retornar erro tratado para análise adicional se necessário
    return {
      message: errorMessage,
      type: errorType,
      original: error,
      context
    };
  }, []);

  // Função para tratar erros de forma silenciosa (apenas log)
  const handleErrorSilent = useCallback((error, context = '') => {
    console.warn(`[${context}] Erro silencioso:`, error.message);
    
    // Retornar erro tratado
    return {
      message: error.message,
      type: 'silent',
      original: error,
      context
    };
  }, []);

  // Função para wrapper de funções assíncronas
  const withErrorHandling = useCallback((asyncFn, context = '') => {
    return async (...args) => {
      try {
        return await asyncFn(...args);
      } catch (error) {
        return handleError(error, context);
      }
    };
  }, [handleError]);

  // Função para wrapper de funções síncronas
  const withErrorHandlingSync = useCallback((syncFn, context = '') => {
    return (...args) => {
      try {
        return syncFn(...args);
      } catch (error) {
        return handleError(error, context);
      }
    };
  }, [handleError]);

  // Função para limpar contadores de erro
  const clearErrorCounters = useCallback(() => {
    errorCountRef.current.clear();
    lastErrorRef.current.clear();
  }, []);

  // Função para obter estatísticas de erro
  const getErrorStats = useCallback(() => {
    const stats = {};
    errorCountRef.current.forEach((count, key) => {
      stats[key] = {
        count,
        lastError: lastErrorRef.current.get(key)
      };
    });
    return stats;
  }, []);

  return {
    handleError,
    handleErrorSilent,
    withErrorHandling,
    withErrorHandlingSync,
    clearErrorCounters,
    getErrorStats
  };
};

/**
 * Hook para retry automático de operações
 */
export const useRetryHandler = () => {
  const { handleError } = useErrorHandler();

  const withRetry = useCallback(async (asyncFn, options = {}) => {
    const {
      maxRetries = 3,
      delay = 1000,
      backoff = 2,
      context = '',
      shouldRetry = (error) => error.response?.status >= 500
    } = options;

    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await asyncFn();
      } catch (error) {
        lastError = error;
        
        // Se não deve tentar novamente ou é a última tentativa
        if (!shouldRetry(error) || attempt === maxRetries) {
          break;
        }
        
        // Calcular delay com backoff exponencial
        const currentDelay = delay * Math.pow(backoff, attempt);
        
        console.log(`[${context}] Tentativa ${attempt + 1} falhou, tentando novamente em ${currentDelay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, currentDelay));
      }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    return handleError(lastError, `${context} (após ${maxRetries + 1} tentativas)`);
  }, [handleError]);

  return { withRetry };
};

export default useErrorHandler;
