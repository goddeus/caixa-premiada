/**
 * 🧪 TESTE DA CORREÇÃO DEFINITIVA DE PRÊMIOS DINÂMICOS
 * 
 * Este script testa se a correção definitiva para prêmios dinâmicos está funcionando
 * corretamente, garantindo que IDs como 'samsung_2' sejam substituídos por IDs reais.
 */

console.log('🧪 INICIANDO TESTE DA CORREÇÃO DEFINITIVA DE PRÊMIOS DINÂMICOS...');
console.log('==============================================================');

// Função para testar a correção
async function testarCorrecao() {
    console.log('🚀 Iniciando teste da correção...');
    
    try {
        // 1. Verificar se a correção está carregada
        if (typeof window.correcaoDefinitivaPremios === 'undefined') {
            console.log('❌ Script de correção definitiva não carregado. Por favor, execute correcao-definitiva-premios-dinamicos.js primeiro.');
            return;
        }
        
        // 2. Executar o teste da correção
        await window.correcaoDefinitivaPremios.testar();
        
        console.log('\n✅ TESTE DE CORREÇÃO CONCLUÍDO!');
        
    } catch (error) {
        console.log('❌ Erro no teste da correção:', error);
    }
}

// Função para testar múltiplas vezes
async function testarMultiplas(numTestes = 3) {
    console.log(`\n🧪 INICIANDO TESTES MÚLTIPLOS (${numTestes} vezes)...`);
    console.log('==================================================');

    if (typeof window.correcaoDefinitivaPremios === 'undefined') {
        console.log('❌ Script de correção definitiva não carregado. Por favor, execute correcao-definitiva-premios-dinamicos.js primeiro.');
        return;
    }

    await window.correcaoDefinitivaPremios.testarMultiplas(numTestes);

    console.log('\n✅ TESTES MÚLTIPLOS CONCLUÍDOS!');
}

// Exportar funções
window.testeCorrecaoDefinitivaPremios = {
    testar: testarCorrecao,
    testarMultiplas: testarMultiplas
};

console.log('🧪 Teste da correção definitiva carregado! Use window.testeCorrecaoDefinitivaPremios.testar() ou .testarMultiplas(N) para executar.');





