document.addEventListener('DOMContentLoaded', function() {
    const loadButton = document.getElementById('loadButton');
    const downloadCSVButton = document.getElementById('downloadCSV');
    const downloadJSONButton = document.getElementById('downloadJSON');
    const downloadTXTButton = document.getElementById('downloadTXT');
    
    let allResults = [];
    let digitStats = {};
    
    // Registrar eventos de clique
    loadButton.addEventListener('click', fetchDigitosResults);
    downloadCSVButton.addEventListener('click', downloadCSV);
    downloadJSONButton.addEventListener('click', downloadJSON);
    downloadTXTButton.addEventListener('click', downloadTXT);
    
    // Função para buscar os resultados - com tratamento de erros melhorado
    async function fetchDigitosResults() {
        const loadingMessage = document.getElementById('loadingMessage');
        const completedMessage = document.getElementById('completedMessage');
        const tableBody = document.getElementById('megaSenaResults').getElementsByTagName('tbody')[0];
        const digitFrequencyDiv = document.getElementById('digitFrequency');
        const digitChartDiv = document.getElementById('digitChart');
        
        loadingMessage.style.display = 'block';
        completedMessage.style.display = 'none';
        tableBody.innerHTML = '';
        digitFrequencyDiv.innerHTML = '';
        digitChartDiv.innerHTML = '';
        
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
                digitStats = data.frequencia_digitos;
                
                renderResults(allResults);
                renderDigitStats(digitStats);
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
    
    // Função para renderizar os resultados na tabela
    function renderResults(results) {
        const tableBody = document.getElementById('megaSenaResults').getElementsByTagName('tbody')[0];
        tableBody.innerHTML = '';
        
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
        
        allResults.forEach(result => {
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
            resultados: allResults,
            estatisticas: digitStats
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
        
        txtContent += "\n\nRESULTADOS DETALHADOS:\n";
        allResults.forEach(result => {
            const digitos = result.digitos_para_exibicao || result.digitos.join(' ');
            const digitosOrdenados = result.digitos_ordenados.join(',');
            txtContent += `Concurso: ${result.concurso} | Data: ${result.data} | Dezenas: ${result.dezenas.join('-')} | `;
            txtContent += `Dígitos: ${digitos} | Ordenados: ${digitosOrdenados} | `;
            txtContent += `Quantidade: ${result.contagem_digitos}\n`;
        });
        
        downloadFile(txtContent, 'digitos_megasena.txt', 'text/plain');
    }
    
    function downloadFile(content, fileName, type) {
        const blob = new Blob([content], { type });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
    }
});