const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPrizes() {
  try {
    console.log('🔍 Verificando prêmios com valor 0...');
    
    const prizes = await prisma.prize.findMany({
      where: {
        valor: 0,
        ativo: true
      },
      select: {
        id: true,
        nome: true,
        valor: true,
        probabilidade: true,
        case_id: true,
        ativo: true,
        sorteavel: true
      }
    });
    
    console.log('📊 Prêmios com valor 0 encontrados:', prizes.length);
    prizes.forEach(prize => {
      console.log(`- ${prize.nome} (ID: ${prize.id}) - Probabilidade: ${prize.probabilidade} - Sorteável: ${prize.sorteavel}`);
    });
    
    console.log('\n🔍 Verificando todas as caixas e seus prêmios...');
    const cases = await prisma.case.findMany({
      include: {
        prizes: {
          where: { ativo: true },
          select: {
            id: true,
            nome: true,
            valor: true,
            probabilidade: true,
            sorteavel: true
          }
        }
      }
    });
    
    cases.forEach(caseItem => {
      console.log(`\n📦 ${caseItem.nome} (ID: ${caseItem.id}):`);
      caseItem.prizes.forEach(prize => {
        console.log(`  - ${prize.nome}: R$ ${prize.valor} (prob: ${prize.probabilidade}, sorteável: ${prize.sorteavel})`);
      });
    });
    
    console.log('\n🎯 Verificando configuração de RTP...');
    const rtpConfig = await prisma.rTPConfig.findFirst();
    if (rtpConfig) {
      console.log(`📊 RTP Configurado: ${rtpConfig.rtp_target}%`);
      console.log(`📊 RTP Ativo: ${rtpConfig.ativo}`);
    } else {
      console.log('❌ Nenhuma configuração de RTP encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPrizes();
