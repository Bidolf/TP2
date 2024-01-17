import sys
import time
import pika
import daemon

POLLING_FREQ = int(sys.argv[1]) if len(sys.argv) >= 2 else 60
ENTITIES_PER_ITERATION = int(sys.argv[2]) if len(sys.argv) >= 3 else 20

ROUTING_KEY_GEO_DATA_UPDATE = sys.argv[3] if len(sys.argv) >= 4 else "geo_data_update_routing_key"

RABBITMQ_DEFAULT_VHOST = sys.argv[4] if len(sys.argv) >= 5 else "is"
RABBITMQ_DEFAULT_USER = sys.argv[5] if len(sys.argv) >= 6 else "is"
RABBITMQ_DEFAULT_PASS = sys.argv[6] if len(sys.argv) >= 7 else "is"


def main():
    credentials = pika.PlainCredentials(RABBITMQ_DEFAULT_USER, RABBITMQ_DEFAULT_PASS)
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            host='rabbitmq',
            port='5672',
            virtual_host=RABBITMQ_DEFAULT_VHOST,
            credentials=credentials))
    channel = connection.channel()

    channel.queue_declare(queue=ROUTING_KEY_GEO_DATA_UPDATE)

    print(f"Getting up to {ENTITIES_PER_ITERATION} entities without coordinates...")

    for _ in range(ENTITIES_PER_ITERATION):
        method_frame, header_frame, body = channel.basic_get(queue=ROUTING_KEY_GEO_DATA_UPDATE, auto_ack=True)
        if method_frame:
            print(f"Received message: {body.decode('utf-8')}")
        else:
            print("No more messages in the queue.")
            break

    # !TODO: 1- Use api-gis to retrieve a fixed amount of entities without coordinates (e.g. 100 entities per iteration, use ENTITIES_PER_ITERATION)
    # !TODO: 2- Use the entity information to retrieve coordinates from an external API
    # !TODO: 3- Submit the changes
    time.sleep(POLLING_FREQ)

if __name__ == "__main__":
    with daemon.DaemonContext():
        main()

