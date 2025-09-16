/**
 * Serviço de Logging Estruturado
 * Centraliza todos os logs do sistema com diferentes níveis e formatos
 */

const fs = require('fs');
const path = require('path');

class LoggingService {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.ensureLogDirectory();
  }

  /**
   * Garante que o diretório de logs existe
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Formata timestamp para logs
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Formata log entry
   */
  formatLogEntry(level, message, metadata = {}) {
    return JSON.stringify({
      timestamp: this.getTimestamp(),
      level,
      message,
      ...metadata
    }) + '\n';
  }

  /**
   * Escreve log em arquivo
   */
  writeToFile(filename, content) {
    try {
      const filePath = path.join(this.logDir, filename);
      fs.appendFileSync(filePath, content);
    } catch (error) {
      console.error('Erro ao escrever log:', error);
    }
  }

  /**
   * Log de erro
   */
  error(message, metadata = {}) {
    const logEntry = this.formatLogEntry('ERROR', message, metadata);
    this.writeToFile('error.log', logEntry);
    console.error(`[ERROR] ${message}`, metadata);
  }

  /**
   * Log de warning
   */
  warn(message, metadata = {}) {
    const logEntry = this.formatLogEntry('WARN', message, metadata);
    this.writeToFile('warn.log', logEntry);
    console.warn(`[WARN] ${message}`, metadata);
  }

  /**
   * Log de informação
   */
  info(message, metadata = {}) {
    const logEntry = this.formatLogEntry('INFO', message, metadata);
    this.writeToFile('info.log', logEntry);
    console.info(`[INFO] ${message}`, metadata);
  }

  /**
   * Log de debug
   */
  debug(message, metadata = {}) {
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
      const logEntry = this.formatLogEntry('DEBUG', message, metadata);
      this.writeToFile('debug.log', logEntry);
      console.debug(`[DEBUG] ${message}`, metadata);
    }
  }

  /**
   * Log de transação financeira
   */
  transaction(type, userId, amount, metadata = {}) {
    const logEntry = this.formatLogEntry('TRANSACTION', `Transação ${type}`, {
      type,
      userId,
      amount,
      ...metadata
    });
    this.writeToFile('transactions.log', logEntry);
    this.info(`Transação ${type}`, { userId, amount, ...metadata });
  }

  /**
   * Log de pagamento VizzionPay
   */
  payment(action, data, metadata = {}) {
    const logEntry = this.formatLogEntry('PAYMENT', `Pagamento ${action}`, {
      action,
      data: this.sanitizePaymentData(data),
      ...metadata
    });
    this.writeToFile('payments.log', logEntry);
    this.info(`Pagamento ${action}`, { ...metadata });
  }

  /**
   * Log de webhook
   */
  webhook(provider, event, data, metadata = {}) {
    const logEntry = this.formatLogEntry('WEBHOOK', `Webhook ${provider}`, {
      provider,
      event,
      data: this.sanitizeWebhookData(data),
      ...metadata
    });
    this.writeToFile('webhooks.log', logEntry);
    this.info(`Webhook ${provider} - ${event}`, { ...metadata });
  }

  /**
   * Log de auditoria
   */
  audit(action, userId, resource, metadata = {}) {
    const logEntry = this.formatLogEntry('AUDIT', `Auditoria ${action}`, {
      action,
      userId,
      resource,
      ...metadata
    });
    this.writeToFile('audit.log', logEntry);
    this.info(`Auditoria ${action}`, { userId, resource, ...metadata });
  }

  /**
   * Log de performance
   */
  performance(operation, duration, metadata = {}) {
    const logEntry = this.formatLogEntry('PERFORMANCE', `Performance ${operation}`, {
      operation,
      duration,
      ...metadata
    });
    this.writeToFile('performance.log', logEntry);
    this.info(`Performance ${operation}`, { duration, ...metadata });
  }

  /**
   * Log de segurança
   */
  security(event, metadata = {}) {
    const logEntry = this.formatLogEntry('SECURITY', `Segurança ${event}`, {
      event,
      ...metadata
    });
    this.writeToFile('security.log', logEntry);
    this.warn(`Segurança ${event}`, { ...metadata });
  }

  /**
   * Sanitiza dados de pagamento (remove informações sensíveis)
   */
  sanitizePaymentData(data) {
    if (!data) return data;
    
    const sanitized = { ...data };
    
    // Remover campos sensíveis
    delete sanitized.cpf;
    delete sanitized.cnpj;
    delete sanitized.cardNumber;
    delete sanitized.cvv;
    delete sanitized.expiryDate;
    
    // Mascarar dados sensíveis
    if (sanitized.email) {
      sanitized.email = this.maskEmail(sanitized.email);
    }
    
    if (sanitized.phone) {
      sanitized.phone = this.maskPhone(sanitized.phone);
    }
    
    return sanitized;
  }

  /**
   * Sanitiza dados de webhook
   */
  sanitizeWebhookData(data) {
    if (!data) return data;
    
    const sanitized = { ...data };
    
    // Remover campos sensíveis
    delete sanitized.signature;
    delete sanitized.token;
    delete sanitized.secret;
    
    return sanitized;
  }

  /**
   * Mascara email
   */
  maskEmail(email) {
    if (!email) return email;
    const [local, domain] = email.split('@');
    if (local.length <= 2) return email;
    return `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
  }

  /**
   * Mascara telefone
   */
  maskPhone(phone) {
    if (!phone) return phone;
    if (phone.length <= 4) return phone;
    return `${phone.slice(0, 2)}${'*'.repeat(phone.length - 4)}${phone.slice(-2)}`;
  }

  /**
   * Limpa logs antigos (executar via cron)
   */
  cleanupOldLogs(daysToKeep = 30) {
    try {
      const files = fs.readdirSync(this.logDir);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      files.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          this.info(`Log antigo removido: ${file}`);
        }
      });
    } catch (error) {
      this.error('Erro ao limpar logs antigos', { error: error.message });
    }
  }

  /**
   * Exporta logs para análise
   */
  exportLogs(startDate, endDate, logTypes = []) {
    try {
      const exportData = {
        exportDate: this.getTimestamp(),
        startDate,
        endDate,
        logs: []
      };

      const files = fs.readdirSync(this.logDir);
      
      files.forEach(file => {
        if (logTypes.length > 0 && !logTypes.some(type => file.includes(type))) {
          return;
        }

        const filePath = path.join(this.logDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        
        lines.forEach(line => {
          try {
            const logEntry = JSON.parse(line);
            const logDate = new Date(logEntry.timestamp);
            
            if (logDate >= startDate && logDate <= endDate) {
              exportData.logs.push(logEntry);
            }
          } catch (error) {
            // Ignorar linhas que não são JSON válido
          }
        });
      });

      return exportData;
    } catch (error) {
      this.error('Erro ao exportar logs', { error: error.message });
      return null;
    }
  }
}

// Instância singleton
const loggingService = new LoggingService();

module.exports = loggingService;
