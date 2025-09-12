// Teste rápido da nova lógica de validação

function getValidationStatus(prize) {
  // Para prêmios cash, verificar consistência básica
  if (prize.tipo === 'cash') {
    const expectedLabel = `R$ ${(prize.valorCentavos / 100).toFixed(2).replace('.', ',')}`;
    
    // Verificar se o nome/label está correto para cash
    if (prize.nome !== expectedLabel && prize.label !== expectedLabel) {
      return 'warning'; // Apenas warning, não erro
    }
    
    // Para cash, imagem pode ser padrão ou customizada
    if (!prize.imagemUrl || prize.imagemUrl === 'produto/default.png') {
      return 'warning';
    }
    
    return 'ok';
  }
  
  // Para produto/ilustrativo, verificar se tem imagem válida
  if (!prize.imagemUrl || prize.imagemUrl === 'produto/default.png') {
    return 'warning';
  }
  
  // Se tem imagem válida (uploads, imagens locais, ou cash), está OK
  if (prize.imagemUrl && (
    prize.imagemUrl.startsWith('/uploads/') || 
    prize.imagemUrl.startsWith('/imagens/') || 
    prize.imagemUrl.startsWith('cash/') ||
    prize.imagemUrl.startsWith('produto/')
  )) {
    return 'ok';
  }
  
  // Se chegou até aqui, pode ser uma imagem quebrada
  return 'warning';
}

// Testes
console.log('🧪 TESTANDO NOVA LÓGICA DE VALIDAÇÃO...\n');

const testCases = [
  // Casos OK
  { tipo: 'cash', nome: 'R$ 5,00', label: 'R$ 5,00', valorCentavos: 500, imagemUrl: 'cash/500.png', expected: 'ok' },
  { tipo: 'produto', nome: 'IPHONE', label: 'IPHONE', valorCentavos: 2500000, imagemUrl: '/imagens/iphone 16.png', expected: 'ok' },
  { tipo: 'produto', nome: 'AIRPODS', label: 'AIRPODS', valorCentavos: 250000, imagemUrl: '/uploads/images/airpods.png', expected: 'ok' },
  { tipo: 'produto', nome: 'MACBOOK', label: 'MACBOOK', valorCentavos: 1500000, imagemUrl: '/imagens/macbook.png', expected: 'ok' },
  
  // Casos WARNING
  { tipo: 'cash', nome: 'R$ 5,00', label: 'R$ 5,00', valorCentavos: 500, imagemUrl: 'produto/default.png', expected: 'warning' },
  { tipo: 'produto', nome: 'PRODUTO', label: 'PRODUTO', valorCentavos: 100000, imagemUrl: 'produto/default.png', expected: 'warning' },
  { tipo: 'produto', nome: 'PRODUTO', label: 'PRODUTO', valorCentavos: 100000, imagemUrl: null, expected: 'warning' },
  { tipo: 'cash', nome: 'Dinheiro', label: 'Dinheiro', valorCentavos: 1000, imagemUrl: 'cash/1000.png', expected: 'warning' },
];

testCases.forEach((testCase, index) => {
  const result = getValidationStatus(testCase);
  const status = result === testCase.expected ? '✅' : '❌';
  console.log(`${index + 1}. ${status} ${testCase.tipo.toUpperCase()}: "${testCase.nome}"`);
  console.log(`   - Imagem: "${testCase.imagemUrl}"`);
  console.log(`   - Esperado: ${testCase.expected.toUpperCase()}, Resultado: ${result.toUpperCase()}`);
  console.log('');
});

console.log('🎉 TESTE CONCLUÍDO!');
