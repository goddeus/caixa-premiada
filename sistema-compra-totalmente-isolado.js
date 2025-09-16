// 🚀 SISTEMA DE COMPRA TOTALMENTE ISOLADO - SLOTBOX
// Este sistema bloqueia completamente o sistema original e assume controle total

console.log('🚀 INSTALANDO SISTEMA TOTALMENTE ISOLADO...');

// ===== BLOQUEAR SISTEMA ORIGINAL COMPLETAMENTE =====
function bloquearSistemaOriginal() {
  console.log('🚫 BLOQUEANDO SISTEMA ORIGINAL COMPLETAMENTE...');
  
  // 1. Bloquear todas as funções globais do sistema original
  const funcoesParaBloquear = [
    'abrirCaixa',
    'buyCase',
    'processarCompra',
    'abrirCaixaWeekend',
    'abrirCaixaNike',
    'abrirCaixaSamsung',
    'abrirCaixaConsole',
    'abrirCaixaApple',
    'abrirCaixaPremium'
  ];
  
  funcoesParaBloquear.forEach(funcao => {
    if (window[funcao]) {
      window[funcao] = () => {
        console.log(`🚫 Função ${funcao} bloqueada pelo sistema isolado`);
        return false;
      };
    }
  });
  
  // 2. Bloquear event listeners de todos os botões
  const botoes = document.querySelectorAll('button, [class*="button"], [class*="btn"]');
  botoes.forEach(botao => {
    const texto = botao.textContent?.toLowerCase().trim() || '';
    if (texto.includes('abrir') && texto.includes('caixa')) {
      // Remover todos os event listeners
      const novoBotao = botao.cloneNode(true);
      botao.parentNode.replaceChild(novoBotao, botao);
      console.log('🚫 Event listeners do sistema original removidos');
    }
  });
  
  // 3. Bloquear chamadas de API do sistema original (mas permitir nosso sistema)
  const fetchOriginal = window.fetch;
  window.fetch = function(url, options) {
    // Permitir chamadas do nosso sistema isolado
    if (window.sistemaCompraIsolado && window.sistemaCompraIsolado.isProcessing) {
      console.log('✅ Chamada de API do sistema isolado permitida:', url);
      return fetchOriginal.apply(this, arguments);
    }
    
    // Bloquear apenas chamadas específicas do sistema original
    if (url.includes('/api/cases/') && options?.method === 'POST') {
      console.log('🚫 Chamada de API do sistema original bloqueada:', url);
      return Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'Sistema original bloqueado' })
      });
    }
    return fetchOriginal.apply(this, arguments);
  };
  
  console.log('✅ Sistema original completamente bloqueado');
}

// ===== SISTEMA DE COMPRA ISOLADO =====
class SistemaCompraIsolado {
  constructor() {
    this.api = window.api;
    this.isProcessing = false;
    this.saldoAtual = 0;
    this.precoCaixa = 0;
    this.botaoAbrirCaixa = null;
    this.caseId = null;
    this.userId = null;
    this.sistemaOriginalBloqueado = false;
    
    this.init();
  }
  
  async init() {
    console.log('🔧 Inicializando sistema isolado...');
    
    // 1. Bloquear sistema original
    bloquearSistemaOriginal();
    this.sistemaOriginalBloqueado = true;
    
    // 2. Obter dados do usuário
    await this.obterDadosUsuario();
    
    // 3. Encontrar botão de abrir caixa
    this.encontrarBotaoAbrirCaixa();
    
    // 4. Obter preço da caixa
    this.obterPrecoCaixa();
    
    // 5. Obter ID da caixa
    this.obterIdCaixa();
    
    // 6. Obter saldo atual
    await this.obterSaldoAtual();
    
    // 7. Implementar sistema de compra
    this.implementarSistemaCompra();
    
    console.log('✅ Sistema isolado inicializado!');
  }
  
