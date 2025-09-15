/**
 * Script para Diagnosticar Erro 403
 * Testa URLs específicas para identificar o problema
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

class Error403Diagnostic {
  constructor() {
    this.baseUrl = 'https://slotbox.shop';
    this.results = {
      timestamp: new Date().toISOString(),
      tests: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
    this.reportDir = path.join(__dirname, '../reports');
  }

  /**
   * Executar diagnóstico
   */
  async runDiagnostic() {
    console.log('🔍 DIAGNÓSTICO DO ERRO 403 - SLOTBOX');
    console.log('=' .repeat(60));
    console.log(`📅 Data: ${new Date().toLocaleString()}`);
    console.log(`🌐 URL: ${this.baseUrl}`);
    console.log('=' .repeat(60) + '\n');

    try {
      // Criar diretório de relatórios
      if (!fs.existsSync(this.reportDir)) {
        fs.mkdirSync(this.reportDir, { recursive: true });
      }

      // 1. Testar página principal
      await this.testMainPage();

      // 2. Testar index.html diretamente
      await this.testIndexHtml();

      // 3. Testar assets CSS
      await this.testCssAssets();

      // 4. Testar assets JS
      await this.testJsAssets();

      // 5. Testar imagens
      await this.testImages();

      // 6. Testar .htaccess
      await this.testHtaccess();

      // 7. Gerar relatório de diagnóstico
      this.generateDiagnosticReport();

      // 8. Sugerir soluções
      this.suggestSolutions();

    } catch (error) {
      console.error('\n💥 ERRO CRÍTICO DURANTE DIAGNÓSTICO:', error);
      this.generateDiagnosticReport();
    }
  }

  /**
   * Testar página principal
   */
  async testMainPage() {
    console.log('🏠 Testando página principal...');
    
    try {
      const response = await axios.get(this.baseUrl, { 
        timeout: 10000,
        validateStatus: () => true // Aceitar qualquer status
      });
      
      if (response.status === 200) {
        this.addTestResult('main', 'page', true, `Página principal funcionando (${response.status})`);
        console.log(`  ✅ Página principal funcionando: ${response.status}`);
      } else if (response.status === 403) {
        this.addTestResult('main', 'page', false, `Erro 403 na página principal`);
        console.log(`  ❌ Erro 403 na página principal`);
      } else {
        this.addTestResult('main', 'page', false, `Status inesperado: ${response.status}`);
        console.log(`  ❌ Status inesperado: ${response.status}`);
      }
    } catch (error) {
      this.addTestResult('main', 'page', false, `Erro na página principal: ${error.message}`);
      console.log('  ❌ Erro na página principal:', error.message);
    }
  }

  /**
   * Testar index.html diretamente
   */
  async testIndexHtml() {
    console.log('📄 Testando index.html diretamente...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/index.html`, { 
        timeout: 10000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        this.addTestResult('index', 'html', true, `index.html funcionando (${response.status})`);
        console.log(`  ✅ index.html funcionando: ${response.status}`);
      } else if (response.status === 403) {
        this.addTestResult('index', 'html', false, `Erro 403 no index.html`);
        console.log(`  ❌ Erro 403 no index.html`);
      } else {
        this.addTestResult('index', 'html', false, `Status inesperado no index.html: ${response.status}`);
        console.log(`  ❌ Status inesperado no index.html: ${response.status}`);
      }
    } catch (error) {
      this.addTestResult('index', 'html', false, `Erro no index.html: ${error.message}`);
      console.log('  ❌ Erro no index.html:', error.message);
    }
  }

  /**
   * Testar assets CSS
   */
  async testCssAssets() {
    console.log('🎨 Testando assets CSS...');
    
    const cssFiles = [
      'index-2vyOSPKb.css'
    ];

    for (const cssFile of cssFiles) {
      try {
        const response = await axios.get(`${this.baseUrl}/assets/${cssFile}`, { 
          timeout: 10000,
          validateStatus: () => true
        });
        
        if (response.status === 200) {
          this.addTestResult('assets', `css-${cssFile}`, true, `CSS ${cssFile} funcionando (${response.status})`);
          console.log(`  ✅ CSS ${cssFile}: ${response.status}`);
        } else if (response.status === 403) {
          this.addTestResult('assets', `css-${cssFile}`, false, `Erro 403 no CSS ${cssFile}`);
          console.log(`  ❌ Erro 403 no CSS ${cssFile}`);
        } else {
          this.addTestResult('assets', `css-${cssFile}`, false, `Status inesperado no CSS ${cssFile}: ${response.status}`);
          console.log(`  ❌ Status inesperado no CSS ${cssFile}: ${response.status}`);
        }
      } catch (error) {
        this.addTestResult('assets', `css-${cssFile}`, false, `Erro no CSS ${cssFile}: ${error.message}`);
        console.log(`  ❌ Erro no CSS ${cssFile}:`, error.message);
      }
    }
  }

  /**
   * Testar assets JS
   */
  async testJsAssets() {
    console.log('⚙️ Testando assets JS...');
    
    const jsFiles = [
      'index-BLCj0hNU.js',
      'router-Cj7dMlqZ.js',
      'utils-BgsGIbzM.js',
      'vendor-gH-7aFTg.js',
      'ui-B3KIqm52.js'
    ];

    for (const jsFile of jsFiles) {
      try {
        const response = await axios.get(`${this.baseUrl}/assets/${jsFile}`, { 
          timeout: 10000,
          validateStatus: () => true
        });
        
        if (response.status === 200) {
          this.addTestResult('assets', `js-${jsFile}`, true, `JS ${jsFile} funcionando (${response.status})`);
          console.log(`  ✅ JS ${jsFile}: ${response.status}`);
        } else if (response.status === 403) {
          this.addTestResult('assets', `js-${jsFile}`, false, `Erro 403 no JS ${jsFile}`);
          console.log(`  ❌ Erro 403 no JS ${jsFile}`);
        } else {
          this.addTestResult('assets', `js-${jsFile}`, false, `Status inesperado no JS ${jsFile}: ${response.status}`);
          console.log(`  ❌ Status inesperado no JS ${jsFile}: ${response.status}`);
        }
      } catch (error) {
        this.addTestResult('assets', `js-${jsFile}`, false, `Erro no JS ${jsFile}: ${error.message}`);
        console.log(`  ❌ Erro no JS ${jsFile}:`, error.message);
      }
    }
  }

  /**
   * Testar imagens
   */
  async testImages() {
    console.log('🖼️ Testando imagens...');
    
    const imageFiles = [
      'imagens/banner.png',
      'imagens/caixa apple.png',
      'imagens/caixa premium.png'
    ];

    for (const imageFile of imageFiles) {
      try {
        const response = await axios.get(`${this.baseUrl}/${imageFile}`, { 
          timeout: 10000,
          validateStatus: () => true
        });
        
        if (response.status === 200) {
          this.addTestResult('images', imageFile, true, `Imagem ${imageFile} funcionando (${response.status})`);
          console.log(`  ✅ Imagem ${imageFile}: ${response.status}`);
        } else if (response.status === 403) {
          this.addTestResult('images', imageFile, false, `Erro 403 na imagem ${imageFile}`);
          console.log(`  ❌ Erro 403 na imagem ${imageFile}`);
        } else {
          this.addTestResult('images', imageFile, false, `Status inesperado na imagem ${imageFile}: ${response.status}`);
          console.log(`  ❌ Status inesperado na imagem ${imageFile}: ${response.status}`);
        }
      } catch (error) {
        this.addTestResult('images', imageFile, false, `Erro na imagem ${imageFile}: ${error.message}`);
        console.log(`  ❌ Erro na imagem ${imageFile}:`, error.message);
      }
    }
  }

  /**
   * Testar .htaccess
   */
  async testHtaccess() {
    console.log('⚙️ Testando .htaccess...');
    
    try {
      const response = await axios.get(`${this.baseUrl}/.htaccess`, { 
        timeout: 10000,
        validateStatus: () => true
      });
      
      if (response.status === 200) {
        this.addTestResult('htaccess', 'file', true, `.htaccess funcionando (${response.status})`);
        console.log(`  ✅ .htaccess funcionando: ${response.status}`);
      } else if (response.status === 403) {
        this.addTestResult('htaccess', 'file', false, `Erro 403 no .htaccess`);
        console.log(`  ❌ Erro 403 no .htaccess`);
      } else if (response.status === 404) {
        this.addTestResult('htaccess', 'file', false, `.htaccess não encontrado (404)`);
        console.log(`  ❌ .htaccess não encontrado (404)`);
      } else {
        this.addTestResult('htaccess', 'file', false, `Status inesperado no .htaccess: ${response.status}`);
        console.log(`  ❌ Status inesperado no .htaccess: ${response.status}`);
      }
    } catch (error) {
      this.addTestResult('htaccess', 'file', false, `Erro no .htaccess: ${error.message}`);
      console.log('  ❌ Erro no .htaccess:', error.message);
    }
  }

  /**
   * Adicionar resultado de teste
   */
  addTestResult(category, test, passed, message) {
    if (!this.results.tests[category]) {
      this.results.tests[category] = {};
    }
    
    this.results.tests[category][test] = {
      passed,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.results.summary.total++;
    if (passed) {
      this.results.summary.passed++;
    } else {
      this.results.summary.failed++;
    }
  }

  /**
   * Gerar relatório de diagnóstico
   */
  generateDiagnosticReport() {
    console.log('\n📋 Gerando relatório de diagnóstico...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Calcular estatísticas
    const totalTests = this.results.summary.total;
    const passedTests = this.results.summary.passed;
    const failedTests = this.results.summary.failed;
    const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0;
    
    // Adicionar estatísticas ao relatório
    this.results.summary.successRate = parseFloat(successRate);
    
    // Salvar relatório JSON
    const reportFile = path.join(this.reportDir, `403-diagnostic-${timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(this.results, null, 2));
    
    console.log('\n📊 RELATÓRIO DE DIAGNÓSTICO:');
    console.log('=' .repeat(60));
    console.log(`📅 Data: ${new Date().toLocaleString()}`);
    console.log(`📊 Total de testes: ${totalTests}`);
    console.log(`✅ Testes passaram: ${passedTests}`);
    console.log(`❌ Testes falharam: ${failedTests}`);
    console.log(`📈 Taxa de sucesso: ${successRate}%`);
    
    console.log('\n📁 Relatório salvo em:');
    console.log(`   • JSON: ${reportFile}`);
    
    if (failedTests > 0) {
      console.log('\n❌ TESTES QUE FALHARAM:');
      Object.entries(this.results.tests).forEach(([category, tests]) => {
        Object.entries(tests).forEach(([test, result]) => {
          if (!result.passed) {
            console.log(`   • ${category}/${test}: ${result.message}`);
          }
        });
      });
    }
    
    console.log('\n' + '=' .repeat(60));
  }

  /**
   * Sugerir soluções baseadas nos resultados
   */
  suggestSolutions() {
    console.log('\n💡 SUGESTÕES DE SOLUÇÃO:');
    console.log('=' .repeat(60));
    
    const failedTests = this.results.summary.failed;
    const totalTests = this.results.summary.total;
    
    if (failedTests === totalTests) {
      console.log('🔴 PROBLEMA CRÍTICO: Todos os testes falharam');
      console.log('   Soluções:');
      console.log('   1. Verificar se arquivos foram uploadados corretamente');
      console.log('   2. Verificar permissões dos arquivos (644 para arquivos, 755 para pastas)');
      console.log('   3. Verificar se index.html está em public_html/');
      console.log('   4. Verificar configurações do domínio no Hostinger');
    } else if (failedTests > totalTests / 2) {
      console.log('🟡 PROBLEMA PARCIAL: Maioria dos testes falharam');
      console.log('   Soluções:');
      console.log('   1. Verificar permissões dos arquivos');
      console.log('   2. Verificar se .htaccess está configurado corretamente');
      console.log('   3. Verificar se assets estão na pasta correta');
    } else {
      console.log('🟢 PROBLEMA MENOR: Poucos testes falharam');
      console.log('   Soluções:');
      console.log('   1. Verificar arquivos específicos que falharam');
      console.log('   2. Verificar permissões individuais');
      console.log('   3. Verificar se .htaccess está configurado');
    }
    
    console.log('\n📋 AÇÕES RECOMENDADAS:');
    console.log('   1. Acessar painel do Hostinger');
    console.log('   2. Verificar estrutura de arquivos em public_html/');
    console.log('   3. Verificar permissões (644 para arquivos, 755 para pastas)');
    console.log('   4. Criar/verificar .htaccess com configurações corretas');
    console.log('   5. Testar URLs específicas individualmente');
    
    console.log('\n' + '=' .repeat(60));
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const diagnostic = new Error403Diagnostic();
  diagnostic.runDiagnostic();
}

module.exports = Error403Diagnostic;
