import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaCog, FaSave, FaEdit, FaTrash } from 'react-icons/fa';

const SystemSettings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [editForm, setEditForm] = useState({ chave: '', valor: '', descricao: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      if (response.data.success) {
        const settingsWithIds = response.data.settings.map((setting, index) => ({
          ...setting,
          id: index + 1
        }));
        setSettings(settingsWithIds);
      } else {
        throw new Error('Erro ao carregar configurações');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSetting = (setting) => {
    setSelectedSetting(setting);
    setEditForm({
      chave: setting.chave,
      valor: setting.valor,
      descricao: setting.descricao
    });
    setShowEditModal(true);
  };

  const handleSaveSetting = async () => {
    try {
      const response = await api.put(`/admin/settings/${editForm.chave}`, {
        valor: editForm.valor,
        descricao: editForm.descricao
      });

      if (response.data.success) {
        // Atualizar lista local
        const updatedSettings = settings.map(s => 
          s.id === selectedSetting.id ? { ...s, ...editForm } : s
        );
        setSettings(updatedSettings);
        setShowEditModal(false);
        toast.success('Configuração salva com sucesso');
      } else {
        throw new Error(response.data.error || 'Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      const errorMessage = error.response?.data?.error || 'Erro ao salvar configuração';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Configurações do Sistema</h1>
        <p className="text-gray-400 mt-1">Ajustar valores padrões e configurações da plataforma</p>
      </div>

      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Configuração</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Valor Atual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Descrição</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div></td></tr>
              ) : settings.map((setting) => (
                <tr key={setting.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm font-medium text-white">{setting.chave}</td>
                  <td className="px-6 py-4 text-sm text-blue-400 font-semibold">
                    {setting.chave === 'comissao_afiliado' ? setting.valor : `R$ ${setting.valor}`}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{setting.descricao}</td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => handleEditSetting(setting)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Editar Configuração</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Chave</label>
                <input
                  type="text"
                  value={editForm.chave}
                  readOnly
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-400"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Valor</label>
                <input
                  type={editForm.chave === 'manutencao' ? 'text' : 'number'}
                  value={editForm.valor}
                  onChange={(e) => setEditForm({ ...editForm, valor: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={editForm.chave === 'manutencao' ? 'true ou false' : 'Digite o valor'}
                  min={editForm.chave !== 'manutencao' ? '0' : undefined}
                  step={editForm.chave !== 'manutencao' ? '0.01' : undefined}
                />
                {editForm.chave === 'manutencao' && (
                  <p className="text-xs text-gray-400 mt-1">Digite "true" para ativar ou "false" para desativar</p>
                )}
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Descrição</label>
                <textarea
                  value={editForm.descricao}
                  onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveSetting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FaSave className="inline mr-2" />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;
