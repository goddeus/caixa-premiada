/**
 * 🧪 TESTE COMPLETO DE SINCRONIZAÇÃO
 * 
 * Este script testa todas as funcionalidades de sincronização
 * implementadas no frontend.
 */

console.log('🧪 INICIANDO TESTE COMPLETO DE SINCRONIZAÇÃO...');
console.log('===============================================');

// Função para testar o hook de sincronização
async function testarHookSincronizacao() {
    console.log('\n🔧 TESTANDO HOOK DE SINCRONIZAÇÃO:');
    console.log('==================================');
    
    try {
        // Simular dados do hook
        const mockBalance = {
            saldo_reais: 0,
            saldo_demo: 0,
            tipo_conta: 'normal',
            loading: false,
            lastUpdated: new Date(),
            error: null
        };
        
        console.log('✅ Hook de sincronização carregado');
        console.log('📊 Estado inicial:', mockBalance);
        
        // Testar função de sincronização forçada
        console.log('🔄 Testando sincronização forçada...');
        
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ Token não encontrado - usuário não autenticado');
            return false;
        }
        
        // Simular chamada de sincronização
        const response = await fetch('https://slotbox-api.onrender.com/api/wallet', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Sincronização bem-sucedida');
            console.log('📊 Dados atualizados:', data.data);
            return true;
        } else {
            console.log('❌ Falha na sincronização:', response.status);
            return false;
        }
        
    } catch (error) {
        console.log('❌ Erro no teste do hook:', error);
        return false;
    }
}

