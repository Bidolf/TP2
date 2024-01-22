import psycopg2
from flask import jsonify

def update_sighting(sighting):
    print(sighting)
    id = sighting["id"]
    point = sighting["point"]
    latitude = sighting["latitude"]
    longitude = sighting["longitude"]
    connection = None
    cursor = None
    try:
        connection = psycopg2.connect(user="is",
                                      password="is",
                                      host="db-rel",
                                      port="5432",
                                      database="is")

        cursor = connection.cursor()
        cursor.execute("""
                            UPDATE sightings
                            SET latitude = %s, longitude = %s, location_geometry = %s
                            WHERE id = %s
                        """, (latitude, longitude, point, id))

        connection.commit()
    except (Exception, psycopg2.Error) as error:
        print("Failed to update sightings table", error, flush=True)
    finally:
        if connection:
            cursor.close()
            connection.close()
    return 1