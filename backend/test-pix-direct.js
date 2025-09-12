const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const axios = require('axios');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3001';

async function testPixDirect() {
  try {
    console.log('🧪 Teste direto do PIX QR Code...\n');

    // 1. Criar usuário de teste
    console.log('1️⃣ Criando usuário de teste...');
    
    // Deletar se existir
    await prisma.user.deleteMany({
      where: { email: 'teste-pix@test.com' }
    });

    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const user = await prisma.user.create({
      data: {
        nome: 'Teste PIX',
        email: 'teste-pix@test.com',
        senha_hash: hashedPassword,
        cpf: '22255588899',
        tipo_conta: 'normal',
        saldo: 100.00,
        primeiro_deposito_feito: true
      }
    });

    // Criar carteira
    await prisma.wallet.create({
      data: {
        user_id: user.id,
        saldo: 100.00
      }
    });

    console.log('✅ Usuário criado:', user.email);

    // 2. Fazer login
    console.log('\n2️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'teste-pix@test.com',
      senha: '123456'
    });
    
    const authToken = loginResponse.data.token;
    console.log('✅ Login realizado:', loginResponse.data.user.nome);

    // 3. Testar depósito PIX
    console.log('\n3️⃣ Testando depósito PIX...');
    const pixDepositResponse = await axios.post(`${BASE_URL}/payments/deposit/pix`, {
      valor: 50.00
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Resposta do depósito PIX:');
    console.log('   - Payment ID:', pixDepositResponse.data.payment_id);
    console.log('   - Valor:', pixDepositResponse.data.valor);
    console.log('   - QR Code presente:', pixDepositResponse.data.qr_code ? 'SIM' : 'NÃO');
    console.log('   - PIX Copy Paste presente:', pixDepositResponse.data.pix_copy_paste ? 'SIM' : 'NÃO');
    console.log('   - Expira em:', pixDepositResponse.data.expires_at);
    
    if (pixDepositResponse.data.qr_code) {
      console.log('\n🎉 QR Code PIX gerado com sucesso!');
      console.log('📱 QR Code (base64):', pixDepositResponse.data.qr_code.substring(0, 50) + '...');
      console.log('📋 PIX Copy Paste:', pixDepositResponse.data.pix_copy_paste);
    } else {
      console.log('\n❌ PROBLEMA: QR Code PIX não foi gerado!');
    }

    // 4. Verificar no banco de dados
    console.log('\n4️⃣ Verificando no banco de dados...');
    const payment = await prisma.payment.findFirst({
      where: { user_id: user.id },
      orderBy: { criado_em: 'desc' }
    });
    
    if (payment) {
      console.log('✅ Pagamento salvo no banco:');
      console.log('   - ID:', payment.id);
      console.log('   - Valor:', payment.valor);
      console.log('   - Status:', payment.status);
      console.log('   - QR Code salvo:', payment.qr_code ? 'SIM' : 'NÃO');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('   Detalhes:', JSON.stringify(error.response.data, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testPixDirect();
