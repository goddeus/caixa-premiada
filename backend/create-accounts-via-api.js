/**
 * Script para criar contas de teste via API do backend de produção
 * Execute este script localmente para criar contas no banco de produção
 */

const axios = require('axios');

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

async function createAccountsViaAPI() {
  console.log('🔧 Criando contas de teste via API do backend de produção...\n');

  try {
    // 1. CONTAS ADMIN
    console.log('👑 Criando contas admin...');
    
    const adminAccounts = [
      { nome: 'Eduarda', email: 'eduarda@admin.com', senha: 'paineladm@', cpf: '00000000001' },
      { nome: 'Junior', email: 'junior@admin.com', senha: 'paineladm@', cpf: '00000000002' }
    ];

    for (const adminData of adminAccounts) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
          nome: adminData.nome,
          email: adminData.email,
          senha: adminData.senha,
          cpf: adminData.cpf
        });
        console.log(`✅ Admin criado: ${adminData.email}`);
      } catch (error) {
        if (error.response?.data?.message?.includes('já cadastrado')) {
          console.log(`ℹ️ Admin ${adminData.email} já existe`);
        } else {
          console.log(`❌ Erro ao criar ${adminData.email}:`, error.response?.data?.message);
        }
      }
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

    for (const demoData of demoAccounts) {
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
          nome: demoData.nome,
          email: demoData.email,
          senha: 'Afiliado@123',
          cpf: demoData.cpf
        });
        console.log(`✅ Demo criado: ${demoData.email}`);
      } catch (error) {
        if (error.response?.data?.message?.includes('já cadastrado')) {
          console.log(`ℹ️ Demo ${demoData.email} já existe`);
        } else {
          console.log(`❌ Erro ao criar ${demoData.email}:`, error.response?.data?.message);
        }
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
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email: junior@admin.com                                 │');
    console.log('│ Senha: paineladm@                                       │');
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
  }
}

createAccountsViaAPI();
