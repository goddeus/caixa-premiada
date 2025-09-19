/**
 * 🔍 DIAGNÓSTICO COMPLETO DAS CAIXAS
 * 
 * Cole este código no console do navegador (F12) para diagnosticar
 * todos os problemas relacionados às caixas e prêmios.
 * 
 * INSTRUÇÕES:
 * 1. Abra o console do navegador (F12)
 * 2. Cole este código completo
 * 3. Pressione Enter para executar
 * 4. Aguarde os resultados do diagnóstico
 */

console.log('🔍 INICIANDO DIAGNÓSTICO COMPLETO DAS CAIXAS...');
console.log('================================================');

// Configurações
const CONFIG = {
    API_BASE_URL: 'https://slotbox-api.onrender.com/api',
    MAX_RETRIES: 3,
    TIMEOUT: 10000,
    DELAY_BETWEEN_TESTS: 1000
};

// Estado do diagnóstico
const DIAGNOSTIC_STATE = {
    startTime: Date.now(),
    tests: [],
    errors: [],
    warnings: [],
    userData: null,
    casesData: null,
    prizesData: null
};

// Utilitários
const Utils = {
    // Fazer requisição HTTP
    async request(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.TIMEOUT);
        
        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    ...options.headers
                }
            });
            
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    },

    // Aguardar tempo específico
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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

    // Adicionar resultado de teste
    addTest(name, status, details = {}) {
        DIAGNOSTIC_STATE.tests.push({
            name,
            status,
            details,
            timestamp: Date.now()
        });
    },

    // Adicionar erro
    addError(message, context = {}) {
        DIAGNOSTIC_STATE.errors.push({
            message,
            context,
            timestamp: Date.now()
        });
    },

    // Adicionar warning
    addWarning(message, context = {}) {
        DIAGNOSTIC_STATE.warnings.push({
            message,
            context,
            timestamp: Date.now()
        });
    }
};

