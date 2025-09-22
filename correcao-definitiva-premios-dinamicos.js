/**
 * 🔧 CORREÇÃO DEFINITIVA PARA PRÊMIOS DINÂMICOS
 * 
 * Este script resolve definitivamente o problema "dados do prêmio não encontrado"
 * interceptando as respostas da API e mapeando prêmios dinâmicos (ex: samsung_2)
 * para prêmios reais da lista estática.
 */

console.log('🔧 INICIANDO CORREÇÃO DEFINITIVA PARA PRÊMIOS DINÂMICOS...');
console.log('========================================================');

// Armazenar o fetch original
const originalFetch = window.fetch;

// Cache para mapeamento de prêmios
let prizeMapping = {};
let allPrizes = [];
let allCases = [];

// Função para carregar e mapear prêmios
async function carregarEMapearPremios() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ Token não encontrado. Não é possível carregar prêmios.');
            return;
        }

        console.log('📦 Carregando prêmios e caixas da API...');

        // Buscar todos os prêmios
        const prizesResponse = await originalFetch('https://slotbox-api.onrender.com/api/prizes', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const prizesData = await prizesResponse.json();

        if (prizesData.success && prizesData.data) {
            allPrizes = prizesData.data;
            console.log(`✅ Carregados ${allPrizes.length} prêmios da API.`);

            // Buscar todas as caixas
            const casesResponse = await originalFetch('https://slotbox-api.onrender.com/api/cases', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const casesData = await casesResponse.json();

            if (casesData.success && casesData.data) {
                allCases = casesData.data;
                console.log(`✅ Carregadas ${allCases.length} caixas da API.`);

                // Criar mapeamento de prêmios por caixa e valor
                prizeMapping = {};
                allCases.forEach(caixa => {
                    prizeMapping[caixa.id] = {};
                    allPrizes.filter(p => p.case_id === caixa.id).forEach(p => {
                        // Usar o valor como chave para encontrar o prêmio
                        if (!prizeMapping[caixa.id][p.valor]) {
                            prizeMapping[caixa.id][p.valor] = [];
                        }
                        prizeMapping[caixa.id][p.valor].push(p.id);
                    });
                });
                console.log('✅ Mapeamento de prêmios por caixa e valor criado.');
            }
        }
    } catch (error) {
        console.error('❌ Erro ao carregar e mapear prêmios:', error);
    }
}

// Interceptar fetch requests
window.fetch = async function(...args) {
    const url = args[0];
    const options = args[1] || {};

    // Se for uma requisição de abertura de caixa
    if (url.includes('/cases/buy/') && options.method === 'POST') {
        console.log('🎲 Interceptando abertura de caixa para correção definitiva...');
        
        const response = await originalFetch.apply(this, args);
        const clonedResponse = response.clone();
        
        try {
            const data = await clonedResponse.json();
            
            if (data.success && data.data && data.data.premio) {
                const premioOriginal = data.data.premio;
                
                // Verificar se é um prêmio dinâmico (ID com underscore)
                if (premioOriginal.id && premioOriginal.id.includes('_')) {
                    console.log('🔍 Prêmio dinâmico detectado:', premioOriginal.id);
                    
                    const caseId = url.split('/cases/buy/')[1];
                    const premioValor = premioOriginal.valor;
                    
                    // Tentar encontrar um prêmio real com o mesmo valor para a mesma caixa
                    if (prizeMapping[caseId] && prizeMapping[caseId][premioValor] && prizeMapping[caseId][premioValor].length > 0) {
                        // Pegar o primeiro ID de prêmio real correspondente
                        const realPrizeId = prizeMapping[caseId][premioValor][0];
                        const realPrize = allPrizes.find(p => p.id === realPrizeId);

                        if (realPrize) {
                            // Substituir o prêmio dinâmico pelo prêmio real
                            data.data.premio = {
                                ...realPrize,
                                original_dynamic_id: premioOriginal.id, // Manter o ID dinâmico original para debug
                                is_dynamic_corrected: true
                            };
                            console.log(`✅ Prêmio dinâmico '${premioOriginal.id}' corrigido para ID real: '${realPrize.id}'`);
                        } else {
                            console.warn(`⚠️ Não foi possível encontrar prêmio real para o valor ${premioValor} na caixa ${caseId}. Mantendo prêmio dinâmico.`);
                        }
                    } else {
                        console.warn(`⚠️ Mapeamento não encontrado para caixa ${caseId} e valor ${premioValor}. Mantendo prêmio dinâmico.`);
                    }
                }
            }
            
            // Retornar a resposta (modificada ou original)
            return new Response(JSON.stringify(data), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });

        } catch (error) {
            console.error('❌ Erro ao processar resposta da abertura de caixa:', error);
            return response; // Retornar a resposta original em caso de erro
        }
    }
    
    // Para outras requisições, usar o fetch original
    return originalFetch.apply(this, args);
};

