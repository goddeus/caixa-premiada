/**
 * 🧪 TESTE DA CORREÇÃO DEFINITIVA
 * 
 * Este script testa se a correção definitiva está funcionando
 * corretamente, substituindo prêmios dinâmicos por válidos.
 */

console.log('🧪 INICIANDO TESTE DA CORREÇÃO DEFINITIVA...');
console.log('============================================');

// Função para testar a correção
async function testarCorrecaoDefinitiva() {
    console.log('🚀 Iniciando teste da correção definitiva...');
    
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.log('❌ Token não encontrado - usuário não autenticado');
            return;
        }

        // 1. Verificar se a correção está ativa
        console.log('\n🔍 VERIFICANDO CORREÇÃO ATIVA:');
        console.log('==============================');
        
        if (window.fetch.toString().includes('cases/buy')) {
            console.log('✅ Interceptação de fetch ativa');
        } else {
            console.log('❌ Interceptação de fetch não ativa');
            console.log('💡 Execute window.correcaoBackend.corrigir() primeiro');
            return;
        }

        // 2. Buscar caixas disponíveis
        console.log('\n📦 BUSCANDO CAIXAS DISPONÍVEIS:');
        console.log('=================================');
        
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
        
        // 3. Buscar prêmios válidos
        console.log('\n🎁 BUSCANDO PRÊMIOS VÁLIDOS:');
        console.log('=============================');
        
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
        
        console.log(`✅ Encontrados ${prizesData.data.length} prêmios válidos`);
        
        // 4. Testar abertura de cada caixa
        console.log('\n🎲 TESTANDO ABERTURA DE CAIXAS:');
        console.log('===============================');
        
        const resultados = [];
        
        for (let i = 0; i < Math.min(casesData.data.length, 3); i++) {
            const caixa = casesData.data[i];
            console.log(`\n🎯 Testando caixa ${i + 1}: ${caixa.nome}`);
            
            try {
                const openResponse = await fetch(`https://slotbox-api.onrender.com/api/cases/buy/${caixa.id}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const openResult = await openResponse.json();
                
                if (openResult.success && openResult.data && openResult.data.premio) {
                    const premio = openResult.data.premio;
                    
                    console.log(`   🎁 Prêmio obtido: ${premio.nome}`);
                    console.log(`   💰 Valor: R$ ${premio.valor}`);
                    console.log(`   🆔 ID: ${premio.id}`);
                    
                    // Verificar se é prêmio dinâmico
                    if (premio.id.includes('_')) {
                        console.log('   ❌ PROBLEMA: Ainda retornando prêmio dinâmico!');
                        resultados.push({
                            caixa: caixa.nome,
                            premio: premio.nome,
                            id: premio.id,
                            status: 'ERRO',
                            problema: 'Prêmio dinâmico não corrigido'
                        });
                    } else {
                        // Verificar se existe na lista de prêmios
                        const premioExiste = prizesData.data.find(p => p.id === premio.id);
                        
                        if (premioExiste) {
                            console.log('   ✅ SUCESSO: Prêmio válido da tabela!');
                            resultados.push({
                                caixa: caixa.nome,
                                premio: premio.nome,
                                id: premio.id,
                                status: 'SUCESSO',
                                problema: null
                            });
                        } else {
                            console.log('   ❌ PROBLEMA: Prêmio não existe na tabela!');
                            resultados.push({
                                caixa: caixa.nome,
                                premio: premio.nome,
                                id: premio.id,
                                status: 'ERRO',
                                problema: 'Prêmio não existe na tabela'
                            });
                        }
                    }
                    
                } else {
                    console.log('   ❌ Falha na abertura:', openResult.message || openResult.error);
                    resultados.push({
                        caixa: caixa.nome,
                        premio: null,
                        id: null,
                        status: 'ERRO',
                        problema: 'Falha na abertura da caixa'
                    });
                }
                
                // Aguardar entre testes
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                console.log('   ❌ Erro no teste:', error.message);
                resultados.push({
                    caixa: caixa.nome,
                    premio: null,
                    id: null,
                    status: 'ERRO',
                    problema: error.message
                });
            }
        }
        
        // 5. Relatório final
        console.log('\n📊 RELATÓRIO FINAL DOS TESTES:');
        console.log('==============================');
        
        const sucessos = resultados.filter(r => r.status === 'SUCESSO').length;
        const erros = resultados.filter(r => r.status === 'ERRO').length;
        const total = resultados.length;
        
        console.log(`✅ Testes bem-sucedidos: ${sucessos}/${total}`);
        console.log(`❌ Testes com erro: ${erros}/${total}`);
        
        console.log('\n📋 DETALHES DOS RESULTADOS:');
        console.log('===========================');
        
        resultados.forEach((resultado, index) => {
            const status = resultado.status === 'SUCESSO' ? '✅' : '❌';
            console.log(`${status} ${index + 1}. ${resultado.caixa}`);
            console.log(`   Prêmio: ${resultado.premio || 'N/A'}`);
            console.log(`   ID: ${resultado.id || 'N/A'}`);
            if (resultado.problema) {
                console.log(`   Problema: ${resultado.problema}`);
            }
        });
        
        // 6. Recomendações
        console.log('\n💡 RECOMENDAÇÕES:');
        console.log('==================');
        
        if (sucessos === total) {
            console.log('🎉 TODOS OS TESTES PASSARAM!');
            console.log('✅ Correção funcionando perfeitamente');
            console.log('✅ Prêmios dinâmicos sendo corrigidos');
            console.log('✅ Sistema funcionando normalmente');
        } else if (sucessos > 0) {
            console.log('⚠️ ALGUNS TESTES PASSARAM');
            console.log('🔧 Correção funcionando parcialmente');
            console.log('💡 Verificar casos que falharam');
        } else {
            console.log('❌ TODOS OS TESTES FALHARAM');
            console.log('🔧 Correção não está funcionando');
            console.log('💡 Executar correção novamente');
        }
        
        console.log('\n🎯 PRÓXIMOS PASSOS:');
        console.log('===================');
        
        if (sucessos === total) {
            console.log('1. ✅ Sistema funcionando corretamente');
            console.log('2. ✅ Prêmios dinâmicos corrigidos automaticamente');
            console.log('3. ✅ Não aparecerá mais "dados do prêmio não encontrado"');
            console.log('4. ✅ Pode usar o sistema normalmente');
        } else {
            console.log('1. 🔄 Executar correção novamente');
            console.log('2. 🔍 Verificar se interceptação está ativa');
            console.log('3. 🧪 Executar teste novamente');
            console.log('4. 💡 Se persistir, verificar logs de erro');
        }
        
        return {
            sucesso: sucessos === total,
            resultados: resultados,
            total: total,
            sucessos: sucessos,
            erros: erros
        };
        
    } catch (error) {
        console.log('❌ Erro no teste:', error);
        return null;
    }
}

// Função para testar múltiplas vezes
async function testarMultiplasVezes(vezes = 5) {
    console.log(`\n🔄 TESTANDO ${vezes} VEZES PARA VERIFICAR CONSISTÊNCIA:`);
    console.log('====================================================');
    
    const resultados = [];
    
    for (let i = 0; i < vezes; i++) {
        console.log(`\n🧪 Teste ${i + 1}/${vezes}:`);
        const resultado = await testarCorrecaoDefinitiva();
        resultados.push(resultado);
        
        if (i < vezes - 1) {
            console.log('⏳ Aguardando 3 segundos antes do próximo teste...');
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    // Análise final
    console.log('\n📊 ANÁLISE FINAL DOS TESTES:');
    console.log('=============================');
    
    const sucessosTotais = resultados.filter(r => r && r.sucesso).length;
    const totalTestes = resultados.length;
    
    console.log(`✅ Testes bem-sucedidos: ${sucessosTotais}/${totalTestes}`);
    console.log(`❌ Testes com falha: ${totalTestes - sucessosTotais}/${totalTestes}`);
    
    if (sucessosTotais === totalTestes) {
        console.log('\n🎉 CORREÇÃO FUNCIONANDO PERFEITAMENTE!');
        console.log('✅ Todos os testes passaram consistentemente');
        console.log('✅ Sistema estável e confiável');
    } else if (sucessosTotais > totalTestes / 2) {
        console.log('\n⚠️ CORREÇÃO FUNCIONANDO MAIORIA DAS VEZES');
        console.log('🔧 Alguns testes falharam, mas maioria passou');
        console.log('💡 Sistema pode ter instabilidade ocasional');
    } else {
        console.log('\n❌ CORREÇÃO NÃO ESTÁ FUNCIONANDO');
        console.log('🔧 Maioria dos testes falharam');
        console.log('💡 Verificar implementação da correção');
    }
    
    return resultados;
}

// Executar teste
testarCorrecaoDefinitiva();

// Exportar funções
window.testeCorrecaoDefinitiva = {
    testar: testarCorrecaoDefinitiva,
    testarMultiplas: testarMultiplasVezes
};

console.log('🧪 Teste da correção definitiva carregado! Use window.testeCorrecaoDefinitiva.testar() para executar novamente.');




