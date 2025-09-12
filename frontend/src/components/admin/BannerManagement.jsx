import { useState } from 'react';
import { toast } from 'react-toastify';
import { FaImage, FaUpload, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);

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

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FaImage className="text-6xl text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                Nenhum banner encontrado
              </h3>
              <p className="text-gray-500">
                Faça upload do seu primeiro banner
              </p>
            </div>
          ) : (
            banners.map((banner) => (
              <div key={banner.id} className="bg-gray-700 rounded-lg p-4">
                <div className="aspect-video bg-gray-600 rounded-lg mb-4 flex items-center justify-center">
                  <FaImage className="text-4xl text-gray-500" />
                </div>
                <h3 className="text-white font-medium mb-2">{banner.nome}</h3>
                <p className="text-gray-400 text-sm mb-4">{banner.tipo}</p>
                <div className="flex space-x-2">
                  <button className="text-blue-400 hover:text-blue-300">
                    <FaEdit />
                  </button>
                  <button className="text-red-400 hover:text-red-300">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BannerManagement;
