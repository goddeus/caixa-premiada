const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function debugAuth() {
  try {
    console.log('🔍 DEBUG AUTENTICAÇÃO - VERIFICANDO TOKEN');
    console.log('==================================================');

    // 1. Simular login do usuário junior
    console.log('1. Simulando login do usuário junior...');
    
    const usuario = await prisma.user.findUnique({
      where: { email: 'junior@admin.com' },
      select: { 
        id: true,
        nome: true, 
        email: true, 
        saldo: true,
        tipo_conta: true,
        is_admin: true
      }
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado');
      return;
    }

    console.log('👤 Usuário encontrado:');
    console.log(`   Nome: ${usuario.nome}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Saldo: R$ ${parseFloat(usuario.saldo).toFixed(2)}`);
    console.log(`   Tipo: ${usuario.tipo_conta}`);
    console.log(`   Admin: ${usuario.is_admin}`);
    console.log('');

    // 2. Gerar token JWT
    const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';
    const token = jwt.sign(
      { 
        userId: usuario.id,
        email: usuario.email,
        isAdmin: usuario.is_admin
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🔑 Token gerado:');
    console.log(`   Token: ${token.substring(0, 50)}...`);
    console.log('');

    // 3. Decodificar token
    console.log('🔍 Decodificando token...');
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('   Decoded:', decoded);
    console.log('');

    // 4. Simular autenticação no middleware
    console.log('🔍 Simulando autenticação no middleware...');
    
    // Buscar usuário pelo ID do token
    const userFromToken = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        id: true,
        nome: true, 
        email: true, 
        saldo: true,
        tipo_conta: true,
        is_admin: true
      }
    });

    if (userFromToken) {
      console.log('✅ Usuário encontrado pelo token:');
      console.log(`   Nome: ${userFromToken.nome}`);
      console.log(`   Email: ${userFromToken.email}`);
      console.log(`   Saldo: R$ ${parseFloat(userFromToken.saldo).toFixed(2)}`);
      console.log(`   Tipo: ${userFromToken.tipo_conta}`);
      console.log(`   Admin: ${userFromToken.is_admin}`);
      
      // Verificar se é conta demo
      if (userFromToken.tipo_conta === 'afiliado_demo') {
        console.log('❌ PROBLEMA: Usuário está sendo tratado como demo!');
      } else {
        console.log('✅ Usuário está sendo tratado como normal');
      }
    } else {
      console.log('❌ Usuário não encontrado pelo token');
    }

    // 5. Verificar se há problema no centralizedDrawService
    console.log('\n🔍 TESTANDO CENTRALIZEDDRAWSERVICE COM TOKEN:');
    console.log('----------------------------------------------');
    
    const centralizedDrawService = require('./src/services/centralizedDrawService');
    
    // Buscar CAIXA FINAL DE SEMANA
    const caixaWeekend = await prisma.case.findFirst({
      where: { 
        nome: 'CAIXA FINAL DE SEMANA',
        ativo: true 
      },
      select: { id: true, nome: true, preco: true }
    });

    if (caixaWeekend) {
      console.log(`📦 Testando com: ${caixaWeekend.nome} (R$ ${caixaWeekend.preco})`);
      
      const resultado = await centralizedDrawService.sortearPremio(caixaWeekend.id, userFromToken.id);
      
      console.log('📦 Resultado do centralizedDrawService:');
      console.log(`   Success: ${resultado.success}`);
      console.log(`   Is Demo: ${resultado.is_demo || false}`);
      console.log(`   UserBalance: R$ ${resultado.userBalance || 'N/A'}`);
      console.log(`   Prize: ${resultado.prize?.nome || 'N/A'}`);
      
      if (resultado.is_demo) {
        console.log('❌ PROBLEMA: Sistema está retornando is_demo: true!');
        console.log('💡 Isso explica por que o frontend não está debitando');
      } else {
        console.log('✅ Sistema está retornando is_demo: false');
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAuth();
