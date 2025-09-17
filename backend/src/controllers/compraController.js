const { PrismaClient } = require('@prisma/client');
const manipulativeDrawService = require('../services/manipulativeDrawService');
const manipulativeCompraController = require('./manipulativeCompraController');
const prisma = new PrismaClient();

class CompraController {
  // Dados estáticos das caixas (fallback quando banco não está disponível)
  getStaticCaseData(caseId) {
    const staticCases = {
      '1abd77cf-472b-473d-9af0-6cd47f9f1452': {
        id: '1abd77cf-472b-473d-9af0-6cd47f9f1452',
        nome: 'CAIXA FINAL DE SEMANA',
        preco: 1.5,
        ativo: true,
        prizes: [
          { id: '1', nome: 'R$ 0,50', valor: 0.5, probabilidade: 0.3 },
          { id: '2', nome: 'R$ 1,00', valor: 1.0, probabilidade: 0.2 },
          { id: '3', nome: 'R$ 2,00', valor: 2.0, probabilidade: 0.1 },
          { id: '4', nome: 'R$ 5,00', valor: 5.0, probabilidade: 0.05 },
          { id: '5', nome: 'R$ 10,00', valor: 10.0, probabilidade: 0.02 },
          { id: '6', nome: 'Nada', valor: 0, probabilidade: 0.33 }
        ]
      },
      '0b5e9b8a-9d56-4769-a45a-55a3025640f4': {
        id: '0b5e9b8a-9d56-4769-a45a-55a3025640f4',
        nome: 'CAIXA KIT NIKE',
        preco: 2.5,
        ativo: true,
        prizes: [
          { id: '7', nome: 'R$ 1,00', valor: 1.0, probabilidade: 0.25 },
          { id: '8', nome: 'R$ 2,50', valor: 2.5, probabilidade: 0.2 },
          { id: '9', nome: 'R$ 5,00', valor: 5.0, probabilidade: 0.15 },
          { id: '10', nome: 'R$ 10,00', valor: 10.0, probabilidade: 0.1 },
          { id: '11', nome: 'R$ 25,00', valor: 25.0, probabilidade: 0.05 },
          { id: '12', nome: 'Nada', valor: 0, probabilidade: 0.25 }
        ]
      }
    };
    
    return staticCases[caseId] || null;
  }

  // Sistema de sorteio simples e direto
  async simpleDraw(caseData, userId, userBalance) {
    try {
      console.log('🎲 Executando sorteio simples...');
      
      if (!caseData.prizes || caseData.prizes.length === 0) {
        return {
          success: false,
          message: 'Caixa não possui prêmios configurados'
        };
      }

      // Calcular probabilidades
      const totalProbability = caseData.prizes.reduce((sum, prize) => sum + prize.probabilidade, 0);
      const random = Math.random() * totalProbability;
      
      let currentProbability = 0;
      let selectedPrize = null;
      
      for (const prize of caseData.prizes) {
        currentProbability += prize.probabilidade;
        if (random <= currentProbability) {
          selectedPrize = prize;
          break;
        }
      }
      
      if (!selectedPrize) {
        selectedPrize = caseData.prizes[caseData.prizes.length - 1]; // Fallback
      }
      
      console.log(`🎁 Prêmio selecionado: ${selectedPrize.nome} - R$ ${selectedPrize.valor}`);
      console.log('🔍 Dados do prêmio selecionado:', selectedPrize);
      
      const prizeReturn = {
        id: selectedPrize.id,
        nome: selectedPrize.nome,
        valor: parseFloat(selectedPrize.valor), // Garantir que é número
        tipo: 'cash',
        imagem: null
      };
      
      console.log('📤 Retornando prêmio:', prizeReturn);
      
      return {
        success: true,
        prize: prizeReturn,
        message: selectedPrize.valor > 0 ? 
          `Parabéns! Você ganhou R$ ${selectedPrize.valor.toFixed(2)}!` : 
          'Tente novamente na próxima!',
        is_demo: false,
        userBalance: userBalance
      };
      
    } catch (error) {
      console.error('❌ Erro no sorteio simples:', error.message);
      return {
        success: false,
        message: 'Erro no sistema de sorteio'
      };
    }
  }

  // Comprar e abrir uma caixa - SISTEMA ATOMICO E SEGURO
  async buyCase(req, res) {
    // Redirecionar para o sistema manipulativo
    return await manipulativeCompraController.buyCaseManipulative(req, res);
  }

