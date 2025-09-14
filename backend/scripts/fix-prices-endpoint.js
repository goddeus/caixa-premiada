// Endpoint para corrigir preços das caixas
// Adicione este código ao seu arquivo de rotas do backend

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/admin/fix-case-prices - Corrigir preços das caixas
router.post('/fix-case-prices', authenticateToken, async (req, res) => {
  try {
    console.log('🔧 Corrigindo preços de todas as caixas...');
    
    const correctPrices = {
      'CAIXA FINAL DE SEMANA': 1.50,
      'CAIXA KIT NIKE': 2.50,
      'CAIXA SAMSUNG': 3.00,
      'CAIXA APPLE': 7.00,
      'CAIXA CONSOLE DOS SONHOS': 3.50,
      'CAIXA PREMIUM MASTER': 15.00
    };
    
    // Buscar todas as caixas
    const cases = await prisma.case.findMany({
      where: {
        ativo: true
      }
    });
    
    console.log('📦 Caixas encontradas:', cases.length);
    
    const results = [];
    
    for (const caseItem of cases) {
      const correctPrice = correctPrices[caseItem.nome];
      
      if (correctPrice && parseFloat(caseItem.preco) !== correctPrice) {
        console.log(`📝 Corrigindo: ${caseItem.nome} - R$ ${caseItem.preco} → R$ ${correctPrice}`);
        
        const updatedCase = await prisma.case.update({
          where: {
            id: caseItem.id
          },
          data: {
            preco: correctPrice
          }
        });
        
        results.push({
          nome: caseItem.nome,
          preco_anterior: parseFloat(caseItem.preco),
          preco_novo: correctPrice,
          status: 'corrigido'
        });
      } else if (correctPrice) {
        results.push({
          nome: caseItem.nome,
          preco_anterior: parseFloat(caseItem.preco),
          preco_novo: parseFloat(caseItem.preco),
          status: 'já_correto'
        });
      }
    }
    
    console.log('🎉 Correção de preços concluída!');
    
    res.json({
      success: true,
      message: 'Preços das caixas corrigidos com sucesso!',
      results: results
    });
    
  } catch (error) {
    console.error('❌ Erro ao corrigir preços:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

module.exports = router;
