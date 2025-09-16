// 🚀 IMPLEMENTAR SISTEMA DE COMPRA MELHORADO - SLOTBOX
// Cole este código no console do navegador (F12) em uma página de caixa para implementar o sistema melhorado

console.log('🚀 IMPLEMENTANDO SISTEMA DE COMPRA MELHORADO...');

// ===== SISTEMA DE COMPRA MELHORADO =====
class SistemaCompraMelhorado {
  constructor() {
    this.api = window.api;
    this.isProcessing = false;
    this.saldoAtual = 0;
    this.precoCaixa = 0;
    this.botaoAbrirCaixa = null;
    
    this.init();
  }
  
  async init() {
    console.log('🔧 Inicializando sistema de compra melhorado...');
    
    // 1. Encontrar botão de abrir caixa
    this.encontrarBotaoAbrirCaixa();
    
    // 2. Obter preço da caixa
    this.obterPrecoCaixa();
    
    // 3. Obter saldo atual
    await this.obterSaldoAtual();
    
    // 4. Implementar sistema de compra
    this.implementarSistemaCompra();
    
    console.log('✅ Sistema de compra melhorado inicializado!');
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
    
    console.log('🔧 Implementando sistema de compra...');
    
    // Remover event listeners existentes
    const novoBotao = this.botaoAbrirCaixa.cloneNode(true);
    this.botaoAbrirCaixa.parentNode.replaceChild(novoBotao, this.botaoAbrirCaixa);
    this.botaoAbrirCaixa = novoBotao;
    
    // Adicionar novo event listener
    this.botaoAbrirCaixa.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      this.processarCompra();
    });
    
    console.log('✅ Sistema de compra implementado!');
  }
  
  async processarCompra() {
    if (this.isProcessing) {
      console.log('⚠️ Compra já em processamento...');
      return;
    }
    
    console.log('🛒 Iniciando processo de compra...');
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
      
      // 3. Processar débito
      const debitoSucesso = await this.processarDebito();
      
      if (!debitoSucesso) {
        console.log('❌ Falha no débito');
        this.mostrarMensagem('Erro ao processar pagamento. Tente novamente.', 'error');
        this.isProcessing = false;
        return;
      }
      
      // 4. Simular abertura da caixa
      const premio = await this.simularAberturaCaixa();
      
      // 5. Processar crédito do prêmio
      if (premio > 0) {
        await this.processarCredito(premio);
      }
      
      // 6. Atualizar saldo
      await this.atualizarSaldo();
      
      // 7. Mostrar resultado
      this.mostrarResultado(premio);
      
    } catch (error) {
      console.error('❌ Erro durante o processo de compra:', error);
      this.mostrarMensagem('Erro inesperado. Tente novamente.', 'error');
    } finally {
      this.isProcessing = false;
    }
  }
  
  mostrarFeedbackCompra() {
    console.log('🎬 Mostrando feedback visual...');
    
    // Desabilitar botão
    this.botaoAbrirCaixa.disabled = true;
    this.botaoAbrirCaixa.textContent = 'Processando...';
    this.botaoAbrirCaixa.style.opacity = '0.6';
    
    // Mostrar loading
    this.mostrarMensagem('Processando compra...', 'info');
  }
  
  async processarDebito() {
    console.log('💸 Processando débito...');
    
    try {
      // Simular débito (em produção, isso seria uma chamada real para a API)
      const debitoData = {
        valor: this.precoCaixa,
        tipo: 'debito',
        descricao: 'Compra de caixa',
        timestamp: new Date().toISOString()
      };
      
      console.log('📊 Dados do débito:', debitoData);
      
      // Atualizar saldo local
      this.saldoAtual -= this.precoCaixa;
      
      // Atualizar localStorage
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        userData.saldo_reais = this.saldoAtual;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      console.log(`✅ Débito processado: R$ ${this.precoCaixa.toFixed(2)}`);
      console.log(`💰 Saldo atualizado: R$ ${this.saldoAtual.toFixed(2)}`);
      
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao processar débito:', error);
      return false;
    }
  }
  
  async simularAberturaCaixa() {
    console.log('🎁 Simulando abertura da caixa...');
    
    // Simular delay da abertura
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Definir prêmios possíveis
    const premios = [
      { valor: 500.00, probabilidade: 0.01 }, // 1%
      { valor: 100.00, probabilidade: 0.05 }, // 5%
      { valor: 10.00, probabilidade: 0.15 },  // 15%
      { valor: 5.00, probabilidade: 0.25 },   // 25%
      { valor: 2.00, probabilidade: 0.30 },   // 30%
      { valor: 1.00, probabilidade: 0.24 }    // 24%
    ];
    
    // Calcular prêmio baseado na probabilidade
    const random = Math.random();
    let acumulado = 0;
    let premioSelecionado = 0;
    
    for (const premio of premios) {
      acumulado += premio.probabilidade;
      if (random <= acumulado) {
        premioSelecionado = premio.valor;
        break;
      }
    }
    
    console.log(`🎁 Prêmio sorteado: R$ ${premioSelecionado.toFixed(2)}`);
    
    return premioSelecionado;
  }
  
  async processarCredito(premio) {
    console.log(`💰 Processando crédito de R$ ${premio.toFixed(2)}...`);
    
    try {
      // Simular crédito (em produção, isso seria uma chamada real para a API)
      const creditoData = {
        valor: premio,
        tipo: 'credito',
        descricao: 'Prêmio da caixa',
        timestamp: new Date().toISOString()
      };
      
      console.log('📊 Dados do crédito:', creditoData);
      
      // Atualizar saldo local
      this.saldoAtual += premio;
      
      // Atualizar localStorage
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        userData.saldo_reais = this.saldoAtual;
        localStorage.setItem('user', JSON.stringify(userData));
      }
      
      console.log(`✅ Crédito processado: R$ ${premio.toFixed(2)}`);
      console.log(`💰 Saldo atualizado: R$ ${this.saldoAtual.toFixed(2)}`);
      
    } catch (error) {
      console.error('❌ Erro ao processar crédito:', error);
    }
  }
  
  async atualizarSaldo() {
    console.log('🔄 Atualizando saldo na interface...');
    
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
  
  mostrarResultado(premio) {
    console.log('🎉 Mostrando resultado...');
    
    // Reabilitar botão
    this.botaoAbrirCaixa.disabled = false;
    this.botaoAbrirCaixa.textContent = 'Abrir Caixa';
    this.botaoAbrirCaixa.style.opacity = '1';
    
    // Mostrar resultado
    if (premio > 0) {
      this.mostrarMensagem(`🎉 Parabéns! Você ganhou R$ ${premio.toFixed(2)}!`, 'success');
    } else {
      this.mostrarMensagem('😔 Não foi desta vez. Tente novamente!', 'info');
    }
    
    // Mostrar resumo
    console.log('📊 RESUMO DA COMPRA:');
    console.log(`   - Valor pago: R$ ${this.precoCaixa.toFixed(2)}`);
    console.log(`   - Prêmio recebido: R$ ${premio.toFixed(2)}`);
    console.log(`   - Saldo final: R$ ${this.saldoAtual.toFixed(2)}`);
  }
  
  mostrarMensagem(mensagem, tipo = 'info') {
    console.log(`📢 ${tipo.toUpperCase()}: ${mensagem}`);
    
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
    `;
    
    notificacao.textContent = mensagem;
    document.body.appendChild(notificacao);
    
    // Remover após 5 segundos
    setTimeout(() => {
      if (notificacao.parentNode) {
        notificacao.parentNode.removeChild(notificacao);
      }
    }, 5000);
  }
}

// ===== INICIALIZAR SISTEMA =====
console.log('🚀 Inicializando sistema de compra melhorado...');

// Verificar se estamos em uma página de caixa
const rotaAtual = window.location.pathname;
if (!rotaAtual.includes('case')) {
  console.log('❌ Não estamos em uma página de caixa');
  console.log('💡 Navegue para uma página de caixa primeiro');
} else {
  console.log(`✅ Estamos na página: ${rotaAtual}`);
  
  // Inicializar sistema
  const sistemaCompra = new SistemaCompraMelhorado();
  
  // Tornar disponível globalmente
  window.sistemaCompraMelhorado = sistemaCompra;
  
  console.log('🎯 Sistema de compra melhorado pronto!');
  console.log('💡 Agora você pode clicar em "Abrir Caixa" para testar o sistema');
  console.log('🔧 Use window.sistemaCompraMelhorado para acessar o sistema');
}
