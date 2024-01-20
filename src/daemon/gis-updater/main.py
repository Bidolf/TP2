import json
import sys
import time
import pika
import daemon
import requests

POLLING_FREQ = int(sys.argv[1]) if len(sys.argv) >= 2 else 60
ENTITIES_PER_ITERATION = int(sys.argv[2]) if len(sys.argv) >= 3 else 20

ROUTING_KEY_GEO_DATA_UPDATE = sys.argv[3] if len(sys.argv) >= 4 else "geo_data_update_routing_key"

RABBITMQ_DEFAULT_VHOST = sys.argv[4] if len(sys.argv) >= 5 else "is"
RABBITMQ_DEFAULT_USER = sys.argv[5] if len(sys.argv) >= 6 else "is"
RABBITMQ_DEFAULT_PASS = sys.argv[6] if len(sys.argv) >= 7 else "is"

API_PORT = sys.argv[7] if len(sys.argv) >= 8 else "8080"
HOSTNAME = 'http://api-gis:' + API_PORT


def update_entity(entity_json):
    entity_data = json.loads(entity_json)

    print(entity_json)
    print(entity_data)

    entity_country = entity_data["Location"]["Country"]
    entity_region = entity_data["Location"]["Region"]
    entity_locale = entity_data["Location"]["Locale"]

    coordinates = get_coordinates(entity_country, entity_region, entity_locale)

    if coordinates:
        entity_lat, entity_long = coordinates
        entity_data["Location"]["Latitude"] = entity_lat
        entity_data["Location"]["Longitude"] = entity_long
    else:
        print("Error: Could not find coordinates")
        # TODO se não houverem coordenadas, devolver como NULL
        entity_data["Location"]["Latitude"] = "NULL"
        entity_data["Location"]["Longitude"] = "NULL"


    send_patch(entity_data)


def get_coordinates(country, region, locale):
    api_url = "https://nominatim.openstreetmap.org/search"

    query = f"{country}, {region}, {locale}"

    # Parameters for the request
    params = {
        "q": query,
        "format": "json",
    }

    # Make the request to Nominatim API
    response = requests.get(api_url, params=params)

    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Parse the JSON response
        data = response.json()

        # Check if at least one result was found
        if data:
            # Get the first result's latitude and longitude
            lat = data[0]["lat"]
            lon = data[0]["lon"]

            return lat, lon
        else:
            print("No results found for the given location.")
            return None
    else:
        print(f"Error: {response.status_code}, {response.text}")
        return None
    return None


def send_patch(entity_data):
    response = requests.patch(f'{HOSTNAME}/api/entity/{entity_data["ID"]}')
    print(f'Response from /api/tile: {response.status_code}, {response.json()}')


def connect_with_retry(parameters, num_attempts, delay_seconds):
    for i in range(num_attempts):
        try:
            connection = pika.BlockingConnection(parameters)
            return connection
        except pika.exceptions.AMQPConnectionError:
            print("Connection to RabbitMQ failed. Retrying in ",delay_seconds," seconds...")
            time.sleep(delay_seconds)
    print("Connection to RabbitMQ failed. No longer retrying.")
    return None

def consume_messages(channel, routing_key, num_messages):
    channel.basic_consume(queue=routing_key, on_message_callback=callback, auto_ack=True)

    messages_received = 0
    while messages_received < num_messages:
        try:
            channel.start_consuming()
        except KeyboardInterrupt:
            break
        messages_received += 1


def callback(channel, method, properties, body):
    print("mesage!!! :D")
    update_entity(body["content"])



def main():
    credentials = pika.PlainCredentials(RABBITMQ_DEFAULT_USER, RABBITMQ_DEFAULT_PASS)
    parameters= pika.ConnectionParameters(
            host='rabbitmq',
            port='5672',
            virtual_host=RABBITMQ_DEFAULT_VHOST,
            credentials=credentials)

    connection = connect_with_retry(parameters, 10, 5)

    channel = connection.channel()

    channel.queue_declare(queue=ROUTING_KEY_GEO_DATA_UPDATE, durable=True)
    while True:
        try:
            message_count = 20
            messages_to_receive = ENTITIES_PER_ITERATION
            if(message_count < messages_to_receive):
                messages_to_receive = message_count

            print(f"Getting {messages_to_receive} entities without coordinates...")

            consume_messages(channel, ROUTING_KEY_GEO_DATA_UPDATE, messages_to_receive)
            # TODO quando quiser buscar 20 msg mas só existem 10, fechr o consume_messages

            time.sleep(POLLING_FREQ)
        except KeyboardInterrupt:
            sys.exit(0)





if __name__ == "__main__":
    while True:
        try:
            main()
        except KeyboardInterrupt:
            sys.exit(0)

