import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { 
  FaArrowUp, 
  FaArrowDown, 
  FaDollarSign, 
  FaUsers, 
  FaGift, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaCog,
  FaHistory,
  FaSave,
  FaSync
} from 'react-icons/fa';

const RTPControlPanel = () => {
  const [rtpConfig, setRtpConfig] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [cashFlowStats, setCashFlowStats] = useState(null);
  const [rtpHistory, setRtpHistory] = useState([]);
  const [protectionStats, setProtectionStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newRTP, setNewRTP] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [configRes, recommendationRes, statsRes, historyRes, protectionRes, auditRes] = await Promise.all([
        api.get('/admin/rtp/config'),
        api.get('/admin/rtp/recommended'),
        api.get('/admin/rtp/cashflow-stats'),
        api.get('/admin/rtp/history?limit=10'),
        api.get('/admin/rtp/protection-stats'),
        api.get('/admin/audit/logs?limit=10')
      ]);

      if (configRes.data.success) setRtpConfig(configRes.data.data);
      if (recommendationRes.data.success) setRecommendation(recommendationRes.data.data);
      if (statsRes.data.success) setCashFlowStats(statsRes.data.data);
      if (historyRes.data.success) setRtpHistory(historyRes.data.data);
      if (protectionRes.data.success) setProtectionStats(protectionRes.data.stats);
      if (auditRes.data.success) setAuditLogs(auditRes.data.logs);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do painel');
      toast.error('Erro ao carregar dados do painel');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRTP = async () => {
    if (!newRTP || newRTP < 10 || newRTP > 90) {
      setError('RTP deve estar entre 10% e 90%');
      return;
    }

    try {
      setUpdating(true);
      setError('');
      
      const response = await api.put('/admin/rtp/target', {
        rtp_target: parseFloat(newRTP),
        reason: reason || 'Alteração manual pelo administrador'
      });
      
      if (response.data.success) {
        setSuccess('RTP alvo atualizado com sucesso!');
        setNewRTP('');
        setReason('');
        await loadData();
        toast.success('RTP alvo atualizado com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.error || 'Erro ao atualizar RTP');
        toast.error(response.data.error || 'Erro ao atualizar RTP');
      }
    } catch (error) {
      console.error('Erro ao atualizar RTP:', error);
      setError('Erro interno do servidor');
      toast.error('Erro interno do servidor');
    } finally {
      setUpdating(false);
    }
  };

  const handleApplyRecommendation = async () => {
    try {
      setUpdating(true);
      setError('');
      
      const response = await api.post('/admin/rtp/apply-recommendation');
      
      if (response.data.success) {
        setSuccess('Recomendação de RTP aplicada com sucesso!');
        await loadData();
        toast.success('Recomendação de RTP aplicada com sucesso!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.error || 'Erro ao aplicar recomendação');
        toast.error(response.data.error || 'Erro ao aplicar recomendação');
      }
    } catch (error) {
      console.error('Erro ao aplicar recomendação:', error);
      setError('Erro interno do servidor');
      toast.error('Erro interno do servidor');
    } finally {
      setUpdating(false);
    }
  };

  const getRTPStatus = (rtp) => {
    if (rtp <= 30) return { color: 'bg-red-500', label: 'Restritivo' };
    if (rtp <= 50) return { color: 'bg-yellow-500', label: 'Equilibrado' };
    return { color: 'bg-green-500', label: 'Generoso' };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Controle de RTP</h2>
        <button
          onClick={loadData}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaSync className="mr-2" />
          Atualizar Dados
        </button>
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-400 mr-3" />
            <span className="text-red-200">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-900 border border-green-700 rounded-lg p-4">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-400 mr-3" />
            <span className="text-green-200">{success}</span>
          </div>
        </div>
      )}

      {/* Status Atual do RTP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">RTP Alvo Atual</h3>
            <div className={`w-3 h-3 rounded-full ${getRTPStatus(rtpConfig?.rtp_target).color}`}></div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {rtpConfig?.rtp_target?.toFixed(1)}%
            </div>
            <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
              {getRTPStatus(rtpConfig?.rtp_target).label}
            </span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">RTP Recomendado</h3>
            <FaArrowUp className="text-blue-400" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {recommendation?.rtp_recommended?.toFixed(1)}%
            </div>
            <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
              {getRTPStatus(recommendation?.rtp_recommended).label}
            </span>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Caixa Líquido</h3>
            <FaDollarSign className="text-green-400" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {formatCurrency(cashFlowStats?.caixa_atual?.saldo_liquido)}
            </div>
            <span className="text-gray-400 text-sm">Saldo atual</span>
          </div>
        </div>
      </div>

      {/* Controles de RTP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuração Manual */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Configuração Manual de RTP</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                RTP Alvo (%)
              </label>
              <input
                type="number"
                min="10"
                max="90"
                step="0.1"
                value={newRTP}
                onChange={(e) => setNewRTP(e.target.value)}
                placeholder="Ex: 45.5"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Valor entre 10% e 90%</p>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">
                Motivo (opcional)
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Ajuste para melhorar retenção"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button 
              onClick={handleUpdateRTP} 
              disabled={updating || !newRTP}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center"
            >
              <FaSave className="mr-2" />
              {updating ? 'Atualizando...' : 'Atualizar RTP Alvo'}
            </button>
          </div>
        </div>

        {/* Aplicar Recomendação */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Aplicar Recomendação Automática</h3>
          <div className="space-y-4">
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
              <h4 className="font-medium text-blue-200 mb-2">Recomendação do Sistema:</h4>
              <p className="text-blue-100">
                Baseado no caixa líquido atual ({formatCurrency(cashFlowStats?.caixa_atual?.saldo_liquido)}), 
                o sistema recomenda um RTP de <strong>{recommendation?.rtp_recommended?.toFixed(1)}%</strong>.
              </p>
            </div>

            <button 
              onClick={handleApplyRecommendation} 
              disabled={updating}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center"
            >
              <FaCog className="mr-2" />
              {updating ? 'Aplicando...' : 'Aplicar Recomendação'}
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas dos Últimos 7 Dias */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Estatísticas dos Últimos 7 Dias</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(cashFlowStats?.ultimos_7_dias?.depositos?.valor)}
            </div>
            <div className="text-sm text-gray-400">Depósitos</div>
            <div className="text-xs text-gray-500">{cashFlowStats?.ultimos_7_dias?.depositos?.quantidade} transações</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(cashFlowStats?.ultimos_7_dias?.saques?.valor)}
            </div>
            <div className="text-sm text-gray-400">Saques</div>
            <div className="text-xs text-gray-500">{cashFlowStats?.ultimos_7_dias?.saques?.quantidade} transações</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">
              {formatCurrency(cashFlowStats?.ultimos_7_dias?.comissoes_afiliados?.valor)}
            </div>
            <div className="text-sm text-gray-400">Comissões</div>
            <div className="text-xs text-gray-500">{cashFlowStats?.ultimos_7_dias?.comissoes_afiliados?.quantidade} pagamentos</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(cashFlowStats?.ultimos_7_dias?.aberturas_caixas?.valor)}
            </div>
            <div className="text-sm text-gray-400">Caixas Abertas</div>
            <div className="text-xs text-gray-500">{cashFlowStats?.ultimos_7_dias?.aberturas_caixas?.quantidade} aberturas</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {formatCurrency(cashFlowStats?.ultimos_7_dias?.premios_pagos?.valor)}
            </div>
            <div className="text-sm text-gray-400">Prêmios Pagos</div>
            <div className="text-xs text-gray-500">{cashFlowStats?.ultimos_7_dias?.premios_pagos?.quantidade} prêmios</div>
          </div>
        </div>
      </div>

      {/* Histórico de Alterações */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Histórico de Alterações do RTP</h3>
        <div className="space-y-3">
          {rtpHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma alteração registrada</p>
          ) : (
            rtpHistory.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    entry.change_type === 'manual' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-white">
                      {entry.change_type === 'manual' ? 'Alteração Manual' : 'Recomendação Aplicada'}
                    </div>
                    <div className="text-sm text-gray-400">
                      {entry.old_rtp.toFixed(1)}% → {entry.new_rtp.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">
                    {new Date(entry.created_at).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.created_at).toLocaleTimeString('pt-BR')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Estatísticas de Proteção RTP */}
      {protectionStats && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaExclamationTriangle className="mr-2 text-yellow-500" />
            Proteção RTP Ativa
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {formatCurrency(protectionStats.limiteMaxPremio)}
                </div>
                <div className="text-sm text-gray-400">Limite Máximo de Prêmio</div>
                <div className="text-xs text-gray-500">RTP: {protectionStats.rtpConfig}%</div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {protectionStats.premiosBloqueados24h}
                </div>
                <div className="text-sm text-gray-400">Prêmios Bloqueados (24h)</div>
                <div className="text-xs text-gray-500">Por segurança</div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">
                  {protectionStats.totalPremiosBloqueados}
                </div>
                <div className="text-sm text-gray-400">Total Bloqueados</div>
                <div className="text-xs text-gray-500">Histórico completo</div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {formatCurrency(protectionStats.caixaLiquido)}
                </div>
                <div className="text-sm text-gray-400">Caixa Líquido</div>
                <div className="text-xs text-gray-500">Base do cálculo</div>
              </div>
            </div>
          </div>

          <div className="bg-green-900 border border-green-700 rounded-lg p-4">
            <div className="flex items-center">
              <FaCheckCircle className="text-green-400 mr-2" />
              <div>
                <div className="text-green-400 font-semibold">Sistema de Proteção Ativo</div>
                <div className="text-green-300 text-sm">
                  Nenhum prêmio pode exceder {formatCurrency(protectionStats.limiteMaxPremio)} 
                  (RTP: {protectionStats.rtpConfig}% do caixa líquido)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logs de Auditoria */}
      {auditLogs.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaHistory className="mr-2 text-red-500" />
            Logs de Auditoria - Prêmios Bloqueados
          </h3>
          
          <div className="space-y-3">
            {auditLogs.map((log, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-red-400 font-semibold">
                      Prêmio Bloqueado: {log.descricao}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Valor: {formatCurrency(log.valor)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">
                      {new Date(log.criado_em).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(log.criado_em).toLocaleTimeString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RTPControlPanel;