/**
 * 🔧 CORREÇÃO PARA PRÊMIOS DINÂMICOS
 * 
 * Este script corrige o frontend para aceitar prêmios gerados dinamicamente
 * pelo backend, resolvendo o problema "dados do prêmio não encontrado".
 */

console.log('🔧 INICIANDO CORREÇÃO PARA PRÊMIOS DINÂMICOS...');
console.log('===============================================');

// Função para corrigir prêmios dinâmicos
function corrigirPremiosDinamicos() {
    console.log('🚀 Aplicando correção para prêmios dinâmicos...');
    
    try {
        // 1. Interceptar fetch requests para /cases/buy/
        const originalFetch = window.fetch;
        
        window.fetch = async function(...args) {
            const response = await originalFetch.apply(this, args);
            
            // Verificar se é uma requisição de abertura de caixa
            if (args[0] && args[0].includes('/cases/buy/')) {
                console.log('🎲 Interceptando abertura de caixa...');
                
                try {
                    const clonedResponse = response.clone();
                    const data = await clonedResponse.json();
                    
                    if (data.success && data.data && data.data.premio) {
                        const premio = data.data.premio;
                        
                        // Verificar se é um prêmio dinâmico
                        if (premio.id && premio.id.includes('_')) {
                            console.log('🔍 Prêmio dinâmico detectado:', premio.id);
                            
                            // Adicionar informações extras ao prêmio
                            const premioCorrigido = {
                                ...premio,
                                is_dynamic: true,
                                dynamic_id: premio.id,
                                case_type: premio.id.split('_')[0],
                                value_code: premio.id.split('_')[1]
                            };
                            
                            // Substituir o prêmio na resposta
                            data.data.premio = premioCorrigido;
                            
                            console.log('✅ Prêmio dinâmico corrigido:', premioCorrigido);
                            
                            // Retornar resposta modificada
                            return new Response(JSON.stringify(data), {
                                status: response.status,
                                statusText: response.statusText,
                                headers: response.headers
                            });
                        }
                    }
                    
                } catch (error) {
                    console.log('⚠️ Erro ao processar resposta:', error);
                }
            }
            
            return response;
        };
        
        console.log('✅ Interceptação de fetch configurada');
        
        // 2. Adicionar função para validar prêmios dinâmicos
        window.validarPremioDinamico = function(premio) {
            if (!premio || !premio.id) {
                return { valido: false, motivo: 'Prêmio sem ID' };
            }
            
            // Verificar se é um prêmio dinâmico
            if (premio.id.includes('_')) {
                const partes = premio.id.split('_');
                
                if (partes.length === 2) {
                    const [tipoCaixa, valor] = partes;
                    
                    // Validar tipo de caixa
                    const tiposValidos = ['weekend', 'nike', 'samsung', 'apple', 'console', 'premium'];
                    if (!tiposValidos.includes(tipoCaixa)) {
                        return { valido: false, motivo: `Tipo de caixa inválido: ${tipoCaixa}` };
                    }
                    
                    // Validar valor
                    if (isNaN(valor) || valor <= 0) {
                        return { valido: false, motivo: `Valor inválido: ${valor}` };
                    }
                    
                    return { 
                        valido: true, 
                        tipo: tipoCaixa, 
                        valor: parseInt(valor),
                        is_dynamic: true
                    };
                }
            }
            
            return { valido: true, is_dynamic: false };
        };
        
        console.log('✅ Função de validação adicionada');
        
        // 3. Adicionar função para mapear prêmios dinâmicos
        window.mapearPremioDinamico = function(premio) {
            if (!premio || !premio.id) {
                return null;
            }
            
            // Se é um prêmio dinâmico, mapear para um prêmio da tabela
            if (premio.id.includes('_')) {
                const partes = premio.id.split('_');
                const [tipoCaixa, valor] = partes;
                
                // Mapear para um prêmio similar da tabela
                const mapeamento = {
                    'weekend': '1abd77cf-472b-473d-9af0-6cd47f9f1452',
                    'nike': '0b5e9b8a-9d56-4769-a45a-55a3025640f4',
                    'samsung': '3f2a9f7a-cb4d-47e7-991a-0e72c0e0f415',
                    'apple': '61a19df9-d011-429e-a9b5-d2c837551150',
                    'console': 'fb0c0175-b478-4fd5-9750-d673c0f374fd',
                    'premium': 'db95bb2b-9b3e-444b-964f-547330010a59'
                };
                
                const caseId = mapeamento[tipoCaixa];
                if (caseId) {
                    return {
                        ...premio,
                        case_id: caseId,
                        is_mapped: true,
                        original_id: premio.id
                    };
                }
            }
            
            return premio;
        };
        
        console.log('✅ Função de mapeamento adicionada');
        
        // 4. Adicionar função para corrigir dados do usuário
        window.corrigirDadosUsuario = async function() {
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    console.log('❌ Token não encontrado');
                    return;
                }
                
                // Buscar dados atualizados do usuário
                const userResponse = await fetch('https://slotbox-api.onrender.com/api/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const userData = await userResponse.json();
                
                if (userData.success) {
                    // Buscar dados da wallet
                    const walletResponse = await fetch('https://slotbox-api.onrender.com/api/wallet', {
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
        
        console.log('✅ Função de correção de dados adicionada');
        
        // 5. Adicionar função para testar abertura de caixa
        window.testarAberturaCaixa = async function(caseId) {
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    console.log('❌ Token não encontrado');
                    return;
                }
                
                console.log(`🎲 Testando abertura da caixa: ${caseId}`);
                
                const response = await fetch(`https://slotbox-api.onrender.com/api/cases/buy/${caseId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                const result = await response.json();
                
                if (result.success && result.data && result.data.premio) {
                    const premio = result.data.premio;
                    
                    console.log('✅ Prêmio obtido:', premio);
                    
                    // Validar prêmio
                    const validacao = window.validarPremioDinamico(premio);
                    console.log('🔍 Validação:', validacao);
                    
                    // Mapear prêmio se necessário
                    if (validacao.is_dynamic) {
                        const premioMapeado = window.mapearPremioDinamico(premio);
                        console.log('🗺️ Prêmio mapeado:', premioMapeado);
                    }
                    
                    return result;
                } else {
                    console.log('❌ Falha na abertura:', result.message || result.error);
                    return result;
                }
                
            } catch (error) {
                console.log('❌ Erro no teste:', error);
                return null;
            }
        };
        
        console.log('✅ Função de teste adicionada');
        
        // 6. Executar correção automática
        console.log('\n🔄 EXECUTANDO CORREÇÕES AUTOMÁTICAS:');
        console.log('===================================');
        
        // Corrigir dados do usuário
        window.corrigirDadosUsuario().then(userData => {
            if (userData) {
                console.log('✅ Dados do usuário corrigidos automaticamente');
            }
        });
        
        // 7. Relatório final
        console.log('\n📊 RELATÓRIO FINAL:');
        console.log('===================');
        
        console.log('✅ CORREÇÕES APLICADAS:');
        console.log('=======================');
        console.log('1. ✅ Interceptação de fetch configurada');
        console.log('2. ✅ Validação de prêmios dinâmicos adicionada');
        console.log('3. ✅ Mapeamento de prêmios dinâmicos adicionado');
        console.log('4. ✅ Correção de dados do usuário implementada');
        console.log('5. ✅ Função de teste de abertura adicionada');
        
        console.log('\n💡 FUNÇÕES DISPONÍVEIS:');
        console.log('=======================');
        console.log('• window.validarPremioDinamico(premio) - Valida prêmios dinâmicos');
        console.log('• window.mapearPremioDinamico(premio) - Mapeia prêmios dinâmicos');
        console.log('• window.corrigirDadosUsuario() - Corrige dados do usuário');
        console.log('• window.testarAberturaCaixa(caseId) - Testa abertura de caixa');
        
        console.log('\n🎯 COMO USAR:');
        console.log('=============');
        console.log('1. As correções são aplicadas automaticamente');
        console.log('2. Prêmios dinâmicos são interceptados e corrigidos');
        console.log('3. Dados do usuário são sincronizados automaticamente');
        console.log('4. Use as funções disponíveis para testes manuais');
        
        console.log('\n✅ CORREÇÃO CONCLUÍDA!');
        
        return true;
        
    } catch (error) {
        console.log('❌ Erro na correção:', error);
        return false;
    }
}

// Executar correção
const sucesso = corrigirPremiosDinamicos();

// Exportar funções
window.correcaoPremiosDinamicos = {
    aplicar: corrigirPremiosDinamicos,
    validar: window.validarPremioDinamico,
    mapear: window.mapearPremioDinamico,
    corrigirUsuario: window.corrigirDadosUsuario,
    testar: window.testarAberturaCaixa
};

console.log('🔧 Correção para prêmios dinâmicos carregada! Use window.correcaoPremiosDinamicos.aplicar() para executar novamente.');




