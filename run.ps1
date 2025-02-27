# Script para atualizar a aplicação ResultadosDigitosMegaSena
# Este script corrige problemas de codificação e funcionalidade

# Definir o caminho da aplicação
$projetoPath = "J:\Meu Drive\ProjetosPython\Loterias\Loterias-ResultadosDigitos\ResultadosDigitosMegaSena"

# Verificar se o diretório existe
if (-not (Test-Path $projetoPath)) {
    Write-Host "Diretório do projeto não encontrado em $projetoPath" -ForegroundColor Red
    Write-Host "Por favor, execute o script resultadosdigitosmegasena.ps1 primeiro para criar a estrutura do projeto." -ForegroundColor Yellow
    exit 1
}

# Verificar caminho absoluto do C: para J:
if (-not (Test-Path "J:\")) {
    Write-Host "Diretório J:\ não encontrado. Você precisa mapear ou criar esta unidade." -ForegroundColor Red
    Write-Host "Alternativamente, você pode modificar o script para usar outro caminho." -ForegroundColor Yellow
    
    # Perguntar se deseja alterar o caminho
    $resposta = Read-Host "Deseja instalar o projeto em C:\ResultadosDigitosMegaSena em vez disso? (S/N)"
    if ($resposta -eq "S" -or $resposta -eq "s") {
        $projetoPath = "C:\ResultadosDigitosMegaSena"
        # Criar diretório se não existir
        if (-not (Test-Path $projetoPath)) {
            New-Item -Path $projetoPath -ItemType Directory -Force
            Write-Host "Diretório do projeto criado em $projetoPath" -ForegroundColor Green
        }
    } else {
        exit 1
    }
}

# Atualizar os arquivos principais
$arquivosAtualizados = @{
    # app/routes.py corrigido
    "$projetoPath\app\routes.py" = @"
from flask import render_template, jsonify, request
from app import app
import requests
import redis
import os
import json
import logging

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Configurações do Redis
REDIS_HOST = os.getenv('REDIS_HOST')
REDIS_PORT = os.getenv('REDIS_PORT')
REDIS_PASSWORD = os.getenv('REDIS_PASSWORD')
REDIS_DB = os.getenv('REDIS_DB', '0')
API_BASE_URL = os.getenv('API_BASE_URL')

logger.info(f"Configurações carregadas: HOST={REDIS_HOST}, PORT={REDIS_PORT}, API={API_BASE_URL}")

# Conexão com o Redis
try:
    redis_client = redis.Redis(
        host=REDIS_HOST,
        port=int(REDIS_PORT),
        password=REDIS_PASSWORD,
        db=int(REDIS_DB),
        decode_responses=True
    )
    # Teste da conexão
    redis_client.ping()
    logger.info("Conexão com Redis estabelecida com sucesso")
except Exception as e:
    logger.error(f"Erro ao conectar ao Redis: {str(e)}")
    # Criar um mock do redis em memória para não quebrar a aplicação
    class MockRedis:
        def __init__(self):
            self.data = {}
        
        def get(self, key):
            return self.data.get(key)
        
        def set(self, key, value, ex=None):
            self.data[key] = value
            return True
        
        def ping(self):
            return True
    
    redis_client = MockRedis()
    logger.warning("Usando Redis em memória (mock)")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/resultados')
def get_resultados():
    cache_key = 'megasena:resultados'
    
    # Verifica se os dados estão em cache
    try:
        cached_data = redis_client.get(cache_key)
        if cached_data:
            logger.info("Usando dados do cache para resultados")
            return jsonify(json.loads(cached_data))
    except Exception as e:
        logger.error(f"Erro ao acessar cache: {str(e)}")
    
    # Se não estiver em cache, busca na API
    try:
        logger.info(f"Buscando dados na API: {API_BASE_URL}/megasena")
        response = requests.get(f"{API_BASE_URL}/megasena")
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Dados recebidos da API: {len(data)} registros")
            # Salva no Redis por 1 hora (3600 segundos)
            try:
                redis_client.set(cache_key, json.dumps(data), ex=3600)
            except Exception as e:
                logger.error(f"Erro ao salvar no cache: {str(e)}")
            return jsonify(data)
        else:
            logger.error(f"Erro ao acessar API: {response.status_code}")
            return jsonify({"error": f"Erro ao acessar a API: {response.status_code}"}), 500
    except Exception as e:
        logger.error(f"Exceção ao buscar dados: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/digitos')
def get_digitos():
    cache_key = 'megasena:digitos'
    
    # Log para debug
    logger.info("Rota /api/digitos acessada")
    
    # Verifica se os dados estão em cache
    try:
        cached_data = redis_client.get(cache_key)
        if cached_data:
            logger.info("Usando dados do cache para dígitos")
            return jsonify(json.loads(cached_data))
    except Exception as e:
        logger.error(f"Erro ao acessar cache: {str(e)}")
    
    # Se não estiver em cache, processa os dados
    try:
        logger.info(f"Buscando dados na API: {API_BASE_URL}/megasena")
        response = requests.get(f"{API_BASE_URL}/megasena")
        if response.status_code == 200:
            data = response.json()
            logger.info(f"Dados recebidos da API: {len(data)} registros")
            
            # Processar os dígitos
            resultados_processados = []
            frequencia_digitos = {str(i): 0 for i in range(10)}
            
            for concurso in data:
                dezenas = concurso.get('dezenas', [])
                
                # Extrair dígitos das dezenas
                digitos = []
                for dezena in dezenas:
                    for digito in dezena:
                        digitos.append(digito)
                        frequencia_digitos[digito] += 1
                
                # Ordenar dígitos para facilitar cópia
                digitos_ordenados = sorted(digitos)
                
                resultados_processados.append({
                    'concurso': concurso.get('concurso'),
                    'data': concurso.get('data'),
                    'dezenas': dezenas,
                    'digitos': digitos,
                    'digitos_ordenados': digitos_ordenados,
                    'digitos_para_copia': ','.join(digitos_ordenados),
                    'contagem_digitos': len(digitos)
                })
            
            # Ordenar frequência de dígitos
            frequencia_ordenada = {k: v for k, v in sorted(frequencia_digitos.items(), key=lambda item: item[1], reverse=True)}
            
            resultado_final = {
                'resultados': resultados_processados,
                'frequencia_digitos': frequencia_ordenada
            }
            
            # Salva no Redis por 1 hora (3600 segundos)
            try:
                redis_client.set(cache_key, json.dumps(resultado_final), ex=3600)
            except Exception as e:
                logger.error(f"Erro ao salvar no cache: {str(e)}")
                
            logger.info("Processamento de dígitos concluído com sucesso")
            return jsonify(resultado_final)
        else:
            logger.error(f"Erro ao acessar API: {response.status_code}")
            return jsonify({"error": f"Erro ao acessar a API: {response.status_code}"}), 500
    except Exception as e:
        logger.error(f"Exceção ao processar dados: {str(e)}")
        return jsonify({"error": str(e)}), 500
"@

    # run.py corrigido
    "$projetoPath\run.py" = @"
import os
import logging
from app import