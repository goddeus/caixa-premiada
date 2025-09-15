import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Helper function to get correct balance
  const getUserBalance = (userData = user) => {
    if (!userData) return 0;
    return userData.tipo_conta === 'afiliado_demo' 
      ? (userData.saldo_demo || 0) 
      : (userData.saldo_reais || 0);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        // Primeiro, tentar dados do servidor
        try {
          const response = await api.getMe();
          if (response.success && response.data.user) {
            const serverUser = response.data.user;
            setUser(serverUser);
            setIsAuthenticated(true);
            api.updateUserInStorage(serverUser);
            return; // Sair aqui se servidor funcionou
          }
        } catch (serverError) {
          console.warn('Erro ao atualizar dados do servidor:', serverError);
        }
        
        // Fallback: usar dados do localStorage se servidor falhar
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        // Se não há token, garantir que o estado está limpo
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      api.logout();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, senha) => {
    try {
      setLoading(true);
      console.log('🔐 Tentando fazer login com:', email);
      const response = await api.login(email, senha);
      console.log('📥 Resposta do login:', response);
      
      if (response.success) {
        const { user } = response.data || response;
        
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success('Login realizado com sucesso!');
        return { success: true };
      } else {
        throw new Error(response.message || 'Erro no login');
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      const message = error.message || 'Erro ao fazer login';
      toast.error(message);
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('🔐 Tentando fazer registro com:', userData.email);
      const response = await api.register(userData);
      console.log('📥 Resposta do registro:', response);
      
      if (response.success) {
        const { user } = response.data || response;
        
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success('Conta criada com sucesso!');
        return { success: true };
      } else {
        throw new Error(response.message || 'Erro no registro');
      }
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      const message = error.message || 'Erro ao criar conta';
      toast.error(message);
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Logout realizado com sucesso!');
  };

  const updateUser = (newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }));
    api.updateUserInStorage({ ...user, ...newUserData });
  };

  const refreshUserData = async (force = false) => {
    try {
      if (api.isAuthenticated()) {
        // Evitar chamadas múltiplas desnecessárias
        if (!force && refreshing) {
          console.log('[DEBUG] Evitando chamada duplicada de refreshUserData');
          return;
        }
        
        setRefreshing(true);
        console.log('[DEBUG] Atualizando dados do usuário...');
        const response = await api.getMe();
        if (response.success) {
          const userData = response.data.user;
          setUser(userData);
          api.updateUserInStorage(userData);
          console.log('[DEBUG] Dados do usuário atualizados com sucesso');
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do usuário:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const isDemoAccount = () => {
    return user?.tipo_conta === 'afiliado_demo';
  };

  const canWithdraw = () => {
    return !isDemoAccount() && user?.rollover_liberado;
  };

  const value = {
    user,
    loading,
    refreshing,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshUserData,
    isDemoAccount,
    canWithdraw,
    getUserBalance
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};