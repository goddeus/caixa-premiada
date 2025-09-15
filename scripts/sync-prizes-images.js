/**
 * Script de Sincronização de Prêmios e Imagens
 * Executa sincronização completa entre pasta de imagens e banco de dados
 */

require('dotenv').config({ path: 'backend/.env.production' });
const prizeImageSyncService = require('../backend/src/services/prizeImageSyncService');

async function main() {
  console.log('🚀 Iniciando sincronização de prêmios e imagens...\n');
  
  try {
    // Executar sincronização
    const report = await prizeImageSyncService.syncAll();
    
    // Verificar se há inconsistências críticas
    const criticalIssues = report.inconsistencies.filter(inc => 
      inc.type === 'negative_value' || 
      inc.type === 'case_sync_error' ||
      inc.type === 'prize_sync_error'
    );
    
    if (criticalIssues.length > 0) {
      console.log('\n⚠️ ATENÇÃO: Inconsistências críticas encontradas!');
      criticalIssues.forEach(issue => {
        console.log(`   • ${issue.type}: ${issue.message || issue.error}`);
      });
      
      process.exit(1);
    }
    
    // Verificar se há muitas inconsistências
    if (report.inconsistencies.length > 10) {
      console.log('\n⚠️ ATENÇÃO: Muitas inconsistências encontradas!');
      console.log('   Considere revisar a estrutura de imagens e prêmios.');
    }
    
    console.log('\n✅ Sincronização concluída com sucesso!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Erro durante sincronização:', error);
    process.exit(1);
  }
}

// Executar script
main();
