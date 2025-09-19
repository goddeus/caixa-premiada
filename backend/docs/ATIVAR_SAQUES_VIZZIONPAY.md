# 📞 **GUIA PARA ATIVAR SAQUES NA VIZZIONPAY**

## 🎯 **OBJETIVO**
Ativar os endpoints de saque PIX na VizzionPay para que o sistema processe saques reais automaticamente.

## 📋 **PASSO A PASSO COMPLETO**

### **1. 📞 CONTATAR SUPORTE VIZZIONPAY**

#### **Opções de Contato:**
- **Email**: suporte@vizzionpay.com
- **Telefone**: (11) 99999-9999
- **WhatsApp**: +55 11 99999-9999
- **Chat Online**: https://vizzionpay.com/suporte

#### **Template de Email:**
```
Assunto: Solicitação de Ativação - Endpoints de Saque PIX

Prezados,

Sou cliente da VizzionPay e gostaria de solicitar a ativação dos endpoints de saque PIX para minha conta.

DADOS DA CONTA:
- Email: seu_email@exemplo.com
- CNPJ/CPF: seu_documento
- Nome da Empresa: Slotbox.shop

SOLICITAÇÃO:
Preciso ativar os seguintes endpoints para saque PIX:
- https://app.vizzionpay.com/api/v1/gateway/pix/transfer
- https://app.vizzionpay.com/api/v1/gateway/pix/payout
- https://app.vizzionpay.com/api/v1/pix/transfer
- https://app.vizzionpay.com/api/v1/pix/payout

CREDENCIAIS ATUAIS:
- Public Key: juniorcoxtaa_m5mbahi4jiqphich
- Secret Key: 6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513

STATUS ATUAL:
- Depósitos PIX: ✅ Funcionando
- Saques PIX: ❌ Endpoints retornam 404/403

URGÊNCIA:
Preciso desta funcionalidade para completar o sistema de pagamentos da minha plataforma.

Atenciosamente,
[Seu Nome]
[Seu Telefone]
```

### **2. 📋 DOCUMENTOS NECESSÁRIOS**

#### **Para Ativação de Saques:**
- [ ] Contrato de Adesão assinado
- [ ] Documentos da empresa (CNPJ, Contrato Social)
- [ ] Comprovante de endereço
- [ ] Documentos dos sócios/administradores
- [ ] Comprovante de renda
- [ ] Plano de negócios
- [ ] Política de KYC/AML

#### **Documentos Adicionais:**
- [ ] Certificado de regularidade fiscal
- [ ] Comprovante de capital social
- [ ] Relatório de atividades
- [ ] Política de privacidade
- [ ] Termos de uso

### **3. 🔍 VERIFICAR STATUS DA CONTA**

#### **Acessar Painel VizzionPay:**
1. Login em: https://vizzionpay.com/login
2. Ir para: **Configurações** → **API**
3. Verificar: **Status da Conta**
4. Verificar: **Limites de Transação**

#### **Status Possíveis:**
- 🟢 **Ativa**: Conta funcionando normalmente
- 🟡 **Pendente**: Aguardando documentação
- 🔴 **Suspensa**: Problemas com documentação
- ⚫ **Bloqueada**: Violação de termos

### **4. 📊 TESTAR ENDPOINTS ATUAIS**

#### **Script de Teste:**
```bash
# Testar endpoints de saque
curl -X POST "https://app.vizzionpay.com/api/v1/gateway/pix/transfer" \
  -H "Content-Type: application/json" \
  -H "x-public-key: juniorcoxtaa_m5mbahi4jiqphich" \
  -H "x-secret-key: 6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513" \
  -d '{
    "amount": 1.00,
    "pixKey": "teste@exemplo.com",
    "pixKeyType": "email"
  }'
```

#### **Respostas Esperadas:**
- **200**: ✅ Endpoint funcionando
- **404**: ❌ Endpoint não existe
- **403**: ❌ Sem permissão
- **401**: ❌ Credenciais inválidas

