#!/bin/bash

# Script de Rollback para Produção
# Restaura backup do banco e reverte deploy

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

# Verificar parâmetros
if [ $# -eq 0 ]; then
    error "Uso: $0 <backup_file> [tag_version]"
    echo "Exemplo: $0 backups/db_before_deploy_20241215_143022.sql v2024.12.15.1430"
    exit 1
fi

BACKUP_FILE=$1
TAG_VERSION=${2:-"latest"}

# Verificar se arquivo de backup existe
check_backup_file() {
    log "Verificando arquivo de backup..."
    
    if [ ! -f "$BACKUP_FILE" ]; then
        error "Arquivo de backup não encontrado: $BACKUP_FILE"
        exit 1
    fi
    
    success "Arquivo de backup encontrado: $BACKUP_FILE"
}

# Fazer backup do estado atual antes do rollback
backup_current_state() {
    log "Fazendo backup do estado atual antes do rollback..."
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    CURRENT_BACKUP="backups/db_before_rollback_${TIMESTAMP}.sql"
    
    # Fazer backup do estado atual
    if command -v pg_dump &> /dev/null; then
        pg_dump $DATABASE_URL > $CURRENT_BACKUP
        success "Backup do estado atual criado: $CURRENT_BACKUP"
    else
        warning "pg_dump não encontrado. Usando script Node.js..."
        cd backend
        node scripts/backup-database.js
        cd ..
        success "Backup do estado atual criado via script Node.js"
    fi
}

# Restaurar banco de dados
restore_database() {
    log "Restaurando banco de dados..."
    
    # Parar aplicação se estiver rodando
    warning "Parando aplicação..."
    # Aqui você adicionaria comandos para parar a aplicação
    
    # Restaurar banco
    if command -v psql &> /dev/null; then
        psql $DATABASE_URL < $BACKUP_FILE
        success "Banco de dados restaurado"
    else
        error "psql não encontrado. Não é possível restaurar o banco."
        exit 1
    fi
}

# Reverter código para versão anterior
revert_code() {
    log "Revertendo código para versão anterior..."
    
    if [ "$TAG_VERSION" != "latest" ]; then
        # Reverter para tag específica
        git checkout $TAG_VERSION
        success "Código revertido para tag: $TAG_VERSION"
    else
        # Reverter para commit anterior
        git reset --hard HEAD~1
        success "Código revertido para commit anterior"
    fi
}

# Rebuild e redeploy
rebuild_and_redeploy() {
    log "Fazendo rebuild e redeploy..."
    
    # Build do frontend
    cd frontend
    npm ci
    npm run build
    success "Build do frontend concluído"
    cd ..
    
    # Deploy baseado no ambiente
    if [ "$NODE_ENV" = "production" ]; then
        # Deploy para produção
        if [ -n "$RENDER_DEPLOY_WEBHOOK" ]; then
            log "Disparando redeploy no Render..."
            curl -X POST "$RENDER_DEPLOY_WEBHOOK" || {
                error "Falha ao disparar redeploy no Render"
                exit 1
            }
        fi
        
        if [ -n "$HOSTINGER_FTP_HOST" ] && [ -n "$HOSTINGER_FTP_USER" ]; then
            log "Fazendo upload para Hostinger..."
            lftp -c "
                set ftp:ssl-allow no;
                open -u $HOSTINGER_FTP_USER,$HOSTINGER_FTP_PASS $HOSTINGER_FTP_HOST;
                lcd frontend/dist;
                cd public_html;
                mirror -R . . --delete --verbose;
                quit
            " || {
                error "Falha no upload para Hostinger"
                exit 1
            }
        fi
    else
        # Deploy local
        log "Iniciando serviços localmente..."
        cd backend && npm start &
        cd frontend && npm run preview &
        success "Serviços iniciados localmente"
    fi
    
    success "Redeploy concluído"
}

# Executar smoke tests
run_smoke_tests() {
    log "Executando smoke tests após rollback..."
    
    # Aguardar aplicação inicializar
    sleep 10
    
    # Testar endpoints principais
    API_URL=${API_URL:-"https://slotbox-api.onrender.com"}
    
    # Health check
    if curl -f -s "$API_URL/api/health" > /dev/null; then
        success "Health check passou"
    else
        error "Health check falhou após rollback"
        exit 1
    fi
    
    # Testar endpoint de casos
    if curl -f -s "$API_URL/api/cases" > /dev/null; then
        success "Endpoint de casos funcionando"
    else
        error "Endpoint de casos falhou após rollback"
        exit 1
    fi
    
    success "Smoke tests passaram após rollback"
}

# Verificar integridade dos dados
verify_data_integrity() {
    log "Verificando integridade dos dados..."
    
    cd backend
    
    # Executar script de verificação de integridade
    if [ -f "scripts/verify-data-integrity.js" ]; then
        node scripts/verify-data-integrity.js
        success "Verificação de integridade concluída"
    else
        warning "Script de verificação de integridade não encontrado"
    fi
    
    cd ..
}

# Função principal
main() {
    log "Iniciando processo de rollback..."
    warning "ATENÇÃO: Este processo irá reverter o sistema para um estado anterior!"
    
    # Confirmação do usuário
    read -p "Tem certeza que deseja continuar? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Rollback cancelado pelo usuário"
        exit 0
    fi
    
    # Verificações
    check_backup_file
    
    # Backup do estado atual
    backup_current_state
    
    # Restaurar banco
    restore_database
    
    # Reverter código
    revert_code
    
    # Rebuild e redeploy
    rebuild_and_redeploy
    
    # Verificar integridade
    verify_data_integrity
    
    # Smoke tests
    run_smoke_tests
    
    success "Rollback concluído com sucesso! 🔄"
    
    # Log do rollback
    log "Rollback realizado:"
    log "  - Backup restaurado: $BACKUP_FILE"
    log "  - Versão revertida: $TAG_VERSION"
    log "  - Timestamp: $(date)"
}

# Executar função principal
main "$@"
