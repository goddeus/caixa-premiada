const { PrismaClient } = require('@prisma/client');
const AffiliateService = require('./src/services/affiliateService');

const prisma = new PrismaClient();

async function updateAllUsersToAffiliates() {
  try {
    console.log('🔄 Iniciando atualização de todas as contas para afiliados...');
    
    // Buscar todos os usuários que não são afiliados
    const users = await prisma.user.findMany({
      where: {
        affiliate: null // Usuários sem conta de afiliado
      },
      select: {
        id: true,
        nome: true,
        email: true
      }
    });
    
    console.log(`📊 Encontrados ${users.length} usuários sem conta de afiliado`);
    
    let created = 0;
    let errors = 0;
    
    for (const user of users) {
      try {
        console.log(`🔄 Criando afiliado para: ${user.email}`);
        
        const affiliate = await AffiliateService.createAffiliate(user.id);
        
        console.log(`✅ Afiliado criado: ${user.email} - Código: ${affiliate.codigo_indicacao}`);
        created++;
        
      } catch (error) {
        console.error(`❌ Erro ao criar afiliado para ${user.email}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n📊 Resumo:');
    console.log(`✅ Afiliados criados: ${created}`);
    console.log(`❌ Erros: ${errors}`);
    console.log(`📈 Total processados: ${users.length}`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  updateAllUsersToAffiliates();
}

module.exports = updateAllUsersToAffiliates;
