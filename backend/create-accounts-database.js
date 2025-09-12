/**
 * Script para criar contas diretamente no banco PostgreSQL do Render
 * Conecta diretamente ao banco de produção
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Configuração do banco de produção
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://slotbox_user:IIVi8N0l6lzCaT72ueXeWdixJOFFRiZI@dpg-d31qva3ipnbc73cjkas0-a/slotbox_db"
    }
  }
});

async function createAccountsDirectly() {
  console.log('🔧 Conectando diretamente ao banco PostgreSQL do Render...\n');

  try {
    // 1. CONTAS ADMIN
    console.log('👑 Criando contas admin...');
    
    const adminPassword = await bcrypt.hash('paineladm@', 10);
    
    const adminAccounts = [
      { nome: 'Eduarda', email: 'eduarda@admin.com', cpf: '00000000001' },
      { nome: 'Junior', email: 'junior@admin.com', cpf: '00000000002' }
    ];

    for (const adminData of adminAccounts) {
      try {
        const admin = await prisma.user.upsert({
          where: { email: adminData.email },
          update: {
            nome: adminData.nome,
            senha_hash: adminPassword,
            cpf: adminData.cpf,
            is_admin: true,
            tipo_conta: 'admin',
            saldo_reais: 10000.00, // R$ 10.000,00
            saldo_demo: 100.00
          },
          create: {
            nome: adminData.nome,
            email: adminData.email,
            senha_hash: adminPassword,
            cpf: adminData.cpf,
            is_admin: true,
            tipo_conta: 'admin',
            saldo_reais: 10000.00, // R$ 10.000,00
            saldo_demo: 100.00,
            email_verificado: true,
            data_cadastro: new Date(),
            ultimo_acesso: new Date()
          }
        });
        console.log(`✅ Admin criado: ${adminData.email}`);
      } catch (error) {
        console.log(`❌ Erro ao criar ${adminData.email}:`, error.message);
      }
    }

    // 2. CONTAS DEMO
    console.log('\n🎭 Criando contas demo...');
    
    const demoPassword = await bcrypt.hash('Afiliado@123', 10);
    
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

    for (const demoData of demoAccounts) {
      try {
        const demo = await prisma.user.upsert({
          where: { email: demoData.email },
          update: {
            nome: demoData.nome,
            senha_hash: demoPassword,
            cpf: demoData.cpf,
            saldo_demo: 100.00 // Sempre R$ 100,00 demo
          },
          create: {
            nome: demoData.nome,
            email: demoData.email,
            senha_hash: demoPassword,
            cpf: demoData.cpf,
            is_admin: false,
            tipo_conta: 'demo',
            saldo_reais: 0.00,
            saldo_demo: 100.00, // R$ 100,00 demo
            email_verificado: true,
            data_cadastro: new Date(),
            ultimo_acesso: new Date()
          }
        });
        console.log(`✅ Demo criado: ${demoData.email}`);
      } catch (error) {
        console.log(`❌ Erro ao criar ${demoData.email}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 PROCESSO CONCLUÍDO!');
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
    console.log('│ • joao.ferreira@test.com / Afiliado@123                 │');
    console.log('│ • lucas.almeida@test.com / Afiliado@123                 │');
    console.log('│ • pedro.henrique@test.com / Afiliado@123                │');
    console.log('│ • eduardo.ramos@test.com / Afiliado@123                 │');
    console.log('│ ... (todas com R$ 100 demo)                            │');
    console.log('└─────────────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAccountsDirectly();
