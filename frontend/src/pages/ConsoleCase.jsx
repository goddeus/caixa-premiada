import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNavigation from '../components/BottomNavigation';
import useDoubleClickPrevention from '../hooks/useDoubleClickPrevention';

const ConsoleCase = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, refreshUserData, getUserBalance } = useAuth();
  const { isLocked, executeWithLock } = useDoubleClickPrevention(3000); // 3 segundos de cooldown
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
  const [currentConsoleCase, setCurrentConsoleCase] = useState(null);
  // Removido: sistema de múltiplas compras
  const [wonPrizes, setWonPrizes] = useState([]);
  const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0);
  const [isShowingPrizes, setIsShowingPrizes] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Removido: handleQuantityChange - não há mais múltiplas compras


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
    
    // Lista de prêmios altos para incentivar depósito (sempre ganha prêmios bons)
    const incentivePrizes = [
      { name: 'PS5', value: 'R$ 5000,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/ps5.png', bgColor: 'rgb(255, 215, 0)' },
      { name: 'Xbox One', value: 'R$ 4000,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/xboxone.webp', bgColor: 'rgb(255, 215, 0)' },
      { name: 'Steam Deck', value: 'R$ 3000,00', rarity: 'rarity-4.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/steamdeck.png', bgColor: 'rgb(255, 59, 59)' },
      { name: 'R$ 100,00', value: 'R$ 100,00', rarity: 'rarity-2.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/100reais.png', bgColor: 'rgb(59, 130, 246)' }
    ];
    
    // Simular seleção aleatória de prêmio alto (incentivo)
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
    console.log('🚀 Iniciando handleOpenCase...');
    console.log('🔍 Debug handleOpenCase:');
    console.log('- isAuthenticated:', isAuthenticated);
    console.log('- user:', user);
    console.log('- token:', localStorage.getItem('token'));
    // Removido: quantity
    
    if (!isAuthenticated) {
      console.log('❌ Usuário não autenticado');
      setShowLoginModal(true);
      return;
    }

    const result = await executeWithLock(async () => {
      console.log('[DEBUG] Iniciando abertura de caixa Console com proteção contra cliques duplos');
      console.log('✅ Usuário autenticado, iniciando processo...');
      setIsSimulating(true);
      setShowSimulation(true);
      setShowResult(false);
      setWonPrizes([]);
      setCurrentPrizeIndex(0);
      setIsShowingPrizes(false);

      // Buscar ID da caixa Console primeiro
      console.log('🔍 Buscando caixa Console...');
      const casesResponse = await api.getCaixas();
      const consoleCase = casesResponse.data?.find(c => 
        c.nome === 'CAIXA CONSOLE DOS SONHOS' || c.nome.includes('CONSOLE DOS SONHOS')
      );
      
      if (!consoleCase) {
        console.log('❌ Caixa Console não encontrada');
        toast.error('Caixa Console não encontrada');
        return;
      }

      console.log('✅ Caixa Console encontrada:', consoleCase);
      setCurrentConsoleCase(consoleCase);

      const casePrice = parseFloat(consoleCase.preco);
      const totalCost = casePrice; // Apenas uma caixa

      console.log('💰 Verificando saldo:');
      console.log('- casePrice:', casePrice);
      // Removido: quantity
      console.log('- totalCost:', totalCost);
      console.log('- user.saldo:', getUserBalance());

      if ((getUserBalance()) < totalCost) {
        console.log('❌ Saldo insuficiente');
        toast.error(`Saldo insuficiente! Você precisa de R$ ${totalCost.toFixed(2)}`);
        setShowDepositModal(true);
        return;
      }

      console.log('✅ Saldo suficiente, comprando caixa...');
      
      // Comprar uma caixa apenas
      try {
        console.log(`🛒 Comprando caixa...`);
        
        // Sistema de retry para rate limiting
        let response;
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            response = await api.post(`/cases/buy/${consoleCase.id}`);
            break; // Sucesso, sair do loop de retry
          } catch (error) {
            if (error.response?.status === 429 && retryCount < maxRetries - 1) {
              // Rate limiting - aguardar mais tempo antes de tentar novamente
              const retryDelay = (retryCount + 1) * 2000; // 2s, 4s, 6s
              console.log(`⚠️ Rate limit atingido. Aguardando ${retryDelay}ms antes de tentar novamente... (tentativa ${retryCount + 1}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, retryDelay));
              retryCount++;
            } else {
              throw error; // Re-throw se não for rate limiting ou se esgotaram as tentativas
            }
          }
        }
        
        // Verificar se a resposta foi obtida com sucesso
        if (!response) {
          throw new Error('Falha ao obter resposta após todas as tentativas');
        }
        console.log(`📦 Resposta da compra:`, response);

          if (response && response.data && response.data.premio) {
          const wonPrize = response.data.premio;
          
          // Mapear prêmio da API para formato do frontend
          const mappedPrize = {
            name: wonPrize.nome,
            value: `R$ ${parseFloat(wonPrize.valor).toFixed(2).replace('.', ',')}`,
            rarity: 'rarity-1.png',
            image: wonPrize.sem_imagem ? null : '/imagens/CAIXA CONSOLE DOS SONHOS/1real.png', // Imagem padrão da pasta local
            bgColor: 'rgb(176, 190, 197)',
            apiPrize: wonPrize,
            sem_imagem: wonPrize.sem_imagem || false
          };
          
          // Mapear prêmios específicos baseado nos 9 prêmios reais da CAIXA CONSOLE DOS SONHOS
          if (!wonPrize.sem_imagem) {
            // Prêmios reais da CAIXA CONSOLE DOS SONHOS (9 prêmios):
            // R$1,00 / R$1,00 / 1.png
            // R$2,00 / R$2,00 / 2.png
            // R$5,00 / R$5,00 / 5.png
            // R$10,00 / R$10,00 / 10.png
            // R$100,00 / R$100,00 / 100.png
            // Steam Deck / R$300,00 / steamdeck.png
            // Xbox One / R$4000,00 / xboxone.webp
            // Air Force 1 / R$700,00 / airforce.webp
            // PS5 / R$5000,00 / ps5.png
            
            if (wonPrize.valor === 5000) {
              // R$ 5000,00 - PS5
              mappedPrize.rarity = 'rarity-5.png';
              mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/ps5.png';
              mappedPrize.bgColor = 'rgb(255, 215, 0)';
            } else if (wonPrize.valor === 4000) {
              // R$ 4000,00 - Xbox One
              mappedPrize.rarity = 'rarity-5.png';
              mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/xboxone.webp';
              mappedPrize.bgColor = 'rgb(255, 215, 0)';
            } else if (wonPrize.valor === 700) {
              // R$ 700,00 - Air Force 1
              mappedPrize.rarity = 'rarity-4.png';
              mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/airforce.webp';
              mappedPrize.bgColor = 'rgb(255, 59, 59)';
            } else if (wonPrize.valor === 300) {
              // R$ 300,00 - Steam Deck
              mappedPrize.rarity = 'rarity-3.png';
              mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/steamdeck.png';
              mappedPrize.bgColor = 'rgb(162, 89, 255)';
            } else if (wonPrize.valor === 100) {
              // R$ 100,00 - Valor monetário
              mappedPrize.rarity = 'rarity-2.png';
              mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/100reais.png';
              mappedPrize.bgColor = 'rgb(59, 130, 246)';
            } else if (wonPrize.valor === 10) {
              // R$ 10,00 - Valor monetário
              mappedPrize.rarity = 'rarity-1.png';
              mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/10reais.png';
              mappedPrize.bgColor = 'rgb(176, 190, 197)';
            } else if (wonPrize.valor === 5) {
              // R$ 5,00 - Valor monetário
              mappedPrize.rarity = 'rarity-1.png';
              mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/5reais.png';
              mappedPrize.bgColor = 'rgb(176, 190, 197)';
            } else if (wonPrize.valor === 2) {
              // R$ 2,00 - Valor monetário
              mappedPrize.rarity = 'rarity-1.png';
              mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/2reais.png';
              mappedPrize.bgColor = 'rgb(176, 190, 197)';
            } else if (wonPrize.valor === 1) {
              // R$ 1,00 - Valor monetário
              mappedPrize.rarity = 'rarity-1.png';
              mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/1real.png';
              mappedPrize.bgColor = 'rgb(176, 190, 197)';
            } else {
              // Fallback para outros valores
              if (wonPrize.valor >= 5000) {
                mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/ps5.png';
                mappedPrize.rarity = 'rarity-5.png';
                mappedPrize.bgColor = 'rgb(255, 215, 0)';
              } else if (wonPrize.valor >= 4000) {
                mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/xboxone.webp';
                mappedPrize.rarity = 'rarity-5.png';
                mappedPrize.bgColor = 'rgb(255, 215, 0)';
              } else if (wonPrize.valor >= 700) {
                mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/airforce.webp';
                mappedPrize.rarity = 'rarity-4.png';
                mappedPrize.bgColor = 'rgb(255, 59, 59)';
              } else if (wonPrize.valor >= 300) {
                mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/steamdeck.png';
                mappedPrize.rarity = 'rarity-3.png';
                mappedPrize.bgColor = 'rgb(162, 89, 255)';
              } else if (wonPrize.valor >= 100) {
                mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/100reais.png';
                mappedPrize.rarity = 'rarity-2.png';
                mappedPrize.bgColor = 'rgb(59, 130, 246)';
              } else if (wonPrize.valor >= 10) {
                mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/10reais.png';
                mappedPrize.rarity = 'rarity-1.png';
                mappedPrize.bgColor = 'rgb(176, 190, 197)';
              } else if (wonPrize.valor >= 5) {
                mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/5reais.png';
                mappedPrize.rarity = 'rarity-1.png';
                mappedPrize.bgColor = 'rgb(176, 190, 197)';
              } else if (wonPrize.valor >= 2) {
                mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/2reais.png';
                mappedPrize.rarity = 'rarity-1.png';
                mappedPrize.bgColor = 'rgb(176, 190, 197)';
              } else {
                mappedPrize.image = '/imagens/CAIXA CONSOLE DOS SONHOS/1real.png';
                mappedPrize.rarity = 'rarity-1.png';
                mappedPrize.bgColor = 'rgb(176, 190, 197)';
              }
            }
          }
          
          console.log(`🎁 Prêmio ganho:`, mappedPrize);
          
          // Simular abertura da caixa
          setTimeout(() => {
            try {
              console.log('🎲 Simulando abertura da caixa...');
              setIsSimulating(false);
              setShowSimulation(false);
              setShowResult(true);
              setWonPrizes([mappedPrize]);
              setCurrentPrizeIndex(0);
              setIsShowingPrizes(true);
              setSelectedPrize(mappedPrize);
              
              // Creditar prêmio automaticamente
              setTimeout(async () => {
                try {
                  await creditPrize(mappedPrize, consoleCase);
                } catch (error) {
                  console.error('Erro ao creditar prêmio:', error);
                }
              }, 2000);
              
              // Tocar som de vitória
              const winAudio = new Audio('/sounds/win.mp3');
              winAudio.volume = 0.5;
              winAudio.play().catch(e => console.log('Audio não pode ser reproduzido'));
            } catch (error) {
              console.error('Erro ao abrir caixa:', error);
              toast.error('Erro ao abrir caixa');
              setIsSimulating(false);
              setShowSimulation(false);
            }
          }, 3000);
        }
        } catch (error) {
          console.error(`Erro ao comprar caixa:`, error);
          const errorMessage = error.response?.data?.error || `Erro ao comprar caixa`;
          toast.error(errorMessage);
        }
      
      // Dados serão atualizados após o crédito do prêmio
      console.log('💰 Débito processado pelo backend');

      // Tocar som de sorteio
      const audio = new Audio('/sounds/slot-machine.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio não pode ser reproduzido'));
    }, 'Abertura de caixa Console');
    
    if (!result.success) {
      toast.error(result.error);
      setIsSimulating(false);
      setShowSimulation(false);
    }
  };

  // Função para gerar sequência aleatória de prêmios
  const generateRandomPrizeSequence = () => {
    // Prêmios reais da caixa Console
    const sorteablePrizes = [
      { name: 'R$ 100,00', value: 'R$ 100,00', rarity: 'rarity-2.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/100reais.png', bgColor: 'rgb(59, 130, 246)', sorteavel: true },
      { name: 'Steam Deck', value: 'R$ 3000,00', rarity: 'rarity-4.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/steamdeck.png', bgColor: 'rgb(255, 59, 59)', sorteavel: true },
      { name: 'Xbox One', value: 'R$ 4000,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/xboxone.webp', bgColor: 'rgb(255, 215, 0)', sorteavel: true },
      { name: 'PS5', value: 'R$ 5000,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/ps5.png', bgColor: 'rgb(255, 215, 0)', sorteavel: true }
    ];

    // Combinar todos os prêmios (apenas os reais)
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
    setWonPrizes([]);
    setCurrentPrizeIndex(0);
    setIsShowingPrizes(false);
  };

  const continueSimulation = () => {
    setShowResult(false);
    setShowIncentive(true);
  };

  const goToDashboard = () => {
    setShowResult(false);
    setShowIncentive(false);
    setSelectedPrize(null);
    navigate('/');
  };

  // Funções para navegar entre prêmios
  const nextPrize = () => {
    if (currentPrizeIndex < wonPrizes.length - 1) {
      const nextIndex = currentPrizeIndex + 1;
      setCurrentPrizeIndex(nextIndex);
      setSelectedPrize(wonPrizes[nextIndex]);
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

  const creditPrize = async (prizeData = null, caseData = null) => {
    try {
      // Usar dados passados como parâmetro ou do estado
      const prize = prizeData || selectedPrize;
      const caseInfo = caseData || currentConsoleCase;
      
      if (!caseInfo || !prize?.apiPrize) {
        toast.error('Dados do prêmio não encontrados');
        return;
      }

      // ✅ CORREÇÃO: Chamar endpoint de crédito separadamente
      console.log('📤 Chamando endpoint de crédito...');
      
      const creditResponse = await api.post(`/cases/credit/${caseInfo.id}`, {
        prizeId: prize.apiPrize.id,
        prizeValue: prize.apiPrize.valor
      });
      
      if (creditResponse.success || creditResponse.credited) {
        console.log('✅ Prêmio creditado com sucesso!');
        
        // Atualizar dados do usuário após crédito
        await refreshUserData(true);
        toast.success('Prêmio creditado na sua carteira!');
      } else {
        throw new Error(creditResponse.message || 'Erro ao creditar prêmio');
      }
    } catch (error) {
      console.error('Erro ao creditar prêmio:', error);
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
      <Header />

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
                    alt="CAIXA CONSOLE DOS SONHOS" 
                    className="object-contain" 
                    src="/imagens/console.png"
                    style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: '1.2rem', background: 'transparent'}}
                  />
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
                  R$ 3,50
                </div>
              </div>
              <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">CAIXA CONSOLE DOS SONHOS</h1>
              <p className="text-gray-300 mb-4 text-lg">Ganhe até R$5.000 NO PIX!</p>
              
              {/* Removido: Seletor de quantidade - apenas uma caixa por vez */}

              {/* Botão Dinâmico baseado no saldo */}
              <div className="flex justify-center gap-3 mb-2">
                {(getUserBalance()) >= 3.50 ? (
                  <button
                    onClick={handleOpenCase}
                    disabled={isLocked || isSimulating || (getUserBalance()) < 3.50}
                    style={{background: 'rgb(14, 16, 21)', border: 'none', padding: '0px', borderRadius: '1.5rem', minWidth: '240px', cursor: (isSimulating || (getUserBalance()) < 3.50) ? 'not-allowed' : 'pointer', opacity: (isSimulating || (getUserBalance()) < 3.50) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxShadow: 'none'}}
                  >
                    <span style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)', borderRadius: '0.7rem', padding: '0.5rem 1.2rem 0.5rem 1.1rem', fontWeight: 700, fontSize: '17px', color: 'rgb(255, 255, 255)', flex: '1 1 0%', position: 'relative'}}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box" style={{marginRight: '8px'}}>
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                        <path d="m3.3 7 8.7 5 8.7-5"></path>
                        <path d="M12 22V12"></path>
                      </svg>
                      Abrir Caixa
                      <span style={{marginLeft: '18px', background: 'rgb(14, 16, 21)', color: 'rgb(255, 255, 255)', fontWeight: 700, fontSize: '17px', borderRadius: '0.7rem', padding: '0.35rem 1.1rem', display: 'flex', alignItems: 'center', minWidth: '80px', position: 'relative', right: '-8px'}}>
                        R$ 3,50
                      </span>
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={handleSimulateCase}
                    disabled={isLocked || isSimulating}
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
              {(getUserBalance()) >= 50.00 ? (
                <p className="text-green-400 text-sm mb-2">Você tem saldo suficiente! Clique para abrir a caixa e ganhar prêmios reais!</p>
              ) : (
                <p className="text-gray-400 text-sm mb-2">Faça um depósito para abrir caixas de verdade e ganhar prêmios reais!</p>
              )}
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
                  { name: 'R$1,00', value: 'R$ 1,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/1real.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$2,00', value: 'R$ 2,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/2reais.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$5,00', value: 'R$ 5,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/5reais.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$10,00', value: 'R$ 10,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/10reais.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$100,00', value: 'R$ 100,00', rarity: 'rarity-2.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/100reais.png', bgColor: 'rgb(59, 130, 246)' },
                  { name: 'Steam Deck', value: 'R$ 300,00', rarity: 'rarity-3.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/steamdeck.png', bgColor: 'rgb(162, 89, 255)' },
                  { name: 'Xbox One', value: 'R$ 4000,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/xboxone.webp', bgColor: 'rgb(255, 215, 0)' },
                  { name: 'PS5', value: 'R$ 5000,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/ps5.png', bgColor: 'rgb(255, 215, 0)' }
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
                  { name: 'R$1,00', value: 'R$ 1,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/1real.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$2,00', value: 'R$ 2,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/2reais.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$5,00', value: 'R$ 5,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/5reais.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$10,00', value: 'R$ 10,00', rarity: 'rarity-1.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/10reais.png', bgColor: 'rgb(176, 190, 197)' },
                  { name: 'R$100,00', value: 'R$ 100,00', rarity: 'rarity-2.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/100reais.png', bgColor: 'rgb(59, 130, 246)' },
                  { name: 'Steam Deck', value: 'R$ 300,00', rarity: 'rarity-3.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/steamdeck.png', bgColor: 'rgb(162, 89, 255)' },
                  { name: 'Xbox One', value: 'R$ 4000,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/xboxone.webp', bgColor: 'rgb(255, 215, 0)' },
                  { name: 'PS5', value: 'R$ 5000,00', rarity: 'rarity-5.png', image: '/imagens/CAIXA CONSOLE DOS SONHOS/ps5.png', bgColor: 'rgb(255, 215, 0)' }
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
              {(getUserBalance()) >= 3.50 ? (
                <button
                  onClick={handleOpenCase}
                  disabled={isLocked || isSimulating || (getUserBalance()) < 3.50}
                  style={{background: 'rgb(14, 16, 21)', border: 'none', padding: '0px', borderRadius: '1.5rem', minWidth: '240px', cursor: (isSimulating || (getUserBalance()) < 3.50) ? 'not-allowed' : 'pointer', opacity: (isSimulating || (getUserBalance()) < 3.50) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxShadow: 'none'}}
                >
                  <span style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)', borderRadius: '0.7rem', padding: '0.5rem 1.2rem 0.5rem 1.1rem', fontWeight: 700, fontSize: '17px', color: 'rgb(255, 255, 255)', flex: '1 1 0%', position: 'relative'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box" style={{marginRight: '8px'}}>
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                      <path d="m3.3 7 8.7 5 8.7-5"></path>
                      <path d="M12 22V12"></path>
                    </svg>
                    Abrir Caixa
                    <span style={{marginLeft: '18px', background: 'rgb(14, 16, 21)', color: 'rgb(255, 255, 255)', fontWeight: 700, fontSize: '17px', borderRadius: '0.7rem', padding: '0.35rem 1.1rem', display: 'flex', alignItems: 'center', minWidth: '80px', position: 'relative', right: '-8px'}}>
                      R$ 3,50
                    </span>
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleSimulateCase}
                  disabled={isLocked || isSimulating}
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
            {(getUserBalance()) >= 5.00 ? (
              <p className="text-green-400 text-sm mb-2">Você tem saldo suficiente! Clique para abrir a caixa e ganhar prêmios reais!</p>
            ) : (
              <p className="text-gray-400 text-sm mb-2">Faça um depósito para abrir caixas de verdade e ganhar prêmios reais!</p>
            )}
            <button 
                  onClick={() => navigate('/profile')}
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
              <h2 className="text-2xl font-bold text-white mb-2">Abrindo Caixa Console dos Sonhos</h2>
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
                  <div key={index} className="inline-block align-top relative mx-2" style={{width: '192px', height: '100%'}}>
                    <div className="inline-block w-48 h-48 flex-shrink-0" style={{opacity: 1}}>
                      <div className="w-44 h-48 relative bg-[#0E1015] rounded-lg overflow-hidden">
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
                            className="w-32 h-32 object-contain"
                          />
                        </div>
                        <div className="absolute bottom-2 left-0 right-0 text-center">
                          <div className="inline-block px-2 py-1 rounded font-bold text-xs mb-1" style={{background: prize.bgColor, color: '#000'}}>
                            {prize.name}
                          </div>
                          <div className="text-white font-bold text-sm" style={{textShadow: 'rgb(0, 0, 0) 0px 1px 4px'}}>
                            {prize.value}
                          </div>
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

      {/* Bottom Navigation */}
      <div className="fixed bottom-4 left-1/2 z-50" style={{transform: 'translateX(-50%)', width: '95vw', maxWidth: '480px', borderRadius: '1.5rem', boxShadow: 'rgba(0, 0, 0, 0.25) 0px 4px 32px 0px', background: 'rgb(24, 24, 27)'}}>
        <div className="flex items-center justify-around py-2">
          <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-yellow-400 transition-colors" style={{minWidth: '0px'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house w-5 h-5 mb-1">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            <span className="text-xs font-medium truncate">Começar</span>
          </button>
          <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-yellow-400 transition-colors" style={{minWidth: '0px'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gamepad2 w-5 h-5 mb-1">
              <line x1="6" x2="10" y1="11" y2="11"></line>
              <line x1="8" x2="8" y1="9" y2="13"></line>
              <line x1="15" x2="15.01" y1="12" y2="12"></line>
              <line x1="18" x2="18.01" y1="10" y2="10"></line>
              <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path>
            </svg>
            <span className="text-xs font-medium truncate">Caixas</span>
          </button>
          <div className="relative flex flex-col items-center justify-center flex-1" style={{zIndex: 2}}>
            <button className="flex flex-col items-center justify-center" style={{marginTop: '-28px', background: 'linear-gradient(90deg, rgb(147, 51, 234) 0%, rgb(124, 58, 237) 100%)', borderRadius: '50%', width: '56px', height: '56px', boxShadow: 'rgba(147, 51, 234, 0.25) 0px 2px 12px 0px', border: '4px solid rgb(24, 24, 27)', color: 'rgb(255, 255, 255)'}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-7 h-7">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </button>
            <span className="text-xs font-semibold mt-1 text-white">Entrar</span>
          </div>
          <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-yellow-400 transition-colors" style={{minWidth: '0px'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wallet w-5 h-5 mb-1">
              <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
              <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
            </svg>
            <span className="text-xs font-medium truncate">Carteira</span>
          </button>
          <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-yellow-400 transition-colors" style={{minWidth: '0px'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 mb-1">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="text-xs font-medium truncate">Perfil</span>
          </button>
        </div>
      </div>
      <div className="h-16"></div>

        <Footer />

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

export default ConsoleCase;