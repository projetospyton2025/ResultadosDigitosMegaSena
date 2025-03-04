// Função para analisar frequências entre sequências de dígitos
// Função para analisar frequências entre sequências de dígitos
function analisarFrequenciaEntreSequencias() {
    console.log("Função analisarFrequenciaEntreSequencias chamada");
    
    // Verifica onde os resultados podem estar armazenados
    let resultados = null;
    
    // Tenta encontrar os resultados nas variáveis possíveis
    if (window.allResults && window.allResults.length > 0) {
        resultados = window.allResults;
        console.log("Resultados encontrados em window.allResults:", resultados.length);
    } else if (window.filteredResults && window.filteredResults.length > 0) {
        resultados = window.filteredResults;
        console.log("Resultados encontrados em window.filteredResults:", resultados.length);
    } else if (typeof allResults !== 'undefined' && allResults.length > 0) {
        resultados = allResults;
        console.log("Resultados encontrados em allResults:", resultados.length);
    } else {
        // Tentar buscar os resultados da tabela (backup)
        try {
            resultados = extrairResultadosDaTabela();
            if (resultados && resultados.length > 0) {
                console.log("Resultados extraídos da tabela:", resultados.length);
            }
        } catch (error) {
            console.error("Erro ao extrair resultados da tabela:", error);
        }
    }
    
    // Verificar se os resultados foram carregados
    if (!resultados || resultados.length === 0) {
        console.error("Resultados não carregados. Execute o carregamento primeiro.");
        alert("É necessário carregar os resultados primeiro antes de analisar frequências.\n\nPor favor, clique em 'Carregar Resultados' e tente novamente.");
        return;
    }
    
    console.log("Iniciando análise detalhada de frequência entre sequências...");
    
    // Estrutura para armazenar estatísticas
    const estatisticas = {
        combinacoesFrequentes: {},  // Para armazenar todas as combinações encontradas
        intervalos: {},             // Para armazenar análises de intervalos
        mediaGeral: 0,              // Média geral de intervalos
        totalIntervalos: 0          // Total de intervalos analisados
    };
    
    // 1. Agrupar resultados por combinação de dígitos
    resultados.forEach(result => {
        const combinacao = result.digitos_ordenados.join(',');
        if (!estatisticas.combinacoesFrequentes[combinacao]) {
            estatisticas.combinacoesFrequentes[combinacao] = {
                digitos: result.digitos_ordenados,
                quantidade: result.contagem_digitos,
                concursos: [],
                intervalos: [],
                diferencasDetalhadas: []
            };
        }
        estatisticas.combinacoesFrequentes[combinacao].concursos.push(result.concurso);
    });
    
    // 2. Para cada combinação, calcular intervalos entre ocorrências
    Object.values(estatisticas.combinacoesFrequentes).forEach(combo => {
        // Ordenar concursos em ordem crescente
        combo.concursos.sort((a, b) => a - b);
        
        // Calcular intervalos (diferenças entre concursos consecutivos)
        for (let i = 1; i < combo.concursos.length; i++) {
            const intervalo = combo.concursos[i] - combo.concursos[i-1];
            combo.intervalos.push(intervalo);
            
            // Armazenar detalhes das diferenças
            combo.diferencasDetalhadas.push({
                de: combo.concursos[i-1],
                para: combo.concursos[i],
                diferenca: intervalo
            });
        }
        
        // Calcular estatísticas dos intervalos
        if (combo.intervalos.length > 0) {
            combo.somaIntervalos = combo.intervalos.reduce((acc, val) => acc + val, 0);
            combo.mediaIntervalos = Math.round(combo.somaIntervalos / combo.intervalos.length);
            combo.menorIntervalo = Math.min(...combo.intervalos);
            combo.maiorIntervalo = Math.max(...combo.intervalos);
            combo.ultimoIntervalo = combo.intervalos[combo.intervalos.length - 1];
            
            // Adicionar ao total geral
            estatisticas.totalIntervalos += combo.intervalos.length;
            estatisticas.mediaGeral = (estatisticas.mediaGeral || 0) + combo.somaIntervalos;
        }
    });
    
    // Calcular média geral de intervalos
    if (estatisticas.totalIntervalos > 0) {
        estatisticas.mediaGeral = Math.round(estatisticas.mediaGeral / estatisticas.totalIntervalos);
    }
    
    // 3. Converter para array e ordenar por frequência (número de ocorrências)
    estatisticas.combinacoesOrdenadas = Object.values(estatisticas.combinacoesFrequentes)
        .sort((a, b) => b.concursos.length - a.concursos.length);
    
    // 4. Encontrar valores máximos para destaque
    estatisticas.maximos = {
        frequencia: Math.max(...estatisticas.combinacoesOrdenadas.map(c => c.concursos.length)),
        mediaIntervalos: Math.max(...estatisticas.combinacoesOrdenadas.map(c => c.mediaIntervalos || 0)),
        menorIntervalo: Math.max(...estatisticas.combinacoesOrdenadas.map(c => c.menorIntervalo || 0)),
        maiorIntervalo: Math.max(...estatisticas.combinacoesOrdenadas.map(c => c.maiorIntervalo || 0)),
        ultimoIntervalo: Math.max(...estatisticas.combinacoesOrdenadas.map(c => c.ultimoIntervalo || 0))
    };
    
    // 5. Gerar saída para a interface
    gerarSaidaAnaliseFrequencia(estatisticas);
    
    // 6. Adicionar opção para exportar
    adicionarBotaoExportarFrequencia(estatisticas);
    
	// Armazenar os resultados analisados globalmente para uso posterior
    window.resultadosAnalisados = estatisticas;
	
	
	// Retornar as estatísticas
    return estatisticas;
}

