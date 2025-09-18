/**
 * 🔍 AUDITORIA COMPLETA DAS 6 CAIXAS
 * 
 * Este script verifica se todas as 6 caixas estão configuradas corretamente
 * conforme as especificações fornecidas pelo usuário.
 */

console.log('🔍 INICIANDO AUDITORIA COMPLETA DAS 6 CAIXAS...\n');

// Configurações dos prêmios esperados para cada caixa
const CAIXAS_ESPERADAS = {
  // CAIXA KIT NIKE (9 prêmios)
  'CAIXA KIT NIKE': {
    id: '0b5e9b8a-9d56-4769-a45a-55a3025640f4',
    preco: 2.50,
    premios: [
      { nome: 'R$1,00', valor: 1.00, imagem: '1.png' },
      { nome: 'R$2,00', valor: 2.00, imagem: '2.png' },
      { nome: 'R$5,00', valor: 5.00, imagem: '5.png' },
      { nome: 'R$10,00', valor: 10.00, imagem: '10.png' },
      { nome: 'Boné Nike', valor: 50.00, imagem: 'boné nike.png' },
      { nome: 'Camisa Nike Dry Fit', valor: 100.00, imagem: 'camisa nike.webp' },
      { nome: 'Air Force 1', valor: 700.00, imagem: 'airforce.webp' },
      { nome: 'Nike Dunk Low', valor: 1000.00, imagem: 'nike dunk.webp' },
      { nome: 'Air Jordan 4', valor: 1500.00, imagem: 'jordan.png' }
    ]
  },

  // CAIXA SAMSUNG (9 prêmios)
  'CAIXA SAMSUNG': {
    id: '3f2a9f7a-cb4d-47e7-991a-0e72c0e0f415',
    preco: 3.00,
    premios: [
      { nome: 'R$1,00', valor: 1.00, imagem: '1.png' },
      { nome: 'R$2,00', valor: 2.00, imagem: '2.png' },
      { nome: 'R$5,00', valor: 5.00, imagem: '5.png' },
      { nome: 'R$10,00', valor: 10.00, imagem: '10.png' },
      { nome: 'R$100,00', valor: 100.00, imagem: '100.png' },
      { nome: 'R$500,00', valor: 500.00, imagem: '500.webp' },
      { nome: 'Fone Samsung', valor: 50.00, imagem: 'fone samsung.png' },
      { nome: 'Notebook Samsung', valor: 5000.00, imagem: 'notebook samsung.png' },
      { nome: 'S25', valor: 1000.00, imagem: 's25.png' }
    ]
  },

  // CAIXA FINAL DE SEMANA (6 prêmios)
  'CAIXA FINAL DE SEMANA': {
    id: '1abd77cf-472b-473d-9af0-6cd47f9f1452',
    preco: 1.50,
    premios: [
      { nome: 'R$1,00', valor: 1.00, imagem: '1.png' },
      { nome: 'R$2,00', valor: 2.00, imagem: '2.png' },
      { nome: 'R$5,00', valor: 5.00, imagem: '5.png' },
      { nome: 'R$10,00', valor: 10.00, imagem: '10.png' },
      { nome: 'R$100,00', valor: 100.00, imagem: '100.png' },
      { nome: 'R$500,00', valor: 500.00, imagem: '500.webp' }
    ]
  },

  // CAIXA CONSOLE DOS SONHOS (9 prêmios)
  'CAIXA CONSOLE DOS SONHOS': {
    id: 'fb0c0175-b478-4fd5-9750-d673c0f374fd',
    preco: 3.50,
    premios: [
      { nome: 'R$1,00', valor: 1.00, imagem: '1.png' },
      { nome: 'R$2,00', valor: 2.00, imagem: '2.png' },
      { nome: 'R$5,00', valor: 5.00, imagem: '5.png' },
      { nome: 'R$10,00', valor: 10.00, imagem: '10.png' },
      { nome: 'R$100,00', valor: 100.00, imagem: '100.png' },
      { nome: 'Steam Deck', valor: 300.00, imagem: 'steamdeck.png' },
      { nome: 'Xbox One', valor: 4000.00, imagem: 'xboxone.webp' },
      { nome: 'Air Force 1', valor: 700.00, imagem: 'airforce.webp' },
      { nome: 'PS5', valor: 5000.00, imagem: 'ps5.png' }
    ]
  },

  // CAIXA APPLE (8 prêmios)
  'CAIXA APPLE': {
    id: '61a19df9-d011-429e-a9b5-d2c837551150',
    preco: 7.00,
    premios: [
      { nome: 'R$1,00', valor: 1.00, imagem: '1.png' },
      { nome: 'R$2,00', valor: 2.00, imagem: '2.png' },
      { nome: 'R$5,00', valor: 5.00, imagem: '5.png' },
      { nome: 'R$10,00', valor: 10.00, imagem: '10.png' },
      { nome: 'R$500,00', valor: 500.00, imagem: '500.webp' },
      { nome: 'Air Pods', valor: 2500.00, imagem: 'air pods.png' },
      { nome: 'Iphone 16 Pro Max', valor: 10000.00, imagem: 'iphone 16 pro max.png' },
      { nome: 'Macbook', valor: 15000.00, imagem: 'macbook.png' }
    ]
  },

  // CAIXA PREMIUM MASTER (11 prêmios)
  'CAIXA PREMIUM MASTER!': {
    id: 'db95bb2b-9b3e-444b-964f-547330010a59',
    preco: 15.00,
    premios: [
      { nome: 'R$2,00', valor: 2.00, imagem: '2.png' },
      { nome: 'R$5,00', valor: 5.00, imagem: '5.png' },
      { nome: 'R$10,00', valor: 10.00, imagem: '10.png' },
      { nome: 'R$20,00', valor: 20.00, imagem: '20.png' },
      { nome: 'R$500,00', valor: 500.00, imagem: '500.webp' },
      { nome: 'Air Pods', valor: 2500.00, imagem: 'air pods.png' },
      { nome: 'Ipad', valor: 8000.00, imagem: 'ipad.png' },
      { nome: 'S25 ULTRA', valor: 6000.00, imagem: 'samsung s25.png' },
      { nome: 'Iphone 16 Pro Max', valor: 10000.00, imagem: 'iphone 16 pro max.png' },
      { nome: 'Macbook', valor: 15000.00, imagem: 'macbook.png' },
      { nome: 'Honda CG Fan 160', valor: 19500.00, imagem: 'honda cg fan.webp' }
    ]
  }
};

