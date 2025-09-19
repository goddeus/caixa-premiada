import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { 
  FaUsers, 
  FaDollarSign, 
  FaChartLine, 
  FaGift, 
  FaUserPlus, 
  FaArrowUp, 
  FaArrowDown,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data.data || {});
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      toast.error('Erro ao carregar dados do dashboard');
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Visão geral do sistema</p>
        </div>
        <button
          onClick={loadDashboardData}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaChartLine className="mr-2" />
          Atualizar
        </button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de Usuários */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-600">
              <FaUsers className="text-white text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Total de Usuários</p>
              <p className="text-white font-bold text-2xl">
                {formatNumber(stats.total_users)}
              </p>
            </div>
          </div>
        </div>

        {/* Usuários Ativos */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-600">
              <FaUserPlus className="text-white text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Usuários Ativos</p>
              <p className="text-white font-bold text-2xl">
                {formatNumber(stats.active_users)}
              </p>
            </div>
          </div>
        </div>

        {/* Caixa Total */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-600">
              <FaDollarSign className="text-white text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Caixa Total</p>
              <p className="text-white font-bold text-2xl">
                {formatCurrency(stats.house_edge)}
              </p>
            </div>
          </div>
        </div>

        {/* Sistema de Prêmios */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-600">
              <FaChartLine className="text-white text-xl" />
            </div>
            <div className="ml-4">
              <p className="text-gray-400 text-sm">Sistema de Prêmios</p>
              <p className="text-white font-bold text-2xl">
                Ativo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Receita */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Depósitos */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Depósitos</p>
              <p className="text-white font-bold text-2xl">
                {formatCurrency(stats.total_deposits)}
              </p>
            </div>
            <div className="text-green-400">
              <FaArrowUp className="text-2xl" />
            </div>
          </div>
        </div>

        {/* Saques */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Saques</p>
              <p className="text-white font-bold text-2xl">
                {formatCurrency(stats.total_withdrawals)}
              </p>
            </div>
            <div className="text-red-400">
              <FaArrowDown className="text-2xl" />
            </div>
          </div>
        </div>

        {/* Gastos com Afiliados */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Gastos Afiliados</p>
              <p className="text-white font-bold text-2xl">
                {formatCurrency(stats.total_affiliate_payments)}
              </p>
            </div>
            <div className="text-orange-400">
              <FaDollarSign className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saques Pendentes */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Saques Pendentes</p>
              <p className="text-white font-bold text-2xl">
                {formatNumber(stats.pending_withdrawals)}
              </p>
            </div>
            <div className="text-yellow-400">
              <FaClock className="text-2xl" />
            </div>
          </div>
        </div>

        {/* Saques Afiliados Pendentes */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Afiliados Pendentes</p>
              <p className="text-white font-bold text-2xl">
                {formatNumber(stats.pending_affiliate_withdrawals)}
              </p>
            </div>
            <div className="text-orange-400">
              <FaExclamationTriangle className="text-2xl" />
            </div>
          </div>
        </div>

        {/* Novos Esta Semana */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Novos Esta Semana</p>
              <p className="text-white font-bold text-2xl">
                {formatNumber(stats.new_users_this_week)}
              </p>
            </div>
            <div className="text-green-400">
              <FaCheckCircle className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Sistema de Prêmios */}
      {stats.prize_system && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">🎰 Sistema de Prêmios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Fundo Total</p>
                  <p className="text-white font-bold text-lg">
                    {formatCurrency(stats.prize_system.fundo_premios_total)}
                  </p>
                </div>
                <FaGift className="text-green-400 text-xl" />
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Prêmios Pagos</p>
                  <p className="text-white font-bold text-lg">
                    {formatCurrency(stats.prize_system.premios_pagos)}
                  </p>
                </div>
                <FaArrowUp className="text-yellow-400 text-xl" />
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Fundo Restante</p>
                  <p className="text-white font-bold text-lg">
                    {formatCurrency(stats.prize_system.fundo_restante)}
                  </p>
                </div>
                <FaChartLine className="text-blue-400 text-xl" />
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Utilização</p>
                  <p className="text-white font-bold text-lg">
                    {stats.prize_system.utilizacao_percentual}
                  </p>
                </div>
                <FaDollarSign className="text-purple-400 text-xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transações Recentes */}
      {stats.recent_transactions && stats.recent_transactions.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Transações Recentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 py-2">Usuário</th>
                  <th className="text-left text-gray-400 py-2">Tipo</th>
                  <th className="text-left text-gray-400 py-2">Valor</th>
                  <th className="text-left text-gray-400 py-2">Status</th>
                  <th className="text-left text-gray-400 py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_transactions.slice(0, 5).map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-700">
                    <td className="py-2 text-white">{transaction.user?.username || transaction.user?.nome}</td>
                    <td className="py-2 text-gray-300">{transaction.tipo}</td>
                    <td className="py-2 text-white">{formatCurrency(transaction.valor)}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        transaction.status === 'concluido' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-300">
                      {new Date(transaction.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
