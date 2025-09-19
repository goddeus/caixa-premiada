const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testMigration() {
  console.log('🧪 Testando migração automática...\n');
  
  try {
    // Teste 1: Verificar se as colunas existem
    console.log('1️⃣ Verificando colunas existentes...');
    
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('username', 'telefone')
    `;
    
    const existingColumns = await prisma.$queryRawUnsafe(checkColumnsQuery);
    const existingColumnNames = existingColumns.map(col => col.column_name);
    
    console.log('📋 Colunas encontradas:', existingColumnNames);
    
    if (existingColumnNames.includes('username') && existingColumnNames.includes('telefone')) {
      console.log('✅ Migração já foi executada - colunas existem');
    } else {
      console.log('⚠️  Migração necessária - colunas faltando');
    }
    
    // Teste 2: Verificar estrutura da tabela User
    console.log('\n2️⃣ Verificando estrutura da tabela User...');
    
    const tableStructure = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Estrutura da tabela User:');
    tableStructure.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Teste 3: Verificar se há usuários com username
    console.log('\n3️⃣ Verificando usuários com username...');
    
    const usersWithUsername = await prisma.user.findMany({
      where: {
        username: {
          not: null
        }
      },
      select: {
        id: true,
        nome: true,
        username: true,
        email: true
      },
      take: 5
    });
    
    console.log(`📊 Usuários com username: ${usersWithUsername.length}`);
    usersWithUsername.forEach(user => {
      console.log(`   - ${user.nome} (${user.username}) - ${user.email}`);
    });
    
    // Teste 4: Verificar se há usuários com telefone
    console.log('\n4️⃣ Verificando usuários com telefone...');
    
    const usersWithPhone = await prisma.user.findMany({
      where: {
        telefone: {
          not: null
        }
      },
      select: {
        id: true,
        nome: true,
        telefone: true,
        email: true
      },
      take: 5
    });
    
    console.log(`📊 Usuários com telefone: ${usersWithPhone.length}`);
    usersWithPhone.forEach(user => {
      console.log(`   - ${user.nome} (${user.telefone}) - ${user.email}`);
    });
    
    // Teste 5: Verificar índices
    console.log('\n5️⃣ Verificando índices...');
    
    const indexes = await prisma.$queryRawUnsafe(`
      SELECT indexname, indexdef
      FROM pg_indexes 
      WHERE tablename = 'User'
      AND indexname LIKE '%username%'
    `);
    
    console.log(`📊 Índices relacionados ao username: ${indexes.length}`);
    indexes.forEach(idx => {
      console.log(`   - ${idx.indexname}`);
    });
    
    console.log('\n🎉 Teste de migração concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste de migração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testMigration();
