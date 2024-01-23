CREATE EXTENSION IF NOT EXISTS POSTGIS;
CREATE EXTENSION IF NOT EXISTS POSTGIS_TOPOLOGY;

CREATE TABLE public.sightings (
	id VARCHAR(250) PRIMARY KEY,
	ufo_shape_ref VARCHAR(250) NOT NULL,
    date_encounter VARCHAR(250),
    time_encounter VARCHAR(250),
    season_encounter VARCHAR(250),
    date_documented VARCHAR(250),
    country VARCHAR(250),
    region VARCHAR(250),
    locale VARCHAR(250),
    latitude VARCHAR(250),
    longitude VARCHAR(250),
    location_geometry geometry(Point, 4326) DEFAULT NULL, /*4326 represents the SRID (Spatial Reference ID) for WGS 84, which is commonly used for GPS coordinates. so that we can know that point has longitude and latitude*/
    encounter_duration_text VARCHAR(250),
    encounter_duration_seconds INTEGER,
    description TEXT,
	created_on      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_on      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.ufo_shapes (
	id VARCHAR(250) PRIMARY KEY,
    shape_name VARCHAR(250),
	created_on      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_on      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.sightings
    ADD CONSTRAINT sightings_ufo_shapes_fk
        FOREIGN KEY (ufo_shape_ref) REFERENCES public.ufo_shapes(id)
            ON DELETE SET NULL;