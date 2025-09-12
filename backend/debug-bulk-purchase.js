console.log('🔍 DEBUG: Iniciando teste de compra múltipla...');

try {
  console.log('1. Carregando Prisma...');
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  console.log('✅ Prisma carregado');

  console.log('2. Carregando BulkPurchaseService...');
  const bulkPurchaseService = require('./src/services/bulkPurchaseService');
  console.log('✅ BulkPurchaseService carregado');

  console.log('3. Testando conexão com banco...');
  prisma.$connect().then(() => {
    console.log('✅ Conexão com banco estabelecida');
    
    console.log('4. Buscando caixas...');
    return prisma.case.findMany({ where: { ativo: true }, take: 1 });
  }).then(cases => {
    if (cases.length === 0) {
      console.log('❌ Nenhuma caixa ativa encontrada');
      return;
    }
    
    console.log(`✅ Caixa encontrada: ${cases[0].nome}`);
    
    console.log('5. Criando usuário de teste...');
    return prisma.user.create({
      data: {
        nome: 'Debug Test',
        email: `debug.${Date.now()}@test.com`,
        senha_hash: 'hash',
        cpf: `${Date.now()}`,
        saldo: 100.00,
        tipo_conta: 'normal'
      }
    });
  }).then(user => {
    console.log(`✅ Usuário criado: ${user.id}`);
    
    console.log('6. Testando compra múltipla...');
    return prisma.case.findFirst({ where: { ativo: true } }).then(caseData => {
      const caixaItems = [{ caixaId: caseData.id, quantidade: 1 }];
      console.log(`Usando caixa: ${caseData.nome} (${caseData.id})`);
      return bulkPurchaseService.processBulkPurchase(user.id, null, caixaItems);
    });
  }).then(result => {
    console.log('📊 RESULTADO:');
    console.log(JSON.stringify(result, null, 2));
  }).catch(error => {
    console.error('❌ ERRO:', error);
  }).finally(() => {
    console.log('7. Fechando conexão...');
    prisma.$disconnect();
  });

} catch (error) {
  console.error('❌ ERRO FATAL:', error);
}