// Função para extrair resultados da tabela caso as variáveis não estejam disponíveis
function extrairResultadosDaTabela() {
    const tabela = document.getElementById('megaSenaResults');
    if (!tabela) return null;
    
    const linhas = tabela.querySelectorAll('tbody tr');
    if (!linhas || linhas.length === 0) return null;
    
    const resultados = [];
    
    linhas.forEach(linha => {
        const colunas = linha.querySelectorAll('td');
        if (colunas.length >= 5) {
            // Extrair dados das colunas
            const concurso = parseInt(colunas[0].textContent.trim());
            const data = colunas[1].textContent.trim();
            const digitosTexto = colunas[4].textContent.trim(); // Dígitos ordenados
            
            // Converter dígitos ordenados para array
            const digitos_ordenados = digitosTexto.split(',').map(d => d.trim());
            
            // Criar objeto de resultado
            resultados.push({
                concurso,
                data,
                digitos_ordenados,
                contagem_digitos: digitos_ordenados.length
            });
        }
    });
    
    return resultados;
}




// Função para gerar saída na interface
function gerarSaidaAnaliseFrequencia(estatisticas) {
    // Verificar se já existe o container para análise de frequência
    let container = document.getElementById('frequencia-analise-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'frequencia-analise-container';
        container.className = 'statistics-container';
        
        // Inserir após o container de combinações existente
        const combinationAnalysis = document.getElementById('combinationAnalysis');
        if (combinationAnalysis) {
            combinationAnalysis.parentNode.insertBefore(container, combinationAnalysis.nextSibling);
        } else {
            // Alternativa: inserir antes da tabela de resultados
            const resultsTable = document.getElementById('megaSenaResults');
            if (resultsTable) {
                resultsTable.parentNode.insertBefore(container, resultsTable);
            } else {
                // Última opção: adicionar ao final do container principal
                document.querySelector('.container').appendChild(container);
            }
        }
    }
    
    // Limpar o container existente
    container.innerHTML = '';
    
    // Adicionar título
    const title = document.createElement('h2');
    title.textContent = 'Análise de Frequência entre Sequências de Dígitos';
    container.appendChild(title);
    
    // Adicionar estatísticas gerais
    const statsSection = document.createElement('div');
    statsSection.className = 'estatisticas-gerais';
    statsSection.innerHTML = `
        <h3>Estatísticas Gerais de Intervalos</h3>
        <div class="stats-grid">
            <div class="stat-box">
                <div class="stat-title">Média Geral</div>
                <div class="stat-value">${estatisticas.mediaGeral}</div>
                <div class="stat-desc">concursos entre aparições</div>
            </div>
            <div class="stat-box">
                <div class="stat-title">Total de Intervalos</div>
                <div class="stat-value">${estatisticas.totalIntervalos}</div>
                <div class="stat-desc">analisados</div>
            </div>
            <div class="stat-box">
                <div class="stat-title">Maior Frequência</div>
                <div class="stat-value destacado">${estatisticas.maximos.frequencia}</div>
                <div class="stat-desc">aparições</div>
            </div>
            <div class="stat-box">
                <div class="stat-title">Maior Intervalo</div>
                <div class="stat-value destacado">${estatisticas.maximos.maiorIntervalo}</div>
                <div class="stat-desc">concursos</div>
            </div>
        </div>
    `;
    container.appendChild(statsSection);
    
    // Adicionar tabela de combinações com frequências
    const tableSection = document.createElement('div');
    tableSection.className = 'section-analise-frequencia';
    tableSection.innerHTML = `
        <h3>Frequências entre Sequências de Dígitos</h3>
        <p>Esta tabela mostra a análise de todas as combinações encontradas, ordenadas por frequência.</p>
        <table id="tabela-frequencia-sequencias" class="combinations-table">
            <thead>
                <tr>
                    <th>Combinação</th>
                    <th>Qtd. Dígitos</th>
                    <th>Frequência</th>
                    <th>Média Intervalos</th>
                    <th>Menor Intervalo</th>
                    <th>Maior Intervalo</th>
                    <th>Último Intervalo</th>
                    <th>Diferenças</th>
                    <th>Detalhes</th>
                </tr>
            </thead>
            <tbody>
                ${gerarLinhasTabelaFrequencia(estatisticas)}
            </tbody>
        </table>
    `;
    container.appendChild(tableSection);
    
    // Adicionar CSS necessário
    adicionarEstilosAnaliseFrequencia();
    
    // Adicionar evento para botões de detalhes
    adicionarEventosBotoesDetalhes(estatisticas);
}

