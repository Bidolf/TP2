import sys
import time
import json
import psycopg2
import pika

# Parâmetros de linha de comando
POLLING_FREQ = int(sys.argv[1]) if len(sys.argv) >= 2 else 60
RABBITMQ_HOST = sys.argv[2] if len(sys.argv) >= 3 else "localhost"
RABBITMQ_QUEUE = sys.argv[3] if len(sys.argv) >= 4 else 'entity_import_routing_key'

# Conexão com o RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
channel = connection.channel()
channel.queue_declare(queue=RABBITMQ_QUEUE)

# Conexão com o PostgreSQL
pg_conn = psycopg2.connect(
    host="seu_host",
    database="sua_database",
    user="seu_usuario",
    password="sua_senha"
)
pg_cursor = pg_conn.cursor()


def callback(ch, method, properties, body):
    # Função chamada quando uma mensagem é recebida
    try:
        # Processa a mensagem (por exemplo, migração de dados)
        data = json.loads(body)

        # Aqui você pode implementar a lógica para migrar os dados para o PostgreSQL
        # Substitua isso com sua própria lógica de migração

        # Exemplo: Inserindo dados em uma tabela chamada 'entidades'
        pg_cursor.execute("INSERT INTO entidades (campo1, campo2) VALUES (%s, %s)", (data['campo1'], data['campo2']))
        pg_conn.commit()

        print("Dados migrados com sucesso:", data)

    except Exception as e:
        print("Erro ao processar mensagem:", str(e))


# Configura o consumo da fila
channel.basic_consume(queue=RABBITMQ_QUEUE, on_message_callback=callback, auto_ack=True)

print(f"Aguardando mensagens. Polling a cada {POLLING_FREQ} segundos.")
try:
    # Inicia o loop de consumo de mensagens
    channel.start_consuming()
except KeyboardInterrupt:
    # Encerra a conexão ao pressionar Ctrl+C
    channel.stop_consuming()

# Fecha as conexões
connection.close()
pg_cursor.close()
pg_conn.close()