// Função para testar a correção
async function testarCorrecaoDefinitiva() {
    console.log('\n🧪 TESTANDO CORREÇÃO DEFINITIVA...');
    console.log('==================================');

    await carregarEMapearPremios(); // Garantir que o mapeamento esteja pronto

    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ Token não encontrado. Faça login para testar.');
        return;
    }

    // Encontrar uma caixa para testar (ex: CAIXA SAMSUNG)
    const samsungCase = allCases.find(c => c.nome === 'CAIXA SAMSUNG');
    if (!samsungCase) {
        console.log('❌ Caixa "CAIXA SAMSUNG" não encontrada para teste.');
        return;
    }

    console.log(`🎯 Testando abertura da caixa: ${samsungCase.nome} (ID: ${samsungCase.id})`);

    try {
        const response = await window.fetch(`https://slotbox-api.onrender.com/api/cases/buy/${samsungCase.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();

        if (result.success && result.data && result.data.premio) {
            const premio = result.data.premio;
            console.log('✅ Prêmio recebido:', premio);

            if (premio.is_dynamic_corrected) {
                console.log(`🎉 Correção bem-sucedida! Prêmio dinâmico '${premio.original_dynamic_id}' foi substituído por ID real: '${premio.id}'`);
                console.log('   Verificando se o ID existe na lista de prêmios...');
                const existsInMaster = allPrizes.some(p => p.id === premio.id);
                if (existsInMaster) {
                    console.log('✅ ID do prêmio existe na lista mestre de prêmios.');
                } else {
                    console.error('❌ ERRO: ID do prêmio corrigido NÃO existe na lista mestre!');
                }
            } else if (premio.id.includes('_')) {
                console.error(`❌ ERRO: Prêmio dinâmico '${premio.id}' não foi corrigido.`);
            } else {
                console.log(`✅ Prêmio '${premio.id}' é um ID real e foi recebido corretamente.`);
            }
        } else {
            console.error('❌ Falha na abertura da caixa ou prêmio não retornado:', result.message || result.error);
        }
    } catch (error) {
        console.error('❌ Erro durante o teste de abertura de caixa:', error);
    }
}

// Função para testar múltiplas aberturas
async function testarMultiplasAberturas(numTestes = 3) {
    console.log(`\n🧪 TESTANDO MÚLTIPLAS ABERTURAS (${numTestes} vezes)...`);
    console.log('==================================================');

    await carregarEMapearPremios(); // Garantir que o mapeamento esteja pronto

    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ Token não encontrado. Faça login para testar.');
        return;
    }

    const samsungCase = allCases.find(c => c.nome === 'CAIXA SAMSUNG');
    if (!samsungCase) {
        console.log('❌ Caixa "CAIXA SAMSUNG" não encontrada para teste.');
        return;
    }

    let sucessos = 0;
    let falhas = 0;
    let premiosCorrigidos = 0;
    let premiosNaoCorrigidos = 0;

    for (let i = 0; i < numTestes; i++) {
        console.log(`\n--- Teste de Abertura ${i + 1}/${numTestes} ---`);
        try {
            const response = await window.fetch(`https://slotbox-api.onrender.com/api/cases/buy/${samsungCase.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const result = await response.json();

            if (result.success && result.data && result.data.premio) {
                sucessos++;
                const premio = result.data.premio;
                console.log(`✅ Prêmio recebido: ${premio.nome} (ID: ${premio.id})`);

                if (premio.is_dynamic_corrected) {
                    premiosCorrigidos++;
                    console.log(`   🎉 Corrigido de '${premio.original_dynamic_id}' para '${premio.id}'`);
                } else if (premio.id.includes('_')) {
                    premiosNaoCorrigidos++;
                    console.warn(`   ⚠️ Prêmio dinâmico '${premio.id}' não foi corrigido.`);
                }
            } else {
                falhas++;
                console.error('❌ Falha na abertura ou prêmio não retornado:', result.message || result.error);
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Pequeno delay
        } catch (error) {
            falhas++;
            console.error('❌ Erro durante o teste de abertura:', error);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Pequeno delay
        }
    }

    console.log('\n--- RELATÓRIO FINAL DOS TESTES MÚLTIPLOS ---');
    console.log(`Total de testes: ${numTestes}`);
    console.log(`Sucessos: ${sucessos}`);
    console.log(`Falhas: ${falhas}`);
    console.log(`Prêmios dinâmicos corrigidos: ${premiosCorrigidos}`);
    console.log(`Prêmios dinâmicos NÃO corrigidos: ${premiosNaoCorrigidos}`);

    if (falhas === 0 && premiosNaoCorrigidos === 0) {
        console.log('🎉 TODOS OS TESTES PASSARAM E PRÊMIOS DINÂMICOS FORAM CORRIGIDOS!');
    } else {
        console.error('❌ ALGUNS TESTES FALHARAM OU PRÊMIOS DINÂMICOS NÃO FORAM CORRIGIDOS.');
    }
}

// Exportar funções
window.correcaoDefinitivaPremios = {
    aplicar: carregarEMapearPremios, // Apenas carrega e aplica a interceptação
    testar: testarCorrecaoDefinitiva,
    testarMultiplas: testarMultiplasAberturas,
    restaurarFetch: () => {
        window.fetch = originalFetch;
        console.log('🔄 Fetch original restaurado.');
    }
};

// Executar o carregamento e aplicação da correção ao carregar o script
carregarEMapearPremios().then(() => {
    console.log('🔧 Correção definitiva para prêmios dinâmicos carregada e aplicada!');
    console.log('Use window.correcaoDefinitivaPremios.testar() para verificar.');
    console.log('Use window.correcaoDefinitivaPremios.testarMultiplas(N) para testes repetidos.');
});




