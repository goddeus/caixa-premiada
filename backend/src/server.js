require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware básico
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://slotbox.shop',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Rota de teste simples
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste do banco
app.get('/api/db-test', async (req, res) => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Testar conexão
    await prisma.$connect();
    
    // Contar usuários
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Banco funcionando',
      totalUsers: userCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro no banco',
      error: error.message
    });
  }
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo deu errado'
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'https://slotbox.shop'}`);
});

module.exports = app;