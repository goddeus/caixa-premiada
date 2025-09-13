const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔍 Testando login das contas...');

    // Testar conta admin Eduarda
    const eduarda = await prisma.user.findUnique({
      where: { email: 'eduarda@admin.com' },
      select: { id: true, nome: true, email: true, is_admin: true, saldo_reais: true, saldo_demo: true, tipo_conta: true }
    });

    if (eduarda) {
      console.log('✅ Admin Eduarda encontrada:', eduarda);
    } else {
      console.log('❌ Admin Eduarda não encontrada');
    }

    // Testar conta admin Junior
    const junior = await prisma.user.findUnique({
      where: { email: 'junior@admin.com' },
      select: { id: true, nome: true, email: true, is_admin: true, saldo_reais: true, saldo_demo: true, tipo_conta: true }
    });

    if (junior) {
      console.log('✅ Admin Junior encontrado:', junior);
    } else {
      console.log('❌ Admin Junior não encontrado');
    }

    // Testar conta de teste
    const contateste = await prisma.user.findUnique({
      where: { email: 'contatest@test.com' },
      select: { id: true, nome: true, email: true, is_admin: true, saldo_reais: true, saldo_demo: true, tipo_conta: true }
    });

    if (contateste) {
      console.log('✅ Conta de teste encontrada:', contateste);
    } else {
      console.log('❌ Conta de teste não encontrada');
    }

    console.log('\n🎉 Teste de login concluído!');

  } catch (error) {
    console.error('❌ Erro ao testar login:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
