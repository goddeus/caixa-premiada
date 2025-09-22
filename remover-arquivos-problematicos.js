/**
 * 🗑️ REMOVEDOR DE ARQUIVOS PROBLEMÁTICOS
 * 
 * Este script lista os arquivos temporários e de diagnóstico que devem ser removidos
 * do projeto para manter o código limpo e evitar conflitos.
 */

console.log('🗑️ INICIANDO REMOÇÃO DE ARQUIVOS PROBLEMÁTICOS...');
console.log('================================================');

// Função para listar arquivos a serem removidos
function listarArquivosParaRemover() {
    console.log('🚀 Listando arquivos para remoção...');
    
    const arquivosParaRemover = [
        'test-api-connection.js',
        'deploy-cors-fix.sh',
        'deploy-to-render.md',
        'test-cors-local.js',
        'CORRECOES_CORS_APLICADAS.md',
        'diagnostico-caixas-completo.js',
        'teste-premios-especifico.js',
        'correcao-automatica-caixas.js',
        'SOLUCAO_COMPLETA_CAIXAS.md',
        'correcao-definitiva-frontend.js',
        'teste-final-correcao.js',
        'diagnostico-saldo-inconsistente.js',
        'verificar-saldo-backend.js',
        'teste-sincronizacao-completa.js',
        'SISTEMA_SINCRONIZACAO_IMPLEMENTADO.md',
        'diagnostico-premios-detalhado.js',
        'teste-abertura-caixas-premios.js',
        'correcao-problemas-premios.js',
        'diagnostico-tipos-conta-premios.js',
        'verificar-logica-premios-tipo-conta.js',
        'correcao-premios-dinamicos.js', // Script da correção anterior
        'teste-correcao-premios-dinamicos.js', // Script de teste da correção anterior
        'limpar-dados-problematicos.js', // Este próprio script de limpeza de dados
        'remover-arquivos-problematicos.js', // Este próprio script de remoção de arquivos
        'correcao-definitiva-backend.js', // Script de correção definitiva
        'teste-correcao-definitiva.js',   // Script de teste da correção definitiva
        'aceitar-premios-dinamicos.js',   // Script de aceitação de prêmios dinâmicos
        'teste-aceitacao-premios.js'      // Script de teste de aceitação de prêmios
    ];
    
    console.log('\n📋 ARQUIVOS A SEREM REMOVIDOS:');
    console.log('==============================');
    arquivosParaRemover.forEach((arquivo, index) => {
        console.log(`${index + 1}. ${arquivo}`);
    });
    
    console.log('\n💡 INSTRUÇÕES:');
    console.log('==============');
    console.log('1. Navegue até a pasta raiz do seu projeto.');
    console.log('2. Delete manualmente os arquivos listados acima.');
    console.log('3. Mantenha apenas os arquivos do seu projeto principal (ex: backend/, frontend/, package.json, etc.).');
    console.log('4. Após a remoção, execute o script `limpar-dados-problematicos.js` no console do navegador.');
    console.log('5. Recarregue a página para garantir que todas as mudanças foram aplicadas.');
    
    console.log('\n✅ LISTAGEM CONCLUÍDA!');
    
    return arquivosParaRemover;
}

// Função para verificar se os arquivos foram removidos (opcional)
function verificarRemocao(arquivos) {
    console.log('\n🔍 VERIFICANDO REMOÇÃO DE ARQUIVOS (manual)...');
    console.log('=============================================');
    console.log('Esta verificação é manual. Por favor, confirme no seu sistema de arquivos.');
    console.log('Após remover, você pode tentar executar este script novamente. Se os arquivos não aparecerem na lista, eles foram removidos.');
}

// Executar listagem
const arquivos = listarArquivosParaRemover();

// Exportar funções
window.removerArquivosProblematicos = {
    listar: listarArquivosParaRemover,
    verificar: verificarRemocao
};

console.log('🗑️ Script de remoção de arquivos carregado! Use window.removerArquivosProblematicos.listar() para listar novamente.');