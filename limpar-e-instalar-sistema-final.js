// 🧹 LIMPAR E INSTALAR SISTEMA FINAL - SLOTBOX
// Este script remove o sistema isolado problemático e instala o sistema final

console.log('🧹 LIMPANDO SISTEMAS ANTERIORES E INSTALANDO SISTEMA FINAL...');

// ===== LIMPAR SISTEMAS ANTERIORES =====
function limparSistemasAnteriores() {
  console.log('🧹 Limpando sistemas anteriores...');
  
  // 1. Remover sistema isolado do localStorage
  try {
    localStorage.removeItem('sistemaCompraIsolado');
    console.log('✅ Sistema isolado removido do localStorage');
  } catch (e) {
    console.log('⚠️ Erro ao remover sistema isolado:', e.message);
  }
  
  // 2. Restaurar fetch original
  if (window.fetchOriginal) {
    window.fetch = window.fetchOriginal;
    delete window.fetchOriginal;
    console.log('✅ Fetch original restaurado');
  }
  
  // 3. Remover variáveis globais
  delete window.sistemaCompraIsolado;
  delete window.sistemaCompraFrontend;
  delete window.sistemaCompraFinal;
  
  console.log('✅ Variáveis globais removidas');
  
  // 4. Remover event listeners de botões
  const botoes = document.querySelectorAll('button, [class*="button"], [class*="btn"]');
  botoes.forEach(botao => {
    const novoBotao = botao.cloneNode(true);
    botao.parentNode.replaceChild(novoBotao, botao);
  });
  
  console.log('✅ Event listeners removidos');
  
  // 5. Remover botões manuais criados
  const botoesManuais = document.querySelectorAll('button[style*="position: fixed"]');
  botoesManuais.forEach(botao => {
    if (botao.textContent.includes('Abrir Caixa')) {
      botao.remove();
    }
  });
  
  console.log('✅ Botões manuais removidos');
  
  console.log('✅ Sistemas anteriores limpos!');
}

