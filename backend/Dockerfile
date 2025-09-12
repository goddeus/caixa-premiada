FROM node:18-alpine

# Criar diretório da aplicação
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Expor porta
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "start"]
