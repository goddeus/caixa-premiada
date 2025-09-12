const axios = require('axios');

async function testeLoginSimples() {
  try {
    console.log('🔐 TESTE LOGIN SIMPLES');
    console.log('======================');

    // Testar diferentes combinações de login
    const usuarios = [
      { email: 'junior@admin.com', senha: 'password123' },
      { email: 'junior@admin.com', senha: '123456' },
      { email: 'admin@admin.com', senha: 'admin123' },
      { email: 'admin@admin.com', senha: 'password123' }
    ];

    for (const usuario of usuarios) {
      try {
        console.log(`\n🔍 Testando: ${usuario.email}`);
        const response = await axios.post('http://localhost:3001/auth/login', usuario);
        console.log(`✅ Login bem-sucedido!`);
        console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
        console.log(`   User: ${response.data.user.nome}`);
        console.log(`   Saldo: R$ ${response.data.user.saldo}`);
        return response.data.token;
      } catch (error) {
        console.log(`❌ Falhou: ${error.response?.data?.error || error.message}`);
      }
    }

    console.log('\n❌ Nenhum login funcionou');
    return null;

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    return null;
  }
}

testeLoginSimples();

