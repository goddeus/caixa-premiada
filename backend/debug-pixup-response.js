/**
 * Script para debugar a estrutura de resposta da Pixup
 * Simula diferentes formatos de resposta possíveis
 */

console.log('🔍 DEBUG DA ESTRUTURA DE RESPOSTA PIXUP\n');

// Simular diferentes formatos de resposta da Pixup
const possibleResponses = [
  {
    name: 'Formato 1 - Resposta direta',
    data: {
      success: true,
      data: {
        qr_code: '00020126580014br.gov.bcb.pix...',
        qr_code_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        transaction_id: 'pix_123456789',
        id: 'pix_123456789'
      }
    }
  },
  {
    name: 'Formato 2 - Campos diferentes',
    data: {
      success: true,
      data: {
        pix_copy_paste: '00020126580014br.gov.bcb.pix...',
        qr_code_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        id: 'pix_123456789'
      }
    }
  },
  {
    name: 'Formato 3 - Estrutura aninhada',
    data: {
      success: true,
      data: {
        payment: {
          qr_code: '00020126580014br.gov.bcb.pix...',
          qr_code_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
          transaction_id: 'pix_123456789'
        }
      }
    }
  },
  {
    name: 'Formato 4 - Campos EMV',
    data: {
      success: true,
      data: {
        emv: '00020126580014br.gov.bcb.pix...',
        qr_code_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
        id: 'pix_123456789'
      }
    }
  }
];

// Função para extrair dados do QR Code (igual ao PixupService)
function extractQrCodeData(pixupData) {
  let qrCode = null;
  let qrCodeImage = null;
  
  // Extrair QR Code texto
  if (pixupData.qr_code) {
    qrCode = pixupData.qr_code;
  } else if (pixupData.pix_copy_paste) {
    qrCode = pixupData.pix_copy_paste;
  } else if (pixupData.emv) {
    qrCode = pixupData.emv;
  }
  
  // Extrair QR Code imagem
  if (pixupData.qr_code_image) {
    qrCodeImage = pixupData.qr_code_image;
  } else if (pixupData.qr_code_base64) {
    qrCodeImage = pixupData.qr_code_base64;
  }
  
  return { qrCode, qrCodeImage };
}

// Testar cada formato
possibleResponses.forEach((response, index) => {
  console.log(`\n${index + 1}️⃣ ${response.name}`);
  console.log('📥 Resposta simulada:', JSON.stringify(response.data, null, 2));
  
  const pixupData = response.data.data || response.data;
  const { qrCode, qrCodeImage } = extractQrCodeData(pixupData);
  
  console.log('🔍 Dados extraídos:');
  console.log('  QR Code texto:', qrCode ? '✅ Presente' : '❌ Ausente');
  console.log('  QR Code imagem:', qrCodeImage ? '✅ Presente' : '❌ Ausente');
  console.log('  Transaction ID:', pixupData.transaction_id || pixupData.id || '❌ Ausente');
  
  // Simular resposta final do controller
  const finalResponse = {
    success: true,
    qrCode: qrCode,
    qrCodeImage: qrCodeImage,
    identifier: 'deposit_test_123',
    transaction_id: pixupData.transaction_id || pixupData.id,
    amount: 50.00,
    expires_at: new Date(Date.now() + 3600000)
  };
  
  console.log('📤 Resposta final do controller:', JSON.stringify(finalResponse, null, 2));
  
  // Verificar se frontend conseguirá processar
  const frontendCanProcess = finalResponse.qrCode && finalResponse.qrCodeImage;
  console.log('🎯 Frontend conseguirá processar:', frontendCanProcess ? '✅ Sim' : '❌ Não');
});

console.log('\n🔧 RECOMENDAÇÕES:');
console.log('1. Verificar documentação oficial da Pixup para estrutura exata');
console.log('2. Adicionar logs detalhados na resposta da Pixup');
console.log('3. Implementar fallbacks para diferentes formatos');
console.log('4. Testar com dados reais da Pixup');
