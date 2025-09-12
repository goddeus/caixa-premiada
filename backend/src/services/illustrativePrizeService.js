const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Serviço de Gerenciamento de Prêmios Ilustrativos
 * 
 * Gerencia prêmios que são apenas para exibição visual,
 * não podem ser sorteados mas aparecem nas animações.
 */
class IllustrativePrizeService {

  /**
   * Criar um prêmio ilustrativo
   */
  async createIllustrativePrize(caseId, prizeData) {
    try {
      const prize = await prisma.illustrativePrize.create({
        data: {
          case_id: caseId,
          nome: prizeData.nome,
          valor: prizeData.valor,
          imagem_url: prizeData.imagem_url,
          descricao: prizeData.descricao || null
        }
      });

      console.log(`🎨 Prêmio ilustrativo criado: ${prize.nome} (R$ ${prize.valor})`);
      return prize;
    } catch (error) {
      console.error('Erro ao criar prêmio ilustrativo:', error);
      throw new Error('Falha ao criar prêmio ilustrativo');
    }
  }

  /**
   * Listar prêmios ilustrativos de uma caixa
   */
  async getIllustrativePrizesByCase(caseId) {
    try {
      const prizes = await prisma.illustrativePrize.findMany({
        where: {
          case_id: caseId,
          ativo: true
        },
        orderBy: { valor: 'desc' }
      });

      return prizes;
    } catch (error) {
      console.error('Erro ao listar prêmios ilustrativos:', error);
      throw new Error('Falha ao listar prêmios ilustrativos');
    }
  }

  /**
   * Atualizar prêmio ilustrativo
   */
  async updateIllustrativePrize(prizeId, updateData) {
    try {
      const prize = await prisma.illustrativePrize.update({
        where: { id: prizeId },
        data: {
          nome: updateData.nome,
          valor: updateData.valor,
          imagem_url: updateData.imagem_url,
          descricao: updateData.descricao,
          ativo: updateData.ativo
        }
      });

      console.log(`🎨 Prêmio ilustrativo atualizado: ${prize.nome}`);
      return prize;
    } catch (error) {
      console.error('Erro ao atualizar prêmio ilustrativo:', error);
      throw new Error('Falha ao atualizar prêmio ilustrativo');
    }
  }

  /**
   * Desativar prêmio ilustrativo
   */
  async deactivateIllustrativePrize(prizeId) {
    try {
      const prize = await prisma.illustrativePrize.update({
        where: { id: prizeId },
        data: { ativo: false }
      });

      console.log(`🎨 Prêmio ilustrativo desativado: ${prize.nome}`);
      return prize;
    } catch (error) {
      console.error('Erro ao desativar prêmio ilustrativo:', error);
      throw new Error('Falha ao desativar prêmio ilustrativo');
    }
  }

  /**
   * Deletar prêmio ilustrativo
   */
  async deleteIllustrativePrize(prizeId) {
    try {
      await prisma.illustrativePrize.delete({
        where: { id: prizeId }
      });

      console.log(`🎨 Prêmio ilustrativo deletado: ${prizeId}`);
      return true;
    } catch (error) {
      console.error('Erro ao deletar prêmio ilustrativo:', error);
      throw new Error('Falha ao deletar prêmio ilustrativo');
    }
  }

  /**
   * Obter estatísticas de prêmios ilustrativos
   */
  async getIllustrativePrizeStats() {
    try {
      const stats = await prisma.illustrativePrize.groupBy({
        by: ['case_id'],
        where: { ativo: true },
        _count: { id: true },
        _sum: { valor: true }
      });

      const cases = await prisma.case.findMany({
        where: {
          id: { in: stats.map(s => s.case_id) }
        },
        select: { id: true, nome: true }
      });

      return stats.map(stat => {
        const caseInfo = cases.find(c => c.id === stat.case_id);
        return {
          case_id: stat.case_id,
          case_name: caseInfo?.nome || 'Caixa não encontrada',
          total_prizes: stat._count.id,
          total_value: stat._sum.valor || 0
        };
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de prêmios ilustrativos:', error);
      throw new Error('Falha ao obter estatísticas');
    }
  }

  /**
   * Criar prêmios ilustrativos padrão para uma caixa
   */
  async createDefaultIllustrativePrizes(caseId) {
    try {
      const defaultPrizes = [
        {
          nome: 'iPhone 15 Pro Max',
          valor: 8000.00,
          imagem_url: '/imagens/iphone-15-pro-max.png',
          descricao: 'O mais novo iPhone com tecnologia de ponta'
        },
        {
          nome: 'MacBook Pro M3',
          valor: 12000.00,
          imagem_url: '/imagens/macbook-pro-m3.png',
          descricao: 'Notebook profissional da Apple'
        },
        {
          nome: 'PlayStation 5',
          valor: 4500.00,
          imagem_url: '/imagens/ps5.png',
          descricao: 'Console de última geração da Sony'
        },
        {
          nome: 'Samsung Galaxy S24 Ultra',
          valor: 6000.00,
          imagem_url: '/imagens/galaxy-s24-ultra.png',
          descricao: 'Smartphone premium da Samsung'
        }
      ];

      const createdPrizes = [];
      for (const prizeData of defaultPrizes) {
        const prize = await this.createIllustrativePrize(caseId, prizeData);
        createdPrizes.push(prize);
      }

      console.log(`🎨 Criados ${createdPrizes.length} prêmios ilustrativos padrão para a caixa ${caseId}`);
      return createdPrizes;
    } catch (error) {
      console.error('Erro ao criar prêmios ilustrativos padrão:', error);
      throw new Error('Falha ao criar prêmios ilustrativos padrão');
    }
  }
}

module.exports = new IllustrativePrizeService();
