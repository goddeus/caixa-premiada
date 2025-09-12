import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaCog, FaChartBar, FaSearch, FaWrench } from 'react-icons/fa';
import api from '../../services/api';

const PrizeValidation = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Carregar estatísticas iniciais
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/prize-validation/estatisticas');
      setStats(response.data.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const executarVerificacao = async () => {
    setLoading(true);
    try {
      const response = await api.post('/prize-validation/verificar');
      setValidationResult(response.data.data);
      setShowDetails(true);
      
      // Recarregar estatísticas após verificação
      await loadStats();
      
    } catch (error) {
      console.error('Erro na verificação:', error);
      alert('Erro ao executar verificação: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const corrigirAutomaticamente = async () => {
    if (!confirm('Tem certeza que deseja corrigir automaticamente as inconsistências? Esta ação não pode ser desfeita.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/prize-validation/corrigir-automaticamente');
      
      if (response.data.success) {
        alert(`Correção automática concluída! ${response.data.data.total_corrections} correções realizadas.`);
        
        // Recarregar estatísticas e executar nova verificação
        await loadStats();
        await executarVerificacao();
      } else {
        alert('Erro na correção automática: ' + response.data.message);
      }
      
    } catch (error) {
      console.error('Erro na correção:', error);
      alert('Erro ao corrigir automaticamente: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthScoreIcon = (score) => {
    if (score >= 90) return <FaCheckCircle className="text-green-500" />;
    if (score >= 70) return <FaExclamationTriangle className="text-yellow-500" />;
    return <FaExclamationTriangle className="text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FaChartBar className="mr-3 text-blue-500" />
              Validação de Prêmios
            </h2>
            <p className="text-gray-400 mt-2">
              Sistema de verificação de consistência entre front-end, banco de dados e lógica de sorteio
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={executarVerificacao}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <FaSearch />
              {loading ? 'Verificando...' : 'Verificar Agora'}
            </button>
            
            <button
              onClick={corrigirAutomaticamente}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <FaWrench />
              Corrigir Auto
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Score de Saúde</p>
                <p className={`text-2xl font-bold ${getHealthScoreColor(stats.health_score)}`}>
                  {stats.health_score.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">Apenas prêmios ativos</p>
              </div>
              <div className="text-3xl">
                {getHealthScoreIcon(stats.health_score)}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Caixas</p>
                <p className="text-2xl font-bold text-white">{stats.total_cases}</p>
              </div>
              <div className="text-3xl text-blue-500">
                <FaCog />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Prêmios Ativos</p>
                <p className="text-2xl font-bold text-green-400">{stats.active_prizes}</p>
                <p className="text-xs text-gray-500">Podem ser sorteados</p>
              </div>
              <div className="text-3xl text-green-500">
                <FaCheckCircle />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Prêmios Ilustrativos</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.illustrative_prizes}</p>
                <p className="text-xs text-gray-500">Apenas para exibição</p>
              </div>
              <div className="text-3xl text-yellow-500">
                <FaExclamationTriangle />
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total de Prêmios</p>
                <p className="text-2xl font-bold text-white">{stats.total_prizes}</p>
                <p className="text-xs text-gray-500">Ativos + Ilustrativos</p>
              </div>
              <div className="text-3xl text-purple-500">
                <FaChartBar />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resultado da Verificação */}
      {validationResult && (
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center">
              <FaSearch className="mr-2" />
              Resultado da Verificação
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              validationResult.has_inconsistencies 
                ? 'bg-red-900 text-red-300' 
                : 'bg-green-900 text-green-300'
            }`}>
              {validationResult.has_inconsistencies ? 'Inconsistências Encontradas' : 'Tudo OK'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Caixas Verificadas</p>
              <p className="text-2xl font-bold text-white">{validationResult.total_cases}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Prêmios Ativos</p>
              <p className="text-2xl font-bold text-green-400">{validationResult.active_prizes || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Prêmios Ilustrativos</p>
              <p className="text-2xl font-bold text-yellow-400">{validationResult.illustrative_prizes || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Inconsistências</p>
              <p className="text-2xl font-bold text-red-400">{validationResult.inconsistencies_found}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Tempo (ms)</p>
              <p className="text-2xl font-bold text-blue-400">{validationResult.processing_time_ms}</p>
            </div>
          </div>

          {/* Resumo por Tipo */}
          {validationResult.has_inconsistencies && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">Resumo por Tipo de Inconsistência</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(validationResult.summary).map(([type, count]) => {
                  if (count > 0) {
                    return (
                      <div key={type} className="bg-gray-700 rounded-lg p-3">
                        <p className="text-gray-300 text-sm capitalize">
                          {type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xl font-bold text-red-400">{count}</p>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* Detalhes das Inconsistências */}
          {validationResult.has_inconsistencies && showDetails && (
            <div>
              <h4 className="text-lg font-semibold text-white mb-3">Detalhes das Inconsistências</h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {validationResult.inconsistencies.map((inc, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">{inc.message}</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Tipo: <span className="text-yellow-400">{inc.type}</span>
                        </p>
                        <p className="text-gray-400 text-sm">
                          Prêmio ID: <span className="text-blue-400">{inc.prize_id}</span>
                        </p>
                        {inc.case_id && (
                          <p className="text-gray-400 text-sm">
                            Caixa ID: <span className="text-blue-400">{inc.case_id}</span>
                          </p>
                        )}
                      </div>
                      <span className="px-2 py-1 bg-red-900 text-red-300 rounded text-xs">
                        {inc.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Informações do Sistema */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Informações do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-2">Funcionalidades:</p>
            <ul className="text-gray-300 space-y-1">
              <li>• Validação automática na inicialização do servidor</li>
              <li>• Verificação antes de creditar prêmios</li>
              <li>• Logs detalhados de inconsistências</li>
              <li>• Correção automática de problemas simples</li>
              <li>• Integração com sistema de gerenciamento de prêmios</li>
            </ul>
          </div>
          <div>
            <p className="text-gray-400 mb-2">Regras de Validação:</p>
            <ul className="text-gray-300 space-y-1">
              <li>• Prêmios ilustrativos são ignorados na validação</li>
              <li>• Aceita nomes genéricos (Playstation 5, iPhone, etc.)</li>
              <li>• Não valida valores excessivos para ilustrativos</li>
              <li>• Foca apenas em inconsistências reais</li>
              <li>• Score de saúde calculado apenas para prêmios ativos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizeValidation;

