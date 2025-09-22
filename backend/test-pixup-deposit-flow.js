const axios = require('axios');

/**
 * Script para testar o fluxo completo de depósito Pixup
 * Verifica se o QR Code será exibido corretamente
 */

const API_BASE = 'https://slotbox-api.onrender.com/api';

async function testPixupDepositFlow() {
  console.log('🧪 TESTE DO FLUXO DE DEPÓSITO PIXUP\n');
  
  try {
    // 1. Testar endpoint de depósito
    console.log('1️⃣ Testando endpoint /pixup/deposit...');
    
    const depositData = {
      userId: 'test-user-123',
      amount: 50.00
    };
    
    console.log('📤 Dados enviados:', depositData);
    
    const response = await axios.post(`${API_BASE}/pixup/deposit`, depositData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      timeout: 30000
    });
    
    console.log('📥 Resposta recebida:', JSON.stringify(response.data, null, 2));
    
    // 2. Verificar estrutura da resposta
    console.log('\n2️⃣ Verificando estrutura da resposta...');
    
    const data = response.data;
    const requiredFields = ['success', 'qrCode', 'qrCodeImage', 'identifier', 'transaction_id', 'amount', 'expires_at'];
    
    const missingFields = requiredFields.filter(field => !(field in data));
    
    if (missingFields.length > 0) {
      console.log('❌ Campos obrigatórios ausentes:', missingFields);
    } else {
      console.log('✅ Todos os campos obrigatórios presentes');
    }
    
    // 3. Verificar se QR Code está presente
    console.log('\n3️⃣ Verificando QR Code...');
    
    if (data.qrCode) {
      console.log('✅ QR Code texto presente:', data.qrCode.substring(0, 50) + '...');
    } else {
      console.log('❌ QR Code texto ausente');
    }
    
    if (data.qrCodeImage) {
      console.log('✅ QR Code imagem presente:', data.qrCodeImage.substring(0, 50) + '...');
    } else {
      console.log('❌ QR Code imagem ausente');
    }
    
    // 4. Verificar se dados estão no formato esperado pelo frontend
    console.log('\n4️⃣ Verificando compatibilidade com frontend...');
    
    const frontendExpected = {
      success: data.success,
      qrCode: data.qrCode,
      qrCodeImage: data.qrCodeImage,
      identifier: data.identifier,
      transaction_id: data.transaction_id,
      amount: data.amount,
      expires_at: data.expires_at
    };
    
    console.log('📋 Dados formatados para frontend:', JSON.stringify(frontendExpected, null, 2));
    
    // 5. Simular processamento do frontend
    console.log('\n5️⃣ Simulando processamento do frontend...');
    
    if (data.success) {
      const pixModalData = {
        success: true,
        data: {
          qr_base64: data.qrCodeImage,
          qr_text: data.qrCode,
          transaction_id: data.identifier,
          valor: data.amount,
          amount: data.amount,
          expires_at: data.expires_at
        }
      };
      
      console.log('✅ Dados do modal PIX preparados:', JSON.stringify(pixModalData, null, 2));
      
      // Verificar se todos os campos necessários estão presentes
      const modalFields = ['qr_base64', 'qr_text', 'transaction_id', 'valor', 'amount', 'expires_at'];
      const missingModalFields = modalFields.filter(field => !(field in pixModalData.data));
      
      if (missingModalFields.length > 0) {
        console.log('❌ Campos do modal ausentes:', missingModalFields);
      } else {
        console.log('✅ Todos os campos do modal presentes');
      }
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    
    if (error.response) {
      console.error('📥 Resposta de erro:', JSON.stringify(error.response.data, null, 2));
      console.error('📊 Status:', error.response.status);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Dica: Verifique se o servidor está rodando');
    }
  }
}

// Executar teste
testPixupDepositFlow();
