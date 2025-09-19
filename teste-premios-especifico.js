/**
 * 🎁 TESTE ESPECÍFICO DE PRÊMIOS
 * 
 * Este script foca especificamente nos problemas de "prêmio não encontrado"
 * e outros bugs relacionados aos prêmios das caixas.
 * 
 * INSTRUÇÕES:
 * 1. Execute primeiro o diagnostico-caixas-completo.js
 * 2. Cole este código no console
 * 3. Execute para testar problemas específicos de prêmios
 */

console.log('🎁 INICIANDO TESTE ESPECÍFICO DE PRÊMIOS...');
console.log('==========================================');

// Estado do teste
const PRIZE_TEST_STATE = {
    startTime: Date.now(),
    tests: [],
    errors: [],
    warnings: [],
    prizeIssues: []
};

// Utilitários específicos para prêmios
const PrizeUtils = {
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
    }
};

// Testes específicos de prêmios
const PrizeTests = {
    
    // Teste 1: Verificar prêmios órfãos
    async testOrphanPrizes() {
        PrizeUtils.log('Testando prêmios órfãos...', 'info');
        
        try {
            // Buscar caixas
            const casesResponse = await PrizeUtils.request('https://slotbox-api.onrender.com/api/cases');
            const casesData = await casesResponse.json();
            
            // Buscar prêmios
            const prizesResponse = await PrizeUtils.request('https://slotbox-api.onrender.com/api/prizes');
            const prizesData = await prizesResponse.json();
            
            if (!casesData.success || !prizesData.success) {
                throw new Error('Erro ao buscar dados');
            }
            
            const caseIds = casesData.data.map(c => c.id);
            const orphanPrizes = prizesData.data.filter(prize => 
                !caseIds.includes(prize.case_id)
            );
            
            if (orphanPrizes.length > 0) {
                PrizeUtils.log(`Encontrados ${orphanPrizes.length} prêmios órfãos`, 'warning');
                PRIZE_TEST_STATE.prizeIssues.push({
                    type: 'orphan_prizes',
                    count: orphanPrizes.length,
                    prizes: orphanPrizes
                });
                
                console.log('Prêmios órfãos:', orphanPrizes);
            } else {
                PrizeUtils.log('Nenhum prêmio órfão encontrado', 'success');
            }
            
        } catch (error) {
            PrizeUtils.log(`Erro ao testar prêmios órfãos: ${error.message}`, 'error');
        }
    },

    // Teste 2: Verificar prêmios com dados inválidos
    async testInvalidPrizeData() {
        PrizeUtils.log('Testando dados inválidos de prêmios...', 'info');
        
        try {
            const response = await PrizeUtils.request('https://slotbox-api.onrender.com/api/prizes');
            const data = await response.json();
            
            if (!data.success) {
                throw new Error('Erro ao buscar prêmios');
            }
            
            const invalidPrizes = data.data.filter(prize => {
                return !prize.id || 
                       !prize.nome || 
                       prize.valor === undefined || 
                       prize.valor === null ||
                       !prize.case_id ||
                       prize.probabilidade === undefined ||
                       prize.probabilidade === null;
            });
            
            if (invalidPrizes.length > 0) {
                PrizeUtils.log(`Encontrados ${invalidPrizes.length} prêmios com dados inválidos`, 'warning');
                PRIZE_TEST_STATE.prizeIssues.push({
                    type: 'invalid_data',
                    count: invalidPrizes.length,
                    prizes: invalidPrizes
                });
                
                console.log('Prêmios com dados inválidos:', invalidPrizes);
            } else {
                PrizeUtils.log('Todos os prêmios têm dados válidos', 'success');
            }
            
        } catch (error) {
            PrizeUtils.log(`Erro ao testar dados de prêmios: ${error.message}`, 'error');
        }
    },

    // Teste 3: Verificar probabilidades
    async testPrizeProbabilities() {
        PrizeUtils.log('Testando probabilidades dos prêmios...', 'info');
        
        try {
            const response = await PrizeUtils.request('https://slotbox-api.onrender.com/api/prizes');
            const data = await response.json();
            
            if (!data.success) {
                throw new Error('Erro ao buscar prêmios');
            }
            
            const probabilityIssues = [];
            
            // Verificar probabilidades inválidas
            const invalidProbabilities = data.data.filter(prize => 
                prize.probabilidade <= 0 || prize.probabilidade > 100
            );
            
            if (invalidProbabilities.length > 0) {
                probabilityIssues.push({
                    type: 'invalid_probability',
                    count: invalidProbabilities.length,
                    prizes: invalidProbabilities
                });
            }
            
            // Verificar se a soma das probabilidades por caixa faz sentido
            const casesResponse = await PrizeUtils.request('https://slotbox-api.onrender.com/api/cases');
            const casesData = await casesResponse.json();
            
            if (casesData.success) {
                casesData.data.forEach(caseItem => {
                    const casePrizes = data.data.filter(prize => prize.case_id === caseItem.id);
                    const totalProbability = casePrizes.reduce((sum, prize) => sum + (prize.probabilidade || 0), 0);
                    
                    if (totalProbability !== 100) {
                        probabilityIssues.push({
                            type: 'probability_sum',
                            caseId: caseItem.id,
                            caseName: caseItem.nome,
                            totalProbability: totalProbability,
                            expected: 100
                        });
                    }
                });
            }
            
            if (probabilityIssues.length > 0) {
                PrizeUtils.log(`Encontrados ${probabilityIssues.length} problemas de probabilidade`, 'warning');
                PRIZE_TEST_STATE.prizeIssues.push(...probabilityIssues);
                console.log('Problemas de probabilidade:', probabilityIssues);
            } else {
                PrizeUtils.log('Todas as probabilidades estão corretas', 'success');
            }
            
        } catch (error) {
            PrizeUtils.log(`Erro ao testar probabilidades: ${error.message}`, 'error');
        }
    },

    // Teste 4: Simular múltiplas aberturas de caixa
    async testMultipleCaseOpenings() {
        PrizeUtils.log('Testando múltiplas aberturas de caixa...', 'info');
        
        try {
            // Buscar uma caixa para testar
            const casesResponse = await PrizeUtils.request('https://slotbox-api.onrender.com/api/cases');
            const casesData = await casesResponse.json();
            
            if (!casesData.success || casesData.data.length === 0) {
                throw new Error('Nenhuma caixa encontrada para teste');
            }
            
            const testCase = casesData.data[0];
            PrizeUtils.log(`Testando caixa: ${testCase.nome}`, 'info');
            
            const results = [];
            const errors = [];
            
            // Fazer 5 tentativas de abertura
            for (let i = 0; i < 5; i++) {
                try {
                    PrizeUtils.log(`Tentativa ${i + 1}/5...`, 'debug');
                    
                    const response = await PrizeUtils.request(`https://slotbox-api.onrender.com/api/cases/buy/${testCase.id}`, {
                        method: 'POST'
                    });
                    
                    if (!response.ok) {
                        const errorData = await response.json().catch(() => ({}));
                        errors.push({
                            attempt: i + 1,
                            status: response.status,
                            error: errorData.message || 'Erro desconhecido'
                        });
                        continue;
                    }
                    
                    const result = await response.json();
                    
                    if (!result.success) {
                        errors.push({
                            attempt: i + 1,
                            error: 'Resultado success=false',
                            data: result
                        });
                        continue;
                    }
                    
                    if (!result.data || !result.data.prize) {
                        errors.push({
                            attempt: i + 1,
                            error: 'Prêmio não retornado',
                            data: result
                        });
                        continue;
                    }
                    
                    results.push({
                        attempt: i + 1,
                        prize: result.data.prize,
                        success: true
                    });
                    
                    PrizeUtils.log(`Tentativa ${i + 1}: ${result.data.prize.nome} (R$ ${result.data.prize.valor})`, 'success');
                    
                    // Aguardar entre tentativas
                    await PrizeUtils.delay(1000);
                    
                } catch (error) {
                    errors.push({
                        attempt: i + 1,
                        error: error.message
                    });
                }
            }
            
            // Analisar resultados
            const successRate = (results.length / 5) * 100;
            PrizeUtils.log(`Taxa de sucesso: ${successRate}% (${results.length}/5)`, 
                successRate >= 80 ? 'success' : 'warning');
            
            if (errors.length > 0) {
                PRIZE_TEST_STATE.prizeIssues.push({
                    type: 'opening_errors',
                    successRate: successRate,
                    errors: errors,
                    results: results
                });
                
                console.log('Erros nas aberturas:', errors);
            }
            
            // Verificar se algum prêmio retornado é inválido
            const invalidPrizes = results.filter(r => 
                !r.prize.id || !r.prize.nome || r.prize.valor === undefined
            );
            
            if (invalidPrizes.length > 0) {
                PRIZE_TEST_STATE.prizeIssues.push({
                    type: 'invalid_returned_prizes',
                    count: invalidPrizes.length,
                    prizes: invalidPrizes
                });
                
                console.log('Prêmios inválidos retornados:', invalidPrizes);
            }
            
        } catch (error) {
            PrizeUtils.log(`Erro ao testar aberturas múltiplas: ${error.message}`, 'error');
        }
    },

    // Teste 5: Verificar consistência entre frontend e backend
    async testFrontendBackendConsistency() {
        PrizeUtils.log('Testando consistência frontend/backend...', 'info');
        
        try {
            // Verificar se há dados em localStorage ou estado do React
            const localStorageData = {
                token: localStorage.getItem('token'),
                user: localStorage.getItem('user'),
                cases: localStorage.getItem('cases'),
                prizes: localStorage.getItem('prizes')
            };
            
            console.log('Dados no localStorage:', localStorageData);
            
            // Verificar se há estado do React (se disponível)
            if (window.React && window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED) {
                PrizeUtils.log('React detectado, verificando estado...', 'debug');
                // Aqui poderíamos verificar o estado do React se necessário
            }
            
            // Verificar se há dados em cache do navegador
            const cacheKeys = Object.keys(localStorage);
            const relevantCacheKeys = cacheKeys.filter(key => 
                key.includes('case') || key.includes('prize') || key.includes('slotbox')
            );
            
            if (relevantCacheKeys.length > 0) {
                PrizeUtils.log(`Encontradas ${relevantCacheKeys.length} chaves de cache relevantes`, 'info');
                console.log('Chaves de cache:', relevantCacheKeys);
            }
            
        } catch (error) {
            PrizeUtils.log(`Erro ao testar consistência: ${error.message}`, 'error');
        }
    }
};

