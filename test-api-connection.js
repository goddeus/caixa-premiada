#!/usr/bin/env node

/**
 * Script para testar a conectividade da API
 * Verifica se o servidor está respondendo e se o CORS está configurado corretamente
 */

const https = require('https');
const http = require('http');

const API_URL = 'https://slotbox-api.onrender.com';
const FRONTEND_URL = 'https://slotbox.shop';

console.log('🔍 Testando conectividade da API...\n');

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...options.headers
      },
      timeout: 10000 // 10 segundos
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          corsHeaders: {
            'Access-Control-Allow-Origin': res.headers['access-control-allow-origin'],
            'Access-Control-Allow-Methods': res.headers['access-control-allow-methods'],
            'Access-Control-Allow-Headers': res.headers['access-control-allow-headers'],
            'Access-Control-Allow-Credentials': res.headers['access-control-allow-credentials']
          }
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Teste 1: Health Check
async function testHealthCheck() {
  console.log('1️⃣ Testando Health Check...');
  try {
    const response = await makeRequest(`${API_URL}/api/health`);
    console.log(`   ✅ Status: ${response.statusCode}`);
    console.log(`   📊 CORS Headers:`, response.corsHeaders);
    
    if (response.statusCode === 200) {
      console.log('   🎉 API está funcionando!');
      return true;
    } else {
      console.log('   ⚠️  API retornou status inesperado');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

// Teste 2: CORS Preflight
async function testCorsPreflight() {
  console.log('\n2️⃣ Testando CORS Preflight...');
  try {
    const response = await makeRequest(`${API_URL}/api/cases`, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(`   ✅ Status: ${response.statusCode}`);
    console.log(`   📊 CORS Headers:`, response.corsHeaders);
    
    if (response.statusCode === 200 && response.corsHeaders['Access-Control-Allow-Origin']) {
      console.log('   🎉 CORS Preflight funcionando!');
      return true;
    } else {
      console.log('   ⚠️  CORS Preflight com problemas');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

// Teste 3: Requisição GET real
async function testRealRequest() {
  console.log('\n3️⃣ Testando requisição GET real...');
  try {
    const response = await makeRequest(`${API_URL}/api/cases`);
    console.log(`   ✅ Status: ${response.statusCode}`);
    console.log(`   📊 CORS Headers:`, response.corsHeaders);
    
    if (response.statusCode === 200) {
      console.log('   🎉 Requisição GET funcionando!');
      return true;
    } else {
      console.log('   ⚠️  Requisição GET com problemas');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return false;
  }
}

// Teste 4: Verificar se servidor está "dormindo"
async function testServerWakeUp() {
  console.log('\n4️⃣ Testando se servidor está "acordado"...');
  try {
    const startTime = Date.now();
    const response = await makeRequest(`${API_URL}/api/health`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`   ⏱️  Tempo de resposta: ${responseTime}ms`);
    
    if (responseTime > 5000) {
      console.log('   🐌 Servidor pode estar "dormindo" (Render Free Tier)');
    } else if (responseTime > 2000) {
      console.log('   ⚡ Servidor está lento mas funcionando');
    } else {
      console.log('   🚀 Servidor está rápido!');
    }
    
    return true;
  } catch (error) {
    console.log(`   ❌ Servidor não está respondendo: ${error.message}`);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes de conectividade...\n');
  
  const results = {
    healthCheck: await testHealthCheck(),
    corsPreflight: await testCorsPreflight(),
    realRequest: await testRealRequest(),
    serverWakeUp: await testServerWakeUp()
  };
  
  console.log('\n📊 RESUMO DOS TESTES:');
  console.log('====================');
  console.log(`Health Check: ${results.healthCheck ? '✅' : '❌'}`);
  console.log(`CORS Preflight: ${results.corsPreflight ? '✅' : '❌'}`);
  console.log(`Requisição GET: ${results.realRequest ? '✅' : '❌'}`);
  console.log(`Servidor Ativo: ${results.serverWakeUp ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('A API está funcionando corretamente.');
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM!');
    console.log('Verifique os problemas acima.');
    
    if (!results.healthCheck) {
      console.log('\n💡 SOLUÇÕES SUGERIDAS:');
      console.log('1. Verifique se o servidor está rodando no Render.com');
      console.log('2. Aguarde alguns minutos (Render Free Tier pode estar "dormindo")');
      console.log('3. Verifique os logs do servidor no Render.com');
      console.log('4. Considere fazer upgrade para um plano pago se necessário');
    }
  }
  
  return allPassed;
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, makeRequest };
