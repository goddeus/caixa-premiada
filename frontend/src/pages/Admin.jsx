import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaTachometerAlt, 
  FaHome, 
  FaUsers, 
  FaUserFriends, 
  FaCreditCard, 
  FaImage, 
  FaHistory, 
  FaCog, 
  FaFileAlt,
  FaBars,
  FaTimes,
  FaSignOutAlt
} from 'react-icons/fa';

// Componentes das páginas
import Dashboard from '../components/admin/Dashboard';
import HouseControl from '../components/admin/HouseControl';
import UserManagement from '../components/admin/UserManagement';
import AffiliateManagement from '../components/admin/AffiliateManagement';
import FinancialManagement from '../components/admin/FinancialManagement';
import BannerManagement from '../components/admin/BannerManagement';
import HistoryLogs from '../components/admin/HistoryLogs';
import SystemSettings from '../components/admin/SystemSettings';

const Admin = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { id: 'house-control', label: 'Controle da Casa', icon: FaHome },
    { id: 'users', label: 'Usuários', icon: FaUsers },
    { id: 'affiliates', label: 'Afiliados', icon: FaUserFriends },
    { id: 'financial', label: 'Financeiro', icon: FaCreditCard },
    { id: 'banners', label: 'Banners', icon: FaImage },
    { id: 'history', label: 'Histórico', icon: FaHistory },
    { id: 'settings', label: 'Configurações', icon: FaCog },
    { id: 'logs', label: 'Logs do Sistema', icon: FaFileAlt }
  ];

  useEffect(() => {
    if (!user?.is_admin) {
      toast.error('Acesso negado. Apenas administradores podem acessar esta área.');
      return;
    }
    setLoading(false);
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso');
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'house-control':
        return <HouseControl />;
      case 'users':
        return <UserManagement />;
      case 'affiliates':
        return <AffiliateManagement />;
      case 'financial':
        return <FinancialManagement />;
      case 'banners':
        return <BannerManagement />;
      case 'history':
        return <HistoryLogs />;
      case 'settings':
        return <SystemSettings />;
      case 'logs':
        return <HistoryLogs showLogs={true} />;
      default:
        return <Dashboard />;
    }
  };

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900 border border-red-700 rounded-lg p-8 text-center max-w-md mx-4">
          <FaTimes className="text-red-400 text-6xl mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Acesso Negado</h1>
          <p className="text-red-200">
            Você não tem permissão para acessar esta área administrativa.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 bg-gray-900">
          <h1 className="text-xl font-bold text-white">⚙️ Admin Panel</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <FaTimes />
          </button>
        </div>

        <nav className="mt-8 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 mb-2 text-left rounded-lg transition-colors ${
                  activePage === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-left rounded-lg text-red-300 hover:bg-red-900 hover:text-white transition-colors"
          >
            <FaSignOutAlt className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col lg:ml-0 relative z-10">
        {/* Header mobile */}
        <div className="lg:hidden bg-gray-800 px-4 py-3 flex items-center justify-between relative z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:text-gray-300"
          >
            <FaBars />
          </button>
          <h1 className="text-lg font-bold text-white">Admin Panel</h1>
          <div className="w-6" />
        </div>

        {/* Conteúdo da página */}
        <main className="flex-1 p-6 relative z-20">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Admin;