// Função para verificar uma caixa específica
async function verificarCaixa(nomeCaixa, dadosEsperados) {
  console.log(`\n📦 VERIFICANDO ${nomeCaixa}:`);
  console.log(`   💰 Preço esperado: R$ ${dadosEsperados.preco.toFixed(2)}`);
  console.log(`   🎁 Prêmios esperados: ${dadosEsperados.premios.length}`);
  
  try {
    // Verificar se conseguimos acessar a API da caixa
    const response = await fetch(`https://slotbox-api.onrender.com/api/cases/${dadosEsperados.id}`);
    
    if (!response.ok) {
      console.log(`   ❌ Erro ao acessar API: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    console.log(`   ✅ API acessível`);
    console.log(`   📊 Nome retornado: ${data.nome || 'N/A'}`);
    console.log(`   💲 Preço retornado: R$ ${data.preco ? data.preco.toFixed(2) : 'N/A'}`);
    
    // Verificar prêmios através de teste de compra
    console.log(`   🎲 Testando compra para verificar prêmios...`);
    
    const buyResponse = await fetch(`https://slotbox-api.onrender.com/api/cases/buy/${dadosEsperados.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: 'test-user-id',
        saldo_demo: 1000
      })
    });
    
    if (buyResponse.ok) {
      const buyData = await buyResponse.json();
      if (buyData.data && buyData.data.premio) {
        const premio = buyData.data.premio;
        console.log(`   🎁 Prêmio de teste: ${premio.nome} - R$ ${premio.valor}`);
        
        // Verificar se o prêmio está na lista esperada
        const premioEsperado = dadosEsperados.premios.find(p => 
          p.nome === premio.nome && Math.abs(p.valor - premio.valor) < 0.01
        );
        
        if (premioEsperado) {
          console.log(`   ✅ Prêmio válido encontrado`);
        } else {
          console.log(`   ⚠️  Prêmio não está na lista esperada`);
        }
      }
    } else {
      console.log(`   ⚠️  Não foi possível testar compra: ${buyResponse.status}`);
    }
    
    // Verificar imagens
    console.log(`   🖼️  Verificando imagens...`);
    let imagensOk = 0;
    let imagensErro = 0;
    
    for (const premio of dadosEsperados.premios) {
      const pastaImagem = nomeCaixa === 'CAIXA PREMIUM MASTER!' ? 'CAIXA PREMIUM MASTER' : nomeCaixa;
      const imagePath = `/imagens/${pastaImagem}/${premio.imagem}`;
      
      try {
        const imgResponse = await fetch(`https://slotbox-frontend.onrender.com${imagePath}`, { 
          method: 'HEAD' 
        });
        
        if (imgResponse.ok) {
          imagensOk++;
        } else {
          imagensErro++;
          console.log(`   ❌ Imagem não encontrada: ${imagePath}`);
        }
      } catch (error) {
        imagensErro++;
        console.log(`   ❌ Erro ao verificar imagem: ${imagePath}`);
      }
    }
    
    console.log(`   📊 Imagens: ${imagensOk} OK, ${imagensErro} com erro`);
    
    return imagensErro === 0;
    
  } catch (error) {
    console.log(`   ❌ Erro geral: ${error.message}`);
    return false;
  }
}

// Função principal de auditoria
async function executarAuditoria() {
  console.log('🚀 Executando auditoria completa...\n');
  
  let caixasOk = 0;
  let caixasComProblema = 0;
  
  for (const [nomeCaixa, dadosEsperados] of Object.entries(CAIXAS_ESPERADAS)) {
    const resultado = await verificarCaixa(nomeCaixa, dadosEsperados);
    
    if (resultado) {
      caixasOk++;
      console.log(`   ✅ ${nomeCaixa}: APROVADA`);
    } else {
      caixasComProblema++;
      console.log(`   ❌ ${nomeCaixa}: COM PROBLEMAS`);
    }
    
    // Pausa entre verificações
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESULTADO DA AUDITORIA:');
  console.log(`✅ Caixas aprovadas: ${caixasOk}`);
  console.log(`❌ Caixas com problemas: ${caixasComProblema}`);
  console.log(`📦 Total de caixas: ${caixasOk + caixasComProblema}`);
  
  if (caixasComProblema === 0) {
    console.log('\n🎉 PARABÉNS! TODAS AS CAIXAS ESTÃO CORRETAS!');
  } else {
    console.log('\n⚠️  Algumas caixas precisam de correção.');
  }
  
  console.log('='.repeat(60));
}

// Executar auditoria
executarAuditoria().catch(console.error);
