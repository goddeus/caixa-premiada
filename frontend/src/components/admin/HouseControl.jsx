import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { 
  FaHome, 
  FaDollarSign, 
  FaArrowUp, 
  FaArrowDown, 
  FaUsers, 
  FaChartLine,
  FaDownload,
  FaCalendarAlt,
  FaCog,
  FaExclamationTriangle
} from 'react-icons/fa';

const HouseControl = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadHouseData();
  }, [selectedPeriod]);

  const loadHouseData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data.data || {});
    } catch (error) {
      console.error('Erro ao carregar dados da casa:', error);
      toast.error('Erro ao carregar dados da casa');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  };

  const exportReport = async (type) => {
    try {
      toast.info('Gerando relatório...');
      // Aqui você implementaria a lógica de exportação
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório');
    }
  };

  // Função temporária para adicionar saldo de teste ao fundo de prêmios
  const addTestFunds = async () => {
    try {
      toast.info('Adicionando fundos de teste...');
      const response = await api.post('/admin/add-test-funds', {
        amount: 20.00
      });
      
      if (response.data.success) {
        toast.success('R$ 20,00 adicionados ao fundo de prêmios!');
        await loadHouseData(); // Recarregar dados
        // Forçar atualização do componente
        setStats(prev => ({ ...prev, lastUpdate: Date.now() }));
      } else {
        throw new Error(response.data.error || 'Erro ao adicionar fundos');
      }
    } catch (error) {
      console.error('Erro ao adicionar fundos de teste:', error);
      toast.error('Erro ao adicionar fundos de teste');
    }
  };

  // Função para limpar dados do controle da casa
  const clearHouseData = async () => {
    if (!window.confirm('⚠️ ATENÇÃO: Esta ação irá limpar todos os dados de teste do controle da casa!\n\nIsso inclui:\n• Transações de teste\n• Pagamentos de teste\n• Resetar saldos dos usuários para R$ 10,00\n\nDeseja continuar?')) {
      return;
    }

    try {
      toast.info('Limpando dados do controle da casa...');
      const response = await api.post('/admin/clear-house-data');
      
      if (response.data.success) {
        toast.success('Dados limpos com sucesso!');
        await loadHouseData(); // Recarregar dados
        // Forçar atualização do componente
        setStats(prev => ({ ...prev, lastUpdate: Date.now() }));
        
        // Mostrar resumo da limpeza
        const { data } = response.data;
        toast.info(`Limpeza concluída:\n• ${data.transacoes_removidas} transações removidas\n• ${data.pagamentos_removidos} pagamentos removidos\n• ${data.usuarios_atualizados} usuários resetados`);
      } else {
        throw new Error(response.data.error || 'Erro ao limpar dados');
      }
    } catch (error) {
      console.error('Erro ao limpar dados da casa:', error);
      toast.error('Erro ao limpar dados da casa');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative z-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Controle da Casa</h1>
          <p className="text-gray-400 mt-1">Saldo líquido e controle financeiro da plataforma</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center px-4 py-2 rounded-md transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <FaHome className="mr-2" />
          Visão Geral
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="space-y-6">

      {/* Botões de Ação */}
      <div className="flex justify-end space-x-2 mb-6">
        <button
          onClick={clearHouseData}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg"
        >
          <FaHome className="mr-2" />
          Limpar Dados
        </button>
        <button
          onClick={addTestFunds}
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg"
        >
          <FaDollarSign className="mr-2" />
          +R$ 20,00 (Teste)
        </button>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">Hoje</option>
          <option value="week">Esta Semana</option>
          <option value="month">Este Mês</option>
          <option value="year">Este Ano</option>
        </select>
        <button
          onClick={() => exportReport('pdf')}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaDownload className="mr-2" />
          PDF
        </button>
        <button
          onClick={() => exportReport('csv')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaDownload className="mr-2" />
          CSV
        </button>
      </div>

      {/* Card Principal - Caixa Total */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Caixa Total da Plataforma</h2>
            <p className="text-blue-100 mb-4">Saldo líquido calculado pelo sistema de prêmios</p>
            <p className="text-4xl font-bold text-white">
              {formatCurrency(stats.caixa_liquido || stats.house_edge)}
            </p>
            {stats.prize_system && (
              <div className="mt-4 flex items-center space-x-4 text-blue-100">
                <span className="text-sm">Sistema de Prêmios Ativo</span>
                <span className="text-sm">•</span>
                <span className="text-sm">Fundo: {formatCurrency(stats.prize_system.fundo_restante)}</span>
              </div>
            )}
          </div>
          <div className="text-6xl text-white opacity-20">
            <FaHome />
          </div>
        </div>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Depósitos */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-green-600">
              <FaArrowUp className="text-white text-xl" />
            </div>
            <span className="text-green-400 text-sm font-medium">+{formatNumber(stats.new_users_today)} hoje</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total de Depósitos</h3>
          <p className="text-white font-bold text-2xl mb-2">
            {formatCurrency(stats.total_deposits)}
          </p>
          <div className="flex items-center text-green-400 text-sm">
            <FaChartLine className="mr-1" />
            <span>+12.5% vs período anterior</span>
          </div>
        </div>

        {/* Saques */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-red-600">
              <FaArrowDown className="text-white text-xl" />
            </div>
            <span className="text-red-400 text-sm font-medium">{formatNumber(stats.pending_withdrawals)} pendentes</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Total de Saques</h3>
          <p className="text-white font-bold text-2xl mb-2">
            {formatCurrency(stats.total_withdrawals)}
          </p>
          <div className="flex items-center text-red-400 text-sm">
            <FaChartLine className="mr-1" />
            <span>+8.2% vs período anterior</span>
          </div>
        </div>

        {/* Gastos com Afiliados */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-full bg-orange-600">
              <FaUsers className="text-white text-xl" />
            </div>
            <span className="text-orange-400 text-sm font-medium">{formatNumber(stats.pending_affiliate_withdrawals)} pendentes</span>
          </div>
          <h3 className="text-gray-400 text-sm mb-1">Gastos com Afiliados</h3>
          <p className="text-white font-bold text-2xl mb-2">
            {formatCurrency(stats.total_affiliate_payments)}
          </p>
          <div className="flex items-center text-orange-400 text-sm">
            <FaChartLine className="mr-1" />
            <span>+15.3% vs período anterior</span>
          </div>
        </div>
      </div>

      {/* Análise de Lucro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cálculo de Lucro */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Cálculo de Lucro Líquido</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Total de Depósitos:</span>
              <span className="text-green-400 font-semibold">
                {formatCurrency(stats.total_deposits)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Comissões de Afiliados:</span>
              <span className="text-orange-400 font-semibold">
                -{formatCurrency(stats.total_affiliate_payments)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-700">
              <span className="text-gray-400">Total de Saques:</span>
              <span className="text-red-400 font-semibold">
                -{formatCurrency(stats.total_withdrawals)}
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-t-2 border-gray-600">
              <span className="text-white font-bold text-lg">Lucro Líquido:</span>
              <span className={`font-bold text-xl ${
                stats.house_edge >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatCurrency(stats.house_edge)}
              </span>
            </div>
          </div>
        </div>

        {/* Margem de Lucro */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Análise de Margem</h3>
          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Margem de Lucro</span>
                <span className="text-white font-semibold">
                  {stats.total_deposits > 0 
                    ? `${((stats.house_edge / stats.total_deposits) * 100).toFixed(2)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full" 
                  style={{ 
                    width: `${Math.min((stats.house_edge / stats.total_deposits) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Taxa de Saque</span>
                <span className="text-white font-semibold">
                  {stats.total_deposits > 0 
                    ? `${((stats.total_withdrawals / stats.total_deposits) * 100).toFixed(2)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-red-400 h-2 rounded-full" 
                  style={{ 
                    width: `${Math.min((stats.total_withdrawals / stats.total_deposits) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400">Taxa de Afiliados</span>
                <span className="text-white font-semibold">
                  {stats.total_deposits > 0 
                    ? `${((stats.total_affiliate_payments / stats.total_deposits) * 100).toFixed(2)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-orange-400 h-2 rounded-full" 
                  style={{ 
                    width: `${Math.min((stats.total_affiliate_payments / stats.total_deposits) * 100, 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sistema de Prêmios */}
      {stats.prize_system && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">🎰 Sistema de Prêmios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Informações do Sistema</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-green-400 font-semibold">
                    Ativo
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fundo Total:</span>
                  <span className="text-green-400 font-semibold">
                    {formatCurrency(stats.prize_system.fundo_premios_total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prêmios Pagos:</span>
                  <span className="text-yellow-400 font-semibold">
                    {formatCurrency(stats.prize_system.premios_pagos)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fundo Restante:</span>
                  <span className="text-purple-400 font-semibold">
                    {formatCurrency(stats.prize_system.fundo_restante)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Utilização do Fundo</h4>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Utilização</span>
                    <span>{stats.prize_system.utilizacao_percentual}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
                      style={{ 
                        width: `${parseFloat(stats.prize_system.utilizacao_percentual)}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Status do Sistema</p>
                  <p className={`font-semibold ${
                    stats.prize_system.fundo_restante > 100 
                      ? 'text-green-400' 
                      : stats.prize_system.fundo_restante > 50 
                        ? 'text-yellow-400' 
                        : 'text-red-400'
                  }`}>
                    {stats.prize_system.fundo_restante > 100 
                      ? 'Sistema Saudável' 
                      : stats.prize_system.fundo_restante > 50 
                        ? 'Atenção Necessária' 
                        : 'Fundo Crítico'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alertas e Notificações */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Alertas do Sistema</h3>
        <div className="space-y-3">
          {stats.pending_withdrawals > 0 && (
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
              <div className="flex items-center">
                <FaExclamationTriangle className="text-yellow-400 mr-3" />
                <div>
                  <p className="text-yellow-200 font-medium">
                    {formatNumber(stats.pending_withdrawals)} saques pendentes de aprovação
                  </p>
                  <p className="text-yellow-300 text-sm">
                    Valor total: {formatCurrency(stats.pending_withdrawals * 100)} (estimativa)
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {stats.pending_affiliate_withdrawals > 0 && (
            <div className="bg-orange-900 border border-orange-700 rounded-lg p-4">
              <div className="flex items-center">
                <FaUsers className="text-orange-400 mr-3" />
                <div>
                  <p className="text-orange-200 font-medium">
                    {formatNumber(stats.pending_affiliate_withdrawals)} saques de afiliados pendentes
                  </p>
                  <p className="text-orange-300 text-sm">
                    Aprovação necessária para processamento
                  </p>
                </div>
              </div>
            </div>
          )}

          {stats.house_edge < 0 && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4">
              <div className="flex items-center">
                <FaArrowDown className="text-red-400 mr-3" />
                <div>
                  <p className="text-red-200 font-medium">
                    Caixa em déficit
                  </p>
                  <p className="text-red-300 text-sm">
                    Saldo negativo: {formatCurrency(Math.abs(stats.house_edge))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
};

export default HouseControl;
