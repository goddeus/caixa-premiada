/**
 * 🧹 LIMPEZA DE DADOS PROBLEMÁTICOS
 * 
 * Este script limpa dados inconsistentes do navegador (localStorage, sessionStorage, cache)
 * e remove funções globais temporárias que podem causar conflitos.
 */

console.log('🧹 INICIANDO LIMPEZA DE DADOS PROBLEMÁTICOS...');
console.log('==============================================');

// Função principal de limpeza
async function limparDados() {
    console.log('🚀 Aplicando limpeza de dados...');
    
    try {
        // 1. Limpar localStorage
        console.log('\n🗑️ Limpando localStorage...');
        const itemsRemovidos = [];
        const chavesParaRemover = [
            'token', 
            'user', 
            'casesData', 
            'prizesData', 
            'walletData',
            'debugMode',
            'lastDiagnosticReport'
        ];
        
        chavesParaRemover.forEach(chave => {
            if (localStorage.getItem(chave)) {
                localStorage.removeItem(chave);
                itemsRemovidos.push(chave);
            }
        });
        
        if (itemsRemovidos.length > 0) {
            console.log(`✅ Itens removidos do localStorage: ${itemsRemovidos.join(', ')}`);
        } else {
            console.log('✅ Nenhum item problemático encontrado no localStorage');
        }
        
        // 2. Limpar sessionStorage
        console.log('\n🗑️ Limpando sessionStorage...');
        const sessionItemsRemovidos = [];
        const chavesSessaoParaRemover = [
            'sessionToken',
            'sessionUser'
        ];
        
        chavesSessaoParaRemover.forEach(chave => {
            if (sessionStorage.getItem(chave)) {
                sessionStorage.removeItem(chave);
                sessionItemsRemovidos.push(chave);
            }
        });
        
        if (sessionItemsRemovidos.length > 0) {
            console.log(`✅ Itens removidos do sessionStorage: ${sessionItemsRemovidos.join(', ')}`);
        } else {
            console.log('✅ Nenhum item problemático encontrado no sessionStorage');
        }
        
        // 3. Limpar cache do navegador
        console.log('\n🧹 Limpando cache do navegador...');
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('✅ Cache limpo');
        } else {
            console.log('⚠️ API de Cache não disponível no navegador');
        }
        
        // 4. Remover funções globais problemáticas
        console.log('\n❌ Removendo funções globais temporárias...');
        const funcoesRemovidas = [];
        const funcoesGlobaisParaRemover = [
            'diagnosticoCaixas',
            'testePremiosEspecifico',
            'correcaoAutomaticaCaixas',
            'investigarCaixa',
            'corrigirEstruturaResposta',
            'diagnosticoSaldo',
            'corrigirDadosAutomaticamente',
            'verificarSaldoBackend',
            'diagnosticoPremios',
            'correcaoPremios',
            'diagnosticoTiposConta',
            'verificarLogicaPremios',
            'correcaoPremiosDinamicos', // Adicionado para a correção anterior
            'testeCorrecaoPremios',     // Adicionado para o teste anterior
            'limpezaDados',             // Este próprio script
            'removerArquivosProblematicos', // O script de remoção de arquivos
            'correcaoDefinitivaBackend', // Script de correção definitiva
            'testeCorrecaoDefinitiva',   // Script de teste da correção definitiva
            'aceitarPremiosDinamicos',   // Script de aceitação de prêmios dinâmicos
            'testeAceitacaoPremios'      // Script de teste de aceitação de prêmios
        ];
        
        funcoesGlobaisParaRemover.forEach(funcao => {
            if (typeof window[funcao] !== 'undefined') {
                try {
                    delete window[funcao];
                    funcoesRemovidas.push(funcao);
                } catch (e) {
                    console.warn(`⚠️ Não foi possível remover window.${funcao}:`, e);
                }
            }
        });
        
        if (funcoesRemovidas.length > 0) {
            console.log(`✅ Funções globais removidas: ${funcoesRemovidas.join(', ')}`);
        } else {
            console.log('✅ Nenhuma função global temporária encontrada para remover');
        }

        // 5. Restaurar o fetch original se foi interceptado
        console.log('\n🔄 Restaurando fetch original...');
        if (window.originalFetch) {
            window.fetch = window.originalFetch;
            delete window.originalFetch;
            console.log('✅ Fetch original restaurado');
        } else {
            console.log('✅ Nenhuma interceptação de fetch detectada para restaurar');
        }
        
        // 6. Criar dados limpos (opcional, para iniciar do zero)
        console.log('\n✨ Criando dados iniciais limpos (opcional)...');
        // Exemplo: definir um usuário padrão ou saldo zero
        localStorage.setItem('user', JSON.stringify({
            id: 'guest',
            nome: 'Convidado',
            email: 'guest@slotbox.shop',
            saldo_reais: 0,
            saldo_demo: 0,
            tipo_conta: 'normal',
            is_admin: false,
            is_premium: false
        }));
        console.log('✅ Dados de usuário padrão criados no localStorage');
        
        // 7. Relatório final
        console.log('\n📊 RELATÓRIO FINAL DA LIMPEZA:');
        console.log('==============================');
        console.log('✅ Limpeza concluída com sucesso!');
        console.log('💡 Recomenda-se recarregar a página para aplicar todas as mudanças.');
        
        return true;
        
    } catch (error) {
        console.log('❌ Erro na limpeza:', error);
        return false;
    }
}

// Exportar função para uso manual
window.limpezaDados = {
    limpar: limparDados
};

console.log('🧹 Script de limpeza carregado! Use window.limpezaDados.limpar() para executar a limpeza.');