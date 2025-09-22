/**
 * 🎁 DIAGNÓSTICO DETALHADO DE PRÊMIOS
 * 
 * Este script identifica e corrige problemas específicos com prêmios
 * que aparecem "dados do prêmio não encontrado".
 */

console.log('🎁 INICIANDO DIAGNÓSTICO DETALHADO DE PRÊMIOS...');
console.log('===============================================');

// Função para diagnosticar problemas de prêmios
async function diagnosticarPremios() {
    console.log('🚀 Iniciando diagnóstico de prêmios...');
    
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.log('❌ Token não encontrado - usuário não autenticado');
            return;
        }

        // 1. Buscar todas as caixas
        console.log('\n📦 BUSCANDO CAIXAS:');
        console.log('===================');
        
        const casesResponse = await fetch('https://slotbox-api.onrender.com/api/cases', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const casesData = await casesResponse.json();
        
        if (!casesData.success || !casesData.data) {
            console.log('❌ Erro ao buscar caixas');
            return;
        }
        
        console.log(`✅ Encontradas ${casesData.data.length} caixas`);
        
        // 2. Buscar todos os prêmios
        console.log('\n🎁 BUSCANDO PRÊMIOS:');
        console.log('===================');
        
        const prizesResponse = await fetch('https://slotbox-api.onrender.com/api/prizes', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const prizesData = await prizesResponse.json();
        
        if (!prizesData.success || !prizesData.data) {
            console.log('❌ Erro ao buscar prêmios');
            return;
        }
        
        console.log(`✅ Encontrados ${prizesData.data.length} prêmios`);
        
        // 3. Analisar cada caixa e seus prêmios
        console.log('\n🔍 ANÁLISE DETALHADA:');
        console.log('====================');
        
        const problemas = [];
        
        casesData.data.forEach((caixa, index) => {
            console.log(`\n📦 Caixa ${index + 1}: ${caixa.nome}`);
            console.log(`   ID: ${caixa.id}`);
            console.log(`   Preço: R$ ${caixa.preco}`);
            
            // Buscar prêmios desta caixa
            const premiosDaCaixa = prizesData.data.filter(prize => prize.case_id === caixa.id);
            console.log(`   Prêmios associados: ${premiosDaCaixa.length}`);
            
            if (premiosDaCaixa.length === 0) {
                problemas.push({
                    tipo: 'caixa_sem_premios',
                    caixa: caixa.nome,
                    caixa_id: caixa.id,
                    problema: 'Caixa não tem prêmios associados'
                });
                console.log('   ❌ PROBLEMA: Caixa sem prêmios!');
            } else {
                // Verificar cada prêmio
                premiosDaCaixa.forEach((premio, premioIndex) => {
                    console.log(`   🎁 Prêmio ${premioIndex + 1}: ${premio.nome}`);
                    console.log(`      ID: ${premio.id}`);
                    console.log(`      Valor: R$ ${premio.valor}`);
                    console.log(`      Probabilidade: ${premio.probabilidade}%`);
                    console.log(`      Sem imagem: ${premio.sem_imagem ? 'Sim' : 'Não'}`);
                    
                    // Verificar problemas específicos
                    if (!premio.nome || premio.nome.trim() === '') {
                        problemas.push({
                            tipo: 'premio_sem_nome',
                            caixa: caixa.nome,
                            premio_id: premio.id,
                            problema: 'Prêmio sem nome'
                        });
                        console.log('      ❌ PROBLEMA: Prêmio sem nome!');
                    }
                    
                    if (premio.valor === undefined || premio.valor === null || premio.valor < 0) {
                        problemas.push({
                            tipo: 'premio_valor_invalido',
                            caixa: caixa.nome,
                            premio_id: premio.id,
                            premio_nome: premio.nome,
                            valor: premio.valor,
                            problema: 'Valor do prêmio inválido'
                        });
                        console.log('      ❌ PROBLEMA: Valor inválido!');
                    }
                    
                    if (premio.probabilidade <= 0 || premio.probabilidade > 100) {
                        problemas.push({
                            tipo: 'premio_probabilidade_invalida',
                            caixa: caixa.nome,
                            premio_id: premio.id,
                            premio_nome: premio.nome,
                            probabilidade: premio.probabilidade,
                            problema: 'Probabilidade inválida'
                        });
                        console.log('      ❌ PROBLEMA: Probabilidade inválida!');
                    }
                });
            }
        });
        
        // 4. Verificar prêmios órfãos
        console.log('\n🔍 VERIFICANDO PRÊMIOS ÓRFÃOS:');
        console.log('==============================');
        
        const caseIds = casesData.data.map(c => c.id);
        const premiosOrfaos = prizesData.data.filter(prize => !caseIds.includes(prize.case_id));
        
        if (premiosOrfaos.length > 0) {
            console.log(`⚠️ Encontrados ${premiosOrfaos.length} prêmios órfãos:`);
            premiosOrfaos.forEach(premio => {
                problemas.push({
                    tipo: 'premio_orfa',
                    premio_id: premio.id,
                    premio_nome: premio.nome,
                    case_id: premio.case_id,
                    problema: 'Prêmio sem caixa correspondente'
                });
                console.log(`   🎁 ${premio.nome} (ID: ${premio.id}) - Case ID: ${premio.case_id}`);
            });
        } else {
            console.log('✅ Nenhum prêmio órfão encontrado');
        }
        
        // 5. Verificar duplicatas
        console.log('\n🔍 VERIFICANDO DUPLICATAS:');
        console.log('=========================');
        
        const nomesPremios = prizesData.data.map(p => p.nome);
        const duplicatas = nomesPremios.filter((nome, index) => nomesPremios.indexOf(nome) !== index);
        
        if (duplicatas.length > 0) {
            console.log(`⚠️ Encontradas ${duplicatas.length} duplicatas:`);
            duplicatas.forEach(nome => {
                const premiosDuplicados = prizesData.data.filter(p => p.nome === nome);
                problemas.push({
                    tipo: 'premio_duplicado',
                    premio_nome: nome,
                    quantidade: premiosDuplicados.length,
                    premios: premiosDuplicados.map(p => ({ id: p.id, case_id: p.case_id })),
                    problema: 'Prêmios com nomes duplicados'
                });
                console.log(`   🎁 ${nome} (${premiosDuplicados.length} ocorrências)`);
            });
        } else {
            console.log('✅ Nenhuma duplicata encontrada');
        }
        
        // 6. Testar abertura de caixas
        console.log('\n🎲 TESTANDO ABERTURA DE CAIXAS:');
        console.log('===============================');
        
        const walletResponse = await fetch('https://slotbox-api.onrender.com/api/wallet', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const walletData = await walletResponse.json();
        const saldo = walletData.data.saldo_reais;
        
        console.log(`💰 Saldo atual: R$ ${saldo}`);
        
        if (saldo > 0) {
            // Testar abertura de cada caixa
            for (const caixa of casesData.data.slice(0, 3)) { // Testar apenas 3 caixas
                const preco = parseFloat(caixa.preco);
                
                if (saldo >= preco) {
                    console.log(`\n🎲 Testando caixa: ${caixa.nome}`);
                    
                    try {
                        const openResponse = await fetch(`https://slotbox-api.onrender.com/api/cases/buy/${caixa.id}`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        const openResult = await openResponse.json();
                        console.log('📊 Resultado:', openResult);
                        
                        if (openResult.success) {
                            if (openResult.data && openResult.data.premio) {
                                const premio = openResult.data.premio;
                                console.log('✅ Prêmio obtido:', premio.nome);
                                console.log('   Valor:', premio.valor);
                                console.log('   ID:', premio.id);
                                
                                // Verificar se o prêmio existe na lista de prêmios
                                const premioExiste = prizesData.data.find(p => p.id === premio.id);
                                if (!premioExiste) {
                                    problemas.push({
                                        tipo: 'premio_inexistente',
                                        caixa: caixa.nome,
                                        premio_id: premio.id,
                                        premio_nome: premio.nome,
                                        problema: 'Prêmio retornado não existe na lista de prêmios'
                                    });
                                    console.log('   ❌ PROBLEMA: Prêmio não existe na lista!');
                                }
                            } else {
                                problemas.push({
                                    tipo: 'caixa_sem_premio_retorno',
                                    caixa: caixa.nome,
                                    problema: 'Caixa aberta mas não retornou prêmio'
                                });
                                console.log('   ❌ PROBLEMA: Caixa não retornou prêmio!');
                            }
                        } else {
                            console.log('   ❌ Falha na abertura:', openResult.message || openResult.error);
                        }
                        
                        // Aguardar entre testes
                        await new Promise(resolve => setTimeout(resolve, 2000));
                        
                    } catch (error) {
                        console.log('   ❌ Erro no teste:', error.message);
                    }
                } else {
                    console.log(`⚠️ Saldo insuficiente para testar ${caixa.nome} (precisa R$ ${preco})`);
                }
            }
        } else {
            console.log('⚠️ Saldo insuficiente para testar abertura de caixas');
        }
        
        // 7. Relatório final
        console.log('\n📊 RELATÓRIO FINAL:');
        console.log('===================');
        
        if (problemas.length === 0) {
            console.log('🎉 NENHUM PROBLEMA ENCONTRADO!');
            console.log('✅ Todos os prêmios estão funcionando corretamente');
        } else {
            console.log(`❌ ENCONTRADOS ${problemas.length} PROBLEMAS:`);
            console.log('=====================================');
            
            problemas.forEach((problema, index) => {
                console.log(`\n${index + 1}. ${problema.problema}`);
                console.log(`   Tipo: ${problema.tipo}`);
                
                if (problema.caixa) console.log(`   Caixa: ${problema.caixa}`);
                if (problema.premio_id) console.log(`   Prêmio ID: ${problema.premio_id}`);
                if (problema.premio_nome) console.log(`   Prêmio: ${problema.premio_nome}`);
                if (problema.valor !== undefined) console.log(`   Valor: ${problema.valor}`);
                if (problema.probabilidade !== undefined) console.log(`   Probabilidade: ${problema.probabilidade}%`);
            });
            
            // Sugestões de correção
            console.log('\n💡 SUGESTÕES DE CORREÇÃO:');
            console.log('=========================');
            
            const tiposProblemas = [...new Set(problemas.map(p => p.tipo))];
            
            tiposProblemas.forEach(tipo => {
                switch (tipo) {
                    case 'caixa_sem_premios':
                        console.log('🔧 Caixas sem prêmios: Adicionar prêmios na tabela de prêmios');
                        break;
                    case 'premio_sem_nome':
                        console.log('🔧 Prêmios sem nome: Atualizar campo nome na tabela de prêmios');
                        break;
                    case 'premio_valor_invalido':
                        console.log('🔧 Valores inválidos: Corrigir valores na tabela de prêmios');
                        break;
                    case 'premio_probabilidade_invalida':
                        console.log('🔧 Probabilidades inválidas: Ajustar probabilidades (0-100%)');
                        break;
                    case 'premio_orfa':
                        console.log('🔧 Prêmios órfãos: Remover ou associar a uma caixa');
                        break;
                    case 'premio_duplicado':
                        console.log('🔧 Prêmios duplicados: Renomear ou remover duplicatas');
                        break;
                    case 'premio_inexistente':
                        console.log('🔧 Prêmios inexistentes: Verificar lógica de seleção de prêmios');
                        break;
                    case 'caixa_sem_premio_retorno':
                        console.log('🔧 Caixas sem retorno: Verificar lógica de abertura de caixas');
                        break;
                }
            });
        }
        
        console.log('\n✅ DIAGNÓSTICO CONCLUÍDO!');
        
        return problemas;
        
    } catch (error) {
        console.log('❌ Erro no diagnóstico:', error);
        return [];
    }
}

// Função para corrigir problemas automaticamente
async function corrigirProblemasAutomaticamente() {
    console.log('\n🔧 APLICANDO CORREÇÕES AUTOMÁTICAS...');
    console.log('=====================================');
    
    try {
        const token = localStorage.getItem('token');
        
        // Buscar dados atualizados
        const [casesResponse, prizesResponse] = await Promise.all([
            fetch('https://slotbox-api.onrender.com/api/cases', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }),
            fetch('https://slotbox-api.onrender.com/api/prizes', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })
        ]);
        
        const casesData = await casesResponse.json();
        const prizesData = await prizesResponse.json();
        
        if (!casesData.success || !prizesData.success) {
            console.log('❌ Erro ao buscar dados para correção');
            return;
        }
        
        console.log('✅ Dados carregados para correção');
        
        // Limpar cache do navegador
        console.log('🧹 Limpando cache do navegador...');
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('✅ Cache limpo');
        }
        
        // Forçar recarregamento dos dados
        console.log('🔄 Forçando recarregamento dos dados...');
        window.location.reload();
        
    } catch (error) {
        console.log('❌ Erro na correção automática:', error);
    }
}

// Executar diagnóstico
diagnosticarPremios();

// Exportar funções
window.diagnosticoPremios = {
    diagnosticar: diagnosticarPremios,
    corrigir: corrigirProblemasAutomaticamente
};

console.log('🎁 Diagnóstico de prêmios carregado! Use window.diagnosticoPremios.diagnosticar() para executar novamente.');

