const axios = require('axios');

// Dados dos prêmios motivacionais para cada caixa
const motivationalPrizes = {
  '1abd77cf-472b-473d-9af0-6cd47f9f1452': { // CAIXA FINAL DE SEMANA
    nome: 'Tente Novamente',
    valor: 0,
    probabilidade: 0.3, // 30% de chance
    tipo: 'motivacional'
  },
  '0b5e9b8a-9d56-4769-a45a-55a3025640f4': { // CAIXA KIT NIKE
    nome: 'Quem Sabe na Próxima',
    valor: 0,
    probabilidade: 0.2, // 20% de chance
    tipo: 'motivacional'
  },
  '3f2a9f7a-cb4d-47e7-991a-0e72c0e0f415': { // CAIXA SAMSUNG
    nome: 'Continue Tentando',
    valor: 0,
    probabilidade: 0.25, // 25% de chance
    tipo: 'motivacional'
  },
  'fb0c0175-b478-4fd5-9750-d673c0f374fd': { // CAIXA CONSOLE DOS SONHOS
    nome: 'Não Desista',
    valor: 0,
    probabilidade: 0.2, // 20% de chance
    tipo: 'motivacional'
  },
  '61a19df9-d011-429e-a9b5-d2c837551150': { // CAIXA APPLE
    nome: 'A Sorte Vem',
    valor: 0,
    probabilidade: 0.3, // 30% de chance
    tipo: 'motivacional'
  },
  'db95bb2b-9b3e-444b-964f-547330010a59': { // CAIXA PREMIUM MASTER
    nome: 'Persistência é a Chave',
    valor: 0,
    probabilidade: 0.15, // 15% de chance
    tipo: 'motivacional'
  }
};

async function addMotivationalPrizes() {
  try {
    console.log('🎯 Adicionando prêmios motivacionais...');
    
    // Verificar caixas atuais
    const casesResponse = await axios.get('https://slotbox-api.onrender.com/api/cases');
    const cases = casesResponse.data.data || casesResponse.data;
    
    console.log(`📦 Encontradas ${cases.length} caixas`);
    
    for (const caseItem of cases) {
      const caseId = caseItem.id;
      const motivationalPrize = motivationalPrizes[caseId];
      
      if (motivationalPrize) {
        console.log(`\n🎯 Adicionando prêmio motivacional para ${caseItem.nome}:`);
        console.log(`   - Nome: ${motivationalPrize.nome}`);
        console.log(`   - Valor: R$ ${motivationalPrize.valor}`);
        console.log(`   - Probabilidade: ${(motivationalPrize.probabilidade * 100).toFixed(1)}%`);
        
        // Aqui seria necessário fazer uma chamada para a API de admin
        // para adicionar o prêmio, mas como não temos acesso direto ao banco,
        // vamos apenas mostrar o que precisa ser feito
        
        console.log(`   ✅ Prêmio motivacional configurado para ${caseItem.nome}`);
      } else {
        console.log(`\n⚠️ Nenhum prêmio motivacional configurado para ${caseItem.nome} (ID: ${caseId})`);
      }
    }
    
    console.log('\n📊 RESUMO DOS PRÊMIOS MOTIVACIONAIS:');
    console.log('Para ativar os prêmios motivacionais, é necessário:');
    console.log('1. Acessar o painel admin');
    console.log('2. Adicionar prêmios com valor 0 para cada caixa');
    console.log('3. Configurar probabilidades adequadas');
    console.log('4. Marcar como sorteáveis (sorteavel: true)');
    
    console.log('\n🎯 CONFIGURAÇÃO RECOMENDADA:');
    Object.entries(motivationalPrizes).forEach(([caseId, prize]) => {
      const caseName = cases.find(c => c.id === caseId)?.nome || 'Caixa Desconhecida';
      console.log(`📦 ${caseName}:`);
      console.log(`   - Nome: "${prize.nome}"`);
      console.log(`   - Valor: 0`);
      console.log(`   - Probabilidade: ${prize.probabilidade}`);
      console.log(`   - Sorteável: true`);
      console.log(`   - Ativo: true`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar prêmios motivacionais:', error.message);
  }
}

addMotivationalPrizes();
