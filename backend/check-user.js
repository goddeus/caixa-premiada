const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findFirst({
    where: { tipo_conta: 'normal' },
    select: { nome: true, email: true, senha: true }
  });
  
  console.log('Usuário:', user);
  await prisma.$disconnect();
}

checkUser();
