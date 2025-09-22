/**
 * ✅ ACEITAR PRÊMIOS DINÂMICOS NO FRONTEND
 * 
 * Este script modifica o comportamento do frontend para aceitar e processar
 * prêmios com IDs dinâmicos (ex: weekend_1, nike_1, samsung_1) que são
 * retornados pelo backend, resolvendo o problema "dados do prêmio não encontrado"
 * sem a necessidade de mapeá-los para IDs estáticos.
 */

console.log('✅ INICIANDO ACEITAÇÃO DE PRÊMIOS DINÂMICOS NO FRONTEND...');
console.log('========================================================');

// Armazenar o fetch original
const originalFetch = window.fetch;

// Interceptar fetch requests
window.fetch = async function(...args) {
    const url = args[0];
    const options = args[1] || {};

    // Se for uma requisição de abertura de caixa
    if (url.includes('/cases/buy/') && options.method === 'POST') {
        console.log('🎲 Interceptando abertura de caixa para aceitar prêmio dinâmico...');
        
        const response = await originalFetch.apply(this, args);
        const clonedResponse = response.clone();
        
        try {
            const data = await clonedResponse.json();
            
            if (data.success && data.data && data.data.premio) {
                const premioOriginal = data.data.premio;
                
                // Verificar se é um prêmio dinâmico (ID com underscore)
                if (premioOriginal.id && premioOriginal.id.includes('_')) {
                    console.log('🔍 Prêmio dinâmico detectado:', premioOriginal.id);
                    
                    // Adicionar campos necessários para o frontend aceitar o prêmio
                    const premioAceito = {
                        ...premioOriginal,
                        is_dynamic: true,
                        dynamic_id: premioOriginal.id,
                        // Tentar extrair tipo de caixa e valor do ID dinâmico
                        case_type: premioOriginal.id.split('_')[0],
                        value_code: premioOriginal.id.split('_')[1] ? parseFloat(premioOriginal.id.split('_')[1]) : premioOriginal.valor,
                        // Garantir que o valor esteja presente e seja numérico
                        valor: premioOriginal.valor || (premioOriginal.id.split('_')[1] ? parseFloat(premioOriginal.id.split('_')[1]) : 0),
                        // Adicionar um nome se estiver faltando (ex: "R$ 1,00")
                        nome: premioOriginal.nome || `R$ ${premioOriginal.valor ? premioOriginal.valor.toFixed(2).replace('.', ',') : (premioOriginal.id.split('_')[1] ? parseFloat(premioOriginal.id.split('_')[1]).toFixed(2).replace('.', ',') : '0,00')}`
                    };

                    data.data.premio = premioAceito;
                    console.log(`✅ Prêmio dinâmico '${premioOriginal.id}' aceito e adaptado:`, premioAceito);
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

// Função para corrigir dados do usuário (reutilizada do script anterior)
window.corrigirDadosUsuario = async function() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('❌ Token não encontrado');
            return;
        }
        
        // Buscar dados atualizados do usuário
        const userResponse = await originalFetch('https://slotbox-api.onrender.com/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const userData = await userResponse.json();
        
        if (userData.success) {
            // Buscar dados da wallet
            const walletResponse = await originalFetch('https://slotbox-api.onrender.com/api/wallet', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const walletData = await walletResponse.json();
            
            if (walletData.success) {
                // Combinar dados do usuário com dados da wallet
                const userCompleto = {
                    ...userData.data,
                    saldo_reais: walletData.data.saldo_reais,
                    saldo_demo: walletData.data.saldo_demo,
                    tipo_conta: walletData.data.tipo_conta || 'normal',
                    total_giros: walletData.data.total_giros,
                    rollover_liberado: walletData.data.rollover_liberado
                };
                
                // Atualizar localStorage
                localStorage.setItem('user', JSON.stringify(userCompleto));
                
                console.log('✅ Dados do usuário corrigidos:', userCompleto);
                
                // Disparar evento de atualização
                window.dispatchEvent(new CustomEvent('dadosUsuarioAtualizados', {
                    detail: userCompleto
                }));
                
                return userCompleto;
            }
        }
        
    } catch (error) {
        console.log('❌ Erro ao corrigir dados do usuário:', error);
    }
};

// Função para testar a aceitação de um prêmio dinâmico
window.testarAceitacaoPremio = async function(caseId) {
    console.log(`\n🧪 Testando aceitação de prêmio dinâmico para caixa: ${caseId}`);
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ Token não encontrado. Faça login para testar.');
        return { success: false, message: 'Token não encontrado' };
    }

    try {
        const response = await window.fetch(`https://slotbox-api.onrender.com/api/cases/buy/${caseId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success && result.data && result.data.premio) {
            const premio = result.data.premio;
            console.log('✅ Prêmio recebido e aceito:', premio);
            
            if (premio.is_dynamic) {
                console.log(`🎉 Prêmio dinâmico '${premio.dynamic_id}' aceito com sucesso!`);
            } else {
                console.log(`🎁 Prêmio normal '${premio.id}' recebido.`);
            }
            
            return { success: true, premio: premio };
        } else {
            console.error('❌ Falha na abertura da caixa ou prêmio não retornado:', result.message || result.error);
            return { success: false, message: result.message || result.error };
        }
        
    } catch (error) {
        console.error('❌ Erro durante o teste de aceitação:', error);
        return { success: false, error: error.message };
    }
};

// Função para testar múltiplas aberturas
window.testarMultiplasAceitacoes = async function(caseId, numTestes = 3) {
    console.log(`\n🧪 Testando múltiplas aceitações de prêmios dinâmicos (${numTestes} vezes)...`);
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ Token não encontrado. Faça login para testar.');
        return;
    }

    let sucessos = 0;
    let falhas = 0;
    let premiosDinamicos = 0;
    let premiosNormais = 0;

    for (let i = 0; i < numTestes; i++) {
        console.log(`\n--- Teste de Aceitação ${i + 1}/${numTestes} ---`);
        
        try {
            const response = await window.fetch(`https://slotbox-api.onrender.com/api/cases/buy/${caseId}`, {
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
                console.log(`✅ Prêmio aceito: ${premio.nome} (ID: ${premio.id})`);
                
                if (premio.is_dynamic) {
                    premiosDinamicos++;
                    console.log(`   🎉 Prêmio dinâmico '${premio.dynamic_id}' aceito com sucesso!`);
                } else {
                    premiosNormais++;
                    console.log(`   🎁 Prêmio normal '${premio.id}' recebido.`);
                }
            } else {
                falhas++;
                console.error('❌ Falha na abertura ou prêmio não retornado:', result.message || result.error);
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000)); // Pequeno delay
        } catch (error) {
            falhas++;
            console.error('❌ Erro durante o teste de aceitação:', error);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Pequeno delay
        }
    }

    console.log('\n--- RELATÓRIO FINAL DOS TESTES DE ACEITAÇÃO ---');
    console.log(`Total de testes: ${numTestes}`);
    console.log(`Sucessos: ${sucessos}`);
    console.log(`Falhas: ${falhas}`);
    console.log(`Prêmios dinâmicos aceitos: ${premiosDinamicos}`);
    console.log(`Prêmios normais: ${premiosNormais}`);

    if (falhas === 0) {
        console.log('🎉 TODOS OS TESTES PASSARAM E PRÊMIOS FORAM ACEITOS!');
    } else {
        console.error('❌ ALGUNS TESTES FALHARAM.');
    }
};

// Executar correção automática dos dados do usuário
console.log('\n🔄 EXECUTANDO CORREÇÕES AUTOMÁTICAS:');
console.log('===================================');

// Corrigir dados do usuário
window.corrigirDadosUsuario().then(userData => {
    if (userData) {
        console.log('✅ Dados do usuário corrigidos automaticamente');
    }
});

// Exportar funções
window.aceitarPremiosDinamicos = {
    corrigirUsuario: window.corrigirDadosUsuario,
    testar: window.testarAceitacaoPremio,
    testarMultiplas: window.testarMultiplasAceitacoes,
    restaurarFetch: () => {
        window.fetch = originalFetch;
        console.log('🔄 Fetch original restaurado.');
    }
};

console.log('✅ Aceitação de prêmios dinâmicos carregada!');
console.log('Use window.aceitarPremiosDinamicos.testar(caseId) para testar.');
console.log('Use window.aceitarPremiosDinamicos.testarMultiplas(caseId, N) para testes repetidos.');