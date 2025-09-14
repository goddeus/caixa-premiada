// AUDITORIA ULTRA MEGA MASTER COMPLETA DO SISTEMA
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function auditCompleteSystem() {
  console.log('🔍 AUDITORIA ULTRA MEGA MASTER COMPLETA');
  console.log('========================================');
  
  try {
    // 1. AUDITORIA DAS CAIXAS
    console.log('\n📦 1. AUDITORIA DAS CAIXAS');
    console.log('-------------------------');
    
    const cases = await prisma.case.findMany({
      include: {
        prizes: {
          where: { ativo: true }
        }
      },
      orderBy: { preco: 'asc' }
    });
    
    console.log(`✅ Total de caixas: ${cases.length}`);
    
    cases.forEach((caseItem, index) => {
      console.log(`\n📦 Caixa ${index + 1}:`);
      console.log(`   ID: ${caseItem.id}`);
      console.log(`   Nome: ${caseItem.nome}`);
      console.log(`   Preço: R$ ${caseItem.preco}`);
      console.log(`   Ativa: ${caseItem.ativo ? '✅' : '❌'}`);
      console.log(`   Imagem: ${caseItem.imagem || '❌ Não definida'}`);
      console.log(`   Prêmios: ${caseItem.prizes.length}`);
      
      if (caseItem.prizes.length > 0) {
        console.log('   📋 Prêmios:');
        caseItem.prizes.forEach((prize, prizeIndex) => {
          console.log(`      ${prizeIndex + 1}. ${prize.nome} - R$ ${prize.valor} (${(prize.probabilidade * 100).toFixed(2)}%)`);
        });
      } else {
        console.log('   ⚠️  NENHUM PRÊMIO CONFIGURADO!');
      }
    });
    
    // 2. AUDITORIA DOS PRÊMIOS
    console.log('\n🎁 2. AUDITORIA DOS PRÊMIOS');
    console.log('-------------------------');
    
    const prizes = await prisma.prize.findMany({
      include: {
        case: {
          select: { nome: true }
        }
      },
      orderBy: { valor: 'desc' }
    });
    
    console.log(`✅ Total de prêmios: ${prizes.length}`);
    
    const activePrizes = prizes.filter(p => p.ativo);
    const inactivePrizes = prizes.filter(p => !p.ativo);
    
    console.log(`   Ativos: ${activePrizes.length}`);
    console.log(`   Inativos: ${inactivePrizes.length}`);
    
    // Verificar probabilidades
    const totalProbability = activePrizes.reduce((sum, p) => sum + p.probabilidade, 0);
    console.log(`   Probabilidade total: ${(totalProbability * 100).toFixed(2)}%`);
    
    if (totalProbability > 1.0) {
      console.log('   ⚠️  PROBABILIDADE TOTAL EXCEDE 100%!');
    } else if (totalProbability < 0.8) {
      console.log('   ⚠️  PROBABILIDADE TOTAL MUITO BAIXA!');
    }
    
    // 3. AUDITORIA DOS USUÁRIOS
    console.log('\n👥 3. AUDITORIA DOS USUÁRIOS');
    console.log('-------------------------');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nome: true,
        email: true,
        tipo_conta: true,
        saldo_reais: true,
        saldo_demo: true,
        ativo: true,
        is_admin: true
      }
    });
    
    console.log(`✅ Total de usuários: ${users.length}`);
    
    const normalUsers = users.filter(u => u.tipo_conta === 'normal');
    const demoUsers = users.filter(u => u.tipo_conta === 'afiliado_demo');
    const adminUsers = users.filter(u => u.is_admin);
    const activeUsers = users.filter(u => u.ativo);
    
    console.log(`   Contas normais: ${normalUsers.length}`);
    console.log(`   Contas demo: ${demoUsers.length}`);
    console.log(`   Administradores: ${adminUsers.length}`);
    console.log(`   Usuários ativos: ${activeUsers.length}`);
    
    // 4. AUDITORIA DAS TRANSAÇÕES
    console.log('\n💰 4. AUDITORIA DAS TRANSAÇÕES');
    console.log('-------------------------');
    
    const transactions = await prisma.transaction.findMany({
      select: {
        tipo: true,
        valor: true,
        status: true,
        criado_em: true
      },
      orderBy: { criado_em: 'desc' },
      take: 100
    });
    
    console.log(`✅ Últimas 100 transações analisadas`);
    
    const transactionTypes = {};
    const transactionStatus = {};
    let totalValue = 0;
    
    transactions.forEach(t => {
      transactionTypes[t.tipo] = (transactionTypes[t.tipo] || 0) + 1;
      transactionStatus[t.status] = (transactionStatus[t.status] || 0) + 1;
      totalValue += t.valor;
    });
    
    console.log('   Tipos de transação:');
    Object.entries(transactionTypes).forEach(([type, count]) => {
      console.log(`      ${type}: ${count}`);
    });
    
    console.log('   Status das transações:');
    Object.entries(transactionStatus).forEach(([status, count]) => {
      console.log(`      ${status}: ${count}`);
    });
    
    console.log(`   Valor total: R$ ${totalValue.toFixed(2)}`);
    
    // 5. AUDITORIA DE INCONSISTÊNCIAS
    console.log('\n⚠️  5. AUDITORIA DE INCONSISTÊNCIAS');
    console.log('-------------------------');
    
    let inconsistencies = [];
    
    // Verificar caixas sem prêmios
    const casesWithoutPrizes = cases.filter(c => c.prizes.length === 0);
    if (casesWithoutPrizes.length > 0) {
      inconsistencies.push(`❌ ${casesWithoutPrizes.length} caixas sem prêmios: ${casesWithoutPrizes.map(c => c.nome).join(', ')}`);
    }
    
    // Verificar prêmios sem caixa
    const prizesWithoutCase = await prisma.prize.findMany({
      where: {
        case: null
      }
    });
    if (prizesWithoutCase.length > 0) {
      inconsistencies.push(`❌ ${prizesWithoutCase.length} prêmios sem caixa associada`);
    }
    
    // Verificar preços negativos ou zero
    const invalidPrices = cases.filter(c => c.preco <= 0);
    if (invalidPrices.length > 0) {
      inconsistencies.push(`❌ ${invalidPrices.length} caixas com preço inválido: ${invalidPrices.map(c => c.nome).join(', ')}`);
    }
    
    // Verificar valores de prêmios negativos
    const invalidPrizeValues = prizes.filter(p => p.valor < 0);
    if (invalidPrizeValues.length > 0) {
      inconsistencies.push(`❌ ${invalidPrizeValues.length} prêmios com valor negativo`);
    }
    
    // Verificar probabilidades inválidas
    const invalidProbabilities = prizes.filter(p => p.probabilidade < 0 || p.probabilidade > 1);
    if (invalidProbabilities.length > 0) {
      inconsistencies.push(`❌ ${invalidProbabilities.length} prêmios com probabilidade inválida`);
    }
    
    if (inconsistencies.length > 0) {
      console.log('🚨 INCONSISTÊNCIAS ENCONTRADAS:');
      inconsistencies.forEach(inconsistency => {
        console.log(`   ${inconsistency}`);
      });
    } else {
      console.log('✅ Nenhuma inconsistência encontrada!');
    }
    
    // 6. RESUMO FINAL
    console.log('\n📊 RESUMO FINAL');
    console.log('===============');
    console.log(`📦 Caixas: ${cases.length} (${cases.filter(c => c.ativo).length} ativas)`);
    console.log(`🎁 Prêmios: ${prizes.length} (${activePrizes.length} ativos)`);
    console.log(`👥 Usuários: ${users.length} (${activeUsers.length} ativos)`);
    console.log(`💰 Transações: ${transactions.length} analisadas`);
    console.log(`⚠️  Inconsistências: ${inconsistencies.length}`);
    
    if (inconsistencies.length > 0) {
      console.log('\n🔧 AÇÕES RECOMENDADAS:');
      console.log('   1. Corrigir caixas sem prêmios');
      console.log('   2. Verificar preços e valores inválidos');
      console.log('   3. Ajustar probabilidades dos prêmios');
      console.log('   4. Validar dados de usuários');
    }
    
  } catch (error) {
    console.error('❌ Erro na auditoria:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar auditoria
auditCompleteSystem();
