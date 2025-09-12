const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function sincronizarSaldos() {
  try {
    console.log('🔧 SINCRONIZANDO SALDOS ENTRE USER E WALLET');
    console.log('==================================================');

    // 1. Buscar todos os usuários
    const usuarios = await prisma.user.findMany({
      select: { 
        id: true, 
        nome: true, 
        email: true, 
        saldo: true 
      }
    });

    console.log(`👥 Total de usuários: ${usuarios.length}\n`);

    let usuariosCorrigidos = 0;

    // 2. Verificar e corrigir cada usuário
    for (const usuario of usuarios) {
      console.log(`🔍 Verificando ${usuario.nome} (${usuario.email})...`);

      // Buscar wallet do usuário
      const wallet = await prisma.wallet.findUnique({
        where: { user_id: usuario.id },
        select: { saldo: true }
      });

      const saldoUser = parseFloat(usuario.saldo);
      const saldoWallet = wallet ? parseFloat(wallet.saldo) : 0;
      const diferenca = Math.abs(saldoUser - saldoWallet);

      console.log(`   Saldo User: R$ ${saldoUser.toFixed(2)}`);
      console.log(`   Saldo Wallet: R$ ${saldoWallet.toFixed(2)}`);
      console.log(`   Diferença: R$ ${diferenca.toFixed(2)}`);

      if (diferenca > 0.01) {
        console.log(`   ❌ INCONSISTÊNCIA DETECTADA - Corrigindo...`);
        
        // Usar o saldo da tabela User como referência (mais confiável)
        if (wallet) {
          await prisma.wallet.update({
            where: { user_id: usuario.id },
            data: { saldo: saldoUser }
          });
          console.log(`   ✅ Wallet atualizado para R$ ${saldoUser.toFixed(2)}`);
        } else {
          await prisma.wallet.create({
            data: { 
              user_id: usuario.id, 
              saldo: saldoUser 
            }
          });
          console.log(`   ✅ Wallet criado com R$ ${saldoUser.toFixed(2)}`);
        }
        
        usuariosCorrigidos++;
      } else {
        console.log(`   ✅ Saldos já estão sincronizados`);
      }
      console.log('');
    }

    // 3. Verificar se há wallets órfãos (sem usuário)
    console.log('🔍 VERIFICANDO WALLETS ÓRFÃOS:');
    console.log('-------------------------------');
    
    const wallets = await prisma.wallet.findMany({
      include: { user: true }
    });

    const walletsOrfaos = wallets.filter(w => !w.user);
    
    if (walletsOrfaos.length > 0) {
      console.log(`❌ ${walletsOrfaos.length} wallets órfãos encontrados`);
      for (const wallet of walletsOrfaos) {
        console.log(`   - Wallet ID: ${wallet.id}, User ID: ${wallet.user_id}`);
      }
    } else {
      console.log('✅ Nenhum wallet órfão encontrado');
    }

    // 4. Resumo final
    console.log('\n📋 RESUMO DA SINCRONIZAÇÃO:');
    console.log('============================');
    console.log(`👥 Usuários verificados: ${usuarios.length}`);
    console.log(`🔧 Usuários corrigidos: ${usuariosCorrigidos}`);
    console.log(`💰 Wallets órfãos: ${walletsOrfaos.length}`);

    if (usuariosCorrigidos > 0) {
      console.log('\n✅ SINCRONIZAÇÃO CONCLUÍDA!');
      console.log('💡 Todos os saldos foram sincronizados entre User e Wallet');
    } else {
      console.log('\n✅ Nenhuma sincronização necessária');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

sincronizarSaldos();
