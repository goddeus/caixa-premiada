import { useState, useCallback } from 'react';

/**
 * Hook para prevenir cliques duplos e operações concorrentes
 * @param {number} cooldownMs - Tempo de cooldown em milissegundos (padrão: 2000ms)
 * @returns {Object} - { isLocked, executeWithLock, resetLock }
 */
export const useDoubleClickPrevention = (cooldownMs = 2000) => {
  const [isLocked, setIsLocked] = useState(false);
  const [lockReason, setLockReason] = useState('');

  const executeWithLock = useCallback(async (operation, reason = 'Operação em andamento') => {
    if (isLocked) {
      console.log(`[DEBUG] Operação bloqueada: ${lockReason}`);
      return { success: false, error: 'Operação já em andamento. Aguarde...' };
    }

    try {
      setIsLocked(true);
      setLockReason(reason);
      console.log(`[DEBUG] Iniciando operação com lock: ${reason}`);
      
      const result = await operation();
      
      // Manter o lock por um tempo mínimo para evitar cliques duplos
      setTimeout(() => {
        setIsLocked(false);
        setLockReason('');
        console.log(`[DEBUG] Lock liberado após: ${reason}`);
      }, cooldownMs);
      
      return { success: true, data: result };
    } catch (error) {
      // Em caso de erro, liberar o lock imediatamente
      setIsLocked(false);
      setLockReason('');
      console.error(`[DEBUG] Erro na operação, lock liberado: ${reason}`, error);
      throw error;
    }
  }, [isLocked, lockReason, cooldownMs]);

  const resetLock = useCallback(() => {
    setIsLocked(false);
    setLockReason('');
    console.log('[DEBUG] Lock resetado manualmente');
  }, []);

  return {
    isLocked,
    lockReason,
    executeWithLock,
    resetLock
  };
};

export default useDoubleClickPrevention;