  async obterDadosUsuario() {
    console.log('👤 Obtendo dados do usuário...');
    
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        this.userId = userData.id;
        console.log(`✅ Usuário identificado: ${userData.nome} (ID: ${this.userId})`);
      } catch (e) {
        console.log('❌ Erro ao obter dados do usuário:', e.message);
      }
    }
  }
  
  encontrarBotaoAbrirCaixa() {
    console.log('🔍 Procurando botão "Abrir Caixa"...');
    
    const botoes = document.querySelectorAll('button, [class*="button"], [class*="btn"]');
    
    botoes.forEach((botao, index) => {
      const texto = botao.textContent?.toLowerCase().trim() || '';
      
      if (texto.includes('abrir') && texto.includes('caixa')) {
        this.botaoAbrirCaixa = botao;
        console.log(`✅ Botão "Abrir Caixa" encontrado: "${texto}"`);
        console.log(`   - Classes: ${botao.className}`);
        console.log(`   - ID: ${botao.id}`);
      }
    });
    
    if (!this.botaoAbrirCaixa) {
      console.log('❌ Botão "Abrir Caixa" não encontrado');
    }
  }
  
  obterPrecoCaixa() {
    console.log('💰 Obtendo preço da caixa...');
    
    // Procurar por elementos que contenham preço
    const todosElementos = document.querySelectorAll('*');
    
    todosElementos.forEach(elemento => {
      const texto = elemento.textContent?.trim() || '';
      
      // Procurar por padrão "R$ X,XX" que não seja saldo
      if (texto.match(/R\$\s*\d+,\d+/) && !texto.includes('saldo') && !texto.includes('9994')) {
        const precoMatch = texto.match(/R\$\s*(\d+,\d+)/);
        if (precoMatch) {
          this.precoCaixa = parseFloat(precoMatch[1].replace(',', '.'));
          console.log(`✅ Preço da caixa identificado: R$ ${this.precoCaixa.toFixed(2)}`);
        }
      }
    });
    
    if (this.precoCaixa === 0) {
      console.log('⚠️ Preço da caixa não encontrado, usando valor padrão: R$ 1,50');
      this.precoCaixa = 1.50;
    }
  }
  
  obterIdCaixa() {
    console.log('🆔 Obtendo ID da caixa...');
    
    // Tentar obter ID da URL
    const rotaAtual = window.location.pathname;
    console.log(`📍 Rota atual: ${rotaAtual}`);
    
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
      console.log(`✅ ID da caixa identificado: ${this.caseId}`);
    } else {
      console.log('⚠️ ID da caixa não encontrado, usando fallback');
      this.caseId = 'fallback-case-id';
    }
  }
  
  async obterSaldoAtual() {
    console.log('💳 Obtendo saldo atual...');
    
    try {
      // Tentar obter saldo da API
      if (this.api && this.api.getWallet) {
        const response = await this.api.getWallet();
        if (response.success && response.data) {
          this.saldoAtual = response.data.saldo_reais || 0;
          console.log(`✅ Saldo obtido da API: R$ ${this.saldoAtual.toFixed(2)}`);
        }
      }
      
      // Fallback para localStorage
      if (this.saldoAtual === 0) {
        const user = localStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          this.saldoAtual = userData.saldo_reais || 0;
          console.log(`✅ Saldo obtido do localStorage: R$ ${this.saldoAtual.toFixed(2)}`);
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
      return;
    }
    
    console.log('🔧 Implementando sistema de compra isolado...');
    
    // Adicionar event listener ao botão
    this.botaoAbrirCaixa.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('🎯 Clique interceptado pelo sistema isolado');
      this.processarCompraIsolada();
    });
    
    console.log('✅ Sistema de compra isolado implementado!');
  }
  
  async processarCompraIsolada() {
    if (this.isProcessing) {
      console.log('⚠️ Compra já em processamento...');
      return;
    }
    
    console.log('🛒 Iniciando processo de compra isolado...');
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
      this.mostrarResultado(compraResultado.prizeValue || 0, compraResultado.prizeName || 'Nenhum prêmio');
      
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
      const response = await fetch(`https://slotbox-api.onrender.com/api/cases/buy/${this.caseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
          prizeValue: data.prize?.valor || 0,
          prizeName: data.prize?.nome || 'Nenhum prêmio',
          data 
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
    this.mostrarMensagem('Processando compra com sistema isolado...', 'info');
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
        elemento.textContent = texto.replace(/R\$\s*\d+,\d+/, `R$ ${this.saldoAtual.toFixed(2)}`);
      }
    });
    
    console.log('✅ Saldo atualizado na interface');
  }
  
  mostrarResultado(premio, nomePremio) {
    console.log('🎉 Mostrando resultado...');
    
    // Reabilitar botão
    this.botaoAbrirCaixa.disabled = false;
    this.botaoAbrirCaixa.textContent = 'Abrir Caixa';
    this.botaoAbrirCaixa.style.opacity = '1';
    
    // Mostrar resultado
    if (premio > 0) {
      this.mostrarMensagem(`🎉 Parabéns! Você ganhou ${nomePremio} (R$ ${premio.toFixed(2)})!`, 'success');
    } else {
      this.mostrarMensagem('😔 Não foi desta vez. Tente novamente!', 'info');
    }
    
    // Mostrar resumo
    console.log('📊 RESUMO DA COMPRA ISOLADA:');
    console.log(`   - Valor pago: R$ ${this.precoCaixa.toFixed(2)}`);
    console.log(`   - Prêmio recebido: ${nomePremio} (R$ ${premio.toFixed(2)})`);
    console.log(`   - Saldo final: R$ ${this.saldoAtual.toFixed(2)}`);
    console.log(`   - Case ID: ${this.caseId}`);
    console.log(`   - User ID: ${this.userId}`);
    console.log(`   - Sistema original bloqueado: ${this.sistemaOriginalBloqueado ? '✅' : '❌'}`);
  }
  
  mostrarMensagem(mensagem, tipo = 'info') {
    console.log(`📢 ${tipo.toUpperCase()}: ${mensagem}`);
    
    try {
      // Verificar se document.body existe
      if (!document.body) {
        console.log('⚠️ document.body não encontrado, usando console apenas');
        return;
      }
      
      // Criar notificação visual
      const notificacao = document.createElement('div');
      notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#4CAF50' : tipo === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        max-width: 300px;
        word-wrap: break-word;
      `;
      
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

// ===== INICIALIZAR SISTEMA ISOLADO =====
function inicializarSistemaIsolado() {
  console.log('🚀 Inicializando sistema isolado...');
  
  // Verificar se estamos em uma página de caixa
  const rotaAtual = window.location.pathname;
  if (!rotaAtual.includes('case')) {
    console.log('❌ Não estamos em uma página de caixa');
    console.log('💡 Navegue para uma página de caixa primeiro');
    return;
  }
  
  console.log(`✅ Estamos na página: ${rotaAtual}`);
  
  // Inicializar sistema
  const sistemaCompra = new SistemaCompraIsolado();
  
  // Tornar disponível globalmente
  window.sistemaCompraIsolado = sistemaCompra;
  
  console.log('🎯 Sistema isolado pronto!');
  console.log('💡 Agora você pode clicar em "Abrir Caixa" para testar o sistema isolado');
  console.log('🔧 Use window.sistemaCompraIsolado para acessar o sistema');
  console.log('🚫 Sistema original foi completamente bloqueado');
}

// ===== SALVAR NO LOCALSTORAGE =====
function salvarSistemaIsolado() {
  console.log('💾 Salvando sistema isolado no localStorage...');
  
  const codigoSistema = `
// Sistema de Compra Isolado
console.log('🚀 CARREGANDO SISTEMA ISOLADO...');

const rotaAtual = window.location.pathname;
if (rotaAtual.includes('case')) {
  console.log('✅ Página de caixa detectada, iniciando sistema isolado...');
  
  if (typeof inicializarSistemaIsolado === 'function') {
    inicializarSistemaIsolado();
  } else {
    console.log('⚠️ Sistema isolado não encontrado, recarregue a página');
  }
} else {
  console.log('⏳ Aguardando navegação para página de caixa...');
}
`;

  try {
    localStorage.setItem('sistemaCompraIsolado', codigoSistema);
    console.log('✅ Sistema isolado salvo no localStorage!');
  } catch (error) {
    console.log('❌ Erro ao salvar no localStorage:', error.message);
  }
}

// ===== EXECUTAR SISTEMA =====
console.log('🚀 EXECUTANDO SISTEMA ISOLADO...');

// Salvar no localStorage
salvarSistemaIsolado();

// Executar sistema
inicializarSistemaIsolado();

// Configurar para carregar automaticamente
let ultimaRota = window.location.pathname;
setInterval(() => {
  if (window.location.pathname !== ultimaRota) {
    ultimaRota = window.location.pathname;
    setTimeout(() => {
      const sistemaSalvo = localStorage.getItem('sistemaCompraIsolado');
      if (sistemaSalvo) {
        eval(sistemaSalvo);
      }
    }, 1000);
  }
}, 1000);

console.log('✅ SISTEMA ISOLADO INSTALADO!');
console.log('🎯 O sistema original foi completamente bloqueado');
console.log('💡 Agora o sistema isolado controla exclusivamente as compras');
console.log('🔒 Todas as funções do sistema original foram interceptadas');

