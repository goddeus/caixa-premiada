/**
 * Script para recriar as caixas essenciais
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createEssentialCases() {
  console.log('📦 Recriando caixas essenciais...\n');

  try {
    // Caixas principais com valores corretos
    const cases = [
      {
        nome: 'CAIXA FINAL DE SEMANA',
        preco: 1.50,
        imagem_url: './imagens/fim de semana premiado.png',
        ativo: true
      },
      {
        nome: 'CAIXA KIT NIKE',
        preco: 2.50,
        imagem_url: './imagens/nike.png',
        ativo: true
      },
      {
        nome: 'CAIXA SAMSUNG',
        preco: 3.00,
        imagem_url: './imagens/caixa samsung.png',
        ativo: true
      },
      {
        nome: 'CAIXA CONSOLE DOS SONHOS',
        preco: 3.50,
        imagem_url: './imagens/console.png',
        ativo: true
      },
      {
        nome: 'CAIXA APPLE',
        preco: 7.00,
        imagem_url: './imagens/caixa apple.png',
        ativo: true
      },
      {
        nome: 'CAIXA PREMIUM MASTER',
        preco: 15.00,
        imagem_url: './imagens/caixa premium.png',
        ativo: true
      }
    ];

    for (const caseData of cases) {
      const existingCase = await prisma.case.findFirst({
        where: { nome: caseData.nome }
      });

      if (!existingCase) {
        const newCase = await prisma.case.create({
          data: caseData
        });
        console.log(`✅ Caixa criada: ${newCase.nome} - R$ ${newCase.preco}`);

        // Criar prêmios básicos para cada caixa
        const basicPrizes = [
          {
            case_id: newCase.id,
            valor: 2.00,
            valor_reais: 2.00,
            probabilidade: 40.0,
            nome: 'R$ 2,00',
            imagem_url: './imagens/CAIXA CONSOLE DOS SONHOS/2reais.png',
            tipo: 'cash',
            ativo: true,
            sorteavel: true
          },
          {
            case_id: newCase.id,
            valor: 5.00,
            valor_reais: 5.00,
            probabilidade: 30.0,
            nome: 'R$ 5,00',
            imagem_url: './imagens/CAIXA CONSOLE DOS SONHOS/5reais.png',
            tipo: 'cash',
            ativo: true,
            sorteavel: true
          },
          {
            case_id: newCase.id,
            valor: 10.00,
            valor_reais: 10.00,
            probabilidade: 20.0,
            nome: 'R$ 10,00',
            imagem_url: './imagens/CAIXA CONSOLE DOS SONHOS/10reais.png',
            tipo: 'cash',
            ativo: true,
            sorteavel: true
          },
          {
            case_id: newCase.id,
            valor: 500.00,
            valor_reais: 500.00,
            probabilidade: 9.0,
            nome: 'R$ 500,00',
            imagem_url: './imagens/CAIXA PREMIUM MASTER/500.webp',
            tipo: 'cash',
            ativo: true,
            sorteavel: true
          },
          {
            case_id: newCase.id,
            valor: 5000.00,
            valor_reais: 0.00, // Ilustrativo
            probabilidade: 1.0,
            nome: 'iPhone 16 Pro Max',
            imagem_url: './imagens/CAIXA APPLE/iphone 16 pro max.png',
            tipo: 'ilustrativo',
            ilustrativo: true,
            ativo: true,
            sorteavel: true
          }
        ];

        for (const prize of basicPrizes) {
          await prisma.prize.create({ data: prize });
        }
        console.log(`  └─ ${basicPrizes.length} prêmios criados`);
      } else {
        console.log(`⚠️ Caixa já existe: ${existingCase.nome}`);
      }
    }

    console.log('\n✅ Caixas e prêmios criados com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar caixas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  createEssentialCases();
}

module.exports = { createEssentialCases };