// Função principal de teste de prêmios
async function runPrizeTests() {
    console.log('🚀 Iniciando testes específicos de prêmios...');
    
    try {
        await PrizeTests.testOrphanPrizes();
        await PrizeUtils.delay(1000);
        
        await PrizeTests.testInvalidPrizeData();
        await PrizeUtils.delay(1000);
        
        await PrizeTests.testPrizeProbabilities();
        await PrizeUtils.delay(1000);
        
        await PrizeTests.testMultipleCaseOpenings();
        await PrizeUtils.delay(1000);
        
        await PrizeTests.testFrontendBackendConsistency();
        
        // Gerar relatório
        generatePrizeReport();
        
    } catch (error) {
        PrizeUtils.log(`Erro crítico nos testes de prêmios: ${error.message}`, 'error');
        generatePrizeReport();
    }
}

// Gerar relatório específico de prêmios
function generatePrizeReport() {
    const endTime = Date.now();
    const duration = endTime - PRIZE_TEST_STATE.startTime;
    
    console.log('\n🎁 RELATÓRIO DE TESTES DE PRÊMIOS');
    console.log('==================================');
    console.log(`⏱️ Tempo total: ${duration}ms`);
    console.log(`🔍 Problemas encontrados: ${PRIZE_TEST_STATE.prizeIssues.length}`);
    
    if (PRIZE_TEST_STATE.prizeIssues.length > 0) {
        console.log('\n❌ PROBLEMAS ENCONTRADOS:');
        console.log('=========================');
        
        PRIZE_TEST_STATE.prizeIssues.forEach((issue, index) => {
            console.log(`\n${index + 1}. Tipo: ${issue.type}`);
            
            switch (issue.type) {
                case 'orphan_prizes':
                    console.log(`   📊 Prêmios órfãos: ${issue.count}`);
                    console.log(`   🎁 Prêmios:`, issue.prizes.map(p => p.nome));
                    break;
                    
                case 'invalid_data':
                    console.log(`   📊 Prêmios com dados inválidos: ${issue.count}`);
                    console.log(`   🎁 Prêmios:`, issue.prizes.map(p => p.nome));
                    break;
                    
                case 'invalid_probability':
                    console.log(`   📊 Prêmios com probabilidade inválida: ${issue.count}`);
                    console.log(`   🎁 Prêmios:`, issue.prizes.map(p => `${p.nome} (${p.probabilidade}%)`));
                    break;
                    
                case 'probability_sum':
                    console.log(`   📦 Caixa: ${issue.caseName}`);
                    console.log(`   📊 Probabilidade total: ${issue.totalProbability}% (esperado: 100%)`);
                    break;
                    
                case 'opening_errors':
                    console.log(`   📊 Taxa de sucesso: ${issue.successRate}%`);
                    console.log(`   ❌ Erros:`, issue.errors.length);
                    break;
                    
                case 'invalid_returned_prizes':
                    console.log(`   📊 Prêmios inválidos retornados: ${issue.count}`);
                    break;
            }
        });
        
        console.log('\n💡 SOLUÇÕES RECOMENDADAS:');
        console.log('=========================');
        
        PRIZE_TEST_STATE.prizeIssues.forEach((issue, index) => {
            console.log(`\n${index + 1}. Para ${issue.type}:`);
            
            switch (issue.type) {
                case 'orphan_prizes':
                    console.log('   - Verificar se os prêmios têm case_id válido');
                    console.log('   - Remover prêmios órfãos ou associar a caixas válidas');
                    break;
                    
                case 'invalid_data':
                    console.log('   - Verificar campos obrigatórios: id, nome, valor, case_id, probabilidade');
                    console.log('   - Corrigir dados nulos ou indefinidos');
                    break;
                    
                case 'invalid_probability':
                    console.log('   - Corrigir probabilidades para valores entre 0 e 100');
                    break;
                    
                case 'probability_sum':
                    console.log('   - Ajustar probabilidades para somar exatamente 100% por caixa');
                    break;
                    
                case 'opening_errors':
                    console.log('   - Verificar logs do servidor para erros específicos');
                    console.log('   - Testar conectividade com a API');
                    break;
                    
                case 'invalid_returned_prizes':
                    console.log('   - Verificar lógica de seleção de prêmios no backend');
                    console.log('   - Garantir que todos os prêmios retornados têm dados válidos');
                    break;
            }
        });
        
    } else {
        console.log('\n🎉 NENHUM PROBLEMA ENCONTRADO!');
        console.log('Todos os testes de prêmios passaram com sucesso.');
    }
    
    console.log('\n✅ TESTES DE PRÊMIOS CONCLUÍDOS!');
    console.log('===============================');
}

// Executar testes automaticamente
runPrizeTests();

// Exportar para uso manual
window.testePremios = {
    run: runPrizeTests,
    state: PRIZE_TEST_STATE,
    tests: PrizeTests,
    utils: PrizeUtils
};

console.log('🎁 Testes de prêmios carregados! Use window.testePremios.run() para executar novamente.');
