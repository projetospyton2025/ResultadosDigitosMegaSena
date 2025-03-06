/**
 * Script para gerar resumo estratégico com base nas análises de frequência
 */

// Função para gerar o resumo estratégico
function gerarResumoEstrategico(dadosAnalise) {
    console.log("Gerando resumo estratégico com base nos dados analisados");
    
    // Verificar se existem dados para análise
    if (!dadosAnalise || !dadosAnalise.combinacoes || dadosAnalise.combinacoes.length === 0) {
        console.error("Dados insuficientes para gerar resumo estratégico");
        return;
    }
    
    // Obter a combinação mais frequente
    const combinacaoMaisFrequente = dadosAnalise.combinacoes[0];
    
    // Verificar se já existe a seção de resumo
    let secaoResumo = document.getElementById('resumo-estrategico');
    
    // Se não existir, criar uma nova seção
    if (!secaoResumo) {
        secaoResumo = document.createElement('div');
        secaoResumo.id = 'resumo-estrategico';
        secaoResumo.className = 'resumo-container';
        
        // Inserir após a seção de análise de frequência
        const secaoAnaliseFrequencia = document.querySelector('.frequency-analysis-section');
        if (secaoAnaliseFrequencia) {
            secaoAnaliseFrequencia.parentNode.insertBefore(secaoResumo, secaoAnaliseFrequencia.nextSibling);
        } else {
            // Alternativa: inserir antes da tabela de resultados
            const tabelaResultados = document.getElementById('megaSenaResults');
            if (tabelaResultados) {
                tabelaResultados.parentNode.insertBefore(secaoResumo, tabelaResultados);
            } else {
                // Última opção: adicionar ao final do container
                const container = document.querySelector('.container');
                if (container) {
                    container.appendChild(secaoResumo);
                } else {
                    console.error("Não foi possível encontrar um local para inserir o resumo estratégico");
                    return;
                }
            }
        }
    }
    
    // Limpar o conteúdo atual da seção
    secaoResumo.innerHTML = '';
    
    // Construir o conteúdo do resumo
    secaoResumo.innerHTML = `
        <h2 style="color: rebeccapurple;">RESUMO GERAL</h2>
        <p>A análise dos dados mostra que a combinação <strong>${combinacaoMaisFrequente.digitos.join(',')}</strong> apareceu <strong>${combinacaoMaisFrequente.frequencia} vezes</strong> nos concursos da Mega-Sena, com um intervalo médio de <strong>${combinacaoMaisFrequente.mediaIntervalos} concursos</strong> entre suas aparições. A menor sequência entre ocorrências foi de apenas <strong>${combinacaoMaisFrequente.menorIntervalo} concurso${combinacaoMaisFrequente.menorIntervalo !== 1 ? 's' : ''}</strong>, e a maior chegou a <strong>${combinacaoMaisFrequente.maiorIntervalo} concursos</strong>.</p>
        
        <h2 style="color: red;">Estratégia de Aposta Recomendada:</h2>
        
        <ul>
            <li>
                <strong>Acompanhar o Intervalo Médio</strong>
                <p>Como a média entre aparições é de <strong>${combinacaoMaisFrequente.mediaIntervalos} concursos</strong>, um bom momento para apostar nessa sequência seria quando ela já estiver sem sair por algo próximo a esse número de concursos.</p>
            </li>
            <li>
                <strong>Monitorar o Último Intervalo</strong>
                <p>O último intervalo registrado foi de <strong>${combinacaoMaisFrequente.ultimoIntervalo} concursos</strong>, o que ${interpretarUltimoIntervalo(combinacaoMaisFrequente)}.</p>
            </li>
            <li>
                <strong>Variar os Números Dentro da Combinação</strong>
                <p>Algumas combinações semelhantes (ex.: ${sugerirVariacoes(combinacaoMaisFrequente, dadosAnalise.combinacoes)}) também aparecem frequentemente. Fazer apostas variando um ou dois números pode aumentar as chances.</p>
            </li>
            <li>
                <strong>Apostas com Maior Frequência Quando o Intervalo Estiver Próximo da Média</strong>
                <p>Se o intervalo entre as aparições da sequência atingir <strong>${Math.max(1, combinacaoMaisFrequente.mediaIntervalos - 5)} a ${combinacaoMaisFrequente.mediaIntervalos + 5} concursos</strong>, pode ser um bom indicativo de que ela tem uma boa chance de sair.</p>
            </li>
            <li>
                <strong>Evitar Apostar Quando a Sequência Saiu Recentemente</strong>
                <p>Se essa sequência apareceu nos últimos <strong>5 a 10 concursos</strong>, a chance de repetição imediata pode ser menor.</p>
            </li>
        </ul>
        
        <h2>Conclusão:</h2>
        
        <p>Se a sequência <strong>${combinacaoMaisFrequente.digitos.join(',')}</strong> estiver sem aparecer por <strong>${combinacaoMaisFrequente.mediaIntervalos} concursos ou mais</strong>, pode valer a pena apostar nela ou em variações próximas. ${concluirEstrategia(combinacaoMaisFrequente)}</p>
        
        <p>Esta análise é baseada em padrões históricos e não garante resultados futuros. A Mega-Sena é um jogo de sorte com resultados aleatórios.</p>
    `;
    
    // Adicionar estilos CSS
    aplicarEstilosResumo();
}

