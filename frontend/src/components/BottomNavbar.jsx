import { NavLink } from 'react-router-dom';
import { FaHome, FaWallet, FaHistory, FaUsers, FaCog, FaGift, FaUser } from 'react-icons/fa';

const BottomNavbar = () => {
  const navItems = [
    { id: 'home', to: '/dashboard', icon: FaHome, label: 'Começar' },
    { id: 'cases', to: '/dashboard', icon: FaGift, label: 'Caixas' },
    { id: 'login', to: '/dashboard', icon: FaUser, label: 'Entrar', isCenter: true },
    { id: 'wallet', to: '/wallet', icon: FaWallet, label: 'Carteira' },
    { id: 'profile', to: '/transactions', icon: FaUser, label: 'Perfil' },
  ];

  return (
    <div 
      className="fixed bottom-4 left-1/2 z-50" 
      style={{
        transform: 'translateX(-50%)',
        width: '95vw',
        maxWidth: '480px',
        borderRadius: '1.5rem',
        boxShadow: '0 4px 32px 0 rgba(0,0,0,0.25)',
        background: '#18181b'
      }}
    >
      <div className="flex items-center justify-around py-2">
        {navItems.map((item, index) => (
          <div key={item.id} className="relative flex flex-col items-center justify-center flex-1" style={{ minWidth: 0 }}>
            {item.isCenter ? (
              <>
                <button 
                  className="flex flex-col items-center justify-center" 
                  style={{
                    marginTop: '-28px',
                    background: 'linear-gradient(90deg, #ffe661 0%, #ff910f 100%)',
                    borderRadius: '50%',
                    width: '56px',
                    height: '56px',
                    boxShadow: '0 2px 12px 0 rgba(247, 147, 89, 0.25)',
                    border: '4px solid #18181b',
                    color: '#fff'
                  }}
                >
                  <item.icon className="w-7 h-7" />
                </button>
                <span className="text-xs font-semibold mt-1 text-white">{item.label}</span>
              </>
            ) : (
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-yellow-400 transition-colors`
                }
                style={{ minWidth: 0 }}
              >
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium truncate">{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BottomNavbar;
