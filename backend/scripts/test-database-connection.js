// TESTE DA CONEXÃO COM O BANCO DE DADOS
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('🧪 TESTE DA CONEXÃO COM O BANCO DE DADOS');
  console.log('=========================================');
  
  try {
    // 1. Testar conexão básica
    console.log('\n🔌 1. TESTANDO CONEXÃO BÁSICA...');
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida');
    
    // 2. Testar query simples
    console.log('\n📊 2. TESTANDO QUERY SIMPLES...');
    const userCount = await prisma.user.count();
    console.log(`✅ Total de usuários: ${userCount}`);
    
    // 3. Testar query de caixas
    console.log('\n📦 3. TESTANDO QUERY DE CAIXAS...');
    const caseCount = await prisma.case.count();
    console.log(`✅ Total de caixas: ${caseCount}`);
    
    // 4. Testar query de prêmios
    console.log('\n🎁 4. TESTANDO QUERY DE PRÊMIOS...');
    const prizeCount = await prisma.prize.count();
    console.log(`✅ Total de prêmios: ${prizeCount}`);
    
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ Banco de dados funcionando corretamente');
    
  } catch (error) {
    console.error('❌ Erro na conexão com banco:', error.message);
    console.error('📊 Stack trace:', error.stack);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n🔍 ANÁLISE DO ERRO:');
      console.log('   - Servidor de banco não está acessível');
      console.log('   - Possível problema de rede ou configuração');
      console.log('   - Verificar se o banco está rodando');
      console.log('   - Verificar se as credenciais estão corretas');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testDatabaseConnection();