// Função para interpretar o último intervalo
function interpretarUltimoIntervalo(combinacao) {
    const { ultimoIntervalo, mediaIntervalos } = combinacao;
    
    if (ultimoIntervalo < 5) {
        return "indica que a combinação saiu recentemente e pode levar algum tempo até aparecer novamente";
    } else if (ultimoIntervalo < mediaIntervalos * 0.5) {
        return "está ainda abaixo da média, sugerindo que pode ser melhor aguardar mais alguns concursos";
    } else if (ultimoIntervalo >= mediaIntervalos * 0.8 && ultimoIntervalo <= mediaIntervalos * 1.2) {
        return "está próximo da média histórica, o que pode indicar um bom momento para considerar essa combinação";
    } else if (ultimoIntervalo > mediaIntervalos * 1.2) {
        return "já ultrapassou a média histórica, podendo indicar maior probabilidade de aparição nos próximos concursos";
    } else {
        return "deve ser monitorado nas próximas semanas";
    }
}

// Função para sugerir variações da combinação principal
function sugerirVariacoes(combinacaoPrincipal, todasCombinacoes) {
    // Encontrar combinações similares (que diferem em apenas 1 ou 2 dígitos)
    const similares = todasCombinacoes.filter(combo => {
        if (combo === combinacaoPrincipal) return false;
        
        // Contar diferenças
        const digitosPrincipal = new Set(combinacaoPrincipal.digitos);
        const digitosCombo = new Set(combo.digitos);
        
        // Diferenças
        const digitosExclusivos1 = combinacaoPrincipal.digitos.filter(d => !digitosCombo.has(d));
        const digitosExclusivos2 = combo.digitos.filter(d => !digitosPrincipal.has(d));
        
        // Aceitar se a diferença for de 1 ou 2 dígitos
        return (digitosExclusivos1.length + digitosExclusivos2.length) <= 2;
    });
    
    // Selecionar até 3 variações para sugerir
    const variacoesSelecionadas = similares.slice(0, 3);
    
    if (variacoesSelecionadas.length === 0) {
        return "trocando um ou dois dígitos por outros valores";
    }
    
    // Formatar a sugestão
    let sugestoes = [];
    
    variacoesSelecionadas.forEach(combo => {
        // Identificar dígitos diferentes
        const digitosPrincipal = new Set(combinacaoPrincipal.digitos);
        const digitosCombo = new Set(combo.digitos);
        
        const digitosExclusivos1 = combinacaoPrincipal.digitos.filter(d => !digitosCombo.has(d));
        const digitosExclusivos2 = combo.digitos.filter(d => !digitosPrincipal.has(d));
        
        sugestoes.push(`trocando <strong>${digitosExclusivos1.join(',')}</strong> por <strong>${digitosExclusivos2.join(',')}</strong>`);
    });
    
    return sugestoes.join(', ') + " etc.";
}

