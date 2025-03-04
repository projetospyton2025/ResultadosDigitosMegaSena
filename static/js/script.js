document.addEventListener('DOMContentLoaded', function() {
    const loadButton = document.getElementById('loadButton');
    const downloadCSVButton = document.getElementById('downloadCSV');
    const downloadJSONButton = document.getElementById('downloadJSON');
    const downloadTXTButton = document.getElementById('downloadTXT');
    
    let allResults = [];
    let filteredResults = [];
    let digitStats = {};
    let combinationStats = {};
    
    // Registrar eventos de clique
    loadButton.addEventListener('click', fetchDigitosResults);
    downloadCSVButton.addEventListener('click', downloadCSV);
    downloadJSONButton.addEventListener('click', downloadJSON);
    downloadTXTButton.addEventListener('click', downloadTXT);
	
	
	// Chamar fetchDigitosResults automaticamente quando a página carregar
    fetchDigitosResults();
    
    // Função para buscar os resultados - com tratamento de erros melhorado
    async function fetchDigitosResults() {
		// No início da função fetchDigitosResults
		console.log("Função fetchDigitosResults iniciada");
        const loadingMessage = document.getElementById('loadingMessage');
        const completedMessage = document.getElementById('completedMessage');
        const tableBody = document.getElementById('megaSenaResults').getElementsByTagName('tbody')[0];
        const digitFrequencyDiv = document.getElementById('digitFrequency');
        const digitChartDiv = document.getElementById('digitChart');
        const combinationAnalysisDiv = document.getElementById('combinationAnalysis');
        const filterContainerDiv = document.getElementById('filterContainer');
        
        loadingMessage.style.display = 'block';
        completedMessage.style.display = 'none';
        tableBody.innerHTML = '';
        digitFrequencyDiv.innerHTML = '';
        digitChartDiv.innerHTML = '';
        combinationAnalysisDiv.innerHTML = '';
        filterContainerDiv.innerHTML = '';
        
        try {
            console.log("Iniciando fetch de dados...");
            const response = await fetch('/api/digitos');
            console.log("Status da resposta:", response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Erro na resposta:", errorText);
                throw new Error(`Erro ao acessar a API. Status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log("Dados recebidos:", data);
            
            if (data.resultados && Array.isArray(data.resultados)) {
                allResults = data.resultados;
                filteredResults = [...allResults]; // Inicialmente, todos os resultados
                digitStats = data.frequencia_digitos;
                
                // Analisar combinações de dígitos
                analisarCombinacoes(allResults);
                
                // Renderizar tudo
                renderFilterOptions();
                renderResults(filteredResults);
                renderDigitStats(digitStats);
                renderCombinationAnalysis();
            } else {
                console.error("Formato inválido:", data);
                throw new Error('Formato de dados inválido.');
            }
        } catch (error) {
            console.error("Erro detalhado:", error);
            alert('Erro ao buscar os resultados: ' + error.message);
        } finally {
            loadingMessage.style.display = 'none';
            completedMessage.style.display = 'block';
        }
    }
    
    // Função para analisar combinações de dígitos
    function analisarCombinacoes(results) {
        combinationStats = {
            porQuantidade: {}, // Agrupar por quantidade de dígitos
            combinacoesFrequentes: {}, // Combinações mais frequentes
            digitosExclusivos: {} // Dígitos que aparecem apenas em alguns sorteios
        };
        
        // Agrupar resultados por quantidade de dígitos
        results.forEach(result => {
            const qtd = result.contagem_digitos;
            if (!combinationStats.porQuantidade[qtd]) {
                combinationStats.porQuantidade[qtd] = [];
            }
            combinationStats.porQuantidade[qtd].push(result);
        });
        
        // Encontrar combinações frequentes
        results.forEach(result => {
            const combinacao = result.digitos_ordenados.join(',');
            if (!combinationStats.combinacoesFrequentes[combinacao]) {
                combinationStats.combinacoesFrequentes[combinacao] = {
                    combinacao: combinacao,
                    concursos: [],
                    digitos: result.digitos_ordenados,
                    quantidade: result.contagem_digitos
                };
            }
            combinationStats.combinacoesFrequentes[combinacao].concursos.push(result.concurso);
        });
        
        // Ordenar combinações por frequência
        combinationStats.combinacoesFrequentes = Object.values(combinationStats.combinacoesFrequentes)
            .sort((a, b) => b.concursos.length - a.concursos.length);
        
        // Analisar similaridades e diferenças entre combinações
        for (let i = 0; i < combinationStats.combinacoesFrequentes.length; i++) {
            const combo = combinationStats.combinacoesFrequentes[i];
            combo.similares = [];
            
            for (let j = 0; j < combinationStats.combinacoesFrequentes.length; j++) {
                if (i === j) continue;
                
                const outroCombo = combinationStats.combinacoesFrequentes[j];
                
                // Comparar os dígitos
                const digitosCombo = new Set(combo.digitos);
                const digitosOutroCombo = new Set(outroCombo.digitos);
                
                // Diferenças
                const digitosExclusivosCombo1 = [...digitosCombo].filter(d => !digitosOutroCombo.has(d));
                const digitosExclusivosCombo2 = [...digitosOutroCombo].filter(d => !digitosCombo.has(d));
                
                // Interseção
                const digitosComuns = [...digitosCombo].filter(d => digitosOutroCombo.has(d));
                
                // Se tem similaridade significativa (mais de 70% em comum)
                if (digitosComuns.length >= combo.digitos.length * 0.7) {
                    combo.similares.push({
                        concursos: outroCombo.concursos,
                        digitosComuns: digitosComuns,
                        digitosDiferentes: {
                            de: digitosExclusivosCombo1,
                            para: digitosExclusivosCombo2
                        }
                    });
                }
            }
            
            // Limitar a 5 combinações similares por combinação
            combo.similares = combo.similares.slice(0, 5);
        }
        
        // Limitar as combinações mais frequentes às top 10
        combinationStats.combinacoesFrequentes = combinationStats.combinacoesFrequentes.slice(0, 10);
    }
    
    // Função para renderizar opções de filtro
    function renderFilterOptions() {
        const filterContainerDiv = document.getElementById('filterContainer');
        
        // Clear filter container
        filterContainerDiv.innerHTML = '';
        
        // Criar o título
        const filterTitle = document.createElement('h3');
        filterTitle.textContent = 'Filtros';
        filterContainerDiv.appendChild(filterTitle);
        
        // Criar container de filtros
        const filtersDiv = document.createElement('div');
        filtersDiv.className = 'filters';
        
        // 1. Filtro por quantidade de dígitos
        const qtdDigitosDiv = document.createElement('div');
        qtdDigitosDiv.className = 'filter-item';
        
        const qtdDigitosLabel = document.createElement('label');
        qtdDigitosLabel.textContent = 'Qtd. Dígitos: ';
        
        const qtdDigitosSelect = document.createElement('select');
        qtdDigitosSelect.id = 'qtdDigitosFilter';
        
        // Opção "Todos"
        const optionTodos = document.createElement('option');
        optionTodos.value = '';
        optionTodos.textContent = 'Todos';
        qtdDigitosSelect.appendChild(optionTodos);
        
        // Quantidades disponíveis
        const quantidades = Object.keys(combinationStats.porQuantidade)
            .sort((a, b) => parseInt(a) - parseInt(b));
        
        quantidades.forEach(qtd => {
            const option = document.createElement('option');
            option.value = qtd;
            option.textContent = `${qtd} dígitos (${combinationStats.porQuantidade[qtd].length} resultados)`;
            qtdDigitosSelect.appendChild(option);
        });
        
        qtdDigitosDiv.appendChild(qtdDigitosLabel);
        qtdDigitosDiv.appendChild(qtdDigitosSelect);
        
        // 2. Filtro por dígito específico
        const digitoEspecificoDiv = document.createElement('div');
        digitoEspecificoDiv.className = 'filter-item';
        
        const digitoEspecificoLabel = document.createElement('label');
        digitoEspecificoLabel.textContent = 'Contém Dígito: ';
        
        const digitoEspecificoSelect = document.createElement('select');
        digitoEspecificoSelect.id = 'digitoEspecificoFilter';
        
        // Opção "Todos"
        const optionTodosDigitos = document.createElement('option');
        optionTodosDigitos.value = '';
        optionTodosDigitos.textContent = 'Todos';
        digitoEspecificoSelect.appendChild(optionTodosDigitos);
        
        // Listar todos os dígitos ordenados por frequência
        const digitosPorFrequencia = Object.entries(digitStats)
            .sort((a, b) => b[1] - a[1]);
        
        digitosPorFrequencia.forEach(([digito, frequencia]) => {
            const option = document.createElement('option');
            option.value = digito;
            option.textContent = `Dígito ${digito} (${frequencia} ocorrências)`;
            digitoEspecificoSelect.appendChild(option);
        });
        
        digitoEspecificoDiv.appendChild(digitoEspecificoLabel);
        digitoEspecificoDiv.appendChild(digitoEspecificoSelect);
        
        // 3. Botão de aplicar filtro
        const aplicarFiltroBtn = document.createElement('button');
        aplicarFiltroBtn.textContent = 'Aplicar Filtros';
        aplicarFiltroBtn.className = 'button';
        aplicarFiltroBtn.onclick = aplicarFiltros;
        
        // 4. Botão de limpar filtro
        const limparFiltroBtn = document.createElement('button');
        limparFiltroBtn.textContent = 'Limpar Filtros';
        limparFiltroBtn.className = 'button';
        limparFiltroBtn.onclick = limparFiltros;
        
        // Adicionar todos os elementos ao container
        filtersDiv.appendChild(qtdDigitosDiv);
        filtersDiv.appendChild(digitoEspecificoDiv);
        filtersDiv.appendChild(aplicarFiltroBtn);
        filtersDiv.appendChild(limparFiltroBtn);
        
        filterContainerDiv.appendChild(filtersDiv);
    }
    
    // Função para aplicar filtros
    function aplicarFiltros() {
        const qtdDigitosFilter = document.getElementById('qtdDigitosFilter').value;
        const digitoEspecificoFilter = document.getElementById('digitoEspecificoFilter').value;
        
        filteredResults = [...allResults]; // Reiniciar com todos os resultados
        
        // Aplicar filtro de quantidade de dígitos
        if (qtdDigitosFilter) {
            filteredResults = filteredResults.filter(
                result => result.contagem_digitos == parseInt(qtdDigitosFilter)
            );
        }
        
        // Aplicar filtro de dígito específico
        if (digitoEspecificoFilter) {
            filteredResults = filteredResults.filter(
                result => result.digitos_ordenados.includes(digitoEspecificoFilter)
            );
        }
        
        // Renderizar resultados filtrados
        renderResults(filteredResults);
        
        // Atualizar mensagem de resultados
        const resultadosInfo = document.getElementById('resultadosInfo');
        if (resultadosInfo) {
            resultadosInfo.textContent = `Exibindo ${filteredResults.length} de ${allResults.length} resultados`;
        }
    }
    
    // Função para limpar filtros
    function limparFiltros() {
        document.getElementById('qtdDigitosFilter').value = '';
        document.getElementById('digitoEspecificoFilter').value = '';
        
        filteredResults = [...allResults]; // Reiniciar com todos os resultados
        renderResults(filteredResults);
        
        // Atualizar mensagem de resultados
        const resultadosInfo = document.getElementById('resultadosInfo');
        if (resultadosInfo) {
            resultadosInfo.textContent = `Exibindo ${filteredResults.length} de ${allResults.length} resultados`;
        }
    }
    
    // Função para renderizar a análise de combinações
    function renderCombinationAnalysis() {
        const combinationAnalysisDiv = document.getElementById('combinationAnalysis');
        
        // Título da seção
        const title = document.createElement('h3');
        title.textContent = 'Análise de Combinações de Dígitos';
        combinationAnalysisDiv.appendChild(title);
        
        // 1. Combinações mais frequentes
        const combinacoesFrequentesTitle = document.createElement('h4');
        combinacoesFrequentesTitle.textContent = 'Combinações Mais Frequentes';
        combinationAnalysisDiv.appendChild(combinacoesFrequentesTitle);
        
        const combinacoesTable = document.createElement('table');
        combinacoesTable.className = 'combinations-table';
        
        // Cabeçalho da tabela
        const headerRow = document.createElement('tr');
        ['Combinação', 'Qtd. Dígitos', 'Frequência', 'Detalhes'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });
        combinacoesTable.appendChild(headerRow);
        
        // Dados da tabela
        combinationStats.combinacoesFrequentes.forEach(combo => {
            const row = document.createElement('tr');
            
            // Combinação
            const tdCombo = document.createElement('td');
            tdCombo.textContent = combo.digitos.join(',');
            row.appendChild(tdCombo);
            
            // Quantidade de dígitos
            const tdQtd = document.createElement('td');
            tdQtd.textContent = combo.quantidade;
            row.appendChild(tdQtd);
            
            // Frequência (número de concursos)
            const tdFreq = document.createElement('td');
            tdFreq.textContent = combo.concursos.length;
            row.appendChild(tdFreq);
            
            // Botão para ver detalhes
            const tdDetails = document.createElement('td');
            const detailsBtn = document.createElement('button');
            detailsBtn.textContent = 'Ver Detalhes';
            detailsBtn.className = 'details-button';
            detailsBtn.onclick = () => {
                mostrarDetalhesCombinacao(combo);
            };
            tdDetails.appendChild(detailsBtn);
            row.appendChild(tdDetails);
            
            combinacoesTable.appendChild(row);
        });
        
        combinationAnalysisDiv.appendChild(combinacoesTable);
        
        // 2. Resumo por quantidade de dígitos
        const resumoQtdTitle = document.createElement('h4');
        resumoQtdTitle.textContent = 'Resumo por Quantidade de Dígitos';
        combinationAnalysisDiv.appendChild(resumoQtdTitle);
        
        const resumoTable = document.createElement('table');
        resumoTable.className = 'summary-table';
        
        // Cabeçalho da tabela
        const resumoHeader = document.createElement('tr');
        ['Qtd. Dígitos', 'Número de Sorteios', 'Porcentagem'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            resumoHeader.appendChild(th);
        });
        resumoTable.appendChild(resumoHeader);
        
        // Dados da tabela
        const qtdKeys = Object.keys(combinationStats.porQuantidade)
            .sort((a, b) => parseInt(a) - parseInt(b));
        
        qtdKeys.forEach(qtd => {
            const row = document.createElement('tr');
            
            // Quantidade de dígitos
            const tdQtd = document.createElement('td');
            tdQtd.textContent = qtd;
            row.appendChild(tdQtd);
            
            // Número de sorteios
            const count = combinationStats.porQuantidade[qtd].length;
            const tdCount = document.createElement('td');
            tdCount.textContent = count;
            row.appendChild(tdCount);
            
            // Porcentagem
            const percentage = ((count / allResults.length) * 100).toFixed(2);
            const tdPercentage = document.createElement('td');
            tdPercentage.textContent = `${percentage}%`;
            row.appendChild(tdPercentage);
            
            resumoTable.appendChild(row);
        });
        
        combinationAnalysisDiv.appendChild(resumoTable);
    }
    
    // Função para mostrar detalhes de uma combinação
    function mostrarDetalhesCombinacao(combo) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Fechar modal
        const closeBtn = document.createElement('span');
        closeBtn.className = 'close-button';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => {
            document.body.removeChild(modal);
        };
        
        // Título
        const title = document.createElement('h3');
        title.textContent = `Detalhes da Combinação: ${combo.digitos.join(',')}`;
        
        // Informações básicas
        const infoDiv = document.createElement('div');
        infoDiv.className = 'combo-info';
        
        infoDiv.innerHTML = `
            <p><strong>Quantidade de dígitos:</strong> ${combo.quantidade}</p>
            <p><strong>Aparece em ${combo.concursos.length} concursos:</strong> ${combo.concursos.join(', ')}</p>
        `;
        
        // Combinações similares
        const similaresDiv = document.createElement('div');
        similaresDiv.className = 'similares-info';
        
        if (combo.similares && combo.similares.length > 0) {
            const similaresTitle = document.createElement('h4');
            similaresTitle.textContent = 'Combinações Similares';
            similaresDiv.appendChild(similaresTitle);
            
            const similaresTable = document.createElement('table');
            similaresTable.className = 'similares-table';
            
            // Cabeçalho
            const headerRow = document.createElement('tr');
            ['Dígitos Comuns', 'Dígitos Diferentes', 'Aparece em', 'Frequência'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                headerRow.appendChild(th);
            });
            similaresTable.appendChild(headerRow);
            
            // Dados de combinações similares
            combo.similares.forEach(similar => {
                const row = document.createElement('tr');
                
                // Dígitos comuns
                const tdComuns = document.createElement('td');
                tdComuns.textContent = similar.digitosComuns.join(',');
                row.appendChild(tdComuns);
                
                // Dígitos diferentes
                const tdDiferentes = document.createElement('td');
                tdDiferentes.innerHTML = `
                    <span class="diferencas">
                        <span class="de">${similar.digitosDiferentes.de.join(',') || '-'}</span> →
                        <span class="para">${similar.digitosDiferentes.para.join(',') || '-'}</span>
                    </span>
                `;
                row.appendChild(tdDiferentes);
                
                // Aparece em
                const tdConcursos = document.createElement('td');
                tdConcursos.textContent = similar.concursos.slice(0, 5).join(', ');
                if (similar.concursos.length > 5) {
                    tdConcursos.textContent += ` (+ ${similar.concursos.length - 5} outros)`;
                }
                row.appendChild(tdConcursos);
                
                // Frequência
                const tdFreq = document.createElement('td');
                tdFreq.textContent = similar.concursos.length;
                row.appendChild(tdFreq);
                
                similaresTable.appendChild(row);
            });
            
            similaresDiv.appendChild(similaresTable);
        } else {
            similaresDiv.innerHTML = '<p>Nenhuma combinação similar encontrada.</p>';
        }
        
        // Adicionar todos os elementos ao modal
        modalContent.appendChild(closeBtn);
        modalContent.appendChild(title);
        modalContent.appendChild(infoDiv);
        modalContent.appendChild(similaresDiv);
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Fechar o modal ao clicar fora dele
        window.onclick = (event) => {
            if (event.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }
    
    // Função para renderizar os resultados na tabela
    function renderResults(results) {
        const tableBody = document.getElementById('megaSenaResults').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
        
        // Atualizar informação sobre resultados filtrados
        const resultsInfoDiv = document.getElementById('resultadosInfo');
        if (!resultsInfoDiv) {
            const infoDiv = document.createElement('div');
            infoDiv.id = 'resultadosInfo';
            infoDiv.className = 'results-info';
            infoDiv.textContent = `Exibindo ${results.length} de ${allResults.length} resultados`;
            
            // Inserir antes da tabela
            const tableContainer = document.getElementById('megaSenaResults').parentNode;
            tableContainer.insertBefore(infoDiv, document.getElementById('megaSenaResults'));
        } else {
            resultsInfoDiv.textContent = `Exibindo ${results.length} de ${allResults.length} resultados`;
        }
        
        results.forEach(result => {
            const row = tableBody.insertRow();
            
            // Formatar data
            const dataParts = result.data ? result.data.split('/') : ['', '', ''];
            const dataFormatada = dataParts.length === 3 ? `${dataParts[0]}/${dataParts[1]}/${dataParts[2]}` : result.data;
            
            row.innerHTML = `
                <td>${result.concurso}</td>
                <td>${dataFormatada}</td>
                <td>${result.dezenas.join(' - ')}</td>
                <td>${result.digitos_para_exibicao || result.digitos.join(' ')}</td>
                <td>${result.digitos_ordenados.join(',')}</td>
                <td>${result.contagem_digitos}</td>
                <td>
                    <button class="copy-button" data-digits="${result.digitos_para_copia}">
                        Copiar
                    </button>
                </td>
            `;
        });
        
        // Adicionar event listeners para os botões de cópia
        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', function() {
                const digits = this.getAttribute('data-digits');
                navigator.clipboard.writeText(digits)
                    .then(() => {
                        // Feedback visual para o usuário
                        const originalText = this.textContent;
                        this.textContent = 'Copiado!';
                        setTimeout(() => {
                            this.textContent = originalText;
                        }, 1500);
                    })
                    .catch(err => {
                        console.error('Erro ao copiar: ', err);
                        alert('Erro ao copiar os dígitos.');
                    });
            });
        });
    }
    
    // Função para renderizar estatísticas dos dígitos
    function renderDigitStats(stats) {
        const digitFrequencyDiv = document.getElementById('digitFrequency');
        const digitChartDiv = document.getElementById('digitChart');
        
        digitFrequencyDiv.innerHTML = '';
        digitChartDiv.innerHTML = '';
        
        // Ordenar os dígitos por frequência (do maior para o menor)
        const sortedDigits = Object.entries(stats).sort((a, b) => b[1] - a[1]);
        
        // Criar visualização da frequência de dígitos - Ordenada por frequência
        sortedDigits.forEach(([digit, count]) => {
            const digitBox = document.createElement('div');
            digitBox.className = 'digit-box';
            digitBox.innerHTML = `${digit}<span class="digit-count">${count}</span>`;
            digitFrequencyDiv.appendChild(digitBox);
        });
        
        // Criar gráfico de barras para frequência de dígitos - Ordenado por frequência
        const maxCount = Math.max(...Object.values(stats));
        const chartHtml = sortedDigits.map(([digit, count]) => {
            const percentage = (count / maxCount) * 100;
            return `
                <div style="margin: 10px 0;">
                    <div style="display: flex; align-items: center;">
                        <div style="width: 20px; text-align: center;">${digit}</div>
                        <div style="flex-grow: 1; margin: 0 10px;">
                            <div style="background-color: #4CAF50; height: 20px; width: ${percentage}%;"></div>
                        </div>
                        <div style="width: 40px; text-align: right;">${count}</div>
                    </div>
                </div>
            `;
        }).join('');
        
        digitChartDiv.innerHTML = chartHtml;
    }
    
    // Funções para download
    function downloadCSV() {
        if (allResults.length === 0) {
            alert('Carregue os resultados primeiro!');
            return;
        }
        
        let csvContent = "Concurso,Data,Dezenas,Digitos,DigitosOrdenados,QuantidadeDigitos\n";
        
        filteredResults.forEach(result => {
            const digitos = result.digitos_para_exibicao || result.digitos.join(' ');
            const digitosOrdenados = result.digitos_ordenados.join(',');
            csvContent += `${result.concurso},"${result.data}","${result.dezenas.join('-')}","${digitos}","${digitosOrdenados}",${result.contagem_digitos}\n`;
        });
        
        downloadFile(csvContent, 'digitos_megasena.csv', 'text/csv');
    }
    
    function downloadJSON() {
        if (allResults.length === 0) {
            alert('Carregue os resultados primeiro!');
            return;
        }
        
        const jsonData = {
            resultados: filteredResults,
            estatisticas: digitStats,
            analise_combinacoes: combinationStats
        };
        
        const jsonContent = JSON.stringify(jsonData, null, 2);
        downloadFile(jsonContent, 'digitos_megasena.json', 'application/json');
    }
    
    function downloadTXT() {
        if (allResults.length === 0) {
            alert('Carregue os resultados primeiro!');
            return;
        }
        
        let txtContent = "Análise de Dígitos da Mega-Sena\n\n";
        
        // Adicionar estatísticas - ordenar por frequência para o arquivo TXT também
        txtContent += "ESTATÍSTICAS DE FREQUÊNCIA DOS DÍGITOS (ORDEM DECRESCENTE):\n";
        const sortedStats = Object.entries(digitStats).sort((a, b) => b[1] - a[1]);
        sortedStats.forEach(([digit, count]) => {
            txtContent += `Dígito ${digit}: ${count} ocorrências\n`;
        });
        
        // Adicionar resumo de combinações
        txtContent += "\n\nRESUMO POR QUANTIDADE DE DÍGITOS:\n";
        const qtdKeys = Object.keys(combinationStats.porQuantidade)
            .sort((a, b) => parseInt(a) - parseInt(b));
        
        qtdKeys.forEach(qtd => {
            const count = combinationStats.porQuantidade[qtd].length;
            const percentage = ((count / allResults.length) * 100).toFixed(2);
            txtContent += `${qtd} dígitos: ${count} sorteios (${percentage}%)\n`;
        });
        
        // Adicionar combinações mais frequentes
        txtContent += "\n\nCOMBINAÇÕES MAIS FREQUENTES:\n";
        combinationStats.combinacoesFrequentes.slice(0, 5).forEach((combo, index) => {
            txtContent += `${index + 1}. Combinação [${combo.digitos.join(',')}]: Aparece em ${combo.concursos.length} sorteios\n`;
        });
        
        txtContent += "\n\nRESULTADOS DETALHADOS:\n";
        filteredResults.forEach(result => {
            const digitos = result.digitos_para_exibicao || result.digitos.join(' ');
            const digitosOrdenados = result.digitos_ordenados.join(',');
            txtContent += `Concurso: ${result.concurso} | Data: ${result.data} | Dezenas: ${result.dezenas.join('-')} | `;
            txtContent += `Dígitos: ${digitos} | Ordenados: ${digitosOrdenados} | `;
            txtContent += `Quantidade: ${result.contagem_digitos}\n`;
        });
        
        downloadFile(txtContent, 'digitos_megasena.txt', 'text/plain');
    }
	
	// Função auxiliar para download de arquivos
	function downloadFile(content, fileName, type) {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    console.log("Download iniciado:", fileName);
	}
	
	});
	
	/**
 * Script para destacar apenas os valores máximos em cada estatística
 */



// Função para destacar o dígito com maior frequência
function highlightMaxDigit() {
    const digitBoxes = document.querySelectorAll('.digit-box');
    if (digitBoxes.length === 0) return;
    
    let maxValue = 0;
    let maxElement = null;
    
    // Encontrar o valor máximo
    digitBoxes.forEach(box => {
        const valueElem = box.querySelector('.digit-count');
        if (valueElem) {
            const value = parseInt(valueElem.textContent.replace(/\D/g, ''));
            if (!isNaN(value) && value > maxValue) {
                maxValue = value;
                maxElement = box;
            }
        }
    });
    
    // Aplicar destaque
    if (maxElement) {
        console.log("Destacando dígito com valor máximo:", maxValue);
        maxElement.style.backgroundColor = '#d9534f'; // Vermelho
        maxElement.style.transform = 'scale(1.1)';
        maxElement.style.boxShadow = '0 0 8px rgba(217, 83, 79, 0.7)';
        
        const valueElem = maxElement.querySelector('.digit-count');
        if (valueElem) {
            valueElem.style.fontWeight = 'bold';
            valueElem.style.fontSize = '110%';
            valueElem.style.color = '#fff';
        }
    }
}

// Função para destacar o valor máximo no gráfico de frequência
function highlightMaxInFrequencyChart() {
    const chartRows = document.querySelectorAll('#digitChart > div');
    if (chartRows.length === 0) return;
    
    let maxValue = 0;
    let maxRow = null;
    
    // Encontrar a linha com valor máximo
    chartRows.forEach(row => {
        const valueElem = row.querySelector('div > div:last-child');
        if (valueElem) {
            const value = parseInt(valueElem.textContent.replace(/\D/g, ''));
            if (!isNaN(value) && value > maxValue) {
                maxValue = value;
                maxRow = row;
            }
        }
    });
    
    // Aplicar destaque
    if (maxRow) {
        console.log("Destacando valor máximo no gráfico:", maxValue);
        
        // Destacar o valor
        const valueElem = maxRow.querySelector('div > div:last-child');
        if (valueElem) {
            valueElem.style.fontWeight = 'bold';
            valueElem.style.color = '#d9534f';
            valueElem.style.fontSize = '110%';
        }
        
        // Destacar a barra
        const barElem = maxRow.querySelector('div > div:nth-child(2) > div');
        if (barElem) {
            barElem.style.backgroundColor = '#d9534f';
            barElem.style.height = '24px'; // Ligeiramente maior
        }
        
        // Destacar o fundo da linha inteira
        maxRow.style.backgroundColor = 'rgba(217, 83, 79, 0.1)';
        maxRow.style.borderRadius = '4px';
        maxRow.style.padding = '2px 0';
    }
}

// Função para destacar o valor máximo em uma tabela
function highlightMaxInTable(tableSelector, columnIndex) {
    const table = document.querySelector(tableSelector);
    if (!table) {
        console.log(`Tabela não encontrada: ${tableSelector}`);
        return;
    }
    
    const rows = table.querySelectorAll('tbody tr');
    if (rows.length === 0) {
        console.log(`Nenhuma linha encontrada na tabela: ${tableSelector}`);
        return;
    }
    
    let maxValue = 0;
    let maxRow = null;
    
    // Encontrar a linha com valor máximo
    rows.forEach(row => {
        if (row.cells.length > columnIndex) {
            const cell = row.cells[columnIndex];
            const value = parseInt(cell.textContent.replace(/\D/g, ''));
            if (!isNaN(value) && value > maxValue) {
                maxValue = value;
                maxRow = row;
            }
        }
    });
    
    // Aplicar destaque
    if (maxRow) {
        console.log(`Destacando valor máximo (${maxValue}) na tabela ${tableSelector}`);
        
        // Destacar a linha inteira
        maxRow.style.backgroundColor = 'rgba(217, 83, 79, 0.15)';
        
        // Destacar a célula do valor
        const valueCell = maxRow.cells[columnIndex];
        if (valueCell) {
            valueCell.style.fontWeight = 'bold';
            valueCell.style.color = '#d9534f';
            valueCell.style.fontSize = '110%';
        }
    }
}

// Adicionar a função ao carregamento da página e ao clicar no botão de carregar
document.addEventListener('DOMContentLoaded', function() {
    // Executar após um pequeno atraso para garantir que os elementos estejam carregados
    setTimeout(highlightMaxValues, 500);
    
    // Adicionar ao botão de carregar
    const loadButton = document.getElementById('loadButton');
    if (loadButton) {
        const originalHandler = loadButton.onclick;
        loadButton.onclick = function(e) {
            if (typeof originalHandler === 'function') {
                originalHandler.call(this, e);
            }
            
            // Executar nosso código após um pequeno atraso para os dados serem processados
            setTimeout(highlightMaxValues, 1000);
        };
    }
});

// Adicionar CSS necessário para os destaques
function addHighlightStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Estilos para transição suave de destaques */
        .digit-box, .digit-count, #digitChart div, 
        .combinations-table tr, .summary-table tr, .similares-table tr,
        .combinations-table td, .summary-table td, .similares-table td {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
}

// Adicionar estilos
addHighlightStyles();