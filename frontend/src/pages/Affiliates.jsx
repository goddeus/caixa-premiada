import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const Affiliates = () => {
  const { user, isAuthenticated } = useAuth();
  const [affiliateData, setAffiliateData] = useState(null);
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawData, setWithdrawData] = useState({
    valor: '20,00',
    pix_key: '',
    pix_key_type: 'random'
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchAffiliateData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchAffiliateData = async () => {
    try {
      const [affiliateResponse, statsResponse, referralsResponse] = await Promise.all([
        api.get('/affiliate/me'),
        api.get('/affiliate/stats'),
        api.get('/affiliate/referrals')
      ]);
      
      setAffiliateData(affiliateResponse.data);
      setStats(statsResponse.data);
      setReferrals(referralsResponse.data?.referrals || []);
    } catch (error) {
      console.error('Erro ao buscar dados do afiliado:', error);
      toast.error('Erro ao carregar dados do afiliado');
    } finally {
      setLoading(false);
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

  const handleWithdrawAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9,]/g, '');
    if (value === '') {
      setWithdrawData(prev => ({ ...prev, valor: '20,00' }));
      return;
    }
    if (!value.includes(',')) {
      value += ',00';
    }
    setWithdrawData(prev => ({ ...prev, valor: value }));
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    
    if (parseFloat(withdrawData.valor.replace(',', '.')) < 20) {
      toast.error('Valor mínimo para saque é R$ 20,00');
      return;
    }

    if (!withdrawData.pix_key) {
      toast.error('Chave PIX é obrigatória');
      return;
    }

    setWithdrawLoading(true);
    try {
      const response = await api.post('/affiliate/withdraw', {
        valor: parseFloat(withdrawData.valor.replace(',', '.')),
        pix_key: withdrawData.pix_key,
        pix_key_type: withdrawData.pix_key_type
      });

      toast.success('Solicitação de saque enviada com sucesso!');
      setShowWithdrawModal(false);
      setWithdrawData({ valor: '20,00', pix_key: '', pix_key_type: 'random' });
      fetchAffiliateData(); // Atualizar dados
    } catch (error) {
      const message = error.response?.data?.error || 'Erro ao solicitar saque';
      toast.error(message);
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E1015] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mb-6"></div>
          <h1 className="text-2xl font-bold text-yellow-400 mb-2">Carregando...</h1>
          <p className="text-gray-400">Aguarde enquanto carregamos seus dados de afiliado.</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0E1015] flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Acesso Restrito</h1>
            <p className="text-gray-400 mb-6">Você precisa estar logado para acessar esta página.</p>
            <button 
              onClick={() => window.location.href = '/register'}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200"
            >
              Criar Conta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E1015]">
      {/* Header */}
      <header className="border-b border-[#212630] bg-[#0E1015]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xl">💎</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Programa de Afiliados</h1>
                <p className="text-gray-400 text-sm">Ganhe indicando amigos</p>
              </div>
            </div>
            <button 
              onClick={() => window.history.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {affiliateData && (
          <div className="space-y-6">
            {/* Card Principal */}
            <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">💎 Indique e Ganhe</h2>
                <p className="text-gray-300 text-sm">
                  Convide amigos e ganhe <span className="font-bold text-yellow-400">R$10,00</span> por cada indicado que se cadastrar e realizar o depósito mínimo de <span className="font-bold text-yellow-400">R$20,00</span>.
                </p>
              </div>

              {/* Link de Indicação */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">Seu link único:</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={affiliateData.link}
                    readOnly
                    className="flex-1 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm font-mono"
                  />
                  <button
                    onClick={copyAffiliateLink}
                    className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                    </svg>
                    Copiar
                  </button>
                </div>
              </div>
            </div>

            {/* Estatísticas */}
            {stats && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="text-yellow-400 font-bold text-2xl">R$ {stats.ganhos?.toFixed(2) || '0.00'}</div>
                  <div className="text-gray-400 text-sm">Ganhos Totais</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="text-green-400 font-bold text-2xl">{stats.total_indicados || 0}</div>
                  <div className="text-gray-400 text-sm">Total Indicados</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="text-blue-400 font-bold text-2xl">{stats.indicados_com_deposito || 0}</div>
                  <div className="text-gray-400 text-sm">Com Depósito</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                  <div className="text-purple-400 font-bold text-2xl">R$ {stats.total_depositos?.toFixed(2) || '0.00'}</div>
                  <div className="text-gray-400 text-sm">Volume Total</div>
                </div>
              </div>
            )}

            {/* Botão de Saque */}
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Saldo Disponível</h3>
                  <p className="text-2xl font-bold text-yellow-400">R$ {affiliateData.ganhos?.toFixed(2) || '0.00'}</p>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  Solicitar Saque
                </button>
              </div>
            </div>

            {/* Usuários Indicados */}
            {referrals && referrals.length > 0 && (
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Usuários Indicados</h3>
                <div className="space-y-3">
                  {referrals.slice(0, 10).map((referral, index) => (
                    <div key={index} className="p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-white font-medium">{referral.usuario?.nome || 'Usuário'}</p>
                          <p className="text-gray-400 text-sm">ID: {referral.id}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          referral.deposito_valido 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {referral.deposito_valido ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Valor Depositado:</p>
                          <p className="text-white font-medium">
                            {referral.valor_deposito ? `R$ ${referral.valor_deposito.toFixed(2)}` : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Data e Hora:</p>
                          <p className="text-white font-medium">
                            {new Date(referral.data_indicacao).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      
                      {referral.comissao_gerada && (
                        <div className="mt-2 pt-2 border-t border-slate-600">
                          <p className="text-gray-400 text-sm">Comissão Gerada:</p>
                          <p className="text-green-400 font-medium">R$ {referral.comissao_gerada.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {referrals.length > 10 && (
                  <div className="mt-4 text-center">
                    <p className="text-gray-400 text-sm">
                      Mostrando 10 de {referrals.length} indicações
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {/* Mensagem quando não há indicações */}
            {referrals && referrals.length === 0 && (
              <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Usuários Indicados</h3>
                <p className="text-gray-400">Nenhum usuário indicado ainda.</p>
                <p className="text-gray-500 text-sm mt-2">
                  Compartilhe seu link de afiliado para começar a ganhar comissões!
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Saque */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gradient-to-t from-purple-500 from-[-60%] via-[5%] to-100% via-slate-900 to-slate-900 animate-in fade-in-0 zoom-in-95 w-full max-w-md mx-auto rounded-lg border shadow-lg duration-200 outline-none overflow-auto max-h-[90vh]">
            <div className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" className="size-6 text-white">
                  <path d="M22 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9h3a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1ZM7 20v-2a2 2 0 0 1 2 2Zm10 0h-2a2 2 0 0 1 2-2Zm0-4a4 4 0 0 0-4 4h-2a4 4 0 0 0-4-4V8h10Zm4-6h-2V7a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v3H3V4h18Zm-9 5a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0-4a1 1 0 1 1-1 1 1 1 0 0 1 1-1Z"></path>
                </svg>
                <h1 className="text-xl font-medium text-white">Solicitar Saque</h1>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Valor:</label>
                  <div className="relative">
                    <span className="font-semibold opacity-80 absolute left-3 top-2/4 -translate-y-2/4 text-white">R$</span>
                    <input
                      type="text"
                      value={withdrawData.valor}
                      onChange={handleWithdrawAmountChange}
                      className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="20,00"
                    />
                  </div>
                  {parseFloat(withdrawData.valor.replace(',', '.')) < 20 && withdrawData.valor !== '' && (
                    <p className="text-red-400 text-xs mt-1">Valor mínimo: R$ 20,00</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Chave PIX:</label>
                  <div className="flex flex-col space-y-2">
                    <select
                      value={withdrawData.pix_key_type}
                      onChange={(e) => setWithdrawData(prev => ({ ...prev, pix_key_type: e.target.value }))}
                      className="border border-slate-600 bg-slate-800 text-white px-3 py-2 rounded-lg text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    >
                      <option value="phone">Telefone</option>
                      <option value="email">Email</option>
                      <option value="cpf">CPF</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="random">Chave aleatória</option>
                    </select>
                    <input
                      type="text"
                      value={withdrawData.pix_key}
                      onChange={(e) => setWithdrawData(prev => ({ ...prev, pix_key: e.target.value }))}
                      placeholder="Digite sua chave PIX..."
                      className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2"
                  disabled={withdrawLoading}
                >
                  {withdrawLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Solicitar Saque'
                  )}
                </button>
              </form>
            </div>
            
            <button 
              type="button" 
              className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
              onClick={() => setShowWithdrawModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Affiliates;