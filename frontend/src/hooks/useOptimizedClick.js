import { useCallback, useRef } from 'react';

/**
 * Hook para otimizar handlers de clique e evitar violações de performance
 * Resolve problemas de 'click handler took Xms' e 'forced reflow'
 */
export const useOptimizedClick = (callback, delay = 0) => {
  const timeoutRef = useRef(null);
  const isProcessingRef = useRef(false);

  const optimizedCallback = useCallback((...args) => {
    // Evitar múltiplas execuções simultâneas
    if (isProcessingRef.current) {
      return;
    }

    // Limpar timeout anterior se existir
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Usar requestAnimationFrame para otimizar reflows
    const executeCallback = () => {
      isProcessingRef.current = true;
      
      try {
        callback(...args);
      } catch (error) {
        console.error('Erro no callback otimizado:', error);
      } finally {
        // Reset após um pequeno delay para evitar cliques duplos
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 100);
      }
    };

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        requestAnimationFrame(executeCallback);
      }, delay);
    } else {
      requestAnimationFrame(executeCallback);
    }
  }, [callback, delay]);

  // Cleanup no unmount
  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    isProcessingRef.current = false;
  }, []);

  return { optimizedCallback, cleanup };
};

/**
 * Hook para debounce de cliques
 */
export const useDebouncedClick = (callback, delay = 300) => {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      requestAnimationFrame(() => {
        callback(...args);
      });
    }, delay);
  }, [callback, delay]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { debouncedCallback, cleanup };
};

/**
 * Hook para throttle de cliques
 */
export const useThrottledClick = (callback, delay = 100) => {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef(null);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      requestAnimationFrame(() => {
        callback(...args);
      });
    } else {
      // Agendar para execução após o delay
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        lastCallRef.current = Date.now();
        requestAnimationFrame(() => {
          callback(...args);
        });
      }, delay - (now - lastCallRef.current));
    }
  }, [callback, delay]);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { throttledCallback, cleanup };
};

export default useOptimizedClick;
