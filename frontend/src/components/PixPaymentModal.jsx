import { useState, useEffect } from 'react';
import { FaCopy, FaQrcode, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

const PixPaymentModal = ({ isOpen, onClose, paymentData, onPaymentComplete }) => {
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (paymentData?.expires_at) {
      const expiryTime = new Date(paymentData.expires_at).getTime();
      const now = new Date().getTime();
      const timeDiff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(timeDiff);
    }
  }, [paymentData]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Erro ao copiar código PIX');
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentData?.payment_id) return;
    
    setIsChecking(true);
    try {
      const response = await fetch(`https://slotbox-api.onrender.com/api/payments/status/${paymentData.payment_id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setPaymentStatus(data.payment.status);
        if (data.payment.status === 'concluido') {
          toast.success('Pagamento confirmado!');
          onPaymentComplete?.();
        }
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !paymentData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <FaQrcode className="text-green-400 text-xl" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Pagamento PIX</h3>
              <p className="text-sm text-gray-400">Escaneie o QR Code ou copie o código</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaTimes className="text-gray-400" />
          </button>
        </div>

        {/* Valor */}
        <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 mb-6 border border-green-500/30">
          <div className="text-center">
            <p className="text-sm text-gray-300 mb-1">Valor a pagar</p>
            <p className="text-3xl font-bold text-white">
              R$ {paymentData.valor?.toFixed(2)}
            </p>
          </div>
        </div>

        {/* QR Code */}
        {paymentData.qr_base64 ? (
          <div className="bg-white rounded-lg p-4 mb-6 text-center">
            <img 
              src={paymentData.qr_base64.includes('data:image') ? paymentData.qr_base64 : `data:image/png;base64,${paymentData.qr_base64}`}
              alt="QR Code PIX" 
              className="w-48 h-48 mx-auto border border-gray-200 rounded"
            />
            <p className="text-sm text-gray-600 mt-2">
              Escaneie com seu app bancário
            </p>
          </div>
        ) : (
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-6 text-center">
            <p className="text-yellow-400 font-medium">
              ⚠️ QR Code não disponível
            </p>
            <p className="text-sm text-yellow-300 mt-1">
              Use o código PIX abaixo para pagar
            </p>
          </div>
        )}

        {/* Código PIX Copy Paste */}
        {paymentData.qr_text && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Código PIX (Copiar e Colar)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={paymentData.qr_text}
                readOnly
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm font-mono"
              />
              <button
                onClick={() => copyToClipboard(paymentData.qr_text)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  copied 
                    ? 'bg-green-600 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copied ? <FaCheck /> : <FaCopy />}
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        )}

        {/* Status e Timer */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              paymentStatus === 'concluido' ? 'bg-green-500' :
              paymentStatus === 'expirado' ? 'bg-red-500' :
              'bg-yellow-500 animate-pulse'
            }`} />
            <span className="text-sm text-gray-300">
              {paymentStatus === 'concluido' ? 'Pago' :
               paymentStatus === 'expirado' ? 'Expirado' :
               'Aguardando pagamento'}
            </span>
          </div>
          
          {timeLeft > 0 && (
            <div className="text-sm text-gray-400">
              Expira em: <span className="font-mono text-yellow-400">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex gap-3">
          <button
            onClick={checkPaymentStatus}
            disabled={isChecking || paymentStatus === 'concluido'}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isChecking ? (
              <>
                <FaSpinner className="animate-spin" />
                Verificando...
              </>
            ) : (
              'Verificar Pagamento'
            )}
          </button>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>

        {/* Instruções */}
        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <h4 className="text-sm font-semibold text-blue-400 mb-2">Como pagar:</h4>
          <ol className="text-xs text-gray-300 space-y-1">
            <li>1. Abra seu app bancário</li>
            <li>2. Escolha "PIX" ou "Pagar"</li>
            <li>3. Escaneie o QR Code ou cole o código</li>
            <li>4. Confirme o pagamento</li>
            <li>5. Aguarde a confirmação automática</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PixPaymentModal;