// Testes de diagnóstico
const DiagnosticTests = {
    
    // Teste 1: Verificar autenticação
    async testAuthentication() {
        Utils.log('Testando autenticação...', 'info');
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                Utils.addError('Token não encontrado no localStorage');
                Utils.addTest('Autenticação', 'FAILED', { error: 'Token não encontrado' });
                return false;
            }

            const response = await Utils.request(`${CONFIG.API_BASE_URL}/auth/me`);
            if (!response.ok) {
                Utils.addError('Token inválido ou expirado', { status: response.status });
                Utils.addTest('Autenticação', 'FAILED', { error: 'Token inválido' });
                return false;
            }

            const userData = await response.json();
            DIAGNOSTIC_STATE.userData = userData.data;
            
            Utils.log(`Usuário autenticado: ${userData.data.nome}`, 'success');
            Utils.addTest('Autenticação', 'PASSED', { user: userData.data.nome });
            return true;
            
        } catch (error) {
            Utils.addError('Erro na autenticação', { error: error.message });
            Utils.addTest('Autenticação', 'FAILED', { error: error.message });
            return false;
        }
    },

    // Teste 2: Verificar dados das caixas
    async testCasesData() {
        Utils.log('Testando dados das caixas...', 'info');
        
        try {
            const response = await Utils.request(`${CONFIG.API_BASE_URL}/cases`);
            if (!response.ok) {
                Utils.addError('Erro ao buscar caixas', { status: response.status });
                Utils.addTest('Dados das Caixas', 'FAILED', { error: 'Erro na API' });
                return false;
            }

            const casesData = await response.json();
            DIAGNOSTIC_STATE.casesData = casesData.data;
            
            // Verificar se há caixas
            if (!casesData.data || casesData.data.length === 0) {
                Utils.addWarning('Nenhuma caixa encontrada');
                Utils.addTest('Dados das Caixas', 'WARNING', { count: 0 });
                return false;
            }

            // Verificar estrutura das caixas
            const invalidCases = casesData.data.filter(caseItem => {
                return !caseItem.id || !caseItem.nome || !caseItem.preco || !caseItem.prizes;
            });

            if (invalidCases.length > 0) {
                Utils.addWarning(`${invalidCases.length} caixas com estrutura inválida`);
            }

            Utils.log(`Encontradas ${casesData.data.length} caixas`, 'success');
            Utils.addTest('Dados das Caixas', 'PASSED', { 
                count: casesData.data.length,
                invalid: invalidCases.length 
            });
            return true;
            
        } catch (error) {
            Utils.addError('Erro ao buscar dados das caixas', { error: error.message });
            Utils.addTest('Dados das Caixas', 'FAILED', { error: error.message });
            return false;
        }
    },

    // Teste 3: Verificar prêmios das caixas
    async testPrizesData() {
        Utils.log('Testando dados dos prêmios...', 'info');
        
        try {
            const response = await Utils.request(`${CONFIG.API_BASE_URL}/prizes`);
            if (!response.ok) {
                Utils.addError('Erro ao buscar prêmios', { status: response.status });
                Utils.addTest('Dados dos Prêmios', 'FAILED', { error: 'Erro na API' });
                return false;
            }

            const prizesData = await response.json();
            DIAGNOSTIC_STATE.prizesData = prizesData.data;
            
            // Verificar se há prêmios
            if (!prizesData.data || prizesData.data.length === 0) {
                Utils.addWarning('Nenhum prêmio encontrado');
                Utils.addTest('Dados dos Prêmios', 'WARNING', { count: 0 });
                return false;
            }

            // Verificar estrutura dos prêmios
            const invalidPrizes = prizesData.data.filter(prize => {
                return !prize.id || !prize.nome || !prize.valor || !prize.case_id;
            });

            if (invalidPrizes.length > 0) {
                Utils.addWarning(`${invalidPrizes.length} prêmios com estrutura inválida`);
            }

            // Verificar prêmios órfãos (sem caixa)
            const caseIds = DIAGNOSTIC_STATE.casesData?.map(c => c.id) || [];
            const orphanPrizes = prizesData.data.filter(prize => 
                !caseIds.includes(prize.case_id)
            );

            if (orphanPrizes.length > 0) {
                Utils.addWarning(`${orphanPrizes.length} prêmios órfãos (sem caixa correspondente)`);
            }

            Utils.log(`Encontrados ${prizesData.data.length} prêmios`, 'success');
            Utils.addTest('Dados dos Prêmios', 'PASSED', { 
                count: prizesData.data.length,
                invalid: invalidPrizes.length,
                orphan: orphanPrizes.length
            });
            return true;
            
        } catch (error) {
            Utils.addError('Erro ao buscar dados dos prêmios', { error: error.message });
            Utils.addTest('Dados dos Prêmios', 'FAILED', { error: error.message });
            return false;
        }
    },

    // Teste 4: Verificar saldo do usuário
    async testUserBalance() {
        Utils.log('Testando saldo do usuário...', 'info');
        
        try {
            const response = await Utils.request(`${CONFIG.API_BASE_URL}/wallet`);
            if (!response.ok) {
                Utils.addError('Erro ao buscar saldo', { status: response.status });
                Utils.addTest('Saldo do Usuário', 'FAILED', { error: 'Erro na API' });
                return false;
            }

            const walletData = await response.json();
            
            Utils.log(`Saldo: R$ ${walletData.data.saldo_reais} | Demo: R$ ${walletData.data.saldo_demo}`, 'success');
            Utils.addTest('Saldo do Usuário', 'PASSED', { 
                saldo_reais: walletData.data.saldo_reais,
                saldo_demo: walletData.data.saldo_demo,
                tipo_conta: walletData.data.tipo_conta
            });
            return true;
            
        } catch (error) {
            Utils.addError('Erro ao buscar saldo do usuário', { error: error.message });
            Utils.addTest('Saldo do Usuário', 'FAILED', { error: error.message });
            return false;
        }
    },

    // Teste 5: Simular abertura de caixa
    async testCaseOpening(caseId) {
        Utils.log(`Testando abertura da caixa ${caseId}...`, 'info');
        
        try {
            const response = await Utils.request(`${CONFIG.API_BASE_URL}/cases/buy/${caseId}`, {
                method: 'POST'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                Utils.addError(`Erro ao abrir caixa ${caseId}`, { 
                    status: response.status,
                    error: errorData.message || 'Erro desconhecido'
                });
                Utils.addTest(`Abertura Caixa ${caseId}`, 'FAILED', { 
                    error: errorData.message || 'Erro desconhecido',
                    status: response.status
                });
                return false;
            }

            const result = await response.json();
            
            // Verificar se o resultado tem estrutura válida
            if (!result.success) {
                Utils.addError(`Caixa ${caseId} retornou sucesso=false`, { result });
                Utils.addTest(`Abertura Caixa ${caseId}`, 'FAILED', { result });
                return false;
            }

            // Verificar se tem prêmio
            if (!result.data || !result.data.prize) {
                Utils.addError(`Caixa ${caseId} não retornou prêmio`, { result });
                Utils.addTest(`Abertura Caixa ${caseId}`, 'FAILED', { result });
                return false;
            }

            // Verificar se o prêmio tem dados válidos
            const prize = result.data.prize;
            if (!prize.id || !prize.nome || prize.valor === undefined) {
                Utils.addError(`Prêmio da caixa ${caseId} tem dados inválidos`, { prize });
                Utils.addTest(`Abertura Caixa ${caseId}`, 'FAILED', { prize });
                return false;
            }

            Utils.log(`Caixa ${caseId} aberta com sucesso! Prêmio: ${prize.nome} (R$ ${prize.valor})`, 'success');
            Utils.addTest(`Abertura Caixa ${caseId}`, 'PASSED', { 
                prize: prize.nome,
                value: prize.valor,
                caseId: caseId
            });
            return true;
            
        } catch (error) {
            Utils.addError(`Erro ao abrir caixa ${caseId}`, { error: error.message });
            Utils.addTest(`Abertura Caixa ${caseId}`, 'FAILED', { error: error.message });
            return false;
        }
    },

    // Teste 6: Verificar integridade dos dados
    async testDataIntegrity() {
        Utils.log('Testando integridade dos dados...', 'info');
        
        const issues = [];
        
        // Verificar se todas as caixas têm prêmios
        if (DIAGNOSTIC_STATE.casesData) {
            DIAGNOSTIC_STATE.casesData.forEach(caseItem => {
                if (!caseItem.prizes || caseItem.prizes.length === 0) {
                    issues.push(`Caixa ${caseItem.nome} não tem prêmios`);
                }
            });
        }

        // Verificar se todos os prêmios têm probabilidade válida
        if (DIAGNOSTIC_STATE.prizesData) {
            DIAGNOSTIC_STATE.prizesData.forEach(prize => {
                if (prize.probabilidade <= 0 || prize.probabilidade > 100) {
                    issues.push(`Prêmio ${prize.nome} tem probabilidade inválida: ${prize.probabilidade}%`);
                }
            });
        }

        // Verificar se há prêmios duplicados
        if (DIAGNOSTIC_STATE.prizesData) {
            const prizeNames = DIAGNOSTIC_STATE.prizesData.map(p => p.nome);
            const duplicates = prizeNames.filter((name, index) => prizeNames.indexOf(name) !== index);
            if (duplicates.length > 0) {
                issues.push(`Prêmios duplicados encontrados: ${duplicates.join(', ')}`);
            }
        }

        if (issues.length > 0) {
            issues.forEach(issue => Utils.addWarning(issue));
            Utils.addTest('Integridade dos Dados', 'WARNING', { issues });
        } else {
            Utils.log('Integridade dos dados OK', 'success');
            Utils.addTest('Integridade dos Dados', 'PASSED', {});
        }

        return issues.length === 0;
    }
};

