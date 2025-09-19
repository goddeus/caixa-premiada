/**
 * 🎯 TESTE FINAL DA CORREÇÃO
 * 
 * Este script testa se o problema foi realmente resolvido
 * e verifica se as caixas estão funcionando corretamente.
 */

console.log('🎯 INICIANDO TESTE FINAL DA CORREÇÃO...');
console.log('========================================');

// Função para testar uma caixa específica
async function testarCaixaCompleta(caseId, caseName) {
    console.log(`\n🎲 Testando caixa: ${caseName}`);
    console.log(`📋 ID: ${caseId}`);
    
    try {
        // 1. Verificar dados da caixa
        const caseResponse = await fetch(`https://slotbox-api.onrender.com/api/cases/${caseId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        const caseData = await caseResponse.json();
        
        if (!caseData.success) {
            console.log('❌ Erro ao buscar dados da caixa');
            return false;
        }
        
        console.log('✅ Dados da caixa carregados');
        console.log(`   Nome: ${caseData.data.nome}`);
        console.log(`   Preço: R$ ${caseData.data.preco}`);
        console.log(`   Prêmios: ${caseData.data.prizes?.length || 0}`);
        
        // 2. Verificar saldo do usuário
        const walletResponse = await fetch('https://slotbox-api.onrender.com/api/wallet', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        const walletData = await walletResponse.json();
        
        if (!walletData.success) {
            console.log('❌ Erro ao buscar saldo');
            return false;
        }
        
        const saldo = walletData.data.saldo_reais;
        const preco = parseFloat(caseData.data.preco);
        
        console.log(`💰 Saldo atual: R$ ${saldo}`);
        console.log(`💸 Preço da caixa: R$ ${preco}`);
        
        if (saldo < preco) {
            console.log('⚠️ Saldo insuficiente para testar');
            return false;
        }
        
        // 3. Tentar abrir a caixa
        console.log('🎲 Abrindo caixa...');
        
        const openResponse = await fetch(`https://slotbox-api.onrender.com/api/cases/buy/${caseId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        const openResult = await openResponse.json();
        console.log('📊 Resultado da abertura:', openResult);
        
        // 4. Verificar resultado
        if (!openResult.success) {
            console.log('❌ Falha na abertura:', openResult.message || openResult.error);
            return false;
        }
        
        // 5. Verificar estrutura do prêmio
        if (openResult.data && openResult.data.premio) {
            const premio = openResult.data.premio;
            console.log('✅ PRÊMIO ENCONTRADO!');
            console.log(`   Nome: ${premio.nome}`);
            console.log(`   Valor: R$ ${premio.valor}`);
            console.log(`   ID: ${premio.id}`);
            console.log(`   Ganhou: ${openResult.data.ganhou}`);
            console.log(`   Saldo restante: R$ ${openResult.data.saldo_restante}`);
            
            // Verificar se tem transação
            if (openResult.data.transacao) {
                const transacao = openResult.data.transacao;
                console.log('💳 Transação processada:');
                console.log(`   Valor debitado: R$ ${transacao.valor_debitado}`);
                console.log(`   Valor creditado: R$ ${transacao.valor_creditado}`);
                console.log(`   Saldo antes: R$ ${transacao.saldo_antes}`);
                console.log(`   Saldo depois: R$ ${transacao.saldo_depois}`);
            }
            
            return true;
            
        } else {
            console.log('❌ PROBLEMA: Sucesso=true mas sem prêmio!');
            console.log('📊 Estrutura completa:', JSON.stringify(openResult, null, 2));
            return false;
        }
        
    } catch (error) {
        console.log('❌ Erro no teste:', error);
        return false;
    }
}

// Função principal de teste
async function executarTesteFinal() {
    console.log('🚀 Executando teste final...');
    
    try {
        // Buscar todas as caixas
        const casesResponse = await fetch('https://slotbox-api.onrender.com/api/cases', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        });
        
        const casesData = await casesResponse.json();
        
        if (!casesData.success || !casesData.data) {
            console.log('❌ Erro ao buscar caixas');
            return;
        }
        
        console.log(`📦 Encontradas ${casesData.data.length} caixas`);
        
        // Testar até 3 caixas diferentes
        const caixasParaTestar = casesData.data.slice(0, 3);
        const resultados = [];
        
        for (const caixa of caixasParaTestar) {
            const sucesso = await testarCaixaCompleta(caixa.id, caixa.nome);
            resultados.push({
                nome: caixa.nome,
                id: caixa.id,
                sucesso: sucesso
            });
            
            // Aguardar entre testes
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Gerar relatório final
        console.log('\n📊 RELATÓRIO FINAL DO TESTE');
        console.log('============================');
        
        const sucessos = resultados.filter(r => r.sucesso).length;
        const falhas = resultados.filter(r => !r.sucesso).length;
        
        console.log(`✅ Sucessos: ${sucessos}/${resultados.length}`);
        console.log(`❌ Falhas: ${falhas}/${resultados.length}`);
        
        resultados.forEach((resultado, index) => {
            const status = resultado.sucesso ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${resultado.nome}`);
        });
        
        if (sucessos === resultados.length) {
            console.log('\n🎉 TODOS OS TESTES PASSARAM!');
            console.log('✅ As caixas estão funcionando corretamente!');
            console.log('✅ O problema foi resolvido!');
        } else if (sucessos > 0) {
            console.log('\n⚠️ ALGUNS TESTES PASSARAM');
            console.log('🔧 Verifique os problemas específicos acima');
        } else {
            console.log('\n❌ TODOS OS TESTES FALHARAM');
            console.log('🔧 Há problemas que precisam ser corrigidos');
        }
        
        // Diagnóstico adicional
        console.log('\n🔍 DIAGNÓSTICO ADICIONAL:');
        console.log('=========================');
        
        if (falhas > 0) {
            console.log('💡 Possíveis causas das falhas:');
            console.log('1. Saldo insuficiente');
            console.log('2. Problemas de conectividade');
            console.log('3. Erros no servidor');
            console.log('4. Problemas de autenticação');
        }
        
        console.log('\n✅ TESTE FINAL CONCLUÍDO!');
        
    } catch (error) {
        console.log('❌ Erro crítico no teste final:', error);
    }
}

// Executar teste
executarTesteFinal();

// Exportar para uso manual
window.testeFinal = {
    executar: executarTesteFinal,
    testarCaixa: testarCaixaCompleta
};

console.log('🎯 Teste final carregado! Use window.testeFinal.executar() para executar novamente.');
