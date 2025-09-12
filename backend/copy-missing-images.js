const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function copyMissingImages() {
  console.log('📋 COPIANDO IMAGENS FALTANDO...\n');

  try {
    // Mapeamento de imagens que precisam ser copiadas
    const imageMappings = [
      // Nike - R$ 50,00
      {
        source: '/imagens/50.png',
        target: '/imagens/CAIXA KIT NIKE/50.png'
      },
      
      // Nike - NIKE (USADO)
      {
        source: '/imagens/nike.png',
        target: '/imagens/CAIXA KIT NIKE/nike.png'
      },
      
      // Weekend - SAMSUNG GALAXY (USADO)
      {
        source: '/imagens/galaxy buds.png',
        target: '/imagens/CAIXA WEEKEND/galaxy buds.png'
      },
      
      // Weekend - R$ 1,00
      {
        source: '/imagens/1.png',
        target: '/imagens/CAIXA WEEKEND/1.png'
      },
      
      // Weekend - R$ 50,00
      {
        source: '/imagens/50.png',
        target: '/imagens/CAIXA WEEKEND/50.png'
      },
      
      // Weekend - REDMI
      {
        source: '/imagens/REDMI NOTE 13.png',
        target: '/imagens/CAIXA WEEKEND/REDMI NOTE 13.png'
      },
      
      // Weekend - R$ 500,00
      {
        source: '/imagens/500.webp',
        target: '/imagens/CAIXA WEEKEND/500.webp'
      },
      
      // Weekend - R$ 100,00
      {
        source: '/imagens/100.png',
        target: '/imagens/CAIXA WEEKEND/100.png'
      },
      
      // Weekend - R$ 2,00
      {
        source: '/imagens/2.png',
        target: '/imagens/CAIXA WEEKEND/2.png'
      }
    ];

    let copiedCount = 0;

    for (const mapping of imageMappings) {
      console.log(`📋 Copiando: ${mapping.source} → ${mapping.target}`);
      
      const sourcePath = path.join(__dirname, '..', 'frontend', 'public', mapping.source);
      const targetPath = path.join(__dirname, '..', 'frontend', 'public', mapping.target);
      
      // Verificar se a imagem fonte existe
      if (!fs.existsSync(sourcePath)) {
        console.log(`   ❌ Imagem fonte não encontrada: ${mapping.source}`);
        continue;
      }
      
      // Criar diretório de destino se não existir
      const targetDir = path.dirname(targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log(`   📁 Diretório criado: ${targetDir}`);
      }
      
      // Copiar imagem
      try {
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`   ✅ Imagem copiada com sucesso`);
        copiedCount++;
      } catch (error) {
        console.log(`   ❌ Erro ao copiar: ${error.message}`);
      }
      
      console.log('');
    }

    console.log('📊 RESUMO DA CÓPIA:');
    console.log(`✅ Imagens copiadas: ${copiedCount}`);

    // Atualizar prêmios no banco
    console.log('\n🔄 ATUALIZANDO PRÊMIOS NO BANCO...');
    
    const prizesToUpdate = [
      { nome: 'R$ 50,00', caseName: 'CAIXA KIT NIKE', newPath: '/imagens/CAIXA KIT NIKE/50.png' },
      { nome: 'NIKE (USADO)', caseName: 'CAIXA KIT NIKE', newPath: '/imagens/CAIXA KIT NIKE/nike.png' },
      { nome: 'SAMSUNG GALAXY (USADO)', caseName: 'CAIXA WEEKEND', newPath: '/imagens/CAIXA WEEKEND/galaxy buds.png' },
      { nome: 'R$ 1,00', caseName: 'CAIXA WEEKEND', newPath: '/imagens/CAIXA WEEKEND/1.png' },
      { nome: 'R$ 50,00', caseName: 'CAIXA WEEKEND', newPath: '/imagens/CAIXA WEEKEND/50.png' },
      { nome: 'REDMI', caseName: 'CAIXA WEEKEND', newPath: '/imagens/CAIXA WEEKEND/REDMI NOTE 13.png' },
      { nome: 'R$ 500,00', caseName: 'CAIXA WEEKEND', newPath: '/imagens/CAIXA WEEKEND/500.webp' },
      { nome: 'R$ 100,00', caseName: 'CAIXA WEEKEND', newPath: '/imagens/CAIXA WEEKEND/100.png' },
      { nome: 'R$ 2,00', caseName: 'CAIXA WEEKEND', newPath: '/imagens/CAIXA WEEKEND/2.png' }
    ];

    let updatedCount = 0;

    for (const update of prizesToUpdate) {
      const caseItem = await prisma.case.findFirst({
        where: { nome: update.caseName }
      });

      if (!caseItem) {
        console.log(`   ❌ Caixa não encontrada: ${update.caseName}`);
        continue;
      }

      const prize = await prisma.prize.findFirst({
        where: { 
          nome: update.nome,
          case_id: caseItem.id
        }
      });

      if (!prize) {
        console.log(`   ❌ Prêmio não encontrado: ${update.nome}`);
        continue;
      }

      await prisma.prize.update({
        where: { id: prize.id },
        data: { 
          imagem_url: update.newPath,
          imagem_id: update.newPath
        }
      });

      console.log(`   ✅ ${update.nome} atualizado: ${update.newPath}`);
      updatedCount++;
    }

    console.log(`\n📊 RESUMO DA ATUALIZAÇÃO:`);
    console.log(`✅ Prêmios atualizados: ${updatedCount}`);

  } catch (error) {
    console.error('❌ Erro durante cópia:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar cópia
copyMissingImages().then(() => {
  console.log('\n✅ CÓPIA FINALIZADA!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