// Função principal de diagnóstico
async function runDiagnostic() {
    console.log('🚀 Iniciando diagnóstico completo...');
    
    try {
        // Teste 1: Autenticação
        const authOk = await DiagnosticTests.testAuthentication();
        if (!authOk) {
            console.log('❌ Falha na autenticação. Interrompendo diagnóstico.');
            return;
        }

        await Utils.delay(CONFIG.DELAY_BETWEEN_TESTS);

        // Teste 2: Dados das caixas
        await DiagnosticTests.testCasesData();
        await Utils.delay(CONFIG.DELAY_BETWEEN_TESTS);

        // Teste 3: Dados dos prêmios
        await DiagnosticTests.testPrizesData();
        await Utils.delay(CONFIG.DELAY_BETWEEN_TESTS);

        // Teste 4: Saldo do usuário
        await DiagnosticTests.testUserBalance();
        await Utils.delay(CONFIG.DELAY_BETWEEN_TESTS);

        // Teste 5: Integridade dos dados
        await DiagnosticTests.testDataIntegrity();
        await Utils.delay(CONFIG.DELAY_BETWEEN_TESTS);

        // Teste 6: Simular abertura de caixas (se houver caixas)
        if (DIAGNOSTIC_STATE.casesData && DIAGNOSTIC_STATE.casesData.length > 0) {
            Utils.log('Testando abertura de caixas...', 'info');
            
            // Testar até 3 caixas diferentes
            const casesToTest = DIAGNOSTIC_STATE.casesData.slice(0, 3);
            
            for (const caseItem of casesToTest) {
                await DiagnosticTests.testCaseOpening(caseItem.id);
                await Utils.delay(CONFIG.DELAY_BETWEEN_TESTS);
            }
        }

        // Gerar relatório final
        generateReport();
        
    } catch (error) {
        Utils.log(`Erro crítico no diagnóstico: ${error.message}`, 'error');
        Utils.addError('Erro crítico no diagnóstico', { error: error.message });
        generateReport();
    }
}

