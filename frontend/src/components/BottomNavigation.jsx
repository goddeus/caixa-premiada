import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('20,00');

  const handleDepositAmountChange = (e) => {
    let value = e.target.value.replace(/[^0-9,]/g, '');
    if (value === '') {
      setDepositAmount('20,00');
      return;
    }
    if (!value.includes(',')) {
      value += ',00';
    }
    setDepositAmount(value);
  };

  const handleDepositAmountClick = (amount) => {
    setDepositAmount(amount);
  };

  if (!isAuthenticated) {
    return null; // Não mostra navegação inferior se não estiver logado
  }

  return (
    <>
      {/* Navegação inferior fixa */}
      <div className="fixed bottom-4 left-1/2 z-50" style={{transform:'translateX(-50%)', width:'95vw', maxWidth:'480px', borderRadius:'1.5rem', boxShadow:'0 4px 32px 0 rgba(0,0,0,0.25)', background:'#18181b'}}>
        <div className="flex items-center justify-around py-2">
          <button className="flex flex-col items-center justify-center flex-1 text-yellow-500 hover:text-yellow-400 transition-colors" style={{minWidth:'0'}} onClick={() => navigate('/dashboard')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home w-5 h-5 mb-1">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            <span className="text-xs font-semibold mt-1 text-white">Começar</span>
          </button>
          <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-yellow-400 transition-colors" style={{minWidth:'0'}} onClick={() => navigate('/dashboard')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box w-5 h-5 mb-1">
              <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8z"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
              <line x1="12" x2="12" y1="22.08" y2="12"/>
            </svg>
            <span className="text-xs font-semibold mt-1 text-white">Caixas</span>
          </button>
          <div className="relative flex flex-col items-center justify-center flex-1" style={{zIndex: '2'}}>
            <button className="flex flex-col items-center justify-center" style={{marginTop: '-28px', background: 'linear-gradient(90deg, rgb(255, 230, 97) 0%, rgb(255, 145, 15) 100%)', borderRadius: '50%', width: '56px', height: '56px', boxShadow: 'rgba(247, 147, 89, 0.25) 0px 2px 12px 0px', border: '4px solid rgb(24, 24, 27)', color: 'rgb(255, 255, 255)'}} onClick={() => setShowDepositModal(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus w-6 h-6">
                <path d="M5 12h14"/>
                <path d="M12 5v14"/>
              </svg>
            </button>
            <span className="text-xs font-semibold mt-1 text-white">Depósito</span>
          </div>
          <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-yellow-400 transition-colors" style={{minWidth:'0'}} onClick={() => navigate('/affiliates')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users w-5 h-5 mb-1">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span className="text-xs font-semibold mt-1 text-white">Indique</span>
          </button>
          <button className="flex flex-col items-center justify-center flex-1 text-gray-400 hover:text-yellow-400 transition-colors" style={{minWidth:'0'}} onClick={() => navigate('/profile')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-5 h-5 mb-1">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="text-xs font-semibold mt-1 text-white">Perfil</span>
          </button>
        </div>
      </div>

      {/* Modal de Depósito */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-gradient-to-t from-purple-500 from-[-60%] via-[5%] to-100% via-slate-900 to-slate-900 animate-in fade-in-0 zoom-in-95 w-full max-w-md mx-auto rounded-lg border shadow-lg duration-200 outline-none overflow-auto max-h-[90vh]">
            <div className="p-3 md:p-4">
              {/* Header com imagem */}
              <div className="-m-4 mb-0 select-none relative">
                <img src="/imagens/deposito.jpg" className="w-full h-24 md:h-32 object-cover rounded-t-lg" alt="Depósito" />
                <div className="absolute bg-gradient-to-b from-black/10 via-black/10 from-0% via-85% to-100% to-background size-full z-10 top-0"></div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" className="size-6 text-white">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <h1 className="text-xl font-medium text-white">Depositar</h1>
              </div>

              <form className="space-y-4">
                {/* Campo de valor */}
                <div>
                  <label className="flex items-center font-medium text-white mb-2 text-sm">
                    Valor:
                  </label>
                  <div className="relative">
                    <span className="font-semibold opacity-80 absolute left-3 top-2/4 -translate-y-2/4 text-white">R$</span>
                    <input
                      type="tel"
                      value={depositAmount}
                      onChange={handleDepositAmountChange}
                      className="w-full pl-10 pr-3 py-2 bg-transparent border border-gray-600 rounded-md text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      placeholder="20,00"
                    />
                  </div>
                </div>

                {/* Botões de valores rápidos */}
                <div className="flex gap-1 md:gap-2 overflow-x-auto pb-2">
                  {['30,00', '50,00', '100,00', '200,00', '500,00'].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleDepositAmountClick(amount)}
                      className="bg-purple-500/20 text-purple-400 text-xs md:text-sm font-semibold px-2 md:px-3 py-1 md:py-2 rounded-md hover:bg-purple-500/30 transition-colors whitespace-nowrap"
                    >
                      R$ {amount}
                    </button>
                  ))}
                </div>

                {/* Botão de gerar QR Code */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-2 md:py-3 rounded-md hover:opacity-90 transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="1em" height="1em" xmlns="http://www.w3.org/2000/svg" className="size-4 md:size-5">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  Gerar QR Code
                </button>
              </form>

              {/* Botão de fechar */}
              <button
                className="absolute top-3 right-3 md:top-4 md:right-4 text-white opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setShowDepositModal(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="md:w-5 md:h-5">
                  <path d="M18 6 6 18"></path>
                  <path d="m6 6 12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BottomNavigation;
