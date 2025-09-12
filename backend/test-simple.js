console.log('Teste funcionando!');
console.log('Verificando contas demo...');

// Simular verificação
const demoEmails = [
  'joao.ferreira@test.com',
  'lucas.almeida@test.com',
  'pedro.henrique@test.com',
  'rafael.costa@test.com',
  'bruno.martins@test.com',
  'diego.oliveira@test.com',
  'matheus.rocha@test.com',
  'thiago.mendes@test.com',
  'felipe.carvalho@test.com',
  'gustavo.lima@test.com',
  'andre.pereira@test.com',
  'rodrigo.santos@test.com',
  'marcelo.nunes@test.com',
  'vinicius.araujo@test.com',
  'eduardo.ramos@test.com'
];

console.log('Contas demo que devem ter R$ 100,00:');
demoEmails.forEach(email => {
  console.log(`✅ ${email} - Deve ter R$ 100,00 demo`);
});

console.log('\nSenha padrão: Afiliado@123');
console.log('Tipo de conta: afiliado_demo');