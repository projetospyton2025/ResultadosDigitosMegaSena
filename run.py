import logging
from app import app
from dotenv import load_dotenv, find_dotenv
import redis
import os

# Tenta encontrar e carregar o arquivo .env
dotenv_path = find_dotenv()
if not dotenv_path:
    print("❌ ERRO: Arquivo .env não encontrado!")
else:
    print(f"✅ Arquivo .env encontrado: {dotenv_path}")
    load_dotenv(dotenv_path)

# Pegando a URL do Redis
REDIS_URL = os.getenv("REDIS_URL")

print(f"🔍 REDIS_URL: {REDIS_URL}")  # Deve exibir a URL do Redis, não None!

if not REDIS_URL:
    print("❌ ERRO: REDIS_URL não foi carregada! Verifique o .env ou defina manualmente.")
    exit(1)  # Encerra o programa se a variável não foi carregada corretamente

try:
    # Criando a conexão com o Redis
    redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
    
    # Testando a conexão
    redis_client.ping()
    print("✅ Conexão com o Redis estabelecida com sucesso!")

except Exception as e:
    print(f"❌ Erro ao conectar ao Redis: {type(e).__name__} - {e}")


# Configurar logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('app.log')
    ]
)

logger = logging.getLogger(__name__)


if __name__ == '__main__':
    logger.info("Iniciando aplicação...")
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
  
"""
if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
"""