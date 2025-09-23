// Configurar proxy para usar IPs estáticos do Render
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Configurar proxy para bypass do Cloudflare
const pixupProxy = createProxyMiddleware({
  target: 'https://api.pixupbr.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/pixup-proxy': '' // Remove o prefixo
  },
  onProxyReq: (proxyReq, req, res) => {
    // Forçar uso de IPs estáticos do Render
    proxyReq.setHeader('X-Forwarded-For', '35.160.120.126');
    proxyReq.setHeader('X-Real-IP', '35.160.120.126');
    proxyReq.setHeader('User-Agent', 'SlotBox-Render/1.0');
  },
  onError: (err, req, res) => {
    console.error('Erro no proxy Pixup:', err);
    res.status(500).json({
      success: false,
      message: 'Erro no proxy Pixup: ' + err.message
    });
  }
});

module.exports = pixupProxy;
