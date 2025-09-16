// 🚀 SISTEMA DE COMPRA COM INTEGRAÇÃO BACKEND REAL - SLOTBOX
// Cole este código no console do navegador (F12) em uma página de caixa para implementar o sistema com backend real

console.log('🚀 IMPLEMENTANDO SISTEMA DE COMPRA COM INTEGRAÇÃO BACKEND REAL...');

// ===== SISTEMA DE COMPRA COM BACKEND REAL =====
class SistemaCompraBackendIntegrado {
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
    console.log('🔧 Inicializando sistema de compra com backend real...');
    
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
    
    console.log('✅ Sistema de compra com backend real inicializado!');
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
    
    console.log('🔧 Implementando sistema de compra com backend real...');
    
    // Remover event listeners existentes
    const novoBotao = this.botaoAbrirCaixa.cloneNode(true);
    this.botaoAbrirCaixa.parentNode.replaceChild(novoBotao, this.botaoAbrirCaixa);
    this.botaoAbrirCaixa = novoBotao;
    
    // Adicionar novo event listener
    this.botaoAbrirCaixa.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      this.processarCompraComBackend();
    });
    
    console.log('✅ Sistema de compra com backend real implementado!');
  }
  
  async processarCompraComBackend() {
    if (this.isProcessing) {
      console.log('⚠️ Compra já em processamento...');
      return;
    }
    
    console.log('🛒 Iniciando processo de compra com backend real...');
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
      
      // 3. Processar débito via backend
      const debitoResultado = await this.processarDebitoBackend();
      
      if (!debitoResultado.success) {
        console.log('❌ Falha no débito via backend');
        this.mostrarMensagem(debitoResultado.message || 'Erro ao processar pagamento. Tente novamente.', 'error');
        this.isProcessing = false;
        return;
      }
      
      // 4. Fazer sorteio via backend
      const sorteioResultado = await this.fazerSorteioBackend();
      
      if (!sorteioResultado.success) {
        console.log('❌ Falha no sorteio via backend');
        this.mostrarMensagem('Erro no sorteio. Tente novamente.', 'error');
        this.isProcessing = false;
        return;
      }
      
      // 5. Processar crédito do prêmio via backend
      if (sorteioResultado.prizeValue > 0) {
        const creditoResultado = await this.processarCreditoBackend(sorteioResultado.prizeId, sorteioResultado.prizeValue);
        
        if (!creditoResultado.success) {
          console.log('❌ Falha no crédito via backend');
          this.mostrarMensagem('Erro ao creditar prêmio. Contate o suporte.', 'error');
        }
      }
      
      // 6. Atualizar saldo
      await this.atualizarSaldo();
      
      // 7. Mostrar resultado
      this.mostrarResultado(sorteioResultado.prizeValue || 0);
      
    } catch (error) {
      console.error('❌ Erro durante o processo de compra:', error);
      this.mostrarMensagem('Erro inesperado. Tente novamente.', 'error');
    } finally {
      this.isProcessing = false;
    }
  }
  
  async processarDebitoBackend() {
    console.log('💸 Processando débito via backend...');
    
    try {
      const response = await fetch(`https://slotbox-api.onrender.com/api/cases/debit/${this.caseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success !== false) {
        console.log('✅ Débito processado via backend');
        console.log('📊 Resposta do backend:', data);
        
        // Atualizar saldo local
        if (data.saldo_restante !== undefined) {
          this.saldoAtual = data.saldo_restante;
        }
        
        return { success: true, data };
      } else {
        console.log('❌ Erro no débito via backend:', data);
        return { success: false, message: data.error || data.message || 'Erro no débito' };
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar débito via backend:', error);
      return { success: false, message: 'Erro de conexão com o backend' };
    }
  }
  
  async fazerSorteioBackend() {
    console.log('🎁 Fazendo sorteio via backend...');
    
    try {
      const response = await fetch(`https://slotbox-api.onrender.com/api/cases/draw/${this.caseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok && data.success !== false) {
        console.log('✅ Sorteio realizado via backend');
        console.log('📊 Resultado do sorteio:', data);
        
        return { 
          success: true, 
          prizeId: data.prizeId,
          prizeValue: data.prizeValue || 0,
          data 
        };
      } else {
        console.log('❌ Erro no sorteio via backend:', data);
        return { success: false, message: data.error || data.message || 'Erro no sorteio' };
      }
      
    } catch (error) {
      console.error('❌ Erro ao fazer sorteio via backend:', error);
      return { success: false, message: 'Erro de conexão com o backend' };
    }
  }
  
  async processarCreditoBackend(prizeId, prizeValue) {
    console.log(`💰 Processando crédito via backend: R$ ${prizeValue.toFixed(2)}...`);
    
    try {
      const response = await fetch(`https://slotbox-api.onrender.com/api/cases/credit/${this.caseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          prizeId: prizeId,
          prizeValue: prizeValue
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success !== false) {
        console.log('✅ Crédito processado via backend');
        console.log('📊 Resposta do crédito:', data);
        
        // Atualizar saldo local
        if (data.saldo_apos_credito !== undefined) {
          this.saldoAtual = data.saldo_apos_credito;
        } else if (prizeValue > 0) {
          this.saldoAtual += prizeValue;
        }
        
        return { success: true, data };
      } else {
        console.log('❌ Erro no crédito via backend:', data);
        return { success: false, message: data.error || data.message || 'Erro no crédito' };
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar crédito via backend:', error);
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
    this.mostrarMensagem('Processando compra com backend...', 'info');
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
    console.log('📊 RESUMO DA COMPRA COM BACKEND:');
    console.log(`   - Valor pago: R$ ${this.precoCaixa.toFixed(2)}`);
    console.log(`   - Prêmio recebido: R$ ${premio.toFixed(2)}`);
    console.log(`   - Saldo final: R$ ${this.saldoAtual.toFixed(2)}`);
    console.log(`   - Case ID: ${this.caseId}`);
    console.log(`   - User ID: ${this.userId}`);
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

// ===== INICIALIZAR SISTEMA =====
console.log('🚀 Inicializando sistema de compra com backend real...');

// Verificar se estamos em uma página de caixa
const rotaAtual = window.location.pathname;
if (!rotaAtual.includes('case')) {
  console.log('❌ Não estamos em uma página de caixa');
  console.log('💡 Navegue para uma página de caixa primeiro');
} else {
  console.log(`✅ Estamos na página: ${rotaAtual}`);
  
  // Inicializar sistema
  const sistemaCompra = new SistemaCompraBackendIntegrado();
  
  // Tornar disponível globalmente
  window.sistemaCompraBackend = sistemaCompra;
  
  console.log('🎯 Sistema de compra com backend real pronto!');
  console.log('💡 Agora você pode clicar em "Abrir Caixa" para testar o sistema com backend real');
  console.log('🔧 Use window.sistemaCompraBackend para acessar o sistema');
}
