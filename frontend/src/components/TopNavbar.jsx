import { useAuth } from '../contexts/AuthContext';
import { FaUser, FaSignOutAlt, FaWallet, FaGift } from 'react-icons/fa';

const TopNavbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-800 border-b border-slate-700 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <FaGift className="text-yellow-400 text-2xl mr-2" />
            <img 
              src="/imagens/logo.png" 
              alt="CAIXA PREMIADA" 
              className="h-8 w-auto"
            />
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            {/* Balance */}
            <div className="flex items-center space-x-2 bg-green-600 px-3 py-1 rounded-lg">
              <FaWallet className="text-white" />
              <span className="text-white font-semibold">
                R$ {user?.saldo ? parseFloat(user.saldo).toFixed(2) : '0.00'}
              </span>
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors">
                <FaUser />
                <span className="hidden sm:block">{user?.nome}</span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <div className="px-4 py-2 text-sm text-gray-300 border-b border-slate-700">
                    <div className="font-medium">{user?.nome}</div>
                    <div className="text-gray-400">{user?.email}</div>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-700 flex items-center space-x-2"
                  >
                    <FaSignOutAlt />
                    <span>Sair</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
