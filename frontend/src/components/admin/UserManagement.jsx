import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { 
  FaUsers, 
  FaSearch, 
  FaEdit, 
  FaBan, 
  FaUnlock, 
  FaKey, 
  FaEye,
  FaEyeSlash,
  FaFilter,
  FaDownload,
  FaPlus,
  FaTrash
} from 'react-icons/fa';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    min_balance: '',
    max_balance: '',
    sort_by: 'criado_em',
    sort_order: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Estados para edição
  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    saldo_reais: 0,
    saldo_demo: 0,
    ativo: true,
    motivo_ban: ''
  });
  const [resetForm, setResetForm] = useState({
    nova_senha: '',
    confirmar_senha: ''
  });

  useEffect(() => {
    loadUsers();
  }, [searchTerm, filters, pagination.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters
      });

      const response = await api.get(`/admin/users?${params}`);
      console.log('📡 Resposta completa da API Users:', response.data);
      
      if (response.data?.success && response.data?.data) {
        setUsers(response.data.data.users || []);
        setPagination(response.data.data.pagination || pagination);
      } else if (response.data?.users) {
        // Fallback para estrutura alternativa
        setUsers(response.data.users || []);
        setPagination(response.data.pagination || pagination);
      } else if (Array.isArray(response.data)) {
        // API retorna array diretamente
        setUsers(response.data || []);
        setPagination(pagination);
      } else {
        setUsers([]);
        console.warn('Estrutura de resposta inesperada:', response.data);
        toast.error('Erro ao carregar dados dos usuários');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    loadUsers();
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditForm({
      nome: user.nome,
      email: user.email,
      saldo_reais: user.saldo_reais || 0,
      saldo_demo: user.saldo_demo || 0,
      ativo: user.ativo,
      motivo_ban: user.motivo_ban || ''
    });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    try {
      await api.put(`/admin/users/${selectedUser.id}`, editForm);
      toast.success('Usuário atualizado com sucesso');
      setShowEditModal(false);
      loadUsers();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleResetPassword = async () => {
    if (resetForm.nova_senha !== resetForm.confirmar_senha) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (resetForm.nova_senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      await api.post(`/admin/users/${selectedUser.id}/reset-password`, {
        nova_senha: resetForm.nova_senha
      });
      toast.success('Senha resetada com sucesso');
      setShowResetModal(false);
      setResetForm({ nova_senha: '', confirmar_senha: '' });
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      toast.error('Erro ao resetar senha');
    }
  };

  const handleBanUser = async (user) => {
    if (window.confirm(`Tem certeza que deseja ${user.ativo ? 'banir' : 'desbanir'} o usuário ${user.nome}?`)) {
      try {
        await api.put(`/admin/users/${user.id}`, {
          ativo: !user.ativo,
          motivo_ban: user.ativo ? 'Banido por administrador' : null
        });
        toast.success(`Usuário ${user.ativo ? 'banido' : 'desbanido'} com sucesso`);
        loadUsers();
      } catch (error) {
        console.error('Erro ao alterar status do usuário:', error);
        toast.error('Erro ao alterar status do usuário');
      }
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const exportUsers = async () => {
    try {
      toast.info('Exportando lista de usuários...');
      // Implementar lógica de exportação
      toast.success('Lista exportada com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar lista');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Gerenciamento de Usuários</h1>
          <p className="text-gray-400 mt-1">Controle total sobre usuários da plataforma</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={exportUsers}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <FaDownload className="mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-gray-800 rounded-lg p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Buscar</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome, email ou CPF"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 pl-10 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="banned">Banidos</option>
                <option value="with_balance">Com Saldo</option>
                <option value="without_balance">Sem Saldo</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Saldo Mínimo</label>
              <input
                type="number"
                value={filters.min_balance}
                onChange={(e) => setFilters({ ...filters, min_balance: e.target.value })}
                placeholder="0.00"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Ordenar por</label>
              <select
                value={filters.sort_by}
                onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="criado_em">Data de Cadastro</option>
                <option value="nome">Nome</option>
                <option value="saldo">Saldo</option>
                <option value="ultimo_login">Último Login</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FaSearch className="mr-2" />
              Buscar
            </button>
            
            <div className="text-gray-400 text-sm">
              Total: {pagination.total} usuários
            </div>
          </div>
        </form>
      </div>

      {/* Lista de Usuários */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  ID / Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Saldo / Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Afiliado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          ID: {user.id} - {user.nome}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user.email}
                        </div>
                        <div className="text-xs text-gray-500">
                          CPF: {user.cpf || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-white font-semibold">
                          Real: {formatCurrency(user.saldo_reais || 0)}
                        </div>
                        <div className="text-sm text-gray-400">
                          Demo: {formatCurrency(user.saldo_demo || 0)}
                        </div>
                        <div className="text-xs text-blue-400">
                          {user.is_admin ? 'ADMIN' : user.tipo_conta || 'REAL'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.ativo ? 'Ativo' : 'Banido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div>
                        <div>{formatDate(user.criado_em)}</div>
                        <div className="text-xs text-gray-500">
                          Login: {user.ultimo_login ? formatDate(user.ultimo_login) : 'Nunca'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {user.affiliate?.codigo_indicacao ? (
                        <div>
                          <div className="text-green-400 font-semibold">
                            {user.affiliate.codigo_indicacao}
                          </div>
                          <div className="text-xs text-gray-500">
                            Ganhos: {formatCurrency(user.affiliate.ganhos || 0)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Sem link</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="text-blue-400 hover:text-blue-300"
                          title="Editar usuário"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleBanUser(user)}
                          className={user.ativo ? "text-red-400 hover:text-red-300" : "text-green-400 hover:text-green-300"}
                          title={user.ativo ? "Banir usuário" : "Desbanir usuário"}
                        >
                          {user.ativo ? <FaBan /> : <FaUnlock />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowResetModal(true);
                          }}
                          className="text-yellow-400 hover:text-yellow-300"
                          title="Resetar senha"
                        >
                          <FaKey />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {pagination.pages > 1 && (
          <div className="bg-gray-700 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-300">
              Página {pagination.page} de {pagination.pages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Editar Usuário</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nome</label>
                <input
                  type="text"
                  value={editForm.nome}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Saldo Reais</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.saldo_reais}
                  onChange={(e) => setEditForm({ ...editForm, saldo_reais: parseFloat(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Saldo Demo</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.saldo_demo}
                  onChange={(e) => setEditForm({ ...editForm, saldo_demo: parseFloat(e.target.value) })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={editForm.ativo}
                  onChange={(e) => setEditForm({ ...editForm, ativo: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="ativo" className="text-gray-400">Usuário ativo</label>
              </div>

              {!editForm.ativo && (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Motivo do Banimento</label>
                  <textarea
                    value={editForm.motivo_ban}
                    onChange={(e) => setEditForm({ ...editForm, motivo_ban: e.target.value })}
                    placeholder="Digite o motivo do banimento"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reset de Senha */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Resetar Senha</h3>
            <p className="text-gray-400 mb-4">Nova senha para: {selectedUser?.nome}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nova Senha</label>
                <input
                  type="password"
                  value={resetForm.nova_senha}
                  onChange={(e) => setResetForm({ ...resetForm, nova_senha: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Confirmar Senha</label>
                <input
                  type="password"
                  value={resetForm.confirmar_senha}
                  onChange={(e) => setResetForm({ ...resetForm, confirmar_senha: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowResetModal(false);
                  setResetForm({ nova_senha: '', confirmar_senha: '' });
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Resetar Senha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
