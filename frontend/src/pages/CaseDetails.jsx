import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FaGift, FaCoins, FaArrowLeft, FaSpinner } from 'react-icons/fa';

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser, refreshUserData, getUserBalance } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [animationIndex, setAnimationIndex] = useState(0);
  const [multipleResults, setMultipleResults] = useState([]);
  const [showMultipleResults, setShowMultipleResults] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [currentBoxIndex, setCurrentBoxIndex] = useState(0);
  const [showCurrentBox, setShowCurrentBox] = useState(false);

  useEffect(() => {
    loadCaseDetails();
  }, [id]);

  const loadCaseDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/cases/${id}`);
      setCaseData(response.data);
    } catch (error) {
      console.error('Erro ao carregar detalhes da caixa:', error);
      toast.error('Erro ao carregar detalhes da caixa');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCase = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para comprar uma caixa');
      return;
    }

    if ((getUserBalance()) < parseFloat(caseData.preco)) {
      toast.error('Saldo insuficiente para comprar esta caixa');
      return;
    }

    setBuying(true);
    try {
      console.log('Tentando comprar caixa:', id);
      console.log('Usuário:', user);
      const response = await api.post(`/cases/buy/${id}`);
      console.log('Resposta da API:', response.data);
      const { prizes, wonPrize, userBalance } = response.data;
      
      // Atualizar saldo do usuário imediatamente
      if (userBalance !== undefined) {
        updateUser({ saldo: userBalance });
      }
      
      // Iniciar animação
      setShowAnimation(true);
      setSelectedPrize(wonPrize);
      
      // Simular roleta
      let counter = 0;
      const maxIterations = 50; // Número de iterações da animação
      const interval = setInterval(() => {
        setAnimationIndex(Math.floor(Math.random() * prizes.length));
        counter++;
        
        if (counter >= maxIterations) {
          clearInterval(interval);
          // Parar no prêmio sorteado
          const wonIndex = prizes.findIndex(p => p.id === wonPrize.id);
          setAnimationIndex(wonIndex);
          
          // Mostrar mensagem de vitória
          setTimeout(() => {
            toast.success(`Parabéns! Você ganhou R$ ${parseFloat(wonPrize.valor).toFixed(2)}!`);
            setShowAnimation(false);
            setBuying(false);
            // Atualizar dados do usuário - apenas uma vez por operação
            refreshUserData(true); // force = true para garantir atualização
          }, 1000);
        }
      }, 100);
      
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao comprar caixa';
      toast.error(message);
      setBuying(false);
    }
  };

  const handleBuyMultipleCases = async () => {
    if (!user) {
      toast.error('Você precisa estar logado para comprar caixas');
      return;
    }

    const totalCost = parseFloat(caseData.preco) * quantity;
    if ((getUserBalance()) < totalCost) {
      toast.error('Saldo insuficiente para comprar esta quantidade de caixas');
      return;
    }

    setBuying(true);
    try {
      console.log('Tentando comprar múltiplas caixas:', id, 'Quantidade:', quantity);
      const response = await api.post(`/cases/buy-multiple/${id}`, { quantity });
      console.log('Resposta da API:', response.data);
      
      const { results, totalCost, totalWon, netResult, userBalance } = response.data;
      
      // Atualizar saldo do usuário imediatamente
      if (userBalance !== undefined) {
        updateUser({ saldo: userBalance });
      }
      
      // Mostrar resultados sequencialmente
      setMultipleResults(results);
      setCurrentBoxIndex(0);
      setShowCurrentBox(true);
      setShowMultipleResults(true);
      
      setBuying(false);
      // Atualizar dados do usuário - apenas uma vez por operação
      refreshUserData(true); // force = true para garantir atualização
      
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao comprar caixas';
      toast.error(message);
      setBuying(false);
    }
  };

  const handleNextBox = () => {
    if (currentBoxIndex < multipleResults.length - 1) {
      setCurrentBoxIndex(currentBoxIndex + 1);
    } else {
      // Mostrar resumo final
      const totalWon = multipleResults.reduce((acc, result) => {
        return acc + (result.success && result.prize?.valor > 0 ? result.prize.valor : 0);
      }, 0);
      
      if (totalWon > 0) {
        toast.success(`Você ganhou R$ ${totalWon.toFixed(2)} em ${quantity} caixas!`);
      } else {
        toast.info(`Você abriu ${quantity} caixas. Quem sabe na próxima!`);
      }
      
      setShowCurrentBox(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Caixa não encontrada</h1>
          <p className="text-red-200">
            A caixa que você está procurando não existe ou foi removida.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-blue-400 hover:text-blue-300 mb-4"
        >
          <FaArrowLeft className="mr-2" />
          Voltar ao Dashboard
        </button>
        
        <h1 className="text-3xl font-bold text-white mb-2">
          🎁 {caseData.nome}
        </h1>
        <p className="text-gray-400">
          Descubra o que está dentro desta caixa especial!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Informações da Caixa */}
        <div className="space-y-6">
          {/* Card da Caixa */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FaGift className="text-6xl text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{caseData.nome}</h2>
              <p className="text-3xl font-bold text-green-400">
                R$ {parseFloat(caseData.preco).toFixed(2)}
              </p>
            </div>

            {/* Saldo do Usuário */}
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Seu Saldo:</span>
                <span className="text-white font-bold">
                  R$ {getUserBalance().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Controles de Compra */}
            <div className="space-y-4">
              {/* Seletor de Quantidade */}
              <div className="flex items-center justify-between">
                <label className="text-white font-medium">Quantidade:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2"
                  disabled={buying}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num}>{num} caixa{num > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              {/* Botões de Compra */}
              <div className="space-y-2">
                <button
                  onClick={handleBuyCase}
                  disabled={buying || (getUserBalance()) < parseFloat(caseData.preco)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {buying ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <FaCoins className="mr-2" />
                      Comprar 1 Caixa
                    </>
                  )}
                </button>

                {quantity > 1 && (
                  <button
                    onClick={handleBuyMultipleCases}
                    disabled={buying || (getUserBalance()) < (parseFloat(caseData.preco) * quantity)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {buying ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <FaGift className="mr-2" />
                        Comprar {quantity} Caixas (R$ {(parseFloat(caseData.preco) * quantity).toFixed(2)})
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {(getUserBalance()) < parseFloat(caseData.preco) && (
              <p className="text-red-400 text-sm text-center mt-2">
                Saldo insuficiente. Faça um depósito para continuar.
              </p>
            )}
          </div>
        </div>

        {/* Modal de Resultados Múltiplos - Exibição Sequencial */}
        {showMultipleResults && showCurrentBox && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-md w-full">
              <div className="p-6">
                {multipleResults[currentBoxIndex] && (
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-6">
                      Caixa {multipleResults[currentBoxIndex].boxNumber}
                    </h2>
                    
                    {multipleResults[currentBoxIndex].success ? (
                      <div>
                        {/* Só mostra imagem se não for prêmio ilustrativo */}
                        {multipleResults[currentBoxIndex].prize?.imagem_url && 
                         !multipleResults[currentBoxIndex].prize?.sem_imagem && (
                          <img
                            src={multipleResults[currentBoxIndex].prize.imagem_url}
                            alt={multipleResults[currentBoxIndex].prize.nome}
                            className="w-24 h-24 mx-auto mb-4 rounded-lg object-cover"
                          />
                        )}
                        
                        <p className={`text-lg font-medium mb-2 ${
                          multipleResults[currentBoxIndex].prize?.valor > 0 ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {multipleResults[currentBoxIndex].prize?.message || multipleResults[currentBoxIndex].prize?.nome}
                        </p>
                        
                        {multipleResults[currentBoxIndex].prize?.valor > 0 && (
                          <p className="text-2xl font-bold text-green-400 mb-4">
                            R$ {parseFloat(multipleResults[currentBoxIndex].prize.valor).toFixed(2)}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="text-red-400 text-lg">
                          Erro: {multipleResults[currentBoxIndex].error}
                        </p>
                      </div>
                    )}

                    <div className="mt-6 flex justify-between">
                      <button
                        onClick={() => setShowMultipleResults(false)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        Fechar
                      </button>
                      
                      <button
                        onClick={handleNextBox}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                      >
                        {currentBoxIndex < multipleResults.length - 1 ? 'Próxima' : 'Finalizar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Resumo Final */}
        {showMultipleResults && !showCurrentBox && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg max-w-md w-full">
              <div className="p-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">
                  Resumo das {multipleResults.length} Caixas
                </h2>
                
                <div className="space-y-2 mb-6">
                  {multipleResults.map((result, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-gray-300">Caixa {result.boxNumber}:</span>
                      <span className={`font-medium ${
                        result.success && result.prize?.valor > 0 
                          ? 'text-green-400' 
                          : result.success 
                          ? 'text-yellow-400' 
                          : 'text-red-400'
                      }`}>
                        {result.success 
                          ? (result.prize?.valor > 0 
                              ? `R$ ${parseFloat(result.prize.valor).toFixed(2)}` 
                              : result.prize?.message || 'Sem prêmio')
                          : 'Erro'
                        }
                      </span>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <p className="text-gray-300">Total Gasto:</p>
                  <p className="text-white font-bold text-xl">
                    R$ {(parseFloat(caseData.preco) * quantity).toFixed(2)}
                  </p>
                  
                  <p className="text-gray-300 mt-2">Total Ganho:</p>
                  <p className="text-green-400 font-bold text-xl">
                    R$ {multipleResults.reduce((acc, result) => {
                      return acc + (result.success && result.prize?.valor > 0 ? result.prize.valor : 0);
                    }, 0).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => setShowMultipleResults(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Prêmios */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <FaGift className="mr-2" />
              Prêmios Possíveis
            </h3>
            
            {showAnimation ? (
              /* Animação da Roleta */
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <p className="text-yellow-400 font-bold text-lg">🎰 Sorteando...</p>
                </div>
                {caseData.prizes.map((prize, index) => (
                  <div
                    key={prize.id}
                    className={`p-3 rounded-lg transition-all duration-200 ${
                      index === animationIndex
                        ? 'bg-yellow-600 text-white scale-105 shadow-lg'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {index === animationIndex && '🎯 '}Prêmio #{index + 1}
                      </span>
                      <span className="font-bold text-green-400">
                        R$ {parseFloat(prize.valor).toFixed(2)}
                      </span>
                    </div>
                    {index === animationIndex && (
                      <div className="text-center mt-2">
                        <span className="text-yellow-300 text-sm">
                          Probabilidade: {(prize.probabilidade * 100).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* Lista Normal de Prêmios */
              <div className="space-y-3">
                {caseData.prizes.map((prize, index) => (
                  <div
                    key={prize.id}
                    className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Prêmio #{index + 1}</span>
                      <span className="font-bold text-green-400">
                        R$ {parseFloat(prize.valor).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-center mt-1">
                      <span className="text-gray-400 text-sm">
                        Probabilidade: {(prize.probabilidade * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estatísticas */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4">Estatísticas</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Total de Prêmios</p>
                <p className="text-white font-bold text-xl">{caseData.prizes.length}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Valor Médio</p>
                <p className="text-white font-bold text-xl">
                  R$ {(caseData.prizes.reduce((acc, p) => acc + parseFloat(p.valor), 0) / caseData.prizes.length).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
