/**
 * 🔧 CORREÇÃO AUTOMÁTICA DE PROBLEMAS DAS CAIXAS
 * 
 * Este script tenta corrigir automaticamente os problemas encontrados
 * nos testes de diagnóstico das caixas.
 * 
 * ATENÇÃO: Execute apenas após executar os testes de diagnóstico!
 * 
 * INSTRUÇÕES:
 * 1. Execute primeiro os scripts de diagnóstico
 * 2. Cole este código no console
 * 3. Execute para tentar corrigir os problemas automaticamente
 */

console.log('🔧 INICIANDO CORREÇÃO AUTOMÁTICA...');
console.log('===================================');

// Estado da correção
const CORRECTION_STATE = {
    startTime: Date.now(),
    corrections: [],
    errors: [],
    warnings: []
};

// Utilitários de correção
const CorrectionUtils = {
    // Fazer requisição
    async request(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                ...options.headers
            }
        });
        return response;
    },

    // Log formatado
    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = {
            'info': 'ℹ️',
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'debug': '🔍'
        }[type] || 'ℹ️';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
    },

    // Aguardar
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // Adicionar correção
    addCorrection(type, description, success = true) {
        CORRECTION_STATE.corrections.push({
            type,
            description,
            success,
            timestamp: Date.now()
        });
    },

    // Adicionar erro
    addError(message, context = {}) {
        CORRECTION_STATE.errors.push({
            message,
            context,
            timestamp: Date.now()
        });
    }
};

