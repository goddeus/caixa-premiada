#!/bin/bash

# ===========================================
# SCRIPT DE DEPLOY PARA PRODUÇÃO
# ===========================================

echo "🚀 Iniciando deploy para produção..."

# 1. Backup do banco de dados atual
echo "📦 Fazendo backup do banco de dados..."
cd backend
node export-database.js
cd ..

# 2. Build do frontend
echo "🔨 Fazendo build do frontend..."
cd frontend
npm run build
echo "✅ Frontend buildado com sucesso!"

# 3. Preparar arquivos para upload
echo "📁 Preparando arquivos para upload..."
mkdir -p deploy-files
cp -r dist/* deploy-files/
cp -r public/imagens deploy-files/

# 4. Criar arquivo de configuração para Hostinger
echo "⚙️ Criando configuração para Hostinger..."
cat > deploy-files/.htaccess << 'EOF'
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.html [QSA,L]

# Compressão
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/webp "access plus 1 year"
</IfModule>
EOF

echo "✅ Arquivos preparados em: deploy-files/"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Faça upload da pasta 'deploy-files' para o Hostinger"
echo "2. Configure o banco PostgreSQL no Hostinger"
echo "3. Configure as variáveis de ambiente no Render"
echo "4. Configure o VizzionPay com as chaves reais"
echo ""
echo "🎉 Deploy preparado com sucesso!"
