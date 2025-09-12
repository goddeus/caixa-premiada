const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const SorteioEngine = require('./sorteioEngine');

const prisma = new PrismaClient();

/**
 * Serviço para compra de caixas com fluxo transacional completo
 * Implementação exata conforme especificação do prompt
 */
class BuyCaseService {
  
  /**
   * Fluxo principal de compra de caixas
   * @param {Object} params - { userId, caixaId, quantidade, purchaseId }
   * @returns {Object} - { totalDebitado, somaPremios, premiosDetalhe }
   */
  static async buyCase({ userId, caixaId, quantidade = 1, purchaseId = null }) {
    // Gerar purchaseId único se não fornecido (idempotência)
    if (!purchaseId) {
      purchaseId = `purchase_${uuidv4()}_${Date.now()}`;
    }
    
    // Verificar se já existe compra com este purchaseId
    const existingPurchase = await prisma.purchaseAudit.findUnique({
      where: { purchase_id: purchaseId }
    });
    
    if (existingPurchase) {
      // Retornar resultado da compra existente (idempotência)
      return {
        totalDebitado: existingPurchase.total_preco,
        somaPremios: existingPurchase.soma_premios,
        premiosDetalhe: JSON.parse(existingPurchase.premios_detalhados || '[]'),
        isIdempotent: true
      };
    }
    
    // Iniciar transação
    return await prisma.$transaction(async (tx) => {
      try {
        // 1. Buscar usuário com lock
        const user = await tx.user.findUnique({
          where: { id: userId },
          // Note: SQLite não suporta FOR UPDATE, mas Prisma simula com transação
        });
        
        if (!user) {
          throw new Error('Usuário não encontrado');
        }
        
        // 2. Buscar caixa
        const caixa = await tx.case.findUnique({
          where: { id: caixaId }
        });
        
        if (!caixa || !caixa.ativo) {
          throw new Error('Caixa não encontrada ou inativa');
        }
        
        // 3. Calcular preços
        const precoUnit = Number(caixa.preco);
        const totalPreco = Number((precoUnit * quantidade).toFixed(2));
        
        // 4. Verificar saldo e debitar baseado no tipo de conta
        let saldoAntes, saldoDepois;
        
        if (user.tipo_conta === 'afiliado_demo') {
          // Conta demo - usar saldo_demo
          saldoAntes = Number(user.saldo_demo);
          
          if (saldoAntes < totalPreco) {
            throw new Error('Saldo demo insuficiente');
          }
          
          // Debitar saldo demo
          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: { saldo_demo: saldoAntes - totalPreco }
          });
          
          saldoDepois = Number(updatedUser.saldo_demo);
          
          // Registrar transação demo
          await tx.transactionDemo.create({
            data: {
              user_id: userId,
              tipo: 'abertura_caixa',
              valor: -totalPreco,
              nota: `Abertura de ${quantidade}x caixa ${caixa.nome}`
            }
          });
          
        } else {
          // Conta normal - usar saldo_reais
          saldoAntes = Number(user.saldo_reais);
          
          if (saldoAntes < totalPreco) {
            throw new Error('Saldo insuficiente');
          }
          
          // Debitar saldo real
          const updatedUser = await tx.user.update({
            where: { id: userId },
            data: { saldo_reais: saldoAntes - totalPreco }
          });
          
          saldoDepois = Number(updatedUser.saldo_reais);
          
          // Registrar transação real
          await tx.transaction.create({
            data: {
              user_id: userId,
              tipo: 'abertura_caixa',
              valor: -totalPreco,
              status: 'pendente',
              descricao: `Abertura de ${quantidade}x caixa ${caixa.nome}`,
              case_id: caixaId
            }
          });
        }
        
        // 5. Buscar sessão ativa do usuário (se existir)
        const sessionAtiva = await tx.userSession.findFirst({
          where: {
            user_id: userId,
            ativo: true
          },
          orderBy: { criado_em: 'desc' }
        });
        
        // 6. Processar aberturas (loop de sorteios)
        let somaPremios = 0;
        const premiosDetalhe = [];
        
        for (let i = 1; i <= quantidade; i++) {
          try {
            // Sortear prêmio usando o motor de sorteio
            const draw = await SorteioEngine.sortearPremioTx({
              tx,
              caixaId,
              userId,
              sessionId: sessionAtiva?.id || null
            });
            
            if (draw.result === 'PAID' && draw.prize) {
              // Prêmio pago - creditar valor
              const valorPremio = Number(draw.prize.valor_reais || draw.prize.valor);
              
              if (user.tipo_conta === 'afiliado_demo') {
                // Creditar no saldo demo
                await tx.user.update({
                  where: { id: userId },
                  data: { saldo_demo: { increment: valorPremio } }
                });
                
                // Registrar transação demo
                await tx.transactionDemo.create({
                  data: {
                    user_id: userId,
                    tipo: 'premio',
                    valor: valorPremio,
                    nota: `Prêmio: ${draw.prize.nome || 'Prêmio'}`
                  }
                });
                
              } else {
                // Creditar no saldo real
                await tx.user.update({
                  where: { id: userId },
                  data: { saldo_reais: { increment: valorPremio } }
                });
                
                // Registrar transação real
                await tx.transaction.create({
                  data: {
                    user_id: userId,
                    tipo: 'premio',
                    valor: valorPremio,
                    status: 'concluido',
                    descricao: `Prêmio: ${draw.prize.nome || 'Prêmio'}`,
                    case_id: caixaId,
                    prize_id: draw.prize.id
                  }
                });
              }
              
              somaPremios += valorPremio;
              premiosDetalhe.push({
                prizeId: draw.prize.id,
                nome: draw.prize.nome,
                valor: valorPremio,
                tipo: 'paid',
                imagem_url: draw.prize.imagem_url
              });
              
              // Atualizar sessão se existir
              if (sessionAtiva) {
                await tx.userSession.update({
                  where: { id: sessionAtiva.id },
                  data: {
                    valor_premios_recebidos: { increment: valorPremio },
                    valor_gasto_caixas: { increment: precoUnit }
                  }
                });
              }
              
            } else {
              // Prêmio ilustrativo
              const uiPrize = draw.uiPrize;
              
              premiosDetalhe.push({
                illustrative: true,
                nome: uiPrize?.nome || 'Prêmio Especial',
                valor: uiPrize?.valor || 0,
                tipo: 'illustrative',
                imagem_url: uiPrize?.imagem_url
              });
              
              // Log de transação visual
              if (user.tipo_conta === 'afiliado_demo') {
                await tx.transactionDemo.create({
                  data: {
                    user_id: userId,
                    tipo: 'premio_visual',
                    valor: 0,
                    nota: `Prêmio visual: ${uiPrize?.nome || 'Prêmio'}`
                  }
                });
              } else {
                await tx.transaction.create({
                  data: {
                    user_id: userId,
                    tipo: 'premio_visual',
                    valor: 0,
                    status: 'concluido',
                    descricao: `Prêmio visual: ${uiPrize?.nome || 'Prêmio'}`,
                    case_id: caixaId
                  }
                });
              }
            }
            
          } catch (drawError) {
            console.error(`Erro no sorteio ${i}/${quantidade}:`, drawError);
            
            // Em caso de erro, adicionar prêmio ilustrativo como fallback
            premiosDetalhe.push({
              illustrative: true,
              nome: 'Prêmio Especial',
              valor: 0,
              tipo: 'error_fallback',
              erro: drawError.message
            });
          }
        }
        
        // 7. Finalizar audit
        const purchaseAudit = await tx.purchaseAudit.create({
          data: {
            purchase_id: purchaseId,
            idempotency_key: `${userId}_${caixaId}_${Date.now()}`,
            user_id: userId,
            session_id: sessionAtiva?.id || null,
            caixas_compradas: JSON.stringify([{
              caixaId,
              nome: caixa.nome,
              quantidade,
              preco: precoUnit
            }]),
            total_preco: totalPreco,
            soma_premios: somaPremios,
            saldo_antes: saldoAntes,
            saldo_depois: saldoDepois,
            status: 'concluido',
            tipo_conta: user.tipo_conta,
            premios_detalhados: JSON.stringify(premiosDetalhe)
          }
        });
        
        // 8. Atualizar status das transações para concluído
        if (user.tipo_conta !== 'afiliado_demo') {
          await tx.transaction.updateMany({
            where: {
              user_id: userId,
              tipo: 'abertura_caixa',
              status: 'pendente',
              created_at: { gte: new Date(Date.now() - 60000) } // últimos 60 segundos
            },
            data: { status: 'concluido' }
          });
        }
        
        console.log(`✅ Compra concluída: ${purchaseId} - Total: R$ ${totalPreco} - Prêmios: R$ ${somaPremios}`);
        
        return {
          totalDebitado: totalPreco,
          somaPremios,
          premiosDetalhe,
          purchaseAuditId: purchaseAudit.id
        };
        
      } catch (error) {
        console.error('Erro na compra de caixa:', error);
        
        // Registrar erro na auditoria
        try {
          await tx.purchaseAudit.create({
            data: {
              purchase_id: purchaseId,
              user_id: userId,
              caixas_compradas: JSON.stringify([{ caixaId, quantidade, erro: true }]),
              total_preco: 0,
              soma_premios: 0,
              saldo_antes: 0,
              saldo_depois: 0,
              status: 'erro',
              tipo_conta: 'unknown',
              erro_detalhes: error.message
            }
          });
        } catch (auditError) {
          console.error('Erro ao registrar audit de erro:', auditError);
        }
        
        throw error;
      }
    });
  }
  
  /**
   * Verificar se usuário pode fazer compras
   */
  static async canUserPurchase(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user || !user.ativo) {
      return { can: false, reason: 'Usuário não encontrado ou inativo' };
    }
    
    if (user.banido_em) {
      return { can: false, reason: 'Usuário banido' };
    }
    
    return { can: true };
  }
  
  /**
   * Buscar histórico de compras do usuário
   */
  static async getUserPurchaseHistory(userId, limit = 50) {
    return await prisma.purchaseAudit.findMany({
      where: { user_id: userId },
      orderBy: { criado_em: 'desc' },
      take: limit
    });
  }
}

module.exports = BuyCaseService;