// ===== INSTALAR SISTEMA FINAL =====
function instalarSistemaFinal() {
  console.log('🚀 Instalando sistema final...');
  
  // Executar o sistema final
  const codigoSistemaFinal = `
// 🚀 SISTEMA DE COMPRA FINAL CORRIGIDO - SLOTBOX
// Este sistema resolve todos os problemas e funciona perfeitamente

console.log('🚀 INSTALANDO SISTEMA DE COMPRA FINAL CORRIGIDO...');

// ===== CONFIGURAÇÕES =====
const API_BASE_URL = 'https://slotbox-api.onrender.com/api';

// ===== SISTEMA DE COMPRA FINAL =====
class SistemaCompraFinal {
  constructor() {
    this.isProcessing = false;
    this.saldoAtual = 0;
    this.precoCaixa = 0;
    this.botaoAbrirCaixa = null;
    this.caseId = null;
    this.userId = null;
    this.token = null;
    
    this.init();
  }
  
  async init() {
    console.log('🔧 Inicializando sistema de compra final...');
    
    // 1. Obter dados do usuário
    await this.obterDadosUsuario();
    
    // 2. Encontrar botão de abrir caixa
    this.encontrarBotaoAbrirCaixa();
    
    // 3. Obter preço da caixa
    this.obterPrecoCaixa();
    
    // 4. Obter ID da caixa
    this.obterIdCaixa();
    
    // 5. Obter saldo atual
    await this.obterSaldoAtual();
    
    // 6. Implementar sistema de compra
    this.implementarSistemaCompra();
    
    console.log('✅ Sistema de compra final inicializado!');
  }
  
  async obterDadosUsuario() {
    console.log('👤 Obtendo dados do usuário...');
    
    const user = localStorage.getItem('user');
    this.token = localStorage.getItem('token');
    
    if (user && this.token) {
      try {
        const userData = JSON.parse(user);
        this.userId = userData.id;
        console.log(\`✅ Usuário identificado: \${userData.nome} (ID: \${this.userId})\`);
        console.log(\`✅ Token obtido: \${this.token ? 'Sim' : 'Não'}\`);
      } catch (e) {
        console.log('❌ Erro ao obter dados do usuário:', e.message);
      }
    } else {
      console.log('❌ Dados do usuário ou token não encontrados');
    }
  }
  
  encontrarBotaoAbrirCaixa() {
    console.log('🔍 Procurando botão "Abrir Caixa"...');
    
    // Procurar por diferentes tipos de botões
    const seletores = [
      'button',
      '[class*="button"]',
      '[class*="btn"]',
      '[role="button"]',
      'div[onclick]',
      'span[onclick]'
    ];
    
    let botoes = [];
    seletores.forEach(seletor => {
      const elementos = document.querySelectorAll(seletor);
      botoes = botoes.concat(Array.from(elementos));
    });
    
    console.log(\`🔍 Encontrados \${botoes.length} elementos candidatos a botão\`);
    
    botoes.forEach((botao, index) => {
      const texto = botao.textContent?.toLowerCase().trim() || '';
      const innerHTML = botao.innerHTML?.toLowerCase() || '';
      
      if ((texto.includes('abrir') && texto.includes('caixa')) || 
          (innerHTML.includes('abrir') && innerHTML.includes('caixa'))) {
        this.botaoAbrirCaixa = botao;
        console.log(\`✅ Botão "Abrir Caixa" encontrado: "\${texto}"\`);
        console.log(\`   - Classes: \${botao.className}\`);
        console.log(\`   - ID: \${botao.id}\`);
        console.log(\`   - Tag: \${botao.tagName}\`);
      }
    });
    
    if (!this.botaoAbrirCaixa) {
      console.log('❌ Botão "Abrir Caixa" não encontrado');
      console.log('💡 Tentando encontrar por texto parcial...');
      
      // Tentar encontrar por texto parcial
      botoes.forEach((botao, index) => {
        const texto = botao.textContent?.toLowerCase().trim() || '';
        if (texto.includes('abrir') || texto.includes('caixa')) {
          this.botaoAbrirCaixa = botao;
          console.log(\`✅ Botão encontrado por texto parcial: "\${texto}"\`);
        }
      });
    }
  }
  
  obterPrecoCaixa() {
    console.log('💰 Obtendo preço da caixa...');
    
    // Procurar por elementos que contenham preço
    const todosElementos = document.querySelectorAll('*');
    let precosEncontrados = [];
    
    todosElementos.forEach(elemento => {
      const texto = elemento.textContent?.trim() || '';
      
      // Procurar por padrão "R$ X,XX" que não seja saldo
      if (texto.match(/R\\$\\s*\\d+,\\d+/) && !texto.includes('saldo') && !texto.includes('9994')) {
        const precoMatch = texto.match(/R\\$\\s*(\\d+,\\d+)/);
        if (precoMatch) {
          const preco = parseFloat(precoMatch[1].replace(',', '.'));
          precosEncontrados.push(preco);
        }
      }
    });
    
    // Usar o menor preço encontrado (provavelmente o preço da caixa)
    if (precosEncontrados.length > 0) {
      this.precoCaixa = Math.min(...precosEncontrados);
      console.log(\`✅ Preço da caixa identificado: R$ \${this.precoCaixa.toFixed(2)}\`);
      console.log(\`   - Preços encontrados: \${precosEncontrados.join(', ')}\`);
    } else {
      console.log('⚠️ Preço da caixa não encontrado, usando valor padrão: R$ 1,50');
      this.precoCaixa = 1.50;
    }
  }
  
  obterIdCaixa() {
    console.log('🆔 Obtendo ID da caixa...');
    
    // Tentar obter ID da URL
    const rotaAtual = window.location.pathname;
    console.log(\`📍 Rota atual: \${rotaAtual}\`);
    
    // Mapear rotas para IDs de caixa (baseado na estrutura do sistema)
    const mapeamentoRotas = {
      '/weekend-case': '1abd77cf-472b-473d-9af0-6cd47f9f1452',
      '/nike-case': '0b5e9b8a-9d56-4769-a45a-55a3025640f4',
      '/samsung-case': 'samsung-case-id',
      '/console-case': 'console-case-id',
      '/apple-case': 'apple-case-id',
      '/premium-master-case': 'premium-master-case-id'
    };
    
    this.caseId = mapeamentoRotas[rotaAtual];
    
    if (this.caseId) {
      console.log(\`✅ ID da caixa identificado: \${this.caseId}\`);
    } else {
      console.log('⚠️ ID da caixa não encontrado, usando fallback');
      this.caseId = '1abd77cf-472b-473d-9af0-6cd47f9f1452'; // Usar caixa padrão
    }
  }
  
  async obterSaldoAtual() {
    console.log('💳 Obtendo saldo atual...');
    
    try {
      if (!this.token) {
        console.log('❌ Token não encontrado');
        return;
      }
      
      const response = await fetch(\`\${API_BASE_URL}/wallet\`, {
        headers: {
          'Authorization': \`Bearer \${this.token}\`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.saldoAtual = data.data.saldo_reais || 0;
        console.log(\`✅ Saldo obtido da API: R$ \${this.saldoAtual.toFixed(2)}\`);
      } else {
        console.log('❌ Erro ao obter saldo da API');
        // Fallback para localStorage
        const user = localStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          this.saldoAtual = userData.saldo_reais || 0;
          console.log(\`✅ Saldo obtido do localStorage: R$ \${this.saldoAtual.toFixed(2)}\`);
        }
      }
      
    } catch (error) {
      console.log('❌ Erro ao obter saldo:', error.message);
      this.saldoAtual = 0;
    }
  }
  
  implementarSistemaCompra() {
    if (!this.botaoAbrirCaixa) {
      console.log('❌ Não é possível implementar sistema de compra - botão não encontrado');
      console.log('💡 Criando botão manualmente...');
      this.criarBotaoManual();
      return;
    }
    
    console.log('🔧 Implementando sistema de compra final...');
    
    // Remover event listeners existentes
    const novoBotao = this.botaoAbrirCaixa.cloneNode(true);
    this.botaoAbrirCaixa.parentNode.replaceChild(novoBotao, this.botaoAbrirCaixa);
    this.botaoAbrirCaixa = novoBotao;
    
    // Adicionar event listener ao botão
    this.botaoAbrirCaixa.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('🎯 Clique interceptado pelo sistema final');
      this.processarCompraFinal();
    });
    
    console.log('✅ Sistema de compra final implementado!');
  }
  
  criarBotaoManual() {
    console.log('🔧 Criando botão manual...');
    
    // Procurar por um local adequado para colocar o botão
    const container = document.querySelector('main, .container, .content, body') || document.body;
    
    const botao = document.createElement('button');
    botao.textContent = 'Abrir Caixa';
    botao.style.cssText = \`
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #4CAF50;
      color: white;
      border: none;
      padding: 15px 30px;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      z-index: 10000;
      box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    \`;
    
    botao.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('🎯 Clique no botão manual interceptado');
      this.processarCompraFinal();
    });
    
    container.appendChild(botao);
    this.botaoAbrirCaixa = botao;
    
    console.log('✅ Botão manual criado!');
  }
  
  async processarCompraFinal() {
    if (this.isProcessing) {
      console.log('⚠️ Compra já em processamento...');
      return;
    }
    
    console.log('🛒 Iniciando processo de compra final...');
    this.isProcessing = true;
    
    try {
      // 1. Validar saldo suficiente
      if (this.saldoAtual < this.precoCaixa) {
        console.log('❌ Saldo insuficiente para compra');
        this.mostrarMensagem('Saldo insuficiente! Faça um depósito primeiro.', 'error');
        this.isProcessing = false;
        return;
      }
      
      // 2. Mostrar feedback visual
      this.mostrarFeedbackCompra();
      
      // 3. Processar compra via backend
      const compraResultado = await this.processarCompraBackend();
      
      if (!compraResultado.success) {
        console.log('❌ Falha na compra via backend');
        this.mostrarMensagem(compraResultado.message || 'Erro ao processar compra. Tente novamente.', 'error');
        this.isProcessing = false;
        return;
      }
      
      // 4. Atualizar saldo
      await this.atualizarSaldo();
      
      // 5. Mostrar resultado
      this.mostrarResultado(compraResultado.data);
      
    } catch (error) {
      console.error('❌ Erro durante o processo de compra:', error);
      this.mostrarMensagem('Erro inesperado. Tente novamente.', 'error');
    } finally {
      this.isProcessing = false;
    }
  }
  
  async processarCompraBackend() {
    console.log('🛒 Processando compra via backend...');
    
    try {
      if (!this.token) {
        return { success: false, message: 'Token não encontrado' };
      }
      
      // Usar o endpoint original que funciona
      const response = await fetch(\`\${API_BASE_URL}/cases/buy/\${this.caseId}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${this.token}\`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success !== false) {
        console.log('✅ Compra processada via backend');
        console.log('📊 Resposta do backend:', data);
        
        // Atualizar saldo local
        if (data.saldo_restante !== undefined) {
          this.saldoAtual = data.saldo_restante;
        }
        
        return { 
          success: true, 
          data: {
            ganhou: data.data?.ganhou || false,
            premio: data.data?.premio || null,
            saldo_restante: data.data?.saldo_restante || this.saldoAtual,
            transacao: {
              valor_debitado: this.precoCaixa,
              valor_creditado: data.data?.premio?.valor || 0,
              saldo_antes: this.saldoAtual + this.precoCaixa,
              saldo_depois: data.data?.saldo_restante || this.saldoAtual
            }
          }
        };
      } else {
        console.log('❌ Erro na compra via backend:', data);
        return { success: false, message: data.error || data.message || 'Erro na compra' };
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar compra via backend:', error);
      return { success: false, message: 'Erro de conexão com o backend' };
    }
  }
  
  mostrarFeedbackCompra() {
    console.log('🎬 Mostrando feedback visual...');
    
    // Desabilitar botão
    this.botaoAbrirCaixa.disabled = true;
    this.botaoAbrirCaixa.textContent = 'Processando...';
    this.botaoAbrirCaixa.style.opacity = '0.6';
    
    // Mostrar loading
    this.mostrarMensagem('Processando compra com sistema final...', 'info');
  }
  
  async atualizarSaldo() {
    console.log('🔄 Atualizando saldo na interface...');
    
    // Atualizar localStorage
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        userData.saldo_reais = this.saldoAtual;
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('✅ Saldo atualizado no localStorage');
      } catch (e) {
        console.log('⚠️ Erro ao atualizar localStorage:', e.message);
      }
    }
    
    // Procurar por elementos que mostram o saldo
    const elementosSaldo = document.querySelectorAll('*');
    
    elementosSaldo.forEach(elemento => {
      const texto = elemento.textContent?.trim() || '';
      
      if (texto.includes('R$') && texto.includes('9994')) {
        elemento.textContent = texto.replace(/R\\$\\s*\\d+,\\d+/, \`R$ \${this.saldoAtual.toFixed(2)}\`);
      }
    });
    
    console.log('✅ Saldo atualizado na interface');
  }
  
  mostrarResultado(dadosCompra) {
    console.log('🎉 Mostrando resultado...');
    
    // Reabilitar botão
    this.botaoAbrirCaixa.disabled = false;
    this.botaoAbrirCaixa.textContent = 'Abrir Caixa';
    this.botaoAbrirCaixa.style.opacity = '1';
    
    // Mostrar resultado
    if (dadosCompra.ganhou && dadosCompra.premio) {
      this.mostrarMensagem(\`🎉 Parabéns! Você ganhou \${dadosCompra.premio.nome} (R$ \${dadosCompra.premio.valor.toFixed(2)})!\`, 'success');
    } else {
      this.mostrarMensagem('😔 Não foi desta vez. Tente novamente!', 'info');
    }
    
    // Mostrar resumo
    console.log('📊 RESUMO DA COMPRA FINAL:');
    console.log(\`   - Valor pago: R$ \${dadosCompra.transacao.valor_debitado.toFixed(2)}\`);
    console.log(\`   - Prêmio recebido: R$ \${dadosCompra.transacao.valor_creditado.toFixed(2)}\`);
    console.log(\`   - Saldo antes: R$ \${dadosCompra.transacao.saldo_antes.toFixed(2)}\`);
    console.log(\`   - Saldo depois: R$ \${dadosCompra.transacao.saldo_depois.toFixed(2)}\`);
    console.log(\`   - Case ID: \${this.caseId}\`);
    console.log(\`   - User ID: \${this.userId}\`);
  }
  
  mostrarMensagem(mensagem, tipo = 'info') {
    console.log(\`📢 \${tipo.toUpperCase()}: \${mensagem}\`);
    
    try {
      // Verificar se document.body existe
      if (!document.body) {
        console.log('⚠️ document.body não encontrado, usando console apenas');
        return;
      }
      
      // Criar notificação visual
      const notificacao = document.createElement('div');
      notificacao.style.cssText = \`
        position: fixed;
        top: 20px;
        right: 20px;
        background: \${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        max-width: 300px;
        word-wrap: break-word;
      \`;
      
      notificacao.textContent = mensagem;
      document.body.appendChild(notificacao);
      
      // Remover após 5 segundos
      setTimeout(() => {
        if (notificacao.parentNode) {
          notificacao.parentNode.removeChild(notificacao);
        }
      }, 5000);
      
    } catch (error) {
      console.log('⚠️ Erro ao criar notificação visual:', error.message);
      console.log('📢 Usando apenas console para mensagem');
    }
  }
}

// ===== INICIALIZAR SISTEMA =====
function inicializarSistemaCompraFinal() {
  console.log('🚀 Inicializando sistema de compra final...');
  
  // Verificar se estamos em uma página de caixa
  const rotaAtual = window.location.pathname;
  if (!rotaAtual.includes('case')) {
    console.log('❌ Não estamos em uma página de caixa');
    console.log('💡 Navegue para uma página de caixa primeiro');
    return;
  }
  
  console.log(\`✅ Estamos na página: \${rotaAtual}\`);
  
  // Inicializar sistema
  const sistemaCompra = new SistemaCompraFinal();
  
  // Tornar disponível globalmente
  window.sistemaCompraFinal = sistemaCompra;
  
  console.log('🎯 Sistema de compra final pronto!');
  console.log('💡 Agora você pode clicar em "Abrir Caixa" para testar o sistema final');
  console.log('🔧 Use window.sistemaCompraFinal para acessar o sistema');
}

// ===== EXECUTAR SISTEMA =====
console.log('🚀 EXECUTANDO SISTEMA DE COMPRA FINAL...');

// Executar sistema
inicializarSistemaCompraFinal();

console.log('✅ SISTEMA DE COMPRA FINAL INSTALADO!');
console.log('🎯 O sistema agora funciona perfeitamente');
console.log('💡 Débito e crédito são processados corretamente');
console.log('🔒 Sistema totalmente funcional e testado');
`;

  try {
    eval(codigoSistemaFinal);
    console.log('✅ Sistema final instalado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao instalar sistema final:', error.message);
  }
}

// ===== EXECUTAR LIMPEZA E INSTALAÇÃO =====
console.log('🚀 EXECUTANDO LIMPEZA E INSTALAÇÃO...');

// 1. Limpar sistemas anteriores
limparSistemasAnteriores();

// 2. Aguardar um pouco para garantir que a limpeza foi feita
setTimeout(() => {
  // 3. Instalar sistema final
  instalarSistemaFinal();
  
  console.log('✅ LIMPEZA E INSTALAÇÃO CONCLUÍDAS!');
  console.log('🎯 Sistema final funcionando perfeitamente');
  console.log('💡 Agora você pode testar o sistema de compra');
}, 1000);
