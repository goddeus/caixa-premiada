/**
 * Script para atualizar saldo demo das contas
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateDemoBalances() {
  console.log('🔧 Atualizando saldos demo...\n');

  try {
    // Lista de emails das contas demo
    const demoEmails = [
      'joao.ferreira@test.com',
      'lucas.almeida@test.com',
      'pedro.henrique@test.com',
      'rafael.costa@test.com',
      'bruno.martins@test.com',
      'diego.oliveira@test.com',
      'matheus.rocha@test.com',
      'thiago.mendes@test.com',
      'felipe.carvalho@test.com',
      'gustavo.lima@test.com',
      'andre.pereira@test.com',
      'rodrigo.santos@test.com',
      'marcelo.nunes@test.com',
      'vinicius.araujo@test.com',
      'eduardo.ramos@test.com'
    ];

    const demoPassword = await bcrypt.hash('Afiliado@123', 12);

    for (const email of demoEmails) {
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          saldo_demo: 100.00,
          senha_hash: demoPassword,
          tipo_conta: 'afiliado_demo',
          ativo: true
        },
        create: {
          nome: email.split('@')[0].replace('.', ' '),
          email,
          senha_hash: demoPassword,
          cpf: '00000000000',
          saldo_reais: 0,
          saldo_demo: 100.00,
          is_admin: false,
          tipo_conta: 'afiliado_demo',
          ativo: true,
          primeiro_deposito_feito: false,
          rollover_liberado: false,
          rollover_minimo: 20.00
        }
      });
      
      console.log(`✅ ${email} - Saldo Demo: R$ ${user.saldo_demo.toFixed(2)}`);
    }

    console.log('\n🎉 Todos os saldos demo foram atualizados para R$ 100,00!');

  } catch (error) {
    console.error('❌ Erro ao atualizar saldos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateDemoBalances();
