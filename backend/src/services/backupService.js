const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

/**
 * Serviço de Backup Completo
 * Responsável por criar backups do banco de dados e pastas de imagens
 */
class BackupService {
  
  /**
   * Cria backup completo do sistema (banco + imagens)
   * @param {string} timestamp - Timestamp para nomear os backups
   * @returns {Object} Resultado do backup
   */
  async createFullBackup(timestamp) {
    const backupResult = {
      success: false,
      timestamp: timestamp,
      database_backup: null,
      images_backup: null,
      errors: []
    };

    try {
      console.log('🔄 Iniciando backup completo do sistema...');
      
      // 1. Criar backup do banco de dados
      const dbBackup = await this.createDatabaseBackup(timestamp);
      backupResult.database_backup = dbBackup;
      
      // 2. Criar backup das imagens
      const imagesBackup = await this.createImagesBackup(timestamp);
      backupResult.images_backup = imagesBackup;
      
      backupResult.success = true;
      console.log('✅ Backup completo realizado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro durante backup completo:', error);
      backupResult.errors.push(error.message);
    }

    return backupResult;
  }

  /**
   * Cria backup do banco de dados SQLite
   * @param {string} timestamp - Timestamp para nomear o backup
   * @returns {Object} Resultado do backup do banco
   */
  async createDatabaseBackup(timestamp) {
    try {
      console.log('💾 Criando backup do banco de dados...');
      
      const backupDir = path.join(__dirname, '../../backups');
      const backupFile = path.join(backupDir, `before_sync_${timestamp}.db`);
      
      // Garantir que o diretório de backup existe
      await fs.mkdir(backupDir, { recursive: true });
      
      // Copiar arquivo do banco diretamente (mais simples e confiável)
      const dbPath = path.join(__dirname, '../../prisma/dev.db');
      
      // Verificar se o banco existe
      try {
        await fs.access(dbPath);
      } catch (error) {
        throw new Error('Arquivo do banco de dados não encontrado');
      }
      
      // Copiar arquivo do banco
      await fs.copyFile(dbPath, backupFile);
      
      // Verificar se o arquivo foi criado
      const stats = await fs.stat(backupFile);
      
      console.log(`✅ Backup do banco criado: ${backupFile} (${stats.size} bytes)`);
      
      return {
        success: true,
        file_path: backupFile,
        file_size: stats.size,
        created_at: new Date()
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar backup do banco:', error);
      throw new Error(`Falha no backup do banco: ${error.message}`);
    }
  }

  /**
   * Cria backup das pastas de imagens
   * @param {string} timestamp - Timestamp para nomear o backup
   * @returns {Object} Resultado do backup das imagens
   */
  async createImagesBackup(timestamp) {
    try {
      console.log('🖼️ Criando backup das imagens...');
      
      const sourceDir = path.join(__dirname, '../../../frontend/public/imagens');
      const backupDir = path.join(__dirname, '../../backups/images_before_sync_' + timestamp);
      
      // Verificar se o diretório de imagens existe
      try {
        await fs.access(sourceDir);
      } catch (error) {
        throw new Error(`Diretório de imagens não encontrado: ${sourceDir}`);
      }
      
      // Criar diretório de backup
      await fs.mkdir(backupDir, { recursive: true });
      
      // Copiar todas as pastas e arquivos
      await this.copyDirectory(sourceDir, backupDir);
      
      // Verificar se a cópia foi bem-sucedida
      const backupStats = await this.getDirectoryStats(backupDir);
      
      console.log(`✅ Backup das imagens criado: ${backupDir}`);
      console.log(`📊 Arquivos copiados: ${backupStats.fileCount}, Tamanho total: ${backupStats.totalSize} bytes`);
      
      return {
        success: true,
        backup_path: backupDir,
        file_count: backupStats.fileCount,
        total_size: backupStats.totalSize,
        created_at: new Date()
      };
      
    } catch (error) {
      console.error('❌ Erro ao criar backup das imagens:', error);
      throw new Error(`Falha no backup das imagens: ${error.message}`);
    }
  }

  /**
   * Copia um diretório recursivamente
   * @param {string} src - Diretório de origem
   * @param {string} dest - Diretório de destino
   */
  async copyDirectory(src, dest) {
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        await fs.mkdir(destPath, { recursive: true });
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Obtém estatísticas de um diretório
   * @param {string} dirPath - Caminho do diretório
   * @returns {Object} Estatísticas do diretório
   */
  async getDirectoryStats(dirPath) {
    let fileCount = 0;
    let totalSize = 0;
    
    const scanDirectory = async (currentPath) => {
      const entries = await fs.readdir(currentPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);
        
        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else {
          const stats = await fs.stat(fullPath);
          fileCount++;
          totalSize += stats.size;
        }
      }
    };
    
    await scanDirectory(dirPath);
    
    return { fileCount, totalSize };
  }

  /**
   * Restaura backup do banco de dados
   * @param {string} backupFile - Caminho do arquivo de backup
   * @returns {Object} Resultado da restauração
   */
  async restoreDatabaseBackup(backupFile) {
    try {
      console.log(`🔄 Restaurando backup do banco: ${backupFile}`);
      
      // Verificar se o arquivo de backup existe
      await fs.access(backupFile);
      
      const dbPath = path.join(__dirname, '../../prisma/dev.db');
      
      // Fazer backup do banco atual antes de restaurar
      const currentBackup = path.join(__dirname, '../../backups/current_before_restore.db');
      try {
        await fs.copyFile(dbPath, currentBackup);
      } catch (error) {
        console.warn('⚠️ Não foi possível fazer backup do banco atual');
      }
      
      // Restaurar o backup (copiar arquivo)
      await fs.copyFile(backupFile, dbPath);
      
      console.log('✅ Banco de dados restaurado com sucesso!');
      
      return {
        success: true,
        restored_from: backupFile,
        current_backup: currentBackup,
        restored_at: new Date()
      };
      
    } catch (error) {
      console.error('❌ Erro ao restaurar backup do banco:', error);
      throw new Error(`Falha na restauração do banco: ${error.message}`);
    }
  }

  /**
   * Restaura backup das imagens
   * @param {string} backupPath - Caminho do backup das imagens
   * @returns {Object} Resultado da restauração
   */
  async restoreImagesBackup(backupPath) {
    try {
      console.log(`🔄 Restaurando backup das imagens: ${backupPath}`);
      
      // Verificar se o diretório de backup existe
      await fs.access(backupPath);
      
      const targetDir = path.join(__dirname, '../../../frontend/public/imagens');
      
      // Fazer backup do diretório atual antes de restaurar
      const currentBackup = path.join(__dirname, '../../backups/images_current_before_restore');
      await fs.mkdir(currentBackup, { recursive: true });
      await this.copyDirectory(targetDir, currentBackup);
      
      // Limpar diretório atual
      await fs.rm(targetDir, { recursive: true, force: true });
      
      // Restaurar backup
      await fs.mkdir(targetDir, { recursive: true });
      await this.copyDirectory(backupPath, targetDir);
      
      console.log('✅ Imagens restauradas com sucesso!');
      
      return {
        success: true,
        restored_from: backupPath,
        current_backup: currentBackup,
        restored_at: new Date()
      };
      
    } catch (error) {
      console.error('❌ Erro ao restaurar backup das imagens:', error);
      throw new Error(`Falha na restauração das imagens: ${error.message}`);
    }
  }

  /**
   * Lista todos os backups disponíveis
   * @returns {Array} Lista de backups
   */
  async listBackups() {
    try {
      const backupDir = path.join(__dirname, '../../backups');
      const entries = await fs.readdir(backupDir, { withFileTypes: true });
      
      const backups = [];
      
      for (const entry of entries) {
        const fullPath = path.join(backupDir, entry.name);
        const stats = await fs.stat(fullPath);
        
        if (entry.isDirectory() && entry.name.startsWith('images_before_sync_')) {
          const timestamp = entry.name.replace('images_before_sync_', '');
          const dbFile = path.join(backupDir, `before_sync_${timestamp}.sql`);
          
          try {
            await fs.access(dbFile);
            backups.push({
              timestamp: timestamp,
              type: 'full',
              database_backup: dbFile,
              images_backup: fullPath,
              created_at: stats.birthtime,
              size: await this.getDirectoryStats(fullPath)
            });
          } catch (error) {
            // Backup de imagens sem banco
            backups.push({
              timestamp: timestamp,
              type: 'images_only',
              images_backup: fullPath,
              created_at: stats.birthtime,
              size: await this.getDirectoryStats(fullPath)
            });
          }
        } else if (entry.isFile() && entry.name.startsWith('before_sync_') && entry.name.endsWith('.sql')) {
          const timestamp = entry.name.replace('before_sync_', '').replace('.sql', '');
          const imagesDir = path.join(backupDir, `images_before_sync_${timestamp}`);
          
          try {
            await fs.access(imagesDir);
            // Já foi processado acima
          } catch (error) {
            // Backup de banco sem imagens
            backups.push({
              timestamp: timestamp,
              type: 'database_only',
              database_backup: fullPath,
              created_at: stats.birthtime,
              size: { fileCount: 1, totalSize: stats.size }
            });
          }
        }
      }
      
      return backups.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
    } catch (error) {
      console.error('❌ Erro ao listar backups:', error);
      return [];
    }
  }
}

module.exports = new BackupService();
