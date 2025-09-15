#!/bin/bash

# Script de Deploy para Produção
# Executa backup, migrações, testes e deploy

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Verificar se estamos na branch correta
check_branch() {
    log "Verificando branch atual..."
    CURRENT_BRANCH=$(git branch --show-current)
    
    if [ "$CURRENT_BRANCH" != "main" ]; then
        error "Deploy deve ser feito apenas da branch main. Branch atual: $CURRENT_BRANCH"
        exit 1
    fi
    
    success "Branch verificada: $CURRENT_BRANCH"
}

# Verificar se não há mudanças não commitadas
check_clean_working_directory() {
    log "Verificando working directory..."
    
    if ! git diff-index --quiet HEAD --; then
        error "Working directory não está limpo. Faça commit das mudanças antes do deploy."
        exit 1
    fi
    
    success "Working directory limpo"
}

# Fazer backup do banco de dados
backup_database() {
    log "Fazendo backup do banco de dados..."
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="backups/db_before_deploy_${TIMESTAMP}.sql"
    
    # Criar diretório de backup se não existir
    mkdir -p backups
    
    # Fazer backup usando pg_dump
    if command -v pg_dump &> /dev/null; then
        pg_dump $DATABASE_URL > $BACKUP_FILE
        success "Backup criado: $BACKUP_FILE"
    else
        warning "pg_dump não encontrado. Usando script Node.js..."
        cd backend
        node scripts/backup-database.js
        cd ..
        success "Backup criado via script Node.js"
    fi
}

# Executar testes
run_tests() {
    log "Executando testes..."
    
    # Testes unitários
    log "Executando testes unitários..."
    cd tests
    npm run test:unit
    success "Testes unitários passaram"
    
    # Testes de integração
    log "Executando testes de integração..."
    npm run test:integration
    success "Testes de integração passaram"
    
    cd ..
}

# Executar migrações
run_migrations() {
    log "Executando migrações do banco de dados..."
    
    cd backend
    npx prisma migrate deploy
    success "Migrações executadas com sucesso"
    cd ..
}

# Build do frontend
build_frontend() {
    log "Fazendo build do frontend..."
    
    cd frontend
    npm ci
    npm run build
    success "Build do frontend concluído"
    cd ..
}

# Deploy do backend
deploy_backend() {
    log "Fazendo deploy do backend..."
    
    # Verificar se estamos em produção
    if [ "$NODE_ENV" = "production" ]; then
        # Deploy para Render via webhook
        if [ -n "$RENDER_DEPLOY_WEBHOOK" ]; then
            log "Disparando deploy no Render..."
            curl -X POST "$RENDER_DEPLOY_WEBHOOK" || {
                error "Falha ao disparar deploy no Render"
                exit 1
            }
            success "Deploy do backend disparado no Render"
        else
            warning "RENDER_DEPLOY_WEBHOOK não configurado, pulando deploy do backend"
        fi
    else
        # Deploy local ou staging
        log "Deploy local/staging do backend..."
        cd backend
        npm start &
        BACKEND_PID=$!
        echo $BACKEND_PID > ../backend.pid
        cd ..
        success "Backend iniciado localmente (PID: $BACKEND_PID)"
    fi
}

# Deploy do frontend
deploy_frontend() {
    log "Fazendo deploy do frontend..."
    
    # Copiar arquivos para diretório de deploy
    cp -r frontend/dist/* frontend/deploy-files/
    
    if [ "$NODE_ENV" = "production" ]; then
        # Deploy para Hostinger via FTP
        if [ -n "$HOSTINGER_FTP_HOST" ] && [ -n "$HOSTINGER_FTP_USER" ]; then
            log "Fazendo upload para Hostinger..."
            
            # Instalar lftp se não estiver disponível
            if ! command -v lftp &> /dev/null; then
                log "Instalando lftp..."
                if command -v apt-get &> /dev/null; then
                    sudo apt-get update && sudo apt-get install -y lftp
                elif command -v yum &> /dev/null; then
                    sudo yum install -y lftp
                else
                    error "lftp não disponível e não foi possível instalar"
                    exit 1
                fi
            fi
            
            # Upload via FTP
            lftp -c "
                set ftp:ssl-allow no;
                open -u $HOSTINGER_FTP_USER,$HOSTINGER_FTP_PASS $HOSTINGER_FTP_HOST;
                lcd frontend/deploy-files;
                cd public_html;
                mirror -R . . --delete --verbose;
                quit
            " || {
                error "Falha no upload para Hostinger"
                exit 1
            }
            
            success "Deploy do frontend concluído no Hostinger"
        else
            warning "Credenciais do Hostinger não configuradas, pulando deploy do frontend"
        fi
    else
        # Deploy local
        log "Deploy local do frontend..."
        cd frontend
        npm run preview &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > ../frontend.pid
        cd ..
        success "Frontend iniciado localmente (PID: $FRONTEND_PID)"
    fi
}

# Executar smoke tests
run_smoke_tests() {
    log "Executando smoke tests..."
    
    # Testar endpoints principais
    API_URL=${API_URL:-"https://slotbox-api.onrender.com"}
    
    # Health check
    if curl -f -s "$API_URL/api/health" > /dev/null; then
        success "Health check passou"
    else
        error "Health check falhou"
        exit 1
    fi
    
    # Testar endpoint de casos
    if curl -f -s "$API_URL/api/cases" > /dev/null; then
        success "Endpoint de casos funcionando"
    else
        error "Endpoint de casos falhou"
        exit 1
    fi
    
    success "Smoke tests passaram"
}

# Função principal
main() {
    log "Iniciando processo de deploy..."
    
    # Verificações pré-deploy
    check_branch
    check_clean_working_directory
    
    # Backup
    backup_database
    
    # Testes
    run_tests
    
    # Migrações
    run_migrations
    
    # Build
    build_frontend
    
    # Deploy
    deploy_backend
    deploy_frontend
    
    # Smoke tests
    run_smoke_tests
    
    success "Deploy concluído com sucesso! 🚀"
    
    # Criar tag de release
    VERSION=$(date +"%Y.%m.%d.%H%M")
    git tag -a "v$VERSION" -m "Release $VERSION"
    git push origin "v$VERSION"
    
    success "Tag de release criada: v$VERSION"
}

# Executar função principal
main "$@"
