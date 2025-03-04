// Script para destacar valores máximos nas estatísticas
document.addEventListener('DOMContentLoaded', function() {
    console.log("Script de destaque de máximos inicializado");
    
    // Função para encontrar o valor máximo nas tabelas e destacá-lo
    function highlightMaxValuesAfterLoading() {
        console.log("Iniciando função de destaque de valores máximos");
        
        // ===== 1. Destacar frequência de dígitos =====
        try {
            // Encontrar todas as caixas de dígitos
            const digitBoxes = document.querySelectorAll('.digit-box');
            console.log(`Encontradas ${digitBoxes.length} caixas de dígitos`);
            
            if (digitBoxes.length > 0) {
                // Encontrar o maior valor
                let maxValue = 0;
                let maxBox = null;
                
                digitBoxes.forEach(box => {
                    const countSpan = box.querySelector('.digit-count');
                    if (countSpan) {
                        const value = parseInt(countSpan.textContent);
                        if (!isNaN(value) && value > maxValue) {
                            maxValue = value;
                            maxBox = box;
                        }
                    }
                });
                
                // Aplicar destaque
                if (maxBox) {
                    console.log(`Valor máximo encontrado: ${maxValue}`);
                    maxBox.style.backgroundColor = '#d9534f';
                    maxBox.style.transform = 'scale(1.1)';
                    maxBox.style.boxShadow = '0 0 8px rgba(217, 83, 79, 0.7)';
                    
                    const countSpan = maxBox.querySelector('.digit-count');
                    if (countSpan) {
                        countSpan.style.fontWeight = 'bold';
                        countSpan.style.color = '#fff';
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao destacar frequência de dígitos:", error);
        }
        
        // ===== 2. Destacar gráfico de frequência =====
        try {
            const chartRows = document.querySelectorAll('#digitChart > div');
            console.log(`Encontradas ${chartRows.length} linhas no gráfico`);
            
            if (chartRows.length > 0) {
                let maxValue = 0;
                let maxRow = null;
                
                chartRows.forEach(row => {
                    const valueDiv = row.querySelector('div > div:last-child');
                    if (valueDiv) {
                        const value = parseInt(valueDiv.textContent);
                        if (!isNaN(value) && value > maxValue) {
                            maxValue = value;
                            maxRow = row;
                        }
                    }
                });
                
                if (maxRow) {
                    console.log(`Valor máximo no gráfico: ${maxValue}`);
                    maxRow.style.backgroundColor = 'rgba(217, 83, 79, 0.15)';
                    
                    // Destacar a barra
                    const bar = maxRow.querySelector('div > div > div');
                    if (bar) {
                        bar.style.backgroundColor = '#d9534f';
                    }
                    
                    // Destacar o valor
                    const valueDiv = maxRow.querySelector('div > div:last-child');
                    if (valueDiv) {
                        valueDiv.style.color = '#d9534f';
                        valueDiv.style.fontWeight = 'bold';
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao destacar gráfico de frequência:", error);
        }
        
        // ===== 3. Destacar tabelas =====
        try {
            // Combinações mais frequentes - coluna de frequência é a 3ª (índice 2)
            highlightMaxValueInTable('table.combinations-table', 2);
            
            // Resumo por quantidade de dígitos - coluna de número de sorteios é a 2ª (índice 1)
            highlightMaxValueInTable('table.summary-table', 1);
            
            // Modal de combinações similares - coluna de frequência é a 4ª (índice 3)
            const modalTable = document.querySelector('.similares-table');
            if (modalTable) {
                highlightMaxValueInTable('.similares-table', 3);
            }
        } catch (error) {
            console.error("Erro ao destacar tabelas:", error);
        }
    }
    
    // Função auxiliar para destacar o valor máximo em uma tabela
    function highlightMaxValueInTable(selector, columnIndex) {
        const table = document.querySelector(selector);
        if (!table) {
            console.log(`Tabela não encontrada: ${selector}`);
            return;
        }
        
        const rows = table.querySelectorAll('tbody tr');
        if (rows.length === 0) {
            console.log(`Nenhuma linha encontrada na tabela ${selector}`);
            return;
        }
        
        console.log(`Analisando ${rows.length} linhas na tabela ${selector}`);
        
        let maxValue = 0;
        let maxRow = null;
        
        rows.forEach(row => {
            if (row.cells.length <= columnIndex) return;
            
            const cell = row.cells[columnIndex];
            const value = parseInt(cell.textContent.replace(/\D/g, ''));
            
            if (!isNaN(value) && value > maxValue) {
                maxValue = value;
                maxRow = row;
            }
        });
        
        if (maxRow) {
            console.log(`Valor máximo na tabela ${selector}: ${maxValue}`);
            
            // Destacar a linha inteira
            maxRow.style.backgroundColor = 'rgba(217, 83, 79, 0.15)';
            
            // Destacar a célula específica
            const cell = maxRow.cells[columnIndex];
            cell.style.fontWeight = 'bold';
            cell.style.color = '#d9534f';
            cell.style.fontSize = '110%';
        }
    }
    
    // Configurar o evento do botão de carregamento
    function setupHighlightEvents() {
        const loadButton = document.getElementById('loadButton');
        if (loadButton) {
            console.log("Botão de carregamento encontrado");
            
            // Adicionar o novo handler com nosso código
            loadButton.addEventListener('click', function() {
                console.log("Botão de carregar clicado, agendando destaque");
                // Aguardar o carregamento dos dados (2 segundos deve ser suficiente)
                setTimeout(highlightMaxValuesAfterLoading, 2000);
            });
            
            // Verificar se já existem dados carregados
            setTimeout(highlightMaxValuesAfterLoading, 1000);
        } else {
            console.warn("Botão de carregamento não encontrado!");
            // Tentar novamente em 1 segundo
            setTimeout(setupHighlightEvents, 1000);
        }
    }
    
    // Iniciar a configuração
    setupHighlightEvents();
    
    // Adicionar CSS necessário
    const style = document.createElement('style');
    style.textContent = `
        /* Estilo para elementos destacados */
        .highlighted-max {
            transition: all 0.3s ease;
        }
    `;
    document.head.appendChild(style);
});