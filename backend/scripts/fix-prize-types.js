const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPrizeTypes() {
  console.log('🔧 CORREÇÃO DE TIPOS DE PRÊMIOS');
  console.log('================================');
  
  const timestamp = new Date().toISOString();
  const changes = [];
  
  try {
    // Buscar todos os prêmios
    const prizes = await prisma.prize.findMany({
      include: {
        case: {
          select: {
            nome: true
          }
        }
      }
    });

    console.log(`\n📊 Total de prêmios encontrados: ${prizes.length}`);
    
    // 1. Corrigir tipos de prêmios baseado no nome e valor
    console.log('\n1️⃣ Corrigindo tipos de prêmios...');
    
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
    
    // 2. Corrigir flags ilustrativo
    console.log('\n2️⃣ Corrigindo flags ilustrativo...');
    
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
    
    // 3. Gerar labels formatados
    console.log('\n3️⃣ Gerando labels formatados...');
    
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
    
    // 4. Relatório final
    console.log('\n📊 RELATÓRIO DE CORREÇÃO:');
    console.log('==========================');
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
      changes: changes
    };
    
    const fs = require('fs');
    const path = require('path');
    
    const reportPath = path.join(__dirname, '..', '..', 'backups', `fix_report_${timestamp.replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📄 Relatório salvo em: ${reportPath}`);
    console.log('\n✅ Correção concluída!');
    
  } catch (error) {
    console.error('❌ Erro na correção:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPrizeTypes();
