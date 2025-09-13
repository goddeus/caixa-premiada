const QRCode = require('qrcode');

async function generateQRCode(text) {
  try {
    const qrCodeBase64 = await QRCode.toDataURL(text, {
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    
    // Remover o prefixo data:image/png;base64,
    const base64Data = qrCodeBase64.split(',')[1];
    
    return base64Data;
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    return null;
  }
}

async function testQRGeneration() {
  const pixText = '00020101021226880014br.gov.bcb.pix2566qrcodes.saq.digital/v2/qr/cob/8c98e05e-6461-4627-87db-cce8260db01f5204000053039865802BR5925BS PAYMENTS SOLUTIONS LTD6009SAO PAULO62070503***6304D82F';
  
  console.log('🔍 Gerando QR Code local...');
  const qrBase64 = await generateQRCode(pixText);
  
  if (qrBase64) {
    console.log('✅ QR Code gerado com sucesso!');
    console.log('Tamanho do base64:', qrBase64.length);
    console.log('Primeiros 100 caracteres:', qrBase64.substring(0, 100));
  } else {
    console.log('❌ Falha ao gerar QR Code');
  }
}

testQRGeneration();
