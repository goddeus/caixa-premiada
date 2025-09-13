import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const CaseOpener = ({ 
  caseName, 
  caseImage, 
  casePrice, 
  caseRoute,
  prizes = [],
  isDemo = false 
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser, refreshUserData, isDemoAccount } = useAuth();
  
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [currentCase, setCurrentCase] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    loadCase();
  }, []);

  const loadCase = async () => {
    try {
      const response = await api.getCaixas();
      if (response.data && response.data.cases) {
        const foundCase = response.data.cases.find(c => c.nome === caseName);
        if (foundCase) {
          setCurrentCase(foundCase);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar caixa:', error);
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const simulateDemoCase = async (totalCost) => {
    // Simular RTP 70% para contas demo
    const rtp = 0.70;
    const random = Math.random();
    
    let wonPrize = null;
    const userBalance = (user.tipo_conta === 'afiliado_demo' ? (user.saldo_demo || 0) : (user.saldo_reais || 0)) - totalCost;
    
    if (random <= rtp) {
      // Usuário ganha - calcular prêmio baseado no RTP
      const prizeValue = totalCost * (rtp + Math.random() * 0.3); // Entre 70% e 100% do valor investido
      
      // Encontrar prêmio mais próximo do valor calculado
      const sortedPrizes = prizes.sort((a, b) => {
        const aValue = parseFloat(a.value.replace('R$ ', '').replace(',', '.'));
        const bValue = parseFloat(b.value.replace('R$ ', '').replace(',', '.'));
        return Math.abs(aValue - prizeValue) - Math.abs(bValue - prizeValue);
      });
      
      const selectedPrize = sortedPrizes[0] || prizes[0];
      
      wonPrize = {
        id: Date.now(),
        nome: selectedPrize.name,
        valor: parseFloat(selectedPrize.value.replace('R$ ', '').replace(',', '.')),
        sem_imagem: false
      };
      
      userBalance += wonPrize.valor;
    }
    
    // Atualizar saldo do usuário (apenas visualmente para demo)
    updateUser({ saldo: userBalance });
    
    return {
      data: {
        wonPrize,
        userBalance,
        isDemo: true
      }
    };
  };

  const simulateCase = () => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    setIsSimulating(true);
    setShowSimulation(true);
    setShowResult(false);
    
    // Para contas demo, usar RTP fixo de 70%
    const isDemo = isDemoAccount();
    const rtp = isDemo ? 0.7 : 0.85; // RTP padrão para contas normais
    
    // Selecionar prêmio baseado no RTP
    const randomValue = Math.random();
    let selectedPrizeData;
    
    if (randomValue <= rtp) {
      // Usuário ganha - selecionar prêmio real
      const realPrizes = prizes.filter(p => !p.illustrative);
      selectedPrizeData = realPrizes[Math.floor(Math.random() * realPrizes.length)];
    } else {
      // Usuário não ganha
      selectedPrizeData = {
        name: 'Não ganhou',
        value: 'R$ 0,00',
        rarity: 'rarity-1.png',
        image: null,
        bgColor: 'rgb(176, 190, 197)',
        sem_imagem: true
      };
    }
    
    setSelectedPrize(selectedPrizeData);
    
    setTimeout(() => {
      setIsSimulating(false);
      setShowSimulation(false);
      setShowResult(true);
    }, 5000);
  };

  const openCase = async () => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    if (!currentCase) {
      toast.error('Caixa não encontrada');
      return;
    }

    const totalCost = parseFloat(currentCase.preco) * quantity;
    
    const userCurrentBalance = user.tipo_conta === 'afiliado_demo' ? (user.saldo_demo || 0) : (user.saldo_reais || 0);
    if (userCurrentBalance < totalCost) {
      toast.error('Saldo insuficiente! Faça um depósito para continuar.');
      return;
    }

    setIsOpening(true);
    setIsSimulating(true);
    setShowSimulation(true);
    setShowResult(false);

    try {
      let response;
      
      // Se for conta demo, simular RTP 70%
      if (isDemoAccount()) {
        response = await simulateDemoCase(totalCost);
      } else {
        response = await api.comprarCaixa(currentCase.id, quantity);
      }
      
      if (response.data.wonPrize) {
        const apiPrize = response.data.wonPrize;
        
        // Mapear prêmio da API para formato do frontend
        const mappedPrize = {
          name: apiPrize.nome,
          value: `R$ ${parseFloat(apiPrize.valor).toFixed(2).replace('.', ',')}`,
          rarity: 'rarity-1.png',
          image: apiPrize.sem_imagem ? null : getPrizeImage(apiPrize),
          bgColor: 'rgb(176, 190, 197)',
          apiPrize: apiPrize,
          sem_imagem: apiPrize.sem_imagem || false
        };
        
        // Mapear raridade baseada no valor
        if (apiPrize.valor >= 1000) {
          mappedPrize.rarity = 'rarity-5.png';
          mappedPrize.bgColor = 'rgb(255, 215, 0)';
        } else if (apiPrize.valor >= 500) {
          mappedPrize.rarity = 'rarity-4.png';
          mappedPrize.bgColor = 'rgb(255, 59, 59)';
        } else if (apiPrize.valor >= 100) {
          mappedPrize.rarity = 'rarity-3.png';
          mappedPrize.bgColor = 'rgb(162, 89, 255)';
        } else if (apiPrize.valor >= 10) {
          mappedPrize.rarity = 'rarity-2.png';
          mappedPrize.bgColor = 'rgb(59, 130, 246)';
        }
        
        setSelectedPrize(mappedPrize);
        
        // Atualizar saldo do usuário
        if (response.data.userBalance !== undefined) {
          updateUser({ saldo: response.data.userBalance });
        }
        
        // Atualizar dados do usuário (apenas se não for demo)
        if (!response.data.isDemo) {
          await refreshUserData();
        }
        
        setTimeout(() => {
          setIsSimulating(false);
          setShowSimulation(false);
          setShowResult(true);
          
          // Creditar prêmio automaticamente (apenas se não for demo)
          if (!apiPrize.sem_imagem && !response.data.isDemo) {
            setTimeout(() => {
              creditPrize(mappedPrize);
            }, 2000);
          }
          
          // Contas demo usam as mesmas mensagens das contas reais para realismo
        }, 5000);
      } else {
        toast.error('Erro ao abrir caixa!');
        setIsSimulating(false);
        setShowSimulation(false);
      }
    } catch (error) {
      console.error('Erro ao abrir caixa:', error);
      const errorMessage = error.message || 'Erro ao abrir caixa';
      toast.error(errorMessage);
      setIsSimulating(false);
      setShowSimulation(false);
    } finally {
      setIsOpening(false);
    }
  };

  const getPrizeImage = (apiPrize) => {
    // Mapear imagem baseada no nome do prêmio
    const prizeName = apiPrize.nome.toLowerCase();
    if (prizeName.includes('iphone')) return '/imagens/CAIXA APPLE/iphone 16 pro max.png';
    if (prizeName.includes('macbook')) return '/imagens/CAIXA APPLE/macbook.png';
    if (prizeName.includes('airpods')) return '/imagens/CAIXA APPLE/air pods.png';
    if (prizeName.includes('500')) return '/imagens/CAIXA APPLE/500.webp';
    if (prizeName.includes('100')) return '/imagens/CAIXA APPLE/10.png';
    if (prizeName.includes('10')) return '/imagens/CAIXA APPLE/10.png';
    if (prizeName.includes('5')) return '/imagens/CAIXA APPLE/5.png';
    if (prizeName.includes('2')) return '/imagens/CAIXA APPLE/2.png';
    if (prizeName.includes('1')) return '/imagens/CAIXA APPLE/1.png';
    return '/imagens/CAIXA APPLE/1.png'; // Imagem padrão
  };

  const creditPrize = async (prizeData) => {
    try {
      if (!currentCase || !prizeData?.apiPrize) {
        return;
      }

      // Para contas demo, apenas mostrar a mensagem de sucesso
      if (isDemoAccount()) {
        toast.success(`Prêmio de R$ ${prizeData.apiPrize.valor.toFixed(2).replace('.', ',')} creditado na sua carteira!`);
        return;
      }

      // Para contas reais, fazer a chamada da API
      const response = await api.creditarPremio(
        currentCase.id,
        prizeData.apiPrize.id,
        prizeData.apiPrize.valor
      );

      if (response.data.credited) {
        await refreshUserData();
        toast.success(`Prêmio de R$ ${prizeData.apiPrize.valor.toFixed(2).replace('.', ',')} creditado na sua carteira!`);
      }
    } catch (error) {
      console.error('Erro ao creditar prêmio:', error);
    }
  };

  const generateRandomPrizeSequence = () => {
    const allPrizes = [...prizes];
    let randomSequence = [];
    
    for (let i = 0; i < 50; i++) {
      const randomIndex = Math.floor(Math.random() * allPrizes.length);
      randomSequence.push(allPrizes[randomIndex]);
    }
    
    return [...randomSequence, ...randomSequence];
  };

  const closeResult = () => {
    setShowResult(false);
    setSelectedPrize(null);
  };

  const playAgain = () => {
    setShowResult(false);
    setSelectedPrize(null);
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  const userBalance = user?.tipo_conta === 'afiliado_demo' ? (user?.saldo_demo || 0) : (user?.saldo_reais || 0);
  const canOpenCase = userBalance >= (parseFloat(currentCase?.preco || casePrice) * quantity);
  const isDemo = isDemoAccount();

  return (
    <>
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="relative inline-block mb-4">
          <div className="mx-auto" style={{width: '220px', height: '220px', minWidth: '140px', minHeight: '140px', maxWidth: '260px', maxHeight: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', borderRadius: '1.2rem'}}>
            <img 
              alt={caseName} 
              className="object-contain" 
              src={caseImage}
              style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: '1.2rem', background: 'transparent'}}
            />
          </div>
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg">
            R$ {parseFloat(currentCase?.preco || casePrice).toFixed(2).replace('.', ',')}
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">{caseName}</h1>
        <p className="text-gray-300 mb-4 text-lg">Ganhe prêmios incríveis!</p>
        
        {/* Quantity Selector */}
        <div className="flex justify-center items-center mb-4">
          <div className="flex items-center bg-[#0E1015] rounded-lg p-2 border border-gray-700">
            <button 
              disabled={quantity <= 1}
              onClick={() => handleQuantityChange(-1)}
              className="p-2 text-white hover:text-purple-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
              </svg>
            </button>
            <div className="mx-4 text-white font-bold text-lg min-w-[60px] text-center">{quantity}x</div>
            <button 
              onClick={() => handleQuantityChange(1)}
              className="p-2 text-white hover:text-purple-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5v14"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 mb-2">
          {canOpenCase ? (
            <button
              onClick={openCase}
              disabled={isOpening || isSimulating}
              style={{background: 'rgb(14, 16, 21)', border: 'none', padding: '0px', borderRadius: '1.5rem', minWidth: '240px', cursor: (isOpening || isSimulating) ? 'not-allowed' : 'pointer', opacity: (isOpening || isSimulating) ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxShadow: 'none'}}
            >
              <span style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)', borderRadius: '0.7rem', padding: '0.5rem 1.2rem 0.5rem 1.1rem', fontWeight: 700, fontSize: '17px', color: 'rgb(255, 255, 255)', flex: '1 1 0%', position: 'relative'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                  <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                  <path d="m3.3 7 8.7 5 8.7-5"></path>
                  <path d="M12 22V12"></path>
                </svg>
                Abrir Caixa
                <span style={{marginLeft: '18px', background: 'rgb(14, 16, 21)', color: 'rgb(255, 255, 255)', fontWeight: 700, fontSize: '17px', borderRadius: '0.7rem', padding: '0.35rem 1.1rem', display: 'flex', alignItems: 'center', minWidth: '80px', position: 'relative', right: '-8px'}}>
                  R$ {(parseFloat(currentCase?.preco || casePrice) * quantity).toFixed(2).replace('.', ',')}
                </span>
              </span>
            </button>
          ) : (
            <button
              onClick={simulateCase}
              disabled={isSimulating}
              style={{background: 'rgb(14, 16, 21)', border: 'none', padding: '0px', borderRadius: '1.5rem', minWidth: '240px', cursor: 'pointer', opacity: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxShadow: 'none'}}
            >
              <span style={{display: 'flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(90deg, rgb(147, 51, 234) 0%, rgb(124, 58, 237) 100%)', borderRadius: '0.7rem', padding: '0.5rem 1.2rem 0.5rem 1.1rem', fontWeight: 700, fontSize: '17px', color: 'rgb(255, 255, 255)', flex: '1 1 0%', position: 'relative'}}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
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
        
        {!canOpenCase && (
          <>
            <p className="text-gray-400 text-sm mb-2">Faça um depósito para abrir caixas de verdade e ganhar prêmios reais!</p>
            <button 
              onClick={() => navigate('/wallet')}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-400 hover:to-green-500 transition-all duration-200 transform hover:scale-105"
            >
              Depositar
            </button>
          </>
        )}
        
        {isDemo && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              🎮 Conta Demo - RTP 70% - Saques bloqueados
            </p>
          </div>
        )}
      </div>

      {/* Prizes Grid */}
      <div className="bg-[#0E1015] rounded-2xl p-6 mt-0 pt-2">
        <h3 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
            <path d="m3.3 7 8.7 5 8.7-5"></path>
            <path d="M12 22V12"></path>
          </svg>
          CONTEÚDO DAS CAIXAS
        </h3>
        
        {/* Mobile Grid */}
        <div className="grid md:hidden" style={{gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px 0px', padding: '0px', margin: '0px 0px 0px calc(50% - 50vw)', width: '100vw', maxWidth: '100vw'}}>
          {prizes.map((prize, index) => (
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
        <div className="hidden md:grid" style={{gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px 0px', padding: '0px', margin: '0px', width: '100%', maxWidth: '100%', overflow: 'hidden'}}>
          {prizes.map((prize, index) => (
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
      </div>

      {/* Modal de Simulação */}
      {showSimulation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#0E1015] rounded-lg p-6 w-full max-w-4xl mx-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Abrindo {caseName}</h2>
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
                {!selectedPrize.sem_imagem ? 'VOCÊ GANHOU!' : 'VOCÊ NÃO GANHOU'}
              </h1>
              
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
                      Não desista! A próxima pode ser a sua!
                    </div>
                  </div>
                )}
              </div>
              
              {!selectedPrize.sem_imagem && (
                <div className="text-center mt-8">
                  <h2 className="text-3xl font-bold text-white mb-2 tracking-wider">{selectedPrize.name}</h2>
                  <p className="text-lg text-gray-400 mb-6">{selectedPrize.value}</p>
                </div>
              )}
              
              <div className="flex space-x-4 justify-center mt-8">
                <button 
                  onClick={goToDashboard}
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CaseOpener;
