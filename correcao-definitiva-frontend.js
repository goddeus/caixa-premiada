/**
 * 🔧 CORREÇÃO DEFINITIVA DO FRONTEND
 * 
 * Este script corrige o problema de inconsistência entre backend e frontend
 * onde o backend retorna 'premio' mas o frontend espera 'prize'.
 * 
 * INSTRUÇÕES:
 * 1. Cole este código no console do navegador
 * 2. Execute para aplicar a correção temporária
 * 3. Use os dados para corrigir o código do frontend permanentemente
 */

console.log('🔧 APLICANDO CORREÇÃO DEFINITIVA...');

// Função para corrigir a estrutura de resposta da API
function corrigirRespostaAPI(resposta) {
    if (resposta && resposta.data) {
        // Se tem 'premio' mas não tem 'prize', adicionar 'prize'
        if (resposta.data.premio && !resposta.data.prize) {
            resposta.data.prize = resposta.data.premio;
            console.log('✅ Adicionado campo "prize" baseado em "premio"');
        }
        
        // Se tem 'ganhou' mas não tem 'won', adicionar 'won'
        if (resposta.data.ganhou !== undefined && resposta.data.won === undefined) {
            resposta.data.won = resposta.data.ganhou;
            console.log('✅ Adicionado campo "won" baseado em "ganhou"');
        }
        
        // Se tem 'saldo_restante' mas não tem 'remaining_balance', adicionar
        if (resposta.data.saldo_restante !== undefined && resposta.data.remaining_balance === undefined) {
            resposta.data.remaining_balance = resposta.data.saldo_restante;
            console.log('✅ Adicionado campo "remaining_balance" baseado em "saldo_restante"');
        }
    }
    return resposta;
}

// Interceptar todas as requisições fetch para corrigir automaticamente
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    
    // Interceptar apenas requisições para a API de caixas
    if (args[0] && args[0].includes('/cases/buy/')) {
        console.log('🔍 Interceptando resposta de abertura de caixa...');
        
        // Clonar a resposta para não modificar a original
        const clonedResponse = response.clone();
        
        try {
            const data = await clonedResponse.json();
            console.log('📊 Resposta original:', data);
            
            // Aplicar correção
            const dataCorrigido = corrigirRespostaAPI(data);
            console.log('📊 Resposta corrigida:', dataCorrigido);
            
            // Retornar resposta modificada
            return new Response(JSON.stringify(dataCorrigido), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });
            
        } catch (error) {
            console.log('❌ Erro ao processar resposta:', error);
            return response; // Retornar resposta original em caso de erro
        }
    }
    
    return response;
};

// Testar a correção
async function testarCorrecao() {
    console.log('\n🧪 TESTANDO CORREÇÃO...');
    
    try {
        // Buscar uma caixa para testar
        const casesResponse = await fetch('https://slotbox-api.onrender.com/api/cases', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        const casesData = await casesResponse.json();
        
        if (!casesData.success || !casesData.data || casesData.data.length === 0) {
            console.log('❌ Nenhuma caixa encontrada para teste');
            return;
        }
        
        const testCase = casesData.data[0];
        console.log(`🎯 Testando com caixa: ${testCase.nome}`);
        
        // Tentar abrir a caixa (a correção será aplicada automaticamente)
        const openResponse = await fetch(`https://slotbox-api.onrender.com/api/cases/buy/${testCase.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await openResponse.json();
        console.log('🎯 Resultado final:', result);
        
        // Verificar se a correção funcionou
        if (result.success && result.data) {
            if (result.data.prize) {
                console.log('✅ SUCESSO! Campo "prize" encontrado:', result.data.prize);
            } else if (result.data.premio) {
                console.log('⚠️ Campo "premio" encontrado, mas "prize" não foi criado');
            } else {
                console.log('❌ Nenhum campo de prêmio encontrado');
            }
        } else {
            console.log('❌ Falha na abertura da caixa:', result);
        }
        
    } catch (error) {
        console.log('❌ Erro no teste:', error);
    }
}

// Executar teste
testarCorrecao();

// Exportar função para uso manual
window.correcaoDefinitiva = {
    corrigirRespostaAPI,
    testarCorrecao,
    aplicada: true
};

console.log('✅ CORREÇÃO APLICADA!');
console.log('📋 INSTRUÇÕES PARA CORREÇÃO PERMANENTE:');
console.log('=====================================');
console.log('1. No frontend, modifique todos os arquivos que verificam "response.data.prize"');
console.log('2. Altere para: "response.data.prize || response.data.premio"');
console.log('3. Ou adicione a função corrigirRespostaAPI() no início do processamento');
console.log('4. Arquivos que precisam ser corrigidos:');
console.log('   - WeekendCase.jsx (linha 181)');
console.log('   - ConsoleCase.jsx (linha 203)');
console.log('   - AppleCase.jsx');
console.log('   - SamsungCase.jsx');
console.log('   - NikeCase.jsx');
console.log('   - PremiumMasterCase.jsx');
console.log('');
console.log('💡 EXEMPLO DE CORREÇÃO:');
console.log('ANTES: if (response && response.data && response.data.prize)');
console.log('DEPOIS: if (response && response.data && (response.data.prize || response.data.premio))');
console.log('');
console.log('🔧 Use window.correcaoDefinitiva.testarCorrecao() para testar novamente');
