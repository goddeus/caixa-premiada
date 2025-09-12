/**
 * Script para criar contas de teste via API
 * Este script pode ser executado localmente e vai criar as contas no banco de produção
 */

const axios = require('axios');

const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

async function createTestAccounts() {
  console.log('🔧 Criando contas de teste via API...\n');

  try {
    // 1. Criar conta admin
    console.log('👑 Criando conta admin...');
    
    const adminData = {
      nome: 'Admin Test',
      email: 'admin@test.com',
      senha: 'admin123',
      cpf: '00000000001',
      tipo_conta: 'admin'
    };

    try {
      const adminResponse = await axios.post(`${API_BASE_URL}/auth/register`, adminData);
      console.log('✅ Admin criado:', adminResponse.data);
    } catch (error) {
      if (error.response?.data?.message?.includes('já cadastrado')) {
        console.log('ℹ️ Admin já existe');
      } else {
        console.log('❌ Erro ao criar admin:', error.response?.data?.message);
      }
    }

    // 2. Criar contas demo
    console.log('\n🎭 Criando contas demo...');
    
    const demoAccounts = [
      { nome: 'João Test', email: 'joao@demo.com', senha: 'demo123', cpf: '11111111111' },
      { nome: 'Maria Test', email: 'maria@demo.com', senha: 'demo123', cpf: '11111111112' },
      { nome: 'Pedro Test', email: 'pedro@demo.com', senha: 'demo123', cpf: '11111111113' }
    ];

    for (const demoData of demoAccounts) {
      try {
        const demoResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
          ...demoData,
          tipo_conta: 'demo'
        });
        console.log(`✅ Demo criado: ${demoData.email}`);
      } catch (error) {
        if (error.response?.data?.message?.includes('já cadastrado')) {
          console.log(`ℹ️ ${demoData.email} já existe`);
        } else {
          console.log(`❌ Erro ao criar ${demoData.email}:`, error.response?.data?.message);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('🎉 PROCESSO CONCLUÍDO!');
    console.log('='.repeat(60));
    
    console.log('\n📋 CREDENCIAIS DE TESTE:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                       ADMIN                             │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email: admin@test.com                                   │');
    console.log('│ Senha: admin123                                         │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│                    CONTAS DEMO                          │');
    console.log('│ • joao@demo.com / demo123                               │');
    console.log('│ • maria@demo.com / demo123                              │');
    console.log('│ • pedro@demo.com / demo123                              │');
    console.log('└─────────────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

createTestAccounts();
