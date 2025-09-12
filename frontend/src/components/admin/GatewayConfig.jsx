import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { 
  FaCreditCard, 
  FaCog, 
  FaPlay, 
  FaStop, 
  FaTrash, 
  FaSave, 
  FaFlask,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const GatewayConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [supportedGateways, setSupportedGateways] = useState([]);
  const [activeConfig, setActiveConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({});
  const [editingConfig, setEditingConfig] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});

  // Estados do formulário
  const [formData, setFormData] = useState({
    gateway_name: '',
    is_active: false,
    api_key: '',
    public_key: '',
    webhook_secret: '',
    base_url: '',
    pix_key: '',
    pix_key_type: 'email',
    webhook_url: '',
    redirect_url: '',
    sandbox_mode: true,
    min_deposit: 20.00,
    max_deposit: 10000.00,
    min_withdraw: 50.00,
    max_withdraw: 5000.00,
    deposit_fee: 0.00,
    withdraw_fee: 0.00,
    deposit_timeout: 3600,
    withdraw_timeout: 86400,
    supported_methods: ['pix']
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configsRes, supportedRes, activeRes] = await Promise.all([
        api.get('/admin/gateway-config'),
        api.get('/admin/gateway-config/supported'),
        api.get('/admin/gateway-config/active')
      ]);

      setConfigs(configsRes.data.configs || []);
      setSupportedGateways(supportedRes.data.gateways || []);
      setActiveConfig(activeRes.data.config || null);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar configurações de gateway');
    } finally {
      setLoading(false);
    }
  };

  const handleEditConfig = (config) => {
    setEditingConfig(config.gateway_name);
    setFormData({
      ...config,
      supported_methods: Array.isArray(config.supported_methods) 
        ? config.supported_methods 
        : JSON.parse(config.supported_methods || '["pix"]')
    });
  };

  const handleNewConfig = (gatewayName) => {
    setEditingConfig(gatewayName);
    setFormData({
      gateway_name: gatewayName,
      is_active: false,
      api_key: '',
      public_key: '',
      webhook_secret: '',
      base_url: supportedGateways.find(g => g.name === gatewayName)?.website || '',
      pix_key: '',
      pix_key_type: 'email',
      webhook_url: '',
      redirect_url: '',
      sandbox_mode: true,
      min_deposit: 20.00,
      max_deposit: 10000.00,
      min_withdraw: 50.00,
      max_withdraw: 5000.00,
      deposit_fee: 0.00,
      withdraw_fee: 0.00,
      deposit_timeout: 3600,
      withdraw_timeout: 86400,
      supported_methods: ['pix']
    });
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      
      const response = await api.post(
        `/admin/gateway-config/${formData.gateway_name}`,
        formData
      );

      if (response.data.success) {
        toast.success('Configuração salva com sucesso!');
        setEditingConfig(null);
        loadData();
      } else {
        toast.error(response.data.error || 'Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleGateway = async (gatewayName, isActive) => {
    try {
      const response = await api.patch(
        `/admin/gateway-config/${gatewayName}/toggle`,
        { is_active: isActive }
      );

      if (response.data.success) {
        toast.success(`Gateway ${isActive ? 'ativado' : 'desativado'} com sucesso!`);
        loadData();
      } else {
        toast.error(response.data.error || 'Erro ao alterar status do gateway');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error(error.response?.data?.error || 'Erro ao alterar status do gateway');
    }
  };

  const handleTestConnection = async (gatewayName) => {
    try {
      setTesting(prev => ({ ...prev, [gatewayName]: true }));
      
      const response = await api.post(
        `/admin/gateway-config/${gatewayName}/test`
      );

      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.error || 'Erro ao testar conexão');
      }
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      toast.error(error.response?.data?.error || 'Erro ao testar conexão');
    } finally {
      setTesting(prev => ({ ...prev, [gatewayName]: false }));
    }
  };

  const handleDeleteConfig = async (gatewayName) => {
    if (!window.confirm('Tem certeza que deseja deletar esta configuração?')) {
      return;
    }

    try {
      const response = await api.delete(
        `/admin/gateway-config/${gatewayName}`
      );

      if (response.data.success) {
        toast.success('Configuração deletada com sucesso!');
        loadData();
      } else {
        toast.error(response.data.error || 'Erro ao deletar configuração');
      }
    } catch (error) {
      console.error('Erro ao deletar configuração:', error);
      toast.error(error.response?.data?.error || 'Erro ao deletar configuração');
    }
  };

  const toggleSecretVisibility = (field) => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const getGatewayDisplayName = (gatewayName) => {
    const gateway = supportedGateways.find(g => g.name === gatewayName);
    return gateway ? gateway.display_name : gatewayName;
  };

  const getGatewayDescription = (gatewayName) => {
    const gateway = supportedGateways.find(g => g.name === gatewayName);
    return gateway ? gateway.description : '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Configuração de Gateways</h1>
        <p className="text-gray-400">Gerencie as configurações dos gateways de pagamento</p>
      </div>

      {/* Gateway Ativo */}
      {activeConfig && (
        <div className="bg-green-900 border border-green-700 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <FaCheckCircle className="text-green-400 text-xl mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-white">
                Gateway Ativo: {getGatewayDisplayName(activeConfig.gateway_name)}
              </h3>
              <p className="text-green-200">
                {getGatewayDescription(activeConfig.gateway_name)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Configurações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {configs.map((config) => (
          <div key={config.gateway_name} className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FaCreditCard className="text-blue-400 text-xl mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {getGatewayDisplayName(config.gateway_name)}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {getGatewayDescription(config.gateway_name)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {config.is_active ? (
                  <FaCheckCircle className="text-green-400" />
                ) : (
                  <FaTimesCircle className="text-gray-400" />
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status:</span>
                <span className={config.is_active ? 'text-green-400' : 'text-gray-400'}>
                  {config.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Modo:</span>
                <span className={config.sandbox_mode ? 'text-yellow-400' : 'text-green-400'}>
                  {config.sandbox_mode ? 'Teste' : 'Produção'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Métodos:</span>
                <span className="text-white">
                  {Array.isArray(config.supported_methods) 
                    ? config.supported_methods.join(', ').toUpperCase()
                    : 'PIX'
                  }
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEditConfig(config)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center"
              >
                <FaCog className="mr-2" />
                Configurar
              </button>
              <button
                onClick={() => handleToggleGateway(config.gateway_name, !config.is_active)}
                className={`flex-1 px-3 py-2 rounded text-sm flex items-center justify-center ${
                  config.is_active
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {config.is_active ? (
                  <>
                    <FaStop className="mr-2" />
                    Desativar
                  </>
                ) : (
                  <>
                    <FaPlay className="mr-2" />
                    Ativar
                  </>
                )}
              </button>
            </div>

            <div className="flex space-x-2 mt-2">
              <button
                onClick={() => handleTestConnection(config.gateway_name)}
                disabled={testing[config.gateway_name]}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm flex items-center justify-center"
              >
                {testing[config.gateway_name] ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaFlask className="mr-2" />
                )}
                Testar
              </button>
              <button
                onClick={() => handleDeleteConfig(config.gateway_name)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center"
              >
                <FaTrash className="mr-2" />
                Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Adicionar Novos Gateways */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Adicionar Novo Gateway</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supportedGateways
            .filter(gateway => !configs.some(config => config.gateway_name === gateway.name))
            .map((gateway) => (
              <div key={gateway.name} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <FaCreditCard className="text-blue-400 text-lg mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-white">{gateway.display_name}</h3>
                    <p className="text-gray-400 text-sm">{gateway.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleNewConfig(gateway.name)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
                >
                  Configurar {gateway.display_name}
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Modal de Configuração */}
      {editingConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Configurar {getGatewayDisplayName(editingConfig)}
                </h2>
                <button
                  onClick={() => setEditingConfig(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimesCircle className="text-xl" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveConfig(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Configurações Básicas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Configurações Básicas</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ativo
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-300">Gateway ativo</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Modo Sandbox
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.sandbox_mode}
                          onChange={(e) => setFormData(prev => ({ ...prev, sandbox_mode: e.target.checked }))}
                          className="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-300">Modo de teste</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.api_key ? 'text' : 'password'}
                          value={formData.api_key}
                          onChange={(e) => setFormData(prev => ({ ...prev, api_key: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                          placeholder="Sua chave de API"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility('api_key')}
                          className="absolute right-3 top-2 text-gray-400 hover:text-white"
                        >
                          {showSecrets.api_key ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Chave Pública
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.public_key ? 'text' : 'password'}
                          value={formData.public_key}
                          onChange={(e) => setFormData(prev => ({ ...prev, public_key: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                          placeholder="Sua chave pública"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility('public_key')}
                          className="absolute right-3 top-2 text-gray-400 hover:text-white"
                        >
                          {showSecrets.public_key ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Webhook Secret
                      </label>
                      <div className="relative">
                        <input
                          type={showSecrets.webhook_secret ? 'text' : 'password'}
                          value={formData.webhook_secret}
                          onChange={(e) => setFormData(prev => ({ ...prev, webhook_secret: e.target.value }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                          placeholder="Seu webhook secret"
                        />
                        <button
                          type="button"
                          onClick={() => toggleSecretVisibility('webhook_secret')}
                          className="absolute right-3 top-2 text-gray-400 hover:text-white"
                        >
                          {showSecrets.webhook_secret ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Base URL
                      </label>
                      <input
                        type="url"
                        value={formData.base_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, base_url: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://api.gateway.com"
                      />
                    </div>
                  </div>

                  {/* Configurações de PIX */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Configurações PIX</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Chave PIX
                      </label>
                      <input
                        type="text"
                        value={formData.pix_key}
                        onChange={(e) => setFormData(prev => ({ ...prev, pix_key: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="sua-chave-pix@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Tipo da Chave PIX
                      </label>
                      <select
                        value={formData.pix_key_type}
                        onChange={(e) => setFormData(prev => ({ ...prev, pix_key_type: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="email">Email</option>
                        <option value="cpf">CPF</option>
                        <option value="telefone">Telefone</option>
                        <option value="aleatoria">Aleatória</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Webhook URL
                      </label>
                      <input
                        type="url"
                        value={formData.webhook_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://seudominio.com/api/payments/webhook/vizzionpay"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Redirect URL
                      </label>
                      <input
                        type="url"
                        value={formData.redirect_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, redirect_url: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://seudominio.com/dashboard"
                      />
                    </div>
                  </div>

                  {/* Limites e Taxas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Limites e Taxas</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Min. Depósito (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.min_deposit}
                          onChange={(e) => setFormData(prev => ({ ...prev, min_deposit: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Max. Depósito (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.max_deposit}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_deposit: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Min. Saque (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.min_withdraw}
                          onChange={(e) => setFormData(prev => ({ ...prev, min_withdraw: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Max. Saque (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.max_withdraw}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_withdraw: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Taxa Depósito (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.deposit_fee}
                          onChange={(e) => setFormData(prev => ({ ...prev, deposit_fee: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Taxa Saque (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.withdraw_fee}
                          onChange={(e) => setFormData(prev => ({ ...prev, withdraw_fee: parseFloat(e.target.value) }))}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Timeouts */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Timeouts</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Timeout Depósito (segundos)
                      </label>
                      <input
                        type="number"
                        min="60"
                        value={formData.deposit_timeout}
                        onChange={(e) => setFormData(prev => ({ ...prev, deposit_timeout: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Timeout Saque (segundos)
                      </label>
                      <input
                        type="number"
                        min="60"
                        value={formData.withdraw_timeout}
                        onChange={(e) => setFormData(prev => ({ ...prev, withdraw_timeout: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setEditingConfig(null)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-md flex items-center"
                  >
                    {saving ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaSave className="mr-2" />
                    )}
                    Salvar Configuração
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GatewayConfig;
