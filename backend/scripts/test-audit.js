const { PrismaClient } = require('@prisma/client');
const fs = require('fs').promises;
const path = require('path');

const prisma = new PrismaClient();

async function testAudit() {
  try {
    console.log('🔍 Testando auditoria...');
    
    // Testar conexão com banco
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexão com banco OK');
    
    // Testar leitura de pastas
    const imagesPath = path.join(__dirname, '../../../frontend/public/imagens');
    console.log('📁 Caminho das imagens:', imagesPath);
    
    try {
      const folders = await fs.readdir(imagesPath);
      console.log('📂 Pastas encontradas:', folders);
    } catch (error) {
      console.log('❌ Erro ao ler pasta:', error.message);
    }
    
    // Testar consulta de caixas
    const cases = await prisma.case.findMany({
      where: { ativo: true },
      take: 3
    });
    console.log('📦 Caixas encontradas:', cases.length);
    cases.forEach(c => console.log(`  - ${c.nome}`));
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAudit();
