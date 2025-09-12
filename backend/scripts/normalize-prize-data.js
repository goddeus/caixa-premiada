const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function normalizePrizeData() {
  console.log('🔧 NORMALIZAÇÃO DE DADOS DE PRÊMIOS');
  console.log('====================================');
  
  const timestamp = new Date().toISOString();
  const changes = [];
  const errors = [];
  
  try {
    // 1. Corrigir valor_centavos baseado no valor em reais
    console.log('\n1️⃣ Corrigindo valor_centavos...');
    
    const prizes = await prisma.prize.findMany();
    
    for (const prize of prizes) {
      const expectedCentavos = Math.round(prize.valor * 100);
      
      if (prize.valor_centavos !== expectedCentavos) {
        await prisma.prize.update({
          where: { id: prize.id },
          data: { valor_centavos: expectedCentavos }
        });
        
        changes.push({
          type: 'valor_centavos_fixed',
          prize_id: prize.id,
          prize_name: prize.nome,
          old_centavos: prize.valor_centavos,
          new_centavos: expectedCentavos,
          valor_reais: prize.valor
        });
        
        console.log(`✅ ${prize.nome}: ${prize.valor_centavos} → ${expectedCentavos} centavos`);
      }
    }
    
    // 2. Corrigir tipos de prêmios
    console.log('\n2️⃣ Corrigindo tipos de prêmios...');
    
    for (const prize of prizes) {
      let newTipo = prize.tipo;
      let newSorteavel = true;
      
      // Identificar prêmios de cash pelo nome
      if (prize.nome && (
        prize.nome.includes('R$') || 
        prize.nome.includes('reais') ||
        prize.nome.match(/^\d+[,.]?\d*\s*$/)
      )) {
        newTipo = 'cash';
        newSorteavel = true;
      } else if (prize.valor > 1000) {
        // Prêmios > R$ 1000 são ilustrativos
        newTipo = 'ilustrativo';
        newSorteavel = false;
      } else {
        // Outros são produtos
        newTipo = 'produto';
        newSorteavel = true;
      }
      
      if (prize.tipo !== newTipo) {
        await prisma.prize.update({
          where: { id: prize.id },
          data: { 
            tipo: newTipo,
            sorteavel: newSorteavel
          }
        });
        
        changes.push({
          type: 'tipo_corrigido',
          prize_id: prize.id,
          prize_name: prize.nome,
          old_tipo: prize.tipo,
          new_tipo: newTipo,
          sorteavel: newSorteavel,
          valor: prize.valor
        });
        
        console.log(`✅ ${prize.nome}: ${prize.tipo} → ${newTipo} (sorteável: ${newSorteavel})`);
      }
    }
    
    // 3. Corrigir flags ilustrativo
    console.log('\n3️⃣ Corrigindo flags ilustrativo...');
    
    for (const prize of prizes) {
      const shouldBeIlustrativo = prize.valor > 1000;
      
      if (prize.ilustrativo !== shouldBeIlustrativo) {
        await prisma.prize.update({
          where: { id: prize.id },
          data: { 
            ilustrativo: shouldBeIlustrativo,
            sorteavel: !shouldBeIlustrativo
          }
        });
        
        changes.push({
          type: 'flag_ilustrativo_corrigida',
          prize_id: prize.id,
          prize_name: prize.nome,
          old_ilustrativo: prize.ilustrativo,
          new_ilustrativo: shouldBeIlustrativo,
          valor: prize.valor
        });
        
        console.log(`✅ ${prize.nome}: ilustrativo ${prize.ilustrativo} → ${shouldBeIlustrativo}`);
      }
    }
    
    // 4. Gerar labels formatados
    console.log('\n4️⃣ Gerando labels formatados...');
    
    for (const prize of prizes) {
      let label = '';
      
      if (prize.tipo === 'cash') {
        label = `R$ ${prize.valor.toFixed(2).replace('.', ',')}`;
      } else if (prize.tipo === 'produto') {
        label = prize.nome || `Produto - R$ ${prize.valor.toFixed(2).replace('.', ',')}`;
      } else if (prize.tipo === 'ilustrativo') {
        label = `${prize.nome} - R$ ${prize.valor.toFixed(2).replace('.', ',')} (Ilustrativo)`;
      }
      
      if (prize.label !== label) {
        await prisma.prize.update({
          where: { id: prize.id },
          data: { label: label }
        });
        
        changes.push({
          type: 'label_gerado',
          prize_id: prize.id,
          prize_name: prize.nome,
          old_label: prize.label,
          new_label: label
        });
        
        console.log(`✅ ${prize.nome}: label gerado`);
      }
    }
    
    // 5. Relatório final
    console.log('\n📊 RELATÓRIO DE NORMALIZAÇÃO:');
    console.log('==============================');
    console.log(`Total de alterações: ${changes.length}`);
    
    const changesByType = {};
    changes.forEach(change => {
      changesByType[change.type] = (changesByType[change.type] || 0) + 1;
    });
    
    Object.entries(changesByType).forEach(([type, count]) => {
      console.log(`- ${type}: ${count}`);
    });
    
    // Salvar relatório
    const report = {
      timestamp: timestamp,
      total_changes: changes.length,
      changes_by_type: changesByType,
      changes: changes,
      errors: errors
    };
    
    const fs = require('fs');
    const path = require('path');
    
    const reportPath = path.join(__dirname, '..', '..', 'backups', `normalization_report_${timestamp.replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Relatório salvo em: ${reportPath}`);
    console.log('\n✅ Normalização concluída!');
    
  } catch (error) {
    console.error('❌ Erro na normalização:', error);
    errors.push({
      type: 'normalization_error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    await prisma.$disconnect();
  }
}

normalizePrizeData();
