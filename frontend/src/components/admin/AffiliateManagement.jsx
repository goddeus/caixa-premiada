import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FaUserFriends, FaSearch, FaCheck, FaTimes, FaEye } from 'react-icons/fa';

const AffiliateManagement = () => {
  const [affiliates, setAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });

  useEffect(() => {
    loadAffiliates();
  }, [searchTerm, pagination.page]);

  const loadAffiliates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm
      });

      const response = await api.get(`/admin/affiliates?${params}`);
      console.log('📡 Resposta completa da API Affiliates:', response.data);
      
      if (response.data?.success && response.data?.data) {
        setAffiliates(response.data.data.affiliates || []);
        setPagination(response.data.data.pagination || pagination);
      } else if (response.data?.affiliates) {
        // Fallback para estrutura alternativa
        setAffiliates(response.data.affiliates || []);
        setPagination(response.data.pagination || pagination);
      } else {
        setAffiliates([]);
        console.warn('Estrutura de resposta inesperada para afiliados:', response.data);
        toast.error('Erro ao carregar dados dos afiliados');
      }
    } catch (error) {
      console.error('Erro ao carregar afiliados:', error);
      toast.error('Erro ao carregar afiliados');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalStatus = async (withdrawalId, status) => {
    if (window.confirm(`Tem certeza que deseja ${status === 'processado' ? 'aprovar' : 'cancelar'} este saque?`)) {
      try {
        await api.put(`/admin/affiliate-withdrawals/${withdrawalId}/status`, { status });
        toast.success(`Saque ${status === 'processado' ? 'aprovado' : 'cancelado'} com sucesso`);
        loadAffiliates();
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
        toast.error('Erro ao atualizar status do saque');
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gerenciamento de Afiliados</h1>
        <p className="text-gray-400 mt-1">Controle de comissões e saques de afiliados</p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar afiliado..."
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Afiliado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Código</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ganhos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Saldo Disponível</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Total Sacado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div></td></tr>
              ) : affiliates.map((affiliate) => (
                <tr key={affiliate.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">{affiliate.user?.username || affiliate.user?.nome}</div>
                    <div className="text-sm text-gray-400">{affiliate.user?.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">{affiliate.codigo_indicacao}</td>
                  <td className="px-6 py-4 text-sm text-green-400 font-semibold">{formatCurrency(affiliate.ganhos)}</td>
                  <td className="px-6 py-4 text-sm text-yellow-400 font-semibold">{formatCurrency(affiliate.saldo_disponivel)}</td>
                  <td className="px-6 py-4 text-sm text-blue-400 font-semibold">{formatCurrency(affiliate.total_sacado)}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300" title="Ver detalhes">
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AffiliateManagement;
