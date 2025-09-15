/**
 * Script para backup do banco de dados usando Prisma
 * Uso: node scripts/backup-database.js
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '../../backups');
    const backupFile = path.join(backupDir, `db_before_audit_${timestamp}.json`);
    
    // Criar diretório se não existir
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    console.log('Iniciando backup do banco de dados...');
    console.log(`Arquivo de backup: ${backupFile}`);
    
    try {
        // Fazer backup de todas as tabelas principais
        const backup = {
            timestamp: new Date().toISOString(),
            users: await prisma.user.findMany(),
            cases: await prisma.case.findMany(),
            prizes: await prisma.prize.findMany(),
            transactions: await prisma.transaction.findMany(),
            transactionsDemo: await prisma.transactionDemo.findMany(),
            affiliates: await prisma.affiliate.findMany(),
            affiliateHistory: await prisma.affiliateHistory.findMany(),
            affiliateCommissions: await prisma.affiliateCommission.findMany(),
            payments: await prisma.payment.findMany(),
            wallets: await prisma.wallet.findMany(),
            userRTPSessions: await prisma.userRTPSession.findMany(),
            userSessions: await prisma.userSession.findMany(),
            drawDetailedLogs: await prisma.drawDetailedLog.findMany(),
            rtpConfigs: await prisma.rTPConfig.findMany(),
            loginHistory: await prisma.loginHistory.findMany()
        };
        
        // Salvar backup
        fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
        
        // Estatísticas
        const stats = {
            users: backup.users.length,
            cases: backup.cases.length,
            prizes: backup.prizes.length,
            transactions: backup.transactions.length,
            transactionsDemo: backup.transactionsDemo.length,
            affiliates: backup.affiliates.length,
            affiliateHistory: backup.affiliateHistory.length,
            affiliateCommissions: backup.affiliateCommissions.length,
            payments: backup.payments.length,
            wallets: backup.wallets.length,
            userRTPSessions: backup.userRTPSessions.length,
            userSessions: backup.userSessions.length,
            drawDetailedLogs: backup.drawDetailedLogs.length,
            rtpConfigs: backup.rtpConfigs.length,
            loginHistory: backup.loginHistory.length
        };
        
        console.log('Backup concluído com sucesso!');
        console.log('Estatísticas:');
        Object.entries(stats).forEach(([table, count]) => {
            console.log(`  ${table}: ${count} registros`);
        });
        
        const fileSize = fs.statSync(backupFile).size;
        console.log(`Tamanho do arquivo: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
        
        // Salvar estatísticas em arquivo separado
        const statsFile = path.join(backupDir, `db_stats_${timestamp}.json`);
        fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2));
        
    } catch (error) {
        console.error('Erro durante o backup:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Executar backup
backupDatabase();
