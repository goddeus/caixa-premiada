# 🚀 Deploy das Correções de CORS para Render.com

## 📋 Instruções para Deploy

### 1. **Acessar o Painel do Render.com**
- Faça login em [render.com](https://render.com)
- Navegue até o serviço `slotbox-api`

### 2. **Fazer Deploy Manual**
Como você não tem acesso direto ao servidor, siga estes passos:

#### Opção A: Deploy via Git (Recomendado)
```bash
# 1. Commit das alterações
git add .
git commit -m "Fix: Corrigir configuração CORS para resolver erros de preflight"

# 2. Push para o repositório
git push origin main

# 3. O Render.com fará deploy automático
```

#### Opção B: Deploy Manual via Interface
1. No painel do Render.com, vá para o serviço `slotbox-api`
2. Clique em "Manual Deploy"
3. Selecione "Deploy latest commit"
4. Aguarde o deploy completar

### 3. **Verificar o Deploy**
Após o deploy, execute o teste de conectividade:

```bash
node test-api-connection.js
```

### 4. **Monitorar Logs**
- No painel do Render.com, vá para "Logs"
- Verifique se não há erros
- Procure por mensagens de CORS

## 🔧 Correções Aplicadas

### **1. CORS Mais Robusto**
- ✅ Configuração dinâmica de origens permitidas
- ✅ Suporte a múltiplos domínios
- ✅ Headers CORS completos

### **2. Middleware de Backup**
- ✅ Headers CORS manuais como backup
- ✅ Resposta adequada para requisições OPTIONS
- ✅ Logs detalhados para debug

### **3. Melhor Tratamento de Preflight**
- ✅ Status 200 para requisições OPTIONS
- ✅ Headers necessários para preflight
- ✅ Suporte a navegadores legados

## 🧪 Testes de Validação

### **Teste 1: Health Check**
```bash
curl -H "Origin: https://slotbox.shop" https://slotbox-api.onrender.com/api/health
```

### **Teste 2: CORS Preflight**
```bash
curl -X OPTIONS \
  -H "Origin: https://slotbox.shop" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization" \
  https://slotbox-api.onrender.com/api/cases
```

### **Teste 3: Requisição Real**
```bash
curl -H "Origin: https://slotbox.shop" https://slotbox-api.onrender.com/api/cases
```

## 🚨 Solução de Problemas

### **Se o erro persistir:**

1. **Verificar Status do Servidor**
   - Render.com Free Tier pode estar "dormindo"
   - Aguarde 2-3 minutos após o deploy

2. **Verificar Logs**
   - Procure por erros de CORS nos logs
   - Verifique se o servidor está iniciando corretamente

3. **Limpar Cache do Navegador**
   - Ctrl+F5 para forçar reload
   - Limpar cache e cookies

4. **Testar em Modo Incógnito**
   - Abrir nova aba anônima
   - Testar sem extensões

## 📞 Suporte Adicional

Se os problemas persistirem:

1. **Upgrade do Plano Render.com**
   - Free Tier tem limitações
   - Considere plano Starter ($7/mês)

2. **Alternativa: Vercel/Netlify**
   - Melhor suporte a CORS
   - Deploy mais rápido

3. **Proxy Reverso**
   - Configurar Nginx/Cloudflare
   - Melhor controle de CORS

## ✅ Checklist de Deploy

- [ ] Alterações commitadas no Git
- [ ] Push realizado para o repositório
- [ ] Deploy iniciado no Render.com
- [ ] Logs verificados (sem erros)
- [ ] Teste de conectividade executado
- [ ] Frontend testado em produção
- [ ] CORS funcionando corretamente

---

**💡 Dica:** O Render.com Free Tier pode levar alguns minutos para "acordar" após inatividade. Se o problema persistir, considere fazer upgrade para um plano pago.
