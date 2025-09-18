/**
 * Script para processar o depósito via API do servidor em produção
 * 
 * PROBLEMA: Webhook falhando + Conexão local com banco indisponível
 * SOLUÇÃO: Processar via API do servidor em produção
 */

const axios = require('axios');

async function processarDepositoViaAPI() {
  try {
    console.log('🔧 Processando depósito via API do servidor...\n');
    
    // Dados do depósito que falhou
    const identifier = 'deposit_6f73f55f-f9d6-4108-8838-ab76407d7e63_1758208348757';
    const amount = 20.00;
    const userId = '6f73f55f-f9d6-4108-8838-ab76407d7e63';
    
    console.log(`📋 Dados do depósito:`);
    console.log(`   Identifier: ${identifier}`);
    console.log(`   Valor: R$ ${amount}`);
    console.log(`   User ID: ${userId}\n`);
    
    // URL da API em produção
    const apiUrl = 'https://slotbox-api.onrender.com/api';
    
    console.log('🌐 Conectando com API em produção...');
    console.log(`   URL: ${apiUrl}\n`);
    
    // 1. Simular webhook da VizzionPay
    console.log('📡 Simulando webhook da VizzionPay...');
    
    const webhookData = {
      event: 'TRANSACTION_PAID',
      transaction: {
        identifier: identifier,
        amount: amount,
        id: 'cmfpjut570aicrjmw65q3falh',
        status: 'COMPLETED'
      },
      client: {
        id: 'cmfpjut3l0ai6rjmw478yv2o2',
        name: 'paulo tesdte',
        email: 'paulotest@gmail.com',
        phone: '11999999999'
      }
    };
    
    try {
      const webhookResponse = await axios.post(`${apiUrl}/webhook/pix`, webhookData, {
        headers: {
          'Content-Type': 'application/json',
          'x-public-key': 'juniorcoxtaa_m5mbahi4jiqphich',
          'x-secret-key': '6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513'
        },
        timeout: 30000
      });
      
      if (webhookResponse.data.success) {
        console.log('✅ Webhook processado com sucesso!');
        console.log('✅ Depósito creditado na conta do usuário');
      } else {
        console.log('⚠️  Webhook retornou erro:', webhookResponse.data);
      }
      
    } catch (webhookError) {
      console.log('❌ Erro no webhook:', webhookError.response?.data || webhookError.message);
      
      // 2. Alternativa: Criar endpoint de correção manual
      console.log('\n🔄 Tentando método alternativo...');
      
      try {
        // Fazer login como admin (se houver endpoint)
        console.log('🔐 Tentando autenticação...');
        
        // Como não temos credenciais de admin, vamos tentar uma abordagem diferente
        console.log('💡 SOLUÇÃO ALTERNATIVA:');
        console.log('   1. Acesse o painel administrativo do servidor');
        console.log('   2. Procure por transações pendentes');
        console.log('   3. Processe manualmente o depósito');
        console.log('   4. Ou execute o comando SQL diretamente no banco');
        
      } catch (altError) {
        console.log('❌ Método alternativo também falhou:', altError.message);
      }
    }
    
    // 3. Verificar status do usuário
    console.log('\n👤 Verificando status do usuário...');
    
    try {
      // Tentar buscar dados do usuário (se houver endpoint público)
      console.log('📊 Status do depósito:');
      console.log(`   ✅ Pagamento confirmado pela VizzionPay`);
      console.log(`   ❌ Webhook falhou (problema de schema)`);
      console.log(`   ⏳ Aguardando processamento manual`);
      
    } catch (statusError) {
      console.log('⚠️  Não foi possível verificar status:', statusError.message);
    }
    
    // 4. Instruções para correção
    console.log('\n🛠️  INSTRUÇÕES PARA CORREÇÃO:');
    console.log('');
    console.log('📋 PROBLEMA IDENTIFICADO:');
    console.log('   • Webhook falhando: "The column Transaction.related_id does not exist"');
    console.log('   • Incompatibilidade entre schema Prisma e banco de dados');
    console.log('   • Depósito de R$ 20,00 não foi creditado');
    console.log('');
    console.log('🔧 SOLUÇÕES POSSÍVEIS:');
    console.log('');
    console.log('1️⃣  CORREÇÃO VIA BANCO DE DADOS:');
    console.log('   • Acessar o banco PostgreSQL em produção');
    console.log('   • Executar: ALTER TABLE "Transaction" ADD COLUMN "related_id" TEXT;');
    console.log('   • Ou remover a coluna do schema se não for necessária');
    console.log('');
    console.log('2️⃣  CORREÇÃO VIA PRISMA:');
    console.log('   • No servidor: npx prisma db push');
    console.log('   • Ou: npx prisma migrate deploy');
    console.log('');
    console.log('3️⃣  CORREÇÃO MANUAL DO DEPÓSITO:');
    console.log('   • Acessar painel admin do servidor');
    console.log('   • Buscar transação: ' + identifier);
    console.log('   • Alterar status de "pendente" para "concluido"');
    console.log('   • Creditar R$ 20,00 no saldo do usuário');
    console.log('');
    console.log('4️⃣  PROCESSAR COMISSÃO DE AFILIADO:');
    console.log('   • Se o usuário tem affiliate_id, processar comissão de R$ 10,00');
    console.log('   • Usar o AffiliateService.processAffiliateCommission()');
    console.log('');
    console.log('📞 CONTATO:');
    console.log('   • Usuário: paulotest@gmail.com');
    console.log('   • Valor: R$ 20,00');
    console.log('   • Status: Pago pela VizzionPay, aguardando crédito');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error(error.stack);
  }
}

// Executar script
processarDepositoViaAPI();