// Função para gerar linhas da tabela de frequência
function gerarLinhasTabelaFrequencia(estatisticas) {
    let html = '';
    
    estatisticas.combinacoesOrdenadas.forEach((combo, index) => {
        // Verificar se o valor é máximo para destacar
        const isMaxFreq = combo.concursos.length === estatisticas.maximos.frequencia;
        const isMaxMedia = combo.mediaIntervalos === estatisticas.maximos.mediaIntervalos;
        const isMaxMenor = combo.menorIntervalo === estatisticas.maximos.menorIntervalo;
        const isMaxMaior = combo.maiorIntervalo === estatisticas.maximos.maiorIntervalo;
        const isMaxUltimo = combo.ultimoIntervalo === estatisticas.maximos.ultimoIntervalo;
        
        // Limitar exibição das diferenças para os primeiros 5 valores
        const diferencasTexto = combo.intervalos.slice(0, 5).join(',') + 
            (combo.intervalos.length > 5 ? '...' : '');
        
        html += `
            <tr class="${isMaxFreq ? 'row-destacado' : ''}">
                <td>${combo.digitos.join(',')}</td>
                <td>${combo.quantidade}</td>
                <td class="${isMaxFreq ? 'valor-max' : ''}">${combo.concursos.length}</td>
                <td class="${isMaxMedia ? 'valor-max' : ''}">${combo.mediaIntervalos || '-'}</td>
                <td class="${isMaxMenor ? 'valor-max' : ''}">${combo.menorIntervalo || '-'}</td>
                <td class="${isMaxMaior ? 'valor-max' : ''}">${combo.maiorIntervalo || '-'}</td>
                <td class="${isMaxUltimo ? 'valor-max' : ''}">${combo.ultimoIntervalo || '-'}</td>
                <td>${diferencasTexto}</td>
                <td>
                    <button class="button-detail" data-index="${index}">
                        Ver Detalhes
                    </button>
                </td>
            </tr>
        `;
    });
    
    return html;
}

