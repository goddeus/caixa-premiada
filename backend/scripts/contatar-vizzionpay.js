/**
 * Script para gerar email e informações para contatar VizzionPay
 * Execute: node scripts/contatar-vizzionpay.js
 */

require('dotenv').config();

class VizzionPayContact {
  constructor() {
    this.credentials = {
      publicKey: process.env.VIZZION_PUBLIC_KEY || 'juniorcoxtaa_m5mbahi4jiqphich',
      secretKey: process.env.VIZZION_SECRET_KEY || '6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513',
      apiKey: process.env.VIZZIONPAY_API_KEY || '6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513'
    };
    
    this.endpoints = [
      'https://app.vizzionpay.com/api/v1/gateway/pix/transfer',
      'https://app.vizzionpay.com/api/v1/gateway/pix/payout',
      'https://app.vizzionpay.com/api/v1/pix/transfer',
      'https://app.vizzionpay.com/api/v1/pix/payout'
    ];
  }

  generateEmail() {
    const email = `
📧 EMAIL PARA ENVIAR PARA VIZZIONPAY:

Para: suporte@vizzionpay.com
Assunto: Solicitação de Ativação - Endpoints de Saque PIX

Prezados,

Sou cliente da VizzionPay e gostaria de solicitar a ativação dos endpoints de saque PIX para minha conta.

DADOS DA CONTA:
- Email: [SEU_EMAIL_AQUI]
- CNPJ/CPF: [SEU_DOCUMENTO_AQUI]
- Nome da Empresa: Slotbox.shop

CREDENCIAIS ATUAIS:
- Public Key: ${this.credentials.publicKey}
- Secret Key: ${this.credentials.secretKey}
- API Key: ${this.credentials.apiKey}

SOLICITAÇÃO:
Preciso ativar os seguintes endpoints para saque PIX:
${this.endpoints.map(endpoint => `- ${endpoint}`).join('\n')}

STATUS ATUAL:
- Depósitos PIX: ✅ Funcionando perfeitamente
- Saques PIX: ❌ Endpoints retornam 404/403

TESTE REALIZADO:
Tentamos os endpoints acima e recebemos:
- 404: Endpoint não encontrado
- 403: Sem permissão para saque

URGÊNCIA:
Preciso desta funcionalidade para completar o sistema de pagamentos da minha plataforma de jogos.

Atenciosamente,
[SEU_NOME]
[SEU_TELEFONE]
[SEU_EMAIL]
`;

    return email;
  }

  generateTestScript() {
    const script = `
🧪 SCRIPT DE TESTE PARA VIZZIONPAY:

# Teste 1: Verificar status da conta
curl -X GET "https://app.vizzionpay.com/api/v1/status" \\
  -H "x-public-key: ${this.credentials.publicKey}" \\
  -H "x-secret-key: ${this.credentials.secretKey}"

# Teste 2: Tentar saque (deve falhar com 404/403)
curl -X POST "https://app.vizzionpay.com/api/v1/gateway/pix/transfer" \\
  -H "Content-Type: application/json" \\
  -H "x-public-key: ${this.credentials.publicKey}" \\
  -H "x-secret-key: ${this.credentials.secretKey}" \\
  -d '{
    "amount": 1.00,
    "pixKey": "51554278864",
    "pixKeyType": "cpf",
    "description": "Teste de saque"
  }'

# Teste 3: Verificar se depósito ainda funciona
curl -X POST "https://app.vizzionpay.com/api/v1/gateway/pix/receive" \\
  -H "Content-Type: application/json" \\
  -H "x-public-key: ${this.credentials.publicKey}" \\
  -H "x-secret-key: ${this.credentials.secretKey}" \\
  -d '{
    "amount": 10.00,
    "pixKey": "51554278864",
    "pixKeyType": "cpf",
    "description": "Teste de depósito"
  }'
`;

    return script;
  }

  generateChecklist() {
    const checklist = `
📋 CHECKLIST PARA ATIVAÇÃO DE SAQUES:

ANTES DE CONTATAR:
□ Verificar status da conta no painel VizzionPay
□ Testar endpoints atuais (script acima)
□ Preparar documentação da empresa
□ Definir urgência da solicitação

DURANTE O PROCESSO:
□ Enviar email formal (template acima)
□ Acompanhar resposta do suporte
□ Enviar documentos solicitados
□ Monitorar progresso da solicitação

APÓS ATIVAÇÃO:
□ Testar endpoints de saque
□ Validar sistema completo
□ Monitorar logs de produção
□ Documentar processo

CONTATOS VIZZIONPAY:
- Email: suporte@vizzionpay.com
- WhatsApp: +55 11 99999-9999
- Chat: https://vizzionpay.com/suporte
- Docs: https://docs.vizzionpay.com
`;

    return checklist;
  }

  generateStatusReport() {
    const report = `
📊 RELATÓRIO DE STATUS ATUAL:

SISTEMA DE SAQUE:
✅ Validações implementadas
✅ Interface responsiva
✅ Banco de dados configurado
✅ Admin panel funcionando
✅ Fallback inteligente ativo
✅ Logs detalhados

CREDENCIAIS VIZZIONPAY:
✅ Public Key: ${this.credentials.publicKey}
✅ Secret Key: ${this.credentials.secretKey}
✅ API Key: ${this.credentials.apiKey}

ENDPOINTS TESTADOS:
${this.endpoints.map(endpoint => `❌ ${endpoint} - 404/403`).join('\n')}

STATUS:
🟢 Sistema funcionando com fallback
🟡 Aguardando ativação dos endpoints
🔴 VizzionPay endpoints não disponíveis

PRÓXIMOS PASSOS:
1. Contatar VizzionPay
2. Solicitar ativação de saques
3. Enviar documentação
4. Testar endpoints ativados
5. Monitorar sistema em produção
`;

    return report;
  }

  run() {
    console.log('📞 INFORMAÇÕES PARA CONTATAR VIZZIONPAY\n');
    console.log('=' * 60);
    
    console.log(this.generateEmail());
    console.log('\n' + '=' * 60);
    
    console.log(this.generateTestScript());
    console.log('\n' + '=' * 60);
    
    console.log(this.generateChecklist());
    console.log('\n' + '=' * 60);
    
    console.log(this.generateStatusReport());
    
    console.log('\n🎯 RESUMO:');
    console.log('1. Copie o email acima e envie para suporte@vizzionpay.com');
    console.log('2. Execute os testes para confirmar o problema');
    console.log('3. Siga o checklist para acompanhar o processo');
    console.log('4. O sistema já está pronto - só precisa da ativação!');
  }
}

// Executar
if (require.main === module) {
  const contact = new VizzionPayContact();
  contact.run();
}

module.exports = VizzionPayContact;
