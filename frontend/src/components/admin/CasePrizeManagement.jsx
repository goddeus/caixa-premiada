import React, { useState, useEffect } from 'react';
import { 
  FaBox, 
  FaGift, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaTimesCircle,
  FaEdit,
  FaPowerOff,
  FaWrench,
  FaSearch,
  FaSpinner,
  FaInfoCircle,
  FaClipboardCheck
} from 'react-icons/fa';

const CasePrizeManagement = () => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [auditing, setAuditing] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [editingPrize, setEditingPrize] = useState(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    valorReais: 0,
    tipo: 'produto',
    ativo: true
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Carregar lista de caixas
  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      console.log('Carregando caixas...');
      const response = await api.get('/admin/caixas');
      const data = response;
      console.log('Dados recebidos:', data);
      setCases(data.data);
    } catch (error) {
      console.error('Erro ao carregar caixas:', error);
      setError('Erro ao carregar caixas: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPrizes = async (caseId) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await api.get(`/admin/caixas/${caseId}/premios`);
      const data = response;
      setPrizes(data.data.prizes);
      setSummary(data.data.summary);
      setSelectedCase(data.data.case);
    } catch (error) {
      setError('Erro ao carregar prêmios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const auditCasePrizes = async () => {
    if (!selectedCase) return;

    try {
      setAuditing(true);
      const token = localStorage.getItem('token');
      const response = await api.post(`/admin/caixas/${selectedCase.id}/audit`, { fix: true });
      const data = response;
      
      // Recarregar prêmios após auditoria
      await loadPrizes(selectedCase.id);
      
      alert(`Auditoria concluída!\nCorreções aplicadas: ${data.data.corrections_applied}\nErros: ${data.data.errors.length}\nWarnings: ${data.data.warnings.length}`);
    } catch (error) {
      setError('Erro ao executar auditoria: ' + error.message);
    } finally {
      setAuditing(false);
    }
  };

  const updatePrize = async (prizeId, updates) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(`/admin/premios/${prizeId}`, updates);
      const data = response;
      console.log('Prêmio atualizado:', data);

      // Recarregar prêmios
      if (selectedCase) {
        await loadPrizes(selectedCase.id);
      }

      return data;
    } catch (error) {
      console.error('Erro ao atualizar prêmio:', error);
      setError('Erro ao atualizar prêmio: ' + error.message);
      throw error;
    }
  };

  const openEditModal = (prize) => {
    setEditingPrize(prize);
    setEditForm({
      nome: prize.nome || '',
      valorReais: prize.valorCentavos ? (prize.valorCentavos / 100) : 0,
      tipo: prize.tipo || 'produto',
      ativo: prize.ativo !== false
    });
  };

  const closeEditModal = () => {
    setEditingPrize(null);
    setEditForm({
      nome: '',
      valorReais: 0,
      tipo: 'produto',
      ativo: true
    });
    setSelectedImage(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    if (!editingPrize) return;

    try {
      setLoading(true);
      
      // Preparar dados para atualização
      const updates = {
        nome: editForm.nome.trim(),
        valorCentavos: Math.round(parseFloat(editForm.valorReais) * 100), // Converter reais para centavos
        tipo: editForm.tipo,
        ativo: editForm.ativo
      };

      // Validar dados
      if (!updates.nome) {
        throw new Error('Nome é obrigatório');
      }

      if (updates.valorCentavos < 100) {
        throw new Error('Valor mínimo é R$ 1,00');
      }

      if (!['cash', 'produto', 'ilustrativo'].includes(updates.tipo)) {
        throw new Error('Tipo inválido');
      }

      console.log('Atualizando prêmio:', editingPrize.id, updates);
      
      // Upload de imagem se selecionada
      if (selectedImage) {
        const imagePath = await uploadImage(editingPrize.id);
        if (imagePath) {
          updates.imagem_id = imagePath;
        }
      }
      
      await updatePrize(editingPrize.id, updates);
      
      closeEditModal();
      setSelectedImage(null);
      alert('Prêmio atualizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar prêmio:', error);
      alert('Erro ao salvar prêmio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem');
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Imagem muito grande. Máximo 5MB');
        return;
      }
      
      setSelectedImage(file);
    }
  };

  const uploadImage = async (prizeId) => {
    if (!selectedImage) return null;

    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('prizeId', prizeId);

      const token = localStorage.getItem('token');
      const response = await api.post('/admin/premios/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const data = response;
      console.log('Imagem enviada:', data);
      return data.imagePath;
      
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const getValidationStatus = (prize) => {
    // Para prêmios cash, se tem imagem válida, está OK
    if (prize.tipo === 'cash') {
      if (prize.imagemUrl && (
        prize.imagemUrl.startsWith('/uploads/') || 
        prize.imagemUrl.startsWith('/imagens/') || 
        prize.imagemUrl.startsWith('cash/')
      )) {
        return 'ok';
      }
      
      // Se não tem imagem válida, warning
      return 'warning';
    }
    
    // Para produto/ilustrativo
    if (!prize.imagemUrl || prize.imagemUrl === 'produto/default.png') {
      return 'warning';
    }
    
    if (prize.imagemUrl && (
      prize.imagemUrl.startsWith('/uploads/') || 
      prize.imagemUrl.startsWith('/imagens/') || 
      prize.imagemUrl.startsWith('cash/') ||
      prize.imagemUrl.startsWith('produto/')
    )) {
      return 'ok';
    }
    
    return 'warning';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
        return <FaCheckCircle className="text-green-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'error':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ok':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">OK</span>;
      case 'warning':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">ALERTA</span>;
      case 'error':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">ERRO</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">?</span>;
    }
  };

  const getTypeBadge = (tipo) => {
    const colors = {
      cash: 'bg-blue-100 text-blue-800',
      produto: 'bg-green-100 text-green-800',
      ilustrativo: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[tipo] || 'bg-gray-100 text-gray-800'}`}>
        {tipo.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <FaBox className="mr-3 text-blue-500" />
            Gerenciamento de Prêmios por Caixa
          </h1>
          <p className="text-gray-400">
            Selecione uma caixa para visualizar e gerenciar todos os prêmios vinculados
          </p>
        </div>

        {/* Seleção de Caixa */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <FaSearch className="mr-2 text-blue-500" />
            Selecionar Caixa
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map(caseItem => (
              <div
                key={caseItem.id}
                onClick={() => loadPrizes(caseItem.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                  selectedCase?.id === caseItem.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white">{caseItem.nome}</h3>
                  <span className="text-sm text-gray-400">{caseItem.total_prizes} prêmios</span>
                </div>
                <p className="text-sm text-gray-400">R$ {caseItem.preco.toFixed(2)}</p>
                {selectedCase?.id === caseItem.id && (
                  <div className="mt-2 text-xs text-blue-400">✓ Selecionada</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resumo da Caixa Selecionada */}
        {selectedCase && summary && (
          <div className="bg-gray-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FaGift className="mr-2 text-green-500" />
              Resumo da Caixa: {selectedCase.nome}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{summary.total}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Cash</p>
                <p className="text-2xl font-bold text-blue-400">{summary.cash}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Produto</p>
                <p className="text-2xl font-bold text-green-400">{summary.produto}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Ilustrativo</p>
                <p className="text-2xl font-bold text-purple-400">{summary.ilustrativo}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Sorteáveis</p>
                <p className="text-2xl font-bold text-yellow-400">{summary.sorteaveis}</p>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={auditCasePrizes}
                disabled={auditing}
                className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
              >
                {auditing ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Auditando...
                  </>
                ) : (
                  <>
                    <FaClipboardCheck className="mr-2" />
                    Rodar Auditoria nesta Caixa
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-4xl text-blue-500" />
            <span className="ml-3 text-white">Carregando...</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Grid de Prêmios */}
        {prizes.length > 0 && !loading && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <FaGift className="mr-2 text-green-500" />
              Prêmios da Caixa ({prizes.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {prizes.map(prize => {
                const status = getValidationStatus(prize);
                
                return (
                  <div
                    key={prize.id}
                    className={`bg-gray-700 rounded-lg p-4 border-2 transition-all hover:shadow-lg ${
                      status === 'error' ? 'border-red-500' :
                      status === 'warning' ? 'border-yellow-500' :
                      'border-gray-600'
                    }`}
                    title={`ID: ${prize.id}`}
                  >
                    {/* Imagem */}
                    <div className="w-full h-24 bg-gray-600 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                      {prize.imagemUrl ? (
                        <img
                          src={prize.imagemUrl}
                          alt={prize.nome}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center text-gray-400" style={{display: prize.imagemUrl ? 'none' : 'flex'}}>
                        <FaGift className="text-2xl" />
                      </div>
                      
                      {/* Badge de status da imagem */}
                      {prize.imagemUrl && (
                        <div className="absolute top-1 right-1">
                          {prize.imagemUrl.startsWith('/uploads/') ? (
                            <span className="bg-green-500 text-white text-xs px-1 py-0.5 rounded" title="Imagem enviada via upload">
                              ✓
                            </span>
                          ) : (
                            <span className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded" title="Imagem da pasta local">
                              📁
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center justify-between mb-2">
                      {getStatusIcon(status)}
                      {getStatusBadge(status)}
                    </div>
                    
                    {/* Tipo */}
                    <div className="mb-2">
                      {getTypeBadge(prize.tipo)}
                    </div>
                    
                    {/* Nome */}
                    <h3 className="font-semibold text-white text-sm mb-1 truncate" title={prize.nome}>
                      {prize.nome}
                    </h3>
                    
                    {/* Label */}
                    <p className="text-gray-400 text-sm mb-2">{prize.label}</p>
                    
                    {/* Valor */}
                    <p className="text-green-400 font-bold text-sm mb-3">
                      R$ {(prize.valorCentavos / 100).toFixed(2).replace('.', ',')}
                    </p>
                    
                    {/* Status Ativo/Sorteável */}
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className={`px-2 py-1 rounded ${prize.ativo ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {prize.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className={`px-2 py-1 rounded ${prize.sorteavel ? 'bg-blue-900 text-blue-300' : 'bg-gray-900 text-gray-300'}`}>
                        {prize.sorteavel ? 'Sorteável' : 'Não sorteável'}
                      </span>
                    </div>
                    
                    {/* Ações */}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          const newAtivo = !prize.ativo;
                          updatePrize(prize.id, { ativo: newAtivo });
                        }}
                        className="flex-1 bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded text-xs flex items-center justify-center"
                        title={prize.ativo ? 'Desativar' : 'Ativar'}
                      >
                        <FaPowerOff className="mr-1" />
                        {prize.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                      
                      <button
                        onClick={() => openEditModal(prize)}
                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded text-xs flex items-center justify-center"
                        title="Editar"
                      >
                        <FaEdit className="mr-1" />
                        Editar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mensagem quando nenhuma caixa selecionada */}
        {!selectedCase && !loading && (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <FaBox className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Selecione uma Caixa</h3>
            <p className="text-gray-400">Escolha uma caixa acima para visualizar seus prêmios</p>
          </div>
        )}

        {/* Modal de Edição */}
        {editingPrize && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Editar Prêmio</h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimesCircle className="text-xl" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome do Prêmio
                  </label>
                  <input
                    type="text"
                    value={editForm.nome}
                    onChange={(e) => handleFormChange('nome', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Digite o nome do prêmio"
                    required
                  />
                </div>

                {/* Valor em Reais */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor (em reais)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.valorReais}
                    onChange={(e) => handleFormChange('valorReais', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Ex: 5.00 para R$ 5,00"
                    min="1"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Valor atual: R$ {editForm.valorReais.toFixed(2).replace('.', ',')}
                  </p>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo do Prêmio
                  </label>
                  <select
                    value={editForm.tipo}
                    onChange={(e) => handleFormChange('tipo', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="produto">Produto</option>
                    <option value="cash">Dinheiro (Cash)</option>
                    <option value="ilustrativo">Ilustrativo</option>
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    {editForm.tipo === 'cash' && 'Para prêmios em dinheiro (nome será formatado automaticamente)'}
                    {editForm.tipo === 'produto' && 'Para produtos físicos/virtuais normais'}
                    {editForm.tipo === 'ilustrativo' && 'Para itens apenas de vitrine (não sorteáveis)'}
                  </p>
                </div>

                {/* Upload de Imagem */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Imagem do Prêmio
                  </label>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
                    />
                    {selectedImage && (
                      <div className="text-xs text-green-400">
                        ✓ Arquivo selecionado: {selectedImage.name}
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      Formatos aceitos: JPG, PNG, GIF, WEBP (máximo 5MB)
                    </p>
                  </div>
                </div>

                {/* Status Ativo */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ativo"
                    checked={editForm.ativo}
                    onChange={(e) => handleFormChange('ativo', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="ativo" className="ml-2 text-sm text-gray-300">
                    Prêmio ativo (pode ser sorteado)
                  </label>
                </div>

                {/* Informações do Prêmio Original */}
                <div className="bg-gray-700 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Informações Originais:</h4>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p><strong>ID:</strong> {editingPrize.id}</p>
                    <p><strong>Nome:</strong> {editingPrize.nome}</p>
                    <p><strong>Valor:</strong> R$ {(editingPrize.valorCentavos / 100).toFixed(2).replace('.', ',')}</p>
                    <p><strong>Tipo:</strong> {editingPrize.tipo}</p>
                    <p><strong>Status:</strong> {editingPrize.ativo ? 'Ativo' : 'Inativo'}</p>
                  </div>
                </div>

                {/* Botões */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploadingImage}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    {loading || uploadingImage ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        {uploadingImage ? 'Enviando imagem...' : 'Salvando...'}
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CasePrizeManagement;
