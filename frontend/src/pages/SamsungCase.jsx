import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNavigation from '../components/BottomNavigation';
import useDoubleClickPrevention from '../hooks/useDoubleClickPrevention';

const SamsungCase = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, refreshUserData, getUserBalance } = useAuth();
  const { isLocked, executeWithLock } = useDoubleClickPrevention(3000); // 3 segundos de cooldown
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showIncentive, setShowIncentive] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', senha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [currentSamsungCase, setCurrentSamsungCase] = useState(null);
  const [creditedPrizes, setCreditedPrizes] = useState(new Set());

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);

    try {
      const result = await login(loginData.email, loginData.senha);
      if (result.success) {
        setShowLoginModal(false);
        setLoginData({ email: '', senha: '' });
      }
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSimulateCase = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    
    setIsSimulating(true);
    setShowSimulation(true);
    setShowResult(false);
    
    // Lista reduzida apenas com prêmios bons para incentivar depósito
    const incentivePrizes = [
      { name: 'R$ 500,00', value: 'R$ 500,00', rarity: 'rarity-3.png', image: '/imagens/CAIXA SAMSUNG/500.webp', bgColor: 'rgb(162, 89, 255)', sorteavel: true },
      { name: 'R$ 100,00', value: 'R$ 100,00', rarity: 'rarity-2.png', image: '/imagens/CAIXA SAMSUNG/100.png', bgColor: 'rgb(59, 130, 246)', sorteavel: true },
      { name: 'R$ 10,00', value: 'R$ 10,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA SAMSUNG/10.png', bgColor: 'rgb(176, 190, 197)', sorteavel: true },
      { name: 'R$ 5,00', value: 'R$ 5,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA SAMSUNG/5.png', bgColor: 'rgb(176, 190, 197)', sorteavel: true },
      { name: 'R$ 2,00', value: 'R$ 2,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA SAMSUNG/2.png', bgColor: 'rgb(176, 190, 197)', sorteavel: true },
      { name: 'R$ 1,00', value: 'R$ 1,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA SAMSUNG/1.png', bgColor: 'rgb(176, 190, 197)', sorteavel: true }
    ];
    
    // Simular seleção aleatória de prêmio
    const randomPrize = incentivePrizes[Math.floor(Math.random() * incentivePrizes.length)];
    setSelectedPrize(randomPrize);
    
    // Tocar som de sorteio
    const audio = new Audio('/sounds/slot-machine.mp3');
    audio.volume = 0.3;
    audio.play().catch(e => console.log('Audio não pode ser reproduzido'));
    
    setTimeout(() => {
      setIsSimulating(false);
      setShowSimulation(false); // Fechar modal de simulação
      setShowResult(true);
      // Tocar som de vitória
      const winAudio = new Audio('/sounds/win.mp3');
      winAudio.volume = 0.5;
      winAudio.play().catch(e => console.log('Audio não pode ser reproduzido'));
    }, 5000); // 5 segundos
  };

  // Função para gerar mensagem motivacional aleatória
  const getMotivationalMessage = () => {
    const messages = [
      "Não desista! A próxima pode ser a sua!",
      "Continue tentando! A sorte está chegando!",
      "A persistência é a chave do sucesso!",
      "Cada tentativa te aproxima da vitória!",
      "A sorte sorri para quem não desiste!",
      "Mantenha o foco! O prêmio está próximo!",
      "A próxima rodada pode mudar tudo!",
      "Não pare agora! Você está no caminho certo!"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleOpenCase = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const result = await executeWithLock(async () => {
      console.log('[DEBUG] Iniciando abertura de caixa Samsung com proteção contra cliques duplos');
      
      setIsSimulating(true);
      setShowSimulation(true);
      setShowResult(false);
      
      try {
        // Buscar ID da caixa Samsung primeiro
        const casesResponse = await api.get('/cases');
        const samsungCase = casesResponse.cases?.find(c => c.nome.includes('SAMSUNG'));
        
        if (!samsungCase) {
          toast.error('Caixa Samsung não encontrada');
          return;
        }

        // Armazenar a caixa Samsung no estado para usar na função creditPrize
        setCurrentSamsungCase(samsungCase);

        const casePrice = parseFloat(samsungCase.preco);
        
        if (parseFloat(getUserBalance()) < casePrice) {
          toast.error('Saldo insuficiente para abrir esta caixa');
          return;
        }

        // Comprar uma caixa
        const response = await api.post(`/cases/buy/${samsungCase.id}`);

        if (response.wonPrize) {
          const apiPrize = response.wonPrize;
        
          // Mapear prêmio da API para formato do frontend
          const mappedPrize = {
            name: apiPrize.nome,
            value: `R$ ${parseFloat(apiPrize.valor).toFixed(2).replace('.', ',')}`,
            rarity: 'rarity-1.png',
            image: apiPrize.sem_imagem ? null : '/imagens/CAIXA SAMSUNG/1.png', // Imagem padrão da pasta local
            bgColor: 'rgb(176, 190, 197)',
            apiPrize: apiPrize,
            sem_imagem: apiPrize.sem_imagem || false
          };
          
          // Mapear prêmios específicos baseado no nome e valor (apenas se não for prêmio ilustrativo)
          if (!apiPrize.sem_imagem) {
            if (apiPrize.nome.includes('R$ 500,00') || apiPrize.valor === 500) {
              mappedPrize.rarity = 'rarity-3.png';
              mappedPrize.image = '/imagens/CAIXA SAMSUNG/500.webp';
              mappedPrize.bgColor = 'rgb(162, 89, 255)';
            } else if (apiPrize.nome.includes('R$ 100,00') || apiPrize.valor === 100) {
              mappedPrize.rarity = 'rarity-2.png';
              mappedPrize.image = '/imagens/CAIXA SAMSUNG/100.png';
              mappedPrize.bgColor = 'rgb(59, 130, 246)';
            } else if (apiPrize.nome.includes('R$ 10,00') || apiPrize.valor === 10) {
              mappedPrize.rarity = 'rarity-1.png';
              mappedPrize.image = '/imagens/CAIXA SAMSUNG/10.png';
              mappedPrize.bgColor = 'rgb(176, 190, 197)';
            } else if (apiPrize.nome.includes('R$ 5,00') || apiPrize.valor === 5) {
              mappedPrize.rarity = 'rarity-1.png';
              mappedPrize.image = '/imagens/CAIXA SAMSUNG/5.png';
              mappedPrize.bgColor = 'rgb(176, 190, 197)';
            } else if (apiPrize.nome.includes('R$ 2,00') || apiPrize.valor === 2) {
              mappedPrize.rarity = 'rarity-1.png';
              mappedPrize.image = '/imagens/CAIXA SAMSUNG/2.png';
              mappedPrize.bgColor = 'rgb(176, 190, 197)';
            } else if (apiPrize.nome.includes('R$ 1,00') || apiPrize.valor === 1) {
              mappedPrize.rarity = 'rarity-1.png';
              mappedPrize.image = '/imagens/CAIXA SAMSUNG/1.png';
              mappedPrize.bgColor = 'rgb(176, 190, 197)';
            } else {
              // Fallback para outros prêmios baseado no valor
              if (apiPrize.valor >= 500) {
                mappedPrize.image = '/imagens/CAIXA SAMSUNG/500.webp';
              } else if (apiPrize.valor >= 100) {
                mappedPrize.image = '/imagens/CAIXA SAMSUNG/100.png';
              } else if (apiPrize.valor >= 10) {
                mappedPrize.image = '/imagens/CAIXA SAMSUNG/10.png';
              } else if (apiPrize.valor >= 5) {
                mappedPrize.image = '/imagens/CAIXA SAMSUNG/5.png';
              } else if (apiPrize.valor >= 2) {
                mappedPrize.image = '/imagens/CAIXA SAMSUNG/2.png';
              } else {
                mappedPrize.image = '/imagens/CAIXA SAMSUNG/1.png';
              }
            }
          }
          
          setSelectedPrize(mappedPrize);
          
          // O backend já atualizou o saldo, não precisamos chamar refreshUserData aqui
          
          // Tocar som de sorteio
          const audio = new Audio('/sounds/slot-machine.mp3');
          audio.volume = 0.3;
          audio.play().catch(e => console.log('Audio não pode ser reproduzido'));
          
          setTimeout(() => {
            setIsSimulating(false);
            setShowSimulation(false);
            setShowResult(true);
            // Tocar som de vitória
            const winAudio = new Audio('/sounds/win.mp3');
            winAudio.volume = 0.5;
            winAudio.play().catch(e => console.log('Audio não pode ser reproduzido'));
            
            // Creditar prêmio automaticamente
            setTimeout(() => {
              creditPrize(mappedPrize, samsungCase);
            }, 2000);
          }, 5000);
        } else {
          toast.error('Erro ao abrir caixa!');
          setIsSimulating(false);
          setShowSimulation(false);
        }
      } catch (error) {
        console.error('Erro ao abrir caixa:', error);
        toast.error('Erro ao abrir caixa. Tente novamente.');
        setIsSimulating(false);
        setShowSimulation(false);
      }
    }, 'Abertura de caixa Samsung');
    
    if (!result.success) {
      toast.error(result.error);
      setIsSimulating(false);
      setShowSimulation(false);
    }
  };

  // Função para gerar sequência aleatória de prêmios
  const generateRandomPrizeSequence = () => {
    // Prêmios sorteáveis da caixa Samsung
    const sorteablePrizes = [
      { name: 'R$ 1,00', value: 'R$ 1,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA SAMSUNG/1.png', bgColor: 'rgb(176, 190, 197)', sorteavel: true },
      { name: 'R$ 2,00', value: 'R$ 2,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA SAMSUNG/2.png', bgColor: 'rgb(176, 190, 197)', sorteavel: true },
      { name: 'R$ 5,00', value: 'R$ 5,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA SAMSUNG/5.png', bgColor: 'rgb(176, 190, 197)', sorteavel: true },
      { name: 'R$ 10,00', value: 'R$ 10,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA SAMSUNG/10.png', bgColor: 'rgb(176, 190, 197)', sorteavel: true },
      { name: 'R$ 100,00', value: 'R$ 100,00', rarity: 'rarity-2.png', image: '/imagens/CAIXA SAMSUNG/100.png', bgColor: 'rgb(59, 130, 246)', sorteavel: true },
      { name: 'R$ 500,00', value: 'R$ 500,00', rarity: 'rarity-3.png', image: '/imagens/CAIXA SAMSUNG/500.webp', bgColor: 'rgb(162, 89, 255)', sorteavel: true }
    ];

    // Combinar todos os prêmios (apenas os sorteáveis da caixa Samsung)
    const allPrizes = [...sorteablePrizes];
    
    // Criar uma sequência aleatória longa para simular sorteio real
    let randomSequence = [];
    for (let i = 0; i < 50; i++) {
      const randomIndex = Math.floor(Math.random() * allPrizes.length);
      randomSequence.push(allPrizes[randomIndex]);
    }
    
    // Duplicar a sequência para criar efeito contínuo
    return [...randomSequence, ...randomSequence];
  };

  const closeSimulation = () => {
    setShowSimulation(false);
    setIsSimulating(false);
    setShowResult(false);
    setShowIncentive(false);
    setSelectedPrize(null);
  };

  const continueSimulation = () => {
    setShowResult(false);
    setShowIncentive(true);
  };

  const closeIncentive = () => {
    setShowIncentive(false);
    setSelectedPrize(null);
  };

  const creditPrize = async (prize, caseInfo) => {
    if (!prize || !prize.apiPrize) {
      console.error('❌ Dados do prêmio inválidos para crédito');
      return;
    }

    // Verificar se o prêmio já foi creditado
    const prizeKey = `${prize.apiPrize.id}_${prize.apiPrize.nome}`;
    if (creditedPrizes.has(prizeKey)) {
      console.log('⚠️ Prêmio já foi creditado anteriormente');
      return;
    }

    try {
      console.log('💰 Creditando prêmio:', prize.apiPrize);
      
      const response = await api.post(`/cases/credit/${caseInfo.id}`, {
        prizeId: prize.apiPrize.id,
        prizeName: prize.apiPrize.nome,
        prizeValue: prize.apiPrize.valor
      });
      console.log('✅ Crédito da API:', response.data);

      if (response.data.credited) {
        // Marcar prêmio como creditado
        setCreditedPrizes(prev => new Set([...prev, prizeKey]));
        
        // O backend já atualizou o saldo, não precisamos chamar refreshUserData aqui
        toast.success('Prêmio creditado na sua carteira!');
      }
    } catch (error) {
      console.error('❌ Erro ao creditar prêmio:', error);
      console.error('❌ Erro completo:', error.response?.data);
      const message = error.response?.data?.error || 'Erro ao creditar prêmio';
      toast.error(message);
    }
  };

  const resetToMain = () => {
    setShowResult(false);
    setShowIncentive(false);
    setSelectedPrize(null);
    setCreditedPrizes(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header da Caixa */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <img 
              src="/imagens/caixa samsung.png" 
              alt="Caixa Samsung" 
              className="w-24 h-24 mx-auto mb-4 rounded-xl shadow-2xl"
            />
            <h1 className="text-3xl font-bold text-white mb-2">Caixa Samsung</h1>
            <p className="text-blue-200 mb-4">Prêmios incríveis esperando por você!</p>
            <div className="flex items-center justify-center gap-4 text-white">
              <div className="bg-green-500/20 px-3 py-1 rounded-full">
                <span className="text-green-300 font-semibold">R$ 7,00</span>
              </div>
              <div className="bg-blue-500/20 px-3 py-1 rounded-full">
                <span className="text-blue-300 font-semibold">Saldo: R$ {getUserBalance().toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleOpenCase}
            disabled={isLocked || !isAuthenticated}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              isLocked || !isAuthenticated
                ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isLocked ? 'Aguarde...' : isAuthenticated ? 'Abrir Caixa' : 'Fazer Login'}
          </button>
          
          <button
            onClick={handleSimulateCase}
            disabled={isLocked}
            className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
              isLocked
                ? 'bg-gray-500/50 text-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {isLocked ? 'Aguarde...' : 'Simular'}
          </button>
        </div>

        {/* Prêmios Disponíveis */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Prêmios Disponíveis</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { name: 'R$ 1,00', image: '/imagens/CAIXA SAMSUNG/1.png', rarity: 'rarity-1.png' },
              { name: 'R$ 2,00', image: '/imagens/CAIXA SAMSUNG/2.png', rarity: 'rarity-1.png' },
              { name: 'R$ 5,00', image: '/imagens/CAIXA SAMSUNG/5.png', rarity: 'rarity-1.png' },
              { name: 'R$ 10,00', image: '/imagens/CAIXA SAMSUNG/10.png', rarity: 'rarity-1.png' },
              { name: 'R$ 100,00', image: '/imagens/CAIXA SAMSUNG/100.png', rarity: 'rarity-2.png' },
              { name: 'R$ 500,00', image: '/imagens/CAIXA SAMSUNG/500.webp', rarity: 'rarity-3.png' }
            ].map((prize, index) => (
              <div key={index} className="bg-white/5 rounded-xl p-3 text-center border border-white/10">
                <img 
                  src={prize.image} 
                  alt={prize.name}
                  className="w-12 h-12 mx-auto mb-2 rounded-lg"
                />
                <p className="text-white text-sm font-medium">{prize.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
            <h3 className="text-white font-semibold mb-2">Total de Prêmios</h3>
            <p className="text-2xl font-bold text-green-400">6</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
            <h3 className="text-white font-semibold mb-2">Prêmio Máximo</h3>
            <p className="text-2xl font-bold text-yellow-400">R$ 500,00</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
            <h3 className="text-white font-semibold mb-2">Chance de Ganhar</h3>
            <p className="text-2xl font-bold text-blue-400">100%</p>
          </div>
        </div>
      </div>

      {/* Modal de Simulação */}
      {showSimulation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-6 max-w-md w-full border border-white/20">
            {isSimulating ? (
              <div className="text-center">
                <div className="animate-spin w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold text-white mb-2">Sorteando...</h3>
                <p className="text-blue-200">Aguarde enquanto sorteamos seu prêmio!</p>
              </div>
            ) : showResult ? (
              <div className="text-center">
                <div className="bg-white/10 rounded-xl p-4 mb-4">
                  <img 
                    src={selectedPrize?.image || '/imagens/CAIXA SAMSUNG/1.png'} 
                    alt="Prêmio"
                    className="w-20 h-20 mx-auto mb-3 rounded-lg"
                  />
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedPrize?.name}</h3>
                  <p className="text-green-400 font-semibold">Parabéns! Você ganhou!</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={continueSimulation}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    Continuar
                  </button>
                  <button
                    onClick={closeSimulation}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-all"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal de Incentivo */}
      {showIncentive && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-2xl p-6 max-w-md w-full border border-white/20">
            <div className="text-center">
              <div className="bg-white/10 rounded-xl p-4 mb-4">
                <img 
                  src={selectedPrize?.image || '/imagens/CAIXA SAMSUNG/1.png'} 
                  alt="Prêmio"
                  className="w-20 h-20 mx-auto mb-3 rounded-lg"
                />
                <h3 className="text-2xl font-bold text-white mb-2">{selectedPrize?.name}</h3>
                <p className="text-green-400 font-semibold mb-4">Você poderia ter ganhado isso!</p>
                <p className="text-white/80 text-sm mb-4">{getMotivationalMessage()}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all"
                >
                  Depositar
                </button>
                <button
                  onClick={closeIncentive}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-blue-900 to-purple-900 rounded-2xl p-6 max-w-md w-full border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Fazer Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Seu email"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm font-medium mb-2">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginData.senha}
                    onChange={(e) => setLoginData({...loginData, senha: e.target.value})}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                    placeholder="Sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-white/60 hover:text-white text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default SamsungCase;