# Sistema de Afiliados e Contas Demo - IMPLEMENTADO

## ✅ Funcionalidades Implementadas

### 1. **Sistema de Afiliados - Comissão Automática**
- ✅ Campo `affiliate_id` adicionado na tabela `users`
- ✅ Tabela `affiliate_commissions` criada para registrar comissões
- ✅ Processamento automático de comissões no webhook de pagamentos
- ✅ Verificação de primeiro depósito ≥ R$20,00
- ✅ Crédito automático de R$10,00 para o afiliado
- ✅ Registro completo na tabela `affiliate_commissions`

### 2. **Contas de Demonstração (afiliado_demo)**
- ✅ Campo `tipo_conta` adicionado na tabela `users`
- ✅ Valores: `normal` (padrão) e `afiliado_demo`
- ✅ RTP fixo de 70% aplicado automaticamente para contas demo
- ✅ Simulação de ganhos reais sem afetar caixa da plataforma
- ✅ Transações marcadas como "(DEMO)" para identificação

### 3. **Sistema de Saques Ajustado**
- ✅ Bloqueio automático de saques em contas demo
- ✅ Mensagem: "Saque indisponível nesta conta (modo demonstração)."
- ✅ Contas normais funcionam normalmente

### 4. **Script de Seed para Contas Demo**
- ✅ 15 contas demo criadas conforme especificação
- ✅ Dados: nome, email, username, senha
- ✅ Saldo inicial: R$100,00
- ✅ Tipo: `afiliado_demo`
- ✅ CPF fictício para evitar conflitos

## 🔧 Arquivos Modificados

### Schema do Banco (`prisma/schema.prisma`)
- Adicionado campo `tipo_conta` na tabela `users`
- Adicionado campo `affiliate_id` na tabela `users`
- Criada tabela `affiliate_commissions`
- Atualizado relacionamento `Affiliate` com `commissions`

### Controllers
- **`affiliateController.js`**: Adicionado método `processAutomaticCommission()`
- **`paymentController.js`**: Adicionado bloqueio de saques para contas demo

### Services
- **`vizzionPayService.js`**: Integração com processamento automático de comissões
- **`centralizedDrawService.js`**: RTP fixo 70% para contas demo e separação de dados

### Scripts
- **`create-demo-accounts.js`**: Criação das 15 contas demo
- **`test-complete-system.js`**: Teste completo do sistema

## 🎯 Fluxo de Funcionamento

### Comissão Automática
1. Usuário faz depósito ≥ R$20,00
2. Sistema verifica se tem `affiliate_id` vinculado
3. Se for primeiro depósito, processa comissão automaticamente
4. Credita R$10,00 no saldo do afiliado
5. Registra na tabela `affiliate_commissions`

### Contas Demo
1. Usuário com `tipo_conta = 'afiliado_demo'`
2. RTP fixo de 70% aplicado automaticamente
3. Ganhos são simulados (não afetam caixa real)
4. Saques são bloqueados com mensagem específica
5. Transações marcadas como "(DEMO)"

## 📊 Dados das Contas Demo

| Nome | Email | Username | Senha |
|------|-------|----------|-------|
| João Ferreira | joao.ferreira@test.com | joao_f | Afiliado@123 |
| Lucas Almeida | lucas.almeida@test.com | lucasal | Afiliado@123 |
| Pedro Henrique | pedro.henrique@test.com | pedroh | Afiliado@123 |
| Rafael Costa | rafael.costa@test.com | rafa_c | Afiliado@123 |
| Bruno Martins | bruno.martins@test.com | brunom | Afiliado@123 |
| Diego Oliveira | diego.oliveira@test.com | diegoo | Afiliado@123 |
| Matheus Rocha | matheus.rocha@test.com | matheusr | Afiliado@123 |
| Thiago Mendes | thiago.mendes@test.com | thiagom | Afiliado@123 |
| Felipe Carvalho | felipe.carvalho@test.com | felipec | Afiliado@123 |
| Gustavo Lima | gustavo.lima@test.com | gustavol | Afiliado@123 |
| André Pereira | andre.pereira@test.com | andrep | Afiliado@123 |
| Rodrigo Santos | rodrigo.santos@test.com | rodrigos | Afiliado@123 |
| Marcelo Nunes | marcelo.nunes@test.com | marcelon | Afiliado@123 |
| Vinícius Araújo | vinicius.araujo@test.com | viniciusa | Afiliado@123 |
| Eduardo Ramos | eduardo.ramos@test.com | eduardor | Afiliado@123 |

## 🚀 Como Executar

1. **Aplicar migrações do banco:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

2. **Criar contas demo:**
   ```bash
   node create-demo-accounts.js
   ```

3. **Testar sistema completo:**
   ```bash
   node test-complete-system.js
   ```

## ⚠️ Validações Implementadas

- ✅ Contas demo não afetam caixa real da plataforma
- ✅ Afiliados reais conseguem sacar comissões normalmente
- ✅ RTP 70% aplicado apenas para contas demo
- ✅ Separação total entre dados reais e simulados
- ✅ Comissão automática apenas no primeiro depósito ≥ R$20

## 🎉 Sistema Pronto para Produção

O sistema está completamente implementado e pronto para uso, com todas as funcionalidades solicitadas:

1. **Afiliados** com comissão automática
2. **Contas demo** com RTP 70% e bloqueio de saques
3. **Separação total** entre dados reais e simulados
4. **Scripts de seed** para popular o banco
5. **Validações completas** em todos os fluxos

O sistema garante que não há risco financeiro com as contas demo, pois elas não afetam o caixa real da plataforma, enquanto os afiliados reais podem sacar suas comissões normalmente.
