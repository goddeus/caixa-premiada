import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  HomeIcon, 
  GiftIcon, 
  WalletIcon, 
  UserIcon,
  ArrowRightOnRectangleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

export function Navigation() {
  const { user, isAuthenticated, logout, getUserBalance } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Barra superior */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                <GiftIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Caixa Premiada</span>
            </Link>

            {/* Menu superior */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">
                    Olá, {user?.nome?.split(' ')[0]}!
                  </span>
                  <span className="text-sm font-medium text-primary-600">
                    R$ {getUserBalance().toFixed(2)}
                  </span>
                  <button
                    onClick={logout}
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Registrar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Barra inferior (mobile) */}
      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
          <div className="flex justify-around items-center h-16">
            <Link
              to="/"
              className={`flex flex-col items-center space-y-1 p-2 ${
                isActive('/') ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <HomeIcon className="w-6 h-6" />
              <span className="text-xs">Início</span>
            </Link>

            <Link
              to="/cases"
              className={`flex flex-col items-center space-y-1 p-2 ${
                isActive('/cases') ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <GiftIcon className="w-6 h-6" />
              <span className="text-xs">Caixas</span>
            </Link>

            <Link
              to="/wallet"
              className={`flex flex-col items-center space-y-1 p-2 ${
                isActive('/profile') ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <WalletIcon className="w-6 h-6" />
              <span className="text-xs">Carteira</span>
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center space-y-1 p-2 ${
                isActive('/profile') ? 'text-primary-600' : 'text-gray-600'
              }`}
            >
              <UserIcon className="w-6 h-6" />
              <span className="text-xs">Perfil</span>
            </Link>
          </div>
        </nav>
      )}
    </>
  );
}
