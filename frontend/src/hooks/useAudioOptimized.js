import { useRef, useCallback } from 'react';

/**
 * Hook para otimizar reprodução de áudio e evitar erros de reprodução
 */
export const useAudioOptimized = () => {
  const audioCacheRef = useRef(new Map());
  const playingAudiosRef = useRef(new Set());

  // Função para pré-carregar áudio
  const preloadAudio = useCallback((src) => {
    if (audioCacheRef.current.has(src)) {
      return audioCacheRef.current.get(src);
    }

    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = 0.3; // Volume padrão
    
    // Adicionar ao cache
    audioCacheRef.current.set(src, audio);
    
    return audio;
  }, []);

  // Função otimizada para tocar áudio
  const playAudio = useCallback(async (src, options = {}) => {
    try {
      const audio = preloadAudio(src);
      
      // Configurar opções
      if (options.volume !== undefined) {
        audio.volume = options.volume;
      }
      
      if (options.loop !== undefined) {
        audio.loop = options.loop;
      }

      // Parar áudio anterior se estiver tocando
      if (audio.currentTime > 0) {
        audio.pause();
        audio.currentTime = 0;
      }

      // Adicionar à lista de áudios tocando
      playingAudiosRef.current.add(audio);

      // Tentar reproduzir
      await audio.play();
      
      // Remover da lista quando terminar
      audio.addEventListener('ended', () => {
        playingAudiosRef.current.delete(audio);
      }, { once: true });

      audio.addEventListener('error', (e) => {
        console.warn(`Erro ao reproduzir áudio ${src}:`, e);
        playingAudiosRef.current.delete(audio);
      }, { once: true });

      return audio;
    } catch (error) {
      console.warn(`Não foi possível reproduzir áudio ${src}:`, error.message);
      return null;
    }
  }, [preloadAudio]);

  // Função para parar todos os áudios
  const stopAllAudio = useCallback(() => {
    playingAudiosRef.current.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        console.warn('Erro ao parar áudio:', error);
      }
    });
    playingAudiosRef.current.clear();
  }, []);

  // Função para parar áudio específico
  const stopAudio = useCallback((src) => {
    const audio = audioCacheRef.current.get(src);
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
        playingAudiosRef.current.delete(audio);
      } catch (error) {
        console.warn(`Erro ao parar áudio ${src}:`, error);
      }
    }
  }, []);

  // Função para ajustar volume de todos os áudios
  const setGlobalVolume = useCallback((volume) => {
    audioCacheRef.current.forEach(audio => {
      try {
        audio.volume = Math.max(0, Math.min(1, volume));
      } catch (error) {
        console.warn('Erro ao ajustar volume:', error);
      }
    });
  }, []);

  // Cleanup
  const cleanup = useCallback(() => {
    stopAllAudio();
    audioCacheRef.current.clear();
  }, [stopAllAudio]);

  return {
    playAudio,
    stopAudio,
    stopAllAudio,
    setGlobalVolume,
    preloadAudio,
    cleanup
  };
};

export default useAudioOptimized;
