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
        return

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
            entity_json = json.loads(body.decode('utf-8'))
            # print("Received JSON data:", entity_json)

        else:
            print("No more messages in the queue.")
            break

    time.sleep(POLLING_FREQ)


if __name__ == "__main__":
    try:
        while True:
            main()
    except KeyboardInterrupt:
        sys.exit(0)

