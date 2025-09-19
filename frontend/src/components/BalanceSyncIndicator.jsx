import React, { useState, useEffect } from 'react';
import { useBalanceSync } from '../hooks/useBalanceSync';

/**
 * Componente indicador de sincronização de saldo
 * 
 * Mostra:
 * - Status de sincronização
 * - Última atualização
 * - Indicador de conectividade
 * - Botão para forçar sincronização
 */
const BalanceSyncIndicator = ({ className = '' }) => {
  const { balance, forceSync, isOnline } = useBalanceSync();
  const [showDetails, setShowDetails] = useState(false);
  const [lastSyncAttempt, setLastSyncAttempt] = useState(null);

  // Formatar tempo relativo
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Nunca';
    
    const now = new Date();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 60) return `${seconds}s atrás`;
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return timestamp.toLocaleDateString();
  };

  // Obter status da sincronização
  const getSyncStatus = () => {
    if (!isOnline) return { status: 'offline', color: 'text-red-500', icon: '📴' };
    if (balance.loading) return { status: 'syncing', color: 'text-blue-500', icon: '🔄' };
    if (balance.error) return { status: 'error', color: 'text-red-500', icon: '❌' };
    if (balance.lastUpdated) {
      const age = Date.now() - balance.lastUpdated.getTime();
      if (age < 60000) return { status: 'synced', color: 'text-green-500', icon: '✅' };
      if (age < 300000) return { status: 'stale', color: 'text-yellow-500', icon: '⚠️' };
      return { status: 'outdated', color: 'text-orange-500', icon: '🕐' };
    }
    return { status: 'unknown', color: 'text-gray-500', icon: '❓' };
  };

  const syncStatus = getSyncStatus();

  // Forçar sincronização
  const handleForceSync = async () => {
    setLastSyncAttempt(Date.now());
    try {
      await forceSync();
    } catch (error) {
      console.error('Erro ao forçar sincronização:', error);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Indicador principal */}
      <div 
        className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-2 transition-colors"
        onClick={() => setShowDetails(!showDetails)}
        title="Status de sincronização do saldo"
      >
        <span className="text-lg">{syncStatus.icon}</span>
        <span className={`text-sm font-medium ${syncStatus.color}`}>
          {syncStatus.status === 'syncing' && 'Sincronizando...'}
          {syncStatus.status === 'synced' && 'Sincronizado'}
          {syncStatus.status === 'stale' && 'Desatualizado'}
          {syncStatus.status === 'outdated' && 'Muito antigo'}
          {syncStatus.status === 'error' && 'Erro'}
          {syncStatus.status === 'offline' && 'Offline'}
          {syncStatus.status === 'unknown' && 'Desconhecido'}
        </span>
        
        {balance.lastUpdated && (
          <span className="text-xs text-gray-500">
            {formatTimeAgo(balance.lastUpdated)}
          </span>
        )}
      </div>

      {/* Detalhes expandidos */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 min-w-80 z-50">
          <div className="space-y-3">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Status de Sincronização
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Status atual */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`text-sm font-medium ${syncStatus.color}`}>
                  {syncStatus.icon} {syncStatus.status}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Conectividade:</span>
                <span className={`text-sm font-medium ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
                  {isOnline ? '🌐 Online' : '📴 Offline'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Última atualização:</span>
                <span className="text-sm text-gray-900 dark:text-white">
                  {balance.lastUpdated ? balance.lastUpdated.toLocaleString() : 'Nunca'}
                </span>
              </div>

              {balance.error && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Erro:</span>
                  <span className="text-sm text-red-500 max-w-48 truncate" title={balance.error}>
                    {balance.error}
                  </span>
                </div>
              )}
            </div>

            {/* Saldo atual */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Saldo Real:</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                  R$ {balance.saldo_reais?.toFixed(2) || '0,00'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Saldo Demo:</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  R$ {balance.saldo_demo?.toFixed(2) || '0,00'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tipo de Conta:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {balance.tipo_conta || 'normal'}
                </span>
              </div>
            </div>

            {/* Ações */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              <button
                onClick={handleForceSync}
                disabled={balance.loading || !isOnline}
                className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-medium py-2 px-3 rounded-lg transition-colors"
              >
                {balance.loading ? '🔄 Sincronizando...' : '🔄 Forçar Sincronização'}
              </button>
            </div>

            {/* Informações adicionais */}
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <p>• A sincronização acontece automaticamente a cada 30 segundos</p>
              <p>• Transações são sincronizadas imediatamente</p>
              <p>• Dados são sempre obtidos da API (fonte da verdade)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSyncIndicator;
