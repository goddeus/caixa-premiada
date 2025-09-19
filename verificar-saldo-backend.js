/**
 * 🔍 VERIFICAÇÃO DE SALDO NO BACKEND
 * 
 * Este script verifica se há problemas no backend
 * relacionados ao saldo do usuário.
 */

console.log('🔍 VERIFICANDO SALDO NO BACKEND...');
console.log('===================================');

// Função para verificar saldo no backend
async function verificarSaldoBackend() {
    console.log('🚀 Iniciando verificação do backend...');
    
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.log('❌ Token não encontrado');
            return;
        }
        
        // 1. Verificar endpoint de autenticação
        console.log('\n🔐 VERIFICANDO AUTENTICAÇÃO:');
        console.log('============================');
        
        const authResponse = await fetch('https://slotbox-api.onrender.com/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Status da autenticação:', authResponse.status);
        
        if (!authResponse.ok) {
            console.log('❌ Falha na autenticação');
            return;
        }
        
        const authData = await authResponse.json();
        console.log('✅ Usuário autenticado:', authData.data.nome);
        console.log('📊 ID do usuário:', authData.data.id);
        
        // 2. Verificar endpoint de wallet
        console.log('\n💰 VERIFICANDO WALLET:');
        console.log('=======================');
        
        const walletResponse = await fetch('https://slotbox-api.onrender.com/api/wallet', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Status da wallet:', walletResponse.status);
        
        if (!walletResponse.ok) {
            console.log('❌ Falha ao buscar wallet');
            return;
        }
        
        const walletData = await walletResponse.json();
        console.log('✅ Wallet obtida com sucesso');
        console.log('📊 Dados da wallet:', walletData.data);
        
        // 3. Verificar endpoint de histórico
        console.log('\n📋 VERIFICANDO HISTÓRICO:');
        console.log('==========================');
        
        const historyResponse = await fetch('https://slotbox-api.onrender.com/api/wallet/history', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Status do histórico:', historyResponse.status);
        
        if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            console.log('✅ Histórico obtido com sucesso');
            console.log(`📊 Total de transações: ${historyData.data?.length || 0}`);
            
            if (historyData.data && historyData.data.length > 0) {
                console.log('📋 Últimas transações:');
                historyData.data.slice(0, 10).forEach((transacao, index) => {
                    console.log(`   ${index + 1}. ${transacao.tipo} - R$ ${transacao.valor} - ${transacao.descricao} - ${transacao.created_at}`);
                });
            }
        } else {
            console.log('⚠️ Não foi possível obter histórico');
        }
        
        // 4. Verificar endpoint de casos
        console.log('\n📦 VERIFICANDO CASES:');
        console.log('======================');
        
        const casesResponse = await fetch('https://slotbox-api.onrender.com/api/cases', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Status dos cases:', casesResponse.status);
        
        if (casesResponse.ok) {
            const casesData = await casesResponse.json();
            console.log('✅ Cases obtidos com sucesso');
            console.log(`📊 Total de cases: ${casesData.data?.length || 0}`);
            
            if (casesData.data && casesData.data.length > 0) {
                console.log('📋 Cases disponíveis:');
                casesData.data.forEach((caseItem, index) => {
                    console.log(`   ${index + 1}. ${caseItem.nome} - R$ ${caseItem.preco}`);
                });
            }
        } else {
            console.log('❌ Falha ao buscar cases');
        }
        
        // 5. Verificar endpoint de prêmios
        console.log('\n🎁 VERIFICANDO PRÊMIOS:');
        console.log('========================');
        
        const prizesResponse = await fetch('https://slotbox-api.onrender.com/api/prizes', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('📊 Status dos prêmios:', prizesResponse.status);
        
        if (prizesResponse.ok) {
            const prizesData = await prizesResponse.json();
            console.log('✅ Prêmios obtidos com sucesso');
            console.log(`📊 Total de prêmios: ${prizesData.data?.length || 0}`);
        } else {
            console.log('❌ Falha ao buscar prêmios');
        }
        
        // 6. Teste de abertura de caixa (se tiver saldo)
        if (walletData.data.saldo_reais > 0) {
            console.log('\n🎲 TESTANDO ABERTURA DE CAIXA:');
            console.log('==============================');
            
            const casesData = await casesResponse.json();
            
            if (casesData.success && casesData.data.length > 0) {
                const testCase = casesData.data[0];
                const casePrice = parseFloat(testCase.preco);
                
                console.log(`🎯 Testando com caixa: ${testCase.nome}`);
                console.log(`💰 Preço: R$ ${casePrice}`);
                console.log(`💰 Saldo disponível: R$ ${walletData.data.saldo_reais}`);
                
                if (walletData.data.saldo_reais >= casePrice) {
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
                        
                        // Verificar se o saldo foi atualizado
                        const newWalletResponse = await fetch('https://slotbox-api.onrender.com/api/wallet', {
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        const newWalletData = await newWalletResponse.json();
                        console.log('💰 Saldo após abertura:', newWalletData.data.saldo_reais);
                        
                    } else {
                        console.log('❌ Falha na abertura:', openResult.error || openResult.message);
                    }
                } else {
                    console.log('⚠️ Saldo insuficiente para teste');
                }
            }
        }
        
        console.log('\n✅ VERIFICAÇÃO DO BACKEND CONCLUÍDA!');
        
    } catch (error) {
        console.log('❌ Erro na verificação do backend:', error);
    }
}

// Executar verificação
verificarSaldoBackend();

// Exportar função
window.verificarBackend = {
    executar: verificarSaldoBackend
};

console.log('🔧 Verificação carregada! Use window.verificarBackend.executar() para executar novamente.');
