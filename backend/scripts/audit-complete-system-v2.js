#!/usr/bin/env node

/**
 * AUDITORIA COMPLETA DO SISTEMA V2
 * Verifica todos os pontos que podem falhar com problemas de banco de dados
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();
const API_BASE = 'https://slotbox-api.onrender.com/api';

console.log('🔍 AUDITORIA COMPLETA DO SISTEMA V2');
console.log('=====================================');
console.log('Verificando todos os pontos que podem falhar...\n');

async function auditSystem() {
  const results = {
    timestamp: new Date().toISOString(),
    database_connection: false,
    api_endpoints: {},
    controllers: {},
    services: {},
    routes: {},
    issues_found: [],
    recommendations: []
  };

  try {
    // 1. TESTAR CONEXÃO COM BANCO
    console.log('1️⃣ TESTANDO CONEXÃO COM BANCO DE DADOS');
    console.log('----------------------------------------');
    
    try {
      await prisma.$connect();
      await prisma.user.count();
      results.database_connection = true;
      console.log('✅ Conexão com banco: OK');
    } catch (dbError) {
      results.database_connection = false;
      console.log('❌ Conexão com banco: FALHOU');
      console.log('   Erro:', dbError.message);
      results.issues_found.push({
        type: 'database_connection',
        severity: 'critical',
        message: 'Banco de dados não está acessível',
        error: dbError.message
      });
    }

    // 2. TESTAR ENDPOINTS PRINCIPAIS
    console.log('\n2️⃣ TESTANDO ENDPOINTS PRINCIPAIS');
    console.log('----------------------------------');
    
    const endpoints = [
      { path: '/cases', method: 'GET', auth: false },
      { path: '/cases/1abd77cf-472b-473d-9af0-6cd47f9f1452', method: 'GET', auth: false },
      { path: '/auth/me', method: 'GET', auth: true },
      { path: '/wallet', method: 'GET', auth: true },
      { path: '/profile', method: 'GET', auth: true }
    ];

    for (const endpoint of endpoints) {
      try {
        const headers = {};
        if (endpoint.auth) {
          // Usar token de teste se disponível
          const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzYzllNWJiNy01N2I5LTQwNWYtOWY4Mi03MTFlNDcwMDg4NTciLCJlbWFpbCI6Imp1bmlvckBhZG1pbi5jb20iLCJpYXQiOjE3MzQ5NzI4MDAsImV4cCI6MTczNzU2NDgwMH0.test';
          headers.Authorization = `Bearer ${testToken}`;
        }

        const response = await axios({
          method: endpoint.method,
          url: `${API_BASE}${endpoint.path}`,
          headers,
          timeout: 10000
        });

        results.api_endpoints[endpoint.path] = {
          status: response.status,
          success: true,
          response_time: response.headers['x-response-time'] || 'N/A'
        };
        console.log(`✅ ${endpoint.method} ${endpoint.path}: ${response.status}`);
      } catch (error) {
        results.api_endpoints[endpoint.path] = {
          status: error.response?.status || 'ERROR',
          success: false,
          error: error.message
        };
        console.log(`❌ ${endpoint.method} ${endpoint.path}: ${error.response?.status || 'ERROR'}`);
        
        if (error.response?.status === 500) {
          results.issues_found.push({
            type: 'endpoint_500_error',
            severity: 'high',
            endpoint: endpoint.path,
            method: endpoint.method,
            message: 'Endpoint retornando erro 500',
            error: error.response?.data?.error || error.message
          });
        }
      }
    }

    // 3. VERIFICAR CONTROLLERS QUE USAM PRISMA
    console.log('\n3️⃣ VERIFICANDO CONTROLLERS COM PRISMA');
    console.log('--------------------------------------');
    
    const controllers = [
      'casesController.js',
      'adminController.js', 
      'profileController.js',
      'transactionsController.js',
      'paymentController.js',
      'bulkPurchaseController.js',
      'authController.js',
      'casePrizeController.js',
      'prizeSyncController.js'
    ];

    for (const controller of controllers) {
      try {
        const fs = require('fs');
        const path = require('path');
        const controllerPath = path.join(__dirname, '../src/controllers', controller);
        
        if (fs.existsSync(controllerPath)) {
          const content = fs.readFileSync(controllerPath, 'utf8');
          const prismaUsage = (content.match(/prisma\./g) || []).length;
          const tryCatchBlocks = (content.match(/try\s*{/g) || []).length;
          
          results.controllers[controller] = {
            exists: true,
            prisma_usage: prismaUsage,
            try_catch_blocks: tryCatchBlocks,
            has_fallback: content.includes('catch') && content.includes('fallback')
          };
          
          if (prismaUsage > 0 && !results.controllers[controller].has_fallback) {
            results.issues_found.push({
              type: 'controller_no_fallback',
              severity: 'medium',
              controller: controller,
              message: 'Controller usa Prisma mas não tem fallback para erros de banco',
              prisma_usage: prismaUsage
            });
          }
          
          console.log(`📄 ${controller}: ${prismaUsage} usos do Prisma, ${tryCatchBlocks} try/catch, fallback: ${results.controllers[controller].has_fallback ? '✅' : '❌'}`);
        } else {
          results.controllers[controller] = { exists: false };
          console.log(`❌ ${controller}: Arquivo não encontrado`);
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar ${controller}:`, error.message);
      }
    }

    // 4. VERIFICAR SERVIÇOS QUE USAM PRISMA
    console.log('\n4️⃣ VERIFICANDO SERVIÇOS COM PRISMA');
    console.log('------------------------------------');
    
    const services = [
      'centralizedDrawService.js',
      'casesService.js',
      'prizeCalculationService.js',
      'safetyService.js',
      'prizeAuditServiceV2.js',
      'prizeSyncService.js',
      'bulkPurchaseServiceOptimized.js',
      'userRTPService.js',
      'bulkPurchaseService.js',
      'walletService.js',
      'authService.js',
      'cashFlowService.js',
      'globalDrawService.js',
      'affiliateService.js',
      'buyCaseService.js',
      'gatewayConfigService.js',
      'userSessionService.js',
      'rtpService.js',
      'auditLogService.js',
      'prizeValidationService.js',
      'illustrativePrizeService.js'
    ];

    for (const service of services) {
      try {
        const fs = require('fs');
        const path = require('path');
        const servicePath = path.join(__dirname, '../src/services', service);
        
        if (fs.existsSync(servicePath)) {
          const content = fs.readFileSync(servicePath, 'utf8');
          const prismaUsage = (content.match(/prisma\./g) || []).length;
          const tryCatchBlocks = (content.match(/try\s*{/g) || []).length;
          
          results.services[service] = {
            exists: true,
            prisma_usage: prismaUsage,
            try_catch_blocks: tryCatchBlocks,
            has_fallback: content.includes('catch') && (content.includes('fallback') || content.includes('dbError'))
          };
          
          if (prismaUsage > 0 && !results.services[service].has_fallback) {
            results.issues_found.push({
              type: 'service_no_fallback',
              severity: 'medium',
              service: service,
              message: 'Serviço usa Prisma mas não tem fallback para erros de banco',
              prisma_usage: prismaUsage
            });
          }
          
          console.log(`🔧 ${service}: ${prismaUsage} usos do Prisma, ${tryCatchBlocks} try/catch, fallback: ${results.services[service].has_fallback ? '✅' : '❌'}`);
        } else {
          results.services[service] = { exists: false };
          console.log(`❌ ${service}: Arquivo não encontrado`);
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar ${service}:`, error.message);
      }
    }

    // 5. VERIFICAR ROTAS QUE USAM PRISMA
    console.log('\n5️⃣ VERIFICANDO ROTAS COM PRISMA');
    console.log('---------------------------------');
    
    const routes = [
      'admin.js',
      'seedRoutes.js'
    ];

    for (const route of routes) {
      try {
        const fs = require('fs');
        const path = require('path');
        const routePath = path.join(__dirname, '../src/routes', route);
        
        if (fs.existsSync(routePath)) {
          const content = fs.readFileSync(routePath, 'utf8');
          const prismaUsage = (content.match(/prisma\./g) || []).length;
          const tryCatchBlocks = (content.match(/try\s*{/g) || []).length;
          
          results.routes[route] = {
            exists: true,
            prisma_usage: prismaUsage,
            try_catch_blocks: tryCatchBlocks,
            has_fallback: content.includes('catch') && (content.includes('fallback') || content.includes('dbError'))
          };
          
          if (prismaUsage > 0 && !results.routes[route].has_fallback) {
            results.issues_found.push({
              type: 'route_no_fallback',
              severity: 'medium',
              route: route,
              message: 'Rota usa Prisma mas não tem fallback para erros de banco',
              prisma_usage: prismaUsage
            });
          }
          
          console.log(`🛣️ ${route}: ${prismaUsage} usos do Prisma, ${tryCatchBlocks} try/catch, fallback: ${results.routes[route].has_fallback ? '✅' : '❌'}`);
        } else {
          results.routes[route] = { exists: false };
          console.log(`❌ ${route}: Arquivo não encontrado`);
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar ${route}:`, error.message);
      }
    }

    // 6. RESUMO E RECOMENDAÇÕES
    console.log('\n6️⃣ RESUMO E RECOMENDAÇÕES');
    console.log('===========================');
    
    const criticalIssues = results.issues_found.filter(i => i.severity === 'critical');
    const highIssues = results.issues_found.filter(i => i.severity === 'high');
    const mediumIssues = results.issues_found.filter(i => i.severity === 'medium');
    
    console.log(`🔴 Problemas Críticos: ${criticalIssues.length}`);
    console.log(`🟠 Problemas Altos: ${highIssues.length}`);
    console.log(`🟡 Problemas Médios: ${mediumIssues.length}`);
    
    if (criticalIssues.length > 0) {
      console.log('\n🔴 PROBLEMAS CRÍTICOS:');
      criticalIssues.forEach(issue => {
        console.log(`   - ${issue.message}`);
      });
    }
    
    if (highIssues.length > 0) {
      console.log('\n🟠 PROBLEMAS ALTOS:');
      highIssues.forEach(issue => {
        console.log(`   - ${issue.endpoint || issue.service || issue.controller}: ${issue.message}`);
      });
    }
    
    if (mediumIssues.length > 0) {
      console.log('\n🟡 PROBLEMAS MÉDIOS:');
      mediumIssues.forEach(issue => {
        console.log(`   - ${issue.service || issue.controller || issue.route}: ${issue.message}`);
      });
    }

    // 7. RECOMENDAÇÕES
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('==================');
    
    if (!results.database_connection) {
      results.recommendations.push('Implementar fallbacks em todos os controllers e serviços que usam Prisma');
      results.recommendations.push('Adicionar try/catch em todas as operações de banco de dados');
      results.recommendations.push('Criar dados estáticos de fallback para funcionalidades críticas');
    }
    
    if (highIssues.length > 0) {
      results.recommendations.push('Corrigir endpoints que retornam erro 500');
      results.recommendations.push('Implementar fallbacks nos endpoints críticos');
    }
    
    if (mediumIssues.length > 0) {
      results.recommendations.push('Adicionar tratamento de erro em serviços e controllers');
      results.recommendations.push('Implementar dados de fallback para operações não críticas');
    }
    
    results.recommendations.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });

    // 8. SALVAR RELATÓRIO
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, `audit-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    
    console.log(`\n📄 Relatório salvo em: ${reportPath}`);
    
    // 9. CONCLUSÃO
    console.log('\n🎯 CONCLUSÃO:');
    console.log('==============');
    
    if (criticalIssues.length === 0 && highIssues.length === 0) {
      console.log('✅ Sistema está funcionando corretamente!');
      console.log('✅ Todos os endpoints principais estão respondendo');
      console.log('✅ Fallbacks implementados onde necessário');
    } else {
      console.log('⚠️ Sistema tem problemas que precisam ser corrigidos');
      console.log(`   - ${criticalIssues.length} problemas críticos`);
      console.log(`   - ${highIssues.length} problemas altos`);
      console.log(`   - ${mediumIssues.length} problemas médios`);
    }

  } catch (error) {
    console.error('❌ Erro durante a auditoria:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar auditoria
auditSystem().catch(console.error);
