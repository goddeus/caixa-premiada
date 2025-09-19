#!/bin/bash

# Script para fazer deploy das correções de CORS
# Este script deve ser executado no servidor de produção

echo "🚀 Iniciando deploy das correções de CORS..."

# Verificar se estamos no diretório correto
if [ ! -f "backend/src/server.js" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Erro: Node.js não está instalado"
    exit 1
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ Erro: npm não está instalado"
    exit 1
fi

echo "✅ Verificações básicas passaram"

# Navegar para o diretório backend
cd backend

echo "📦 Instalando dependências..."
npm install

echo "🔧 Gerando cliente Prisma..."
npx prisma generate

echo "🗄️ Aplicando migrações do banco..."
npx prisma db push

echo "🔄 Reiniciando servidor..."

# Se estiver usando PM2
if command -v pm2 &> /dev/null; then
    echo "🔄 Reiniciando com PM2..."
    pm2 restart all
    pm2 save
elif command -v systemctl &> /dev/null; then
    echo "🔄 Reiniciando serviço systemd..."
    sudo systemctl restart slotbox-api
else
    echo "⚠️  Reinicie manualmente o servidor Node.js"
fi

echo "✅ Deploy concluído!"
echo ""
echo "🧪 Testando conectividade..."
node ../test-api-connection.js

echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Aguarde alguns minutos para o servidor inicializar completamente"
echo "2. Teste o frontend em https://slotbox.shop"
echo "3. Verifique os logs do servidor se houver problemas"
echo "4. Se o problema persistir, considere fazer upgrade do plano no Render.com"
