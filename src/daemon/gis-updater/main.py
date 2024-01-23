import json
import sys
import time
import threading
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
HOSTNAME = 'http://api-gis:'+API_PORT


def update_entity(entity_json):
    entity_data = json.loads(entity_json)
    entity = entity_data["content"]
    # print(entity)
    entity_country = entity["Location"]["Country"]
    entity_region = entity["Location"]["Region"]
    entity_locale = entity["Location"]["Locality"]

    coordinates = get_coordinates(entity_country, entity_region, entity_locale)
    # print(coordinates)
    if coordinates:
        entity_lat, entity_long = coordinates
        # entity["Location"]["Latitude"] = entity_lat
        # entity["Location"]["Longitude"] = entity_long
        # entity_point = 'POINT('+entity_long+' '+entity_lat+')'
        # print(entity)
        send_patch(entity["ID"], entity_lat, entity_long)
    else:
        print("Error: Could not find coordinates")


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


def send_patch(id, latitude, longitude):
    url = HOSTNAME + "/api/entity/" + id
    data = {
        'id': id,
        'latitude': latitude,
        'longitude': longitude
    }
    payload = json.dumps(data)
    response = requests.patch(url,
        data = payload)
    print("Sent patch. Response: ", response.status_code)
    # response = requests.patch(f'{HOSTNAME}/api/entity/{entity["ID"]}')
    # print(f'Response from /api/tile: {response.status_code}, {response.json()}')


def connect_with_retry(parameters, num_attempts, delay_seconds):
    for i in range(num_attempts):
        try:
            connection = pika.BlockingConnection(parameters)
            print("Connected to RabbitMQ.")
            return connection
        except pika.exceptions.AMQPConnectionError:
            print("Connection to RabbitMQ failed. Retrying in ", delay_seconds, " seconds...")
            time.sleep(delay_seconds)
    print("Connection to RabbitMQ failed. No longer retrying.")
    return None


def consume_messages(channel, routing_key, num_messages):
    messages_received = 0
    for method, properties, body in channel.consume(queue=routing_key, auto_ack=False, inactivity_timeout=1):
        if (body != None):
            channel.basic_ack(method.delivery_tag)
            callback(channel, method, properties, body)
            messages_received += 1
            if messages_received == num_messages:
                break
        else:
            break

    print(f"Updated {messages_received} sightings.")


def callback(channel, method, properties, body):
    update_entity(body.decode('utf-8'))


def main():
    credentials = pika.PlainCredentials(RABBITMQ_DEFAULT_USER, RABBITMQ_DEFAULT_PASS)
    parameters = pika.ConnectionParameters(
        host='rabbitmq',
        port='5672',
        virtual_host=RABBITMQ_DEFAULT_VHOST,
        credentials=credentials)

    connection = connect_with_retry(parameters, 10, 5)

    channel = connection.channel()

    channel.queue_declare(queue=ROUTING_KEY_GEO_DATA_UPDATE, durable=True)
    while True:
        try:
            messages_to_receive = ENTITIES_PER_ITERATION

            print(f"Getting up to {messages_to_receive} sightings without coordinates...")
            thread = threading.Thread(
                target=consume_messages,
                args=(channel, ROUTING_KEY_GEO_DATA_UPDATE, messages_to_receive)
            )

            # Start the thread
            thread.start()

            time.sleep(POLLING_FREQ)
        except KeyboardInterrupt:
            sys.exit(0)


if __name__ == "__main__":
    while True:
        try:
            main()
        except KeyboardInterrupt:
            sys.exit(0)
