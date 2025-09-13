import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions');
      setTransactions(response.data); // A resposta vem diretamente em data
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      // Dados mock para demonstração
      setTransactions([
        {
          id: 1,
          tipo: 'deposito',
          valor: 50.00,
          status: 'concluido',
          criado_em: '2024-01-15T10:30:00Z',
          descricao: 'Depósito via PIX'
        },
        {
          id: 2,
          tipo: 'saque',
          valor: 20.00,
          status: 'pendente',
          criado_em: '2024-01-14T15:45:00Z',
          descricao: 'Saque via PIX'
        },
        {
          id: 3,
          tipo: 'deposito',
          valor: 100.00,
          status: 'concluido',
          criado_em: '2024-01-13T09:20:00Z',
          descricao: 'Depósito via PIX'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTransactionIcon = (tipo) => {
    if (tipo === 'deposito') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
          <path d="M12 2v20M7 5h5.5a3.5 3.5 0 0 1 0 7H7a3.5 3.5 0 0 0 0 7h5"/>
        </svg>
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-500/20 text-green-400';
      case 'pendente':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'falhou':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'concluido':
        return 'Concluída';
      case 'pendente':
        return 'Pendente';
      case 'falhou':
        return 'Falhou';
      default:
        return 'Desconhecido';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img alt="Mega Raspadinha" className="object-contain h-12 w-auto max-w-[150px]" src="/imagens/caixa premium.png" />
              <div className="flex flex-col">
                <span className="text-white font-black uppercase tracking-wider text-lg">SLOT BOX</span>
              </div>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold hover:opacity-90 transition flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Voltar
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8">Transações</h1>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" x2="8" y1="13" y2="13"></line>
                  <line x1="16" x2="8" y1="17" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Nenhuma transação encontrada</h3>
              <p className="text-gray-400">Você ainda não realizou nenhuma transação.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                        {getTransactionIcon(transaction.tipo)}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          {transaction.tipo === 'deposito' ? 'Depósito' : 'Saque'}
                        </h3>
                        <p className="text-gray-400 text-sm">{transaction.descricao}</p>
                        <p className="text-gray-400 text-sm">{formatDate(transaction.criado_em)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.tipo === 'deposito' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.tipo === 'deposito' ? '+' : '-'}{formatCurrency(transaction.valor)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;