/**
 * Utilitários centralizados para manipulação de prêmios
 * Fonte única da verdade para formatação, validação e mapeamento
 */

const fs = require('fs');
const path = require('path');

/**
 * Formata valor em centavos para formato BRL
 * @param {number} valorCentavos - Valor em centavos
 * @returns {string} Valor formatado em BRL (ex: "R$ 1,50")
 */
function formatarBRL(valorCentavos) {
  if (typeof valorCentavos !== 'number' || valorCentavos < 0) {
    throw new Error('Valor em centavos deve ser um número positivo');
  }

  const valorReais = valorCentavos / 100;
  
  // Formatação brasileira com separadores de milhares
  return valorReais.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Verifica se um texto é um label monetário válido
 * @param {string} texto - Texto para verificar
 * @returns {boolean} True se é um label monetário válido
 */
function isMonetaryLabel(texto) {
  if (typeof texto !== 'string') return false;
  
  // Regex para padrões como: R$ 1,50, R$ 1.000,00, R$ 1.000.000,50
  const monetaryPattern = /^R\$\s?\d{1,3}(\.\d{3})*(,\d{2})?$/;
  return monetaryPattern.test(texto.trim());
}

/**
 * Gera asset key para prêmios de dinheiro
 * @param {number} valorCentavos - Valor em centavos
 * @returns {string} Asset key (ex: "cash/200.png")
 */
function assetKeyCash(valorCentavos) {
  if (typeof valorCentavos !== 'number' || valorCentavos < 0) {
    throw new Error('Valor em centavos deve ser um número positivo');
  }

  return `cash/${valorCentavos}.png`;
}

/**
 * Verifica se uma imagem existe na pasta local de imagens
 * @param {string} imagePath - Caminho da imagem
 * @returns {string} Caminho correto da imagem ou fallback
 */
function verificarImagemLocal(imagePath) {
  if (!imagePath) return 'produto/default.png';
  
  // Se já é um caminho completo, retorna como está
  if (imagePath.startsWith('http') || imagePath.startsWith('/uploads/')) {
    return imagePath;
  }
  
  // Se é um caminho relativo, verifica se existe na pasta imagens
  const frontendImagesPath = path.join(__dirname, '../../frontend/public/imagens');
  const possiblePaths = [
    path.join(frontendImagesPath, imagePath),
    path.join(frontendImagesPath, imagePath.replace(/^\/imagens\//, '')),
    path.join(frontendImagesPath, path.basename(imagePath))
  ];
  
  // Verifica se o arquivo existe em algum dos caminhos possíveis
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      // Retorna o caminho relativo para o frontend
      const relativePath = path.relative(path.join(__dirname, '../../frontend/public'), possiblePath);
      return `/${relativePath.replace(/\\/g, '/')}`;
    }
  }
  
  // Se não encontrou, retorna o caminho original ou fallback
  return imagePath.startsWith('/') ? imagePath : `/imagens/${imagePath}`;
}

/**
 * Determina o tipo de prêmio baseado nas regras de negócio
 * @param {Object} prize - Objeto do prêmio
 * @returns {string} Tipo do prêmio: 'cash', 'produto', 'ilustrativo'
 */
function determinarTipoPremio(prize) {
  const valorCentavos = prize.valor_centavos || Math.round(prize.valor * 100);
  const nome = (prize.nome || '').trim();

  // Regra 1: Se valor > 500000 centavos (R$ 5000) → ilustrativo
  if (valorCentavos > 500000) {
    return 'ilustrativo';
  }

  // Regra 2: Se nome começa com "R$" ou é um label monetário → cash
  if (nome.startsWith('R$') || isMonetaryLabel(nome)) {
    return 'cash';
  }

  // Regra 3: Caso contrário → produto
  return 'produto';
}

/**
 * Mapeia prêmio do banco para formato canônico de exibição
 * @param {Object} prize - Prêmio do banco de dados
 * @returns {Object} Objeto canônico para exibição no frontend
 */
function mapPrizeToDisplay(prize) {
  if (!prize) {
    throw new Error('Prêmio é obrigatório');
  }

  const valorCentavos = prize.valor_centavos || Math.round(prize.valor * 100);
  const tipo = prize.tipo || determinarTipoPremio(prize);
  const ativo = prize.ativo !== false; // Default true se não especificado

  let label, nome, imagem;

  switch (tipo) {
    case 'cash':
      label = formatarBRL(valorCentavos);
      nome = label; // Para cash, nome = label
      // Para cash, verificar se há imagem específica primeiro, senão usar padrão
      imagem = verificarImagemLocal(prize.imagem_url || prize.imagem_id || assetKeyCash(valorCentavos));
      break;

    case 'produto':
    case 'ilustrativo':
      label = prize.label || prize.nome || 'Produto';
      nome = prize.nome || 'Produto';
      imagem = verificarImagemLocal(prize.imagem_id || prize.imagem_url || 'produto/default.png');
      break;

    default:
      throw new Error(`Tipo de prêmio inválido: ${tipo}`);
  }

  // Regra: Prêmios acima de R$ 1.000,00 (100000 centavos) não são sorteáveis
  const isHighValue = valorCentavos > 100000;
  const sorteavel = tipo !== 'ilustrativo' && ativo && !isHighValue;

  return {
    id: prize.id,
    tipo,
    valorCentavos,
    valor: valorCentavos / 100, // Valor em reais para compatibilidade
    label,
    nome,
    imagem,
    sorteavel,
    ativo,
    probabilidade: prize.probabilidade || 0,
    case_id: prize.case_id
  };
}

/**
 * Valida se um prêmio está em formato válido
 * @param {Object} prize - Prêmio para validar
 * @returns {Object} Resultado da validação
 */
function validarPremio(prize) {
  const errors = [];

  if (!prize) {
    errors.push('Prêmio é obrigatório');
    return { valid: false, errors };
  }

  // Validar campos obrigatórios
  if (!prize.id) errors.push('ID é obrigatório');
  if (!prize.case_id) errors.push('Case ID é obrigatório');
  if (!prize.tipo) errors.push('Tipo é obrigatório');
  if (prize.valor_centavos === undefined || prize.valor_centavos === null) {
    errors.push('Valor em centavos é obrigatório');
  }
  if (!prize.label) errors.push('Label é obrigatório');
  if (!prize.imagem_id) errors.push('Imagem ID é obrigatório');

  // Validar tipo
  if (prize.tipo && !['cash', 'produto', 'ilustrativo'].includes(prize.tipo)) {
    errors.push('Tipo deve ser: cash, produto ou ilustrativo');
  }

  // Validar valor
  if (prize.valor_centavos !== undefined && prize.valor_centavos < 0) {
    errors.push('Valor em centavos deve ser positivo');
  }

  // Validar probabilidade
  if (prize.probabilidade !== undefined && (prize.probabilidade < 0 || prize.probabilidade > 1)) {
    errors.push('Probabilidade deve estar entre 0 e 1');
  }

  // Validações específicas por tipo
  if (prize.tipo === 'cash') {
    const expectedLabel = formatarBRL(prize.valor_centavos);
    if (prize.label !== expectedLabel) {
      errors.push(`Label para cash deve ser: ${expectedLabel}`);
    }

    const expectedImagem = assetKeyCash(prize.valor_centavos);
    if (prize.imagem_id !== expectedImagem) {
      errors.push(`Imagem para cash deve ser: ${expectedImagem}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Normaliza um prêmio aplicando as regras de negócio
 * @param {Object} prize - Prêmio para normalizar
 * @returns {Object} Prêmio normalizado
 */
function normalizarPremio(prize) {
  if (!prize) {
    throw new Error('Prêmio é obrigatório');
  }

  const valorCentavos = prize.valor_centavos || Math.round(prize.valor * 100);
  const tipo = determinarTipoPremio({ ...prize, valor_centavos: valorCentavos });

  const normalizado = {
    ...prize,
    tipo,
    valor_centavos: valorCentavos,
    ativo: prize.ativo !== false
  };

  // Aplicar regras específicas por tipo
  switch (tipo) {
    case 'cash':
      normalizado.label = formatarBRL(valorCentavos);
      normalizado.nome = normalizado.label;
      normalizado.imagem_id = assetKeyCash(valorCentavos);
      break;

    case 'produto':
    case 'ilustrativo':
      normalizado.label = prize.label || prize.nome || 'Produto';
      normalizado.nome = prize.nome || 'Produto';
      normalizado.imagem_id = prize.imagem_id || prize.imagem_url || 'produto/default.png';
      break;
  }

  return normalizado;
}

/**
 * Converte valor em reais para centavos
 * @param {number} valorReais - Valor em reais
 * @returns {number} Valor em centavos
 */
function reaisParaCentavos(valorReais) {
  return Math.round(valorReais * 100);
}

/**
 * Converte valor em centavos para reais
 * @param {number} valorCentavos - Valor em centavos
 * @returns {number} Valor em reais
 */
function centavosParaReais(valorCentavos) {
  return valorCentavos / 100;
}

module.exports = {
  formatarBRL,
  isMonetaryLabel,
  assetKeyCash,
  verificarImagemLocal,
  determinarTipoPremio,
  mapPrizeToDisplay,
  validarPremio,
  normalizarPremio,
  reaisParaCentavos,
  centavosParaReais
};
