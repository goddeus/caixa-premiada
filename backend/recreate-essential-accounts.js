/**
 * Script para recriar contas essenciais no banco de produção
 * - Admin
 * - Contas demo
 * - Contas de teste
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { createEssentialCases } = require('./recreate-cases');

const prisma = new PrismaClient();

async function createEssentialAccounts() {
  console.log('🔧 Recriando contas essenciais...\n');

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
        update: {},
        create: {
          nome: adminData.nome,
          email: adminData.email,
          senha_hash: adminPassword,
          cpf: adminData.cpf,
          saldo_reais: 10000.00, // R$ 10.000 para testes admin
          saldo_demo: 0,
          is_admin: true,
          tipo_conta: 'normal',
          ativo: true,
          primeiro_deposito_feito: true,
          rollover_liberado: true,
          rollover_minimo: 0
        }
      });
      console.log(`✅ Admin criado: ${admin.email}`);
    }

    // 2. CONTAS DEMO (Afiliados Demo com R$ 100 cada)
    console.log('\n🎭 Criando contas demo...');
    
    const demoAccounts = [
      { nome: 'João Ferreira', email: 'joao.ferreira@test.com', usuario: 'joao_f', cpf: '11111111111' },
      { nome: 'Lucas Almeida', email: 'lucas.almeida@test.com', usuario: 'lucasal', cpf: '11111111112' },
      { nome: 'Pedro Henrique', email: 'pedro.henrique@test.com', usuario: 'pedroh', cpf: '11111111113' },
      { nome: 'Rafael Costa', email: 'rafael.costa@test.com', usuario: 'rafa_c', cpf: '11111111114' },
      { nome: 'Bruno Martins', email: 'bruno.martins@test.com', usuario: 'brunom', cpf: '11111111115' },
      { nome: 'Diego Oliveira', email: 'diego.oliveira@test.com', usuario: 'diegoo', cpf: '11111111116' },
      { nome: 'Matheus Rocha', email: 'matheus.rocha@test.com', usuario: 'matheusr', cpf: '11111111117' },
      { nome: 'Thiago Mendes', email: 'thiago.mendes@test.com', usuario: 'thiagom', cpf: '11111111118' },
      { nome: 'Felipe Carvalho', email: 'felipe.carvalho@test.com', usuario: 'felipec', cpf: '11111111119' },
      { nome: 'Gustavo Lima', email: 'gustavo.lima@test.com', usuario: 'gustavol', cpf: '11111111120' },
      { nome: 'André Pereira', email: 'andre.pereira@test.com', usuario: 'andrep', cpf: '11111111121' },
      { nome: 'Rodrigo Santos', email: 'rodrigo.santos@test.com', usuario: 'rodrigos', cpf: '11111111122' },
      { nome: 'Marcelo Nunes', email: 'marcelo.nunes@test.com', usuario: 'marcelon', cpf: '11111111123' },
      { nome: 'Vinícius Araújo', email: 'vinicius.araujo@test.com', usuario: 'viniciusa', cpf: '11111111124' },
      { nome: 'Eduardo Ramos', email: 'eduardo.ramos@test.com', usuario: 'eduardor', cpf: '11111111125' }
    ];

    for (const demoData of demoAccounts) {
      const demoPassword = await bcrypt.hash('Afiliado@123', 12);
      
      const demo = await prisma.user.upsert({
        where: { email: demoData.email },
        update: {},
        create: {
          nome: demoData.nome,
          email: demoData.email,
          senha_hash: demoPassword,
          cpf: demoData.cpf,
          saldo_reais: 0, // Contas demo não usam saldo real
          saldo_demo: 100.00, // R$ 100 demo para cada
          is_admin: false,
          tipo_conta: 'afiliado_demo',
          ativo: true,
          primeiro_deposito_feito: false,
          rollover_liberado: false,
          rollover_minimo: 20.00
        }
      });
      console.log(`✅ Demo criado: ${demo.email} - R$ 100 demo`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 CONTAS ESSENCIAIS CRIADAS COM SUCESSO!');
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

    console.log('\n📦 Criando caixas e prêmios...');
    await createEssentialCases();

    console.log('\n⚙️ Configurando RTP do sistema...');
    // Configurar RTP fixo de 10% para contas normais
    await prisma.rTPConfig.upsert({
      where: { id: 'default' },
      update: { rtp_target: 10.0 },
      create: {
        id: 'default',
        rtp_target: 10.0,
        rtp_recommended: 10.0,
        updated_by: 'system'
      }
    });
    console.log('✅ RTP configurado: 10% para contas normais, 70% para demos');

    console.log('\n✅ Contas, perfis, caixas, prêmios e RTP criados com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar contas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  createEssentialAccounts();
}

module.exports = { createEssentialAccounts };
