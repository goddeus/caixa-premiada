import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({
    nome: '',
    username: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cpf: '',
    telefone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
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

  // Validação de email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validação de CPF
  const validateCPF = (cpf) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cleanCPF)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  };

  // Validação de telefone
  const validateTelefone = (telefone) => {
    const cleanTelefone = telefone.replace(/\D/g, '');
    // Aceitar telefones com 10 ou 11 dígitos (com ou sem DDD)
    return cleanTelefone.length >= 10 && cleanTelefone.length <= 11;
  };

  // Validação de username
  const validateUsername = (username) => {
    if (!username) return true; // Username é opcional
    // Username deve ter entre 3 e 20 caracteres, apenas letras, números e underscore
    return /^[a-zA-Z0-9_]{3,20}$/.test(username);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar username (opcional)
    if (formData.username && !validateUsername(formData.username)) {
      newErrors.username = 'Username deve ter entre 3 e 20 caracteres (apenas letras, números e _)';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    // Validar CPF
    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF deve ser válido';
    }

    // Validar telefone (opcional)
    if (formData.telefone && !validateTelefone(formData.telefone)) {
      newErrors.telefone = 'Telefone deve ter 10 ou 11 dígitos';
    }

    // Validar senha
    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar confirmação de senha
    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const userData = {
        nome: formData.nome.trim(),
        username: formData.username.trim() || null,
        email: formData.email.trim().toLowerCase(),
        senha: formData.senha,
        cpf: formData.cpf.replace(/\D/g, ''), // Remove non-digits
        telefone: formData.telefone.replace(/\D/g, '') || null, // Remove non-digits
        referralCode: referralCode
      };

      const result = await register(userData);
      if (result.success) {
        toast.success('Conta criada com sucesso!');
        navigate('/');
      } else {
        toast.error(result.message || 'Erro ao criar conta');
      }
    } catch (error) {
      console.error('Erro no registro:', error);
      toast.error('Erro interno. Tente novamente.');
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
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#0E1015] text-white placeholder:text-gray-400 focus:ring-yellow-500/20 ${
                    errors.nome ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-yellow-500'
                  }`}
                  id="nome" 
                  name="nome"
                  placeholder="Digite seu nome completo" 
                  required 
                  type="text" 
                  value={formData.nome}
                  onChange={handleChange}
                />
                {errors.nome && <p className="text-red-400 text-sm">{errors.nome}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white font-medium" htmlFor="username">
                  Username (Opcional)
                </label>
                <input 
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#0E1015] text-white placeholder:text-gray-400 focus:ring-yellow-500/20 ${
                    errors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-yellow-500'
                  }`}
                  id="username" 
                  name="username"
                  placeholder="Digite seu username" 
                  type="text" 
                  value={formData.username}
                  onChange={handleChange}
                />
                {errors.username && <p className="text-red-400 text-sm">{errors.username}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white font-medium" htmlFor="email">
                  Email
                </label>
                <input 
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#0E1015] text-white placeholder:text-gray-400 focus:ring-yellow-500/20 ${
                    errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-yellow-500'
                  }`}
                  id="email" 
                  name="email"
                  placeholder="Digite seu email" 
                  required 
                  type="email" 
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white font-medium" htmlFor="cpf">
                  CPF
                </label>
                <input 
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#0E1015] text-white placeholder:text-gray-400 focus:ring-yellow-500/20 ${
                    errors.cpf ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-yellow-500'
                  }`}
                  id="cpf" 
                  name="cpf"
                  placeholder="000.000.000-00" 
                  required 
                  type="text" 
                  maxLength="14"
                  value={formData.cpf}
                  onChange={(e) => setFormData(prev => ({ ...prev, cpf: formatCPF(e.target.value) }))}
                />
                {errors.cpf && <p className="text-red-400 text-sm">{errors.cpf}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white font-medium" htmlFor="telefone">
                  Telefone (Opcional)
                </label>
                <input 
                  className={`flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#0E1015] text-white placeholder:text-gray-400 focus:ring-yellow-500/20 ${
                    errors.telefone ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-yellow-500'
                  }`}
                  id="telefone" 
                  name="telefone"
                  placeholder="(11) 99999-9999" 
                  type="text" 
                  value={formData.telefone}
                  onChange={handleChange}
                />
                {errors.telefone && <p className="text-red-400 text-sm">{errors.telefone}</p>}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white font-medium" htmlFor="senha">
                  Senha
                </label>
                <div className="relative">
                  <input 
                    className={`flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#0E1015] text-white placeholder:text-gray-400 focus:ring-yellow-500/20 pr-10 ${
                      errors.senha ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-yellow-500'
                    }`}
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
                {errors.senha && <p className="text-red-400 text-sm">{errors.senha}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white font-medium" htmlFor="confirmarSenha">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input 
                    className={`flex h-10 w-full rounded-md border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-[#0E1015] text-white placeholder:text-gray-400 focus:ring-yellow-500/20 pr-10 ${
                      errors.confirmarSenha ? 'border-red-500 focus:border-red-500' : 'border-gray-600 focus:border-yellow-500'
                    }`}
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
                {errors.confirmarSenha && <p className="text-red-400 text-sm">{errors.confirmarSenha}</p>}
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
