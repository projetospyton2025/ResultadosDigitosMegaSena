/**
 * Script para tornar as tabelas responsivas
 * Adicione este arquivo como tabelas-responsivas.js ou incorpore no seu script.js existente
 */

// Executar quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Script de tabelas responsivas carregado');
    
    // Aguardar um momento para garantir que as tabelas foram renderizadas
    setTimeout(function() {
        tornarTabelasResponsivas();
    }, 1000);
    
    // Adicionar um observador para quando os dados forem carregados
    const verificarCarregamento = setInterval(function() {
        const mensagemCompletada = document.getElementById('completedMessage');
        if (mensagemCompletada && getComputedStyle(mensagemCompletada).display !== 'none') {
            console.log('Carregamento detectado, aplicando responsividade às tabelas');
            setTimeout(function() {
                tornarTabelasResponsivas();
            }, 500);
            clearInterval(verificarCarregamento);
        }
    }, 1000);
    
    // Limitar a verificação a 30 segundos
    setTimeout(function() {
        clearInterval(verificarCarregamento);
    }, 30000);
    
    // Se existir um botão de carregar, adicionar um listener para tornar as tabelas responsivas após o carregamento
    const loadButton = document.getElementById('loadButton');
    if (loadButton) {
        loadButton.addEventListener('click', function() {
            console.log('Botão de carregar clicado, aguardando para tornar tabelas responsivas');
            setTimeout(function() {
                tornarTabelasResponsivas();
            }, 2000);
        });
    }
    
    // Se existir um botão de análise de frequências, adicionar um listener
    document.addEventListener('click', function(event) {
        if (event.target && (event.target.id === 'botaoAnalisarFrequencias' || event.target.id === 'botaoManual')) {
            console.log('Botão de análise clicado, aguardando para tornar tabelas responsivas');
            setTimeout(function() {
                tornarTabelasResponsivas();
            }, 1000);
        }
    });
});

// Função principal para tornar as tabelas responsivas
function tornarTabelasResponsivas() {
    console.log('Aplicando responsividade às tabelas');
    
    // Lista de seletores de tabelas para tornar responsivas
    const seletoresTabelas = [
        '#megaSenaResults',
        '.combinations-table',
        '.summary-table',
        '.frequency-table',
        '.similares-table',
        '.interval-table'
    ];
    
    // Processar cada seletor
    seletoresTabelas.forEach(function(seletor) {
        const tabelas = document.querySelectorAll(seletor);
        
        tabelas.forEach(function(tabela) {
            // Verificar se a tabela já está em um container responsivo
            if (!tabela.parentElement.classList.contains('table-responsive')) {
                console.log('Tornando responsiva a tabela:', seletor);
                
                // Criar um container responsivo
                const container = document.createElement('div');
                container.className = 'table-responsive';
                
                // Substituir a tabela pelo container contendo a tabela
                tabela.parentNode.insertBefore(container, tabela);
                container.appendChild(tabela);
                
                // Adicionar indicadores de rolagem
                adicionarIndicadoresRolagem(container);
            }
        });
    });
    
    console.log('Todas as tabelas foram processadas');
}

// Função para adicionar indicadores visuais de rolagem horizontal
function adicionarIndicadoresRolagem(container) {
    // Verificar se o conteúdo é maior que o container
    const verificarRolagem = function() {
        if (container.scrollWidth > container.clientWidth) {
            container.classList.add('has-scroll');
            
            // Adicionar classe quando rolar horizontalmente
            container.addEventListener('scroll', function() {
                if (container.scrollLeft > 0) {
                    container.classList.add('is-scrolling');
                } else {
                    container.classList.remove('is-scrolling');
                }
                
                // Adicionar classe quando chegar ao final da rolagem
                if (Math.ceil(container.scrollLeft + container.clientWidth) >= container.scrollWidth) {
                    container.classList.add('scroll-end');
                } else {
                    container.classList.remove('scroll-end');
                }
            });
        } else {
            container.classList.remove('has-scroll');
        }
    };
    
    // Verificar inicialmente
    verificarRolagem();
    
    // Verificar novamente quando a janela for redimensionada
    window.addEventListener('resize', verificarRolagem);
}

// Adicionar eventos para reajustar as tabelas quando necessário
window.addEventListener('resize', function() {
    // Atualizar indicadores de rolagem para todas as tabelas responsivas
    document.querySelectorAll('.table-responsive').forEach(function(container) {
        if (container.scrollWidth > container.clientWidth) {
            container.classList.add('has-scroll');
        } else {
            container.classList.remove('has-scroll');
        }
    });
});