# 🚀 CONFIGURAÇÃO RENDER + POSTGRESQL

## ✅ **ENVIRONMENT VARIABLES NO RENDER:**

### **1. Acessar Environment Variables:**
1. **Render Dashboard** → **Seu serviço** (`slotbox-api`)
2. **Settings** → **Environment Variables**

### **2. Adicionar Variáveis:**
```
DATABASE_URL=postgresql://postgres:senha@dpg-xxxxx-a.oregon-postgres.render.com/caixa_premiada_xxxx
JWT_SECRET=slotbox_jwt_super_secret_key_2024_render_deploy_ultra_secure
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://slotbox.shop
VIZZIONPAY_API_KEY=sua_chave_publica_aqui
VIZZIONPAY_PIX_KEY=seu_pix_key_aqui
VIZZIONPAY_SECRET=sua_chave_privada_aqui
RUN_SETUP=true
```

### **3. Comandos para Push:**
```bash
git add .
git commit -m "Revert to PostgreSQL Render configuration

- Reverted Prisma schema back to PostgreSQL
- Removed MySQL-specific configurations
- Ready for Render PostgreSQL database
- Added automatic setup functionality"

git push origin main
```

### **4. Após Push:**
1. **Aguardar** 2-3 minutos para deploy
2. **Verificar logs** → Deve aparecer "🎉 SETUP CONCLUÍDO"
3. **REMOVER** `RUN_SETUP=true` após setup
4. **Testar** sistema

### **5. Teste Final:**
```javascript
// Teste health check
fetch('https://slotbox-api.onrender.com/api/health')
.then(r => r.json())
.then(data => console.log('Health:', data));

// Teste login demo
fetch('https://slotbox-api.onrender.com/api/auth/login', {
  method: 'POST', 
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'joao.ferreira@test.com', senha: 'Afiliado@123'})
})
.then(r => r.json())
.then(data => console.log('Demo login:', data));
```

### **6. Vantagens do Render PostgreSQL:**
- ✅ **Gratuito** para começar
- ✅ **Fácil configuração**
- ✅ **Deploy automático**
- ✅ **Logs em tempo real**
- ✅ **Escalabilidade**

**Sistema configurado para Render PostgreSQL!** 🎉