  // Compra de caixa (método antigo - mantido para compatibilidade)
  async buyCaseOld(req, res) {
    const startTime = Date.now();
    let purchaseId = null;
    
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      console.log('[BUY] Iniciando compra de caixa:', { caseId: id, userId });
      
      // Gerar ID de compra para idempotência
      purchaseId = `purchase_${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Buscar a caixa
      let caseData;
      try {
        caseData = await prisma.case.findUnique({
          where: { id: id },
          include: {
            prizes: {
              where: { ativo: true },
              select: {
                id: true,
                nome: true,
                valor: true,
                probabilidade: true,
                imagem: true
              }
            }
          }
        });
      } catch (dbError) {
        console.error('[BUY] Erro ao buscar caixa no banco:', dbError.message);
        caseData = this.getStaticCaseData(id);
      }

      if (!caseData) {
        return res.status(404).json({ 
          success: false,
          error: 'Caixa não encontrada' 
        });
      }

      if (!caseData.ativo) {
        return res.status(400).json({ 
          success: false,
          error: 'Esta caixa não está disponível' 
        });
      }

      // Validar se há prêmios
      if (!caseData.prizes || caseData.prizes.length === 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Caixa não possui prêmios configurados' 
        });
      }

      // Obter preço da caixa
      const precoUnitario = Number(caseData.preco);
      const totalPreco = +(precoUnitario * 1).toFixed(2);

      console.log('[BUY] Preço da caixa:', { precoUnitario, totalPreco });

      // Verificar se é conta demo
      const isDemoAccount = req.user.tipo_conta === 'afiliado_demo';
      const saldoField = isDemoAccount ? 'saldo_demo' : 'saldo_reais';
      
      // OPERAÇÃO ATOMICA: Debitar saldo e fazer sorteio
      const result = await prisma.$transaction(async (tx) => {
        // 1. Buscar usuário com lock para evitar race conditions
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { 
            id: true, 
            [saldoField]: true, 
            tipo_conta: true,
            nome: true,
            email: true
          }
        });

        if (!user) {
          throw new Error('Usuário não encontrado');
        }

        const saldoAtual = parseFloat(user[saldoField] || 0);
        
        // 2. Verificar saldo suficiente
        if (saldoAtual < totalPreco) {
          throw new Error('Saldo insuficiente');
        }

        // 3. Debitar saldo de forma atômica
        const saldoAposDebito = saldoAtual - totalPreco;
        
        await tx.user.update({
          where: { id: userId },
          data: { [saldoField]: saldoAposDebito }
        });

        console.log('[BUY] Saldo debitado:', { saldoAntes: saldoAtual, saldoDepois: saldoAposDebito });

        // 4. Fazer sorteio
        console.log('[BUY] Dados da caixa para sorteio:', { 
          nome: caseData.nome, 
          prizes: caseData.prizes?.length || 0 
        });
        
        const drawResult = await this.simpleDraw(caseData, userId, saldoAposDebito);
        
        if (!drawResult || !drawResult.success) {
          console.error('[BUY] Erro no sorteio:', drawResult);
          throw new Error('Erro no sistema de sorteio');
        }
        
        const wonPrize = drawResult.prize;
        console.log('[BUY] Prêmio sorteado:', wonPrize);
        console.log('[BUY] Valor do prêmio:', typeof wonPrize.valor, wonPrize.valor);

        // 5. Creditar prêmio se valor > 0
        let saldoFinal = saldoAposDebito;
        console.log('[BUY] Verificando se deve creditar prêmio:', { 
          valor: wonPrize.valor, 
          tipo: typeof wonPrize.valor,
          condicao: wonPrize.valor > 0 
        });
        
        if (wonPrize.valor > 0) {
          saldoFinal = saldoAposDebito + parseFloat(wonPrize.valor);
          
          console.log('[BUY] Creditando prêmio:', { 
            saldoAntes: saldoAposDebito, 
            valorPremio: wonPrize.valor,
            saldoDepois: saldoFinal,
            campo: saldoField
          });
          
          await tx.user.update({
            where: { id: userId },
            data: { [saldoField]: saldoFinal }
          });
          
          console.log('[BUY] Prêmio creditado com sucesso!');
        } else {
          console.log('[BUY] Prêmio sem valor, não creditando');
        }

        // 6. Registrar auditoria de compra
        await tx.purchaseAudit.create({
          data: {
            user_id: userId,
            case_id: id,
            saldo_before: saldoAtual,
            saldo_after: saldoFinal,
            prize_id: wonPrize.id,
            prize_value: wonPrize.valor,
            purchase_id: purchaseId,
            created_at: new Date()
          }
        });

        // 7. Registrar transações
        // Transação de débito
        await tx.transaction.create({
          data: {
            user_id: userId,
            tipo: 'abertura_caixa',
            valor: -totalPreco,
            saldo_antes: saldoAtual,
            saldo_depois: saldoAposDebito,
            descricao: `Abertura de caixa ${caseData.nome}`,
            status: 'processado',
            // related_id: purchaseId, // Temporariamente removido
            created_at: new Date()
          }
        });

        // Transação de crédito (se prêmio > 0)
        if (wonPrize.valor > 0) {
          await tx.transaction.create({
            data: {
              user_id: userId,
              tipo: 'premio',
              valor: parseFloat(wonPrize.valor),
              saldo_antes: saldoAposDebito,
              saldo_depois: saldoFinal,
              descricao: `Prêmio ganho na caixa ${caseData.nome}: ${wonPrize.nome}`,
              status: 'processado',
              // related_id: purchaseId, // Temporariamente removido
              created_at: new Date()
            }
          });
        }

        return {
          success: true,
          ganhou: wonPrize.valor > 0,
          premio: wonPrize.valor > 0 ? {
            id: wonPrize.id,
            nome: wonPrize.nome,
            valor: wonPrize.valor,
            imagem: wonPrize.imagem
          } : null,
          saldo_restante: saldoFinal,
          transacao: {
            valor_debitado: totalPreco,
            valor_creditado: wonPrize.valor,
            saldo_antes: saldoAtual,
            saldo_depois: saldoFinal
          },
          purchaseId
        };
      });

      const processingTime = Date.now() - startTime;
      console.log(`[BUY] Compra concluída em ${processingTime}ms:`, result);

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('[BUY] Erro ao comprar caixa:', error);
      
      // Se a transação falhou, tentar reverter se possível
      if (purchaseId) {
        try {
          // Log do erro para auditoria
          await prisma.purchaseAudit.create({
            data: {
              user_id: req.user.id,
              case_id: req.params.id,
              saldo_before: 0,
              saldo_after: 0,
              prize_id: null,
              prize_value: 0,
              purchase_id: purchaseId,
              error_message: error.message,
              created_at: new Date()
            }
          });
        } catch (auditError) {
          console.error('[BUY] Erro ao registrar auditoria:', auditError);
        }
      }
      
      res.status(500).json({ 
        success: false,
        error: error.message || 'Erro interno do servidor',
        purchaseId
      });
    }
  }

  // Comprar múltiplas caixas - SISTEMA CORRIGIDO
  async buyMultipleCases(req, res) {
    // Redirecionar para o sistema manipulativo
    return await manipulativeCompraController.buyMultipleCasesManipulative(req, res);
  }

  // Compra múltipla de caixas (método antigo - mantido para compatibilidade)
  async buyMultipleCasesOld(req, res) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      const userId = req.user.id;
      
      console.log('🔍 Debug buyMultipleCases:');
      console.log('- Case ID:', id);
      console.log('- Quantity:', quantity);
      console.log('- User ID:', userId);

      // Validação robusta de ID
      if (!id || id.trim() === '') {
        return res.status(400).json({ error: 'ID da caixa é obrigatório' });
      }

      // Validação robusta de quantidade
      if (!quantity || quantity === '' || quantity === null || quantity === undefined) {
        return res.status(400).json({ error: 'Quantidade é obrigatória' });
      }

      const numericQuantity = parseInt(quantity);
      if (isNaN(numericQuantity) || !isFinite(numericQuantity)) {
        return res.status(400).json({ error: 'Quantidade deve ser um número válido' });
      }

      if (numericQuantity < 1 || numericQuantity > 10) {
        return res.status(400).json({ error: 'Quantidade deve ser entre 1 e 10' });
      }

      // Buscar a caixa
      let caseData;
      try {
        caseData = await prisma.case.findUnique({
          where: { id: id },
          include: {
            prizes: {
              select: {
                id: true,
                nome: true,
                valor: true,
                probabilidade: true
              }
            }
          }
        });
      } catch (dbError) {
        console.error('❌ Erro ao buscar caixa no banco:', dbError.message);
        caseData = this.getStaticCaseData(id);
      }

      if (!caseData) {
        return res.status(404).json({ error: 'Caixa não encontrada' });
      }

      if (!caseData.ativo) {
        return res.status(400).json({ error: 'Esta caixa não está disponível' });
      }

      // Calcular custo total
      const precoUnitario = Number(caseData.preco);
      const totalCost = +(precoUnitario * quantity).toFixed(2);

      console.log('💰 Preço unitário da caixa:', precoUnitario);
      console.log('💰 Quantidade:', quantity);
      console.log('💰 Total a ser cobrado:', totalCost);
      
      // Verificar saldo baseado no tipo de conta
      const isDemoAccount = req.user.tipo_conta === 'afiliado_demo';
      const saldoAtual = isDemoAccount ? req.user.saldo_demo : req.user.saldo_reais;
      
      if (parseFloat(saldoAtual) < totalCost) {
        return res.status(400).json({ error: 'Saldo insuficiente' });
      }

      // Registrar saldo antes da compra para auditoria
      const saldoAntes = parseFloat(saldoAtual);

      const results = [];
      let totalWon = 0;
      let saldoAtualizado = saldoAntes;

      // Processar cada caixa
      for (let i = 0; i < quantity; i++) {
        try {
          console.log(`🎲 Processando caixa ${i + 1}/${quantity}...`);
          
          // Fazer sorteio
          const drawResult = await this.simpleDraw(caseData, userId, saldoAtualizado);
          
          if (!drawResult.success) {
            console.error(`❌ Erro no sorteio da caixa ${i + 1}:`, drawResult.message);
            results.push({
              boxNumber: i + 1,
              success: false,
              error: drawResult.message,
              prize: null
            });
            continue;
          }
          
          const wonPrize = drawResult.prize;
          console.log(`🎁 Caixa ${i + 1} - Prêmio:`, wonPrize.nome, 'R$', wonPrize.valor);

          // Se for prêmio real, somar ao total
          if (wonPrize.valor > 0) {
            totalWon += parseFloat(wonPrize.valor);
            saldoAtualizado += parseFloat(wonPrize.valor);
          }

          results.push({
            boxNumber: i + 1,
            success: true,
            prize: {
              id: wonPrize.id,
              nome: wonPrize.nome,
              valor: wonPrize.valor,
              imagem: wonPrize.imagem,
              sem_imagem: wonPrize.valor === 0,
              is_illustrative: wonPrize.valor === 0,
              message: wonPrize.valor === 0 ? 'Quem sabe na próxima!' : `Parabéns! Você ganhou R$ ${parseFloat(wonPrize.valor).toFixed(2)}!`
            }
          });

        } catch (error) {
          console.error(`❌ Erro ao processar caixa ${i + 1}:`, error);
          results.push({
            boxNumber: i + 1,
            success: false,
            error: error.message,
            prize: null
          });
        }
      }

      // Atualizar saldo final do usuário
      const saldoFinal = saldoAntes - totalCost + totalWon;
      
      try {
        if (isDemoAccount) {
          await prisma.user.update({
            where: { id: userId },
            data: { saldo_demo: saldoFinal }
          });
        } else {
          await prisma.user.update({
            where: { id: userId },
            data: { saldo_reais: saldoFinal }
          });
        }
        console.log('✅ Saldo final atualizado no banco de dados');
      } catch (dbError) {
        console.log('⚠️ Erro ao atualizar saldo final:', dbError.message);
      }

      // Registrar transações
      try {
        // Transação de débito total
        await prisma.transaction.create({
          data: {
            user_id: userId,
            tipo: 'abertura_caixa',
            valor: -totalCost,
            status: 'concluido',
            descricao: `Abertura de ${quantity} caixas ${caseData.nome}`
          }
        });

        // Transação de crédito total (se houver prêmios)
        if (totalWon > 0) {
          await prisma.transaction.create({
            data: {
              user_id: userId,
              tipo: 'premio',
              valor: totalWon,
              status: 'concluido',
              descricao: `Prêmios ganhos em ${quantity} caixas ${caseData.nome}`
            }
          });
        }
        console.log('✅ Transações registradas');
      } catch (dbError) {
        console.log('⚠️ Erro ao registrar transações:', dbError.message);
      }

      console.log('✅ Compra múltipla concluída');
      console.log('💰 Total gasto:', totalCost);
      console.log('🎁 Total ganho:', totalWon);
      console.log('📊 Resultados:', results.length);

      res.json({
        success: true,
        message: `Você abriu ${quantity} caixas!`,
        totalCost: totalCost,
        totalWon: totalWon,
        netResult: totalWon - totalCost,
        results: results,
        userBalance: saldoFinal
      });

    } catch (error) {
      console.error('❌ Erro em buyMultipleCases:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Listar todas as caixas disponíveis
  async getCases(req, res) {
    try {
      const cases = await prisma.case.findMany({
        where: { ativo: true },
        include: {
          prizes: {
            where: {
              ativo: true
            },
            select: {
              id: true,
              nome: true,
              valor: true,
              probabilidade: true,
              imagem: true
            }
          }
        },
        orderBy: { preco: 'asc' }
      });

      res.json({ 
        success: true,
        data: cases 
      });
    } catch (error) {
      console.error('Erro ao buscar caixas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Buscar detalhes de uma caixa específica
  async getCaseById(req, res) {
    try {
      const { id } = req.params;

      const caseData = await prisma.case.findUnique({
        where: { id: id },
        include: {
          prizes: {
            select: {
              id: true,
              nome: true,
              valor: true,
              probabilidade: true
            },
            orderBy: { valor: 'desc' }
          }
        }
      });

      if (!caseData) {
        return res.status(404).json({ error: 'Caixa não encontrada' });
      }

      if (!caseData.ativo) {
        return res.status(400).json({ error: 'Esta caixa não está disponível' });
      }

      res.json({
        success: true,
        data: caseData
      });
    } catch (error) {
      console.error('Erro ao buscar caixa:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = CompraController;
