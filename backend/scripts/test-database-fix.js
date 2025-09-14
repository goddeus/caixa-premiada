// TESTE DA CORREÇÃO DO BANCO DE DADOS
const { PrismaClient } = require('@prisma/client');

async function testDatabaseFix() {
  console.log('🧪 TESTE DA CORREÇÃO DO BANCO DE DADOS');
  console.log('=======================================');
  
  try {
    // 1. Verificar variáveis de ambiente
    console.log('\n🔧 1. VERIFICANDO VARIÁVEIS DE AMBIENTE...');
    const databaseUrl = process.env.DATABASE_URL;
    
    if (databaseUrl) {
      console.log('✅ DATABASE_URL encontrada');
      console.log(`📊 URL: ${databaseUrl.substring(0, 20)}...`);
    } else {
      console.log('❌ DATABASE_URL não encontrada');
      console.log('🔍 Verificar arquivo .env');
    }
    
    // 2. Testar conexão com configuração atual
    console.log('\n🔌 2. TESTANDO CONEXÃO COM CONFIGURAÇÃO ATUAL...');
    const prisma = new PrismaClient();
    
    try {
      await prisma.$connect();
      console.log('✅ Conexão estabelecida com sucesso');
      
      // Testar query simples
      const userCount = await prisma.user.count();
      console.log(`✅ Total de usuários: ${userCount}`);
      
    } catch (error) {
      console.error('❌ Erro na conexão:', error.message);
      
      if (error.message.includes('Can\'t reach database server')) {
        console.log('\n🔍 ANÁLISE DO ERRO:');
        console.log('   - Servidor de banco não está acessível');
        console.log('   - Possível problema de rede ou configuração');
        console.log('   - Verificar se o banco está rodando');
        console.log('   - Verificar se as credenciais estão corretas');
        
        console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
        console.log('   1. Verificar se o banco está rodando');
        console.log('   2. Verificar se as credenciais estão corretas');
        console.log('   3. Verificar se a URL do banco está correta');
        console.log('   4. Verificar se há problemas de rede');
        console.log('   5. Verificar se o banco está acessível externamente');
      }
    } finally {
      await prisma.$disconnect();
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testDatabaseFix();
