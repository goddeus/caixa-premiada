#!/bin/bash

# Script de Monitoramento de Deploy
# Monitora o status do deploy e executa verificações de saúde

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

# Configurações
API_URL=${API_URL:-"https://slotbox-api.onrender.com"}
FRONTEND_URL=${FRONTEND_URL:-"https://slotbox.shop"}
MAX_RETRIES=30
RETRY_INTERVAL=10

# Função para verificar endpoint
check_endpoint() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        success "$name: OK ($response)"
        return 0
    else
        error "$name: FAILED ($response)"
        return 1
    fi
}

# Função para verificar endpoint com timeout
check_endpoint_with_timeout() {
    local url=$1
    local name=$2
    local timeout=${3:-30}
    
    local response=$(timeout $timeout curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "200" ]; then
        success "$name: OK ($response)"
        return 0
    else
        error "$name: FAILED ($response) - Timeout: ${timeout}s"
        return 1
    fi
}

# Função para verificar resposta JSON
check_json_response() {
    local url=$1
    local name=$2
    local expected_field=$3
    
    local response=$(curl -s "$url" 2>/dev/null || echo "{}")
    
    if echo "$response" | jq -e ".$expected_field" > /dev/null 2>&1; then
        success "$name: JSON OK ($expected_field found)"
        return 0
    else
        error "$name: JSON FAILED ($expected_field not found)"
        return 1
    fi
}

# Função para aguardar deploy
wait_for_deployment() {
    local service=$1
    local url=$2
    local retries=0
    
    log "Aguardando deploy do $service..."
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if check_endpoint_with_timeout "$url" "$service" 5; then
            success "$service está online!"
            return 0
        fi
        
        retries=$((retries + 1))
        log "Tentativa $retries/$MAX_RETRIES - Aguardando ${RETRY_INTERVAL}s..."
        sleep $RETRY_INTERVAL
    done
    
    error "$service não ficou online após $MAX_RETRIES tentativas"
    return 1
}

# Função para verificar saúde completa
check_health() {
    log "Verificando saúde completa do sistema..."
    
    local failed_checks=0
    
    # 1. Verificar API básica
    if ! check_endpoint "$API_URL/api/health" "API Health"; then
        failed_checks=$((failed_checks + 1))
    fi
    
    # 2. Verificar endpoint de casos
    if ! check_endpoint "$API_URL/api/cases" "API Cases"; then
        failed_checks=$((failed_checks + 1))
    fi
    
    # 3. Verificar resposta JSON da API
    if ! check_json_response "$API_URL/api/cases" "API JSON" "cases"; then
        failed_checks=$((failed_checks + 1))
    fi
    
    # 4. Verificar frontend
    if ! check_endpoint "$FRONTEND_URL" "Frontend"; then
        failed_checks=$((failed_checks + 1))
    fi
    
    # 5. Verificar se frontend carrega corretamente
    local frontend_content=$(curl -s "$FRONTEND_URL" 2>/dev/null || echo "")
    if echo "$frontend_content" | grep -q "SlotBox\|Caixa Premiada"; then
        success "Frontend: Conteúdo OK"
    else
        error "Frontend: Conteúdo inválido"
        failed_checks=$((failed_checks + 1))
    fi
    
    return $failed_checks
}

# Função para verificar performance
check_performance() {
    log "Verificando performance do sistema..."
    
    local api_time=$(curl -s -o /dev/null -w "%{time_total}" "$API_URL/api/health" 2>/dev/null || echo "999")
    local frontend_time=$(curl -s -o /dev/null -w "%{time_total}" "$FRONTEND_URL" 2>/dev/null || echo "999")
    
    # Converter para milissegundos
    local api_ms=$(echo "$api_time * 1000" | bc)
    local frontend_ms=$(echo "$frontend_time * 1000" | bc)
    
    log "Tempo de resposta API: ${api_ms}ms"
    log "Tempo de resposta Frontend: ${frontend_ms}ms"
    
    # Verificar se está dentro dos limites aceitáveis
    if (( $(echo "$api_ms < 2000" | bc -l) )); then
        success "API: Performance OK"
    else
        warning "API: Performance lenta (${api_ms}ms)"
    fi
    
    if (( $(echo "$frontend_ms < 3000" | bc -l) )); then
        success "Frontend: Performance OK"
    else
        warning "Frontend: Performance lenta (${frontend_ms}ms)"
    fi
}

# Função para verificar logs de erro
check_error_logs() {
    log "Verificando logs de erro..."
    
    # Aqui você adicionaria verificações específicas de logs
    # Por exemplo, verificar se há muitos erros 500 nos últimos minutos
    
    success "Verificação de logs concluída"
}

# Função para gerar relatório
generate_report() {
    local status=$1
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
    
    log "Gerando relatório de monitoramento..."
    
    cat > "deployment-monitor-report-$(date +%Y%m%d-%H%M%S).json" << EOF
{
  "timestamp": "$timestamp",
  "status": "$status",
  "api_url": "$API_URL",
  "frontend_url": "$FRONTEND_URL",
  "checks": {
    "api_health": $(check_endpoint "$API_URL/api/health" "API Health" > /dev/null 2>&1 && echo "true" || echo "false"),
    "api_cases": $(check_endpoint "$API_URL/api/cases" "API Cases" > /dev/null 2>&1 && echo "true" || echo "false"),
    "frontend": $(check_endpoint "$FRONTEND_URL" "Frontend" > /dev/null 2>&1 && echo "true" || echo "false")
  },
  "performance": {
    "api_response_time": "$(curl -s -o /dev/null -w "%{time_total}" "$API_URL/api/health" 2>/dev/null || echo "999")",
    "frontend_response_time": "$(curl -s -o /dev/null -w "%{time_total}" "$FRONTEND_URL" 2>/dev/null || echo "999")"
  }
}
EOF
    
    success "Relatório gerado: deployment-monitor-report-$(date +%Y%m%d-%H%M%S).json"
}

# Função principal
main() {
    log "Iniciando monitoramento de deploy..."
    
    # Aguardar deploy se especificado
    if [ "$1" = "wait" ]; then
        wait_for_deployment "Backend" "$API_URL/api/health"
        wait_for_deployment "Frontend" "$FRONTEND_URL"
    fi
    
    # Verificar saúde
    if check_health; then
        success "Sistema saudável!"
        
        # Verificar performance
        check_performance
        
        # Verificar logs
        check_error_logs
        
        # Gerar relatório
        generate_report "healthy"
        
        exit 0
    else
        error "Sistema com problemas!"
        
        # Gerar relatório de erro
        generate_report "unhealthy"
        
        exit 1
    fi
}

# Executar função principal
main "$@"
