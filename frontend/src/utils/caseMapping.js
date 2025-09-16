// Mapeamento de IDs das caixas
// Frontend ID -> Backend ID (UUID)

export const CASE_MAPPING = {
  'weekend-case': 'e82eccc3-36c0-46cd-bd71-2c1c0013c7e4', // CAIXA FINAL DE SEMANA
  'nike-case': '5e7c06cb-48bc-45c9-909f-0032afe56074', // CAIXA KIT NIKE
  'samsung-case': 'a3ff986c-4b08-42f6-b514-40052001e466', // CAIXA SAMSUNG
  'console-case': '97ce71b6-5d8c-43f0-98b9-f5044d647dc6', // CAIXA CONSOLE DOS SONHOS
  'apple-case': '97c286db-7c43-4582-9884-40eda0dd8ab7', // CAIXA APPLE
  'premium-master-case': '2b520ca1-769c-4234-bbff-7a298c736774' // CAIXA PREMIUM MASTER
};

// Função para obter ID real da caixa
export const getCaseId = (frontendId) => {
  return CASE_MAPPING[frontendId] || null;
};

// Função para obter nome da caixa pelo ID do frontend
export const getCaseName = (frontendId) => {
  const mapping = {
    'weekend-case': 'CAIXA FINAL DE SEMANA',
    'nike-case': 'CAIXA KIT NIKE',
    'samsung-case': 'CAIXA SAMSUNG',
    'console-case': 'CAIXA CONSOLE DOS SONHOS',
    'apple-case': 'CAIXA APPLE',
    'premium-master-case': 'CAIXA PREMIUM MASTER!'
  };
  return mapping[frontendId] || null;
};
