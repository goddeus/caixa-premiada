/**
 * Script de Teste Estatístico de RTP - SlotBox
 * Simula 10k aberturas para verificar se o RTP real está dentro do esperado
 */

const { PrismaClient } = require('@prisma/client');

class RTPStatisticalTester {
  constructor() {
    this.prisma = new PrismaClient();
    this.results = [];
    this.epsilon = 0.05; // 5% de tolerância
    this.targetRTP = 0.1; // 10% (0.1)
  }

  async runStatisticalTest() {
    console.log('📊 Iniciando teste estatístico de RTP...');
    console.log(`🎯 RTP alvo: ${(this.targetRTP * 100).toFixed(1)}%`);
    console.log(`📏 Epsilon (tolerância): ±${(this.epsilon * 100).toFixed(1)}%`);
    console.log(`🎲 Simulações: 10,000 aberturas\n`);
    
    try {
      // 1. Obter dados das caixas
      const cases = await this.getCasesData();
      console.log(`📦 Caixas encontradas: ${cases.length}`);
      
      // 2. Executar simulações
      await this.runSimulations(cases);
      
      // 3. Calcular estatísticas
      const stats = this.calculateStatistics();
      
      // 4. Verificar se RTP está dentro do esperado
      const isRTPValid = this.validateRTP(stats);
      
      // 5. Gerar relatório
      await this.generateReport(stats, isRTPValid);
      
    } catch (error) {
      console.error('❌ Erro durante teste estatístico:', error);
    } finally {
      await this.prisma.$disconnect();
    }
  }

  async getCasesData() {
    try {
      const cases = await this.prisma.case.findMany({
        where: { ativo: true },
        include: {
          prizes: {
            where: { ativo: true },
            orderBy: { valor: 'asc' }
          }
        }
      });
      
      return cases.map(caseItem => ({
        id: caseItem.id,
        nome: caseItem.nome,
        preco: parseFloat(caseItem.preco),
        prizes: caseItem.prizes.map(prize => ({
          id: prize.id,
          nome: prize.nome,
          valor: parseFloat(prize.valor),
          probabilidade: parseFloat(prize.probabilidade)
        }))
      }));
    } catch (error) {
      throw new Error(`Erro ao obter dados das caixas: ${error.message}`);
    }
  }

