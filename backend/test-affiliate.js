const { PrismaClient } = require('@prisma/client');
const AffiliateService = require('./src/services/affiliateService');

const prisma = new PrismaClient();

async function testAffiliateSystem() {
  try {
    console.log('🧪 Testando sistema de afiliados...');
    
    // 1. Buscar um usuário admin
    const admin = await prisma.user.findFirst({
      where: { is_admin: true }
    });
    
    if (!admin) {
      console.log('❌ Nenhum usuário admin encontrado');
      return;
    }
    
    console.log(`👤 Testando com usuário: ${admin.email} (${admin.id})`);
    
    // 2. Testar criação de afiliado
    console.log('🔄 Criando conta de afiliado...');
    const affiliate = await AffiliateService.createAffiliate(admin.id);
    console.log('✅ Afiliado criado:', affiliate.codigo_indicacao);
    
    // 3. Testar busca de dados
    console.log('🔍 Buscando dados do afiliado...');
    const affiliateData = await AffiliateService.getAffiliateData(admin.id);
    console.log('✅ Dados encontrados:', {
      codigo: affiliateData.codigo_indicacao,
      link: affiliateData.link,
      stats: affiliateData.stats
    });
    
    console.log('🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAffiliateSystem();
