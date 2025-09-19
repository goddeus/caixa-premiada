import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FaImage, FaUpload, FaEdit, FaTrash, FaPlus, FaEye, FaDownload } from 'react-icons/fa';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    nome: '',
    tipo: 'homepage',
    arquivo: null,
    url: '',
    ativo: true
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      // Simular carregamento de banners (implementar API real)
      const mockBanners = [
        {
          id: 1,
          nome: 'Banner Principal',
          tipo: 'homepage',
          url: '/images/banner-principal.jpg',
          ativo: true,
          criado_em: new Date().toISOString()
        },
        {
          id: 2,
          nome: 'Banner Promocional',
          tipo: 'promocao',
          url: '/images/banner-promo.jpg',
          ativo: false,
          criado_em: new Date().toISOString()
        }
      ];
      setBanners(mockBanners);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
      toast.error('Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      if (!uploadForm.nome || !uploadForm.tipo) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      // Simular upload (implementar API real)
      const newBanner = {
        id: banners.length + 1,
        nome: uploadForm.nome,
        tipo: uploadForm.tipo,
        url: uploadForm.url || '/images/banner-default.jpg',
        ativo: uploadForm.ativo,
        criado_em: new Date().toISOString()
      };

      setBanners([...banners, newBanner]);
      setShowUploadModal(false);
      setUploadForm({
        nome: '',
        tipo: 'homepage',
        arquivo: null,
        url: '',
        ativo: true
      });
      toast.success('Banner adicionado com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload do banner');
    }
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm('Tem certeza que deseja excluir este banner?')) {
      try {
        setBanners(banners.filter(b => b.id !== bannerId));
        toast.success('Banner excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir banner:', error);
        toast.error('Erro ao excluir banner');
      }
    }
  };

  const handleToggleStatus = async (bannerId) => {
    try {
      setBanners(banners.map(b => 
        b.id === bannerId ? { ...b, ativo: !b.ativo } : b
      ));
      toast.success('Status do banner atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status do banner');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão de Banners</h1>
          <p className="text-gray-400 mt-1">Upload e gerenciamento de banners da plataforma</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <FaPlus className="mr-2" />
          Novo Banner
        </button>
      </div>

      {/* Lista de Banners */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Banner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Data</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    Nenhum banner encontrado
                  </td>
                </tr>
              ) : (
                banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-16 h-10 bg-gray-600 rounded flex items-center justify-center mr-3">
                          <FaImage className="text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{banner.nome}</div>
                          <div className="text-sm text-gray-400">{banner.url}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 capitalize">{banner.tipo}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        banner.ativo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {banner.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(banner.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(banner.id)}
                          className={`${banner.ativo ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                          title={banner.ativo ? 'Desativar banner' : 'Ativar banner'}
                        >
                          {banner.ativo ? <FaTrash /> : <FaEye />}
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Excluir banner"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Adicionar Banner</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Nome do Banner</label>
                <input
                  type="text"
                  value={uploadForm.nome}
                  onChange={(e) => setUploadForm({ ...uploadForm, nome: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Banner Principal"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Tipo</label>
                <select
                  value={uploadForm.tipo}
                  onChange={(e) => setUploadForm({ ...uploadForm, tipo: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="homepage">Homepage</option>
                  <option value="promocao">Promoção</option>
                  <option value="lateral">Lateral</option>
                  <option value="popup">Popup</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">URL da Imagem</label>
                <input
                  type="url"
                  value={uploadForm.url}
                  onChange={(e) => setUploadForm({ ...uploadForm, url: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemplo.com/banner.jpg"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ativo"
                  checked={uploadForm.ativo}
                  onChange={(e) => setUploadForm({ ...uploadForm, ativo: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="ativo" className="text-gray-400">Banner ativo</label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Adicionar Banner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
