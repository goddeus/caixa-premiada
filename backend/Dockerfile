FROM node:18-alpine

# Instalar OpenSSL para compatibilidade com Prisma
RUN apk add --no-cache openssl1.1-compat

# Definir diretório de trabalho
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Expor porta
EXPOSE 10000

# Comando de inicialização
CMD ["npm", "start"]