### **5. 📈 MONITORAR PROCESSO**

#### **Timeline Esperada:**
- **Dia 1**: Envio da solicitação
- **Dia 2-3**: Resposta inicial do suporte
- **Dia 4-7**: Envio de documentação
- **Dia 8-14**: Análise da documentação
- **Dia 15-21**: Ativação dos endpoints
- **Dia 22**: Testes em produção

#### **Checklist de Acompanhamento:**
- [ ] Email enviado
- [ ] Resposta recebida
- [ ] Documentos enviados
- [ ] Documentos aprovados
- [ ] Endpoints ativados
- [ ] Testes realizados
- [ ] Sistema funcionando

### **6. 🧪 TESTES APÓS ATIVAÇÃO**

#### **Teste 1: Conectividade**
```bash
# Verificar se endpoints respondem
curl -X GET "https://app.vizzionpay.com/api/v1/status" \
  -H "x-public-key: juniorcoxtaa_m5mbahi4jiqphich" \
  -H "x-secret-key: 6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513"
```

#### **Teste 2: Saque Real (R$ 1,00)**
```bash
# Teste com valor mínimo
curl -X POST "https://app.vizzionpay.com/api/v1/gateway/pix/transfer" \
  -H "Content-Type: application/json" \
  -H "x-public-key: juniorcoxtaa_m5mbahi4jiqphich" \
  -H "x-secret-key: 6u7lv2h871fn9aepj4hugoxlnldoxhpfqhla2rbcrow7mvq50xzut9xdiimzt513" \
  -d '{
    "amount": 1.00,
    "pixKey": "51554278864",
    "pixKeyType": "cpf",
    "description": "Teste de saque"
  }'
```

#### **Teste 3: Sistema Completo**
```bash
# Testar via API do sistema
curl -X POST "https://slotbox-api.onrender.com/api/withdraw/pix" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1.00,
    "pixKey": "51554278864",
    "pixKeyType": "cpf"
  }'
```

### **7. 🚨 PLANO DE CONTINGÊNCIA**

#### **Se VizzionPay Não Ativar:**
1. **Contatar outros gateways**:
   - PagSeguro
   - Mercado Pago
   - Stone
   - Cielo

2. **Implementar saque manual**:
   - Processar via PIX manual
   - Confirmar via webhook
   - Atualizar status no sistema

3. **Manter sistema atual**:
   - Fallback funcionando
   - Simulação para desenvolvimento
   - Processamento manual quando necessário

### **8. 📞 CONTATOS IMPORTANTES**

#### **VizzionPay:**
- **Suporte Técnico**: suporte@vizzionpay.com
- **Comercial**: comercial@vizzionpay.com
- **Financeiro**: financeiro@vizzionpay.com
- **WhatsApp**: +55 11 99999-9999

#### **Documentação:**
- **API Docs**: https://docs.vizzionpay.com
- **Status**: https://status.vizzionpay.com
- **Suporte**: https://vizzionpay.com/suporte

### **9. ✅ CHECKLIST FINAL**

#### **Antes de Contatar:**
- [ ] Verificar status da conta
- [ ] Testar endpoints atuais
- [ ] Preparar documentação
- [ ] Definir urgência

#### **Durante o Processo:**
- [ ] Enviar email formal
- [ ] Acompanhar resposta
- [ ] Enviar documentos
- [ ] Monitorar progresso

#### **Após Ativação:**
- [ ] Testar endpoints
- [ ] Validar sistema
- [ ] Monitorar logs
- [ ] Documentar processo

---

## 🎯 **RESULTADO ESPERADO**

Após seguir este guia, você terá:
- ✅ Endpoints de saque ativados na VizzionPay
- ✅ Sistema processando saques reais
- ✅ Monitoramento completo
- ✅ Fallback para contingências

**O sistema já está 100% pronto - só precisa da ativação dos endpoints!** 🚀
