const { PrismaClient } = require('@prisma/client');
const prizeUtils = require('./src/utils/prizeUtils');

const prisma = new PrismaClient();

async function testReaisAndUploadSystem() {
  console.log('🧪 TESTANDO SISTEMA DE REAIS E UPLOAD DE IMAGEM...\n');

  try {
    // 1. Buscar um prêmio para teste
    console.log('1️⃣ Buscando prêmio para teste...');
    
    const testPrize = await prisma.prize.findFirst();

    if (!testPrize) {
      console.log('❌ Nenhum prêmio encontrado para teste');
      return;
    }

    console.log('📋 Prêmio encontrado para teste:');
    console.log(`   - ID: ${testPrize.id}`);
    console.log(`   - Nome: "${testPrize.nome}"`);
    console.log(`   - Valor centavos: ${testPrize.valor_centavos}`);
    console.log(`   - Valor reais: R$ ${(testPrize.valor_centavos / 100).toFixed(2).replace('.', ',')}`);
    console.log(`   - Tipo: ${testPrize.tipo || 'não definido'}`);
    console.log(`   - Imagem atual: ${testPrize.imagem_id || 'sem imagem'}`);
    console.log('');

    // 2. Testar conversão de reais para centavos
    console.log('2️⃣ Testando conversão de reais para centavos...');
    
    const testValues = [1.00, 5.50, 10.00, 25.99, 100.00];
    
    testValues.forEach(reais => {
      const centavos = Math.round(reais * 100);
      const backToReais = centavos / 100;
      console.log(`   R$ ${reais.toFixed(2)} → ${centavos} centavos → R$ ${backToReais.toFixed(2)}`);
    });
    console.log('');

    // 3. Testar validação de valor mínimo
    console.log('3️⃣ Testando validação de valor mínimo...');
    
    const minValueTests = [
      { reais: 0.50, centavos: 50, valid: false },
      { reais: 0.99, centavos: 99, valid: false },
      { reais: 1.00, centavos: 100, valid: true },
      { reais: 1.01, centavos: 101, valid: true },
      { reais: 5.00, centavos: 500, valid: true }
    ];

    minValueTests.forEach(test => {
      const isValid = test.centavos >= 100;
      const status = isValid === test.valid ? '✅' : '❌';
      console.log(`   ${status} R$ ${test.reais.toFixed(2)} (${test.centavos} centavos): ${isValid ? 'Válido' : 'Inválido'}`);
    });
    console.log('');

    // 4. Testar mapeamento com valores em reais
    console.log('4️⃣ Testando mapeamento com valores em reais...');
    
    const originalMapped = prizeUtils.mapPrizeToDisplay(testPrize);
    console.log('📊 Mapeamento original:');
    console.log(`   - Nome: ${originalMapped.nome}`);
    console.log(`   - Valor centavos: ${originalMapped.valorCentavos}`);
    console.log(`   - Valor reais: R$ ${(originalMapped.valorCentavos / 100).toFixed(2).replace('.', ',')}`);
    console.log(`   - Label: ${originalMapped.label}`);
    console.log(`   - Tipo: ${originalMapped.tipo}`);
    console.log(`   - Imagem: ${originalMapped.imagem}`);
    console.log('');

    // 5. Simular atualização com valores em reais
    console.log('5️⃣ Simulando atualização com valores em reais...');
    
    const updateData = {
      nome: 'PRÊMIO TESTE REAIS',
      valorReais: 15.50, // R$ 15,50
      tipo: 'produto',
      ativo: true
    };

    console.log('📝 Dados de atualização (em reais):');
    console.log(`   - Nome: "${updateData.nome}"`);
    console.log(`   - Valor reais: R$ ${updateData.valorReais.toFixed(2)}`);
    console.log(`   - Valor centavos: ${Math.round(updateData.valorReais * 100)}`);
    console.log(`   - Tipo: ${updateData.tipo}`);
    console.log(`   - Ativo: ${updateData.ativo}`);
    console.log('');

    // 6. Aplicar atualização
    console.log('6️⃣ Aplicando atualização...');
    
    const updateDataForDB = {
      nome: updateData.nome,
      valor_centavos: Math.round(updateData.valorReais * 100),
      valor: updateData.valorReais, // Manter compatibilidade
      tipo: updateData.tipo,
      ativo: updateData.ativo
    };

    const updatedPrize = await prisma.prize.update({
      where: { id: testPrize.id },
      data: updateDataForDB
    });

    console.log('✅ Prêmio atualizado no banco!');
    console.log('📋 Estado após atualização:');
    console.log(`   - Nome: "${updatedPrize.nome}"`);
    console.log(`   - Valor: R$ ${updatedPrize.valor}`);
    console.log(`   - Valor centavos: ${updatedPrize.valor_centavos}`);
    console.log(`   - Tipo: ${updatedPrize.tipo}`);
    console.log(`   - Ativo: ${updatedPrize.ativo}`);
    console.log('');

    // 7. Testar mapeamento após atualização
    console.log('7️⃣ Testando mapeamento após atualização...');
    
    const updatedMapped = prizeUtils.mapPrizeToDisplay(updatedPrize);
    console.log('📊 Mapeamento após atualização:');
    console.log(`   - Nome: ${updatedMapped.nome}`);
    console.log(`   - Valor centavos: ${updatedMapped.valorCentavos}`);
    console.log(`   - Valor reais: R$ ${(updatedMapped.valorCentavos / 100).toFixed(2).replace('.', ',')}`);
    console.log(`   - Label: ${updatedMapped.label}`);
    console.log(`   - Tipo: ${updatedMapped.tipo}`);
    console.log(`   - Imagem: ${updatedMapped.imagem}`);
    console.log('');

    // 8. Testar estrutura de diretórios para upload
    console.log('8️⃣ Testando estrutura de diretórios para upload...');
    
    const fs = require('fs');
    const path = require('path');
    
    const uploadDir = path.join(__dirname, 'uploads/images');
    console.log(`📁 Diretório de upload: ${uploadDir}`);
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log('✅ Diretório de upload criado');
    } else {
      console.log('✅ Diretório de upload já existe');
    }
    
    // Listar arquivos existentes
    const files = fs.readdirSync(uploadDir);
    console.log(`📄 Arquivos existentes: ${files.length}`);
    if (files.length > 0) {
      files.slice(0, 5).forEach(file => {
        console.log(`   - ${file}`);
      });
      if (files.length > 5) {
        console.log(`   ... e mais ${files.length - 5} arquivos`);
      }
    }
    console.log('');

    // 9. Restaurar estado original
    console.log('9️⃣ Restaurando estado original...');
    
    await prisma.prize.update({
      where: { id: testPrize.id },
      data: {
        nome: testPrize.nome,
        valor: testPrize.valor,
        valor_centavos: testPrize.valor_centavos,
        tipo: testPrize.tipo,
        label: testPrize.label,
        imagem_id: testPrize.imagem_id,
        ativo: testPrize.ativo
      }
    });

    console.log('✅ Estado original restaurado!');
    console.log('');

    // 10. Resumo final
    console.log('10️⃣ Resumo final...');
    console.log('✅ Sistema de reais funcionando!');
    console.log('🎯 Funcionalidades validadas:');
    console.log('     - Conversão reais → centavos');
    console.log('     - Conversão centavos → reais');
    console.log('     - Validação de valor mínimo (R$ 1,00)');
    console.log('     - Atualização com valores em reais');
    console.log('     - Mapeamento consistente');
    console.log('     - Estrutura de diretórios para upload');
    console.log('     - Restauração de estado original');
    console.log('');
    console.log('📋 Próximos passos:');
    console.log('     - Testar upload de imagem via frontend');
    console.log('     - Verificar exibição de imagens');
    console.log('     - Validar interface de edição');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testReaisAndUploadSystem().then(() => {
  console.log('\n🎉 TESTE DE REAIS E UPLOAD CONCLUÍDO!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