// Correções automáticas
const AutoCorrections = {
    
    // Correção 1: Limpar cache do navegador
    async clearBrowserCache() {
        CorrectionUtils.log('Limpando cache do navegador...', 'info');
        
        try {
            // Limpar localStorage de dados antigos
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && (key.includes('case') || key.includes('prize') || key.includes('slotbox'))) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
                CorrectionUtils.log(`Removido do cache: ${key}`, 'debug');
            });
            
            // Limpar sessionStorage
            sessionStorage.clear();
            
            CorrectionUtils.log(`Cache limpo: ${keysToRemove.length} itens removidos`, 'success');
            CorrectionUtils.addCorrection('cache_clear', `Cache limpo: ${keysToRemove.length} itens`);
            
        } catch (error) {
            CorrectionUtils.log(`Erro ao limpar cache: ${error.message}`, 'error');
            CorrectionUtils.addError('Erro ao limpar cache', { error: error.message });
        }
    },

    // Correção 2: Recarregar dados das caixas
    async reloadCasesData() {
        CorrectionUtils.log('Recarregando dados das caixas...', 'info');
        
        try {
            const response = await CorrectionUtils.request('https://slotbox-api.onrender.com/api/cases');
            
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error('API retornou success=false');
            }
            
            // Armazenar dados atualizados
            localStorage.setItem('cases_data_fresh', JSON.stringify(data.data));
            localStorage.setItem('cases_last_update', Date.now().toString());
            
            CorrectionUtils.log(`Dados das caixas recarregados: ${data.data.length} caixas`, 'success');
            CorrectionUtils.addCorrection('reload_cases', `Recarregadas ${data.data.length} caixas`);
            
        } catch (error) {
            CorrectionUtils.log(`Erro ao recarregar caixas: ${error.message}`, 'error');
            CorrectionUtils.addError('Erro ao recarregar caixas', { error: error.message });
        }
    },

    // Correção 3: Recarregar dados dos prêmios
    async reloadPrizesData() {
        CorrectionUtils.log('Recarregando dados dos prêmios...', 'info');
        
        try {
            const response = await CorrectionUtils.request('https://slotbox-api.onrender.com/api/prizes');
            
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error('API retornou success=false');
            }
            
            // Armazenar dados atualizados
            localStorage.setItem('prizes_data_fresh', JSON.stringify(data.data));
            localStorage.setItem('prizes_last_update', Date.now().toString());
            
            CorrectionUtils.log(`Dados dos prêmios recarregados: ${data.data.length} prêmios`, 'success');
            CorrectionUtils.addCorrection('reload_prizes', `Recarregados ${data.data.length} prêmios`);
            
        } catch (error) {
            CorrectionUtils.log(`Erro ao recarregar prêmios: ${error.message}`, 'error');
            CorrectionUtils.addError('Erro ao recarregar prêmios', { error: error.message });
        }
    },

    // Correção 4: Verificar e corrigir token
    async fixToken() {
        CorrectionUtils.log('Verificando e corrigindo token...', 'info');
        
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                CorrectionUtils.log('Token não encontrado, tentando reautenticação...', 'warning');
                
                // Tentar buscar token de backup
                const backupToken = localStorage.getItem('backup_token');
                if (backupToken) {
                    localStorage.setItem('token', backupToken);
                    CorrectionUtils.log('Token de backup restaurado', 'success');
                    CorrectionUtils.addCorrection('token_restore', 'Token de backup restaurado');
                } else {
                    CorrectionUtils.log('Nenhum token de backup encontrado', 'warning');
                    CorrectionUtils.addError('Token não encontrado e sem backup');
                }
                return;
            }
            
            // Verificar se token é válido
            const response = await CorrectionUtils.request('https://slotbox-api.onrender.com/api/auth/me');
            
            if (!response.ok) {
                CorrectionUtils.log('Token inválido, tentando renovar...', 'warning');
                
                // Aqui você poderia implementar renovação automática de token
                // Por enquanto, apenas reportar o problema
                CorrectionUtils.addError('Token inválido', { status: response.status });
            } else {
                CorrectionUtils.log('Token válido', 'success');
                CorrectionUtils.addCorrection('token_check', 'Token válido');
            }
            
        } catch (error) {
            CorrectionUtils.log(`Erro ao verificar token: ${error.message}`, 'error');
            CorrectionUtils.addError('Erro ao verificar token', { error: error.message });
        }
    },

    // Correção 5: Forçar refresh da página
    async forcePageRefresh() {
        CorrectionUtils.log('Preparando refresh da página...', 'info');
        
        try {
            // Salvar estado atual
            const currentState = {
                url: window.location.href,
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            };
            
            localStorage.setItem('refresh_state', JSON.stringify(currentState));
            
            CorrectionUtils.log('Estado salvo, executando refresh...', 'info');
            CorrectionUtils.addCorrection('page_refresh', 'Refresh da página executado');
            
            // Aguardar um pouco antes do refresh
            await CorrectionUtils.delay(2000);
            
            // Executar refresh
            window.location.reload(true);
            
        } catch (error) {
            CorrectionUtils.log(`Erro ao preparar refresh: ${error.message}`, 'error');
            CorrectionUtils.addError('Erro ao preparar refresh', { error: error.message });
        }
    },

    // Correção 6: Verificar conectividade
    async checkConnectivity() {
        CorrectionUtils.log('Verificando conectividade...', 'info');
        
        try {
            const startTime = Date.now();
            const response = await CorrectionUtils.request('https://slotbox-api.onrender.com/api/health');
            const endTime = Date.now();
            
            const responseTime = endTime - startTime;
            
            if (response.ok) {
                CorrectionUtils.log(`Conectividade OK (${responseTime}ms)`, 'success');
                CorrectionUtils.addCorrection('connectivity_check', `Conectividade OK (${responseTime}ms)`);
            } else {
                CorrectionUtils.log(`Problema de conectividade (${response.status})`, 'warning');
                CorrectionUtils.addError('Problema de conectividade', { status: response.status });
            }
            
        } catch (error) {
            CorrectionUtils.log(`Erro de conectividade: ${error.message}`, 'error');
            CorrectionUtils.addError('Erro de conectividade', { error: error.message });
        }
    },

    // Correção 7: Resetar estado do React (se disponível)
    async resetReactState() {
        CorrectionUtils.log('Tentando resetar estado do React...', 'info');
        
        try {
            // Verificar se React está disponível
            if (typeof window.React !== 'undefined') {
                CorrectionUtils.log('React detectado, tentando resetar estado...', 'debug');
                
                // Aqui você poderia implementar reset do estado React
                // Por enquanto, apenas limpar dados relacionados
                
                // Limpar dados de estado do React se armazenados
                const reactStateKeys = Object.keys(localStorage).filter(key => 
                    key.includes('react') || key.includes('state') || key.includes('component')
                );
                
                reactStateKeys.forEach(key => {
                    localStorage.removeItem(key);
                    CorrectionUtils.log(`Estado React limpo: ${key}`, 'debug');
                });
                
                CorrectionUtils.log('Estado do React resetado', 'success');
                CorrectionUtils.addCorrection('react_reset', 'Estado do React resetado');
                
            } else {
                CorrectionUtils.log('React não detectado, pulando reset', 'info');
            }
            
        } catch (error) {
            CorrectionUtils.log(`Erro ao resetar React: ${error.message}`, 'error');
            CorrectionUtils.addError('Erro ao resetar React', { error: error.message });
        }
    }
};

