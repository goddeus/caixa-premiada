import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cpf: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    if (formData.senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        cpf: formData.cpf.replace(/\D/g, ''), // Remove non-digits
        referralCode: referralCode
      };

      const result = await register(userData);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (value) => {
    const cpf = value.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="rounded-lg border text-card-foreground bg-[#0E1015] border-[#0E1015] backdrop-blur-sm shadow-2xl">
          <div className="flex flex-col space-y-1.5 p-6 text-center pb-6">
            <div className="tracking-tight text-xl md:text-2xl font-bold text-white">Criar Conta</div>
            <div className="text-sm text-gray-400">Registre-se para começar</div>
          </div>
          
          <div className="flex border-b border-[#23262f] mb-6">
            <button 
              onClick={() => navigate('/')}
              className="flex-1 py-3 text-center font-bold text-base transition text-gray-400 hover:text-white"
            >
              Entrar
            </button>
            <button className="flex-1 py-3 text-center font-bold text-base transition text-white border-b-2 border-[#e1be0c]">
              Registrar
            </button>
          </div>
          
          <div className="p-6 pt-0 space-y-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white font-medium" htmlFor="nome">
                  Nome Completo
                </label>
                <input 
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#0E1015] border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-500 focus:ring-yellow-500/20" 
                  id="nome" 
                  name="nome"
                  placeholder="Digite seu nome completo" 
                  required 
                  type="text" 
                  value={formData.nome}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white font-medium" htmlFor="email">
                  Email
                </label>
                <input 
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#0E1015] border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-500 focus:ring-yellow-500/20" 
                  id="email" 
                  name="email"
                  placeholder="Digite seu email" 
                  required 
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white font-medium" htmlFor="cpf">
                  CPF
                </label>
                <input 
                  className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#0E1015] border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-500 focus:ring-yellow-500/20" 
                  id="cpf" 
                  name="cpf"
                  placeholder="000.000.000-00" 
                  required 
                  type="text" 
                  maxLength="14"
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white font-medium" htmlFor="senha">
                  Senha
                </label>
                <div className="relative">
                  <input 
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#0E1015] border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-500 focus:ring-yellow-500/20 pr-10" 
                    id="senha" 
                    name="senha"
                    placeholder="Digite sua senha" 
                    required 
                    type={showPassword ? 'text' : 'password'} 
                    value={formData.senha}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="text-gray-400 hover:text-gray-300" />
                    ) : (
                      <FaEye className="text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white font-medium" htmlFor="confirmarSenha">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input 
                    className="flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#0E1015] border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-500 focus:ring-yellow-500/20 pr-10" 
                    id="confirmarSenha" 
                    name="confirmarSenha"
                    placeholder="Confirme sua senha" 
                    required 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    value={formData.confirmarSenha}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="text-gray-400 hover:text-gray-300" />
                    ) : (
                      <FaEye className="text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
              
              <button 
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-10 px-4 w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-semibold py-2.5 md:py-3 transition-all duration-200 shadow-lg hover:shadow-yellow-500/25" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Criar Conta'
                )}
              </button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0E1015] px-2 text-gray-400">ou</span>
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-gray-400 text-sm">Já tem uma conta?</p>
              <button 
                onClick={() => navigate('/')}
                className="items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 underline-offset-4 hover:underline h-10 px-4 py-2 inline-block text-yellow-400 hover:text-yellow-300 font-medium transition-colors duration-200"
              >
                Fazer login
              </button>
            </div>
          </div>
        </div>

        {/* Referral Code Notice */}
        {referralCode && (
          <div className="mt-4 bg-blue-900 border border-blue-700 rounded-lg p-4 text-center">
            <p className="text-blue-200 text-sm">
              Você está sendo convidado por um afiliado! 
              <br />
              Código: <span className="font-bold">{referralCode}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
