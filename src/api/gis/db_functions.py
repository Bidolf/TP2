import json

import psycopg2
import time
from flask import jsonify


def update_sighting(sighting):
    id = sighting["id"]
    latitude = str(sighting["latitude"])
    longitude = str(sighting["longitude"])
    point = 'Point(' + longitude + ' ' + latitude + ')'
    print(point)
    connection = None
    cursor = None
    try:
        connection = psycopg2.connect(user="is",
                                      password="is",
                                      host="db-rel",
                                      port="5432",
                                      database="is")

        cursor = connection.cursor()

        max_attempts = 10
        wait_time = 30
        for attempt in range(1, max_attempts + 1):
            print("a", flush=True)
            cursor.execute(
                """
                    SELECT id FROM sightings WHERE id = %s
                """, (id,)
            )
            connection.commit()
            rows = cursor.fetchone()
            if (rows != None):
                break
            time.sleep(wait_time)

        print("b", flush=True)
        cursor.execute(
            """
                UPDATE sightings
                SET latitude = %s, longitude = %s, location_geometry = %s
                WHERE id = %s
            """, (latitude, longitude, point, id)
        )

        connection.commit()

    except (Exception, psycopg2.Error) as error:
        print("Failed to update sightings table", error, flush=True)
    finally:
        if connection:
            cursor.close()
            connection.close()
    return 1


def get_sightings_in_area(ne_lat, ne_long, sw_lat, sw_long):
    connection = None
    cursor = None
    rows = None
    try:
        connection = psycopg2.connect(user="is",
                                      password="is",
                                      host="db-rel",
                                      port="5432",
                                      database="is")
        cursor = connection.cursor()
        cursor.execute(
            """
                SELECT s.id, s.date_encounter, s.time_encounter,
                    s.country, s.region, s.locale, ST_AsGeoJSON(s.location_geometry),
                    s.encounter_duration_text, u.shape_name, s.description
                FROM sightings s
                JOIN ufo_shapes u ON s.ufo_shape_ref = u.id
                WHERE ST_Within( s.location_geometry, ST_MakeEnvelope( %s, %s, %s, %s, 4326))
            """, (sw_long, sw_lat, ne_long, ne_lat)
        )

        rows = cursor.fetchall()

    except (Exception, psycopg2.Error) as error:
        print("Failed to get sightings in area", error, flush=True)
    finally:
        if connection:
            cursor.close()
            connection.close()

    result = jsonify_sightings(rows)

    return result


def jsonify_sightings(rows):
    result = []
    for row in rows:
        id = row[0]
        date_encounter = row[1]
        time_encounter = row[2]
        country = row[3]
        region = row[4]
        locale = row[5]
        point = json.loads(row[6])
        latitude = point["coordinates"][1]
        longitude = point["coordinates"][0]
        duration = row[7]
        shape = row[8]
        description = row[9]

        result.append(
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [longitude, latitude]  # Convert to float
                },
                "properties": {
                    "id": id,
                    "date_encounter": date_encounter,
                    "time_encounter": time_encounter,
                    "country": country,
                    "region": region,
                    "locale": locale,
                    "duration": duration,
                    "shape": shape,
                    "description": description
                }
            }
        )

    return result
