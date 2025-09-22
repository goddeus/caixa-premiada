/**
 * 🧪 TESTE DE ACEITAÇÃO DE PRÊMIOS DINÂMICOS
 * 
 * Este script testa se a aceitação de prêmios dinâmicos está funcionando
 * corretamente, garantindo que prêmios como 'samsung_2' sejam aceitos pelo frontend.
 */

console.log('🧪 INICIANDO TESTE DE ACEITAÇÃO DE PRÊMIOS DINÂMICOS...');
console.log('====================================================');

// Função para testar a aceitação
async function testarAceitacao() {
    console.log('🚀 Iniciando teste de aceitação...');
    
    try {
        // 1. Verificar se a aceitação está carregada
        if (typeof window.aceitarPremiosDinamicos === 'undefined') {
            console.log('❌ Script de aceitação de prêmios dinâmicos não carregado. Por favor, execute aceitar-premios-dinamicos.js primeiro.');
            return;
        }
        
        // 2. Buscar uma caixa para testar
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ Token não encontrado. Faça login para testar.');
            return;
        }
        
        console.log('📦 Buscando caixas disponíveis...');
        const casesResponse = await fetch('https://slotbox-api.onrender.com/api/cases', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const casesData = await casesResponse.json();
        
        if (casesData.success && casesData.data.length > 0) {
            // Testar com a primeira caixa disponível
            const testCase = casesData.data[0];
            console.log(`🎯 Testando com caixa: ${testCase.nome} (ID: ${testCase.id})`);
            
            // 3. Executar o teste de aceitação
            const resultado = await window.aceitarPremiosDinamicos.testar(testCase.id);
            
            if (resultado.success) {
                console.log('✅ Teste de aceitação bem-sucedido!');
                console.log('📊 Resultado:', resultado.premio);
            } else {
                console.log('❌ Falha no teste de aceitação:', resultado.message || resultado.error);
            }
        } else {
            console.log('❌ Nenhuma caixa encontrada para teste.');
        }
        
        console.log('\n✅ TESTE DE ACEITAÇÃO CONCLUÍDO!');
        
    } catch (error) {
        console.log('❌ Erro no teste de aceitação:', error);
    }
}

// Função para testar múltiplas vezes
async function testarMultiplas(numTestes = 3) {
    console.log(`\n🧪 INICIANDO TESTES MÚLTIPLOS DE ACEITAÇÃO (${numTestes} vezes)...`);
    console.log('============================================================');

    if (typeof window.aceitarPremiosDinamicos === 'undefined') {
        console.log('❌ Script de aceitação de prêmios dinâmicos não carregado. Por favor, execute aceitar-premios-dinamicos.js primeiro.');
        return;
    }

    // Buscar uma caixa para testar
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ Token não encontrado. Faça login para testar.');
        return;
    }
    
    try {
        const casesResponse = await fetch('https://slotbox-api.onrender.com/api/cases', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const casesData = await casesResponse.json();
        
        if (casesData.success && casesData.data.length > 0) {
            const testCase = casesData.data[0];
            console.log(`🎯 Testando múltiplas vezes com caixa: ${testCase.nome} (ID: ${testCase.id})`);
            
            await window.aceitarPremiosDinamicos.testarMultiplas(testCase.id, numTestes);
        } else {
            console.log('❌ Nenhuma caixa encontrada para teste.');
        }
    } catch (error) {
        console.log('❌ Erro ao buscar caixas:', error);
    }

    console.log('\n✅ TESTES MÚLTIPLOS DE ACEITAÇÃO CONCLUÍDOS!');
}

// Exportar funções
window.testeAceitacaoPremios = {
    testar: testarAceitacao,
    testarMultiplas: testarMultiplas
};

console.log('🧪 Teste de aceitação de prêmios carregado! Use window.testeAceitacaoPremios.testar() ou .testarMultiplas(N) para executar.');