// Gerar relatório final
function generateReport() {
    const endTime = Date.now();
    const duration = endTime - DIAGNOSTIC_STATE.startTime;
    
    console.log('\n📊 RELATÓRIO FINAL DO DIAGNÓSTICO');
    console.log('==================================');
    console.log(`⏱️ Tempo total: ${duration}ms`);
    console.log(`🧪 Testes executados: ${DIAGNOSTIC_STATE.tests.length}`);
    console.log(`❌ Erros encontrados: ${DIAGNOSTIC_STATE.errors.length}`);
    console.log(`⚠️ Warnings encontrados: ${DIAGNOSTIC_STATE.warnings.length}`);
    
    // Resumo dos testes
    console.log('\n📋 RESUMO DOS TESTES:');
    console.log('=====================');
    DIAGNOSTIC_STATE.tests.forEach(test => {
        const status = test.status === 'PASSED' ? '✅' : 
                     test.status === 'FAILED' ? '❌' : '⚠️';
        console.log(`${status} ${test.name}: ${test.status}`);
        if (test.details && Object.keys(test.details).length > 0) {
            console.log(`   Detalhes:`, test.details);
        }
    });
    
    // Listar erros
    if (DIAGNOSTIC_STATE.errors.length > 0) {
        console.log('\n❌ ERROS ENCONTRADOS:');
        console.log('====================');
        DIAGNOSTIC_STATE.errors.forEach((error, index) => {
            console.log(`${index + 1}. ${error.message}`);
            if (error.context && Object.keys(error.context).length > 0) {
                console.log(`   Contexto:`, error.context);
            }
        });
    }
    
    // Listar warnings
    if (DIAGNOSTIC_STATE.warnings.length > 0) {
        console.log('\n⚠️ WARNINGS ENCONTRADOS:');
        console.log('=======================');
        DIAGNOSTIC_STATE.warnings.forEach((warning, index) => {
            console.log(`${index + 1}. ${warning.message}`);
            if (warning.context && Object.keys(warning.context).length > 0) {
                console.log(`   Contexto:`, warning.context);
            }
        });
    }
    
    // Recomendações
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('=================');
    
    if (DIAGNOSTIC_STATE.errors.length > 0) {
        console.log('🔧 Problemas críticos encontrados que precisam ser corrigidos:');
        DIAGNOSTIC_STATE.errors.forEach((error, index) => {
            console.log(`   ${index + 1}. ${error.message}`);
        });
    }
    
    if (DIAGNOSTIC_STATE.warnings.length > 0) {
        console.log('⚠️ Problemas menores que devem ser verificados:');
        DIAGNOSTIC_STATE.warnings.forEach((warning, index) => {
            console.log(`   ${index + 1}. ${warning.message}`);
        });
    }
    
    if (DIAGNOSTIC_STATE.errors.length === 0 && DIAGNOSTIC_STATE.warnings.length === 0) {
        console.log('🎉 Nenhum problema encontrado! Sistema funcionando corretamente.');
    }
    
    // Dados para debug
    console.log('\n🔍 DADOS PARA DEBUG:');
    console.log('====================');
    console.log('Dados do usuário:', DIAGNOSTIC_STATE.userData);
    console.log('Caixas encontradas:', DIAGNOSTIC_STATE.casesData?.length || 0);
    console.log('Prêmios encontrados:', DIAGNOSTIC_STATE.prizesData?.length || 0);
    
    console.log('\n✅ DIAGNÓSTICO CONCLUÍDO!');
    console.log('=========================');
}

// Executar diagnóstico automaticamente
runDiagnostic();

// Exportar para uso manual
window.diagnosticCaixas = {
    run: runDiagnostic,
    state: DIAGNOSTIC_STATE,
    tests: DiagnosticTests,
    utils: Utils
};

console.log('🔧 Diagnóstico carregado! Use window.diagnosticCaixas.run() para executar novamente.');
