#!/bin/bash

echo "🧠 Ativando Sistema Manipulativo..."

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm install

# 2. Gerar cliente Prisma
echo "🗄️ Gerando cliente Prisma..."
npx prisma generate

# 3. Aplicar migrations
echo "📊 Aplicando migrations..."
npx prisma db push

# 4. Reiniciar servidor
echo "🔄 Reiniciando servidor..."
pm2 restart slotbox-api || npm start

echo "✅ Sistema Manipulativo ativado com sucesso!"
echo "🎯 O sistema agora está configurado para:"
echo "   - RTP dinâmico baseado no comportamento"
echo "   - Técnicas de manipulação psicológica"
echo "   - Sistema de retenção inteligente"
echo "   - Análise comportamental em tempo real"
echo "   - Estratégias de extração de valor"
echo ""
echo "🔗 Endpoints disponíveis:"
echo "   - POST /api/manipulative/cases/:id/buy"
echo "   - POST /api/manipulative/cases/:id/buy-multiple"
echo "   - GET /api/manipulative/user/stats"
echo ""
echo "⚠️ ATENÇÃO: Este sistema é altamente manipulativo e viciante!"
echo "   Use com responsabilidade e em conformidade com as leis locais."