  async runSimulations(cases) {
    console.log('🎲 Executando simulações...');
    
    const totalSimulations = 10000;
    const simulationsPerCase = Math.floor(totalSimulations / cases.length);
    
    for (const caseItem of cases) {
      console.log(`  📦 Simulando ${simulationsPerCase} aberturas da caixa: ${caseItem.nome}`);
      
      for (let i = 0; i < simulationsPerCase; i++) {
        const result = this.simulateCaseOpening(caseItem);
        this.results.push({
          caseId: caseItem.id,
          caseName: caseItem.nome,
          casePrice: caseItem.preco,
          prizeWon: result.prize,
          prizeValue: result.value,
          isIllustrative: result.isIllustrative,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log(`✅ ${this.results.length} simulações concluídas\n`);
  }

  simulateCaseOpening(caseItem) {
    // Simular o algoritmo de sorteio do sistema
    const random = Math.random();
    
    // Calcular probabilidades acumuladas
    let cumulativeProbability = 0;
    const probabilities = caseItem.prizes.map(prize => {
      cumulativeProbability += prize.probabilidade;
      return {
        ...prize,
        cumulativeProbability
      };
    });
    
    // Selecionar prêmio baseado na probabilidade
    for (const prize of probabilities) {
      if (random <= prize.cumulativeProbability) {
        return {
          prize: prize.nome,
          value: prize.valor,
          isIllustrative: prize.valor === 0
        };
      }
    }
    
    // Fallback para o último prêmio
    const lastPrize = caseItem.prizes[caseItem.prizes.length - 1];
    return {
      prize: lastPrize.nome,
      value: lastPrize.valor,
      isIllustrative: lastPrize.valor === 0
    };
  }

  calculateStatistics() {
    console.log('📊 Calculando estatísticas...');
    
    const totalSpent = this.results.reduce((sum, result) => sum + result.casePrice, 0);
    const totalWon = this.results.reduce((sum, result) => sum + result.prizeValue, 0);
    const actualRTP = totalWon / totalSpent;
    
    const illustrativePrizes = this.results.filter(r => r.isIllustrative).length;
    const realPrizes = this.results.filter(r => !r.isIllustrative).length;
    
    // Estatísticas por caixa
    const caseStats = {};
    this.results.forEach(result => {
      if (!caseStats[result.caseId]) {
        caseStats[result.caseId] = {
          caseName: result.caseName,
          simulations: 0,
          totalSpent: 0,
          totalWon: 0,
          illustrativePrizes: 0,
          realPrizes: 0
        };
      }
      
      caseStats[result.caseId].simulations++;
      caseStats[result.caseId].totalSpent += result.casePrice;
      caseStats[result.caseId].totalWon += result.prizeValue;
      
      if (result.isIllustrative) {
        caseStats[result.caseId].illustrativePrizes++;
      } else {
        caseStats[result.caseId].realPrizes++;
      }
    });
    
    // Calcular RTP por caixa
    Object.values(caseStats).forEach(stat => {
      stat.rtp = stat.totalWon / stat.totalSpent;
      stat.illustrativeRate = stat.illustrativePrizes / stat.simulations;
    });
    
    return {
      totalSimulations: this.results.length,
      totalSpent,
      totalWon,
      actualRTP,
      targetRTP: this.targetRTP,
      rtpDifference: Math.abs(actualRTP - this.targetRTP),
      isWithinEpsilon: Math.abs(actualRTP - this.targetRTP) <= this.epsilon,
      illustrativePrizes,
      realPrizes,
      illustrativeRate: illustrativePrizes / this.results.length,
      caseStats
    };
  }

  validateRTP(stats) {
    const isWithinEpsilon = stats.isWithinEpsilon;
    const rtpPercentage = stats.actualRTP * 100;
    const targetPercentage = stats.targetRTP * 100;
    const difference = Math.abs(stats.rtpDifference * 100);
    
    console.log(`🎯 RTP Alvo: ${targetPercentage.toFixed(1)}%`);
    console.log(`📊 RTP Real: ${rtpPercentage.toFixed(1)}%`);
    console.log(`📏 Diferença: ${difference.toFixed(1)}%`);
    console.log(`📐 Tolerância: ±${(this.epsilon * 100).toFixed(1)}%`);
    console.log(`✅ Dentro da tolerância: ${isWithinEpsilon ? 'SIM' : 'NÃO'}\n`);
    
    return isWithinEpsilon;
  }

  async generateReport(stats, isRTPValid) {
    console.log('📄 Gerando relatório...');
    
    const timestamp = new Date().toISOString();
    const report = {
      timestamp,
      testType: 'RTP_STATISTICAL',
      parameters: {
        targetRTP: this.targetRTP,
        epsilon: this.epsilon,
        totalSimulations: stats.totalSimulations
      },
      results: stats,
      validation: {
        isRTPValid,
        passed: isRTPValid
      }
    };
    
    // Salvar relatório JSON
    const fs = require('fs');
    const path = require('path');
    const reportPath = path.join(__dirname, '../reports/rtp-statistical-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    // Gerar relatório markdown
    const markdownReport = this.generateMarkdownReport(report);
    const markdownPath = path.join(__dirname, '../reports/rtp-statistical-test.md');
    fs.writeFileSync(markdownPath, markdownReport);
    
    // Resumo no console
    console.log('📊 Resumo do Teste Estatístico de RTP:');
    console.log(`Total de simulações: ${stats.totalSimulations}`);
    console.log(`Total gasto: R$ ${stats.totalSpent.toFixed(2)}`);
    console.log(`Total ganho: R$ ${stats.totalWon.toFixed(2)}`);
    console.log(`RTP real: ${(stats.actualRTP * 100).toFixed(2)}%`);
    console.log(`RTP alvo: ${(stats.targetRTP * 100).toFixed(2)}%`);
    console.log(`Diferença: ${(stats.rtpDifference * 100).toFixed(2)}%`);
    console.log(`Prêmios ilustrativos: ${stats.illustrativePrizes} (${(stats.illustrativeRate * 100).toFixed(1)}%)`);
    console.log(`Prêmios reais: ${stats.realPrizes} (${((1 - stats.illustrativeRate) * 100).toFixed(1)}%)`);
    console.log(`✅ Teste ${isRTPValid ? 'PASSOU' : 'FALHOU'}`);
    console.log(`\n📄 Relatórios salvos em:`);
    console.log(`  - ${reportPath}`);
    console.log(`  - ${markdownPath}`);
  }

  generateMarkdownReport(report) {
    let markdown = `# Relatório de Teste Estatístico de RTP - SlotBox\n\n`;
    markdown += `**Data:** ${new Date(report.timestamp).toLocaleString('pt-BR')}\n`;
    markdown += `**Tipo de teste:** ${report.testType}\n\n`;
    
    markdown += `## Parâmetros do Teste\n\n`;
    markdown += `- **RTP alvo:** ${(report.parameters.targetRTP * 100).toFixed(1)}%\n`;
    markdown += `- **Tolerância (epsilon):** ±${(report.parameters.epsilon * 100).toFixed(1)}%\n`;
    markdown += `- **Total de simulações:** ${report.parameters.totalSimulations.toLocaleString()}\n\n`;
    
    markdown += `## Resultados\n\n`;
    markdown += `- **Total gasto:** R$ ${report.results.totalSpent.toFixed(2)}\n`;
    markdown += `- **Total ganho:** R$ ${report.results.totalWon.toFixed(2)}\n`;
    markdown += `- **RTP real:** ${(report.results.actualRTP * 100).toFixed(2)}%\n`;
    markdown += `- **RTP alvo:** ${(report.results.targetRTP * 100).toFixed(2)}%\n`;
    markdown += `- **Diferença:** ${(report.results.rtpDifference * 100).toFixed(2)}%\n`;
    markdown += `- **Dentro da tolerância:** ${report.results.isWithinEpsilon ? '✅ SIM' : '❌ NÃO'}\n\n`;
    
    markdown += `## Distribuição de Prêmios\n\n`;
    markdown += `- **Prêmios ilustrativos:** ${report.results.illustrativePrizes} (${(report.results.illustrativeRate * 100).toFixed(1)}%)\n`;
    markdown += `- **Prêmios reais:** ${report.results.realPrizes} (${((1 - report.results.illustrativeRate) * 100).toFixed(1)}%)\n\n`;
    
    markdown += `## Estatísticas por Caixa\n\n`;
    markdown += `| Caixa | Simulações | Total Gasto | Total Ganho | RTP | Ilustrativos | Reais |\n`;
    markdown += `|-------|------------|-------------|-------------|-----|--------------|-------|\n`;
    
    Object.values(report.results.caseStats).forEach(stat => {
      markdown += `| ${stat.caseName} | ${stat.simulations} | R$ ${stat.totalSpent.toFixed(2)} | R$ ${stat.totalWon.toFixed(2)} | ${(stat.rtp * 100).toFixed(1)}% | ${stat.illustrativePrizes} | ${stat.realPrizes} |\n`;
    });
    
    markdown += `\n## Validação\n\n`;
    
    if (report.validation.isRTPValid) {
      markdown += `✅ **TESTE PASSOU** - O RTP real está dentro da tolerância esperada\n\n`;
      markdown += `O sistema está funcionando corretamente com um RTP de ${(report.results.actualRTP * 100).toFixed(2)}%, `;
      markdown += `que está dentro da tolerância de ±${(report.parameters.epsilon * 100).toFixed(1)}% do RTP alvo de ${(report.parameters.targetRTP * 100).toFixed(1)}%.\n`;
    } else {
      markdown += `❌ **TESTE FALHOU** - O RTP real está fora da tolerância esperada\n\n`;
      markdown += `O sistema está retornando um RTP de ${(report.results.actualRTP * 100).toFixed(2)}%, `;
      markdown += `que está ${(report.results.rtpDifference * 100).toFixed(2)}% fora do RTP alvo de ${(report.parameters.targetRTP * 100).toFixed(1)}%.\n`;
      markdown += `A tolerância permitida é de ±${(report.parameters.epsilon * 100).toFixed(1)}%.\n\n`;
      markdown += `**Recomendações:**\n`;
      markdown += `- Verificar as probabilidades dos prêmios no banco de dados\n`;
      markdown += `- Revisar o algoritmo de sorteio\n`;
      markdown += `- Verificar se há prêmios com valores incorretos\n`;
    }
    
    return markdown;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  const tester = new RTPStatisticalTester();
  tester.runStatisticalTest().catch(console.error);
}

module.exports = RTPStatisticalTester;
