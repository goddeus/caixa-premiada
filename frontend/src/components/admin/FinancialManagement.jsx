import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FaCreditCard, FaArrowUp, FaArrowDown, FaCheck, FaTimes } from 'react-icons/fa';

const FinancialManagement = () => {
  const [activeTab, setActiveTab] = useState('deposits');
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'deposits') {
      loadDeposits();
    } else {
      loadWithdrawals();
    }
  }, [activeTab]);

  const loadDeposits = async () => {
    try {
      setLoading(true);
      // Buscar depósitos da nova tabela deposits (VizzionPay)
      const response = await api.get('/admin/deposits');
      if (response.data.success && response.data.data) {
        setDeposits(response.data.data.deposits || []);
      } else {
        setDeposits([]);
        toast.error('Erro ao carregar dados dos depósitos');
      }
    } catch (error) {
      console.error('Erro ao carregar depósitos:', error);
      toast.error('Erro ao carregar depósitos');
    } finally {
      setLoading(false);
    }
  };

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/withdraw/all');
      if (response.success && response.data) {
        setWithdrawals(response.data.withdrawals || []);
      } else {
        setWithdrawals([]);
        toast.error('Erro ao carregar dados dos saques');
      }
    } catch (error) {
      console.error('Erro ao carregar saques:', error);
      toast.error('Erro ao carregar saques');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalStatus = async (withdrawalId, status) => {
    if (window.confirm(`Tem certeza que deseja ${status === 'concluido' ? 'aprovar' : 'rejeitar'} este saque?`)) {
      try {
        // Como os saques são automáticos via Vizzion Pay, apenas informamos que não é possível alterar
        toast.info('Saques são processados automaticamente via Vizzion Pay. Não é possível alterar o status manualmente.');
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

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestão Financeira</h1>
        <p className="text-gray-400 mt-1">Controle de depósitos e saques</p>
      </div>

      <div className="bg-gray-800 rounded-lg">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-6 py-3 font-medium ${activeTab === 'deposits' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            <FaArrowUp className="inline mr-2" />
            Depósitos
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-6 py-3 font-medium ${activeTab === 'withdrawals' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
          >
            <FaArrowDown className="inline mr-2" />
            Saques
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'deposits' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 py-2">Usuário</th>
                    <th className="text-left text-gray-400 py-2">Valor</th>
                    <th className="text-left text-gray-400 py-2">Método</th>
                    <th className="text-left text-gray-400 py-2">Status</th>
                    <th className="text-left text-gray-400 py-2">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="5" className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div></td></tr>
                  ) : deposits.map((deposit) => (
                    <tr key={deposit.id} className="border-b border-gray-700">
                      <td className="py-2 text-white">{deposit.user?.username || deposit.user?.nome}</td>
                      <td className="py-2 text-green-400 font-semibold">{formatCurrency(deposit.amount)}</td>
                      <td className="py-2 text-gray-300">PIX</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          deposit.status === 'approved' ? 'bg-green-100 text-green-800' :
                          deposit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {deposit.status === 'approved' ? 'Aprovado' : 
                           deposit.status === 'pending' ? 'Pendente' : 
                           deposit.status === 'failed' ? 'Falhou' : deposit.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-300">{formatDate(deposit.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left text-gray-400 py-2">Usuário</th>
                    <th className="text-left text-gray-400 py-2">Valor</th>
                    <th className="text-left text-gray-400 py-2">PIX Key</th>
                    <th className="text-left text-gray-400 py-2">Status</th>
                    <th className="text-left text-gray-400 py-2">Data</th>
                    <th className="text-left text-gray-400 py-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div></td></tr>
                  ) : withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-b border-gray-700">
                      <td className="py-2 text-white">{withdrawal.user?.nome || withdrawal.user?.email}</td>
                      <td className="py-2 text-red-400 font-semibold">{formatCurrency(withdrawal.valor)}</td>
                      <td className="py-2 text-gray-300">
                        {withdrawal.metadata?.pixKey ? 
                          `${withdrawal.metadata.pixKey.slice(0, 10)}...` : 
                          'N/A'
                        }
                      </td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          withdrawal.status === 'concluido' ? 'bg-green-100 text-green-800' :
                          withdrawal.status === 'processando' ? 'bg-yellow-100 text-yellow-800' :
                          withdrawal.status === 'rejeitado' || withdrawal.status === 'falhou' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {withdrawal.status === 'concluido' ? 'Aprovado' : 
                           withdrawal.status === 'processando' ? 'Processando' : 
                           withdrawal.status === 'rejeitado' ? 'Rejeitado' :
                           withdrawal.status === 'falhou' ? 'Falhou' : withdrawal.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-300">{formatDate(withdrawal.criado_em)}</td>
                      <td className="py-2">
                        <span className="text-gray-400 text-xs">
                          Automático
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialManagement;
