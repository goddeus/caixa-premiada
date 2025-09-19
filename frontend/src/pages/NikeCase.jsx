import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNavigation from '../components/BottomNavigation';
import useDoubleClickPrevention from '../hooks/useDoubleClickPrevention';
import { useOptimizedClick } from '../hooks/useOptimizedClick';
import { useAudioOptimized } from '../hooks/useAudioOptimized';

const NikeCase = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, refreshUserData, getUserBalance } = useAuth();
  const { isLocked, executeWithLock } = useDoubleClickPrevention(3000); // 3 segundos de cooldown
  const { playAudio, stopAllAudio, cleanup: audioCleanup } = useAudioOptimized();
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showIncentive, setShowIncentive] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('20,00');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', senha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [currentNikeCase, setCurrentNikeCase] = useState(null);
  const [isShowingPrizes, setIsShowingPrizes] = useState(false);
  const [wonPrizes, setWonPrizes] = useState([]);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [creditedPrizes, setCreditedPrizes] = useState(new Set());
  
  useEffect(() => {
    window.scrollTo(0, 0);
    
    // ✅ CORREÇÃO: Cleanup de áudio no unmount
    return () => {
      audioCleanup();
    };
  }, [audioCleanup]);


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
    
    // Lista reduzida apenas com prêmios altos para incentivar depósito
    const incentivePrizes = [
      { name: 'AIRFORCE 1', value: 'R$ 700,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA KIT NIKE/airforce.webp', bgColor: 'rgb(255, 215, 0)' },
      { name: 'NIKE DUNK LOW', value: 'R$ 1.000,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA KIT NIKE/nike dunk.webp', bgColor: 'rgb(255, 215, 0)' },
      { name: 'JORDAN 4', value: 'R$ 1.500,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA KIT NIKE/jordan.png', bgColor: 'rgb(255, 215, 0)' }
    ];
    
    // Simular seleção aleatória de prêmio
    const randomPrize = incentivePrizes[Math.floor(Math.random() * incentivePrizes.length)];
    setSelectedPrize(randomPrize);
    
    // ✅ CORREÇÃO: Tocar som de sorteio otimizado
    playAudio('/sounds/slot-machine.mp3', { volume: 0.3 });
    
    setTimeout(() => {
      setIsSimulating(false);
      setShowSimulation(false); // Fechar modal de simulação
      setShowResult(true);
      // ✅ CORREÇÃO: Tocar som de vitória otimizado
      playAudio('/sounds/win.mp3', { volume: 0.5 });
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
      console.log('[DEBUG] Iniciando abertura de caixa Nike com proteção contra cliques duplos');
      
      setIsSimulating(true);
      setShowSimulation(true);
      setShowResult(false);

      // Buscar ID da caixa Nike primeiro
      const casesResponse = await api.getCaixas();
      const nikeCase = casesResponse.data?.find(c =>
        c.nome === 'CAIXA KIT NIKE' || c.nome.includes('KIT NIKE')
      );
      
      if (!nikeCase) {
        throw new Error('Caixa Nike não encontrada');
      }

      setCurrentNikeCase(nikeCase);

      const casePrice = parseFloat(nikeCase.preco);

      if ((getUserBalance()) < casePrice) {
        toast.error(`Saldo insuficiente! Você precisa de R$ ${casePrice.toFixed(2)}`);
        setShowDepositModal(true);
        return;
      }

      // Comprar uma caixa
      const response = await api.post(`/cases/buy/${nikeCase.id}`);

      if (response && response.data && response.data.premio) {
        const apiPrize = response.data.premio;
      
        // Mapear prêmio da API para formato do frontend
        const mappedPrize = {
          name: apiPrize.nome,
          value: `R$ ${parseFloat(apiPrize.valor).toFixed(2).replace('.', ',')}`,
          rarity: 'rarity-1.png',
          image: apiPrize.sem_imagem ? null : '/imagens/CAIXA KIT NIKE/1.png', // Imagem padrão da pasta local
          bgColor: 'rgb(176, 190, 197)',
          apiPrize: apiPrize,
          sem_imagem: apiPrize.sem_imagem || false
        };
          
          // Mapear prêmios específicos baseado no nome (apenas se não for prêmio ilustrativo)
          if (!apiPrize.sem_imagem) {
            // Mapear prêmios específicos baseado nos 9 prêmios reais da CAIXA KIT NIKE
            if (apiPrize.valor === 1500) {
              // R$ 1500,00 - Air Jordan 4
              mappedPrize.rarity = 'rarity-5.png';
              mappedPrize.image = '/imagens/CAIXA KIT NIKE/jordan.png';
              mappedPrize.bgColor = 'rgb(255, 215, 0)';
            } else if (apiPrize.valor === 1000) {
              // R$ 1000,00 - Nike Dunk Low
              mappedPrize.rarity = 'rarity-5.png';
              mappedPrize.image = '/imagens/CAIXA KIT NIKE/nike dunk.webp';
              mappedPrize.bgColor = 'rgb(255, 215, 0)';
            } else if (apiPrize.valor === 700) {
              // R$ 700,00 - Air Force 1
              mappedPrize.rarity = 'rarity-4.png';
              mappedPrize.image = '/imagens/CAIXA KIT NIKE/airforce.webp';
              mappedPrize.bgColor = 'rgb(255, 59, 59)';
            } else if (apiPrize.valor === 100) {
              // R$ 100,00 - Camisa Nike Dry Fit
              mappedPrize.rarity = 'rarity-3.png';
              mappedPrize.image = '/imagens/CAIXA KIT NIKE/camisa nike.webp';
              mappedPrize.bgColor = 'rgb(162, 89, 255)';
            } else if (apiPrize.valor === 50) {
              // R$ 50,00 - Boné Nike
              mappedPrize.rarity = 'rarity-2.png';
              mappedPrize.image = '/imagens/CAIXA KIT NIKE/boné nike.png';
              mappedPrize.bgColor = 'rgb(59, 130, 246)';
            } else if (apiPrize.valor === 10) {
              // R$ 10,00 - Valor monetário
              mappedPrize.rarity = 'rarity-2.png';
              mappedPrize.image = '/imagens/CAIXA KIT NIKE/10.png';
              mappedPrize.bgColor = 'rgb(59, 130, 246)';
            } else if (apiPrize.valor === 5) {
              // R$ 5,00 - Valor monetário
              mappedPrize.rarity = 'rarity-1.png';
              mappedPrize.image = '/imagens/CAIXA KIT NIKE/5.png';
              mappedPrize.bgColor = 'rgb(176, 190, 197)';
            } else if (apiPrize.valor === 2) {
              // R$ 2,00 - Valor monetário
              mappedPrize.rarity = 'rarity-1.png';
              mappedPrize.image = '/imagens/CAIXA KIT NIKE/2.png';
              mappedPrize.bgColor = 'rgb(176, 190, 197)';
            } else if (apiPrize.valor === 1) {
              // R$ 1,00 - Valor monetário
              mappedPrize.rarity = 'rarity-1.png';
              mappedPrize.image = '/imagens/CAIXA KIT NIKE/1.png';
              mappedPrize.bgColor = 'rgb(176, 190, 197)';
            } else {
              // Fallback para outros valores
              if (apiPrize.valor >= 1500) {
                mappedPrize.image = '/imagens/CAIXA KIT NIKE/jordan.png';
                mappedPrize.rarity = 'rarity-5.png';
                mappedPrize.bgColor = 'rgb(255, 215, 0)';
              } else if (apiPrize.valor >= 1000) {
                mappedPrize.image = '/imagens/CAIXA KIT NIKE/nike dunk.webp';
                mappedPrize.rarity = 'rarity-5.png';
                mappedPrize.bgColor = 'rgb(255, 215, 0)';
              } else if (apiPrize.valor >= 700) {
                mappedPrize.image = '/imagens/CAIXA KIT NIKE/airforce.webp';
                mappedPrize.rarity = 'rarity-4.png';
                mappedPrize.bgColor = 'rgb(255, 59, 59)';
              } else if (apiPrize.valor >= 100) {
                mappedPrize.image = '/imagens/CAIXA KIT NIKE/camisa nike.webp';
                mappedPrize.rarity = 'rarity-3.png';
                mappedPrize.bgColor = 'rgb(162, 89, 255)';
              } else if (apiPrize.valor >= 50) {
                mappedPrize.image = '/imagens/CAIXA KIT NIKE/boné nike.png';
                mappedPrize.rarity = 'rarity-2.png';
                mappedPrize.bgColor = 'rgb(59, 130, 246)';
              } else if (apiPrize.valor >= 10) {
                mappedPrize.image = '/imagens/CAIXA KIT NIKE/10.png';
                mappedPrize.rarity = 'rarity-2.png';
                mappedPrize.bgColor = 'rgb(59, 130, 246)';
              } else if (apiPrize.valor >= 5) {
                mappedPrize.image = '/imagens/CAIXA KIT NIKE/5.png';
                mappedPrize.rarity = 'rarity-1.png';
                mappedPrize.bgColor = 'rgb(176, 190, 197)';
              } else if (apiPrize.valor >= 2) {
                mappedPrize.image = '/imagens/CAIXA KIT NIKE/2.png';
                mappedPrize.rarity = 'rarity-1.png';
                mappedPrize.bgColor = 'rgb(176, 190, 197)';
              } else {
                mappedPrize.image = '/imagens/CAIXA KIT NIKE/1.png';
                mappedPrize.rarity = 'rarity-1.png';
                mappedPrize.bgColor = 'rgb(176, 190, 197)';
              }
            }
        }
        
        setSelectedPrize(mappedPrize);
        
        // Dados serão atualizados após o crédito do prêmio
        
        // ✅ CORREÇÃO: Tocar som de sorteio otimizado
    playAudio('/sounds/slot-machine.mp3', { volume: 0.3 });
        
        setTimeout(() => {
          setIsSimulating(false);
          setShowSimulation(false);
          setShowResult(true);
          // ✅ CORREÇÃO: Tocar som de vitória otimizado
      playAudio('/sounds/win.mp3', { volume: 0.5 });
          
          // Creditar prêmio automaticamente
          setTimeout(() => {
            creditPrize(mappedPrize, nikeCase);
          }, 2000);
        }, 5000);
      } else {
        throw new Error('Erro ao abrir caixa!');
      }
    }, 'Abertura de caixa Nike');

    if (!result.success) {
      toast.error(result.error);
      setIsSimulating(false);
      setShowSimulation(false);
    }
  };

  // Função para gerar sequência aleatória de prêmios
  const generateRandomPrizeSequence = () => {
    // Prêmios sorteáveis (até R$ 1.000,00)
    const sorteablePrizes = [
      { name: 'R$ 1,00', value: 'R$ 1,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA KIT NIKE/1.png', bgColor: 'rgb(176, 190, 197)', sorteavel: true },
      { name: 'R$ 2,00', value: 'R$ 2,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA KIT NIKE/2.png', bgColor: 'rgb(176, 190, 197)', sorteavel: true },
      { name: 'R$ 5,00', value: 'R$ 5,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA KIT NIKE/5.png', bgColor: 'rgb(176, 190, 197)', sorteavel: true },
      { name: 'R$ 10,00', value: 'R$ 10,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA KIT NIKE/10.png', bgColor: 'rgb(176, 190, 197)', sorteavel: true },
      { name: 'BONÉ NIKE', value: 'R$ 50,00', rarity: 'rarity-2.png', image: '/imagens/CAIXA KIT NIKE/boné nike.png', bgColor: 'rgb(59, 130, 246)', sorteavel: true },
      { name: 'CAMISA NIKE', value: 'R$ 100,00', rarity: 'rarity-2.png', image: '/imagens/CAIXA KIT NIKE/camisa nike.webp', bgColor: 'rgb(59, 130, 246)', sorteavel: true },
      { name: 'AIR FORCE 1', value: 'R$ 700,00', rarity: 'rarity-3.png', image: '/imagens/CAIXA KIT NIKE/airforce.webp', bgColor: 'rgb(162, 89, 255)', sorteavel: true }
    ];

    // Prêmios ilustrativos (acima de R$ 1.000,00) - não sorteáveis
    const illustrativePrizes = [
      { name: 'NIKE DUNK', value: 'R$ 1.000,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA KIT NIKE/nike dunk.webp', bgColor: 'rgb(255, 215, 0)', sorteavel: false },
      { name: 'AIR JORDAN', value: 'R$ 1.500,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA KIT NIKE/jordan.png', bgColor: 'rgb(255, 215, 0)', sorteavel: false }
    ];

    // Combinar todos os prêmios (sorteáveis + ilustrativos para exibição)
    const allPrizes = [...sorteablePrizes, ...illustrativePrizes];
    
    // Criar uma sequência aleatória longa para simular sorteio real
    let randomSequence = [];
    for (let i = 0; i < 20; i++) {
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
    setWonPrizes([]);
    setCurrentPrizeIndex(0);
    setIsShowingPrizes(false);
  };

  const continueSimulation = () => {
    setShowResult(false);
    setShowIncentive(true);
  };

  // Funções para navegar entre prêmios
  const nextPrize = () => {
    if (currentPrizeIndex < wonPrizes.length - 1) {
      const nextIndex = currentPrizeIndex + 1;
      setCurrentPrizeIndex(nextIndex);
      setSelectedPrize(wonPrizes[nextIndex]);
      
      // Creditar o prêmio atual
      setTimeout(() => {
        creditPrize(wonPrizes[nextIndex], currentNikeCase);
      }, 500);
    }
  };


  const playAgain = () => {
    setWonPrizes([]);
    setCurrentPrizeIndex(0);
    setIsShowingPrizes(false);
    setShowResult(false);
    setShowSimulation(false);
    setIsSimulating(false);
    setSelectedPrize(null);
  };

  const exitGame = () => {
    setWonPrizes([]);
    setCurrentPrizeIndex(0);
    setIsShowingPrizes(false);
    setShowResult(false);
    setShowSimulation(false);
    setIsSimulating(false);
    setSelectedPrize(null);
    navigate('/');
  };

  const goToDashboard = () => {
    setShowResult(false);
    setShowIncentive(false);
    setSelectedPrize(null);
    navigate('/');
  };


  const creditPrize = async (prizeData = null, caseData = null) => {
    try {
      // Usar dados passados como parâmetro ou do estado
      const prize = prizeData || selectedPrize;
      const caseInfo = caseData || currentNikeCase;
      
      if (!caseInfo || !prize?.apiPrize) {
        toast.error('Dados do prêmio não encontrados');
        return;
      }

      // Verificar se o prêmio já foi creditado
      const prizeKey = `${caseInfo.id}-${prize.apiPrize.id}`;
      if (creditedPrizes.has(prizeKey)) {
        console.log('⚠️ Prêmio já foi creditado, ignorando...');
        return;
      }

      console.log('📤 Enviando requisição para creditar prêmio...');
      console.log('📤 Case ID:', caseInfo.id);
      console.log('📤 Prize ID:', prize.apiPrize.id);
      console.log('📤 Prize Value:', prize.apiPrize.valor);
      console.log('📤 Prize Name:', prize.apiPrize.nome);
      
      // ✅ CORREÇÃO: Chamar endpoint de crédito separadamente
      console.log('📤 Chamando endpoint de crédito...');
      
      const creditResponse = await api.post(`/cases/credit/${caseInfo.id}`, {
        prizeId: prize.apiPrize.id,
        prizeValue: prize.apiPrize.valor
      });
      
      if (creditResponse.success || creditResponse.credited) {
        console.log('✅ Prêmio creditado com sucesso!');
        
        // Marcar prêmio como creditado
        setCreditedPrizes(prev => new Set([...prev, prizeKey]));
        
        // Atualizar dados do usuário após crédito
        await refreshUserData(true);
        toast.success('Prêmio creditado na sua carteira!');
      } else {
        throw new Error(creditResponse.message || 'Erro ao creditar prêmio');
      }
    } catch (error) {
      console.error('❌ Erro ao creditar prêmio:', error);
      console.error('❌ Erro completo:', error.response?.data);
      const message = error.response?.data?.error || 'Erro ao creditar prêmio';
      toast.error(message);
    }
  };

  const resetToMain = () => {
    setShowIncentive(false);
    setSelectedPrize(null);
  };

  return (
    <>
      <div className="min-h-screen bg-[#0E1015]">
      {/* Header */}
      <header className="border-b border-[#212630]" style={{background:'#0E1015'}}>
        <div className="hidden md:flex container mx-auto px-4 py-1 md:py-2 items-center justify-between min-h-[28px]">
          <div className="flex items-center space-x-3">
            <img 
              alt="Mega Raspadinha" 
              className="object-contain h-16 w-auto max-w-[200px]" 
              src="/imagens/caixa premium.png"
            />
            <div className="flex flex-col">
              <span 
                className="text-white font-black uppercase tracking-wider"
                style={{
                  fontSize: '2.5rem',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)',
                  backgroundSize: '400% 400%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradientShift 3s ease-in-out infinite, textGlow 2s ease-in-out infinite alternate',
                  textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 165, 0, 0.3)',
                  fontFamily: 'Arial Black, sans-serif',
                  letterSpacing: '0.1em',
                  fontWeight: '900',
                  lineHeight: '1'
                }}
              >
                SLOT BOX
              </span>
            </div>
            <span className="fallback-logo text-4xl hidden" style={{display: 'none'}}>🎰</span>
          </div>
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold hover:opacity-90 transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out w-5 h-5 mr-2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" x2="9" y1="12" y2="12"></line>
                  </svg>
                  Entrar
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-lg bg-transparent text-white font-bold hover:opacity-90 transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 mr-2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Registrar
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-green-600 px-3 py-1 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                  </svg>
                  <span className="text-white font-semibold">
                    R$ {getUserBalance().toFixed(2)}
                  </span>
                </div>
                <button 
                  onClick={() => setShowDepositModal(true)}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold hover:opacity-90 transition flex items-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  Depositar
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold hover:opacity-90 transition flex items-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M12 2v20M7 5h5.5a3.5 3.5 0 0 1 0 7H7a3.5 3.5 0 0 0 0 7h5"/>
                  </svg>
                  Sacar
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="px-4 py-2 rounded-lg bg-transparent text-white font-bold hover:opacity-90 transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 mr-2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {user?.username || user?.nome}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="md:hidden container mx-auto px-2 py-0 flex items-center justify-between min-h-[28px]">
          <div className="flex items-center space-x-3 ml-[-12px] mr-2">
            <img 
              alt="Mega Raspadinha" 
              className="object-contain h-12 w-auto max-w-[150px]" 
              src="/imagens/caixa premium.png"
            />
            <div className="flex flex-col">
              <span 
                className="text-white font-black uppercase tracking-wider"
                style={{
                  fontSize: '1.8rem',
                  background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)',
                  backgroundSize: '400% 400%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradientShift 3s ease-in-out infinite, textGlow 2s ease-in-out infinite alternate',
                  textShadow: '0 0 15px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 165, 0, 0.3)',
                  fontFamily: 'Arial Black, sans-serif',
                  letterSpacing: '0.05em',
                  fontWeight: '900',
                  lineHeight: '1'
                }}
              >
                SLOT BOX
              </span>
            </div>
            <span className="fallback-logo text-3xl hidden" style={{display: 'none'}}>🎰</span>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center gap-2">
            {!isAuthenticated ? (
              <>
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-2 py-1 rounded bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold hover:opacity-90 transition flex items-center text-sm"
                  style={{minWidth:'0',height:'32px'}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out w-4 h-4 mr-1">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" x2="9" y1="12" y2="12"></line>
                  </svg>
                  Entrar
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-2 py-1 rounded bg-transparent text-white font-bold hover:opacity-90 transition flex items-center text-sm"
                  style={{minWidth:'0',height:'32px'}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-4 h-4 mr-1">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Registrar
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-green-600 px-2 py-1 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white text-sm">
                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                  </svg>
                  <span className="text-white font-semibold text-sm">
                    R$ {getUserBalance().toFixed(2)}
                  </span>
                </div>
                <button 
                  onClick={() => navigate('/profile')}
                  className="px-2 py-1 rounded bg-transparent text-white font-bold hover:opacity-90 transition flex items-center text-sm"
                  style={{minWidth:'0',height:'32px'}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-4 h-4 mr-1">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {user?.username || user?.nome}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-[-2]">
        {/* Botão Voltar */}
        <button 
          onClick={() => navigate(-1)}
          className="justify-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mb-2 text-white font-bold flex items-center transition-all"
          style={{background: 'transparent', color: 'rgb(255, 255, 255)'}}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left w-4 h-4 mr-2">
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
          Voltar
        </button>

        {/* Conteúdo Principal - Mostra quando não está na tela de incentivo */}
        {!showIncentive && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-4">
                <div className="mx-auto" style={{width: '220px', height: '220px', minWidth: '140px', minHeight: '140px', maxWidth: '260px', maxHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', borderRadius: '1.2rem'}}>
                  <img 
                    alt="CAIXA KIT NIKE" 
                    className="object-contain" 
                    src="/imagens/nike.png"
                    style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: '1.2rem', background: 'transparent'}}
                  />
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                  R$ 2.50
                </div>
              </div>
              <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">CAIXA KIT NIKE</h1>
              <p className="text-gray-300 mb-4 text-lg">Ganhe até R$1.500 NO PIX!</p>
              

              {/* Dynamic Button */}
              <div className="flex justify-center gap-3 mb-2">
                {(getUserBalance()) >= 2.50 ? (
                  <button
                    onClick={handleOpenCase}
                    disabled={isSimulating || (getUserBalance()) < 2.50}
                    style={{background: 'rgb(14, 16, 21)', border: 'none', padding: '0px', borderRadius: '1.5rem', minWidth: '240px', cursor: (isSimulating || (getUserBalance()) < 2.50) ? 'not-allowed' : 'pointer', opacity: (isSimulating || (getUserBalance()) < 2.50) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxShadow: 'none'}}
                  >
                    <span style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)', borderRadius: '0.7rem', padding: '0.5rem 1.2rem 0.5rem 1.1rem', fontWeight: 700, fontSize: '17px', color: 'rgb(255, 255, 255)', flex: '1 1 0%', position: 'relative'}}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box" style={{marginRight: '8px'}}>
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                        <path d="m3.3 7 8.7 5 8.7-5"></path>
                        <path d="M12 22V12"></path>
                      </svg>
{isLocked ? 'Processando...' : 'Abrir Caixa'}
                      <span style={{marginLeft: '18px', background: 'rgb(14, 16, 21)', color: 'rgb(255, 255, 255)', fontWeight: 700, fontSize: '17px', borderRadius: '0.7rem', padding: '0.35rem 1.1rem', display: 'flex', alignItems: 'center', minWidth: '80px', position: 'relative', right: '-8px'}}>
                        R$ 2,50
                      </span>
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleSimulateCase}
                    disabled={isSimulating}
                    style={{background: 'rgb(14, 16, 21)', border: 'none', padding: '0px', borderRadius: '1.5rem', minWidth: '240px', cursor: 'pointer', opacity: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxShadow: 'none'}}
                  >
                    <span style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, rgb(147, 51, 234) 0%, rgb(124, 58, 237) 100%)', borderRadius: '0.7rem', padding: '0.5rem 1.2rem 0.5rem 1.1rem', fontWeight: 700, fontSize: '17px', color: 'rgb(255, 255, 255)', flex: '1 1 0%', position: 'relative'}}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play" style={{marginRight: '8px'}}>
                        <polygon points="6 3 20 12 6 21 6 3"></polygon>
                      </svg>
                      Simular Caixa
                      <span style={{marginLeft: '18px', background: 'rgb(14, 16, 21)', color: 'rgb(255, 255, 255)', fontWeight: 700, fontSize: '17px', borderRadius: '0.7rem', padding: '0.35rem 1.1rem', display: 'flex', alignItems: 'center', minWidth: '80px', position: 'relative', right: '-8px'}}>
                        GRÁTIS
                      </span>
                    </span>
                  </button>
                )}
              </div>
              <p className="text-gray-400 text-sm mb-2">Faça um depósito para abrir caixas de verdade e ganhar prêmios reais!</p>
              <button 
                onClick={() => navigate('/profile')}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-400 hover:to-green-500 transition-all duration-200 transform hover:scale-105"
              >
                Depositar
              </button>
            </div>

            {/* Instruções */}
            <div className="bg-[#0E1015] rounded-2xl p-6 mb-8" style={{padding: '0px', margin: '0px 0px 0px calc(50% - 50vw)', borderRadius: '0px', width: '100vw', maxWidth: '100vw'}}>
              <div className="text-center mb-6">
                <div className="text-gray-400">Clique no botão para simular a caixa!</div>
              </div>
              <div className="text-center pb-4"></div>
            </div>

            {/* CONTEÚDO DAS CAIXAS */}
            <div className="bg-[#0E1015] rounded-2xl p-6 mt-0 pt-2">
              <h3 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box" style={{marginRight: '8px'}}>
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                  <path d="m3.3 7 8.7 5 8.7-5"></path>
                  <path d="M12 22V12"></path>
                </svg>
                CONTEÚDO DAS CAIXAS
              </h3>
              
              {/* Mobile Grid */}
              <div className="grid md:hidden" style={{gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 0px', padding: '0px', margin: '0px 0px 0px calc(50% - 50vw)', width: '100vw', maxWidth: '100vw'}}>
                {[
                  { name: 'R$1,00', value: 'R$ 1,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA KIT NIKE/1.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$2,00', value: 'R$ 2,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA KIT NIKE/2.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$5,00', value: 'R$ 5,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA KIT NIKE/5.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$10,00', value: 'R$ 10,00', rarity: 'rarity-2.png', image: '/imagens/CAIXA KIT NIKE/10.png', bgColor: 'rgb(59, 130, 246)' },
                  { name: 'Boné Nike', value: 'R$ 50,00', rarity: 'rarity-2.png', image: '/imagens/CAIXA KIT NIKE/boné nike.png', bgColor: 'rgb(59, 130, 246)' },
                  { name: 'Camisa Nike Dry Fit', value: 'R$ 100,00', rarity: 'rarity-3.png', image: '/imagens/CAIXA KIT NIKE/camisa nike.webp', bgColor: 'rgb(162, 89, 255)' },
                  { name: 'Air Force 1', value: 'R$ 700,00', rarity: 'rarity-4.png', image: '/imagens/CAIXA KIT NIKE/airforce.webp', bgColor: 'rgb(255, 59, 59)' },
                  { name: 'Nike Dunk Low', value: 'R$ 1.000,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA KIT NIKE/nike dunk.webp', bgColor: 'rgb(255, 215, 0)' },
                  { name: 'Air Jordan 4', value: 'R$ 1.500,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA KIT NIKE/jordan.png', bgColor: 'rgb(255, 215, 0)' }
                ].map((prize, index) => (
                  <div key={index} className="rounded-none p-0 text-center relative overflow-hidden flex flex-col items-center justify-between transition-all duration-300 group" style={{width: '100%', maxWidth: '100%', minWidth: '0px', height: '200px', minHeight: '120px', maxHeight: '200px', margin: '0px', borderRadius: '0px 0px 12px 12px', border: '2px solid rgb(14, 16, 21)', boxSizing: 'border-box', background: `linear-gradient(0deg, ${prize.bgColor}32 0%, rgb(14, 16, 21) 100%)`}}>
                    <img alt="Raridade" className="absolute inset-0 pointer-events-none" src={`/imagens/${prize.rarity}`} style={{zIndex: 1, objectFit: 'contain', width: '75%', height: '75%', left: '50%', top: '44%', transform: 'translate(-50%, -50%)', opacity: 0.6, position: 'absolute'}} />
                    <div className="flex items-center justify-center mx-auto relative z-10 icon-zoom group-hover:scale-[1.25] group-hover:-rotate-12 transition-transform duration-300" style={{height: '90px', width: '90px', maxHeight: '110px', maxWidth: '110px', minHeight: '60px', minWidth: '60px', margin: '0px auto', position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%, -50%)', willChange: 'transform'}}>
                      <img alt="Prize icon" className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-[1.25] group-hover:-rotate-12" src={prize.image} />
                    </div>
                    <div className="w-full flex flex-col items-center justify-center absolute bottom-2 left-0 right-0">
                      <div className="inline-block px-2 py-0.5 rounded font-bold text-xs md:text-xs" style={{background: prize.bgColor, color: 'rgb(0, 0, 0)', minWidth: '60px', maxWidth: '120px', textAlign: 'center', letterSpacing: '0.2px', fontWeight: 700, boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 8px 0px', marginBottom: '2px', marginTop: '18px'}}>{prize.name}</div>
                      <div className="text-white font-bold text-[14px] relative z-10 truncate w-full text-center" style={{textShadow: 'rgb(0, 0, 0) 0px 1px 4px'}}>{prize.value}</div>
                    </div>
                    <div className="absolute left-0 right-0 bottom-0 h-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{background: prize.bgColor, height: '6px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', boxShadow: `${prize.bgColor}99 0px 0px 8px 2px`}}></div>
                  </div>
                ))}
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:grid" style={{gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px 0px', padding: '0px', margin: '0px', width: '100%', maxWidth: '100%', overflow: 'hidden'}}>
                {[
                  { name: 'R$1,00', value: 'R$ 1,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA KIT NIKE/1.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$2,00', value: 'R$ 2,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA KIT NIKE/2.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$5,00', value: 'R$ 5,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA KIT NIKE/5.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$10,00', value: 'R$ 10,00', rarity: 'rarity-2.png', image: '/imagens/CAIXA KIT NIKE/10.png', bgColor: 'rgb(59, 130, 246)' },
                  { name: 'Boné Nike', value: 'R$ 50,00', rarity: 'rarity-2.png', image: '/imagens/CAIXA KIT NIKE/boné nike.png', bgColor: 'rgb(59, 130, 246)' },
                  { name: 'Camisa Nike Dry Fit', value: 'R$ 100,00', rarity: 'rarity-3.png', image: '/imagens/CAIXA KIT NIKE/camisa nike.webp', bgColor: 'rgb(162, 89, 255)' },
                  { name: 'Air Force 1', value: 'R$ 700,00', rarity: 'rarity-4.png', image: '/imagens/CAIXA KIT NIKE/airforce.webp', bgColor: 'rgb(255, 59, 59)' },
                  { name: 'Nike Dunk Low', value: 'R$ 1.000,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA KIT NIKE/nike dunk.webp', bgColor: 'rgb(255, 215, 0)' },
                  { name: 'Air Jordan 4', value: 'R$ 1.500,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA KIT NIKE/jordan.png', bgColor: 'rgb(255, 215, 0)' }
                ].map((prize, index) => (
                  <div key={index} className="rounded-none p-0 text-center relative overflow-hidden flex flex-col items-center justify-between transition-all duration-300 group" style={{width: '100%', maxWidth: '100%', minWidth: '0px', height: '200px', minHeight: '120px', maxHeight: '250px', margin: '0px', borderRadius: '0px 0px 12px 12px', border: '2px solid rgb(14, 16, 21)', boxSizing: 'border-box', background: `linear-gradient(0deg, ${prize.bgColor}32 0%, rgb(14, 16, 21) 100%)`}}>
                    <img alt="Raridade" className="absolute inset-0 pointer-events-none" src={`/imagens/${prize.rarity}`} style={{zIndex: 1, objectFit: 'contain', width: '65%', height: '65%', left: '50%', top: '44%', transform: 'translate(-50%, -50%)', opacity: 0.6, position: 'absolute'}} />
                    <div className="flex items-center justify-center mx-auto relative z-10 icon-zoom group-hover:scale-[1.25] group-hover:-rotate-12 transition-transform duration-300" style={{height: '90px', width: '90px', maxHeight: '110px', maxWidth: '110px', minHeight: '60px', minWidth: '60px', margin: '0px auto', position: 'absolute', top: '44%', left: '50%', transform: 'translate(-50%, -50%)', willChange: 'transform'}}>
                      <img alt="Prize icon" className="object-contain w-full h-full transition-transform duration-300 group-hover:scale-[1.25] group-hover:-rotate-12" src={prize.image} />
                    </div>
                    <div className="w-full flex flex-col items-center justify-center absolute bottom-2 left-0 right-0">
                      <div className="inline-block px-2 py-0.5 rounded font-bold text-xs md:text-xs" style={{background: prize.bgColor, color: 'rgb(0, 0, 0)', minWidth: '60px', maxWidth: '120px', textAlign: 'center', letterSpacing: '0.2px', fontWeight: 700, boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 8px 0px', marginBottom: '2px', marginTop: '18px'}}>{prize.name}</div>
                      <div className="text-white font-bold text-[14px] relative z-10 truncate w-full text-center" style={{textShadow: 'rgb(0, 0, 0) 0px 1px 4px'}}>{prize.value}</div>
                    </div>
                    <div className="absolute left-0 right-0 bottom-0 h-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200" style={{background: prize.bgColor, height: '6px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', boxShadow: `${prize.bgColor}99 0px 0px 8px 2px`}}></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Tela de Incentivo - Mostra após clicar em "Continuar" */}
        {showIncentive && selectedPrize && (
          <div className="text-center mb-8">
            {/* Seção de incentivo */}
            <div className="bg-transparent text-white p-6 rounded-lg mb-4 max-w-md mx-auto flex flex-col items-center">
              <img 
                alt="Presente" 
                width="56" 
                height="56" 
                className="mb-2" 
                src="https://cdn-icons-png.flaticon.com/512/1441/1441208.png" 
                style={{filter: 'drop-shadow(rgb(255, 215, 0) 0px 0px 12px) brightness(0) saturate(100%) invert(81%) sepia(85%) saturate(1000%) hue-rotate(1deg) brightness(1.1)'}}
              />
              <div className="text-white text-xl font-bold text-center leading-tight">
                Você poderia estar<br />
                <span className="text-[#FFD700] font-extrabold text-2xl">
                  GANHANDO AGORA<br />
                  R$ {selectedPrize.value}
                </span><br />
                numa rodada real!
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-center gap-3 mb-2">
              {(getUserBalance()) >= 2.50 ? (
                <button
                  onClick={handleOpenCase}
                  disabled={isSimulating || (getUserBalance()) < 2.50}
                  style={{background: 'rgb(14, 16, 21)', border: 'none', padding: '0px', borderRadius: '1.5rem', minWidth: '240px', cursor: (isSimulating || (getUserBalance()) < 2.50) ? 'not-allowed' : 'pointer', opacity: (isSimulating || (getUserBalance()) < 2.50) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxShadow: 'none'}}
                >
                  <span style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)', borderRadius: '0.7rem', padding: '0.5rem 1.2rem 0.5rem 1.1rem', fontWeight: 700, fontSize: '17px', color: 'rgb(255, 255, 255)', flex: '1 1 0%', position: 'relative'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box" style={{marginRight: '8px'}}>
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                      <path d="m3.3 7 8.7 5 8.7-5"></path>
                      <path d="M12 22V12"></path>
                    </svg>
{isLocked ? 'Processando...' : 'Abrir Caixa'}
                    <span style={{marginLeft: '18px', background: 'rgb(14, 16, 21)', color: 'rgb(255, 255, 255)', fontWeight: 700, fontSize: '17px', borderRadius: '0.7rem', padding: '0.35rem 1.1rem', display: 'flex', alignItems: 'center', minWidth: '80px', position: 'relative', right: '-8px'}}>
                      R$ 2,50
                    </span>
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleSimulateCase}
                  disabled={isSimulating}
                  style={{background: 'rgb(14, 16, 21)', border: 'none', padding: '0px', borderRadius: '1.5rem', minWidth: '240px', cursor: 'pointer', opacity: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxShadow: 'none'}}
                >
                  <span style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, rgb(147, 51, 234) 0%, rgb(124, 58, 237) 100%)', borderRadius: '0.7rem', padding: '0.5rem 1.2rem 0.5rem 1.1rem', fontWeight: 700, fontSize: '17px', color: 'rgb(255, 255, 255)', flex: '1 1 0%', position: 'relative'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play" style={{marginRight: '8px'}}>
                      <polygon points="6 3 20 12 6 21 6 3"></polygon>
                    </svg>
                    Simular Caixa
                    <span style={{marginLeft: '18px', background: 'rgb(14, 16, 21)', color: 'rgb(255, 255, 255)', fontWeight: 700, fontSize: '17px', borderRadius: '0.7rem', padding: '0.35rem 1.1rem', display: 'flex', alignItems: 'center', minWidth: '80px', position: 'relative', right: '-8px'}}>
                      GRÁTIS
                    </span>
                  </span>
                </button>
              )}
            </div>
            <p className="text-gray-400 text-sm mb-2">Faça um depósito para abrir caixas de verdade e ganhar prêmios reais!</p>
            <button 
              onClick={() => navigate('/wallet')}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-400 hover:to-green-500 transition-all duration-200 transform hover:scale-105"
            >
              Depositar
            </button>
            
            <button 
              onClick={resetToMain}
              className="px-8 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-500 transition-all duration-200 transform hover:scale-105"
            >
              Voltar
            </button>
          </div>
        )}
      </main>

      {/* Modal de Simulação */}
      {showSimulation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#0E1015] rounded-lg p-6 w-full max-w-4xl mx-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Abrindo Caixa Nike</h2>
              <p className="text-gray-400">Sorteando seu prêmio...</p>
            </div>
            
            {/* Container da esteira */}
            <div className="relative h-48 overflow-hidden" style={{background: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALkAAABICAIAAAAlAcO3AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEEyRDdEMjlCN0YzMTFFNUFENkFDNjREMzkyMkNGRjciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEEyRDdEMjhCN0YzMTFFNUFENkFDNjREMzkyMkNGRjciIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTQgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QjZGMUQ4MTFCNkVDMTFFNUFEN0JFN0EzNUVFODI1MTkiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QjZGMUQ4MTJCNkVDMTFFNUFEN0JFN0EzNUVFODI1MTkiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz6qkPVZAAABp0lEQVR42uzZ0UrEMBhE4aTsQyx6Ifj+r7iJbVVswcKPTTfSfoNKOQuraIhzmHy/v6Wcch5zzuk7dUwpOL7k+eX1PYkEMvgVSDC31T1Ty/jwy/2D48t7ZXyh1jR/lOVpwvHt/0F14w7Cr81/zsp01UxfUx5WBwjHvwgPEh4krT2olIfOj0f4oPPjQT7o/HiQ6/x4mPMg4UHS2oN0ftwehNuD8E7cHoTbg4QHSTcPsgfhQW4PwqPcHoRHuc6PhzkPEh4krT1I58ftQbg9CO/E7UG4PUh4kHTzIHsQHuT2IDzK7UF4lOv8eJjzIOFB0tqDdH7cHoTbg/BO3B6E24OEB0k3D7IH4UFuD8Kj3B6ER7nOj4c5DxIeJK09SOfH7UG4PQjvxJ+xB42PnOIE/BkeNH67unlohQfJ+Tzo6D1o/pxe4BTJHoRfhNuD8CjX+S/mMnuc9GgP+vzheNA/yR4n5UES9iCd/zp8p5Pag3B7EN6a35ZdN40nKM8P6w6Mn4XXyTT++j486FoStOdvwYMk7EFH70GlPvJ8kXGTZA/CL8LtQXiUfwgwAAA7NztZHovQAAAAAElFTkSuQmCC") left top repeat', boxShadow: 'rgb(26, 27, 34) 0px 0px 4px inset', border: '1px solid rgb(35, 39, 48)'}}>
              <div className="absolute top-0 bottom-0 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
                <div style={{width: '6px', height: '100%', background: 'linear-gradient(rgb(147, 51, 234) 0%, rgb(124, 58, 237) 100%)', borderRadius: '3px', boxShadow: 'rgba(147, 51, 234, 0.533) 0px 0px 16px 2px, rgba(124, 58, 237, 0.533) 0px 0px 8px 2px'}}></div>
                <div style={{position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', width: '0px', height: '0px', borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderBottom: '18px solid rgb(147, 51, 234)', filter: 'drop-shadow(rgba(147, 51, 234, 0.533) 0px 0px 8px)', zIndex: 2}}></div>
                <div style={{position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)', width: '0px', height: '0px', borderLeft: '14px solid transparent', borderRight: '14px solid transparent', borderTop: '18px solid rgb(124, 58, 237)', filter: 'drop-shadow(rgba(124, 58, 237, 0.533) 0px 0px 8px)', zIndex: 2}}></div>
              </div>
              
              {/* Esteira de prêmios */}
              <div className="absolute inset-0 flex items-center animate-scroll" style={{width: 'max-content'}}>
                {generateRandomPrizeSequence().map((prize, index) => (
                  <div key={index} className="inline-block mx-2" style={{width: '120px', height: '120px'}}>
                    <div className="w-full h-full relative bg-[#0E1015] rounded-lg overflow-hidden border-2 border-gray-600">
                        <div className="absolute inset-0 flex items-center justify-center opacity-60">
                          <img 
                            alt="Raridade" 
                            src={`/imagens/${prize.rarity}`} 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="relative z-10 flex items-center justify-center w-full h-full">
                          <img 
                            alt={prize.name} 
                            src={prize.image} 
                          className="w-16 h-16 object-contain"
                          />
                        </div>
                      <div className="absolute bottom-1 left-0 right-0 text-center">
                        <div className="inline-block px-1 py-0.5 rounded font-bold text-xs mb-0.5" style={{background: prize.bgColor, color: '#000'}}>
                            {prize.name}
                          </div>
                        <div className="text-white font-bold text-xs" style={{textShadow: 'rgb(0, 0, 0) 0px 1px 4px'}}>
                            {prize.value}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resultado */}
      {showResult && selectedPrize && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#0E1015] rounded-lg p-8 w-full max-w-md mx-4 text-center">
            <div className="relative">
              <h1 className="text-4xl font-extrabold text-yellow-400 mb-4 tracking-wider animate-pulse">
                {isShowingPrizes ? `Caixa ${currentPrizeIndex + 1}` : (!selectedPrize.sem_imagem ? 'VOCÊ GANHOU!' : 'VOCÊ NÃO GANHOU')}
              </h1>
              
              {/* Contador de prêmios */}
              {isShowingPrizes && wonPrizes.length > 1 && (
                <div className="mb-4">
                  <div className="flex justify-center space-x-2">
                    {wonPrizes.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          index === currentPrizeIndex ? 'bg-yellow-400' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="relative w-80 h-80 flex items-center justify-center" style={{filter: 'drop-shadow(rgba(96, 125, 139, 0.25) 0px 0px 30px)'}}>
                {!selectedPrize.sem_imagem && (
                  <>
                    <img alt="Rarity Background" className="absolute inset-0 w-full h-full object-contain opacity-60" src={`/imagens/${selectedPrize.rarity}`} />
                    <div className="relative z-10 flex items-center justify-center" style={{width: '260px', height: '260px'}}>
                      <img alt={selectedPrize.name} className="w-full h-full object-contain filter drop-shadow-lg" src={selectedPrize.image} />
                    </div>
                  </>
                )}
                {selectedPrize.sem_imagem && (
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-6xl mb-4">😔</div>
                    <div className="text-lg text-gray-300 mb-2 px-4">
                      {getMotivationalMessage()}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-center mt-8">
                <h2 className="text-3xl font-bold text-white mb-2 tracking-wider">{selectedPrize.name}</h2>
                <p className="text-lg text-gray-400 mb-6">{selectedPrize.value}</p>
                
                {/* Controles de navegação */}
                {isShowingPrizes && wonPrizes.length > 1 ? (
                <div className="flex space-x-4 justify-center">
                    {currentPrizeIndex < wonPrizes.length - 1 ? (
                  <button 
                        onClick={nextPrize}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-400 hover:to-green-500 transition-all duration-200 transform hover:scale-105"
                      >
                        Ver Próximo Prêmio
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={exitGame}
                    className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-400 hover:to-gray-500 transition-all duration-200 transform hover:scale-105"
                  >
                    Sair
                  </button>
                  <button 
                    onClick={playAgain}
                    className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-400 hover:to-purple-500 transition-all duration-200 transform hover:scale-105"
                  >
                    Jogar Novamente
                  </button>
                      </>
                    )}
                </div>
                ) : (
                  <div className="flex space-x-4 justify-center">
                    <button 
                      onClick={exitGame}
                      className="px-8 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-lg hover:from-gray-400 hover:to-gray-500 transition-all duration-200 transform hover:scale-105"
                    >
                      Sair
                    </button>
                    <button 
                      onClick={playAgain}
                      className="px-8 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-lg hover:from-purple-400 hover:to-purple-500 transition-all duration-200 transform hover:scale-105"
                    >
                      Jogar Novamente
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-16"></div>

        <Footer />

        {/* Modal de Depósito */}
        {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gradient-to-t from-purple-500 from-[-60%] via-[5%] to-100% via-slate-900 to-slate-900 animate-in fade-in-0 zoom-in-95 w-full max-w-sm mx-auto rounded-lg border shadow-lg duration-200 outline-none overflow-auto max-h-[90vh]">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg fill="none" viewBox="0 0 24 24" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" className="size-6 text-white">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 15v3m0 3v-3m0 0h-3m3 0h3"></path>
                  <path fill="currentColor" fillRule="evenodd" d="M5 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h7.083A6 6 0 0 1 12 18c0-1.148.322-2.22.881-3.131A3 3 0 0 1 9 12a3 3 0 1 1 5.869.881A5.97 5.97 0 0 1 18 12c1.537 0 2.939.578 4 1.528V8a3 3 0 0 0-3-3zm7 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd"></path>
                </svg>
                <h1 className="text-xl font-medium text-white">Depositar</h1>
              </div>
              
              <form className="space-y-4">
              <div>
                <label htmlFor="amount" className="flex items-center font-medium select-none mb-2 text-base text-white gap-0.5">
                  Valor:
                </label>
                <div className="relative">
                  <span className="font-semibold opacity-80 absolute left-3 top-2/4 -translate-y-2/4 text-white z-10"> R$ </span>
                  <input 
                    id="amount" 
                    className="!pl-12 file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3.5 py-2.5 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive text-white" 
                    autoComplete="off" 
                    inputMode="numeric" 
                    type="tel" 
                    value={depositAmount}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9,]/g, '');
                      setDepositAmount(value);
                    }}
                  />
                </div>
                {parseFloat(depositAmount.replace(',', '.')) < 20 && depositAmount !== '' && (
                  <p className="text-red-400 text-sm mt-1">Valor mínimo de depósito é R$ 20,00</p>
                )}
              </div>
              
              <div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div 
                    className={`bg-purple-500/10 text-purple-500 text-sm font-semibold rounded-md p-2 cursor-pointer relative hover:bg-purple-500/20 ${depositAmount === '20,00' ? 'ring-2 ring-yellow-400' : ''}`}
                    onClick={() => setDepositAmount('20,00')}
                  >
                    R$&nbsp;20,00
                  </div>
                  <div 
                    className={`bg-purple-500/10 text-purple-500 text-sm font-semibold rounded-md p-2 cursor-pointer relative hover:bg-purple-500/20 ${depositAmount === '30,00' ? 'ring-2 ring-yellow-400' : ''}`}
                    onClick={() => setDepositAmount('30,00')}
                  >
                    <span className="bg-yellow-400 rounded-md absolute -top-1 left-2/4 -translate-y-2/4 -translate-x-2/4 text-xs text-black leading-4 px-1 uppercase flex gap-1 items-center text-nowrap">
                      <svg width="1em" height="1em" fill="currentColor" className="bi bi-fire size-[0.5rem] inline" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 16c3.314 0 6-2 6-5.5 0-1.5-.5-4-2.5-6 .25 1.5-1.25 2-1.25 2C11 4 9 .5 6 0c.357 2 .5 4-2 6-1.25 1-2 2.729-2 4.5C2 14 4.686 16 8 16m0-1c-1.657 0-3-1-3-2.75 0-.75.25-2 1.25-3C6.125 10 7 10.5 7 10.5c-.375-1.25.5-3.25 2-3.5-.179 1-.25 2 1 3 .625.5 1 1.364 1 2.25C11 14 9.657 15 8 15"></path>
            </svg>
                      QUENTE
                    </span>
                    R$&nbsp;30,00
                  </div>
                  <div 
                    className={`bg-purple-500/10 text-purple-500 text-sm font-semibold rounded-md p-2 cursor-pointer relative hover:bg-purple-500/20 ${depositAmount === '50,00' ? 'ring-2 ring-yellow-400' : ''}`}
                    onClick={() => setDepositAmount('50,00')}
                  >
                    R$&nbsp;50,00
                  </div>
                  <div 
                    className={`bg-purple-500/10 text-purple-500 text-sm font-semibold rounded-md p-2 cursor-pointer relative hover:bg-purple-500/20 ${depositAmount === '100,00' ? 'ring-2 ring-yellow-400' : ''}`}
                    onClick={() => setDepositAmount('100,00')}
                  >
                    R$&nbsp;100,00
                  </div>
                  <div 
                    className={`bg-purple-500/10 text-purple-500 text-sm font-semibold rounded-md p-2 cursor-pointer relative hover:bg-purple-500/20 ${depositAmount === '200,00' ? 'ring-2 ring-yellow-400' : ''}`}
                    onClick={() => setDepositAmount('200,00')}
                  >
                    R$&nbsp;200,00
                  </div>
                  <div 
                    className={`bg-purple-500/10 text-purple-500 text-sm font-semibold rounded-md p-2 cursor-pointer relative hover:bg-purple-500/20 ${depositAmount === '500,00' ? 'ring-2 ring-yellow-400' : ''}`}
                    onClick={() => setDepositAmount('500,00')}
                  >
                    R$&nbsp;500,00
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full bg-purple-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                type="submit"
              >
                <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="currentColor" d="M8 6H6v2h2zm-5-.75A2.25 2.25 0 0 1 5.25 3h3.5A2.25 2.25 0 0 1 11 5.25v3.5A2.25 2.25 0 0 1 8.75 11h-3.5A2.25 2.25 0 0 1 3 8.75zm2.25-.75a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75zM6 16h2v2H6zm-3-.75A2.25 2.25 0 0 1 5.25 13h3.5A2.25 2.25 0 0 1 11 15.25v3.5A2.25 2.25 0 0 1 8.75 21h-3.5A2.25 2.25 0 0 1 3 18.75zm2.25-.75a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75zM18 6h-2v2h2zm-2.75-3A2.25 2.25 0 0 0 13 5.25v3.5A2.25 2.25 0 0 0 15.25 11h3.5A2.25 2.25 0 0 0 21 8.75v-3.5A2.25 2.25 0 0 0 18.75 3zm-.75 2.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1-.75-.75zM13 13h2.75v2.75H13zm5.25 2.75h-2.5v2.5H13V21h2.75v-2.75h2.5V21H21v-2.75h-2.75zm0 0V13H21v2.75z"></path>
            </svg>
                Gerar QR Code
          </button>
            </form>
            </div>
            
            <button 
              type="button" 
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
              onClick={() => setShowDepositModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

        {/* Modal de Login */}
        {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gradient-to-t from-purple-500 from-[-60%] via-[5%] to-100% via-slate-900 to-slate-900 animate-in fade-in-0 zoom-in-95 w-full max-w-sm mx-auto rounded-lg border shadow-lg duration-200 outline-none overflow-auto max-h-[90vh]">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg fill="none" viewBox="0 0 24 24" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" className="size-6 text-white">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" x2="9" y1="12" y2="12"></line>
                </svg>
                <h1 className="text-xl font-medium text-white">Fazer Login</h1>
            </div>
            
              <form className="space-y-4" onSubmit={handleLogin}>
            <div>
                  <label htmlFor="email" className="flex items-center font-medium select-none mb-2 text-base text-white gap-0.5">
                    Email:
                  </label>
                  <input 
                    id="email" 
                    className="w-full rounded-md border border-gray-600 bg-slate-800 px-3 py-2.5 text-base text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none focus:ring-2" 
                    placeholder="Digite seu email" 
                    required 
                    type="email" 
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  />
            </div>
            
            <div>
                  <label htmlFor="password" className="flex items-center font-medium select-none mb-2 text-base text-white gap-0.5">
                    Senha:
                  </label>
                  <div className="relative">
                    <input 
                      id="password" 
                      className="w-full rounded-md border border-gray-600 bg-slate-800 px-3 py-2.5 text-base text-white placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/20 focus:outline-none focus:ring-2 pr-10" 
                      placeholder="Digite sua senha" 
                      required 
                      type={showPassword ? 'text' : 'password'} 
                      value={loginData.senha}
                      onChange={(e) => setLoginData({...loginData, senha: e.target.value})}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                      )}
                    </button>
            </div>
          </div>

                <button 
                  className="w-full bg-purple-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                  type="submit"
                  disabled={loginLoading}
                >
                  {loginLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">Não tem uma conta?</p>
                <button 
                  onClick={() => navigate('/register')}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors text-sm mt-1"
                >
                  Criar conta gratuita
                </button>
            </div>
          </div>

            <button 
              type="button" 
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
              onClick={() => setShowLoginModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

        <BottomNavigation />
      </div>
    </>
  );
};

export default NikeCase;