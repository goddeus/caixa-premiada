import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook para otimizar performance e evitar reflows forçados
 */
export const usePerformanceOptimized = () => {
  const rafRef = useRef(null);
  const timeoutRef = useRef(null);

  // Função para executar callback no próximo frame
  const nextFrame = useCallback((callback) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    
    rafRef.current = requestAnimationFrame(() => {
      try {
        callback();
      } catch (error) {
        console.error('Erro no callback otimizado:', error);
      }
    });
  }, []);

  // Função para debounce com requestAnimationFrame
  const debounceRAF = useCallback((callback, delay = 16) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      nextFrame(callback);
    }, delay);
  }, [nextFrame]);

  // Função para throttle com requestAnimationFrame
  const throttleRAF = useCallback((callback) => {
    let isThrottled = false;
    
    return (...args) => {
      if (!isThrottled) {
        isThrottled = true;
        nextFrame(() => {
          callback(...args);
          isThrottled = false;
        });
      }
    };
  }, [nextFrame]);

  // Função para otimizar operações DOM
  const batchDOMUpdates = useCallback((updates) => {
    nextFrame(() => {
      // Forçar reflow uma única vez
      document.body.offsetHeight;
      
      // Executar todas as atualizações
      updates.forEach(update => {
        try {
          update();
        } catch (error) {
          console.error('Erro na atualização DOM:', error);
        }
      });
    });
  }, [nextFrame]);

  // Função para otimizar scroll
  const optimizedScroll = useCallback((element, options = {}) => {
    nextFrame(() => {
      if (element && element.scrollTo) {
        element.scrollTo({
          behavior: 'smooth',
          ...options
        });
      }
    });
  }, [nextFrame]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup no unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    nextFrame,
    debounceRAF,
    throttleRAF,
    batchDOMUpdates,
    optimizedScroll,
    cleanup
  };
};

/**
 * Hook para otimizar animações CSS
 */
export const useAnimationOptimized = () => {
  const { nextFrame } = usePerformanceOptimized();

  // Função para animar propriedades CSS de forma otimizada
  const animateCSS = useCallback((element, properties, duration = 300) => {
    if (!element) return;

    nextFrame(() => {
      // Aplicar propriedades iniciais
      const initialStyles = {};
      Object.keys(properties).forEach(prop => {
        initialStyles[prop] = element.style[prop];
      });

      // Forçar reflow
      element.offsetHeight;

      // Aplicar propriedades finais
      Object.assign(element.style, properties);

      // Remover propriedades após animação
      setTimeout(() => {
        Object.keys(properties).forEach(prop => {
          element.style[prop] = initialStyles[prop];
        });
      }, duration);
    });
  }, [nextFrame]);

  // Função para animar com transform (mais performático)
  const animateTransform = useCallback((element, transform, duration = 300) => {
    if (!element) return;

    nextFrame(() => {
      element.style.transition = `transform ${duration}ms ease-out`;
      element.style.transform = transform;

      setTimeout(() => {
        element.style.transition = '';
      }, duration);
    });
  }, [nextFrame]);

  return {
    animateCSS,
    animateTransform
  };
};

export default usePerformanceOptimized;