// Função para adicionar estilos CSS
function adicionarEstilosAnaliseFrequencia() {
    // Verificar se o estilo já existe
    if (document.getElementById('estilo-analise-frequencia')) return;
    
    const style = document.createElement('style');
    style.id = 'estilo-analise-frequencia';
    style.textContent = `
        .estatisticas-gerais {
            margin: 20px 0;
            padding: 15px;
            background-color: #f0f8ff;
            border-radius: 5px;
            border: 1px solid #4CAF50;
        }
        .stats-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            justify-content: space-between;
            margin-top: 15px;
        }
        .stat-box {
            flex: 1;
            min-width: 200px;
            padding: 15px;
            background-color: #e8f5e9;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-title {
            font-weight: bold;
            color: #2e7d32;
            margin-bottom: 5px;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
        }
        .stat-desc {
            font-size: 14px;
            color: #666;
        }
        .destacado, .valor-max {
            color: #d9534f;
            font-weight: bold;
        }
        .row-destacado {
            background-color: #ffecb3 !important;
        }
        .section-analise-frequencia {
            margin: 30px 0;
        }
        .button-detail {
            background-color: #4CAF50;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 3px;
            cursor: pointer;
        }
        .button-detail:hover {
            background-color: #45a049;
        }
        .modal-detalhe-frequencia {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .modal-content-frequencia {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            width: 90%;
        }
        .close-button-frequencia {
            float: right;
            font-size: 24px;
            font-weight: bold;
            cursor: pointer;
            color: #666;
        }
        .diferenca-positiva {
            color: green;
        }
        .diferenca-negativa {
            color: red;
        }
    `;
    
    document.head.appendChild(style);
}

// Função para adicionar eventos aos botões de detalhes
function adicionarEventosBotoesDetalhes(estatisticas) {
    document.querySelectorAll('.button-detail').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const combo = estatisticas.combinacoesOrdenadas[index];
            mostrarDetalhesFrequencia(combo);
        });
    });
}

