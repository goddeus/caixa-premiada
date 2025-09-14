// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

console.log('🔧 API Service - Base URL:', API_BASE_URL);

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // Interceptor para adicionar token automaticamente
    this.client.interceptors.request.use(
      (config) => {
    const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para tratar respostas
    this.client.interceptors.response.use(
      (response) => {
        console.log('📡 Resposta da API:', response.data);
        return response.data;
      },
      (error) => {
        console.error('❌ Erro na API:', error.response?.data || error.message);
        
        if (error.response?.status === 401) {
          // Token expirado ou inválido - apenas limpar dados, não redirecionar
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Não redirecionar automaticamente para não perder logs
        }
        
        const message = error.response?.data?.message || error.message || 'Erro desconhecido';
        throw new Error(message);
      }
    );
  }

  // ===== AUTENTICAÇÃO =====
  async login(email, senha) {
    console.log('[DEBUG] Iniciando login:', { email });
    const response = await this.client.post('/auth/login', { email, senha });
    console.log('[DEBUG] Resposta do login:', response);
    
    if (response.success && (response.data?.token || response.token)) {
      const token = response.data?.token || response.token;
      const user = response.data?.user || response.user;
      
      console.log('[DEBUG] Salvando token e usuário no localStorage:', { 
        token: token ? 'Presente' : 'Ausente', 
        user: user ? 'Presente' : 'Ausente' 
      });
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('[DEBUG] Token salvo:', localStorage.getItem('token') ? 'Sim' : 'Não');
      console.log('[DEBUG] Usuário salvo:', localStorage.getItem('user') ? 'Sim' : 'Não');
    } else {
      console.error('[DEBUG] Login falhou - sem token na resposta:', response);
    }
    return response;
  }

  async register(dados) {
    console.log('[DEBUG] Iniciando registro:', { email: dados.email });
    const response = await this.client.post('/auth/register', dados);
    console.log('[DEBUG] Resposta do registro:', response);
    
    if (response.success && (response.data?.token || response.token)) {
      const token = response.data?.token || response.token;
      const user = response.data?.user || response.user;
      
      console.log('[DEBUG] Salvando token e usuário no localStorage:', { 
        token: token ? 'Presente' : 'Ausente', 
        user: user ? 'Presente' : 'Ausente' 
      });
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('[DEBUG] Token salvo:', localStorage.getItem('token') ? 'Sim' : 'Não');
      console.log('[DEBUG] Usuário salvo:', localStorage.getItem('user') ? 'Sim' : 'Não');
    } else {
      console.error('[DEBUG] Registro falhou - sem token na resposta:', response);
    }
    return response;
  }

  async getMe() {
    return this.client.get('/auth/me');
  }

  async refreshToken() {
    return this.client.post('/auth/refresh');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // ===== CAIXAS =====
  async getCaixas() {
    return this.client.get('/cases');
  }

  async getCaixaById(id) {
    return this.client.get(`/cases/${id}`);
  }

  async abrirCaixa(caixaId, quantidade = 1, purchaseId = null) {
    return this.client.post(`/cases/buy/${caixaId}`, { 
      quantidade, 
      purchaseId 
    });
  }

  async getCaixaHistorico(caixaId) {
    return this.client.get(`/transactions`);
  }

  async getCaixasStats() {
    return this.client.get('/admin/dashboard/stats');
  }

  // ===== PAGAMENTOS =====
  async criarDeposito(valor) {
    return this.client.post('/payments/deposit', { valor });
  }

  async criarSaque(valor, pixKey) {
    return this.client.post('/payments/withdraw', { 
      valor, 
      pix_key: pixKey 
    });
  }

  async getHistoricoPagamentos(page = 1, limit = 20, tipo = null) {
    const params = { page, limit };
    if (tipo) params.tipo = tipo;
    return this.client.get('/payments/history', { params });
  }

  async getPagamento(id) {
    return this.client.get(`/payments/${id}`);
  }

  async verificarStatusPagamento(id) {
    return this.client.get(`/payments/${id}/status`);
  }

  // ===== AFILIADOS =====
  async criarAfiliado() {
    return this.client.post('/affiliate/create');
  }

  async getAfiliadoInfo() {
    return this.client.get('/affiliate/me');
  }

  async getAfiliadoStats() {
    return this.client.get('/affiliate/stats');
  }

  async getAfiliadoIndicados(page = 1, limit = 20) {
    return this.client.get('/affiliate/referrals', { 
      params: { page, limit } 
    });
  }

  async getAfiliadoComissoes(page = 1, limit = 20) {
    return this.client.get('/affiliate/commissions', { 
      params: { page, limit } 
    });
  }

  async solicitarSaqueAfiliado(valor, pixKey, pixKeyType) {
    return this.client.post('/affiliate/withdraw', { 
      valor, 
      pix_key: pixKey, 
      pix_key_type: pixKeyType 
    });
  }

  async getAfiliadoSaques(page = 1, limit = 20) {
    return this.client.get('/affiliate/withdrawals', { 
      params: { page, limit } 
    });
  }

  async validarCodigoIndicacao(codigo) {
    return this.client.get(`/affiliate/validate/${codigo}`);
  }

  // ===== UTILITÁRIOS =====
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  updateUserInStorage(userData) {
    localStorage.setItem('user', JSON.stringify(userData));
  }

  // ===== MÉTODOS GENÉRICOS =====
  async get(endpoint, params = {}) {
    return this.client.get(endpoint, { params });
  }

  async post(endpoint, data = {}) {
    return this.client.post(endpoint, data);
  }

  async put(endpoint, data = {}) {
    return this.client.put(endpoint, data);
  }

  async delete(endpoint) {
    return this.client.delete(endpoint);
  }
}

export default new ApiService();