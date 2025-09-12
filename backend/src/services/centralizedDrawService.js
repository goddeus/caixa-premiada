const { PrismaClient } = require('@prisma/client');
const userSessionService = require('./userSessionService');
const cashFlowService = require('./cashFlowService');
const rtpService = require('./rtpService');

const prisma = new PrismaClient();

class CentralizedDrawService {
  /**
   * Função centralizada de sorteio com proteções transacionais
   * @param {string} caixaId - ID da caixa
   * @param {string} userId - ID do usuário
   * @param {string} sessionId - ID da sessão (opcional, será criada se não existir)
   * @param {boolean} skipDebit - Se true, não debita o valor da caixa (já foi debitado)
   * @returns {Object} Resultado do sorteio
   */
  async sortearPremio(caixaId, userId, sessionId = null, skipDebit = false) {
    const startTime = Date.now();
    
    try {
      console.log(`🎲 INICIANDO SORTEIO CENTRALIZADO - Caixa: ${caixaId}, Usuário: ${userId}, Sessão: ${sessionId || 'nova'}`);

      // Verificar se é conta demo ANTES de criar sessão
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          tipo_conta: true,
          saldo: true,
          saldo_demo: true
        }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      // Se for conta demo, usar fluxo separado
      if (user.tipo_conta === 'afiliado_demo') {
        console.log(`🎭 Conta afiliado detectada - usando fluxo separado`);
        console.log(`🔍 DEBUG: user.tipo_conta = "${user.tipo_conta}"`);
        return await this.sortearPremioDemo(caixaId, userId);
      } else {
        console.log(`👤 Conta normal detectada - usando fluxo normal`);
        console.log(`🔍 DEBUG: user.tipo_conta = "${user.tipo_conta}"`);
      }

      // 1. Obter ou criar sessão ativa (apenas para contas normais)
      let session;
      if (sessionId) {
        session = await prisma.userSession.findUnique({
          where: { id: sessionId }
        });
        if (!session || !session.ativo) {
          throw new Error('Sessão inválida ou inativa');
        }
      } else {
        session = await userSessionService.getOrCreateActiveSession(userId);
      }

      // 2. Obter dados da caixa (PREÇO ORIGINAL PRESERVADO)
      const caixa = await prisma.case.findUnique({
        where: { id: caixaId },
        include: {
          prizes: {
            where: {
              ativo: true,
              sorteavel: true
            }
          }
        }
      });

      if (!caixa || !caixa.ativo) {
        throw new Error('Caixa não encontrada ou inativa');
      }

      if (!caixa.prizes || caixa.prizes.length === 0) {
        throw new Error('Caixa não possui prêmios configurados');
      }

      // CORREÇÃO: Preservar preço original da caixa
      const precoOriginal = parseFloat(caixa.preco);
      console.log(`💰 Preço original da caixa: R$ ${precoOriginal.toFixed(2)}`);

      // 3. Obter RTP configurado
      const rtpConfig = await rtpService.getRTPConfig();
      const rtpDecimal = rtpConfig.rtp_target / 100;

      // 4. Calcular limite restante da sessão
      const restanteSessao = Math.max(0, session.limite_retorno - session.valor_premios_recebidos);
      
      console.log(`📊 Status da sessão: Gasto: R$ ${session.valor_gasto_caixas.toFixed(2)}, Prêmios: R$ ${session.valor_premios_recebidos.toFixed(2)}, Restante: R$ ${restanteSessao.toFixed(2)}`);

      // 5. Calcular valor desejado por abertura (sempre baseado no preço ORIGINAL da caixa)
      const desiredPerOpen = precoOriginal * rtpDecimal;

      console.log(`🎯 RTP configurado: ${rtpConfig.rtp_target}%, Desejado por abertura: R$ ${desiredPerOpen.toFixed(2)}`);

      // 6. Filtrar prêmios permitidos
      const allowedPrizes = caixa.prizes.filter(prize => {
        const valor = parseFloat(prize.valor);
        return valor <= restanteSessao && prize.tipo !== 'ilustrativo';
      });

      console.log(`🎁 Prêmios permitidos: ${allowedPrizes.length}/${caixa.prizes.length}`);

      // 7. Se não há prêmios permitidos ou restanteSessao <= 0
      if (allowedPrizes.length === 0 || restanteSessao <= 0) {
        console.log('🚫 Nenhum prêmio permitido - retornando prêmio ilustrativo');
        return await this.returnIllustrativePrize(caixa.prizes, caixaId, userId, session.id, precoOriginal);
      }

      // 8. Calcular probabilidades base
      const baseWeights = allowedPrizes.map(p => parseFloat(p.probabilidade) || 1);
      const sumBaseWeights = baseWeights.reduce((a, b) => a + b, 0);
      const baseProbs = allowedPrizes.map((p, i) => baseWeights[i] / sumBaseWeights);

      // 9. Calcular valor esperado base
      const E_base = allowedPrizes.reduce((acc, p, i) => {
        return acc + baseProbs[i] * parseFloat(p.valor);
      }, 0);

      console.log(`📈 Valor esperado base: R$ ${E_base.toFixed(2)}`);

      // 10. Se E_base == 0, retornar ilustrativo
      if (E_base <= 0) {
        console.log('🚫 Valor esperado base é zero - retornando prêmio ilustrativo');
        return await this.returnIllustrativePrize(caixa.prizes, caixaId, userId, session.id, precoOriginal);
      }

      // 11. Calcular fator de escala
      const s = Math.min(1, desiredPerOpen / E_base);
      
      console.log(`⚖️ Fator de escala: ${s.toFixed(3)}`);

      // 12. Decidir se paga ou retorna ilustrativo
      const r = Math.random();
      if (r > s) {
        console.log('🎭 Sorteio resultou em prêmio ilustrativo');
        const result = await this.returnIllustrativePrize(caixa.prizes, caixaId, userId, session.id, precoOriginal);
        console.log('🎭 Resultado retornado:', result);
        return result;
      }

      // 13. Selecionar prêmio para pagar
      const chosenIndex = this.sampleIndexByProbabilities(baseProbs);
      const chosenPrize = allowedPrizes[chosenIndex];

      console.log(`🎁 Prêmio selecionado: ${chosenPrize.nome} - R$ ${chosenPrize.valor}`);

      // 14. Verificar novamente se cabe no restante (proteção contra race conditions)
      const latestSession = await prisma.userSession.findUnique({
        where: { id: session.id }
      });

      const novoRecebido = latestSession.valor_premios_recebidos + parseFloat(chosenPrize.valor);
      if (novoRecebido > latestSession.limite_retorno) {
        console.log('🚫 Prêmio excede limite após verificação - retornando ilustrativo');
        return await this.returnIllustrativePrize(caixa.prizes, caixaId, userId, session.id, precoOriginal);
      }

      // 15. Executar transação de pagamento (usando preço original)
      const caixaComPrecoOriginal = { ...caixa, preco: precoOriginal };
      return await this.executePrizePayment(chosenPrize, caixaComPrecoOriginal, userId, session.id);

    } catch (error) {
      console.error('❌ Erro no sorteio centralizado:', error);
      throw error;
    }
  }

  /**
   * Retorna um prêmio ilustrativo (não paga dinheiro)
   * @param {Array} prizes - Lista de prêmios
   * @param {string} caixaId - ID da caixa
   * @param {string} userId - ID do usuário
   * @param {string} sessionId - ID da sessão
   * @param {number} boxPrice - Preço da caixa
   * @returns {Object} Resultado ilustrativo
   */
  async returnIllustrativePrize(prizes, caixaId, userId, sessionId, boxPrice) {
    try {
      // Mensagens realistas para quando não ganha
      const noPrizeMessages = [
        'Quem sabe na próxima!',
        'Tente novamente!',
        'Não foi dessa vez!',
        'Mais sorte na próxima!',
        'Continue tentando!',
        'Quase lá!',
        'Foi por pouco!',
        'Próxima vez será!',
        'Não desista!',
        'A sorte vai chegar!'
      ];
      
      // Selecionar mensagem aleatória
      const randomMessage = noPrizeMessages[Math.floor(Math.random() * noPrizeMessages.length)];
      
      // Criar prêmio "não ganhou" mais realista
      const chosenPrize = {
        id: 'nao_ganhou',
        nome: randomMessage,
        valor: 0,
        tipo: 'ilustrativo',
        imagem_url: null,
        sem_imagem: true // Flag para indicar que não deve mostrar imagem
      };

      // Debitar valor da caixa do usuário e registrar transação
      await prisma.$transaction(async (tx) => {
        // 1. Debitar valor da caixa
        await tx.user.update({
          where: { id: userId },
          data: { saldo: { decrement: boxPrice } }
        });

        // 2. Registrar transação de abertura
        await tx.transaction.create({
          data: {
            user_id: userId,
            session_id: sessionId,
            case_id: caixaId,
            tipo: 'abertura_caixa',
            valor: -boxPrice, // Debitar valor da caixa (negativo)
            status: 'concluido',
            descricao: `Abertura de caixa - ${chosenPrize.nome}`
          }
        });
      });

      // Atualizar caixa da plataforma em tempo real (só abertura, sem prêmio)
      try {
        await cashFlowService.logCashFlowChange({
          tipo: 'abertura_caixa',
          valor: -boxPrice,
          user_id: userId,
          descricao: `Abertura de caixa - ${chosenPrize.nome}`,
          transaction_id: 'centralized_draw_illustrative'
        });
      } catch (error) {
        console.error('⚠️ Erro ao atualizar caixa da plataforma:', error);
        // Não falha o sorteio por causa disso
      }

      console.log(`🎭 Resultado: ${chosenPrize.nome}`);

      // Buscar saldo atualizado do usuário
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { saldo: true }
      });

      const result = {
        success: true,
        result: 'NO_PRIZE',
        prize: {
          id: chosenPrize.id,
          nome: chosenPrize.nome,
          valor: 0, // Sempre 0 para "não ganhou"
          tipo: 'ilustrativo',
          imagem_url: null,
          sem_imagem: true // Flag para não mostrar imagem
        },
        message: 'Tente novamente na próxima!',
        userBalance: updatedUser.saldo
      };

      console.log(`🎭 Retornando resultado ilustrativo:`, result);
      return result;

    } catch (error) {
      console.error('Erro ao retornar prêmio ilustrativo:', error);
      throw error;
    }
  }

  /**
   * Executa o pagamento de um prêmio real
   * @param {Object} prize - Prêmio selecionado
   * @param {Object} caixa - Dados da caixa
   * @param {string} userId - ID do usuário
   * @param {string} sessionId - ID da sessão
   * @param {boolean} skipDebit - Se true, não debita o valor da caixa
   * @returns {Object} Resultado do pagamento
   */
  async executePrizePayment(prize, caixa, userId, sessionId, skipDebit = false) {
    try {
      // Verificar se é conta demo
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { tipo_conta: true }
      });

      const isDemoAccount = user && user.tipo_conta === 'afiliado_demo';

      // Iniciar transação
      await prisma.$transaction(async (tx) => {
        // 1. Debitar preço da caixa do usuário (apenas se não foi debitado antes)
        if (!skipDebit) {
          await tx.user.update({
            where: { id: userId },
            data: { saldo: { decrement: caixa.preco } }
          });
        }

        // 2. Creditar prêmio no usuário
        await tx.user.update({
          where: { id: userId },
          data: { saldo: { increment: prize.valor } }
        });

        // 3. Atualizar sessão
        await tx.userSession.update({
          where: { id: sessionId },
          data: {
            valor_gasto_caixas: { increment: caixa.preco },
            valor_premios_recebidos: { increment: prize.valor }
          }
        });

        // 4. Registrar transação de abertura
        await tx.transaction.create({
          data: {
            user_id: userId,
            session_id: sessionId,
            case_id: caixa.id,
            tipo: 'abertura_caixa',
            valor: -caixa.preco, // Debitar valor da caixa (negativo)
            status: 'concluido',
            descricao: `Abertura de caixa ${caixa.nome}`
          }
        });

        // 5. Registrar transação de prêmio
        await tx.transaction.create({
          data: {
            user_id: userId,
            session_id: sessionId,
            case_id: caixa.id,
            prize_id: prize.id,
            tipo: 'premio',
            valor: prize.valor,
            status: 'concluido',
            descricao: `Prêmio sorteado: ${prize.nome} - R$ ${prize.valor.toFixed(2)}`
          }
        });
      });

      // Transações já foram registradas na transação principal acima
      console.log(`✅ Transações registradas com sucesso`);

      console.log(`✅ Prêmio pago com sucesso: ${prize.nome} - R$ ${prize.valor}`);

      // Buscar saldo atualizado do usuário
      console.log('🔍 Buscando saldo atualizado do usuário...');
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { saldo: true }
      });
      console.log('✅ Saldo atualizado:', updatedUser.saldo);

      console.log('📤 Retornando resultado do sorteio...');
      return {
        success: true,
        result: 'PAID',
        prize: {
          id: prize.id,
          nome: prize.nome,
          valor: prize.valor,
          tipo: prize.tipo,
          imagem_url: prize.imagem_url
        },
        message: 'Prêmio pago com sucesso',
        is_demo: isDemoAccount,
        userBalance: updatedUser.saldo
      };

    } catch (error) {
      console.error('Erro ao executar pagamento do prêmio:', error);
      throw error;
    }
  }

  /**
   * Seleciona um índice baseado em probabilidades
   * @param {Array} probabilities - Array de probabilidades
   * @returns {number} Índice selecionado
   */
  sampleIndexByProbabilities(probabilities) {
    const total = probabilities.reduce((a, b) => a + b, 0);
    let random = Math.random() * total;
    
    for (let i = 0; i < probabilities.length; i++) {
      random -= probabilities[i];
      if (random <= 0) {
        return i;
      }
    }
    
    return probabilities.length - 1; // Fallback
  }

  /**
   * Sorteio específico para contas demo (RTP fixo 70%)
   * @param {string} caixaId - ID da caixa
   * @param {string} userId - ID do usuário demo
   * @returns {Object} Resultado do sorteio demo
   */
  async sortearPremioDemo(caixaId, userId) {
    try {
      console.log(`🎭 SORTEIO AFILIADO - Caixa: ${caixaId}, Usuário: ${userId}`);
      console.log(`🔍 DEBUG: Esta função só deve ser chamada para contas afiliado!`);

      // 1. Obter dados da caixa e usuário
      const caixa = await prisma.case.findUnique({
        where: { id: caixaId },
        include: {
          prizes: {
            where: {
              ativo: true,
              sorteavel: true
            }
          }
        }
      });

      if (!caixa || !caixa.ativo) {
        throw new Error('Caixa não encontrada ou inativa');
      }

      if (!caixa.prizes || caixa.prizes.length === 0) {
        throw new Error('Caixa não possui prêmios configurados');
      }

      // 2. Verificar saldo demo do usuário
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          saldo_demo: true,
          tipo_conta: true
        }
      });

      if (!user || user.tipo_conta !== 'afiliado_demo') {
        throw new Error('Usuário não é uma conta demo');
      }

      const valorCaixa = parseFloat(caixa.preco); // Preço original da caixa
      
      if (user.saldo_demo < valorCaixa) {
        throw new Error('Saldo insuficiente para abrir esta caixa');
      }

      // 3. Simular prêmio com RTP fixo de 85% e chances maiores de prêmios altos
      const rtpDemo = 0.85; // 85% fixo para contas demo (mais alto que contas normais)
      const valorEsperado = valorCaixa * rtpDemo;

      console.log(`🎯 RTP Demo: 85%, Preço original: R$ ${valorCaixa.toFixed(2)}, Valor esperado: R$ ${valorEsperado.toFixed(2)}`);

      // 4. Decidir se ganha ou não (85% de chance de ganhar)
      const chanceGanhar = Math.random();
      const ganha = chanceGanhar < 0.85;

      let premioSelecionado;

      if (ganha) {
        // 85% de chance de ganhar - selecionar prêmio com bias para prêmios altos
        const premiosValidos = caixa.prizes.filter(p => parseFloat(p.valor) > 0);
        
        if (premiosValidos.length === 0) {
          // Se não há prêmios válidos, dar prêmio mínimo
          premioSelecionado = {
            id: 'demo_minimo',
            nome: 'Prêmio Demo',
            valor: valorCaixa * 0.8, // 80% do valor da caixa (mais generoso)
            tipo: 'cash',
            imagem_url: null,
            sem_imagem: true
          };
        } else {
          // Para contas demo: dar muito mais chances para prêmios altos
          const premiosAltos = premiosValidos.filter(p => parseFloat(p.valor) >= valorCaixa * 2); // Prêmios >= 2x o valor da caixa
          const premiosMedios = premiosValidos.filter(p => parseFloat(p.valor) >= valorCaixa * 0.5 && parseFloat(p.valor) < valorCaixa * 2);
          const premiosBaixos = premiosValidos.filter(p => parseFloat(p.valor) < valorCaixa * 0.5);
          
          // Chances para contas demo: 60% prêmios altos, 30% médios, 10% baixos
          const chanceTipo = Math.random();
          let premiosCandidatos = [];
          
          if (chanceTipo < 0.6 && premiosAltos.length > 0) {
            // 60% de chance de prêmio alto
            premiosCandidatos = premiosAltos;
            console.log(`🎁 Demo: Selecionando entre ${premiosAltos.length} prêmios altos`);
          } else if (chanceTipo < 0.9 && premiosMedios.length > 0) {
            // 30% de chance de prêmio médio
            premiosCandidatos = premiosMedios;
            console.log(`🎁 Demo: Selecionando entre ${premiosMedios.length} prêmios médios`);
          } else {
            // 10% de chance de prêmio baixo
            premiosCandidatos = premiosBaixos.length > 0 ? premiosBaixos : premiosValidos;
            console.log(`🎁 Demo: Selecionando entre ${premiosCandidatos.length} prêmios baixos`);
          }
          
          // Se não há candidatos, usar todos os prêmios válidos
          if (premiosCandidatos.length === 0) {
            premiosCandidatos = premiosValidos;
          }
          
          // Selecionar prêmio aleatório entre os candidatos
          const randomIndex = Math.floor(Math.random() * premiosCandidatos.length);
          const premioEscolhido = premiosCandidatos[randomIndex];
          
          premioSelecionado = {
            id: premioEscolhido.id,
            nome: premioEscolhido.nome,
            valor: parseFloat(premioEscolhido.valor),
            tipo: premioEscolhido.tipo,
            imagem_url: premioEscolhido.imagem_url
          };
        }
      } else {
        // 15% de chance de não ganhar (muito menor que contas normais)
        premioSelecionado = {
          id: 'demo_nao_ganhou',
          nome: 'Quem sabe na próxima!',
          valor: 0,
          tipo: 'ilustrativo',
          imagem_url: null,
          sem_imagem: true
        };
      }

      console.log(`🎁 Prêmio selecionado: ${premioSelecionado.nome} - R$ ${premioSelecionado.valor}`);

      // 5. Executar transação demo (não afeta caixa real)
      return await this.executePrizePaymentDemo(premioSelecionado, caixa, userId);

    } catch (error) {
      console.error('❌ Erro no sorteio demo:', error);
      throw error;
    }
  }

  /**
   * Executa pagamento de prêmio para conta demo
   * @param {Object} prize - Prêmio selecionado
   * @param {Object} caixa - Dados da caixa
   * @param {string} userId - ID do usuário demo
   * @returns {Object} Resultado do pagamento demo
   */
  async executePrizePaymentDemo(prize, caixa, userId) {
    try {
      console.log(`🎭 EXECUTANDO PAGAMENTO AFILIADO - Prêmio: ${prize.nome}`);

      // Transação otimizada - operações separadas para clareza
      await prisma.$transaction(async (tx) => {
        // 1. Debitar preço real da caixa do saldo_demo (para parecer real)
        const valorDebito = caixa.preco; // Preço real, sem desconto
        await tx.user.update({
          where: { id: userId },
          data: { saldo_demo: { decrement: valorDebito } }
        });

        // 2. Creditar prêmio no saldo_demo (se valor > 0)
        if (prize.valor > 0) {
          await tx.user.update({
            where: { id: userId },
            data: { saldo_demo: { increment: prize.valor } }
          });
        }

        // 3. Registrar transação de abertura da caixa
        await tx.transaction.create({
          data: {
            user_id: userId,
            case_id: caixa.id,
            tipo: 'abertura_caixa', // Mesmo tipo das contas normais
            valor: -valorDebito, // Negativo porque é débito (preço real)
            status: 'concluido',
            descricao: `Abertura de caixa ${caixa.nome}` // Sem referência a DEMO
          }
        });

        // 4. Registrar transação do prêmio (se valor > 0)
        if (prize.valor > 0) {
          await tx.transaction.create({
            data: {
              user_id: userId,
              case_id: caixa.id,
              prize_id: prize.id,
              tipo: 'premio', // Mesmo tipo das contas normais
              valor: prize.valor,
              status: 'concluido',
              descricao: `Prêmio ganho na caixa ${caixa.nome}: R$ ${prize.valor.toFixed(2)}` // Sem referência a DEMO
            }
          });
        }
      }, {
        timeout: 15000, // 15 segundos
        maxWait: 5000,  // 5 segundos
      });

      // NÃO atualizar caixa da plataforma (conta afiliado)
      console.log(`🎭 Conta afiliado - prêmio não afeta caixa real da plataforma`);

      console.log(`✅ Prêmio processado: ${prize.nome} - R$ ${prize.valor}`);

      // Buscar saldo demo atualizado do usuário
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { saldo_demo: true }
      });

      return {
        success: true,
        result: 'PAID',
        prize: {
          id: prize.id,
          nome: prize.nome,
          valor: prize.valor,
          tipo: prize.tipo,
          imagem_url: prize.imagem_url,
          sem_imagem: prize.sem_imagem || false
        },
        message: prize.valor > 0 ? 
          `Parabéns! Você ganhou R$ ${prize.valor.toFixed(2)}!` : 
          'Tente novamente na próxima!',
        is_demo: true,
        userBalance: updatedUser.saldo_demo
      };

    } catch (error) {
      console.error('Erro ao executar pagamento demo:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas do sistema de sorteio
   * @returns {Object} Estatísticas
   */
  async getDrawStats() {
    try {
      const stats = await prisma.transaction.groupBy({
        by: ['tipo'],
        where: {
          tipo: {
            in: ['premio', 'abertura_caixa']
          },
          status: 'concluido'
        },
        _sum: {
          valor: true
        },
        _count: {
          valor: true
        }
      });

      const rtpConfig = await rtpService.getRTPConfig();

      return {
        rtp_config: rtpConfig,
        total_premios_pagos: stats.find(s => s.tipo === 'premio')?._sum.valor || 0,
        total_caixas_abertas: stats.find(s => s.tipo === 'abertura_caixa')?._count.valor || 0,
        stats_by_type: stats
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas do sorteio:', error);
      throw new Error('Falha ao obter estatísticas');
    }
  }
}

module.exports = new CentralizedDrawService();