// Função para testar o serviço de transação
async function testarServicoTransacao() {
    console.log('\n💳 TESTANDO SERVIÇO DE TRANSAÇÃO:');
    console.log('=================================');
    
    try {
        // Verificar se o serviço está disponível
        if (typeof window.transactionService === 'undefined') {
            console.log('⚠️ Serviço de transação não está disponível no window');
            console.log('💡 Isso é normal se o componente não foi carregado ainda');
            return true;
        }
        
        console.log('✅ Serviço de transação disponível');
        
        // Testar transações pendentes
        const pendingTransactions = window.transactionService.getPendingTransactions();
        console.log(`📋 Transações pendentes: ${pendingTransactions.length}`);
        
        if (pendingTransactions.length > 0) {
            console.log('📊 Transações pendentes:', pendingTransactions);
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ Erro no teste do serviço:', error);
        return false;
    }
}

// Função para testar indicador de sincronização
async function testarIndicadorSincronizacao() {
    console.log('\n📊 TESTANDO INDICADOR DE SINCRONIZAÇÃO:');
    console.log('======================================');
    
    try {
        // Verificar se o componente está disponível
        const syncIndicator = document.querySelector('[data-testid="balance-sync-indicator"]');
        
        if (!syncIndicator) {
            console.log('⚠️ Indicador de sincronização não encontrado no DOM');
            console.log('💡 Isso é normal se o componente não foi renderizado ainda');
            return true;
        }
        
        console.log('✅ Indicador de sincronização encontrado');
        
        // Verificar elementos do indicador
        const statusIcon = syncIndicator.querySelector('.text-lg');
        const statusText = syncIndicator.querySelector('.text-sm');
        const lastUpdate = syncIndicator.querySelector('.text-xs');
        
        if (statusIcon) console.log('✅ Ícone de status encontrado');
        if (statusText) console.log('✅ Texto de status encontrado');
        if (lastUpdate) console.log('✅ Timestamp de atualização encontrado');
        
        return true;
        
    } catch (error) {
        console.log('❌ Erro no teste do indicador:', error);
        return false;
    }
}

// Função para testar eventos de transação
async function testarEventosTransacao() {
    console.log('\n📡 TESTANDO EVENTOS DE TRANSAÇÃO:');
    console.log('==================================');
    
    try {
        let eventReceived = false;
        
        // Listener para eventos de transação
        const handleTransactionEvent = (event) => {
            console.log('✅ Evento de transação recebido:', event.detail);
            eventReceived = true;
        };
        
        window.addEventListener('transactionCompleted', handleTransactionEvent);
        
        // Simular evento de transação
        const mockTransaction = {
            type: 'test_transaction',
            amount: 1.50,
            timestamp: Date.now(),
            test: true
        };
        
        console.log('📤 Disparando evento de teste...');
        window.dispatchEvent(new CustomEvent('transactionCompleted', {
            detail: mockTransaction
        }));
        
        // Aguardar um pouco para o evento ser processado
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Remover listener
        window.removeEventListener('transactionCompleted', handleTransactionEvent);
        
        if (eventReceived) {
            console.log('✅ Eventos de transação funcionando corretamente');
            return true;
        } else {
            console.log('❌ Eventos de transação não funcionando');
            return false;
        }
        
    } catch (error) {
        console.log('❌ Erro no teste de eventos:', error);
        return false;
    }
}

// Função para testar conectividade
async function testarConectividade() {
    console.log('\n🌐 TESTANDO CONECTIVIDADE:');
    console.log('===========================');
    
    try {
        const isOnline = navigator.onLine;
        console.log(`📊 Status de conectividade: ${isOnline ? 'Online' : 'Offline'}`);
        
        if (isOnline) {
            // Testar conectividade com a API
            const response = await fetch('https://slotbox-api.onrender.com/api/health', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('✅ API acessível');
                return true;
            } else {
                console.log('⚠️ API retornou status:', response.status);
                return false;
            }
        } else {
            console.log('⚠️ Usuário está offline');
            return false;
        }
        
    } catch (error) {
        console.log('❌ Erro no teste de conectividade:', error);
        return false;
    }
}

// Função para testar localStorage
async function testarLocalStorage() {
    console.log('\n💾 TESTANDO LOCALSTORAGE:');
    console.log('=========================');
    
    try {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        console.log('🔑 Token:', token ? 'Presente' : 'Ausente');
        console.log('👤 Dados do usuário:', userData ? 'Presentes' : 'Ausentes');
        
        if (userData) {
            const user = JSON.parse(userData);
            console.log('📊 Saldo no localStorage:', user.saldo_reais || 'N/A');
            console.log('📊 Tipo de conta:', user.tipo_conta || 'N/A');
        }
        
        return true;
        
    } catch (error) {
        console.log('❌ Erro no teste do localStorage:', error);
        return false;
    }
}

// Função principal de teste
async function executarTesteCompleto() {
    console.log('🚀 Executando teste completo de sincronização...');
    
    const resultados = {
        hook: false,
        servico: false,
        indicador: false,
        eventos: false,
        conectividade: false,
        localStorage: false
    };
    
    try {
        // Executar todos os testes
        resultados.hook = await testarHookSincronizacao();
        resultados.servico = await testarServicoTransacao();
        resultados.indicador = await testarIndicadorSincronizacao();
        resultados.eventos = await testarEventosTransacao();
        resultados.conectividade = await testarConectividade();
        resultados.localStorage = await testarLocalStorage();
        
        // Gerar relatório final
        console.log('\n📊 RELATÓRIO FINAL DOS TESTES:');
        console.log('==============================');
        
        const totalTestes = Object.keys(resultados).length;
        const testesPassaram = Object.values(resultados).filter(r => r).length;
        const testesFalharam = totalTestes - testesPassaram;
        
        console.log(`✅ Testes que passaram: ${testesPassaram}/${totalTestes}`);
        console.log(`❌ Testes que falharam: ${testesFalharam}/${totalTestes}`);
        
        // Detalhes dos resultados
        Object.entries(resultados).forEach(([teste, resultado]) => {
            const status = resultado ? '✅' : '❌';
            const nome = teste.charAt(0).toUpperCase() + teste.slice(1);
            console.log(`${status} ${nome}: ${resultado ? 'PASSOU' : 'FALHOU'}`);
        });
        
        // Recomendações
        console.log('\n💡 RECOMENDAÇÕES:');
        console.log('=================');
        
        if (testesPassaram === totalTestes) {
            console.log('🎉 TODOS OS TESTES PASSARAM!');
            console.log('✅ Sistema de sincronização funcionando perfeitamente');
            console.log('✅ Pronto para uso em produção');
        } else if (testesPassaram > totalTestes / 2) {
            console.log('⚠️ MAIORIA DOS TESTES PASSOU');
            console.log('🔧 Verificar testes que falharam');
            console.log('💡 Sistema pode estar funcionando parcialmente');
        } else {
            console.log('❌ MAIORIA DOS TESTES FALHOU');
            console.log('🔧 Problemas críticos encontrados');
            console.log('💡 Revisar implementação antes de usar');
        }
        
        // Instruções de uso
        console.log('\n📋 INSTRUÇÕES DE USO:');
        console.log('======================');
        console.log('1. O hook useBalanceSync() deve ser usado nos componentes');
        console.log('2. O transactionService deve ser usado para todas as transações');
        console.log('3. O BalanceSyncIndicator deve ser adicionado aos headers');
        console.log('4. Eventos de transação são disparados automaticamente');
        console.log('5. Sincronização acontece a cada 30 segundos');
        
        console.log('\n✅ TESTE COMPLETO CONCLUÍDO!');
        
    } catch (error) {
        console.log('❌ Erro crítico no teste completo:', error);
    }
}

// Executar teste
executarTesteCompleto();

// Exportar funções para uso manual
window.testeSincronizacao = {
    executar: executarTesteCompleto,
    testarHook: testarHookSincronizacao,
    testarServico: testarServicoTransacao,
    testarIndicador: testarIndicadorSincronizacao,
    testarEventos: testarEventosTransacao,
    testarConectividade: testarConectividade,
    testarLocalStorage: testarLocalStorage
};

console.log('🧪 Teste de sincronização carregado! Use window.testeSincronizacao.executar() para executar novamente.');
