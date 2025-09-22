/**
 * 🔍 DIAGNÓSTICO DE TIPOS DE CONTA E PRÊMIOS
 * 
 * Este script verifica se os problemas de prêmios estão relacionados
 * aos diferentes tipos de conta (normal vs premium/admin).
 */

console.log('🔍 INICIANDO DIAGNÓSTICO DE TIPOS DE CONTA E PRÊMIOS...');
console.log('=====================================================');

// Função para diagnosticar tipos de conta
async function diagnosticarTiposConta() {
    console.log('🚀 Iniciando diagnóstico de tipos de conta...');
    
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.log('❌ Token não encontrado - usuário não autenticado');
            return;
        }

        // 1. Verificar dados do usuário atual
        console.log('\n👤 VERIFICANDO USUÁRIO ATUAL:');
        console.log('=============================');
        
        const userResponse = await fetch('https://slotbox-api.onrender.com/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const userData = await userResponse.json();
        
        if (!userData.success) {
            console.log('❌ Erro ao buscar dados do usuário');
            return;
        }
        
        const user = userData.data;
        console.log('✅ Usuário carregado:');
        console.log(`   Nome: ${user.nome}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Tipo de conta: ${user.tipo_conta || 'N/A'}`);
        console.log(`   É admin: ${user.is_admin ? 'Sim' : 'Não'}`);
        console.log(`   É premium: ${user.is_premium ? 'Sim' : 'Não'}`);
        
        // 2. Verificar wallet
        console.log('\n💰 VERIFICANDO WALLET:');
        console.log('======================');
        
        const walletResponse = await fetch('https://slotbox-api.onrender.com/api/wallet', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const walletData = await walletResponse.json();
        
        if (!walletData.success) {
            console.log('❌ Erro ao buscar wallet');
            return;
        }
        
        const wallet = walletData.data;
        console.log('✅ Wallet carregado:');
        console.log(`   Saldo real: R$ ${wallet.saldo_reais}`);
        console.log(`   Saldo demo: R$ ${wallet.saldo_demo}`);
        console.log(`   Tipo de conta: ${wallet.tipo_conta || 'N/A'}`);
        console.log(`   Total de giros: ${wallet.total_giros || 0}`);
        console.log(`   Rollover liberado: ${wallet.rollover_liberado ? 'Sim' : 'Não'}`);
        
        // 3. Verificar se há diferenças entre tipos de conta
        console.log('\n🔍 COMPARANDO TIPOS DE CONTA:');
        console.log('==============================');
        
        const tipoContaUser = user.tipo_conta;
        const tipoContaWallet = wallet.tipo_conta;
        
        if (tipoContaUser !== tipoContaWallet) {
            console.log('⚠️ INCONSISTÊNCIA ENCONTRADA!');
            console.log(`   Tipo no usuário: ${tipoContaUser}`);
            console.log(`   Tipo no wallet: ${tipoContaWallet}`);
        } else {
            console.log('✅ Tipos de conta consistentes');
        }
        
        // 4. Verificar prêmios por tipo de conta
        console.log('\n🎁 VERIFICANDO PRÊMIOS POR TIPO DE CONTA:');
        console.log('==========================================');
        
        const prizesResponse = await fetch('https://slotbox-api.onrender.com/api/prizes', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const prizesData = await prizesResponse.json();
        
        if (!prizesData.success) {
            console.log('❌ Erro ao buscar prêmios');
            return;
        }
        
        console.log(`✅ Encontrados ${prizesData.data.length} prêmios`);
        
        // Verificar se prêmios têm restrições de tipo de conta
        const premiosComRestricao = prizesData.data.filter(prize => 
            prize.tipo_conta_permitido || prize.restricao_tipo_conta
        );
        
        if (premiosComRestricao.length > 0) {
            console.log(`⚠️ Encontrados ${premiosComRestricao.length} prêmios com restrições de tipo de conta:`);
            premiosComRestricao.forEach(premio => {
                console.log(`   🎁 ${premio.nome} - Restrição: ${premio.tipo_conta_permitido || premio.restricao_tipo_conta}`);
            });
        } else {
            console.log('✅ Nenhum prêmio com restrições de tipo de conta encontrado');
        }
        
        // 5. Verificar caixas por tipo de conta
        console.log('\n📦 VERIFICANDO CAIXAS POR TIPO DE CONTA:');
        console.log('=========================================');
        
        const casesResponse = await fetch('https://slotbox-api.onrender.com/api/cases', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const casesData = await casesResponse.json();
        
        if (!casesData.success) {
            console.log('❌ Erro ao buscar caixas');
            return;
        }
        
        console.log(`✅ Encontradas ${casesData.data.length} caixas`);
        
        // Verificar se caixas têm restrições de tipo de conta
        const caixasComRestricao = casesData.data.filter(caixa => 
            caixa.tipo_conta_permitido || caixa.restricao_tipo_conta
        );
        
        if (caixasComRestricao.length > 0) {
            console.log(`⚠️ Encontradas ${caixasComRestricao.length} caixas com restrições de tipo de conta:`);
            caixasComRestricao.forEach(caixa => {
                console.log(`   📦 ${caixa.nome} - Restrição: ${caixa.tipo_conta_permitido || caixa.restricao_tipo_conta}`);
            });
        } else {
            console.log('✅ Nenhuma caixa com restrições de tipo de conta encontrada');
        }
        
        // 6. Testar abertura de caixa com verificação de tipo
        console.log('\n🎲 TESTANDO ABERTURA COM VERIFICAÇÃO DE TIPO:');
        console.log('===============================================');
        
        if (wallet.saldo_reais > 0) {
            const testCase = casesData.data[0];
            const casePrice = parseFloat(testCase.preco);
            
            if (wallet.saldo_reais >= casePrice) {
                console.log(`🎯 Testando caixa: ${testCase.nome}`);
                console.log(`   Preço: R$ ${casePrice}`);
                console.log(`   Tipo de conta atual: ${wallet.tipo_conta}`);
                
                try {
                    const openResponse = await fetch(`https://slotbox-api.onrender.com/api/cases/buy/${testCase.id}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    const openResult = await openResponse.json();
                    console.log('📊 Resultado da abertura:', openResult);
                    
                    if (openResult.success) {
                        if (openResult.data && openResult.data.premio) {
                            const premio = openResult.data.premio;
                            console.log('✅ Prêmio obtido:');
                            console.log(`   Nome: ${premio.nome}`);
                            console.log(`   Valor: R$ ${premio.valor}`);
                            console.log(`   ID: ${premio.id}`);
                            console.log(`   Tipo de conta: ${premio.tipo_conta || 'N/A'}`);
                            
                            // Verificar se o prêmio existe na lista
                            const premioExiste = prizesData.data.find(p => p.id === premio.id);
                            if (!premioExiste) {
                                console.log('❌ PROBLEMA: Prêmio retornado não existe na lista!');
                                console.log('🔍 Verificando se é um prêmio especial para tipo de conta...');
                                
                                // Verificar se é um prêmio especial baseado no ID
                                if (premio.id.includes('_') && premio.id.split('_').length === 2) {
                                    const [tipoCaixa, valor] = premio.id.split('_');
                                    console.log(`   Tipo de caixa: ${tipoCaixa}`);
                                    console.log(`   Valor: ${valor}`);
                                    console.log('💡 Este parece ser um prêmio especial gerado dinamicamente!');
                                }
                            } else {
                                console.log('✅ Prêmio existe na lista');
                            }
                        } else {
                            console.log('❌ PROBLEMA: Caixa não retornou prêmio!');
                        }
                    } else {
                        console.log('❌ Falha na abertura:', openResult.message || openResult.error);
                        
                        // Verificar se é erro relacionado ao tipo de conta
                        if (openResult.message && openResult.message.includes('tipo de conta')) {
                            console.log('🔍 ERRO RELACIONADO AO TIPO DE CONTA!');
                        }
                    }
                    
                } catch (error) {
                    console.log('❌ Erro no teste:', error.message);
                }
            } else {
                console.log('⚠️ Saldo insuficiente para teste');
            }
        } else {
            console.log('⚠️ Saldo zero - não é possível testar');
        }
        
        // 7. Verificar se há prêmios especiais por tipo de conta
        console.log('\n🔍 VERIFICANDO PRÊMIOS ESPECIAIS:');
        console.log('==================================');
        
        // Verificar se há prêmios com IDs especiais (como weekend_1, nike_1, etc.)
        const premiosEspeciais = prizesData.data.filter(prize => 
            prize.id.includes('_') && 
            (prize.id.includes('weekend') || 
             prize.id.includes('nike') || 
             prize.id.includes('samsung') || 
             prize.id.includes('apple') || 
             prize.id.includes('console') || 
             prize.id.includes('premium'))
        );
        
        if (premiosEspeciais.length > 0) {
            console.log(`✅ Encontrados ${premiosEspeciais.length} prêmios especiais:`);
            premiosEspeciais.forEach(premio => {
                console.log(`   🎁 ${premio.nome} (ID: ${premio.id})`);
            });
        } else {
            console.log('⚠️ Nenhum prêmio especial encontrado na lista');
            console.log('💡 Isso explica por que os IDs como weekend_1, nike_1 não existem!');
        }
        
        // 8. Relatório final
        console.log('\n📊 RELATÓRIO FINAL:');
        console.log('===================');
        
        console.log('🔍 ANÁLISE DOS PROBLEMAS:');
        console.log('=========================');
        
        if (premiosEspeciais.length === 0) {
            console.log('❌ PROBLEMA IDENTIFICADO:');
            console.log('   Os prêmios retornados (weekend_1, nike_1, samsung_2) não existem na lista');
            console.log('   Isso indica que o backend está gerando prêmios dinamicamente');
            console.log('   ou usando uma lógica diferente para diferentes tipos de conta');
        }
        
        if (tipoContaUser !== tipoContaWallet) {
            console.log('❌ PROBLEMA IDENTIFICADO:');
            console.log('   Inconsistência entre tipo de conta do usuário e wallet');
        }
        
        console.log('\n💡 POSSÍVEIS CAUSAS:');
        console.log('=====================');
        console.log('1. 🔧 Backend gera prêmios dinamicamente baseado no tipo de conta');
        console.log('2. 🔧 Prêmios especiais não estão na tabela de prêmios');
        console.log('3. 🔧 Lógica de seleção diferente para contas normais vs premium');
        console.log('4. 🔧 Inconsistência entre dados do usuário e wallet');
        
        console.log('\n✅ DIAGNÓSTICO CONCLUÍDO!');
        
        return {
            user: user,
            wallet: wallet,
            premiosEspeciais: premiosEspeciais,
            tipoContaConsistente: tipoContaUser === tipoContaWallet
        };
        
    } catch (error) {
        console.log('❌ Erro no diagnóstico:', error);
        return null;
    }
}

// Função para testar com diferentes tipos de conta
async function testarDiferentesTiposConta() {
    console.log('\n🧪 TESTANDO DIFERENTES TIPOS DE CONTA:');
    console.log('=======================================');
    
    try {
        const token = localStorage.getItem('token');
        
        // Simular diferentes tipos de conta
        const tiposConta = ['normal', 'premium', 'admin'];
        
        for (const tipo of tiposConta) {
            console.log(`\n🔍 Testando tipo de conta: ${tipo}`);
            
            // Verificar se há diferenças na resposta da API
            const testResponse = await fetch('https://slotbox-api.onrender.com/api/cases', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Tipo-Conta': tipo // Header customizado para testar
                }
            });
            
            const testData = await testResponse.json();
            
            if (testData.success) {
                console.log(`   ✅ API respondeu para tipo ${tipo}`);
                console.log(`   📦 Caixas disponíveis: ${testData.data.length}`);
            } else {
                console.log(`   ❌ API falhou para tipo ${tipo}`);
            }
        }
        
    } catch (error) {
        console.log('❌ Erro no teste de tipos de conta:', error);
    }
}

// Executar diagnóstico
diagnosticarTiposConta();

// Exportar funções
window.diagnosticoTiposConta = {
    diagnosticar: diagnosticarTiposConta,
    testarTipos: testarDiferentesTiposConta
};

console.log('🔍 Diagnóstico de tipos de conta carregado! Use window.diagnosticoTiposConta.diagnosticar() para executar novamente.');



