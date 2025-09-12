/**
 * Script para adicionar endpoint de criação de contas de teste
 * Este código deve ser adicionado ao backend em produção
 */

const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const router = express.Router();
const prisma = new PrismaClient();

// Endpoint para criar contas de teste (apenas para desenvolvimento)
router.post('/create-test-accounts', async (req, res) => {
  try {
    console.log('🔧 Criando contas de teste...');

    // 1. Contas Admin
    const adminAccounts = [
      { nome: 'Admin Test', email: 'admin@test.com', senha: 'admin123', cpf: '00000000001' },
      { nome: 'Eduarda', email: 'eduarda@admin.com', senha: 'paineladm@', cpf: '00000000002' }
    ];

    // 2. Contas Demo
    const demoAccounts = [
      { nome: 'João Demo', email: 'joao@demo.com', senha: 'demo123', cpf: '11111111111' },
      { nome: 'Maria Demo', email: 'maria@demo.com', senha: 'demo123', cpf: '11111111112' },
      { nome: 'Pedro Demo', email: 'pedro@demo.com', senha: 'demo123', cpf: '11111111113' }
    ];

    const createdAccounts = [];

    // Criar contas admin
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
      
      createdAccounts.push({
        tipo: 'admin',
        email: admin.email,
        senha: adminData.senha,
        saldo: admin.saldo_reais
      });
    }

    // Criar contas demo
    const demoPassword = await bcrypt.hash('demo123', 12);
    
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
      
      createdAccounts.push({
        tipo: 'demo',
        email: demo.email,
        senha: 'demo123',
        saldo_demo: demo.saldo_demo
      });
    }

    res.json({
      success: true,
      message: 'Contas de teste criadas com sucesso!',
      accounts: createdAccounts
    });

  } catch (error) {
    console.error('❌ Erro ao criar contas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

module.exports = router;
