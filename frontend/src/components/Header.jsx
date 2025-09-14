import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.relative')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  return (
    <header className="border-b border-[#212630]" style={{background:'#0E1015'}}>
      {/* Desktop Header */}
      <div className="hidden md:flex container mx-auto px-4 py-1 md:py-2 items-center justify-between min-h-[28px]">
        <div className="flex items-center space-x-3">
          <img 
            alt="Mega Raspadinha" 
            className="object-contain h-16 w-auto max-w-[200px]" 
            src="/imagens/caixa premium.png"
          />
          <div className="flex flex-col">
            <span 
              className="text-white font-black uppercase tracking-wider"
              style={{
                fontSize: '2.5rem',
                background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)',
                backgroundSize: '400% 400%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientShift 3s ease-in-out infinite, textGlow 2s ease-in-out infinite alternate',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 165, 0, 0.3)',
                fontFamily: 'Arial Black, sans-serif',
                letterSpacing: '0.1em',
                fontWeight: '900',
                lineHeight: '1'
              }}
            >
              SLOT BOX
            </span>
          </div>
          <span className="fallback-logo text-4xl hidden" style={{display: 'none'}}>🎰</span>
        </div>
        <div className="flex items-center gap-2">
          {!isAuthenticated ? (
            <>
              <button 
                onClick={() => navigate('/register')}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold hover:opacity-90 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 mr-2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Entrar
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-4 py-2 rounded-lg bg-transparent text-white font-bold hover:opacity-90 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 mr-2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Registrar
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigate('/wallet')}
                className="px-4 py-2 rounded-lg bg-transparent text-white font-bold hover:opacity-90 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 mr-2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="text-white font-semibold">
                  R$ {user?.tipo_conta === 'afiliado_demo' ? (user?.saldo_demo ? parseFloat(user.saldo_demo).toFixed(2) : '0.00') : (user?.saldo_reais ? parseFloat(user.saldo_reais).toFixed(2) : '0.00')}
                </span>
              </button>
              <button 
                onClick={() => navigate('/wallet')}
                className="px-4 py-2 rounded-lg bg-transparent text-white font-bold hover:opacity-90 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 mr-2">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Depositar
              </button>
              <button 
                onClick={() => navigate('/wallet')}
                className="px-4 py-2 rounded-lg bg-transparent text-white font-bold hover:opacity-90 transition flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                  <path d="M12 2v20M7 5h5.5a3.5 3.5 0 0 1 0 7H7a3.5 3.5 0 0 0 0 7h5"/>
                </svg>
                Sacar
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="px-4 py-2 rounded-lg bg-transparent text-white font-bold hover:opacity-90 transition flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 mr-2">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {user?.username || 'Usuário'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16,17 21,12 16,7"></polyline>
                          <line x1="21" x2="9" y1="12" y2="12"></line>
                        </svg>
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden container mx-auto px-2 py-0 flex items-center justify-between min-h-[28px]">
        <div className="flex items-center space-x-3 ml-[-12px] mr-2">
          <img 
            alt="Mega Raspadinha" 
            className="object-contain h-12 w-auto max-w-[150px]" 
            src="/imagens/caixa premium.png"
          />
          <div className="flex flex-col">
            <span 
              className="text-white font-black uppercase tracking-wider"
              style={{
                fontSize: '1.5rem',
                background: 'linear-gradient(45deg, #FFD700, #FFA500, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4, #FFEAA7)',
                backgroundSize: '400% 400%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradientShift 3s ease-in-out infinite, textGlow 2s ease-in-out infinite alternate',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 165, 0, 0.3)',
                fontFamily: 'Arial Black, sans-serif',
                letterSpacing: '0.05em',
                fontWeight: '900',
                lineHeight: '1'
              }}
            >
              SLOT BOX
            </span>
          </div>
          <span className="fallback-logo text-3xl hidden" style={{display: 'none'}}>🎰</span>
        </div>
        <div className="flex items-center gap-1">
          {!isAuthenticated ? (
            <>
              <button 
                onClick={() => navigate('/register')}
                className="px-2 py-1 rounded bg-transparent text-white font-bold hover:opacity-90 transition flex items-center text-sm"
                style={{minWidth:'0',height:'32px'}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out w-4 h-4 mr-1">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" x2="9" y1="12" y2="12"></line>
                </svg>
                Entrar
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="px-2 py-1 rounded bg-transparent text-white font-bold hover:opacity-90 transition flex items-center text-sm"
                style={{minWidth:'0',height:'32px'}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-4 h-4 mr-1">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Registrar
              </button>
            </>
          ) : (
            <>
              <div 
                className="px-2 py-1 rounded bg-transparent text-white font-bold flex items-center text-sm"
                style={{minWidth:'0',height:'32px'}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-4 h-4 mr-1">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="text-white font-semibold text-sm">
                  R$ {user?.tipo_conta === 'afiliado_demo' ? (user?.saldo_demo ? parseFloat(user.saldo_demo).toFixed(2) : '0.00') : (user?.saldo_reais ? parseFloat(user.saldo_reais).toFixed(2) : '0.00')}
                </span>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="px-2 py-1 rounded bg-transparent text-white font-bold hover:opacity-90 transition flex items-center text-sm"
                  style={{minWidth:'0',height:'32px'}}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-4 h-4 mr-1">
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {user?.username || 'Usuário'}
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 transition-colors flex items-center text-sm"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16,17 21,12 16,7"></polyline>
                          <line x1="21" x2="9" y1="12" y2="12"></line>
                        </svg>
                        Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
