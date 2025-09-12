const vizzionPayService = require('../services/vizzionPayService');
const crypto = require('crypto');

class WebhookController {
  // Webhook da VizzionPay
  async vizzionPayWebhook(req, res) {
    try {
      const payload = req.body;
      const signature = req.headers['x-vizzionpay-signature'] || req.headers['signature'];

      console.log('Webhook VizzionPay recebido:', {
        event: payload.event,
        payment_id: payload.payment_id,
        status: payload.status,
        timestamp: new Date().toISOString()
      });

      // Validar assinatura do webhook
      if (!vizzionPayService.validateWebhook(payload, signature)) {
        console.error('Assinatura do webhook inválida');
        return res.status(401).json({ error: 'Assinatura inválida' });
      }

      // Processar webhook
      await vizzionPayService.processWebhook(payload);

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro ao processar webhook VizzionPay:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Webhook genérico para outros gateways
  async genericWebhook(req, res) {
    try {
      const gateway = req.params.gateway;
      const payload = req.body;

      console.log(`Webhook ${gateway} recebido:`, {
        gateway,
        payload: JSON.stringify(payload),
        timestamp: new Date().toISOString()
      });

      // Aqui você pode implementar lógica específica para outros gateways
      // Por exemplo: Mercado Pago, PagSeguro, etc.

      res.status(200).json({ success: true });
    } catch (error) {
      console.error(`Erro ao processar webhook ${req.params.gateway}:`, error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Endpoint para testar webhooks (apenas em desenvolvimento)
  async testWebhook(req, res) {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Endpoint não disponível em produção' });
      }

      const { payment_id, status = 'paid' } = req.body;

      if (!payment_id) {
        return res.status(400).json({ error: 'payment_id é obrigatório' });
      }

      // Simular webhook da VizzionPay
      const mockPayload = {
        event: 'payment.updated',
        payment_id: payment_id,
        status: status,
        amount: 100.00,
        paid_at: status === 'paid' ? new Date().toISOString() : null
      };

      await vizzionPayService.processWebhook(mockPayload);

      res.json({
        success: true,
        message: 'Webhook simulado com sucesso',
        payload: mockPayload
      });
    } catch (error) {
      console.error('Erro ao simular webhook:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  // Endpoint para simular pagamento (apenas em desenvolvimento)
  async simulatePayment(req, res) {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Endpoint não disponível em produção' });
      }

      const { payment_id, status = 'paid' } = req.body;

      if (!payment_id) {
        return res.status(400).json({ error: 'payment_id é obrigatório' });
      }

      const result = await vizzionPayService.simulatePayment(payment_id, status);

      res.json({
        success: true,
        message: 'Pagamento simulado com sucesso',
        result
      });
    } catch (error) {
      console.error('Erro ao simular pagamento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = WebhookController;
