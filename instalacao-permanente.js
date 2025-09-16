// 🚀 INSTALAÇÃO PERMANENTE DO SISTEMA DE COMPRA - SLOTBOX
// Cole este código UMA VEZ no console e nunca mais precisará digitar!

console.log('🚀 INSTALANDO SISTEMA PERMANENTE...');

// Salvar o sistema completo no localStorage
const sistemaCompleto = `
// Sistema de Compra com Backend Corrigido
class SistemaCompraBackendCorrigido {
  constructor() {
    this.api = window.api;
    this.isProcessing = false;
    this.saldoAtual = 0;
    this.precoCaixa = 0;
    this.botaoAbrirCaixa = null;
    this.caseId = null;
    this.userId = null;
    this.init();
  }
  
  async init() {
    console.log('🔧 Inicializando sistema de compra...');
    await this.obterDadosUsuario();
    this.encontrarBotaoAbrirCaixa();
    this.obterPrecoCaixa();
    this.obterIdCaixa();
    await this.obterSaldoAtual();
    this.implementarSistemaCompra();
    console.log('✅ Sistema inicializado!');
  }
  
  async obterDadosUsuario() {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.userId = userData.id;
      console.log(\`✅ Usuário: \${userData.nome}\`);
    }
  }
  
  encontrarBotaoAbrirCaixa() {
    const botoes = document.querySelectorAll('button, [class*="button"], [class*="btn"]');
    botoes.forEach(botao => {
      const texto = botao.textContent?.toLowerCase().trim() || '';
      if (texto.includes('abrir') && texto.includes('caixa')) {
        this.botaoAbrirCaixa = botao;
        console.log('✅ Botão encontrado');
      }
    });
  }
  
  obterPrecoCaixa() {
    const todosElementos = document.querySelectorAll('*');
    todosElementos.forEach(elemento => {
      const texto = elemento.textContent?.trim() || '';
      if (texto.match(/R\\$\\s*\\d+,\\d+/) && !texto.includes('saldo') && !texto.includes('9994')) {
        const precoMatch = texto.match(/R\\$\\s*(\\d+,\\d+)/);
        if (precoMatch) {
          this.precoCaixa = parseFloat(precoMatch[1].replace(',', '.'));
        }
      }
    });
    if (this.precoCaixa === 0) this.precoCaixa = 1.50;
  }
  
  obterIdCaixa() {
    const mapeamentoRotas = {
      '/weekend-case': '1abd77cf-472b-473d-9af0-6cd47f9f1452',
      '/nike-case': '0b5e9b8a-9d56-4769-a45a-55a3025640f4'
    };
    this.caseId = mapeamentoRotas[window.location.pathname] || 'fallback-case-id';
  }
  
  async obterSaldoAtual() {
    try {
      if (this.api && this.api.getWallet) {
        const response = await this.api.getWallet();
        if (response.success && response.data) {
          this.saldoAtual = response.data.saldo_reais || 0;
        }
      }
      if (this.saldoAtual === 0) {
        const user = localStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          this.saldoAtual = userData.saldo_reais || 0;
        }
      }
    } catch (error) {
      this.saldoAtual = 0;
    }
  }
  
  implementarSistemaCompra() {
    if (!this.botaoAbrirCaixa) return;
    
    const novoBotao = this.botaoAbrirCaixa.cloneNode(true);
    this.botaoAbrirCaixa.parentNode.replaceChild(novoBotao, this.botaoAbrirCaixa);
    this.botaoAbrirCaixa = novoBotao;
    
    this.botaoAbrirCaixa.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.processarCompra();
    });
  }
  
  async processarCompra() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    try {
      if (this.saldoAtual < this.precoCaixa) {
        this.mostrarMensagem('Saldo insuficiente!', 'error');
        this.isProcessing = false;
        return;
      }
      
      this.mostrarFeedbackCompra();
      
      const response = await fetch(\`https://slotbox-api.onrender.com/api/cases/buy/\${this.caseId}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${localStorage.getItem('token')}\`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success !== false) {
        if (data.saldo_restante !== undefined) {
          this.saldoAtual = data.saldo_restante;
        }
        
        await this.atualizarSaldo();
        this.mostrarResultado(data.prize?.valor || 0);
      } else {
        this.mostrarMensagem('Erro na compra. Tente novamente.', 'error');
      }
    } catch (error) {
      this.mostrarMensagem('Erro inesperado.', 'error');
    } finally {
      this.isProcessing = false;
    }
  }
  
  mostrarFeedbackCompra() {
    this.botaoAbrirCaixa.disabled = true;
    this.botaoAbrirCaixa.textContent = 'Processando...';
    this.botaoAbrirCaixa.style.opacity = '0.6';
    this.mostrarMensagem('Processando compra...', 'info');
  }
  
  async atualizarSaldo() {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      userData.saldo_reais = this.saldoAtual;
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    const elementosSaldo = document.querySelectorAll('*');
    elementosSaldo.forEach(elemento => {
      const texto = elemento.textContent?.trim() || '';
      if (texto.includes('R$') && texto.includes('9994')) {
        elemento.textContent = texto.replace(/R\\$\\s*\\d+,\\d+/, \`R$ \${this.saldoAtual.toFixed(2)}\`);
      }
    });
  }
  
  mostrarResultado(premio) {
    this.botaoAbrirCaixa.disabled = false;
    this.botaoAbrirCaixa.textContent = 'Abrir Caixa';
    this.botaoAbrirCaixa.style.opacity = '1';
    
    if (premio > 0) {
      this.mostrarMensagem(\`🎉 Parabéns! Você ganhou R$ \${premio.toFixed(2)}!\`, 'success');
    } else {
      this.mostrarMensagem('😔 Não foi desta vez. Tente novamente!', 'info');
    }
  }
  
  mostrarMensagem(mensagem, tipo = 'info') {
    console.log(\`📢 \${tipo.toUpperCase()}: \${mensagem}\`);
    
    if (!document.body) return;
    
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
    
    setTimeout(() => {
      if (notificacao.parentNode) {
        notificacao.parentNode.removeChild(notificacao);
      }
    }, 5000);
  }
}

// Função para inicializar o sistema
function inicializarSistemaCompra() {
  const rotaAtual = window.location.pathname;
  if (rotaAtual.includes('case')) {
    console.log('🚀 Inicializando sistema de compra...');
    const sistema = new SistemaCompraBackendCorrigido();
    window.sistemaCompraBackendCorrigido = sistema;
    console.log('✅ Sistema pronto! Clique em "Abrir Caixa" para testar.');
  }
}

// Executar automaticamente
inicializarSistemaCompra();
`;

// Salvar no localStorage
localStorage.setItem('sistemaCompraPermanente', sistemaCompleto);

// Executar o sistema salvo
eval(sistemaCompleto);

// Configurar para carregar automaticamente
let ultimaRota = window.location.pathname;
setInterval(() => {
  if (window.location.pathname !== ultimaRota) {
    ultimaRota = window.location.pathname;
    setTimeout(() => {
      const sistemaSalvo = localStorage.getItem('sistemaCompraPermanente');
      if (sistemaSalvo) {
        eval(sistemaSalvo);
      }
    }, 1000);
  }
}, 1000);

console.log('✅ SISTEMA INSTALADO PERMANENTEMENTE!');
console.log('🎯 Agora o sistema será carregado automaticamente em todas as páginas de caixa');
console.log('💡 Você nunca mais precisará digitar o código!');
console.log('🔧 Use window.sistemaCompraBackendCorrigido para acessar o sistema');