// Função para gerar a conclusão estratégica
function concluirEstrategia(combinacao) {
    const { ultimoIntervalo, mediaIntervalos } = combinacao;
    
    if (ultimoIntervalo < mediaIntervalos * 0.5) {
        return "Caso tenha saído recentemente, melhor esperar mais alguns concursos antes de apostar nessa combinação novamente.";
    } else if (ultimoIntervalo >= mediaIntervalos * 0.8 && ultimoIntervalo <= mediaIntervalos * 1.2) {
        return "O momento atual parece favorável para considerar essa combinação, já que o intervalo está próximo da média histórica.";
    } else if (ultimoIntervalo > mediaIntervalos) {
        return "Com o intervalo atual já acima da média, pode ser um bom momento para considerar essa combinação nas próximas apostas.";
    } else {
        return "Acompanhe o padrão de intervalos para identificar o melhor momento para apostar.";
    }
}

// Função para aplicar estilos CSS ao resumo
function aplicarEstilosResumo() {
    // Verificar se os estilos já foram adicionados
    if (document.getElementById('resumo-estrategico-styles')) return;
    
    // Criar elemento de estilo
    const styleElement = document.createElement('style');
    styleElement.id = 'resumo-estrategico-styles';
    
    // Definir estilos CSS
    styleElement.textContent = `
        .resumo-container {
            margin: 30px 0;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 8px;
            border: 2px solid #673AB7;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .resumo-container h2 {
            margin-top: 20px;
            margin-bottom: 15px;
            font-size: 1.5em;
        }
        
        .resumo-container p {
            line-height: 1.6;
            margin-bottom: 15px;
        }
        
        .resumo-container ul {
            padding-left: 20px;
        }
        
        .resumo-container li {
            margin-bottom: 15px;
        }
        
        .resumo-container li strong {
            color: #673AB7;
        }
        
        .resumo-container li p {
            margin-top: 5px;
        }
    `;
    
    // Adicionar ao head do documento
    document.head.appendChild(styleElement);
}

// Função para inicializar a geração do resumo
function inicializarResumoEstrategico() {
    console.log("Inicializando módulo de resumo estratégico");
    
    // Verificar se os dados de análise estão disponíveis
    const verificarDados = setInterval(() => {
        if (window.dadosAnalise && window.dadosAnalise.combinacoes && window.dadosAnalise.combinacoes.length > 0) {
            console.log("Dados de análise detectados, gerando resumo estratégico");
            clearInterval(verificarDados);
            gerarResumoEstrategico(window.dadosAnalise);
        }
    }, 1000);
    
    // Limitar o tempo de verificação para evitar loop infinito
    setTimeout(() => clearInterval(verificarDados), 30000);
    
    // Substituir a função original de renderização para incluir a geração do resumo
    if (typeof window.renderizarResumoAnalise === 'function') {
        const originalRenderizarResumo = window.renderizarResumoAnalise;
        
        window.renderizarResumoAnalise = function() {
            // Chamar a função original
            originalRenderizarResumo.apply(this, arguments);
            
            // Gerar o resumo estratégico
            console.log("Renderização de resumo de análise detectada, gerando resumo estratégico");
            if (window.dadosAnalise) {
                gerarResumoEstrategico(window.dadosAnalise);
            }
        };
    }
}

// Expor a função de geração de resumo globalmente
window.gerarResumoEstrategico = gerarResumoEstrategico;

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM carregado, configurando geração de resumo estratégico");
    inicializarResumoEstrategico();
});