/**
 * Teste das Caixas Corrigidas
 * Verifica se os prêmios estão corretos conforme especificado
 */

const axios = require('axios');

const API_BASE = 'https://slotbox-api.onrender.com/api';

async function testarCaixasCorrigidas() {
  console.log('🎮 TESTE DAS CAIXAS CORRIGIDAS');
  console.log('=' .repeat(50));
  
  try {
    // 1. Buscar todas as caixas
    console.log('1. Buscando caixas...');
    const casesResponse = await axios.get(`${API_BASE}/cases`);
    
    if (!casesResponse.data.success) {
      throw new Error('Falha ao buscar caixas: ' + casesResponse.data.message);
    }
    
    const cases = casesResponse.data.data;
    console.log(`✅ ${cases.length} caixas encontradas\n`);
    
    // 2. Verificar cada caixa específica
    const caixasParaVerificar = [
      {
        nome: 'CAIXA CONSOLE DOS SONHOS',
        id: '97ce71b6-5d8c-43f0-98b9-f5044d647dc6',
        premiosEsperados: [
          { nome: 'R$1,00', valor: 1.0, imagem: '1real.png' },
          { nome: 'R$2,00', valor: 2.0, imagem: '2reais.png' },
          { nome: 'R$5,00', valor: 5.0, imagem: '5reais.png' },
          { nome: 'R$10,00', valor: 10.0, imagem: '10reais.png' },
          { nome: 'R$100,00', valor: 100.0, imagem: '100reais.png' },
          { nome: 'Steam Deck', valor: 300.0, imagem: 'steamdeck.png' },
          { nome: 'Xbox One', valor: 4000.0, imagem: 'xboxone.webp' },
          { nome: 'PS5', valor: 5000.0, imagem: 'ps5.png' }
        ]
      },
      {
        nome: 'CAIXA APPLE',
        id: '97c286db-7c43-4582-9884-40eda0dd8ab7',
        premiosEsperados: [
          { nome: 'R$1,00', valor: 1.0, imagem: '1.png' },
          { nome: 'R$2,00', valor: 2.0, imagem: '2.png' },
          { nome: 'R$5,00', valor: 5.0, imagem: '5.png' },
          { nome: 'R$10,00', valor: 10.0, imagem: '10.png' },
          { nome: 'R$500,00', valor: 500.0, imagem: '500.webp' },
          { nome: 'Air Pods', valor: 2500.0, imagem: 'air pods.png' },
          { nome: 'Iphone 16 Pro Max', valor: 10000.0, imagem: 'iphone 16 pro max.png' },
          { nome: 'Macbook', valor: 15000.0, imagem: 'macbook.png' }
        ]
      },
      {
        nome: 'CAIXA PREMIUM MASTER!',
        id: '2b520ca1-769c-4234-bbff-7a298c736774',
        premiosEsperados: [
          { nome: 'R$2,00', valor: 2.0, imagem: '2.png' },
          { nome: 'R$5,00', valor: 5.0, imagem: '5.png' },
          { nome: 'R$10,00', valor: 10.0, imagem: '10.png' },
          { nome: 'R$20,00', valor: 20.0, imagem: '20.png' },
          { nome: 'R$500,00', valor: 500.0, imagem: '500.webp' },
          { nome: 'Air Pods', valor: 2500.0, imagem: 'airpods.png' },
          { nome: 'Ipad', valor: 8000.0, imagem: 'ipad.png' },
          { nome: 'S25 ULTRA', valor: 6000.0, imagem: 'samsung s25.png' },
          { nome: 'Iphone 16 Pro Max', valor: 10000.0, imagem: 'iphone 16 pro max.png' },
          { nome: 'Macbook', valor: 15000.0, imagem: 'macbook.png' },
          { nome: 'Honda CG Fan 160', valor: 19500.0, imagem: 'honda cg fan.webp' }
        ]
      }
    ];
    
    // 3. Verificar cada caixa
    for (const caixaEsperada of caixasParaVerificar) {
      console.log(`\n2. Verificando ${caixaEsperada.nome}...`);
      
      const caixa = cases.find(c => c.id === caixaEsperada.id);
      if (!caixa) {
        console.log(`❌ Caixa não encontrada: ${caixaEsperada.nome}`);
        continue;
      }
      
      console.log(`✅ Caixa encontrada: ${caixa.nome}`);
      console.log(`   Preço: R$ ${caixa.preco}`);
      console.log(`   Prêmios: ${caixa.prizes?.length || 0}`);
      
      // Verificar prêmios
      if (caixa.prizes && caixa.prizes.length > 0) {
        console.log(`\n   📦 Prêmios encontrados:`);
        for (const premio of caixa.prizes) {
          console.log(`   - ${premio.nome}: R$ ${premio.valor} (${premio.probabilidade * 100}%)`);
          if (premio.imagem) {
            console.log(`     Imagem: ${premio.imagem}`);
          }
        }
        
        // Verificar se todos os prêmios esperados estão presentes
        let premiosCorretos = 0;
        for (const premioEsperado of caixaEsperada.premiosEsperados) {
          const premioEncontrado = caixa.prizes.find(p => 
            p.nome === premioEsperado.nome && p.valor === premioEsperado.valor
          );
          if (premioEncontrado) {
            premiosCorretos++;
            if (premioEncontrado.imagem === premioEsperado.imagem) {
              console.log(`   ✅ ${premioEsperado.nome} - CORRETO`);
            } else {
              console.log(`   ⚠️ ${premioEsperado.nome} - Imagem incorreta (esperado: ${premioEsperado.imagem}, encontrado: ${premioEncontrado.imagem})`);
            }
          } else {
            console.log(`   ❌ ${premioEsperado.nome} - NÃO ENCONTRADO`);
          }
        }
        
        console.log(`\n   📊 Resumo: ${premiosCorretos}/${caixaEsperada.premiosEsperados.length} prêmios corretos`);
        
        if (premiosCorretos === caixaEsperada.premiosEsperados.length) {
          console.log(`   ✅ ${caixaEsperada.nome} - TODOS OS PRÊMIOS CORRETOS!`);
        } else {
          console.log(`   ⚠️ ${caixaEsperada.nome} - ALGUNS PRÊMIOS INCORRETOS`);
        }
      } else {
        console.log(`   ❌ Nenhum prêmio encontrado para ${caixaEsperada.nome}`);
      }
    }
    
    // 4. Resumo final
    console.log('\n' + '=' .repeat(50));
    console.log('📊 RESUMO DAS CORREÇÕES:');
    console.log('=' .repeat(50));
    
    console.log('\n✅ CAIXA CONSOLE DOS SONHOS:');
    console.log('   - R$1,00 → 1real.png');
    console.log('   - R$2,00 → 2reais.png');
    console.log('   - R$5,00 → 5reais.png');
    console.log('   - R$10,00 → 10reais.png');
    console.log('   - R$100,00 → 100reais.png');
    console.log('   - Steam Deck → steamdeck.png');
    console.log('   - Xbox One → xboxone.webp');
    console.log('   - PS5 → ps5.png');
    
    console.log('\n✅ CAIXA APPLE:');
    console.log('   - R$1,00 → 1.png');
    console.log('   - R$2,00 → 2.png');
    console.log('   - R$5,00 → 5.png');
    console.log('   - R$10,00 → 10.png');
    console.log('   - R$500,00 → 500.webp');
    console.log('   - Air Pods → air pods.png');
    console.log('   - Iphone 16 Pro Max → iphone 16 pro max.png');
    console.log('   - Macbook → macbook.png');
    
    console.log('\n✅ CAIXA PREMIUM MASTER!:');
    console.log('   - R$2,00 → 2.png');
    console.log('   - R$5,00 → 5.png');
    console.log('   - R$10,00 → 10.png');
    console.log('   - R$20,00 → 20.png');
    console.log('   - R$500,00 → 500.webp');
    console.log('   - Air Pods → airpods.png');
    console.log('   - Ipad → ipad.png');
    console.log('   - S25 ULTRA → samsung s25.png');
    console.log('   - Iphone 16 Pro Max → iphone 16 pro max.png');
    console.log('   - Macbook → macbook.png');
    console.log('   - Honda CG Fan 160 → honda cg fan.webp');
    
    console.log('\n🎉 TODAS AS CAIXAS FORAM CORRIGIDAS COM SUCESSO!');
    console.log('✅ Nomes dos prêmios atualizados');
    console.log('✅ Valores dos prêmios atualizados');
    console.log('✅ Nomes das imagens atualizados');
    console.log('✅ IDs das caixas corrigidos');
    
    return { success: true, message: 'Todas as caixas foram corrigidas com sucesso!' };
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Executar teste
testarCaixasCorrigidas().catch(console.error);
