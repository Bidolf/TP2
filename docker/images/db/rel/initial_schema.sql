CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS POSTGIS;
CREATE EXTENSION IF NOT EXISTS POSTGIS_TOPOLOGY;

CREATE TABLE public.sightings (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	ufo_shape_ref UUID NOT NULL,
    date_encounter DATE,
    time_encounter TIME,
    season_encounter VARCHAR(250),
    date_documented DATE,
    country VARCHAR(250),
    region VARCHAR(250),
    locale VARCHAR(250),
    location_geometry GEOMETRY(Point, 4326), /*4326 represents the SRID (Spatial Reference ID) for WGS 84, which is commonly used for GPS coordinates. so that we can know that point has longitude and latitude*/
    encounter_duration_text VARCHAR(255),
    encounter_duration_seconds INTEGER,
    description TEXT,
	created_on      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_on      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.ufo_shapes (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shape_name VARCHAR(255) NOT NULL,
	created_on      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_on      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.sightings
    ADD CONSTRAINT sightings_ufo_shapes_fk
        FOREIGN KEY (ufo_shape_ref) REFERENCES public.ufo_shapes(id)
            ON DELETE SET NULL;