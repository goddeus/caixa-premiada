import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import BottomNavigation from '../components/BottomNavigation';

const Withdraw = () => {
  const { user, refreshUserData } = useAuth();
  const navigate = useNavigate();
  
  // Estados do formulário
  const [amount, setAmount] = useState('20,00');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('email');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para histórico
  const [withdrawals, setWithdrawals] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Função para formatar valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para obter status em português
  const getStatusText = (status) => {
    const statusMap = {
      'processing': 'Processando',
      'concluido': 'Aprovado',
      'rejeitado': 'Rejeitado',
      'falhou': 'Falhou',
      'processando': 'Processando'
    };
    return statusMap[status] || status;
  };

  // Função para obter cor do status
  const getStatusColor = (status) => {
    const colorMap = {
      'processing': 'text-yellow-400',
      'concluido': 'text-green-400',
      'rejeitado': 'text-red-400',
      'falhou': 'text-red-400',
      'processando': 'text-yellow-400'
    };
    return colorMap[status] || 'text-gray-400';
  };

  // Função para carregar histórico de saques
  const loadWithdrawHistory = async (page = 1) => {
    try {
      setLoadingHistory(true);
      const response = await api.get(`/withdraw/history?page=${page}&limit=10`);
      
      if (response.success) {
        setWithdrawals(response.data.withdrawals || []);
        setCurrentPage(response.data.pagination?.page || 1);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico de saques');
    } finally {
      setLoadingHistory(false);
    }
  };

  // Função para processar saque
  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (isWithdrawing) return;
    
    setIsWithdrawing(true);
    setError('');
    
    try {
      // Converter valor para formato numérico
      const numericAmount = parseFloat(amount.replace(',', '.'));
      
      if (!numericAmount || numericAmount < 20) {
        setError('Valor mínimo para saque é R$ 20,00');
        return;
      }
      
      if (!pixKey.trim()) {
        setError('Chave PIX é obrigatória');
        return;
      }
      
      // Fazer requisição de saque
      const response = await api.post('/pixup/withdraw', {
        userId: user.id,
        amount: numericAmount,
        pixKey: pixKey.trim(),
        pixKeyType: pixKeyType
      });
      
      if (response.success) {
        // Sucesso - mostrar mensagem e limpar formulário
        toast.success('Saque solicitado com sucesso! Aguarde a aprovação.');
        setAmount('20,00');
        setPixKey('');
        setPixKeyType('email');
        
        // Atualizar dados do usuário e histórico
        refreshUserData();
        loadWithdrawHistory();
      } else {
        setError(response.error || 'Erro ao processar saque');
      }
      
    } catch (error) {
      console.error('Erro no saque:', error);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Erro ao processar saque. Tente novamente.');
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Função para alterar valor
  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9,]/g, '');
    if (value === '') {
      setAmount('20,00');
      return;
    }
    if (!value.includes(',')) {
      value += ',00';
    }
    setAmount(value);
  };

  // Função para selecionar valor rápido
  const handleQuickAmount = (quickAmount) => {
    setAmount(quickAmount);
  };

  // Carregar histórico ao montar o componente
  useEffect(() => {
    loadWithdrawHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/profile')}
                className="p-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
              <div className="flex flex-col">
                <span className="text-white font-black uppercase tracking-wider text-lg">SAQUE</span>
                <span className="text-gray-400 text-sm">Saldo: {formatCurrency(user?.saldo_reais || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Formulário de Saque */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M12 2v20M7 5h5.5a3.5 3.5 0 0 1 0 7H7a3.5 3.5 0 0 0 0 7h5"/>
            </svg>
            Solicitar Saque
          </h2>

          {/* Exibição de erro */}
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-4">
            {/* Campo de valor */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Valor do Saque
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white font-semibold">R$</span>
                <input
                  type="tel"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full pl-10 pr-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="20,00"
                />
              </div>
            </div>

            {/* Botões de valores rápidos */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Valores Rápidos
              </label>
              <div className="flex gap-2 flex-wrap">
                {['30,00', '50,00', '100,00', '200,00', '500,00'].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    type="button"
                    onClick={() => handleQuickAmount(quickAmount)}
                    className="bg-purple-500/20 text-purple-400 text-sm font-semibold px-3 py-2 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    R$ {quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Campo de chave PIX */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Chave PIX
              </label>
              <div className="flex gap-2">
                <select
                  value={pixKeyType}
                  onChange={(e) => setPixKeyType(e.target.value)}
                  className="border border-gray-600 bg-gray-700 text-white px-3 py-3 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                >
                  <option value="email">Email</option>
                  <option value="cpf">CPF</option>
                  <option value="phone">Telefone</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="random">Chave aleatória</option>
                </select>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="Digite sua chave PIX..."
                  className="flex-1 px-3 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Botão de solicitar saque */}
            <button
              type="submit"
              disabled={isWithdrawing}
              className={`w-full font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                isWithdrawing 
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:opacity-90'
              }`}
            >
              {isWithdrawing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                  Processando...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M7 5h5.5a3.5 3.5 0 0 1 0 7H7a3.5 3.5 0 0 0 0 7h5"/>
                  </svg>
                  Solicitar Saque
                </>
              )}
            </button>
          </form>

          {/* Informações importantes */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <h3 className="text-blue-300 font-semibold mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
              Informações Importantes
            </h3>
            <ul className="text-blue-200 text-sm space-y-1">
              <li>• Valor mínimo para saque: R$ 20,00</li>
              <li>• Saques são processados automaticamente via PIX</li>
              <li>• É necessário ter feito pelo menos 1 depósito confirmado</li>
              <li>• Limite diário: R$ 10.000,00 (máximo 5 saques por dia)</li>
            </ul>
          </div>
        </div>

        {/* Histórico de Saques */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" x2="8" y1="13" y2="13"/>
              <line x1="16" x2="8" y1="17" y2="17"/>
            </svg>
            Histórico de Saques
          </h2>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
              <p>Nenhum saque realizado ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">
                        {formatCurrency(withdrawal.valor)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatDate(withdrawal.criado_em)}
                      </p>
                      {withdrawal.metadata?.pixKey && (
                        <p className="text-gray-500 text-xs">
                          PIX: {withdrawal.metadata.pixKey}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${getStatusColor(withdrawal.status)}`}>
                        {getStatusText(withdrawal.status)}
                      </span>
                      {withdrawal.identifier && (
                        <p className="text-gray-500 text-xs">
                          ID: {withdrawal.identifier.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => loadWithdrawHistory(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500"
                  >
                    Anterior
                  </button>
                  <span className="text-gray-400">
                    {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => loadWithdrawHistory(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-500"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Withdraw;
