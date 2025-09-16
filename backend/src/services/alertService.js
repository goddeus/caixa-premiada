/**
 * Serviço de Alertas
 * Monitora o sistema e envia alertas quando necessário
 */

const loggingService = require('./loggingService');

class AlertService {
  constructor() {
    this.alerts = new Map();
    this.thresholds = {
      errorRate: 5, // 5% de taxa de erro
      responseTime: 5000, // 5 segundos
      webhookDelay: 300000, // 5 minutos
      lowBalance: 1000, // R$ 1000
      highTransactionVolume: 1000 // 1000 transações por hora
    };
  }

  /**
   * Verifica se deve enviar alerta
   */
  shouldAlert(alertType, value, threshold) {
    const alertKey = `${alertType}_${Date.now()}`;
    const lastAlert = this.alerts.get(alertType);
    
    // Evitar spam de alertas (máximo 1 por minuto)
    if (lastAlert && (Date.now() - lastAlert) < 60000) {
      return false;
    }
    
    // Verificar se valor excede threshold
    if (value > threshold) {
      this.alerts.set(alertType, Date.now());
      return true;
    }
    
    return false;
  }

  /**
   * Alerta de taxa de erro alta
   */
  checkErrorRate(errorCount, totalRequests) {
    const errorRate = (errorCount / totalRequests) * 100;
    
    if (this.shouldAlert('error_rate', errorRate, this.thresholds.errorRate)) {
      this.sendAlert('error_rate', {
        message: `Taxa de erro alta: ${errorRate.toFixed(2)}%`,
        errorCount,
        totalRequests,
        threshold: this.thresholds.errorRate
      });
    }
  }

  /**
   * Alerta de tempo de resposta alto
   */
  checkResponseTime(responseTime, endpoint) {
    if (this.shouldAlert('response_time', responseTime, this.thresholds.responseTime)) {
      this.sendAlert('response_time', {
        message: `Tempo de resposta alto: ${responseTime}ms`,
        endpoint,
        responseTime,
        threshold: this.thresholds.responseTime
      });
    }
  }

  /**
   * Alerta de webhook atrasado
   */
  checkWebhookDelay(webhookType, delay) {
    if (this.shouldAlert('webhook_delay', delay, this.thresholds.webhookDelay)) {
      this.sendAlert('webhook_delay', {
        message: `Webhook ${webhookType} atrasado: ${delay}ms`,
        webhookType,
        delay,
        threshold: this.thresholds.webhookDelay
      });
    }
  }

  /**
   * Alerta de saldo baixo
   */
  checkLowBalance(balance, userId) {
    if (this.shouldAlert('low_balance', this.thresholds.lowBalance - balance, 0)) {
      this.sendAlert('low_balance', {
        message: `Saldo baixo: R$ ${balance.toFixed(2)}`,
        userId,
        balance,
        threshold: this.thresholds.lowBalance
      });
    }
  }

  /**
   * Alerta de volume alto de transações
   */
  checkHighTransactionVolume(transactionCount, timeWindow) {
    if (this.shouldAlert('high_volume', transactionCount, this.thresholds.highTransactionVolume)) {
      this.sendAlert('high_volume', {
        message: `Volume alto de transações: ${transactionCount} em ${timeWindow}`,
        transactionCount,
        timeWindow,
        threshold: this.thresholds.highTransactionVolume
      });
    }
  }

  /**
   * Alerta de falha de pagamento
   */
  alertPaymentFailure(paymentData, error) {
    this.sendAlert('payment_failure', {
      message: `Falha no pagamento: ${error.message}`,
      paymentData,
      error: error.message
    });
  }

  /**
   * Alerta de tentativa de fraude
   */
  alertFraudAttempt(userId, details) {
    this.sendAlert('fraud_attempt', {
      message: `Tentativa de fraude detectada`,
      userId,
      details
    });
  }

  /**
   * Alerta de sistema indisponível
   */
  alertSystemDown(service, error) {
    this.sendAlert('system_down', {
      message: `Serviço ${service} indisponível`,
      service,
      error: error.message
    });
  }

  /**
   * Envia alerta
   */
  sendAlert(type, data) {
    const alert = {
      type,
      timestamp: new Date().toISOString(),
      ...data
    };

    // Log do alerta
    loggingService.error(`ALERTA: ${alert.message}`, alert);

    // Aqui seria implementado o envio real do alerta
    // Por exemplo: email, Slack, Discord, etc.
    this.sendToExternalService(alert);
  }

  /**
   * Envia alerta para serviço externo
   */
  sendToExternalService(alert) {
    // Implementar envio para serviço externo
    // Por exemplo: webhook, email, Slack, etc.
    
    // Por enquanto, apenas log
    console.log('🚨 ALERTA ENVIADO:', alert);
    
    // Exemplo de implementação com webhook:
    /*
    const axios = require('axios');
    
    axios.post(process.env.ALERT_WEBHOOK_URL, {
      text: `🚨 ${alert.message}`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Tipo', value: alert.type, short: true },
          { title: 'Timestamp', value: alert.timestamp, short: true },
          { title: 'Detalhes', value: JSON.stringify(alert, null, 2), short: false }
        ]
      }]
    }).catch(error => {
      loggingService.error('Erro ao enviar alerta', { error: error.message });
    });
    */
  }

  /**
   * Configura thresholds
   */
  setThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
    loggingService.info('Thresholds de alerta atualizados', { thresholds: this.thresholds });
  }

  /**
   * Obtém thresholds atuais
   */
  getThresholds() {
    return this.thresholds;
  }

  /**
   * Limpa alertas antigos
   */
  cleanupOldAlerts() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    for (const [key, timestamp] of this.alerts.entries()) {
      if (now - timestamp > oneHour) {
        this.alerts.delete(key);
      }
    }
  }
}

// Instância singleton
const alertService = new AlertService();

module.exports = alertService;
