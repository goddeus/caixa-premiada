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
      const response = await api.get('/admin/deposits');
      setDeposits(response.data.data.deposits || []);
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
      const response = await api.get('/admin/withdrawals');
      setWithdrawals(response.data.data.withdrawals || []);
    } catch (error) {
      console.error('Erro ao carregar saques:', error);
      toast.error('Erro ao carregar saques');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawalStatus = async (withdrawalId, status) => {
    if (window.confirm(`Tem certeza que deseja ${status === 'concluido' ? 'aprovar' : 'cancelar'} este saque?`)) {
      try {
        await api.put(`/admin/withdrawals/${withdrawalId}/status`, { status });
        toast.success(`Saque ${status === 'concluido' ? 'aprovado' : 'cancelado'} com sucesso`);
        loadWithdrawals();
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
                      <td className="py-2 text-white">{deposit.user?.nome}</td>
                      <td className="py-2 text-green-400 font-semibold">{formatCurrency(deposit.valor)}</td>
                      <td className="py-2 text-gray-300">{deposit.metodo_pagamento}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          deposit.status === 'concluido' ? 'bg-green-100 text-green-800' :
                          deposit.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {deposit.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-300">{formatDate(deposit.criado_em)}</td>
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
                      <td className="py-2 text-white">{withdrawal.user?.nome}</td>
                      <td className="py-2 text-red-400 font-semibold">{formatCurrency(withdrawal.valor)}</td>
                      <td className="py-2 text-gray-300">{withdrawal.pix_key}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          withdrawal.status === 'concluido' ? 'bg-green-100 text-green-800' :
                          withdrawal.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-300">{formatDate(withdrawal.criado_em)}</td>
                      <td className="py-2">
                        {withdrawal.status === 'pendente' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleWithdrawalStatus(withdrawal.id, 'concluido')}
                              className="text-green-400 hover:text-green-300"
                              title="Aprovar saque"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleWithdrawalStatus(withdrawal.id, 'cancelado')}
                              className="text-red-400 hover:text-red-300"
                              title="Cancelar saque"
                            >
                              <FaTimes />
                            </button>
                          </div>
                        )}
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
