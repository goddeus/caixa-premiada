require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Middleware de autenticação simples para teste
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  // Simular usuário autenticado
  req.user = { id: 'test-user-id' };
  next();
};

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Servidor funcionando!'
  });
});

// Teste de depósito PIX
app.post('/payments/deposit/pix', authMiddleware, (req, res) => {
  try {
    console.log('Depósito PIX recebido:', req.body);
    
    const { valor } = req.body;
    
    if (!valor || valor < 20) {
      return res.status(400).json({
        success: false,
        error: 'Valor mínimo para depósito é R$ 20,00'
      });
    }

    if (valor > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Valor máximo para depósito é R$ 10.000,00'
      });
    }

    // Simular resposta do VizzionPay
    const response = {
      success: true,
      message: 'Depósito PIX criado com sucesso',
      payment_id: `test_${Date.now()}`,
      qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      pix_copy_paste: '00020126580014br.gov.bcb.pix0136teste@caixapremiada.com520400005303986540510.005802BR5913Caixa Premiada6008Brasilia62070503***6304',
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      valor: parseFloat(valor)
    };

    console.log('Resposta enviada:', response);
    res.json(response);
    
  } catch (error) {
    console.error('Erro no depósito:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📱 Teste: curl -X POST http://localhost:${PORT}/payments/deposit/pix -H "Content-Type: application/json" -H "Authorization: Bearer test" -d "{\"valor\": 50}"`);
});