// Função para mostrar detalhes da frequência
function mostrarDetalhesFrequencia(combo) {
    // Criar modal
    const modal = document.createElement('div');
    modal.className = 'modal-detalhe-frequencia';
    
    // Criar conteúdo do modal
    const content = document.createElement('div');
    content.className = 'modal-content-frequencia';
    
    // Botão para fechar
    const closeButton = document.createElement('span');
    closeButton.className = 'close-button-frequencia';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => document.body.removeChild(modal);
    
    // Título e informações básicas
    content.innerHTML = `
        <h3>Detalhes da Combinação: ${combo.digitos.join(',')}</h3>
        <p><strong>Quantidade de dígitos:</strong> ${combo.quantidade}</p>
        <p><strong>Aparece em ${combo.concursos.length} concursos:</strong> ${combo.concursos.slice(0, 20).join(', ')}${combo.concursos.length > 20 ? '...' : ''}</p>
        <p><strong>Média de intervalo:</strong> ${combo.mediaIntervalos || '-'} concursos</p>
        <p><strong>Menor intervalo:</strong> ${combo.menorIntervalo || '-'} concursos</p>
        <p><strong>Maior intervalo:</strong> ${combo.maiorIntervalo || '-'} concursos</p>
        
        <h4>Intervalos entre Ocorrências</h4>
        <table style="width:100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
                <tr>
                    <th style="padding: 8px; border: 1px solid #ddd; background-color: #4CAF50; color: white;">De Concurso</th>
                    <th style="padding: 8px; border: 1px solid #ddd; background-color: #4CAF50; color: white;">Para Concurso</th>
                    <th style="padding: 8px; border: 1px solid #ddd; background-color: #4CAF50; color: white;">Intervalo</th>
                </tr>
            </thead>
            <tbody>
                ${gerarTabelaDetalheIntervalos(combo)}
            </tbody>
        </table>
    `;
    
    // Adicionar ao modal
    content.insertBefore(closeButton, content.firstChild);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Fechar modal ao clicar fora dele
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Função para gerar tabela de detalhe de intervalos
function gerarTabelaDetalheIntervalos(combo) {
    if (!combo.diferencasDetalhadas || combo.diferencasDetalhadas.length === 0) {
        return '<tr><td colspan="3" style="text-align:center; padding: 8px; border: 1px solid #ddd;">Nenhum intervalo disponível</td></tr>';
    }
    
    let html = '';
    
    combo.diferencasDetalhadas.forEach((intervalo, index) => {
        html += `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${intervalo.de}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${intervalo.para}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">${intervalo.diferenca}</td>
            </tr>
        `;
    });
    
    return html;
}

// Função para adicionar botão de exportar análise
function adicionarBotaoExportarFrequencia(estatisticas) {
    const downloadButtonsDiv = document.querySelector('.download-buttons');
    if (!downloadButtonsDiv) return;
    
    // Verificar se o botão já existe
    if (document.getElementById('exportarAnaliseFrequencia')) return;
    
    const button = document.createElement('button');
    button.id = 'exportarAnaliseFrequencia';
    button.className = 'button';
    button.textContent = 'Exportar Análise de Frequência';
    button.onclick = () => exportarAnaliseFrequencia(estatisticas);
    
    downloadButtonsDiv.appendChild(button);
}

// Função para exportar análise
function exportarAnaliseFrequencia(estatisticas) {
    // Gerar conteúdo para Excel
    let excelContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <!--[if gte mso 9]>
    <xml>
        <x:ExcelWorkbook>
            <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                    <x:Name>Análise Frequência</x:Name>
                    <x:WorksheetOptions>
                        <x:DisplayGridlines/>
                    </x:WorksheetOptions>
                </x:ExcelWorksheet>
            </x:ExcelWorksheets>
        </x:ExcelWorkbook>
    </xml>
    <![endif]-->
    <style>
        th { 
            background-color: #4CAF50; 
            color: white; 
            font-weight: bold; 
            text-align: center; 
            border: 1px solid #ddd;
            padding: 8px;
        }
        td { 
            text-align: center; 
            border: 1px solid #ddd;
            padding: 8px;
        }
        .header {
            font-size: 16pt;
            font-weight: bold;
            color: #006400;
            text-align: center;
            padding: 10px;
        }
        .subheader {
            font-size: 14pt;
            font-weight: bold;
            color: #006400;
            padding: 5px;
        }
        .valor-max {
            color: #d9534f;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">Análise de Frequência entre Sequências de Dígitos - Mega-Sena</div>
    
    <div class="subheader">Estatísticas Gerais</div>
    <table width="100%" border="1" cellspacing="0" cellpadding="5">
        <tr>
            <th>Métrica</th>
            <th>Valor</th>
            <th>Descrição</th>
        </tr>
        <tr>
            <td>Média Geral de Intervalos</td>
            <td>${estatisticas.mediaGeral}</td>
            <td>Média de concursos entre repetições</td>
        </tr>
        <tr>
            <td>Total de Intervalos</td>
            <td>${estatisticas.totalIntervalos}</td>
            <td>Número total de intervalos analisados</td>
        </tr>
        <tr>
            <td>Maior Frequência</td>
            <td class="valor-max">${estatisticas.maximos.frequencia}</td>
            <td>Combinação que mais aparece</td>
        </tr>
        <tr>
            <td>Maior Intervalo</td>
            <td class="valor-max">${estatisticas.maximos.maiorIntervalo}</td>
            <td>Maior número de concursos entre repetições</td>
        </tr>
    </table>
    
    <div class="subheader">Frequências entre Sequências</div>
    <table width="100%" border="1" cellspacing="0" cellpadding="5">
        <tr>
            <th>Combinação</th>
            <th>Qtd. Dígitos</th>
            <th>Frequência</th>
            <th>Média Intervalos</th>
            <th>Menor Intervalo</th>
            <th>Maior Intervalo</th>
            <th>Último Intervalo</th>
            <th>Diferenças</th>
        </tr>
`;
    
    // Adicionar cada linha
    estatisticas.combinacoesOrdenadas.forEach(combo => {
        // Verificar destaques
        const isMaxFreq = combo.concursos.length === estatisticas.maximos.frequencia;
        const isMaxMedia = combo.mediaIntervalos === estatisticas.maximos.mediaIntervalos;
        const isMaxMenor = combo.menorIntervalo === estatisticas.maximos.menorIntervalo;
        const isMaxMaior = combo.maiorIntervalo === estatisticas.maximos.maiorIntervalo;
        const isMaxUltimo = combo.ultimoIntervalo === estatisticas.maximos.ultimoIntervalo;
        
        // Todos os intervalos
        const diferencasTexto = combo.intervalos.join(',');
        
        excelContent += `
        <tr>
            <td>${combo.digitos.join(',')}</td>
            <td>${combo.quantidade}</td>
            <td ${isMaxFreq ? 'class="valor-max"' : ''}>${combo.concursos.length}</td>
            <td ${isMaxMedia ? 'class="valor-max"' : ''}>${combo.mediaIntervalos || '-'}</td>
            <td ${isMaxMenor ? 'class="valor-max"' : ''}>${combo.menorIntervalo || '-'}</td>
            <td ${isMaxMaior ? 'class="valor-max"' : ''}>${combo.maiorIntervalo || '-'}</td>
            <td ${isMaxUltimo ? 'class="valor-max"' : ''}>${combo.ultimoIntervalo || '-'}</td>
            <td>${diferencasTexto}</td>
        </tr>
`;
    });
    
    excelContent += `
    </table>
</body>
</html>
`;
    
    // Criar o blob com tipo MIME para Excel
    const blob = new Blob([excelContent], {type: 'application/vnd.ms-excel'});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = 'analise_frequencia_digitos_megasena.xls';
    link.click();
}

// Adicionar a função ao carregamento da página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se já existe o botão de carregamento
    const loadButton = document.getElementById('loadButton');
    if (loadButton) {
        // Guardar o evento original
        const originalOnClick = loadButton.onclick;
        
        // Adicionar novo evento que executa o original e depois a análise
        loadButton.onclick = function(e) {
            // Executar o evento original
            if (typeof originalOnClick === 'function') {
                originalOnClick.call(this, e);
            }
            
            // Esperar pelo carregamento dos dados (2 segundos)
            setTimeout(function() {
                analisarFrequenciaEntreSequencias();
            }, 2000);
        };
        
        // Adicionar botão específico para análise de frequência
        const actionsDiv = document.querySelector('.actions');
        if (actionsDiv) {
            const analisarButton = document.createElement('button');
            analisarButton.className = 'button';
            analisarButton.textContent = 'Analisar Frequências';
            analisarButton.onclick = analisarFrequenciaEntreSequencias;
            actionsDiv.appendChild(analisarButton);
        }
    }
	
});

// Função para adicionar popup de explicação às estatísticas
function adicionarPopupExplicacao() {
    // Encontrar todos os cabeçalhos de estatísticas
    const tituloEstatisticas = document.querySelector('.estatisticas-gerais h3');
    
    if (!tituloEstatisticas) {
        // Se não encontrar o título, tenta criar elemento explicativo para cada stat-box
        const statBoxes = document.querySelectorAll('.stat-box');
        statBoxes.forEach(box => {
            const titulo = box.querySelector('.stat-title');
            if (titulo) {
                adicionarIconeInfo(titulo, obterExplicacaoPara(titulo.textContent.trim()));
            }
        });
        
        // Adicionar explicação geral também ao título da seção se existir
        const tituloSecao = document.querySelector('h2:contains("Estatísticas Gerais")');
        if (tituloSecao) {
            adicionarIconeInfo(tituloSecao, obterExplicacaoGeral());
        }
    } else {
        // Se encontrar o título, adiciona ao título principal
        adicionarIconeInfo(tituloEstatisticas, obterExplicacaoGeral());
    }
}

// Função auxiliar para adicionar ícone de informação
function adicionarIconeInfo(elemento, explicacao) {
    // Criar ícone de informação
    const iconeInfo = document.createElement('span');
    iconeInfo.className = 'info-icon';
    iconeInfo.innerHTML = ' <i>i</i> ';
    iconeInfo.style.display = 'inline-block';
    iconeInfo.style.width = '16px';
    iconeInfo.style.height = '16px';
    iconeInfo.style.borderRadius = '50%';
    iconeInfo.style.backgroundColor = '#4CAF50';
    iconeInfo.style.color = 'white';
    iconeInfo.style.textAlign = 'center';
    iconeInfo.style.lineHeight = '16px';
    iconeInfo.style.fontSize = '12px';
    iconeInfo.style.fontWeight = 'bold';
    iconeInfo.style.marginLeft = '5px';
    iconeInfo.style.cursor = 'pointer';
    
    // Adicionar o ícone após o elemento
    elemento.appendChild(iconeInfo);
    
    // Criar o popup
    const popup = document.createElement('div');
    popup.className = 'explicacao-popup';
    popup.innerHTML = explicacao;
    popup.style.display = 'none';
    popup.style.position = 'absolute';
    popup.style.backgroundColor = 'white';
    popup.style.border = '1px solid #ddd';
    popup.style.borderRadius = '5px';
    popup.style.padding = '15px';
    popup.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    popup.style.zIndex = '1000';
    popup.style.maxWidth = '400px';
    popup.style.fontSize = '14px';
    popup.style.lineHeight = '1.5';
    
    // Adicionar o popup ao documento
    document.body.appendChild(popup);
    
    // Mostrar popup ao clicar no ícone
    iconeInfo.addEventListener('click', function(e) {
        e.stopPropagation();
        if (popup.style.display === 'none') {
            // Calcular posição
            const rect = iconeInfo.getBoundingClientRect();
            popup.style.left = rect.left + 'px';
            popup.style.top = (rect.bottom + 10) + 'px';
            
            // Mostrar popup
            popup.style.display = 'block';
            
            // Ocultar outros popups abertos
            document.querySelectorAll('.explicacao-popup').forEach(p => {
                if (p !== popup) p.style.display = 'none';
            });
        } else {
            popup.style.display = 'none';
        }
    });
    
    // Fechar popup ao clicar em qualquer lugar fora dele
    document.addEventListener('click', function(e) {
        if (e.target !== iconeInfo && e.target !== popup) {
            popup.style.display = 'none';
        }
    });
}

// Função para obter explicação com base no título
function obterExplicacaoPara(titulo) {
    switch (titulo) {
        case 'Média Geral':
            return `
                <h4>Média Geral de Intervalos</h4>
                <p><strong>O que significa:</strong> Em média, uma mesma combinação específica de dígitos reaparece a cada X concursos.</p>
                <p><strong>Interpretação:</strong> Este valor é calculado somando todos os intervalos detectados entre aparições repetidas de todas as combinações de dígitos e dividindo pelo número total de intervalos. É uma medida da "frequência média" com que os padrões se repetem.</p>
                <p><strong>Relevância:</strong> Um valor alto indica que as combinações de dígitos tendem a demorar muitos concursos para se repetir, o que é esperado em um sorteio aleatório.</p>
            `;
        case 'Total de Intervalos':
            return `
                <h4>Total de Intervalos Analisados</h4>
                <p><strong>O que significa:</strong> Foram detectados X casos onde uma combinação de dígitos apareceu e depois reapareceu em um concurso posterior.</p>
                <p><strong>Interpretação:</strong> Cada intervalo representa uma observação de quanto tempo (em número de concursos) uma combinação levou para reaparecer.</p>
                <p><strong>Relevância:</strong> Quanto maior este número, mais dados a análise possui, tornando as estatísticas mais confiáveis.</p>
            `;
        case 'Maior Frequência':
            return `
                <h4>Maior Frequência</h4>
                <p><strong>O que significa:</strong> A combinação de dígitos mais comum apareceu em X concursos diferentes.</p>
                <p><strong>Interpretação:</strong> Este valor mostra a combinação de dígitos que mais se repetiu na história dos sorteios analisados.</p>
                <p><strong>Relevância:</strong> Esta combinação mais frequente (geralmente "0,1,2,3,4,5,6") representa a sequência de dígitos mais recorrente nos sorteios.</p>
            `;
        case 'Maior Intervalo':
            return `
                <h4>Maior Intervalo</h4>
                <p><strong>O que significa:</strong> O maior "tempo de espera" observado entre duas aparições consecutivas da mesma combinação de dígitos foi de X concursos.</p>
                <p><strong>Interpretação:</strong> Alguma combinação específica apareceu em um concurso e só voltou a aparecer muitos concursos depois.</p>
                <p><strong>Relevância:</strong> Este valor extremo mostra como algumas combinações podem demorar muito para se repetir, destacando a variabilidade dos intervalos de repetição.</p>
            `;
        default:
            return `<p>Informações estatísticas sobre a frequência de aparição dos dígitos nos sorteios da Mega-Sena.</p>`;
    }
}

// Função para obter explicação geral das estatísticas
function obterExplicacaoGeral() {
    return `
        <h4>Estatísticas Gerais de Intervalos</h4>
        <p>Esta seção apresenta uma visão geral dos padrões de intervalo encontrados em todas as combinações de dígitos analisadas.</p>
        
        <p>A análise rastreia especificamente as "diferenças" ou "intervalos" entre aparições consecutivas das mesmas combinações de dígitos.</p>
        
        <p>As estatísticas mostram:</p>
        <ul>
            <li><strong>Média Geral:</strong> Quantos concursos, em média, entre repetições</li>
            <li><strong>Total de Intervalos:</strong> Quantas observações foram analisadas</li>
            <li><strong>Maior Frequência:</strong> Quantas vezes apareceu a combinação mais frequente</li>
            <li><strong>Maior Intervalo:</strong> Maior número de concursos entre repetições</li>
        </ul>
    `;
}

// Adicionar função ao carregamento da página
document.addEventListener('DOMContentLoaded', function() {
    // Esperar um pouco para garantir que a análise de frequência já foi executada
    setTimeout(adicionarPopupExplicacao, 2000);
});