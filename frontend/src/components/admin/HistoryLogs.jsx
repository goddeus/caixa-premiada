import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FaHistory, FaFileAlt, FaSearch, FaCalendarAlt } from 'react-icons/fa';

const HistoryLogs = ({ showLogs = false }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    if (showLogs) {
      loadLogs();
    } else {
      loadLoginHistory();
    }
  }, [showLogs, searchTerm, dateFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        acao: searchTerm,
        start_date: dateFilter
      });

      const response = await api.get(`/admin/logs?${params}`);
      setData(response.data.data.logs || []);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast.error('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const loadLoginHistory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        start_date: dateFilter
      });

      const response = await api.get(`/admin/login-history?${params}`);
      setData(response.data.data.loginHistory || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast.error('Erro ao carregar histórico');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {showLogs ? 'Logs do Sistema' : 'Histórico de Login'}
        </h1>
        <p className="text-gray-400 mt-1">
          {showLogs ? 'Registro de atividades administrativas' : 'Histórico de acessos dos usuários'}
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex space-x-4 mb-6">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={showLogs ? "Buscar por ação..." : "Buscar por usuário..."}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2">
            <FaCalendarAlt className="text-gray-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                {showLogs ? (
                  <>
                    <th className="text-left text-gray-400 py-2">Admin</th>
                    <th className="text-left text-gray-400 py-2">Ação</th>
                    <th className="text-left text-gray-400 py-2">Descrição</th>
                    <th className="text-left text-gray-400 py-2">Data</th>
                  </>
                ) : (
                  <>
                    <th className="text-left text-gray-400 py-2">Usuário</th>
                    <th className="text-left text-gray-400 py-2">IP</th>
                    <th className="text-left text-gray-400 py-2">Sucesso</th>
                    <th className="text-left text-gray-400 py-2">Data</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="py-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div></td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan="4" className="py-8 text-center text-gray-400">Nenhum registro encontrado</td></tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700">
                    {showLogs ? (
                      <>
                        <td className="py-2 text-white">{item.admin_id}</td>
                        <td className="py-2 text-blue-400">{item.acao}</td>
                        <td className="py-2 text-gray-300">{item.descricao}</td>
                        <td className="py-2 text-gray-300">{formatDate(item.criado_em)}</td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 text-white">{item.user?.nome}</td>
                        <td className="py-2 text-gray-300">{item.ip_address}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.sucesso ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.sucesso ? 'Sucesso' : 'Falha'}
                          </span>
                        </td>
                        <td className="py-2 text-gray-300">{formatDate(item.criado_em)}</td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoryLogs;
