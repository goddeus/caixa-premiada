import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const PrizeManagement = () => {
  const [loading, setLoading] = useState(false);
  const [auditStats, setAuditStats] = useState(null);
  const [normalizationStats, setNormalizationStats] = useState(null);
  const [auditHistory, setAuditHistory] = useState([]);
  const [selectedCase, setSelectedCase] = useState('');
  const [cases, setCases] = useState([]);

  useEffect(() => {
    loadStats();
    loadCases();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      const [auditResponse, normalizationResponse] = await Promise.all([
        api.get('/api/admin/prize-audit/stats'),
        api.get('/api/admin/prize-audit/normalization-stats')
      ]);

      setAuditStats(auditResponse.data.data);
      setNormalizationStats(normalizationResponse.data.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const loadCases = async () => {
    try {
      const response = await api.get('/cases');
      setCases(response.data.cases);
    } catch (error) {
      console.error('Erro ao carregar caixas:', error);
      toast.error('Erro ao carregar caixas');
    }
  };

  const runFullAudit = async () => {
    try {
      setLoading(true);
      toast.info('Executando auditoria completa...');
      
      const response = await api.post('/api/admin/prize-audit/run');
      
      if (response.data.success) {
        toast.success('Auditoria executada com sucesso!');
        await loadStats();
      } else {
        toast.error('Erro na auditoria');
      }
    } catch (error) {
      console.error('Erro na auditoria:', error);
      toast.error('Erro ao executar auditoria');
    } finally {
      setLoading(false);
    }
  };

  const normalizePrizes = async () => {
    try {
      setLoading(true);
      toast.info('Normalizando nomes de prêmios...');
      
      const response = await api.post('/api/admin/prize-audit/normalize');
      
      if (response.data.success) {
        toast.success('Normalização executada com sucesso!');
        await loadStats();
      } else {
        toast.error('Erro na normalização');
      }
    } catch (error) {
      console.error('Erro na normalização:', error);
      toast.error('Erro ao normalizar prêmios');
    } finally {
      setLoading(false);
    }
  };

  const auditSpecificCase = async () => {
    if (!selectedCase) {
      toast.error('Selecione uma caixa');
      return;
    }

    try {
      setLoading(true);
      toast.info(`Auditando caixa ${selectedCase}...`);
      
      const response = await api.post(`/api/admin/prize-audit/case/${selectedCase}`);
      
      if (response.data.success) {
        toast.success('Auditoria da caixa executada com sucesso!');
        await loadStats();
      } else {
        toast.error('Erro na auditoria da caixa');
      }
    } catch (error) {
      console.error('Erro na auditoria da caixa:', error);
      toast.error('Erro ao auditar caixa');
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Gerenciamento de Prêmios</h2>
        
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600">Total de Prêmios</h3>
            <p className="text-2xl font-bold text-blue-900">
              {auditStats?.total_prizes || 0}
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-600">Prêmios Ilustrativos</h3>
            <p className="text-2xl font-bold text-purple-900">
              {auditStats?.illustrative_prizes || 0}
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-orange-600">Alto Valor (&gt; R$ 5.000)</h3>
            <p className="text-2xl font-bold text-orange-900">
              {auditStats?.high_value_prizes || 0}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-600">Score de Saúde</h3>
            <p className={`text-2xl font-bold ${getHealthScoreColor(auditStats?.health_score || 0)}`}>
              {auditStats?.health_score?.toFixed(1) || 0}%
            </p>
          </div>
        </div>

        {/* Estatísticas de Normalização */}
        {normalizationStats && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Estatísticas de Normalização</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Prêmios de Alto Valor</p>
                <p className="text-xl font-bold text-gray-900">{normalizationStats.high_value_prizes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Marcados como Ilustrativos</p>
                <p className="text-xl font-bold text-gray-900">{normalizationStats.illustrative_prizes}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Precisam de Normalização</p>
                <p className="text-xl font-bold text-red-600">{normalizationStats.normalization_needed}</p>
              </div>
            </div>
          </div>
        )}

        {/* Ações de Auditoria */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Ações de Auditoria</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={runFullAudit}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Executar Auditoria Completa
                </>
              )}
            </button>

            <button
              onClick={normalizePrizes}
              disabled={loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Normalizar Nomes de Prêmios
                </>
              )}
            </button>
          </div>

          {/* Auditoria de Caixa Específica */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-semibold text-gray-900 mb-3">Auditoria de Caixa Específica</h4>
            <div className="flex gap-4">
              <select
                value={selectedCase}
                onChange={(e) => setSelectedCase(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma caixa</option>
                {cases.map((caseItem) => (
                  <option key={caseItem.id} value={caseItem.id}>
                    {caseItem.nome} - R$ {caseItem.preco}
                  </option>
                ))}
              </select>
              <button
                onClick={auditSpecificCase}
                disabled={loading || !selectedCase}
                className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Auditar Caixa
              </button>
            </div>
          </div>
        </div>

        {/* Informações Importantes */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-md font-semibold text-yellow-800 mb-2">⚠️ Informações Importantes</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Prêmios acima de R$ 5.000 são automaticamente marcados como <strong>ilustrativos</strong></li>
            <li>• Prêmios ilustrativos <strong>nunca são sorteados</strong>, apenas exibidos na vitrine</li>
            <li>• A auditoria corrige automaticamente inconsistências de nomes e valores</li>
            <li>• O sistema valida todos os prêmios antes de creditá-los</li>
            <li>• Logs detalhados são salvos em <code>logs/auditoria-premios.log</code></li>
          </ul>
        </div>

        {/* Status do Sistema */}
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="text-md font-semibold text-green-800 mb-2">✅ Status do Sistema</h4>
          <div className="text-sm text-green-700 space-y-1">
            <p>• Sistema de validação de prêmios: <strong>ATIVO</strong></p>
            <p>• Auditoria automática: <strong>ATIVA</strong></p>
            <p>• Filtro de prêmios ilustrativos: <strong>ATIVO</strong></p>
            <p>• Logs de auditoria: <strong>ATIVOS</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizeManagement;
