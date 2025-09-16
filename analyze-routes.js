const fs = require('fs');
const path = require('path');

function analyzeRoutes() {
    const routesDir = path.join(__dirname, 'backend', 'src', 'routes');
    const routes = [];
    
    console.log('Analisando rotas do backend...');
    
    if (!fs.existsSync(routesDir)) {
        console.log('Diretório de rotas não encontrado:', routesDir);
        return;
    }
    
    const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));
    
    routeFiles.forEach(file => {
        const filePath = path.join(routesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        console.log(`\n=== Analisando ${file} ===`);
        
        // Extrair rotas usando regex
        const routeMatches = content.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g);
        
        if (routeMatches) {
            routeMatches.forEach(match => {
                const methodMatch = match.match(/router\.(get|post|put|delete|patch)/);
                const pathMatch = match.match(/['"`]([^'"`]+)['"`]/);
                
                if (methodMatch && pathMatch) {
                    const method = methodMatch[1].toUpperCase();
                    const route = pathMatch[1];
                    
                    routes.push({
                        file,
                        method,
                        route,
                        handler: 'N/A' // Seria necessário análise mais profunda
                    });
                    
                    console.log(`  ${method} ${route}`);
                }
            });
        } else {
            console.log('  Nenhuma rota encontrada');
        }
    });
    
    // Gerar relatório
    const reportPath = path.join(__dirname, 'reports', 'routes_found.md');
    const reportDir = path.dirname(reportPath);
    
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    let report = `# Análise de Rotas do Backend\n\n`;
    report += `**Data:** ${new Date().toISOString()}\n`;
    report += `**Total de rotas encontradas:** ${routes.length}\n\n`;
    
    report += `## Resumo por Método HTTP\n\n`;
    const methodCount = {};
    routes.forEach(route => {
        methodCount[route.method] = (methodCount[route.method] || 0) + 1;
    });
    
    Object.entries(methodCount).forEach(([method, count]) => {
        report += `- **${method}:** ${count} rotas\n`;
    });
    
    report += `\n## Rotas Detalhadas\n\n`;
    report += `| Método | Rota | Arquivo | Handler |\n`;
    report += `|--------|------|---------|----------|\n`;
    
    routes.forEach(route => {
        report += `| ${route.method} | ${route.route} | ${route.file} | ${route.handler} |\n`;
    });
    
    report += `\n## Rotas por Arquivo\n\n`;
    
    const routesByFile = {};
    routes.forEach(route => {
        if (!routesByFile[route.file]) {
            routesByFile[route.file] = [];
        }
        routesByFile[route.file].push(route);
    });
    
    Object.entries(routesByFile).forEach(([file, fileRoutes]) => {
        report += `### ${file}\n\n`;
        fileRoutes.forEach(route => {
            report += `- **${route.method}** ${route.route}\n`;
        });
        report += `\n`;
    });
    
    fs.writeFileSync(reportPath, report);
    console.log(`\nRelatório salvo em: ${reportPath}`);
    
    return routes;
}

// Executar análise
const routes = analyzeRoutes();
console.log(`\nTotal de rotas encontradas: ${routes ? routes.length : 0}`);
