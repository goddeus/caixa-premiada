/**
 * 🔍 DIAGNÓSTICO DE SALDO INCONSISTENTE
 * 
 * Este script identifica e corrige o problema de inconsistência
 * entre o saldo mostrado na interface e o saldo real da API.
 */

console.log('🔍 DIAGNÓSTICO DE SALDO INCONSISTENTE...');
console.log('=========================================');

// Função para diagnosticar o problema de saldo
async function diagnosticarSaldo() {
    console.log('🚀 Iniciando diagnóstico de saldo...');
    
    try {
        // 1. Verificar dados do usuário no localStorage
        console.log('\n📱 VERIFICANDO DADOS LOCAIS:');
        console.log('============================');
        
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        console.log('🔑 Token:', token ? 'Presente' : 'Ausente');
        console.log('👤 Dados do usuário:', userData ? 'Presentes' : 'Ausentes');
        
        if (userData) {
            try {
                const user = JSON.parse(userData);
                console.log('📊 Saldo no localStorage:', user.saldo_reais || 'Não encontrado');
                console.log('📊 Tipo de conta:', user.tipo_conta || 'Não encontrado');
            } catch (e) {
                console.log('❌ Erro ao parsear dados do usuário:', e);
            }
        }
        
        // 2. Verificar dados do usuário via API
        console.log('\n🌐 VERIFICANDO DADOS DA API:');
        console.log('============================');
        
        const userResponse = await fetch('https://slotbox-api.onrender.com/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!userResponse.ok) {
            console.log('❌ Erro na autenticação:', userResponse.status);
            return;
        }
        
        const userApiData = await userResponse.json();
        console.log('✅ Usuário autenticado via API');
        console.log('📊 Dados da API:', userApiData.data);
        
        // 3. Verificar saldo via API de wallet
        console.log('\n💰 VERIFICANDO SALDO VIA WALLET:');
        console.log('=================================');
        
        const walletResponse = await fetch('https://slotbox-api.onrender.com/api/wallet', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!walletResponse.ok) {
            console.log('❌ Erro ao buscar saldo:', walletResponse.status);
            return;
        }
        
        const walletData = await walletResponse.json();
        console.log('✅ Saldo obtido via API');
        console.log('📊 Dados da wallet:', walletData.data);
        
        // 4. Comparar dados
        console.log('\n🔍 COMPARANDO DADOS:');
        console.log('====================');
        
        const saldoLocal = userData ? JSON.parse(userData).saldo_reais : null;
        const saldoApi = walletData.data.saldo_reais;
        
        console.log(`💰 Saldo no localStorage: R$ ${saldoLocal || 'N/A'}`);
        console.log(`💰 Saldo na API: R$ ${saldoApi}`);
        
        if (saldoLocal !== saldoApi) {
            console.log('⚠️ INCONSISTÊNCIA DETECTADA!');
            console.log('🔧 Aplicando correção...');
            
            // Atualizar dados no localStorage
            if (userData) {
                const user = JSON.parse(userData);
                user.saldo_reais = saldoApi;
                user.saldo_demo = walletData.data.saldo_demo;
                user.tipo_conta = walletData.data.tipo_conta;
                
                localStorage.setItem('user', JSON.stringify(user));
                console.log('✅ Dados atualizados no localStorage');
            }
            
            // Forçar atualização da interface
            console.log('🔄 Forçando atualização da interface...');
            
            // Disparar evento customizado para atualizar a interface
            window.dispatchEvent(new CustomEvent('saldoAtualizado', {
                detail: {
                    saldo_reais: saldoApi,
                    saldo_demo: walletData.data.saldo_demo,
                    tipo_conta: walletData.data.tipo_conta
                }
            }));
            
            console.log('✅ Interface atualizada!');
            
        } else {
            console.log('✅ Dados consistentes!');
        }
        
        // 5. Verificar histórico de transações
        console.log('\n📋 VERIFICANDO HISTÓRICO:');
        console.log('=========================');
        
        const historyResponse = await fetch('https://slotbox-api.onrender.com/api/wallet/history', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            console.log('✅ Histórico obtido');
            console.log(`📊 Total de transações: ${historyData.data?.length || 0}`);
            
            if (historyData.data && historyData.data.length > 0) {
                const ultimasTransacoes = historyData.data.slice(0, 5);
                console.log('📋 Últimas 5 transações:');
                ultimasTransacoes.forEach((transacao, index) => {
                    console.log(`   ${index + 1}. ${transacao.tipo}: R$ ${transacao.valor} - ${transacao.descricao}`);
                });
            }
        } else {
            console.log('⚠️ Não foi possível obter histórico');
        }
        
        // 6. Teste de abertura de caixa (se tiver saldo)
        if (saldoApi > 0) {
            console.log('\n🎲 TESTANDO ABERTURA DE CAIXA:');
            console.log('==============================');
            
            const casesResponse = await fetch('https://slotbox-api.onrender.com/api/cases', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const casesData = await casesResponse.json();
            
            if (casesData.success && casesData.data.length > 0) {
                const testCase = casesData.data[0];
                const casePrice = parseFloat(testCase.preco);
                
                console.log(`🎯 Testando com caixa: ${testCase.nome}`);
                console.log(`💰 Preço: R$ ${casePrice}`);
                console.log(`💰 Saldo disponível: R$ ${saldoApi}`);
                
                if (saldoApi >= casePrice) {
                    console.log('✅ Saldo suficiente para teste');
                    
                    const openResponse = await fetch(`https://slotbox-api.onrender.com/api/cases/buy/${testCase.id}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const openResult = await openResponse.json();
                    console.log('📊 Resultado do teste:', openResult);
                    
                    if (openResult.success) {
                        console.log('✅ Caixa aberta com sucesso!');
                        console.log(`🎁 Prêmio: ${openResult.data.premio?.nome || 'N/A'}`);
                        console.log(`💰 Saldo restante: R$ ${openResult.data.saldo_restante || 'N/A'}`);
                    } else {
                        console.log('❌ Falha na abertura:', openResult.error || openResult.message);
                    }
                } else {
                    console.log('⚠️ Saldo insuficiente para teste');
                }
            }
        }
        
        console.log('\n✅ DIAGNÓSTICO CONCLUÍDO!');
        
    } catch (error) {
        console.log('❌ Erro no diagnóstico:', error);
    }
}

// Função para corrigir dados automaticamente
async function corrigirDadosAutomaticamente() {
    console.log('\n🔧 APLICANDO CORREÇÃO AUTOMÁTICA...');
    
    try {
        const token = localStorage.getItem('token');
        
        // Buscar dados atualizados da API
        const walletResponse = await fetch('https://slotbox-api.onrender.com/api/wallet', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const walletData = await walletResponse.json();
        
        if (walletData.success) {
            // Atualizar localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
                const user = JSON.parse(userData);
                user.saldo_reais = walletData.data.saldo_reais;
                user.saldo_demo = walletData.data.saldo_demo;
                user.tipo_conta = walletData.data.tipo_conta;
                
                localStorage.setItem('user', JSON.stringify(user));
                console.log('✅ Dados atualizados no localStorage');
            }
            
            // Disparar evento para atualizar interface
            window.dispatchEvent(new CustomEvent('saldoAtualizado', {
                detail: walletData.data
            }));
            
            console.log('✅ Correção aplicada com sucesso!');
            console.log(`💰 Novo saldo: R$ ${walletData.data.saldo_reais}`);
            
        } else {
            console.log('❌ Erro ao obter dados da API');
        }
        
    } catch (error) {
        console.log('❌ Erro na correção automática:', error);
    }
}

// Executar diagnóstico
diagnosticarSaldo();

// Exportar funções
window.diagnosticoSaldo = {
    diagnosticar: diagnosticarSaldo,
    corrigir: corrigirDadosAutomaticamente
};

console.log('🔧 Diagnóstico carregado! Use window.diagnosticoSaldo.corrigir() para aplicar correção automática.');
