/**
 * Script para criar contas de teste no banco de produção
 * Este script deve ser executado no ambiente de produção
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createProductionAccounts() {
  console.log('🔧 Criando contas de teste no banco de produção...\n');

  try {
    // 1. CONTAS ADMIN
    console.log('👑 Criando contas admin...');
    
    const adminAccounts = [
      { nome: 'Eduarda', email: 'eduarda@admin.com', senha: 'paineladm@', cpf: '00000000001' },
      { nome: 'Junior', email: 'junior@admin.com', senha: 'paineladm@', cpf: '00000000002' }
    ];

    for (const adminData of adminAccounts) {
      const adminPassword = await bcrypt.hash(adminData.senha, 12);
      
      const admin = await prisma.user.upsert({
        where: { email: adminData.email },
        update: {
          saldo_reais: 10000.00,
          senha_hash: adminPassword,
          is_admin: true,
          ativo: true
        },
        create: {
          nome: adminData.nome,
          email: adminData.email,
          senha_hash: adminPassword,
          cpf: adminData.cpf,
          saldo_reais: 10000.00,
          saldo_demo: 0,
          is_admin: true,
          tipo_conta: 'normal',
          ativo: true,
          primeiro_deposito_feito: true,
          rollover_liberado: true,
          rollover_minimo: 0
        }
      });
      console.log(`✅ Admin criado/atualizado: ${admin.email} - Saldo: R$ ${admin.saldo_reais}`);
    }

    // 2. CONTAS DEMO
    console.log('\n🎭 Criando contas demo...');
    
    const demoAccounts = [
      { nome: 'João Ferreira', email: 'joao.ferreira@test.com', cpf: '11111111111' },
      { nome: 'Lucas Almeida', email: 'lucas.almeida@test.com', cpf: '11111111112' },
      { nome: 'Pedro Henrique', email: 'pedro.henrique@test.com', cpf: '11111111113' },
      { nome: 'Rafael Costa', email: 'rafael.costa@test.com', cpf: '11111111114' },
      { nome: 'Bruno Martins', email: 'bruno.martins@test.com', cpf: '11111111115' },
      { nome: 'Diego Oliveira', email: 'diego.oliveira@test.com', cpf: '11111111116' },
      { nome: 'Matheus Rocha', email: 'matheus.rocha@test.com', cpf: '11111111117' },
      { nome: 'Thiago Mendes', email: 'thiago.mendes@test.com', cpf: '11111111118' },
      { nome: 'Felipe Carvalho', email: 'felipe.carvalho@test.com', cpf: '11111111119' },
      { nome: 'Gustavo Lima', email: 'gustavo.lima@test.com', cpf: '11111111120' },
      { nome: 'André Pereira', email: 'andre.pereira@test.com', cpf: '11111111121' },
      { nome: 'Rodrigo Santos', email: 'rodrigo.santos@test.com', cpf: '11111111122' },
      { nome: 'Marcelo Nunes', email: 'marcelo.nunes@test.com', cpf: '11111111123' },
      { nome: 'Vinícius Araújo', email: 'vinicius.araujo@test.com', cpf: '11111111124' },
      { nome: 'Eduardo Ramos', email: 'eduardo.ramos@test.com', cpf: '11111111125' }
    ];

    const demoPassword = await bcrypt.hash('Afiliado@123', 12);

    for (const demoData of demoAccounts) {
      const demo = await prisma.user.upsert({
        where: { email: demoData.email },
        update: {
          saldo_demo: 100.00,
          senha_hash: demoPassword,
          tipo_conta: 'afiliado_demo',
          ativo: true
        },
        create: {
          nome: demoData.nome,
          email: demoData.email,
          senha_hash: demoPassword,
          cpf: demoData.cpf,
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
      console.log(`✅ Demo criado/atualizado: ${demo.email} - Saldo Demo: R$ ${demo.saldo_demo}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 CONTAS DE PRODUÇÃO CRIADAS COM SUCESSO!');
    console.log('='.repeat(60));
    
    console.log('\n📋 CREDENCIAIS DE ACESSO:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                       ADMINS                            │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email: eduarda@admin.com                                │');
    console.log('│ Senha: paineladm@                                       │');
    console.log('│ Saldo: R$ 10.000,00                                     │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email: junior@admin.com                                 │');
    console.log('│ Senha: paineladm@                                       │');
    console.log('│ Saldo: R$ 10.000,00                                     │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│                    CONTAS DEMO                          │');
    console.log('│                 (15 contas criadas)                     │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Exemplos:                                               │');
    console.log('│ • joao.ferreira@test.com / Afiliado@123                 │');
    console.log('│ • lucas.almeida@test.com / Afiliado@123                 │');
    console.log('│ • pedro.henrique@test.com / Afiliado@123                │');
    console.log('│ ... (todas com R$ 100 demo)                            │');
    console.log('│                                                         │');
    console.log('│ Tipo: Afiliado Demo (RTP 70%)                           │');
    console.log('│ Saldo Demo: R$ 100,00 cada                              │');
    console.log('└─────────────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Erro ao criar contas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createProductionAccounts();
