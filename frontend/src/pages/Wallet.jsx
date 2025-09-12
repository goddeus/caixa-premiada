import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { FaWallet, FaArrowUp, FaArrowDown, FaCopy, FaQrcode, FaBarcode, FaCreditCard } from 'react-icons/fa';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixKeyType, setPixKeyType] = useState('cpf');
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [depositMethod, setDepositMethod] = useState('pix');
  const [paymentData, setPaymentData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      const response = await api.get('/wallet');
      setBalance(response.data.saldo);
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
      toast.error('Erro ao carregar saldo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) < 20) {
      toast.error('Valor mínimo para depósito é R$ 20,00');
      return;
    }

    if (parseFloat(depositAmount) > 10000) {
      toast.error('Valor máximo para depósito é R$ 10.000,00');
      return;
    }

    try {
      setLoading(true);
      const endpoint = '/payments/deposit'; // Endpoint unificado
      const response = await api.post(endpoint, { valor: parseFloat(depositAmount) });
      
      setPaymentData(response.data);
      setShowPaymentModal(true);
      setShowDepositForm(false);
      toast.success('Pagamento criado com sucesso!');
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao criar depósito';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) < 20) {
      toast.error('Valor mínimo para saque é R$ 20,00');
      return;
    }

    if (parseFloat(withdrawAmount) > 5000) {
      toast.error('Valor máximo para saque é R$ 5.000,00');
      return;
    }

    if (!pixKey) {
      toast.error('Chave PIX é obrigatória');
      return;
    }

    if (parseFloat(withdrawAmount) > balance) {
      toast.error('Saldo insuficiente');
      return;
    }

    try {
      setLoading(true);
      await api.post('/payments/withdraw/pix', { 
        valor: parseFloat(withdrawAmount),
        pix_key: pixKey,
        pix_key_type: pixKeyType
      });
      toast.success('Saque solicitado com sucesso!');
      setWithdrawAmount('');
      setPixKey('');
      setShowWithdrawForm(false);
      loadBalance();
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao fazer saque';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  if (loading && balance === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          💰 Carteira
        </h1>
        <p className="text-gray-400">
          Gerencie seus fundos
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Saldo Disponível</h2>
            <p className="text-3xl font-bold text-white">
              R$ {parseFloat(balance).toFixed(2)}
            </p>
          </div>
          <FaWallet className="text-6xl text-white opacity-80" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          onClick={() => setShowDepositForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
        >
          <FaArrowUp className="mr-2" />
          Fazer Depósito
        </button>
        
        <button
          onClick={() => setShowWithdrawForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
        >
          <FaArrowDown className="mr-2" />
          Fazer Saque
        </button>
      </div>

      {/* Deposit Form Modal */}
      {showDepositForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Fazer Depósito</h3>
            
            <form onSubmit={handleDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Método de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDepositMethod('pix')}
                    className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                      depositMethod === 'pix' 
                        ? 'border-green-500 bg-green-500/20 text-green-400' 
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <FaQrcode className="mr-2" />
                    PIX
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositMethod('boleto')}
                    className={`p-3 rounded-lg border-2 transition-colors flex items-center justify-center ${
                      depositMethod === 'boleto' 
                        ? 'border-green-500 bg-green-500/20 text-green-400' 
                        : 'border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <FaBarcode className="mr-2" />
                    Boleto
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="20"
                  max="10000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="20.00"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Mínimo: R$ 20,00 | Máximo: R$ 10.000,00
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Criar Pagamento'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDepositForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Form Modal */}
      {showWithdrawForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Fazer Saque</h3>
            
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={balance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Chave PIX
                </label>
                <select
                  value={pixKeyType}
                  onChange={(e) => setPixKeyType(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cpf">CPF</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chave PIX
                </label>
                <input
                  type="text"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    pixKeyType === 'cpf' ? '000.000.000-00' :
                    pixKeyType === 'email' ? 'seu@email.com' :
                    pixKeyType === 'phone' ? '(00) 00000-0000' :
                    'Chave aleatória'
                  }
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processando...' : 'Confirmar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowWithdrawForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && paymentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Pagamento Criado</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-white mb-2">Valor</h4>
                <p className="text-2xl font-bold text-green-400">
                  R$ {paymentData.valor?.toFixed(2)}
                </p>
              </div>

              {paymentData.qr_code && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">QR Code PIX</h4>
                  <div className="flex justify-center mb-3">
                    <img 
                      src={paymentData.qr_code} 
                      alt="QR Code PIX" 
                      className="w-48 h-48 border border-gray-600 rounded"
                    />
                  </div>
                  <p className="text-sm text-gray-300 text-center">
                    Escaneie o QR Code com seu app bancário
                  </p>
                </div>
              )}

              {paymentData.pix_copy_paste && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Código PIX</h4>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={paymentData.pix_copy_paste}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(paymentData.pix_copy_paste)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors"
                    >
                      <FaCopy />
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 mt-2">
                    Copie e cole no seu app bancário
                  </p>
                </div>
              )}

              {paymentData.boleto_url && (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Boleto Bancário</h4>
                  <div className="space-y-3">
                    <a
                      href={paymentData.boleto_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors"
                    >
                      Abrir Boleto
                    </a>
                    {paymentData.boleto_barcode && (
                      <div>
                        <p className="text-sm text-gray-300 mb-2">Código de Barras:</p>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={paymentData.boleto_barcode}
                            readOnly
                            className="flex-1 px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white text-sm"
                          />
                          <button
                            onClick={() => copyToClipboard(paymentData.boleto_barcode)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors"
                          >
                            <FaCopy />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentData.expires_at && (
                <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg p-4">
                  <p className="text-yellow-400 text-sm">
                    ⏰ Este pagamento expira em: {new Date(paymentData.expires_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              )}

              <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-4">
                <p className="text-blue-400 text-sm">
                  💡 Após o pagamento, seu saldo será creditado automaticamente
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentData(null);
                  loadBalance();
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Info */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Informações Importantes</h3>
        <div className="space-y-3 text-gray-300">
          <p>• Depósitos PIX são processados instantaneamente</p>
          <p>• Boletos são processados em até 3 dias úteis</p>
          <p>• Saques são processados em até 24 horas</p>
          <p>• Valor mínimo para depósito: R$ 20,00</p>
          <p>• Valor mínimo para saque: R$ 20,00</p>
          <p>• Valor máximo para depósito: R$ 10.000,00</p>
          <p>• Valor máximo para saque: R$ 5.000,00</p>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
