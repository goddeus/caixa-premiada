# 🗄️ CONFIGURAÇÃO MYSQL HOSTINGER

## ✅ **CONFIGURAÇÃO COMPLETA:**

### **1. DATABASE_URL para Render:**
```
DATABASE_URL="mysql://caixa_user:041016aR@@mysql.hostinger.com:3306/caixa_premiada"
```

### **2. Variáveis de Ambiente no Render:**
```
DATABASE_URL=mysql://caixa_user:041016aR@@mysql.hostinger.com:3306/caixa_premiada
JWT_SECRET=slotbox_jwt_super_secret_key_2024_render_deploy_ultra_secure
PORT=10000
NODE_ENV=production
FRONTEND_URL=https://slotbox.shop
VIZZIONPAY_API_KEY=sua_chave_publica_aqui
VIZZIONPAY_PIX_KEY=seu_pix_key_aqui
VIZZIONPAY_SECRET=sua_chave_privada_aqui
```

### **3. Comandos para Push:**
```bash
git add .
git commit -m "Configure MySQL Hostinger database

- Updated Prisma schema to use MySQL instead of PostgreSQL
- Added MySQL-specific table mappings
- Configured for Hostinger MySQL database
- System ready for MySQL deployment"

git push origin main
```

### **4. Após Deploy:**
1. **Aguardar** 2-3 minutos para deploy
2. **Testar** conexão:
   ```javascript
   fetch('https://slotbox-api.onrender.com/api/health')
   .then(r => r.json())
   .then(data => console.log('Health:', data));
   ```
3. **Setup automático** será executado na primeira vez

### **5. Vantagens do MySQL Hostinger:**
- ✅ **Mais estável** que PostgreSQL gratuito
- ✅ **Sem limitações** de plano gratuito
- ✅ **Melhor performance**
- ✅ **Controle total** do banco
- ✅ **Backup automático**
- ✅ **Sem problemas de conexão**

### **6. Teste Final:**
```javascript
// Teste login demo após setup
fetch('https://slotbox-api.onrender.com/api/auth/login', {
  method: 'POST', 
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({email: 'joao.ferreira@test.com', senha: 'Afiliado@123'})
})
.then(r => r.json())
.then(data => console.log('Demo login:', data));
```

**Sistema configurado para MySQL Hostinger!** 🎉
