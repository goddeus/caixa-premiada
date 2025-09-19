#!/usr/bin/env node

/**
 * Script para testar CORS localmente
 * Simula requisições do frontend para o backend local
 */

const http = require('http');

const BACKEND_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';

console.log('🧪 Testando CORS localmente...\n');

// Função para fazer requisição HTTP
function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: options.method || 'GET',
      headers: {
        'Origin': FRONTEND_URL,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...options.headers
      },
      timeout: 5000
    };

    const req = http.request(requestOptions, (res) => {
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
      reject(new Error('Timeout - Servidor não está rodando'));
    });

    req.end();
  });
}

// Teste 1: Verificar se servidor está rodando
async function testServerRunning() {
  console.log('1️⃣ Verificando se servidor está rodando...');
  try {
    const response = await makeRequest('/api/health');
    console.log(`   ✅ Status: ${response.statusCode}`);
    console.log(`   📊 CORS Headers:`, response.corsHeaders);
    return true;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    console.log('   💡 Solução: Execute "npm run dev" no diretório backend/');
    return false;
  }
}

// Teste 2: CORS Preflight
async function testCorsPreflight() {
  console.log('\n2️⃣ Testando CORS Preflight...');
  try {
    const response = await makeRequest('/api/cases', {
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
    const response = await makeRequest('/api/cases');
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

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes locais...\n');
  
  const results = {
    serverRunning: await testServerRunning(),
    corsPreflight: await testCorsPreflight(),
    realRequest: await testRealRequest()
  };
  
  console.log('\n📊 RESUMO DOS TESTES LOCAIS:');
  console.log('============================');
  console.log(`Servidor Rodando: ${results.serverRunning ? '✅' : '❌'}`);
  console.log(`CORS Preflight: ${results.corsPreflight ? '✅' : '❌'}`);
  console.log(`Requisição GET: ${results.realRequest ? '✅' : '❌'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 TODOS OS TESTES LOCAIS PASSARAM!');
    console.log('As correções de CORS estão funcionando localmente.');
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('1. Commit as alterações: git add . && git commit -m "Fix CORS"');
    console.log('2. Push para o repositório: git push origin main');
    console.log('3. Aguarde o deploy automático no Render.com');
    console.log('4. Teste em produção: node test-api-connection.js');
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM!');
    console.log('Verifique os problemas acima antes de fazer deploy.');
  }
  
  return allPassed;
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, makeRequest };