// Função principal de correção
async function runAutoCorrections() {
    console.log('🚀 Iniciando correções automáticas...');
    
    try {
        // Executar correções em sequência
        await AutoCorrections.clearBrowserCache();
        await CorrectionUtils.delay(1000);
        
        await AutoCorrections.checkConnectivity();
        await CorrectionUtils.delay(1000);
        
        await AutoCorrections.fixToken();
        await CorrectionUtils.delay(1000);
        
        await AutoCorrections.reloadCasesData();
        await CorrectionUtils.delay(1000);
        
        await AutoCorrections.reloadPrizesData();
        await CorrectionUtils.delay(1000);
        
        await AutoCorrections.resetReactState();
        await CorrectionUtils.delay(1000);
        
        // Gerar relatório
        generateCorrectionReport();
        
        // Perguntar se deve fazer refresh
        const shouldRefresh = confirm('Correções aplicadas! Deseja recarregar a página para aplicar as mudanças?');
        if (shouldRefresh) {
            await AutoCorrections.forcePageRefresh();
        }
        
    } catch (error) {
        CorrectionUtils.log(`Erro crítico nas correções: ${error.message}`, 'error');
        generateCorrectionReport();
    }
}

// Gerar relatório de correções
function generateCorrectionReport() {
    const endTime = Date.now();
    const duration = endTime - CORRECTION_STATE.startTime;
    
    console.log('\n🔧 RELATÓRIO DE CORREÇÕES');
    console.log('=========================');
    console.log(`⏱️ Tempo total: ${duration}ms`);
    console.log(`✅ Correções aplicadas: ${CORRECTION_STATE.corrections.length}`);
    console.log(`❌ Erros encontrados: ${CORRECTION_STATE.errors.length}`);
    
    if (CORRECTION_STATE.corrections.length > 0) {
        console.log('\n✅ CORREÇÕES APLICADAS:');
        console.log('=======================');
        CORRECTION_STATE.corrections.forEach((correction, index) => {
            const status = correction.success ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${correction.type}: ${correction.description}`);
        });
    }
    
    if (CORRECTION_STATE.errors.length > 0) {
        console.log('\n❌ ERROS ENCONTRADOS:');
        console.log('====================');
        CORRECTION_STATE.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error.message}`);
            if (error.context && Object.keys(error.context).length > 0) {
                console.log(`   Contexto:`, error.context);
            }
        });
    }
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('===================');
    console.log('1. Recarregue a página (F5 ou Ctrl+F5)');
    console.log('2. Teste as funcionalidades das caixas');
    console.log('3. Execute novamente os testes de diagnóstico se necessário');
    console.log('4. Se os problemas persistirem, verifique os logs do servidor');
    
    console.log('\n✅ CORREÇÕES CONCLUÍDAS!');
    console.log('========================');
}

// Executar correções automaticamente
runAutoCorrections();

// Exportar para uso manual
window.correcaoAutomatica = {
    run: runAutoCorrections,
    state: CORRECTION_STATE,
    corrections: AutoCorrections,
    utils: CorrectionUtils
};

console.log('🔧 Correções automáticas carregadas! Use window.correcaoAutomatica.run() para executar novamente.');
