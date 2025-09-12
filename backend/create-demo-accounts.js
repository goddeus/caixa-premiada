const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

/**
 * Script para criar contas demo com saldo de R$100,00
 */
async function createDemoAccounts() {
  console.log('🎭 CRIANDO CONTAS DEMO COM SALDO DE R$ 100,00');
  console.log('=' .repeat(60));

  const demoAccounts = [
    { nome: 'João Ferreira', email: 'joao.ferreira@test.com', username: 'joao_f', senha: 'Afiliado@123' },
    { nome: 'Lucas Almeida', email: 'lucas.almeida@test.com', username: 'lucasal', senha: 'Afiliado@123' },
    { nome: 'Pedro Henrique', email: 'pedro.henrique@test.com', username: 'pedroh', senha: 'Afiliado@123' },
    { nome: 'Rafael Costa', email: 'rafael.costa@test.com', username: 'rafa_c', senha: 'Afiliado@123' },
    { nome: 'Bruno Martins', email: 'bruno.martins@test.com', username: 'brunom', senha: 'Afiliado@123' },
    { nome: 'Diego Oliveira', email: 'diego.oliveira@test.com', username: 'diegoo', senha: 'Afiliado@123' },
    { nome: 'Matheus Rocha', email: 'matheus.rocha@test.com', username: 'matheusr', senha: 'Afiliado@123' },
    { nome: 'Thiago Mendes', email: 'thiago.mendes@test.com', username: 'thiagom', senha: 'Afiliado@123' },
    { nome: 'Felipe Carvalho', email: 'felipe.carvalho@test.com', username: 'felipec', senha: 'Afiliado@123' },
    { nome: 'Gustavo Lima', email: 'gustavo.lima@test.com', username: 'gustavol', senha: 'Afiliado@123' },
    { nome: 'André Pereira', email: 'andre.pereira@test.com', username: 'andrep', senha: 'Afiliado@123' },
    { nome: 'Rodrigo Santos', email: 'rodrigo.santos@test.com', username: 'rodrigos', senha: 'Afiliado@123' },
    { nome: 'Marcelo Nunes', email: 'marcelo.nunes@test.com', username: 'marcelon', senha: 'Afiliado@123' },
    { nome: 'Vinícius Araújo', email: 'vinicius.araujo@test.com', username: 'viniciusa', senha: 'Afiliado@123' },
    { nome: 'Eduardo Ramos', email: 'eduardo.ramos@test.com', username: 'eduardor', senha: 'Afiliado@123' }
  ];

  try {
    // Limpar contas demo existentes (opcional)
    console.log('🧹 Limpando contas demo existentes...');
    await prisma.transaction.deleteMany({
      where: {
        user: {
          email: {
            contains: '@test.com'
          }
        }
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@test.com'
        }
      }
    });

    console.log('✅ Contas demo existentes removidas');

    // Criar contas demo
    console.log('\n👥 Criando contas demo...');
    const createdUsers = [];

    for (const account of demoAccounts) {
      try {
        // Gerar CPF único para cada conta
        const cpf = generateUniqueCPF();
        
        // Hash da senha
        const senhaHash = await bcrypt.hash(account.senha, 10);

        // Criar usuário demo
        const user = await prisma.user.create({
          data: {
            nome: account.nome,
            email: account.email,
            senha_hash: senhaHash,
            cpf: cpf,
            saldo: 0.00, // Saldo real sempre 0 para contas demo
            saldo_demo: 100.00, // Saldo demo de R$ 100,00
            tipo_conta: 'afiliado_demo',
            ativo: true
          }
        });

        // Criar carteira (mesmo que não seja usada para contas demo)
        await prisma.wallet.create({
          data: {
            user_id: user.id,
            saldo: 0.00 // Carteira real sempre 0 para contas demo
          }
        });

        createdUsers.push({
          id: user.id,
          nome: user.nome,
          email: user.email,
          username: account.username,
          senha: account.senha,
          saldo_demo: user.saldo_demo
        });

        console.log(`✅ ${account.nome} (${account.email}) - Saldo Demo: R$ ${user.saldo_demo.toFixed(2)}`);

      } catch (error) {
        console.error(`❌ Erro ao criar ${account.nome}:`, error.message);
      }
    }

    // Relatório final
    console.log('\n📋 RELATÓRIO FINAL');
    console.log('=' .repeat(60));
    console.log(`✅ Contas demo criadas: ${createdUsers.length}/${demoAccounts.length}`);
    console.log(`💰 Saldo demo total: R$ ${(createdUsers.length * 100).toFixed(2)}`);
    
    console.log('\n🔑 CREDENCIAIS DE ACESSO:');
    console.log('-'.repeat(40));
    createdUsers.forEach(user => {
      console.log(`${user.nome.padEnd(20)} | ${user.email.padEnd(30)} | ${user.username.padEnd(12)} | ${user.senha}`);
    });

    console.log('\n📝 INFORMAÇÕES IMPORTANTES:');
    console.log('- Contas demo usam saldo_demo (R$ 100,00 cada)');
    console.log('- Não podem fazer saques ou depósitos reais');
    console.log('- RTP fixo de 70% para simulação');
    console.log('- Não afetam o caixa real da plataforma');
    console.log('- Podem abrir caixas usando o saldo demo');

    console.log('\n🎉 CONTAS DEMO CRIADAS COM SUCESSO!');

  } catch (error) {
    console.error('❌ Erro ao criar contas demo:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Gera um CPF único para as contas demo
 */
function generateUniqueCPF() {
  // Gerar CPF aleatório (apenas para contas demo)
  const cpf = Math.floor(Math.random() * 90000000000) + 10000000000;
  return cpf.toString();
}

// Executar script
if (require.main === module) {
  createDemoAccounts()
    .then(() => {
      console.log('\n✅ Script concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script falhou:', error);
      process.exit(1);
    });
}

module.exports = { createDemoAccounts };