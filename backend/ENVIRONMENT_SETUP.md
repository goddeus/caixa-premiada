# 🔧 CONFIGURAÇÃO ENVIRONMENT VARIABLES

## ✅ **VARIÁVEIS OBRIGATÓRIAS NO RENDER:**

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
```

### **3. Se não tiver banco PostgreSQL:**
1. **Render Dashboard** → **New** → **PostgreSQL**
2. **Name**: `caixa-premiada-db`
3. **Database**: `caixa_premiada`
4. **User**: `postgres`
5. **Password**: Gerar senha forte
6. **Copiar** a `DATABASE_URL` gerada

### **4. Após adicionar variáveis:**
1. **Save Changes** → **Manual Deploy**
2. **Aguardar** 2-3 minutos
3. **Testar**:
   ```javascript
   fetch('https://slotbox-api.onrender.com/api/health')
   .then(r => r.json())
   .then(data => console.log('Health:', data));
   ```

### **5. Se ainda não funcionar:**
- Verificar se todas as variáveis foram salvas
- Verificar se o deploy foi executado
- Verificar logs do Render

**Configure as Environment Variables primeiro!** 🚀
