#!/bin/bash

# Script de Configuração de Ambiente
# Configura variáveis de ambiente e dependências para deploy

set -e

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

# Função para verificar dependências
check_dependencies() {
    log "Verificando dependências..."
    
    local missing_deps=()
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    else
        local node_version=$(node --version)
        success "Node.js: $node_version"
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    else
        local npm_version=$(npm --version)
        success "npm: $npm_version"
    fi
    
    # Verificar git
    if ! command -v git &> /dev/null; then
        missing_deps+=("git")
    else
        local git_version=$(git --version)
        success "Git: $git_version"
    fi
    
    # Verificar curl
    if ! command -v curl &> /dev/null; then
        missing_deps+=("curl")
    else
        success "curl: Disponível"
    fi
    
    # Verificar jq (para parsing JSON)
    if ! command -v jq &> /dev/null; then
        missing_deps+=("jq")
    else
        success "jq: Disponível"
    fi
    
    # Verificar bc (para cálculos)
    if ! command -v bc &> /dev/null; then
        missing_deps+=("bc")
    else
        success "bc: Disponível"
    fi
    
    if [ ${#missing_deps[@]} -gt 0 ]; then
        error "Dependências faltando: ${missing_deps[*]}"
        return 1
    fi
    
    success "Todas as dependências estão disponíveis"
    return 0
}

# Função para instalar dependências
install_dependencies() {
    log "Instalando dependências faltando..."
    
    if command -v apt-get &> /dev/null; then
        # Ubuntu/Debian
        sudo apt-get update
        sudo apt-get install -y curl jq bc lftp
    elif command -v yum &> /dev/null; then
        # CentOS/RHEL
        sudo yum install -y curl jq bc lftp
    elif command -v brew &> /dev/null; then
        # macOS
        brew install curl jq bc lftp
    else
        error "Gerenciador de pacotes não suportado"
        return 1
    fi
    
    success "Dependências instaladas"
}

# Função para configurar variáveis de ambiente
setup_environment() {
    log "Configurando variáveis de ambiente..."
    
    local env_file=".env.deploy"
    
    # Criar arquivo de ambiente se não existir
    if [ ! -f "$env_file" ]; then
        cat > "$env_file" << EOF
# Configurações de Deploy
NODE_ENV=production

# URLs
API_URL=https://slotbox-api.onrender.com
FRONTEND_URL=https://slotbox.shop

# Render (Backend)
RENDER_DEPLOY_WEBHOOK=

# Hostinger (Frontend)
HOSTINGER_FTP_HOST=
HOSTINGER_FTP_USER=
HOSTINGER_FTP_PASS=

# Banco de Dados
DATABASE_URL=

# VizzionPay
VIZZION_PUBLIC_KEY=
VIZZION_SECRET_KEY=

# JWT
JWT_SECRET=

# Outros
FRONTEND_URL=https://slotbox.shop
VITE_API_URL=https://slotbox-api.onrender.com/api
EOF
        success "Arquivo de ambiente criado: $env_file"
    else
        log "Arquivo de ambiente já existe: $env_file"
    fi
    
    # Carregar variáveis de ambiente
    if [ -f "$env_file" ]; then
        source "$env_file"
        success "Variáveis de ambiente carregadas"
    fi
}

# Função para verificar configuração
verify_configuration() {
    log "Verificando configuração..."
    
    local missing_config=()
    
    # Verificar variáveis críticas
    if [ -z "$DATABASE_URL" ]; then
        missing_config+=("DATABASE_URL")
    fi
    
    if [ -z "$JWT_SECRET" ]; then
        missing_config+=("JWT_SECRET")
    fi
    
    if [ -z "$VIZZION_PUBLIC_KEY" ]; then
        missing_config+=("VIZZION_PUBLIC_KEY")
    fi
    
    if [ -z "$VIZZION_SECRET_KEY" ]; then
        missing_config+=("VIZZION_SECRET_KEY")
    fi
    
    if [ ${#missing_config[@]} -gt 0 ]; then
        warning "Configurações faltando: ${missing_config[*]}"
        warning "Configure essas variáveis no arquivo .env.deploy"
        return 1
    fi
    
    success "Configuração verificada"
    return 0
}

# Função para configurar Git
setup_git() {
    log "Configurando Git..."
    
    # Verificar se estamos em um repositório Git
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Não estamos em um repositório Git"
        return 1
    fi
    
    # Configurar remote se não existir
    if ! git remote get-url origin > /dev/null 2>&1; then
        warning "Remote 'origin' não configurado"
        log "Configure com: git remote add origin <url>"
    else
        local origin_url=$(git remote get-url origin)
        success "Git remote: $origin_url"
    fi
    
    # Verificar branch atual
    local current_branch=$(git branch --show-current)
    success "Branch atual: $current_branch"
    
    # Verificar se há mudanças não commitadas
    if ! git diff-index --quiet HEAD --; then
        warning "Há mudanças não commitadas"
        log "Faça commit das mudanças antes do deploy"
    else
        success "Working directory limpo"
    fi
}

# Função para configurar permissões
setup_permissions() {
    log "Configurando permissões..."
    
    # Tornar scripts executáveis
    chmod +x scripts/*.sh
    
    success "Permissões configuradas"
}

# Função para testar conectividade
test_connectivity() {
    log "Testando conectividade..."
    
    # Testar conexão com API
    if curl -s -f "$API_URL/api/health" > /dev/null 2>&1; then
        success "API: Conectividade OK"
    else
        warning "API: Conectividade falhou"
    fi
    
    # Testar conexão com Frontend
    if curl -s -f "$FRONTEND_URL" > /dev/null 2>&1; then
        success "Frontend: Conectividade OK"
    else
        warning "Frontend: Conectividade falhou"
    fi
}

# Função para mostrar resumo
show_summary() {
    log "Resumo da configuração:"
    echo "  • Node.js: $(node --version 2>/dev/null || echo 'Não instalado')"
    echo "  • npm: $(npm --version 2>/dev/null || echo 'Não instalado')"
    echo "  • Git: $(git --version 2>/dev/null || echo 'Não instalado')"
    echo "  • Branch: $(git branch --show-current 2>/dev/null || echo 'N/A')"
    echo "  • API URL: ${API_URL:-'Não configurado'}"
    echo "  • Frontend URL: ${FRONTEND_URL:-'Não configurado'}"
    echo "  • Ambiente: ${NODE_ENV:-'Não configurado'}"
}

# Função principal
main() {
    log "Iniciando configuração de ambiente..."
    
    # Verificar dependências
    if ! check_dependencies; then
        log "Instalando dependências faltando..."
        install_dependencies
    fi
    
    # Configurar ambiente
    setup_environment
    
    # Verificar configuração
    verify_configuration
    
    # Configurar Git
    setup_git
    
    # Configurar permissões
    setup_permissions
    
    # Testar conectividade
    test_connectivity
    
    # Mostrar resumo
    show_summary
    
    success "Configuração de ambiente concluída!"
    
    log "Próximos passos:"
    echo "  1. Configure as variáveis faltando no arquivo .env.deploy"
    echo "  2. Execute: ./scripts/deploy.sh"
    echo "  3. Monitore com: ./scripts/monitor-deployment.sh"
}

# Executar função principal
main "$@"
