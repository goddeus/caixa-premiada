import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import BottomNavigation from '../components/BottomNavigation';

const Profile = () => {
  const { user, logout, refreshUserData } = useAuth();
  const navigate = useNavigate();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('20,00');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('random');
  
  // Estados para dados do perfil
  const [profileData, setProfileData] = useState({
    totalDepositado: 0,
    totalRetirado: 0,
    ganhoCashback: 0,
    email: '',
    username: '',
    telefone: '',
    documento: '',
    dataEntrada: ''
  });
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  
  // Estados para rollover
  const [rolloverData, setRolloverData] = useState({
    total_giros: 0,
    rollover_liberado: false,
    rollover_minimo: 20.00
  });
  
  // Estados para saque
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

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

  const handleWithdrawAmountClick = (amount) => {
    setWithdrawAmount(amount);
  };

  // Função para processar saque
  const handleWithdraw = async (e) => {
    e.preventDefault();
    
    if (isWithdrawing) return;
    
    setIsWithdrawing(true);
    setWithdrawError('');
    
    try {
      // Converter valor para formato numérico
      const amount = parseFloat(withdrawAmount.replace(',', '.'));
      
      if (!amount || amount < 20) {
        setWithdrawError('Valor mínimo para saque é R$ 20,00');
        return;
      }
      
      if (!pixKey.trim()) {
        setWithdrawError('Chave PIX é obrigatória');
        return;
      }
      
      // Fazer requisição de saque
      const response = await api.post('/wallet/withdraw', {
        valor: amount,
        pix_key: pixKey.trim()
      });
      
      if (response.success) {
        // Sucesso - mostrar mensagem e fechar modal
        toast.success('Saque solicitado com sucesso! Aguarde a aprovação.');
        setShowWithdrawModal(false);
        setWithdrawAmount('20,00');
        setPixKey('');
        setPixKeyType('random');
        
        // Atualizar dados do usuário
        refreshUserData();
        loadRolloverData();
      } else {
        setWithdrawError(response.data.message || 'Erro ao processar saque');
      }
      
    } catch (error) {
      console.error('Erro no saque:', error);
      
      // Tratar erro de rollover especificamente
      if (error.response?.data?.message?.includes('apostar mais')) {
        setWithdrawError(error.response.data.message);
      } else if (error.response?.data?.message?.includes('Saldo insuficiente')) {
        setWithdrawError('Saldo insuficiente para o saque');
      } else if (error.response?.data?.message?.includes('Chave PIX')) {
        setWithdrawError('Chave PIX é obrigatória');
      } else {
        setWithdrawError(error.response?.data?.message || 'Erro ao processar saque. Tente novamente.');
      }
    } finally {
      setIsWithdrawing(false);
    }
  };

  // Função para carregar dados de rollover
  const loadRolloverData = async () => {
    try {
      const response = await api.get('/wallet');
      if (response.success) {
        const userData = response.balance.usuario;
        setRolloverData({
          total_giros: userData.total_giros || 0,
          rollover_liberado: userData.rollover_liberado || false,
          rollover_minimo: userData.rollover_minimo || 20.00
        });
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
  };

  // Função para buscar dados do perfil
  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/profile');
      const data = response.data; // A resposta vem diretamente em data
      
      setProfileData({
        totalDepositado: data.totalDepositado || 0,
        totalRetirado: data.totalRetirado || 0,
        ganhoCashback: data.ganhoCashback || 0,
        email: data.email || user?.email || '',
        username: data.username || user?.username || '',
        telefone: data.telefone || '',
        documento: data.documento || '',
        dataEntrada: data.dataEntrada || data.createdAt || ''
      });
    } catch (error) {
      console.error('Erro ao buscar dados do perfil:', error);
      
      // Tentar carregar dados do localStorage como fallback
      try {
        const localData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        setProfileData({
          totalDepositado: localData.totalDepositado || 0,
          totalRetirado: localData.totalRetirado || 0,
          ganhoCashback: localData.ganhoCashback || 0,
          email: localData.email || user?.email || '',
          username: localData.username || user?.username || '',
          telefone: localData.telefone || '',
          documento: localData.documento || '',
          dataEntrada: localData.dataEntrada || user?.createdAt || ''
        });
      } catch (localError) {
        console.error('Erro ao carregar dados locais:', localError);
        
        // Usar dados do usuário logado como último fallback
        setProfileData({
          totalDepositado: 0,
          totalRetirado: 0,
          ganhoCashback: 0,
          email: user?.email || '',
          username: user?.username || '',
          telefone: '',
          documento: '',
          dataEntrada: user?.createdAt || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Função para iniciar edição de campo
  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  // Função para salvar edição
  const saveEdit = async () => {
    if (!editValue.trim()) {
      toast.error('Por favor, preencha o campo antes de salvar.');
      return;
    }

    try {
      // Chamada real da API para salvar na database
      const response = await api.put('/profile', {
        [editingField]: editValue
      });
      
      // Verificar se a resposta foi bem-sucedida
      if (response.status === 200 || response.status === 201) {
        // Atualizar dados locais
        setProfileData(prev => ({
          ...prev,
          [editingField]: editValue
        }));
        
        // Atualizar dados do usuário no contexto de autenticação
        await refreshUserData();
        
        setEditingField(null);
        setEditValue('');
        
        // Mostrar feedback de sucesso
        toast.success('Dados salvos com sucesso na database!');
      } else {
        throw new Error('Erro na resposta da API');
      }
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      
      // Se a API falhar, tentar salvar no localStorage como backup
      try {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData[editingField] = editValue;
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Atualizar dados locais mesmo com erro da API
        setProfileData(prev => ({
          ...prev,
          [editingField]: editValue
        }));
        
        setEditingField(null);
        setEditValue('');
        
        toast.info('Dados salvos localmente (API indisponível). Será sincronizado quando a API estiver online.');
      } catch (localError) {
        console.error('Erro ao salvar localmente:', localError);
        toast.error('Erro ao salvar dados. Tente novamente.');
      }
    }
  };

  // Função para cancelar edição
  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Função para formatar valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  useEffect(() => {
    fetchProfileData();
    loadRolloverData();
  }, [user]);

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
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-lg bg-gray-600 text-white font-bold hover:bg-gray-700 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Voltar
              </button>
              <button
                onClick={() => {
                  setShowWithdrawModal(true);
                  setWithdrawError('');
                }}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold hover:opacity-90 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M12 2v20M7 5h5.5a3.5 3.5 0 0 1 0 7H7a3.5 3.5 0 0 0 0 7h5"/>
                </svg>
                Saque
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Seção de Rollover - Mobile */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-blue-500/20 px-4 py-4">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-300 text-sm font-semibold flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                Progresso de Rollover
              </span>
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
            
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-300">
                R$ {rolloverData.total_giros.toFixed(2)} / R$ {rolloverData.rollover_minimo.toFixed(2)}
              </span>
              <span className="text-blue-300 font-semibold">
                {Math.round((rolloverData.total_giros / rolloverData.rollover_minimo) * 100)}%
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
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
              <p className="text-xs text-gray-400">
                Aposte R$ {(rolloverData.rollover_minimo - rolloverData.total_giros).toFixed(2)} a mais para liberar saques
              </p>
            )}
            
            {rolloverData.rollover_liberado && (
              <p className="text-xs text-green-400">
                ✅ Saques liberados! Você pode sacar normalmente.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            {/* User Profile Card */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{profileData.username || 'Usuário'}</h2>
                  <p className="text-gray-400 text-sm">Entrou em {formatDate(profileData.dataEntrada)}</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              <button className="flex items-center space-x-3 px-4 py-3 bg-green-500 text-white rounded-lg w-full text-left">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Conta</span>
              </button>
              <button 
                onClick={() => navigate('/game-history')}
                className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors w-full text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="6" x2="10" y1="11" y2="11"></line>
                  <line x1="8" x2="8" y1="9" y2="13"></line>
                  <line x1="15" x2="15.01" y1="12" y2="12"></line>
                  <line x1="18" x2="18.01" y1="10" y2="10"></line>
                  <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path>
                </svg>
                <span>Histórico de Jogos</span>
              </button>
              <button 
                onClick={() => navigate('/transactions')}
                className="flex items-center space-x-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors w-full text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14,2 14,8 20,8"></polyline>
                  <line x1="16" x2="8" y1="13" y2="13"></line>
                  <line x1="16" x2="8" y1="17" y2="17"></line>
                  <polyline points="10,9 9,9 8,9"></polyline>
                </svg>
                <span>Transações</span>
              </button>
              <button 
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-lg transition-colors w-full text-left"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16,17 21,12 16,7"></polyline>
                  <line x1="21" x2="9" y1="12" y2="12"></line>
                </svg>
                <span>Sair</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {/* Estatísticas */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Estatísticas</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Depositado */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Depositado</p>
                      <p className="text-green-400 text-2xl font-bold">{formatCurrency(profileData.totalDepositado)}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Total Retirado */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Retirado</p>
                      <p className="text-green-400 text-2xl font-bold">{formatCurrency(profileData.totalRetirado)}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M12 2v20M7 5h5.5a3.5 3.5 0 0 1 0 7H7a3.5 3.5 0 0 0 0 7h5"/>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Ganho em Cashback */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Ganho em Cashback</p>
                      <p className="text-green-400 text-2xl font-bold">{formatCurrency(profileData.ganhoCashback)}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <path d="M12 1v6l3-3 3 3V1"></path>
                        <path d="M12 23v-6l3 3 3-3v6"></path>
                        <path d="M12 12h6"></path>
                        <path d="M12 12H6"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informações Pessoais */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Informações Pessoais</h2>
              <div className="space-y-4">
                {/* Email */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                          <polyline points="22,6 12,13 2,6"></polyline>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm">Email</p>
                        {editingField === 'email' ? (
                          <div className="flex items-center space-x-2 mt-1">
                            <input
                              type="email"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
                            />
                            <button onClick={saveEdit} className="px-2 py-1 bg-green-500 text-white rounded text-sm">Salvar</button>
                            <button onClick={cancelEdit} className="px-2 py-1 bg-gray-500 text-white rounded text-sm">Cancelar</button>
                          </div>
                        ) : (
                          <p className="text-white font-medium">{profileData.email || 'Não informado'}</p>
                        )}
                      </div>
                    </div>
                    {editingField !== 'email' && (
                      <button 
                        onClick={() => startEditing('email', profileData.email)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>Editar</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm">Username</p>
                        {editingField === 'username' ? (
                          <div className="flex items-center space-x-2 mt-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
                            />
                            <button onClick={saveEdit} className="px-2 py-1 bg-green-500 text-white rounded text-sm">Salvar</button>
                            <button onClick={cancelEdit} className="px-2 py-1 bg-gray-500 text-white rounded text-sm">Cancelar</button>
                          </div>
                        ) : (
                          <p className="text-white font-medium">{profileData.username || 'Não informado'}</p>
                        )}
                      </div>
                    </div>
                    {editingField !== 'username' && (
                      <button 
                        onClick={() => startEditing('username', profileData.username)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>Editar</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Telefone */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm">Telefone</p>
                        {editingField === 'telefone' ? (
                          <div className="flex items-center space-x-2 mt-1">
                            <input
                              type="tel"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="(00) 00000-0000"
                              className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
                            />
                            <button onClick={saveEdit} className="px-2 py-1 bg-green-500 text-white rounded text-sm">Salvar</button>
                            <button onClick={cancelEdit} className="px-2 py-1 bg-gray-500 text-white rounded text-sm">Cancelar</button>
                          </div>
                        ) : (
                          <p className="text-white font-medium">{profileData.telefone || 'Não informado'}</p>
                        )}
                      </div>
                    </div>
                    {editingField !== 'telefone' && (
                      <button 
                        onClick={() => startEditing('telefone', profileData.telefone)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>Editar</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Documento */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14,2 14,8 20,8"></polyline>
                          <line x1="16" x2="8" y1="13" y2="13"></line>
                          <line x1="16" x2="8" y1="17" y2="17"></line>
                          <polyline points="10,9 9,9 8,9"></polyline>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-400 text-sm">Documento (CPF)</p>
                        {editingField === 'documento' ? (
                          <div className="flex items-center space-x-2 mt-1">
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              placeholder="000.000.000-00"
                              className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:border-green-500 focus:outline-none"
                            />
                            <button onClick={saveEdit} className="px-2 py-1 bg-green-500 text-white rounded text-sm">Salvar</button>
                            <button onClick={cancelEdit} className="px-2 py-1 bg-gray-500 text-white rounded text-sm">Cancelar</button>
                          </div>
                        ) : (
                          <p className="text-white font-medium">{profileData.documento || 'Não informado'}</p>
                        )}
                      </div>
                    </div>
                    {editingField !== 'documento' && (
                      <button 
                        onClick={() => startEditing('documento', profileData.documento)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>Editar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
                <h1 className="text-xl font-medium text-white">Saque</h1>
              </div>

              {/* Exibição de erro */}
              {withdrawError && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-300 text-sm">{withdrawError}</p>
                  </div>
                </div>
              )}

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
                    />
                  </div>
                </div>

                {/* Botões de valores rápidos */}
                <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2">
                  {['30,00', '50,00', '100,00', '200,00', '500,00'].map((amount) => (
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
                    />
                  </div>
                </div>

                {/* Botão de solicitar saque */}
                <button
                  type="submit"
                  disabled={isWithdrawing}
                  className={`w-full font-bold py-2 md:py-3 rounded-md transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base ${
                    isWithdrawing 
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:opacity-90'
                  }`}
                >
                  {isWithdrawing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
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
      <BottomNavigation />
    </div>
  );
};

export default Profile;
