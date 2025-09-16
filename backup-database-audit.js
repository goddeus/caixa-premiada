const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function backupDatabase() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(__dirname, 'backups', `db_before_audit_${timestamp}.sql`);
    
    // URL do banco de produção
    const databaseUrl = "postgresql://slotbox_user:IIVi8N0l6lzCaT72ueXeWdixJOFFRiZI@dpg-d31qva3ipnbc73cjkas0-a/slotbox_db";
    
    const client = new Client({
        connectionString: databaseUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log('Conectando ao banco de dados...');
        await client.connect();
        
        console.log('Iniciando backup do banco de dados...');
        
        // Listar todas as tabelas
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        
        let backupContent = `-- Backup do banco de dados SlotBox
-- Data: ${new Date().toISOString()}
-- Branch: audit/fix-all-${timestamp}

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Desabilitar triggers temporariamente
SET session_replication_role = replica;

`;

        // Para cada tabela, fazer dump dos dados
        for (const table of tablesResult.rows) {
            const tableName = table.table_name;
            console.log(`Fazendo backup da tabela: ${tableName}`);
            
            // Obter estrutura da tabela
            const createTableResult = await client.query(`
                SELECT 
                    'CREATE TABLE ' || schemaname || '.' || tablename || ' (' ||
                    string_agg(
                        column_name || ' ' || data_type || 
                        CASE 
                            WHEN character_maximum_length IS NOT NULL 
                            THEN '(' || character_maximum_length || ')'
                            ELSE ''
                        END ||
                        CASE 
                            WHEN is_nullable = 'NO' THEN ' NOT NULL'
                            ELSE ''
                        END,
                        ', '
                    ) || ');' as create_statement
                FROM information_schema.columns 
                WHERE table_name = '${tableName}' 
                AND table_schema = 'public'
                GROUP BY schemaname, tablename;
            `);
            
            if (createTableResult.rows.length > 0) {
                backupContent += `\n-- Estrutura da tabela ${tableName}\n`;
                backupContent += createTableResult.rows[0].create_statement + '\n';
            }
            
            // Obter dados da tabela
            const dataResult = await client.query(`SELECT * FROM "${tableName}"`);
            
            if (dataResult.rows.length > 0) {
                backupContent += `\n-- Dados da tabela ${tableName}\n`;
                
                for (const row of dataResult.rows) {
                    const columns = Object.keys(row);
                    const values = columns.map(col => {
                        const value = row[col];
                        if (value === null) return 'NULL';
                        if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
                        if (typeof value === 'boolean') return value;
                        if (value instanceof Date) return `'${value.toISOString()}'`;
                        return value;
                    });
                    
                    backupContent += `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
                }
            }
        }
        
        // Reabilitar triggers
        backupContent += `\n-- Reabilitar triggers\nSET session_replication_role = DEFAULT;\n`;
        
        // Salvar arquivo
        fs.writeFileSync(backupFile, backupContent);
        console.log(`Backup salvo em: ${backupFile}`);
        console.log(`Tamanho do arquivo: ${fs.statSync(backupFile).size} bytes`);
        
    } catch (error) {
        console.error('Erro durante o backup:', error);
        throw error;
    } finally {
        await client.end();
    }
}

// Executar backup
backupDatabase()
    .then(() => {
        console.log('Backup concluído com sucesso!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Falha no backup:', error);
        process.exit(1);
    });
