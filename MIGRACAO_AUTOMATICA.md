# Migração Automática do Banco de Dados

## 📋 Resumo

O sistema agora executa migração automática do banco de dados na inicialização do servidor, eliminando a necessidade de executar scripts manuais no Render.

## 🔄 Como Funciona

### 1. **Verificação Automática**
- Na inicialização do servidor, o sistema verifica se as colunas `username` e `telefone` existem na tabela `User`
- Se as colunas não existirem, a migração é executada automaticamente

### 2. **Migração Inteligente**
- Adiciona coluna `username` se não existir
- Adiciona coluna `telefone` se não existir
- Popula usuários existentes com username baseado no nome
- Cria índice para melhor performance

### 3. **Logs Detalhados**
- O sistema exibe logs claros sobre o processo de migração
- Indica se a migração foi necessária ou se as colunas já existiam

## 🚀 Implementação

### Arquivo Modificado: `backend/src/server.js`

```javascript
// Função para executar migração automática do banco de dados
async function runDatabaseMigration() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('🔍 Verificando se migração é necessária...');
    
    // Verificar se as colunas já existem
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('username', 'telefone')
    `;
    
    const existingColumns = await prisma.$queryRawUnsafe(checkColumnsQuery);
    const existingColumnNames = existingColumns.map(col => col.column_name);
    
    console.log('📋 Colunas existentes:', existingColumnNames);
    
    const needsMigration = !existingColumnNames.includes('username') || !existingColumnNames.includes('telefone');
    
    if (needsMigration) {
      console.log('🔄 Executando migração...');
      
      // Adicionar coluna username se não existir
      if (!existingColumnNames.includes('username')) {
        console.log('➕ Adicionando coluna username...');
        await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;');
        
        // Atualizar usuários existentes para ter username baseado no nome
        await prisma.$executeRawUnsafe(`
          UPDATE "User" 
          SET "username" = LOWER(REPLACE("nome", ' ', '_')) 
          WHERE "username" IS NULL;
        `);
        
        console.log('✅ Coluna username adicionada e populada');
      }
      
      // Adicionar coluna telefone se não existir
      if (!existingColumnNames.includes('telefone')) {
        console.log('➕ Adicionando coluna telefone...');
        await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "telefone" TEXT;');
        console.log('✅ Coluna telefone adicionada');
      }
      
      // Criar índice para username (opcional, para melhor performance)
      try {
        await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"("username");');
        console.log('✅ Índice para username criado');
      } catch (indexError) {
        console.log('⚠️  Índice já existe ou erro ao criar:', indexError.message);
      }
      
      console.log('🎉 Migração concluída com sucesso!');
    } else {
      console.log('✅ Migração não necessária - colunas já existem');
    }
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
}
```

### Execução Automática

```javascript
// Executar migração automática do banco de dados
setTimeout(async () => {
  try {
    console.log('\n🔄 Iniciando migração automática do banco de dados...');
    await runDatabaseMigration();
  } catch (error) {
    console.error('❌ Erro na migração automática:', error.message);
    console.error('⚠️  Servidor continuará funcionando normalmente');
  }
}, 2000); // Aguardar 2 segundos após inicialização
```

## 📊 Logs de Exemplo

### Primeira Execução (Migração Necessária):
```
🔄 Iniciando migração automática do banco de dados...
🔍 Verificando se migração é necessária...
📋 Colunas existentes: []
🔄 Executando migração...
➕ Adicionando coluna username...
✅ Coluna username adicionada e populada
➕ Adicionando coluna telefone...
✅ Coluna telefone adicionada
✅ Índice para username criado
🎉 Migração concluída com sucesso!
```

### Execuções Subsequentes (Migração Não Necessária):
```
🔄 Iniciando migração automática do banco de dados...
🔍 Verificando se migração é necessária...
📋 Colunas existentes: ['username', 'telefone']
✅ Migração não necessária - colunas já existem
```

## 🛡️ Segurança e Robustez

### 1. **Verificação Prévia**
- Sistema verifica se as colunas já existem antes de tentar criá-las
- Evita erros de duplicação

### 2. **Tratamento de Erros**
- Migração falha não impede o servidor de iniciar
- Logs detalhados para debugging

### 3. **Idempotência**
- Pode ser executada múltiplas vezes sem problemas
- Usa `IF NOT EXISTS` para evitar conflitos

### 4. **Performance**
- Executa apenas quando necessário
- Cria índices para melhor performance

## 🔧 Configuração no Render

### 1. **Deploy Automático**
- A migração executa automaticamente no deploy
- Não requer intervenção manual

### 2. **Logs do Render**
- Todos os logs de migração aparecem no console do Render
- Fácil monitoramento do processo

### 3. **Fallback**
- Se a migração falhar, o servidor continua funcionando
- Sistema degrada graciosamente

## 📝 Vantagens

### ✅ **Para Desenvolvimento:**
- Migração automática em ambiente local
- Não precisa executar scripts manualmente

### ✅ **Para Produção:**
- Deploy sem intervenção manual
- Migração segura e controlada

### ✅ **Para Manutenção:**
- Logs claros e detalhados
- Fácil debugging de problemas

## 🚨 Considerações Importantes

### 1. **Tempo de Execução**
- Migração executa 2 segundos após inicialização
- Não bloqueia o início do servidor

### 2. **Conectividade**
- Requer conexão com banco de dados
- Falha se banco não estiver disponível

### 3. **Permissões**
- Requer permissões para alterar schema
- Funciona com PostgreSQL no Render

## 🎯 Próximos Passos

1. **Deploy no Render** - A migração executará automaticamente
2. **Verificar Logs** - Confirmar que a migração foi bem-sucedida
3. **Testar Funcionalidades** - Verificar se username e telefone funcionam
4. **Monitorar Performance** - Verificar se os índices melhoraram a performance

---

**Data de Implementação:** $(date)
**Versão:** 1.0.0
**Status:** ✅ Implementado e Pronto para Deploy
