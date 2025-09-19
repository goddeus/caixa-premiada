import { useState, useEffect, useCallback, useRef } from 'react';

import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import PixPaymentModal from '../components/PixPaymentModal';
import Footer from '../components/Footer';

const Dashboard = () => {
  const { user, isAuthenticated, login, logout, register, isDemoAccount, getUserBalance } = useAuth();
  const navigate = useNavigate();
  // const [searchParams] = useSearchParams(); // Removido - não utilizado
  const [loading, setLoading] = useState(true);
  const [winnersTodayAmount, setWinnersTodayAmount] = useState(42118.00);
  const [liveWinners, setLiveWinners] = useState([]);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('20,00');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('20,00');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('random');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', senha: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAffiliateModal, setShowAffiliateModal] = useState(false);
  const [affiliateData, setAffiliateData] = useState(null);
  const [affiliateLoading, setAffiliateLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerData, setRegisterData] = useState({ 
    nome: '', 
    email: '', 
    senha: '', 
    confirmarSenha: '', 
    cpf: '', 
    referralCode: '' 
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rolloverData, setRolloverData] = useState({
    total_giros: 0,
    rollover_liberado: false,
    rollover_minimo: 20.00
  });
  const [showPixModal, setShowPixModal] = useState(false);
  const [pixData, setPixData] = useState(null);
  const [cases, setCases] = useState([]);
  const [casesLoading, setCasesLoading] = useState(false);
  const [casesLoaded, setCasesLoaded] = useState(false);
  const [lastLoadTime, setLastLoadTime] = useState(0);

  // Função para gerar nomes aleatórios (otimizada com useCallback)
  const generateRandomName = useCallback(() => {
    const firstNames = ['Priscila', 'Felipe', 'Gustavo', 'Patrícia', 'Rodrigo', 'Natália', 'Letícia', 'Larissa', 'Lucas', 'Ana'];
    const lastNames = ['U***', 'W***', 'I***', 'P***', 'J***', 'E***', 'Y***', 'V***', 'O***', 'C***'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return `${firstName} ${lastName}`;
  }, []);

  // Função para gerar prêmios aleatórios (otimizada com useCallback)
  const generateRandomPrize = useCallback(() => {
    const prizes = [
      { name: 'R$500,00', value: 'R$ 500,00', rarity: 'rarity-5.png', image: './imagens/CAIXA PREMIUM MASTER/500.webp', bgColor: 'rgb(255, 215, 0)' },
      { name: 'JORDAN 4', value: 'R$ 1.500,00', rarity: 'rarity-5.png', image: './imagens/CAIXA KIT NIKE/jordan.png', bgColor: 'rgb(255, 215, 0)' },
      { name: 'R$2,00', value: 'R$ 2,00', rarity: 'rarity-1.png', image: './imagens/CAIXA CONSOLE DOS SONHOS/2reais.png', bgColor: 'rgb(176, 190, 197)' },
      { name: 'R$5,00', value: 'R$ 5,00', rarity: 'rarity-1.png', image: './imagens/CAIXA CONSOLE DOS SONHOS/5reais.png', bgColor: 'rgb(176, 190, 197)' },
      { name: 'NIKE DUNK LOW', value: 'R$ 1.000,00', rarity: 'rarity-5.png', image: './imagens/CAIXA KIT NIKE/nike dunk.webp', bgColor: 'rgb(255, 215, 0)' },
      { name: 'PS5 1TB', value: 'R$ 5.000,00', rarity: 'rarity-5.png', image: './imagens/CAIXA CONSOLE DOS SONHOS/ps5.png', bgColor: 'rgb(255, 215, 0)' }
    ];
    
    return prizes[Math.floor(Math.random() * prizes.length)];
  }, []);

  // Função para gerar lista de ganhadores ao vivo (otimizada com useCallback)
  const generateLiveWinners = useCallback(() => {
    const winners = [];
    for (let i = 0; i < 25; i++) {
      const prize = generateRandomPrize();
      winners.push({
        name: generateRandomName(),
        prize: prize.name,
        value: prize.value,
        rarity: prize.rarity,
        image: prize.image,
        bgColor: prize.bgColor
      });
    }
    return winners;
  }, [generateRandomName, generateRandomPrize]);

  useEffect(() => {
    setLiveWinners(generateLiveWinners());
    setLoading(false);
  }, []); // Array vazio - executa apenas uma vez

  // Detectar código de indicação na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    if (referralCode) {
      setRegisterData(prev => ({ ...prev, referralCode }));
      setShowRegisterModal(true);
      // Limpar a URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Log de autenticação apenas uma vez usando useRef
  const authLoggedRef = useRef(false);
  
  useEffect(() => {
    if (!authLoggedRef.current) {
      // Aguardar um pouco para o estado se estabilizar
      setTimeout(() => {
        if (isAuthenticated && user) {
          console.log('Usuário autenticado:', user);
        } else {
          console.log('Usuário não autenticado');
        }
        authLoggedRef.current = true;
      }, 50);
    }
  }, []); // Array vazio - executa apenas uma vez

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    console.log('🎯 Iniciando processo de login...');

    try {
      console.log('📤 Dados enviados:', { email: loginData.email, senha: '***' });
      const result = await login(loginData.email, loginData.senha);
      console.log('📥 Resultado do login:', result);
      
      if (result.success) {
        console.log('✅ Login bem-sucedido, fechando modal...');
        setShowLoginModal(false);
        setLoginData({ email: '', senha: '' });
      } else {
        console.log('❌ Login falhou:', result.error);
      }
    } catch (error) {
      console.error('💥 Erro no login:', error);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    console.log('🎯 Iniciando processo de registro...');

    try {
      // Mapear referralCode para ref_code para o backend
      const dataToSend = {
        ...registerData,
        ref_code: registerData.referralCode
      };
      delete dataToSend.referralCode;
      
      console.log('📤 Dados de registro enviados:', { 
        nome: dataToSend.nome, 
        email: dataToSend.email, 
        cpf: dataToSend.cpf,
        ref_code: dataToSend.ref_code
      });
      
      const result = await register(dataToSend);
      console.log('📥 Resultado do registro:', result);
      
      if (result.success) {
        console.log('✅ Registro bem-sucedido, fechando modal...');
        setShowRegisterModal(false);
        setRegisterData({ 
          nome: '', 
          email: '', 
          senha: '', 
          confirmarSenha: '', 
          cpf: '', 
          referralCode: '' 
        });
      } else {
        console.log('❌ Registro falhou:', result.error);
      }
    } catch (error) {
      console.error('💥 Erro no registro:', error);
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleAffiliateClick = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setAffiliateLoading(true);
    try {
      console.log('[DEBUG] Buscando dados do afiliado...');
      const response = await api.get('/affiliate/me');
      console.log('[DEBUG] Resposta do afiliado:', response);
      
      if (response.success) {
        setAffiliateData(response.data);
        setShowAffiliateModal(true);
      } else {
        throw new Error(response.message || 'Erro ao carregar dados do afiliado');
      }
    } catch (error) {
      console.error('[DEBUG] Erro ao buscar dados do afiliado:', error);
      toast.error('Erro ao carregar dados do afiliado');
    } finally {
      setAffiliateLoading(false);
    }
  };

  const copyAffiliateLink = async () => {
    try {
      await navigator.clipboard.writeText(affiliateData.link);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      toast.error('Erro ao copiar link');
    }
  };

  const handleDepositAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9,]/g, '');
    if (value === '') {
      setDepositAmount('20,00');
      return;
    }
    if (!value.includes(',')) {
      value += ',00';
    }
    setDepositAmount(value);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount.replace(',', '.')) < 20) {
      toast.error('Valor mínimo para depósito é R$ 20,00');
      return;
    }

    if (parseFloat(depositAmount.replace(',', '.')) > 10000) {
      toast.error('Valor máximo para depósito é R$ 10.000,00');
      return;
    }

    if (!isAuthenticated || !user) {
      toast.error('Você precisa estar logado para fazer um depósito');
      setShowLoginModal(true);
      return;
    }

    try {
      setLoading(true);
      console.log('[DEBUG] Iniciando depósito PIX:', { userId: user.id, amount: parseFloat(depositAmount.replace(',', '.')) });
      
      const response = await api.post('/deposit/pix', { 
        userId: user.id,
        amount: parseFloat(depositAmount.replace(',', '.')) 
      });
      
      console.log('[DEBUG] Resposta do depósito PIX:', response);
      
      if (response.success) {
        // Preparar dados para o modal PIX
        const pixModalData = {
          success: true,
          data: {
            qr_base64: response.qrCodeImage,
            qr_text: response.qrCode,
            transaction_id: response.identifier,
            valor: parseFloat(depositAmount.replace(',', '.')),
            amount: parseFloat(depositAmount.replace(',', '.')), // Manter compatibilidade
            expires_at: new Date(Date.now() + 3600000) // 1 hora
          }
        };
        
        setPixData(pixModalData);
        setShowDepositModal(false);
        setShowPixModal(true);
        setDepositAmount('20,00');
        
        toast.success('QR Code PIX gerado com sucesso!');
      } else {
        toast.error(response.message || 'Erro ao gerar QR Code');
      }
      
    } catch (error) {
      console.error('[DEBUG] Erro no depósito PIX:', error);
      const message = error.response?.data?.message || 'Erro ao criar depósito';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9,]/g, '');
    if (value === '') {
      setWithdrawAmount('20,00');
      return;
    }
    if (!value.includes(',')) {
      value += ',00';
    }
    setWithdrawAmount(value);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (!withdrawAmount || parseFloat(withdrawAmount.replace(',', '.')) < 20) {
      toast.error('Valor mínimo para saque é R$ 20,00');
      return;
    }

    if (parseFloat(withdrawAmount.replace(',', '.')) > 5000) {
      toast.error('Valor máximo para saque é R$ 5.000,00');
      return;
    }

    if (!pixKey) {
      toast.error('Chave PIX é obrigatória');
      return;
    }

    if (!isAuthenticated || !user) {
      toast.error('Você precisa estar logado para fazer um saque');
      setShowLoginModal(true);
      return;
    }

    try {
      setLoading(true);
      console.log('[DEBUG] Iniciando saque PIX:', { 
        userId: user.id, 
        amount: parseFloat(withdrawAmount.replace(',', '.')),
        pixKey,
        pixKeyType
      });
      
      const response = await api.post('/withdraw/pix', { 
        userId: user.id,
        amount: parseFloat(withdrawAmount.replace(',', '.')),
        pixKey: pixKey,
        pixKeyType: pixKeyType
      });
      
      console.log('[DEBUG] Resposta do saque PIX:', response);
      
      if (response.success) {
        toast.success('Saque solicitado com sucesso!');
        setWithdrawAmount('20,00');
        setPixKey('');
        setPixKeyType('phone');
        setShowWithdrawModal(false);
        
        // Atualizar saldo do usuário
        await refreshUserData();
      } else {
        toast.error(response.error || 'Erro ao solicitar saque');
      }
      
    } catch (error) {
      console.error('[DEBUG] Erro no saque PIX:', error);
      const message = error.response?.data?.error || error.response?.data?.message || 'Erro ao solicitar saque';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const interval = setInterval(() => {
      setWinnersTodayAmount(prev => {
        const increment = Math.random() * 1.5 + 0.5;
        return prev + increment;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Usar useCallback para otimizar a função
      const newWinner = {
        name: generateRandomName(),
        ...generateRandomPrize()
      };
      
      setLiveWinners(prev => [newWinner, ...prev.slice(0, 24)]);
    }, 8000); // Aumentar intervalo para 8 segundos para reduzir carga

    return () => clearInterval(interval);
  }, []); // Array vazio - executa apenas uma vez

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.relative')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  // Carregar dados de rollover
  const loadRolloverData = useCallback(async () => {
    try {
      if (user && !user.is_admin) {
        // Buscar dados atualizados do usuário
        const response = await api.get('/wallet/');
        if (response.success && response.balance) {
          // Tentar acessar dados de rollover de forma mais robusta
          const userData = response.balance?.usuario || response.balance;
          
          if (userData && typeof userData === 'object') {
            setRolloverData({
              total_giros: userData.total_giros || 0,
              rollover_liberado: userData.rollover_liberado || false,
              rollover_minimo: userData.rollover_minimo || 20.00
            });
          } else {
            // Fallback para dados do contexto
            setRolloverData({
              total_giros: user?.total_giros || 0,
              rollover_liberado: user?.rollover_liberado || false,
              rollover_minimo: user?.rollover_minimo || 20.00
            });
          }
        } else {
          // Fallback para dados do contexto
          setRolloverData({
            total_giros: user?.total_giros || 0,
            rollover_liberado: user?.rollover_liberado || false,
            rollover_minimo: user?.rollover_minimo || 20.00
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados de rollover:', error);
      // Fallback para dados do contexto
      setRolloverData({
        total_giros: user?.total_giros || 0,
        rollover_liberado: user?.rollover_liberado || false,
        rollover_minimo: user?.rollover_minimo || 20.00
      });
    }
  }, [user]);

  // Handler otimizado para logout
  const handleLogout = useCallback(() => {
    setShowUserDropdown(false);
    logout();
    navigate('/');
  }, [logout, navigate]);

  // Handler otimizado para alternar modais
  const handleSwitchToRegister = useCallback(() => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  }, []);

  const handleSwitchToLogin = useCallback(() => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  }, []);

  // Handler otimizado para valores de saque
  const handleWithdrawAmountClick = useCallback((amount) => {
    setWithdrawAmount(amount);
  }, []);

  // Handlers otimizados para navegação
  const handleNavigateToDashboard = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleNavigateToProfile = useCallback(() => {
    navigate('/profile');
  }, [navigate]);

  const handleNavigateToCase = useCallback((route) => {
    console.log('🎯 Navegando para:', route);
    navigate(route);
  }, [navigate]);

  // Função para carregar caixas (sem dependências problemáticas)
  const loadCases = useCallback(async () => {
    if (casesLoading || casesLoaded) {
      console.log('🚫 Já está carregando ou já carregou caixas, evitando duplicação');
      return;
    }
    
    try {
      setCasesLoading(true);
      console.log('🔄 Carregando caixas...');
      
      const response = await api.getCaixas();
      
      if (response.success && response.data) {
        // Mapear caixas para rotas corretas
        const casesWithRoutes = response.data.map(caseItem => {
          let route = `/case/${caseItem.id}`; // fallback padrão
          
          // Mapear por nome para rotas específicas
          if (caseItem.nome && caseItem.nome.toLowerCase().includes('final de semana')) {
            route = '/weekend-case';
          } else if (caseItem.nome && caseItem.nome.toLowerCase().includes('nike')) {
            route = '/nike-case';
          } else if (caseItem.nome && caseItem.nome.toLowerCase().includes('samsung')) {
            route = '/samsung-case';
          } else if (caseItem.nome && caseItem.nome.toLowerCase().includes('console')) {
            route = '/console-case';
          } else if (caseItem.nome && caseItem.nome.toLowerCase().includes('apple')) {
            route = '/apple-case';
          } else if (caseItem.nome && caseItem.nome.toLowerCase().includes('premium master')) {
            route = '/premium-master-case';
          }
          
          return {
            ...caseItem,
            route: route
          };
        });
        
        setCases(casesWithRoutes);
        setCasesLoaded(true);
        console.log('✅ Caixas carregadas:', response.data.length);
        console.log('📋 Caixas com rotas:', casesWithRoutes);
      } else {
        console.error('❌ Erro na estrutura da resposta:', response);
        // Fallback para dados hardcoded
        const fallbackCases = [
          { id: 'weekend-case', nome: 'FIM DE SEMANA PREMIADO!!!', imagem_url: '/imagens/fim de semana.png', preco: 1.50, route: '/weekend-case' },
          { id: 'nike-case', nome: 'CAIXA KIT NIKE', imagem_url: '/imagens/nike.png', preco: 2.50, route: '/nike-case' },
          { id: 'samsung-case', nome: 'CAIXA SAMSUNG HAPPY', imagem_url: '/imagens/caixa samsung.png', preco: 3.00, route: '/samsung-case' },
          { id: 'console-case', nome: 'CAIXA CONSOLE DO SONHOS!', imagem_url: '/imagens/console.png', preco: 3.50, route: '/console-case' },
          { id: 'apple-case', nome: 'CAIXA DA APPLE HAPPY!', imagem_url: '/imagens/caixa apple.png', preco: 7.00, route: '/apple-case' },
          { id: 'premium-master-case', nome: 'CAIXA PREMIUM MASTER !', imagem_url: '/imagens/caixa premium.png', preco: 15.00, route: '/premium-master-case' }
        ];
        setCases(fallbackCases);
        setCasesLoaded(true);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar caixas:', error);
      toast.error('Erro ao carregar caixas. Usando dados padrão.');
      // Fallback para dados hardcoded
      const fallbackCases = [
        { id: 'weekend-case', nome: 'FIM DE SEMANA PREMIADO!!!', imagem_url: '/imagens/fim de semana.png', preco: 1.50, route: '/weekend-case' },
        { id: 'nike-case', nome: 'CAIXA KIT NIKE', imagem_url: '/imagens/nike.png', preco: 2.50, route: '/nike-case' },
        { id: 'samsung-case', nome: 'CAIXA SAMSUNG HAPPY', imagem_url: '/imagens/caixa samsung.png', preco: 3.00, route: '/samsung-case' },
        { id: 'console-case', nome: 'CAIXA CONSOLE DO SONHOS!', imagem_url: '/imagens/console.png', preco: 3.50, route: '/console-case' },
        { id: 'apple-case', nome: 'CAIXA DA APPLE HAPPY!', imagem_url: '/imagens/caixa apple.png', preco: 7.00, route: '/apple-case' },
        { id: 'premium-master-case', nome: 'CAIXA PREMIUM MASTER !', imagem_url: '/imagens/caixa premium.png', preco: 15.00, route: '/premium-master-case' }
      ];
      setCases(fallbackCases);
      setCasesLoaded(true);
    } finally {
      setCasesLoading(false);
    }
  }, []); // Remover dependências para evitar loops

  // Carregar dados apenas uma vez usando useRef
  const hasLoadedRef = useRef(false);
  const loadingTimeoutRef = useRef(null);
  
  useEffect(() => {
    // Evitar carregamentos múltiplos
    if (hasLoadedRef.current) {
      return;
    }
    
    // Limpar timeout anterior se existir
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Aguardar um pouco para evitar carregamentos múltiplos
    loadingTimeoutRef.current = setTimeout(() => {
      if (!hasLoadedRef.current) {
        console.log('🚀 Carregando dados iniciais...');
        hasLoadedRef.current = true;
        
        const loadInitialData = async () => {
          try {
            if (isAuthenticated && user) {
              await loadRolloverData();
            }
            await loadCases();
          } catch (error) {
            console.error('Erro no carregamento inicial:', error);
          }
        };
        
        loadInitialData();
      }
    }, 500); // Aumentar para 500ms para estabilizar
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []); // Array vazio - executa apenas uma vez

  // Mostrar loading apenas se ainda não carregou os dados iniciais
  if (loading || (!hasLoadedRef.current && isAuthenticated && user)) {
    return (
      <div className="min-h-screen bg-[#0E1015] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mb-6"></div>
          <h1 className="text-2xl font-bold text-yellow-400 mb-2">Carregando...</h1>
          <p className="text-gray-400">Aguarde enquanto carregamos a plataforma.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background:'#0E1015'}}>
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
                  onClick={() => setShowRegisterModal(true)}
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
                <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                  </svg>
                  <span className="text-white font-semibold">
                    R$ {getUserBalance().toFixed(2)}
                  </span>
                </div>
                
                {/* Seção de Rollover */}
                {!user?.is_admin && (
                  <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg p-3 border border-blue-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-blue-300 text-sm font-semibold">Progresso de Rollover</span>
                      {rolloverData.rollover_liberado ? (
                        <span className="text-green-400 text-xs font-bold flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          LIBERADO
                        </span>
                      ) : (
                        <span className="text-yellow-400 text-xs font-bold">BLOQUEADO</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">
                        R$ {rolloverData.total_giros.toFixed(2)} / R$ {rolloverData.rollover_minimo.toFixed(2)}
                      </span>
                      <span className="text-blue-300">
                        {Math.round((rolloverData.total_giros / rolloverData.rollover_minimo) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          rolloverData.rollover_liberado 
                            ? 'bg-gradient-to-r from-green-500 to-green-400' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                        style={{ 
                          width: `${Math.min((rolloverData.total_giros / rolloverData.rollover_minimo) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    {!rolloverData.rollover_liberado && (
                      <p className="text-xs text-gray-400 mt-2">
                        Aposte R$ {(rolloverData.rollover_minimo - rolloverData.total_giros).toFixed(2)} a mais para liberar saques
                      </p>
                    )}
                  </div>
                )}
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
                  onClick={() => {
                    if (isDemoAccount()) {
                      toast.error('Saque temporariamente indisponível. Tente novamente mais tarde.');
                      return;
                    }
                    
                    // ✅ CORREÇÃO: Verificar rollover antes de permitir saque
                    if (!rolloverData.rollover_liberado) {
                      const girosFaltantes = rolloverData.rollover_minimo - rolloverData.total_giros;
                      toast.error(`Você precisa apostar mais R$ ${girosFaltantes.toFixed(2)} para liberar saques. Total apostado: R$ ${rolloverData.total_giros.toFixed(2)}/${rolloverData.rollover_minimo.toFixed(2)}`);
                      return;
                    }
                    
                    setShowWithdrawModal(true);
                  }}
                  className={`px-3 py-1 rounded-lg text-white font-bold transition flex items-center text-sm ${
                    isDemoAccount() || !rolloverData.rollover_liberado
                      ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:opacity-90'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                    <path d="M12 2v20M7 5h5.5a3.5 3.5 0 0 1 0 7H7a3.5 3.5 0 0 0 0 7h5"/>
                  </svg>
                  Sacar
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="px-4 py-2 rounded-lg bg-transparent text-white font-bold hover:opacity-90 transition flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 mr-2">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {user?.username || 'Usuário'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>
                  
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                      <div className="py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16,17 21,12 16,7"></polyline>
                            <line x1="21" x2="9" y1="12" y2="12"></line>
                          </svg>
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
                  onClick={() => setShowRegisterModal(true)}
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
                <div className="flex items-center space-x-2 px-2 py-1 rounded-lg bg-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white text-sm">
                    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                  </svg>
                  <span className="text-white font-semibold text-sm">
                    R$ {getUserBalance().toFixed(2)}
                  </span>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="px-2 py-1 rounded bg-transparent text-white font-bold hover:opacity-90 transition flex items-center text-sm"
                    style={{minWidth:'0',height:'32px'}}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-4 h-4 mr-1">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    {user?.username || 'Usuário'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>
                  
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                      <div className="py-2">
                        <button
                          onClick={handleLogout}
                          className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 transition-colors flex items-center text-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16,17 21,12 16,7"></polyline>
                            <line x1="21" x2="9" y1="12" y2="12"></line>
                          </svg>
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-0 py-4 md:py-8">
        <div className="w-full px-0 py-0 mt-[-14px] md:mt-0">
          <div className="relative w-full rounded-lg overflow-hidden h-[250px] md:h-[500px]" style={{background: 'rgb(14, 16, 21)'}}>
            <div className="relative w-full h-full">
              <div className="absolute inset-0 transition-opacity duration-500 opacity-100 rounded-lg" style={{overflow: 'hidden', width: '100%', height: '100%'}}>
                <img alt="Banner 1" className="w-full h-full object-contain transition-opacity duration-300 rounded-lg opacity-100 h-[250px] md:h-[500px] max-h-[300px] md:max-h-[600px]" loading="eager" src="/imagens/banner.png" style={{objectFit: 'contain', objectPosition: 'center center', width: '100%', height: '100%', padding: '0px', margin: '0px', display: 'block', borderRadius: '0.75rem'}} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-0 py-2">
          <div className="grid grid-cols-2 gap-2 md:gap-4 mb-[-8px]">
            <div className="bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-xl flex items-center px-3 py-2 md:p-4 shadow-md">
              <div className="flex-1 flex flex-col items-start justify-center">
                <span className="text-[11px] md:text-xs font-semibold text-orange-900 mb-1 tracking-wide">GANHADORES HOJE</span>
                <span className="text-base md:text-xl font-bold text-[#e65100] leading-tight">R$ {winnersTodayAmount.toFixed(2)}</span>
              </div>
              <img src="https://cdn-icons-png.flaticon.com/128/2641/2641497.png" alt="Troféu" className="w-10 h-10 md:w-12 md:h-12 ml-2" style={{background:'linear-gradient(135deg, #ffeb3b 60%, #ff9800 100%)', borderRadius:'50%', padding:'4px'}} />
            </div>
            <div className="bg-gradient-to-r from-yellow-200 to-yellow-400 rounded-xl flex items-center px-3 py-2 md:p-4 shadow-md">
              <div className="flex-1 flex flex-col items-start justify-center">
                <span className="text-[11px] md:text-xs font-semibold text-orange-900 mb-1 tracking-wide">DEPOIMENTOS DO JOGADOR</span>
                <span className="text-base md:text-lg font-bold text-[#e65100] leading-tight">CONFIRA</span>
              </div>
              <img src="https://cdn-icons-png.flaticon.com/128/3237/3237420.png" alt="Estrela" className="w-10 h-10 md:w-12 md:h-12 ml-2" style={{background:'linear-gradient(135deg, #fffde7 60%, #ffe082 100%)', borderRadius:'50%', padding:'4px'}} />
            </div>
          </div>
        </div>

        {/* Live Winners Section */}
        <div className="text-gray-300 backdrop-blur-sm border-t border-[#0F1117] py-3">
          <div className="container mx-auto px-1 md:px-0 flex items-center">
            <div className="flex-shrink-0 flex items-center h-full">
              <div className="text-gray-300 rounded-l-xl px-2 md:px-5 py-2 flex flex-col justify-center items-center min-h-[90px] md:min-h-[85px] min-w-[70px] md:min-w-[110px]" style={{height: '56px', boxSizing: 'border-box'}}>
                <img alt="AO VIVO" className="h-16 md:h-20 w-auto animate-pulse" src="/imagens/aovivo.png" style={{objectFit: 'contain', display: 'block', marginLeft: '0px', marginRight: 'auto'}} />
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex animate-scroll space-x-2 md:space-x-4 pl-1 md:pl-2">
                {liveWinners.map((winner, index) => (
                  <div key={index} className="flex-shrink-0 rounded-lg p-2 md:p-3 min-w-[200px] md:min-w-[240px] flex items-center" style={{background: `linear-gradient(90deg, ${winner.bgColor}32 0%, ${winner.bgColor}18 100%)`}}>
                    <div className="flex items-center space-x-2 md:space-x-3" style={{height: '64px'}}>
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                        <img alt="Raridade" className="absolute inset-0 w-full h-full object-contain opacity-70" src={`/imagens/${winner.rarity}`} />
                        <img alt={winner.prize} className="w-12 h-12 object-contain relative z-10" src={winner.image} style={{background: 'transparent'}} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-semibold text-xs md:text-sm truncate">{winner.name}</div>
                        <div className="inline-block px-2 py-0.5 rounded font-bold text-xs md:text-xs mb-1" style={{background: winner.bgColor, color: 'rgb(0, 0, 0)', minWidth: '60px', maxWidth: '120px', textAlign: 'center', marginBottom: '2px', letterSpacing: '0.2px', fontWeight: '700'}}>
                          {winner.prize}
                        </div>
                        <div className="text-green-400 font-bold text-xs md:text-sm">{winner.value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cases Grid */}
        <div className="container mx-auto px-4">
          <div className="w-full flex justify-center">
            <div className="grid justify-center items-start" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', maxWidth: '1200px', width: '100%', gap: '18px', padding: '12px 0px'}}>
              {casesLoading ? (
                <div className="col-span-full flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                  <span className="ml-2 text-white">Carregando caixas...</span>
                </div>
              ) : cases.length > 0 ? cases.map((caseItem, index) => (
                <div 
                  key={index} 
                  className="rounded-lg border bg-card text-card-foreground shadow-sm w-full border-none cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg" 
                  style={{
                    background: 'transparent', 
                    boxShadow: 'none', 
                    borderRadius: '1.5rem', 
                    padding: '0px', 
                    margin: '0px', 
                    overflow: 'visible', 
                    minWidth: '0px', 
                    maxWidth: '180px', 
                    position: 'relative',
                    cursor: 'pointer'
                  }} 
                  onClick={() => {
                    console.log('🎯 Clicando na caixa:', caseItem.nome, 'Rota:', caseItem.route || `/case/${caseItem.id}`);
                    handleNavigateToCase(caseItem.route || `/case/${caseItem.id}`);
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.cursor = 'pointer';
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.cursor = 'pointer';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  <div className="flex justify-center items-center mt-2 mb-2 group">
                    <div className="group-hover:scale-[1.18] group-hover:-rotate-6 transition-transform duration-300" style={{width: '200px', height: '200px', borderRadius: '1.5rem', overflow: 'hidden', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.3s cubic-bezier(0.4, 2, 0.6, 1)'}}>
                      <img alt={caseItem.nome} className="pointer-events-none" src={caseItem.imagem_url || caseItem.imagem || '/imagens/default-case.png'} style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: '1.5rem', background: 'transparent', transition: 'transform 0.3s cubic-bezier(0.4, 2, 0.6, 1)'}} />
                    </div>
                  </div>
                  <div className="w-full text-center mt-1 mb-1">
                    <span className="text-white font-bold uppercase" style={{fontSize: '1.08rem', letterSpacing: '0.5px'}}>{caseItem.nome}</span>
                  </div>
                  <div className="flex justify-center mb-2">
                    <span className="font-bold px-4 py-1 shadow flex items-center justify-center" style={{position: 'relative', background: 'linear-gradient(90deg, rgb(255, 230, 97) 0%, rgb(255, 145, 15) 100%)', color: 'rgb(24, 28, 35)', fontSize: '1.05rem', fontWeight: '700', minWidth: '80px', textAlign: 'center', borderRadius: '0.5rem', paddingLeft: '22px', paddingRight: '22px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'rgba(0, 0, 0, 0.1) 0px 2px 8px 0px'}}>
                      <span style={{position: 'absolute', left: '-14px', top: '50%', transform: 'translateY(-50%)', width: '0px', height: '0px', borderTop: '16px solid transparent', borderBottom: '16px solid transparent', borderRight: '14px solid rgb(255, 230, 97)', filter: 'drop-shadow(rgba(255, 230, 97, 0.533) 0px 0px 6px)', zIndex: '1'}}></span>
                      <span style={{position: 'absolute', right: '-14px', top: '50%', transform: 'translateY(-50%)', width: '0px', height: '0px', borderTop: '16px solid transparent', borderBottom: '16px solid transparent', borderLeft: '14px solid rgb(255, 145, 15)', filter: 'drop-shadow(rgba(255, 145, 15, 0.533) 0px 0px 6px)', zIndex: '1'}}></span>
                      <span style={{position: 'relative', zIndex: '2'}}>R$ {parseFloat(caseItem.preco).toFixed(2).replace('.', ',')}</span>
                    </span>
                  </div>
                </div>
              )) : (
                <div className="col-span-full flex flex-col justify-center items-center py-8">
                  <div className="text-yellow-400 text-6xl mb-4">📦</div>
                  <h3 className="text-white text-xl font-bold mb-2">Nenhuma caixa disponível</h3>
                  <p className="text-gray-400 text-center">Não foi possível carregar as caixas. Tente novamente mais tarde.</p>
                  <button 
                    onClick={() => {
                      setCasesLoaded(false);
                      loadCases();
                    }}
                    className="mt-4 px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-4 left-1/2 z-50" style={{transform:'translateX(-50%)', width:'95vw', maxWidth:'480px', borderRadius:'1.5rem', boxShadow:'0 4px 32px 0 rgba(0,0,0,0.25)', background:'#18181b'}}>
        <div className="flex items-center justify-around py-2">
          <button className="flex flex-col items-center justify-center flex-1 text-yellow-500 hover:text-yellow-400 transition-colors" style={{minWidth:'0'}} onClick={handleNavigateToDashboard}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house w-5 h-5 mb-1">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            <span className="text-xs font-medium truncate">Começar</span>
          </button>
          <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-yellow-400 transition-colors" style={{minWidth:'0'}} onClick={handleNavigateToDashboard}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gamepad2 w-5 h-5 mb-1">
              <line x1="6" x2="10" y1="11" y2="11"></line>
              <line x1="8" x2="8" y1="9" y2="13"></line>
              <line x1="15" x2="15.01" y1="12" y2="12"></line>
              <line x1="18" x2="18.01" y1="10" y2="10"></line>
              <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path>
            </svg>
            <span className="text-xs font-medium truncate">Caixas</span>
          </button>
          <div className="relative flex flex-col items-center justify-center flex-1" style={{zIndex: '2'}}>
            <button className="flex flex-col items-center justify-center" style={{marginTop: '-28px', background: 'linear-gradient(90deg, rgb(255, 230, 97) 0%, rgb(255, 145, 15) 100%)', borderRadius: '50%', width: '56px', height: '56px', boxShadow: 'rgba(247, 147, 89, 0.25) 0px 2px 12px 0px', border: '4px solid rgb(24, 24, 27)', color: 'rgb(255, 255, 255)'}} onClick={() => setShowDepositModal(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-credit-card w-7 h-7">
                <rect width="20" height="14" x="2" y="5" rx="2"></rect>
                <line x1="2" x2="22" y1="10" y2="10"></line>
              </svg>
            </button>
            <span className="text-xs font-semibold mt-1 text-white">Depósito</span>
          </div>
          <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-yellow-400 transition-colors" style={{minWidth:'0'}} onClick={handleAffiliateClick} disabled={affiliateLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users w-5 h-5 mb-1">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span className="text-xs font-medium truncate">Indique</span>
          </button>
          <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-yellow-400 transition-colors" style={{minWidth:'0'}} onClick={handleNavigateToProfile}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 mb-1">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className="text-xs font-medium truncate">Perfil</span>
          </button>
        </div>
      </div>
      <div className="h-16"></div>


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
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Digite seu email"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginData.senha}
                      onChange={(e) => setLoginData({...loginData, senha: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                      placeholder="Digite sua senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
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
                  onClick={handleSwitchToRegister}
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

      {/* Modal de Depósito */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gradient-to-t from-purple-500 from-[-60%] via-[5%] to-100% via-slate-900 to-slate-900 animate-in fade-in-0 zoom-in-95 w-full max-w-md mx-auto rounded-lg border shadow-lg duration-200 outline-none overflow-auto max-h-[90vh]">
            <div className="p-3 md:p-4">
              {/* Header com imagem */}
              <div className="-m-4 mb-0 select-none relative">
                <img src="/imagens/deposito.jpg" className="w-full h-24 md:h-32 object-cover rounded-t-lg" alt="Depósito" />
                <div className="absolute bg-gradient-to-b from-black/10 via-black/10 from-0% via-85% to-100% to-background size-full z-10 top-0"></div>
              </div>
              
              <div className="flex items-center gap-2 mb-4 mt-4">
                <svg fill="none" viewBox="0 0 24 24" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" className="size-6 text-white">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 15v3m0 3v-3m0 0h-3m3 0h3"></path>
                  <path fill="currentColor" fillRule="evenodd" d="M5 5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h7.083A6 6 0 0 1 12 18c0-1.148.322-2.22.881-3.131A3 3 0 0 1 9 12a3 3 0 1 1 5.869.881A5.97 5.97 0 0 1 18 12c1.537 0 2.939.578 4 1.528V8a3 3 0 0 0-3-3zm7 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" clipRule="evenodd"></path>
                </svg>
                <h1 className="text-xl font-medium text-white">Depositar</h1>
              </div>
              
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Valor:</label>
                  <div className="relative">
                    <span className="font-semibold opacity-80 absolute left-3 top-2/4 -translate-y-2/4 text-white">R$</span>
                    <input
                      type="text"
                      value={depositAmount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9,]/g, '');
                        setDepositAmount(value);
                      }}
                      className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="0,00"
                      required
                    />
                  </div>
                  {parseFloat(depositAmount.replace(',', '.')) < 20 && depositAmount !== '' && (
                    <p className="text-red-400 text-xs mt-1">Depósito mínimo: R$ 20,00</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-1 md:gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositAmount('20,00')}
                    className="bg-purple-500/10 text-purple-400 text-xs md:text-sm font-semibold rounded-md p-1 md:p-2 hover:bg-purple-500/20 transition-colors"
                  >
                    R$ 20,00
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositAmount('50,00')}
                    className="bg-purple-500/10 text-purple-400 text-xs md:text-sm font-semibold rounded-md p-1 md:p-2 hover:bg-purple-500/20 transition-colors"
                  >
                    R$ 50,00
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositAmount('100,00')}
                    className="bg-purple-500/10 text-purple-400 text-xs md:text-sm font-semibold rounded-md p-1 md:p-2 hover:bg-purple-500/20 transition-colors"
                  >
                    R$ 100,00
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositAmount('200,00')}
                    className="bg-purple-500/10 text-purple-400 text-xs md:text-sm font-semibold rounded-md p-1 md:p-2 hover:bg-purple-500/20 transition-colors"
                  >
                    R$ 200,00
                  </button>
                </div>
                
                <button 
                  className="w-full bg-purple-500 text-white font-semibold py-2 md:py-3 px-3 md:px-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin size-4 md:size-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <svg width="1em" height="1em" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="size-4 md:size-5">
                        <path fill="currentColor" d="M8 6H6v2h2zm-5-.75A2.25 2.25 0 0 1 5.25 3h3.5A2.25 2.25 0 0 1 11 5.25v3.5A2.25 2.25 0 0 1 8.75 11h-3.5A2.25 2.25 0 0 1 3 8.75zm2.25-.75a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75zM6 16h2v2H6zm-3-.75A2.25 2.25 0 0 1 5.25 13h3.5A2.25 2.25 0 0 1 11 15.25v3.5A2.25 2.25 0 0 1 8.75 21h-3.5A2.25 2.25 0 0 1 3 18.75zm2.25-.75a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75h3.5a.75.75 0 0 0 .75-.75v-3.5a.75.75 0 0 0-.75-.75zM18 6h-2v2h2zm-2.75-3A2.25 2.25 0 0 0 13 5.25v3.5A2.25 2.25 0 0 0 15.25 11h3.5A2.25 2.25 0 0 0 21 8.75v-3.5A2.25 2.25 0 0 0 18.75 3zm-.75 2.25a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-.75.75h-3.5a.75.75 0 0 1-.75-.75zM13 13h2.75v2.75H13zm5.25 2.75h-2.5v2.5H13V21h2.75v-2.75h2.5V21H21v-2.75h-2.75zm0 0V13H21v2.75z"></path>
                      </svg>
                      Gerar QR Code
                    </>
                  )}
                </button>
              </form>
            </div>
            
            <button 
              type="button" 
              className="absolute top-3 right-3 md:top-4 md:right-4 w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
              onClick={() => setShowDepositModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Saque */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gradient-to-t from-purple-500 from-[-60%] via-[5%] to-100% via-slate-900 to-slate-900 animate-in fade-in-0 zoom-in-95 w-full max-w-md mx-auto rounded-lg border shadow-lg duration-200 outline-none overflow-auto max-h-[90vh]">
            <div className="p-3 md:p-4">
              {/* Header com imagem */}
              <div className="-m-4 mb-0 select-none relative">
                <img src="/imagens/SAQUE.jpg" className="w-full h-24 md:h-32 object-cover rounded-t-lg" alt="Saque" />
                <div className="absolute bg-gradient-to-b from-black/10 via-black/10 from-0% via-85% to-100% to-background size-full z-10 top-0"></div>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" className="size-6 text-white">
                  <path d="M22 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9h3a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1ZM7 20v-2a2 2 0 0 1 2 2Zm10 0h-2a2 2 0 0 1 2-2Zm0-4a4 4 0 0 0-4 4h-2a4 4 0 0 0-4-4V8h10Zm4-6h-2V7a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3H3V4h18Zm-9 5a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0-4a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z"></path>
                </svg>
                <h1 className="text-xl font-medium text-white">Sacar</h1>
              </div>

              <form onSubmit={handleWithdraw} className="space-y-4">
                {/* Campo de valor */}
                <div>
                  <label className="flex items-center font-medium text-white mb-2 text-sm">
                    Valor:
                  </label>
                  <div className="relative">
                    <span className="font-semibold opacity-80 absolute left-3 top-2/4 -translate-y-2/4 text-white">R$</span>
                    <input
                      type="tel"
                      value={withdrawAmount}
                      onChange={handleWithdrawAmountChange}
                      className="w-full pl-10 pr-3 py-2 bg-transparent border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      placeholder="20,00"
                      required
                    />
                  </div>
                </div>

                {/* Botões de valores rápidos */}
                <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2">
                  {['20,00', '50,00', '100,00', '200,00', '500,00'].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleWithdrawAmountClick(amount)}
                      className="bg-purple-500/20 text-purple-400 text-xs md:text-sm font-semibold px-2 md:px-3 py-1 md:py-2 rounded-md hover:bg-purple-500/30 transition-colors whitespace-nowrap"
                    >
                      R$ {amount}
                    </button>
                  ))}
                </div>

                {/* Campo de chave PIX */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white mb-1">
                    Chave PIX
                  </label>
                  <div className="flex flex-col md:flex-row items-stretch md:items-center w-full gap-2">
                    <select
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value)}
                      className="border border-gray-600 bg-transparent text-white px-2 md:px-3 py-2 rounded-md text-xs md:text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="phone">Telefone</option>
                      <option value="email">Email</option>
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="random">Chave aleatória</option>
                    </select>
                    <input
                      type="text"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      placeholder="Digite sua chave PIX..."
                      className="flex-1 px-2 md:px-3 py-2 bg-transparent border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Botão de solicitar saque */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-2 md:py-3 rounded-md hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin size-4 md:size-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processando...
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" className="size-4 md:size-5">
                        <path d="M22 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9h3a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1ZM7 20v-2a2 2 0 0 1 2 2Zm10 0h-2a2 2 0 0 1 2-2Zm0-4a4 4 0 0 0-4 4h-2a4 4 0 0 0-4-4V8h10Zm4-6h-2V7a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3H3V4h18Zm-9 5a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0-4a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z"></path>
                      </svg>
                      Solicitar Saque
                    </>
                  )}
                </button>
              </form>

              {/* Botão de fechar */}
              <button
                className="absolute top-3 right-3 md:top-4 md:right-4 text-white opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowWithdrawModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Afiliados */}
      {showAffiliateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gradient-to-t from-purple-500 from-[-60%] via-[5%] to-100% via-slate-900 to-slate-900 animate-in fade-in-0 zoom-in-95 w-full max-w-md mx-auto rounded-lg border shadow-lg duration-200 outline-none overflow-auto max-h-[90vh]">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg">💎</span>
                  </div>
                  <h1 className="text-xl font-medium text-white">Indique e Ganhe</h1>
                </div>
                <button 
                  type="button" 
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                  onClick={() => setShowAffiliateModal(false)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>
              
              {affiliateData ? (
                <div className="space-y-4">
                  {/* Texto explicativo */}
                  <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-lg p-4 border border-purple-500/30">
                    <p className="text-white text-sm leading-relaxed">
                      Convide amigos e ganhe <span className="font-bold text-yellow-400">R$10,00</span> por cada indicado que se cadastrar e realizar o depósito mínimo de <span className="font-bold text-yellow-400">R$20,00</span>.
                    </p>
                  </div>

                  {/* Link de indicação */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Seu link único:</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={affiliateData.link}
                        readOnly
                        className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm font-mono"
                      />
                      <button
                        onClick={copyAffiliateLink}
                        className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                        </svg>
                        Copiar
                      </button>
                    </div>
                  </div>

                  {/* Estatísticas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <div className="text-yellow-400 font-bold text-lg">R$ {affiliateData.ganhos?.toFixed(2) || '0.00'}</div>
                      <div className="text-gray-400 text-xs">Ganhos Totais</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
                      <div className="text-green-400 font-bold text-lg">{affiliateData.total_indicados || 0}</div>
                      <div className="text-gray-400 text-xs">Indicados</div>
                    </div>
                  </div>

                  {/* Lista de Usuários Indicados */}
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      Usuários Indicados
                    </h3>
                    
                    {affiliateData.referrals && affiliateData.referrals.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {affiliateData.referrals.map((referral, index) => (
                          <div key={index} className="flex items-center justify-between bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {referral.user_id ? referral.user_id.substring(0, 4).toUpperCase() : 'N/A'}
                                </span>
                              </div>
                              <div>
                                <div className="text-white text-sm font-medium">
                                  ID: {referral.user_id ? referral.user_id.substring(0, 8) + '...' : 'N/A'}
                                </div>
                                <div className="text-gray-400 text-xs">
                                  {referral.created_at ? new Date(referral.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {referral.deposit_amount && referral.deposit_amount > 0 ? (
                                <div className="text-green-400 font-bold text-sm">
                                  R$ {referral.deposit_amount.toFixed(2)}
                                </div>
                              ) : (
                                <div className="text-yellow-400 font-medium text-sm">
                                  Aguardando depósito
                                </div>
                              )}
                              {referral.commission_earned && referral.commission_earned > 0 && (
                                <div className="text-blue-400 text-xs">
                                  +R$ {referral.commission_earned.toFixed(2)} comissão
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <p className="text-gray-400 text-sm">Nenhum usuário indicado ainda</p>
                        <p className="text-gray-500 text-xs mt-1">Compartilhe seu link para começar a ganhar!</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gradient-to-t from-purple-500 from-[-60%] via-[5%] to-100% via-slate-900 to-slate-900 animate-in fade-in-0 zoom-in-95 w-full max-w-md mx-auto rounded-lg border shadow-lg duration-200 outline-none overflow-auto max-h-[90vh]">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg fill="none" viewBox="0 0 24 24" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" className="size-6 text-white">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <h1 className="text-xl font-medium text-white">Criar Conta</h1>
              </div>
              
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome Completo</label>
                  <input
                    type="text"
                    value={registerData.nome}
                    onChange={(e) => setRegisterData({...registerData, nome: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Digite seu nome completo"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Digite seu email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">CPF</label>
                  <input
                    type="text"
                    value={registerData.cpf}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setRegisterData({...registerData, cpf: value});
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Digite seu CPF (apenas números)"
                    maxLength="11"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Senha</label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? "text" : "password"}
                      value={registerData.senha}
                      onChange={(e) => setRegisterData({...registerData, senha: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                      placeholder="Digite sua senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showRegisterPassword ? (
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirmar Senha</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmarSenha}
                      onChange={(e) => setRegisterData({...registerData, confirmarSenha: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                      placeholder="Confirme sua senha"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? (
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

                {registerData.referralCode && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <span className="text-green-400 text-sm font-medium">
                        Código de indicação aplicado: {registerData.referralCode}
                      </span>
                    </div>
                  </div>
                )}
                
                <button 
                  className="w-full bg-purple-500 text-white font-semibold py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                  type="submit"
                  disabled={registerLoading}
                >
                  {registerLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Criar Conta'
                  )}
                </button>
              </form>
              
              <div className="mt-4 text-center">
                <p className="text-gray-400 text-sm">Já tem uma conta?</p>
                <button 
                  onClick={handleSwitchToLogin}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors text-sm mt-1"
                >
                  Fazer login
                </button>
              </div>
            </div>
            
            <button 
              type="button" 
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
              onClick={() => setShowRegisterModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Modal PIX */}
      <PixPaymentModal
        isOpen={showPixModal}
        onClose={() => {
          setShowPixModal(false);
          setPixData(null);
        }}
        paymentData={pixData?.data}
        onPaymentComplete={() => {
          setShowPixModal(false);
          setPixData(null);
          toast.success('Pagamento confirmado!');
        }}
      />

      <Footer />
    </div>
  );
};

export default Dashboard;