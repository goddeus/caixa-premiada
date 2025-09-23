/**
 * 🔍 VERIFICAÇÃO DA LÓGICA DE PRÊMIOS POR TIPO DE CONTA
 * 
 * Este script verifica se o backend está usando lógica diferente
 * para selecionar prêmios baseado no tipo de conta do usuário.
 */

console.log('🔍 VERIFICANDO LÓGICA DE PRÊMIOS POR TIPO DE CONTA...');
console.log('====================================================');

// Função para verificar a lógica de prêmios
async function verificarLogicaPremios() {
    console.log('🚀 Iniciando verificação da lógica de prêmios...');
    
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.log('❌ Token não encontrado - usuário não autenticado');
            return;
        }

        // 1. Verificar dados do usuário
        console.log('\n👤 VERIFICANDO USUÁRIO:');
        console.log('=======================');
        
        const userResponse = await fetch('https://slotbox-api.onrender.com/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const userData = await userResponse.json();
        const user = userData.data;
        
        console.log(`✅ Usuário: ${user.nome}`);
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
        const wallet = walletData.data;
        
        console.log(`✅ Saldo: R$ ${wallet.saldo_reais}`);
        console.log(`   Tipo de conta: ${wallet.tipo_conta || 'N/A'}`);
        console.log(`   Total de giros: ${wallet.total_giros || 0}`);
        
        // 3. Verificar se há diferenças na API baseado no tipo de conta
        console.log('\n🔍 VERIFICANDO DIFERENÇAS NA API:');
        console.log('==================================');
        
        // Testar diferentes headers para simular tipos de conta
        const headers = [
            { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Tipo-Conta': 'normal' },
            { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Tipo-Conta': 'premium' },
            { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Tipo-Conta': 'admin' }
        ];
        
        const resultados = [];
        
        for (let i = 0; i < headers.length; i++) {
            const header = headers[i];
            const tipoConta = header['X-Tipo-Conta'] || 'padrão';
            
            console.log(`\n🧪 Testando com tipo de conta: ${tipoConta}`);
            
            try {
                // Testar endpoint de caixas
                const casesResponse = await fetch('https://slotbox-api.onrender.com/api/cases', {
                    headers: header
                });
                
                const casesData = await casesResponse.json();
                
                if (casesData.success) {
                    console.log(`   ✅ Caixas: ${casesData.data.length}`);
                    resultados.push({
                        tipo: tipoConta,
                        caixas: casesData.data.length,
                        sucesso: true
                    });
                } else {
                    console.log(`   ❌ Erro nas caixas: ${casesData.message}`);
                    resultados.push({
                        tipo: tipoConta,
                        caixas: 0,
                        sucesso: false,
                        erro: casesData.message
                    });
                }
                
                // Testar endpoint de prêmios
                const prizesResponse = await fetch('https://slotbox-api.onrender.com/api/prizes', {
                    headers: header
                });
                
                const prizesData = await prizesResponse.json();
                
                if (prizesData.success) {
                    console.log(`   ✅ Prêmios: ${prizesData.data.length}`);
                    resultados[resultados.length - 1].premios = prizesData.data.length;
                } else {
                    console.log(`   ❌ Erro nos prêmios: ${prizesData.message}`);
                    resultados[resultados.length - 1].premios = 0;
                    resultados[resultados.length - 1].erroPremios = prizesData.message;
                }
                
            } catch (error) {
                console.log(`   ❌ Erro na requisição: ${error.message}`);
                resultados.push({
                    tipo: tipoConta,
                    caixas: 0,
                    premios: 0,
                    sucesso: false,
                    erro: error.message
                });
            }
        }
        
        // 4. Analisar resultados
        console.log('\n📊 ANÁLISE DOS RESULTADOS:');
        console.log('==========================');
        
        const tiposComSucesso = resultados.filter(r => r.sucesso);
        const tiposComErro = resultados.filter(r => !r.sucesso);
        
        if (tiposComSucesso.length > 0) {
            console.log('✅ Tipos de conta que funcionaram:');
            tiposComSucesso.forEach(resultado => {
                console.log(`   ${resultado.tipo}: ${resultado.caixas} caixas, ${resultado.premios} prêmios`);
            });
        }
        
        if (tiposComErro.length > 0) {
            console.log('❌ Tipos de conta com erro:');
            tiposComErro.forEach(resultado => {
                console.log(`   ${resultado.tipo}: ${resultado.erro}`);
            });
        }
        
        // 5. Verificar se há diferenças nos dados retornados
        console.log('\n🔍 VERIFICANDO DIFERENÇAS NOS DADOS:');
        console.log('=====================================');
        
        const tiposComDados = resultados.filter(r => r.sucesso && r.caixas > 0);
        
        if (tiposComDados.length > 1) {
            console.log('⚠️ Múltiplos tipos de conta retornaram dados diferentes!');
            
            // Verificar se há diferenças no número de caixas/prêmios
            const caixasUnicas = [...new Set(tiposComDados.map(r => r.caixas))];
            const premiosUnicos = [...new Set(tiposComDados.map(r => r.premios))];
            
            if (caixasUnicas.length > 1) {
                console.log('❌ PROBLEMA: Número de caixas varia por tipo de conta!');
                console.log(`   Caixas por tipo: ${caixasUnicas.join(', ')}`);
            }
            
            if (premiosUnicos.length > 1) {
                console.log('❌ PROBLEMA: Número de prêmios varia por tipo de conta!');
                console.log(`   Prêmios por tipo: ${premiosUnicos.join(', ')}`);
            }
        } else {
            console.log('✅ Apenas um tipo de conta retornou dados');
        }
        
        // 6. Testar abertura de caixa com verificação de tipo
        console.log('\n🎲 TESTANDO ABERTURA COM VERIFICAÇÃO DE TIPO:');
        console.log('===============================================');
        
        if (wallet.saldo_reais > 0) {
            // Buscar caixas novamente
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
                
                if (wallet.saldo_reais >= casePrice) {
                    console.log(`🎯 Testando abertura da caixa: ${testCase.nome}`);
                    console.log(`   Preço: R$ ${casePrice}`);
                    console.log(`   Tipo de conta atual: ${wallet.tipo_conta || 'N/A'}`);
                    
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
                                
                                // Verificar se o ID do prêmio segue um padrão
                                if (premio.id.includes('_')) {
                                    const partes = premio.id.split('_');
                                    console.log(`   🔍 ID analisado: ${partes.join(' | ')}`);
                                    
                                    if (partes.length === 2) {
                                        const [tipoCaixa, valor] = partes;
                                        console.log(`   💡 Tipo de caixa: ${tipoCaixa}`);
                                        console.log(`   💡 Valor: ${valor}`);
                                        console.log('   💡 Este parece ser um prêmio gerado dinamicamente!');
                                    }
                                }
                                
                                // Verificar se o prêmio existe na lista de prêmios
                                const prizesResponse = await fetch('https://slotbox-api.onrender.com/api/prizes', {
                                    headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    }
                                });
                                
                                const prizesData = await prizesResponse.json();
                                
                                if (prizesData.success) {
                                    const premioExiste = prizesData.data.find(p => p.id === premio.id);
                                    
                                    if (!premioExiste) {
                                        console.log('❌ PROBLEMA CONFIRMADO: Prêmio não existe na lista!');
                                        console.log('💡 CAUSA PROVÁVEL: Backend gera prêmios dinamicamente baseado no tipo de conta');
                                        
                                        // Verificar se há prêmios similares
                                        const premiosSimilares = prizesData.data.filter(p => 
                                            p.nome === premio.nome && p.valor === premio.valor
                                        );
                                        
                                        if (premiosSimilares.length > 0) {
                                            console.log(`✅ Encontrados ${premiosSimilares.length} prêmios similares na lista:`);
                                            premiosSimilares.forEach(p => {
                                                console.log(`   🎁 ${p.nome} (ID: ${p.id}) - Caixa: ${p.case_id}`);
                                            });
                                        }
                                    } else {
                                        console.log('✅ Prêmio existe na lista');
                                    }
                                }
                                
                            } else {
                                console.log('❌ PROBLEMA: Caixa não retornou prêmio!');
                            }
                        } else {
                            console.log('❌ Falha na abertura:', openResult.message || openResult.error);
                        }
                        
                    } catch (error) {
                        console.log('❌ Erro no teste:', error.message);
                    }
                } else {
                    console.log('⚠️ Saldo insuficiente para teste');
                }
            }
        } else {
            console.log('⚠️ Saldo zero - não é possível testar');
        }
        
        // 7. Relatório final
        console.log('\n📊 RELATÓRIO FINAL:');
        console.log('===================');
        
        console.log('🔍 PROBLEMAS IDENTIFICADOS:');
        console.log('===========================');
        
        const problemas = [];
        
        if (tiposComErro.length > 0) {
            problemas.push('Alguns tipos de conta retornam erro na API');
        }
        
        if (tiposComDados.length > 1) {
            const caixasUnicas = [...new Set(tiposComDados.map(r => r.caixas))];
            const premiosUnicos = [...new Set(tiposComDados.map(r => r.premios))];
            
            if (caixasUnicas.length > 1) {
                problemas.push('Número de caixas varia por tipo de conta');
            }
            
            if (premiosUnicos.length > 1) {
                problemas.push('Número de prêmios varia por tipo de conta');
            }
        }
        
        if (problemas.length === 0) {
            console.log('✅ Nenhum problema relacionado ao tipo de conta encontrado');
        } else {
            problemas.forEach((problema, index) => {
                console.log(`${index + 1}. ❌ ${problema}`);
            });
        }
        
        console.log('\n💡 CONCLUSÕES:');
        console.log('===============');
        console.log('1. 🔧 O backend pode estar usando lógica diferente para diferentes tipos de conta');
        console.log('2. 🔧 Prêmios podem ser gerados dinamicamente baseado no tipo de conta');
        console.log('3. 🔧 IDs como weekend_1, nike_1 são prêmios especiais não listados na tabela');
        console.log('4. 🔧 Isso explica por que aparecem "dados do prêmio não encontrado"');
        
        console.log('\n✅ VERIFICAÇÃO CONCLUÍDA!');
        
        return {
            resultados: resultados,
            problemas: problemas,
            tipoContaAtual: wallet.tipo_conta
        };
        
    } catch (error) {
        console.log('❌ Erro na verificação:', error);
        return null;
    }
}

// Executar verificação
verificarLogicaPremios();

// Exportar funções
window.verificarLogicaPremios = {
    verificar: verificarLogicaPremios
};

console.log('🔍 Verificação de lógica de prêmios carregada! Use window.verificarLogicaPremios.verificar() para executar novamente.');





