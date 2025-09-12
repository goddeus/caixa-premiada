const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportDatabase() {
    try {
        console.log('🔄 Exportando dados do banco...');
        
        // Exportar usuários
        const users = await prisma.user.findMany();
        console.log(`✅ ${users.length} usuários encontrados`);
        
        // Exportar casos
        const cases = await prisma.case.findMany();
        console.log(`✅ ${cases.length} casos encontrados`);
        
        // Exportar prêmios
        const prizes = await prisma.prize.findMany();
        console.log(`✅ ${prizes.length} prêmios encontrados`);
        
        // Exportar pagamentos
        const payments = await prisma.payment.findMany();
        console.log(`✅ ${payments.length} pagamentos encontrados`);
        
        // Exportar configurações de gateway
        const gatewayConfigs = await prisma.gatewayConfig.findMany();
        console.log(`✅ ${gatewayConfigs.length} configurações de gateway encontradas`);
        
        // Criar arquivo de exportação
        const exportData = {
            users,
            cases,
            prizes,
            payments,
            gatewayConfigs,
            exportedAt: new Date().toISOString()
        };
        
        fs.writeFileSync('database-export.json', JSON.stringify(exportData, null, 2));
        console.log('✅ Dados exportados para database-export.json');
        
        // Criar script SQL para importação
        let sqlScript = `-- Script de importação para MySQL/SQLite
-- Gerado em: ${new Date().toISOString()}

`;

        // Inserir usuários
        if (users.length > 0) {
            sqlScript += `-- Usuários\n`;
            users.forEach(user => {
                sqlScript += `INSERT INTO users (id, nome, email, senha_hash, cpf, saldo, is_admin, criado_em) VALUES 
('${user.id}', '${user.nome}', '${user.email}', '${user.senha_hash}', '${user.cpf}', ${user.saldo}, ${user.is_admin ? 1 : 0}, '${user.criado_em}');\n`;
            });
            sqlScript += `\n`;
        }

        // Inserir casos
        if (cases.length > 0) {
            sqlScript += `-- Casos\n`;
            cases.forEach(caseItem => {
                sqlScript += `INSERT INTO cases (id, nome, preco, imagem_url, ativo, criado_em) VALUES 
('${caseItem.id}', '${caseItem.nome}', ${caseItem.preco}, '${caseItem.imagem_url}', ${caseItem.ativo ? 1 : 0}, '${caseItem.criado_em}');\n`;
            });
            sqlScript += `\n`;
        }

        // Inserir prêmios
        if (prizes.length > 0) {
            sqlScript += `-- Prêmios\n`;
            prizes.forEach(prize => {
                sqlScript += `INSERT INTO prizes (id, case_id, valor, probabilidade, nome, imagem_url, ativo, criado_em) VALUES 
('${prize.id}', '${prize.case_id}', ${prize.valor}, ${prize.probabilidade}, '${prize.nome || 'NULL'}', '${prize.imagem_url || 'NULL'}', ${prize.ativo ? 1 : 0}, '${prize.criado_em}');\n`;
            });
            sqlScript += `\n`;
        }

        // Inserir pagamentos
        if (payments.length > 0) {
            sqlScript += `-- Pagamentos\n`;
            payments.forEach(payment => {
                sqlScript += `INSERT INTO payments (id, user_id, tipo, valor, status, metodo_pagamento, gateway_id, qr_code, pix_copy_paste, criado_em, expira_em) VALUES 
('${payment.id}', '${payment.user_id}', '${payment.tipo}', ${payment.valor}, '${payment.status}', '${payment.metodo_pagamento}', '${payment.gateway_id || 'NULL'}', '${payment.qr_code || 'NULL'}', '${payment.pix_copy_paste || 'NULL'}', '${payment.criado_em}', '${payment.expira_em || 'NULL'}');\n`;
            });
            sqlScript += `\n`;
        }

        // Inserir configurações de gateway
        if (gatewayConfigs.length > 0) {
            sqlScript += `-- Configurações de Gateway\n`;
            gatewayConfigs.forEach(config => {
                sqlScript += `INSERT INTO gateway_configs (id, gateway_name, is_active, api_key, public_key, webhook_secret, base_url, pix_key, pix_key_type, webhook_url, redirect_url, sandbox_mode, min_deposit, max_deposit, min_withdraw, max_withdraw, deposit_fee, withdraw_fee, deposit_timeout, withdraw_timeout, supported_methods, config_data, created_at, updated_at, updated_by) VALUES 
('${config.id}', '${config.gateway_name}', ${config.is_active ? 1 : 0}, '${config.api_key || 'NULL'}', '${config.public_key || 'NULL'}', '${config.webhook_secret || 'NULL'}', '${config.base_url || 'NULL'}', '${config.pix_key || 'NULL'}', '${config.pix_key_type || 'NULL'}', '${config.webhook_url || 'NULL'}', '${config.redirect_url || 'NULL'}', ${config.sandbox_mode ? 1 : 0}, ${config.min_deposit}, ${config.max_deposit}, ${config.min_withdraw}, ${config.max_withdraw}, ${config.deposit_fee}, ${config.withdraw_fee}, ${config.deposit_timeout}, ${config.withdraw_timeout}, '${config.supported_methods}', '${config.config_data || 'NULL'}', '${config.created_at}', '${config.updated_at}', '${config.updated_by || 'NULL'}');\n`;
            });
        }

        fs.writeFileSync('database-import.sql', sqlScript);
        console.log('✅ Script SQL criado: database-import.sql');
        
        console.log('\n🎉 Exportação concluída!');
        console.log('📁 Arquivos criados:');
        console.log('   - database-export.json (dados completos)');
        console.log('   - database-import.sql (script SQL)');
        
    } catch (error) {
        console.error('❌ Erro na exportação:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportDatabase();
