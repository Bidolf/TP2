import sys
import time
import psycopg2
import pika
from psycopg2 import OperationalError

POLLING_FREQ = int(sys.argv[1]) if len(sys.argv) >= 2 else 60
RABBITMQ_HOST = int(sys.argv[2]) if len(sys.argv) >= 3 else "is"
RABBITMQ_QUEUE = int(sys.argv[3]) if len(sys.argv) >= 4 else 'entity_import_routing_key'


def print_psycopg2_exception(ex):
    # get details about the exception
    err_type, err_obj, traceback = sys.exc_info()

    # get the line number when exception occured
    line_num = traceback.tb_lineno

    # print the connect() error
    print("\npsycopg2 ERROR:", ex, "on line number:", line_num)
    print("psycopg2 traceback:", traceback, "-- type:", err_type)

    # psycopg2 extensions.Diagnostics object attribute
    print("\nextensions.Diagnostics:", ex.diag)

    # print the pgcode and pgerror exceptions
    print("pgerror:", ex.pgerror)
    print("pgcode:", ex.pgcode, "\n")


def migrate_data():
    # TODO: Implement your migration logic here
    print("Checking updates...")
    # !TODO: 1- Execute a SELECT query to check for any changes on the table
    # !TODO: 2- Execute a SELECT queries with xpath to retrieve the schema we want to store in the relational db
    # !TODO: 3- Execute INSERT queries in the destination db
    # !TODO: 4- Make sure we store somehow in the origin database that certain records were already migrated.
    #          Change the db structure if needed.
    # This might involve interacting with api-entities
    pass


def on_message(channel1, method_frame, header_frame, body):
    try:
        print("Received message:", body.decode('utf-8'))
        migrate_data()
        time.sleep(POLLING_FREQ)
    except Exception as e:
        print("Error processing message:", e)
    finally:
        #(acknowledgment) ao RabbitMQ indicando que a mensagem com a tag de entrega (delivery_tag) fornecida foi processada com sucesso.
        channel1.basic_ack(delivery_tag=method_frame.delivery_tag)


if __name__ == "__main__":
    # Connect to both databases
    # db_org = None
    # db_dst = None
    # try:
    #   db_org = psycopg2.connect(host='db-xml', database='is', user='is', password='is')
    #   db_dst = psycopg2.connect(host='db-rel', database='is', user='is', password='is')
    # except OperationalError as err:
    #   print_psycopg2_exception(err)

    #Cria uma conexão bloqueante com o RabbitMQ usando os parâmetros fornecidos, como o host do RabbitMQ.
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    #Cria um canal de comunicação na conexão.
    channel = connection.channel()
    #Declara a fila que será usada para a comunicação
    channel.queue_declare(queue=RABBITMQ_QUEUE)
    # escutar a fila especificada (RABBITMQ_QUEUE)
    channel.basic_consume(queue=RABBITMQ_QUEUE, on_message_callback=on_message)

    print("Waiting for migration tasks. To exit press CTRL+C")
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        print("Stopping the migrator.")
        channel.stop_consuming()
    connection.close()



    #db_org.close()
    #db_dst.close()
