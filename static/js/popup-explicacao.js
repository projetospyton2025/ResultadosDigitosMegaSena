// Variável global para controlar a visibilidade dos ícones
let iconesMostrados = false;
let botoesInfo = [];

// Função para adicionar/remover botões de informação
function alternarBotoesInformacao() {
    console.log("Alternando botões de informação...");
    
    if (iconesMostrados) {
        // Esconder/remover os ícones
        botoesInfo.forEach(botao => {
            botao.style.display = 'none';
        });
        
        document.querySelectorAll('.explicacao-popup').forEach(popup => {
            popup.style.display = 'none';
        });
        
        iconesMostrados = false;
        
        // Atualizar texto do botão
        const botaoExplicacao = document.getElementById('botao-explicacao');
        if (botaoExplicacao) {
            botaoExplicacao.textContent = 'Mostrar Explicações';
        }
        
        console.log("Ícones de informação ocultados");
    } else {
        // Limpar qualquer botão existente
        botoesInfo.forEach(botao => {
            botao.style.display = 'inline-block';
        });
        
        // Se ainda não tiver criado, criar os botões
        if (botoesInfo.length === 0) {
            // Adicionar botão na seção de estatísticas gerais
            const estatisticasTitle = document.querySelector('.estatisticas-gerais h3');
            if (estatisticasTitle) {
                const botao = adicionarBotaoInfo(estatisticasTitle, getExplicacaoGeral());
                botoesInfo.push(botao);
            }
            
            // Adicionar botões em cada caixa de estatística
            const statBoxes = document.querySelectorAll('.stat-box');
            statBoxes.forEach(box => {
                const titulo = box.querySelector('.stat-title');
                if (titulo) {
                    const textoTitulo = titulo.textContent.trim();
                    const botao = adicionarBotaoInfo(titulo, getExplicacaoPara(textoTitulo));
                    botoesInfo.push(botao);
                }
            });
        }
        
        iconesMostrados = true;
        
        // Atualizar texto do botão
        const botaoExplicacao = document.getElementById('botao-explicacao');
        if (botaoExplicacao) {
            botaoExplicacao.textContent = 'Ocultar Explicações';
        }
        
        console.log("Ícones de informação mostrados");
    }
}

// Função para adicionar botão de informação a um elemento
function adicionarBotaoInfo(elemento, textoExplicacao) {
    // Verificar se já existe um botão
    let botaoInfo = elemento.querySelector('.info-icon');
    
    if (!botaoInfo) {
        botaoInfo = document.createElement('span');
        botaoInfo.className = 'info-icon';
        botaoInfo.innerHTML = 'i';
        elemento.appendChild(botaoInfo);
        
        // Criar popup
        const popup = document.createElement('div');
        popup.className = 'explicacao-popup';
        popup.innerHTML = textoExplicacao;
        document.body.appendChild(popup);
        
        // Adicionar eventos
        botaoInfo.addEventListener('click', function(e) {
            e.stopPropagation();
            console.log("Ícone de informação clicado!");
            
            // Fechar todos os outros popups
            document.querySelectorAll('.explicacao-popup').forEach(p => {
                if (p !== popup) {
                    p.style.display = 'none';
                }
            });
            
            // Alternar visibilidade deste popup
            if (popup.style.display === 'block') {
                popup.style.display = 'none';
            } else {
                // Posicionar e mostrar este popup
                const rect = botaoInfo.getBoundingClientRect();
                popup.style.left = (rect.left - 200 + rect.width/2) + 'px'; // Centralizar
                popup.style.top = (rect.bottom + 10) + 'px';
                popup.style.display = 'block';
                
                console.log("Popup exibido em:", popup.style.left, popup.style.top);
            }
        });
        
        // Fechar ao clicar fora
        document.addEventListener('click', function(e) {
            if (e.target !== botaoInfo && !popup.contains(e.target)) {
                popup.style.display = 'none';
            }
        });
    }
    
    return botaoInfo;
}

// Textos de explicação (mantidos os mesmos)
function getExplicacaoGeral() {
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

function getExplicacaoPara(titulo) {
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

// Adicionar botão explícito para ativar as explicações
function adicionarBotaoExplicacao() {
    const estatisticasGerais = document.querySelector('.estatisticas-gerais');
    if (estatisticasGerais) {
        // Verificar se o botão já existe
        let botaoExplicacao = document.getElementById('botao-explicacao');
        
        if (!botaoExplicacao) {
            botaoExplicacao = document.createElement('button');
            botaoExplicacao.id = 'botao-explicacao';
            botaoExplicacao.textContent = 'Mostrar Explicações';
            botaoExplicacao.className = 'button';
            botaoExplicacao.style.marginTop = '10px';
            botaoExplicacao.style.marginBottom = '10px';
            botaoExplicacao.style.display = 'block';
            
            botaoExplicacao.addEventListener('click', function() {
                console.log("Botão de explicações clicado");
                alternarBotoesInformacao();
            });
            
            estatisticasGerais.appendChild(botaoExplicacao);
        }
    }
}

// Função principal que será executada quando a página carregar
function inicializarPopups() {
    console.log("Inicializando sistema de explicações...");
    
    // Adicionar estilo ao documento
    const style = document.createElement('style');
    style.textContent = `
        .info-icon {
            display: inline-block;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background-color: #4CAF50;
            color: white;
            text-align: center;
            line-height: 18px;
            font-size: 12px;
            font-weight: bold;
            margin-left: 5px;
            cursor: pointer;
            position: relative;
            z-index: 10;
        }
        
        .explicacao-popup {
            display: none;
            position: fixed;
            background-color: white;
            border: 1px solid #ddd;
            border-radius: 5px;
            padding: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 400px;
            min-width: 300px;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .explicacao-popup h4 {
            margin-top: 0;
            color: #4CAF50;
        }
        
        .explicacao-popup ul {
            padding-left: 20px;
        }
        
        .explicacao-popup p {
            margin: 10px 0;
        }
    `;
    document.head.appendChild(style);
    
    // Verificar periodicamente se a seção de estatísticas já foi carregada
    const checkExist = setInterval(function() {
        const estatisticasGerais = document.querySelector('.estatisticas-gerais');
        if (estatisticasGerais) {
            console.log("Seção de estatísticas encontrada!");
            clearInterval(checkExist);
            adicionarBotaoExplicacao();
        }
    }, 1000); // Verificar a cada segundo
}

// Iniciar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', inicializarPopups);