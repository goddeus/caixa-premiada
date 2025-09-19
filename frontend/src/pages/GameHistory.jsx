import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const GameHistory = () => {
  const { user } = useAuth();
  const [gameHistory, setGameHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameHistory();
  }, []);

  const fetchGameHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile/game-history');
      setGameHistory(response.data.data || []); // A resposta agora vem em data.data
    } catch (error) {
      console.error('Erro ao buscar histórico de jogos:', error);
      // Dados mock para demonstração
      setGameHistory([
        {
          id: 1,
          caseName: 'CAIXA KIT NIKE',
          prize: 'R$ 2,00',
          date: '2024-01-15T10:30:00Z',
          status: 'won'
        },
        {
          id: 2,
          caseName: 'CAIXA CONSOLE',
          prize: 'R$ 5,00',
          date: '2024-01-14T15:45:00Z',
          status: 'won'
        },
        {
          id: 3,
          caseName: 'CAIXA PREMIUM',
          prize: 'Nenhum prêmio',
          date: '2024-01-13T09:20:00Z',
          status: 'lost'
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
          <h1 className="text-3xl font-bold text-white mb-8">Histórico de Jogos</h1>
          
          {gameHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <line x1="6" x2="10" y1="11" y2="11"></line>
                  <line x1="8" x2="8" y1="9" y2="13"></line>
                  <line x1="15" x2="15.01" y1="12" y2="12"></line>
                  <line x1="18" x2="18.01" y1="10" y2="10"></line>
                  <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Nenhum jogo encontrado</h3>
              <p className="text-gray-400">Você ainda não jogou nenhuma caixa.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gameHistory.map((game) => (
                <div key={game.id} className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                          <line x1="6" x2="10" y1="11" y2="11"></line>
                          <line x1="8" x2="8" y1="9" y2="13"></line>
                          <line x1="15" x2="15.01" y1="12" y2="12"></line>
                          <line x1="18" x2="18.01" y1="10" y2="10"></line>
                          <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{game.caseName}</h3>
                        <p className="text-gray-400 text-sm">{formatDate(game.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${game.status === 'won' ? 'text-green-400' : 'text-red-400'}`}>
                        {game.prize}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        game.status === 'won' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {game.status === 'won' ? 'Ganhou' : 'Perdeu'}
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

export default GameHistory;
