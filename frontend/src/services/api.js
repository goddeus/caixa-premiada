// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://slotbox-api.onrender.com/api';

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
      (response) => response.data,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
        
        const message = error.response?.data?.message || error.message || 'Erro desconhecido';
        throw new Error(message);
      }
    );
  }

  // ===== AUTENTICAÇÃO =====
  async login(email, senha) {
    const response = await this.client.post('/auth/login', { email, senha });
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  }

  async register(dados) {
    const response = await this.client.post('/auth/register', dados);
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
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
    return this.client.get('/caixas');
  }

  async getCaixaById(id) {
    return this.client.get(`/caixas/${id}`);
  }

  async abrirCaixa(caixaId, quantidade = 1, purchaseId = null) {
    return this.client.post(`/caixas/${caixaId}/abrir`, { 
      quantidade, 
      purchaseId 
    });
  }

  async getCaixaHistorico(caixaId) {
    return this.client.get(`/caixas/${caixaId}/historico`);
  }

  async getCaixasStats() {
    return this.client.get('/caixas/stats');
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