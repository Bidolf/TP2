"use client"
import React, { useEffect, useState } from 'react';
import { LayerGroup, useMap } from 'react-leaflet';
import { ObjectMarker } from "./ObjectMarker";


const apiGisUrl = process.env.NEXT_PUBLIC_API_GIS_URL
const DEMO_DATA = [
	{
		"geometry": {
			"coordinates": [
				-86.2894222,
				33.5923259
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "Strobe Lighted disk shape object observed close&#44 at low speeds&#44 and low altitude in Oct 1966 in Pell City Alabama",
			"duration": "5  minutes",
			"id": "91c274f2-9a0d-5ce6-ac3d-7529f452df21",
			"locale": "Harrisburg",
			"region": "Alabama",
			"shape": "Disk",
			"time_encounter": "20:30:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-118.3483256,
				33.9188589
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "ROUND &#44 ORANGE &#44 WITH WHAT I WOULD SAY WAS POLISHED METAL OF SOME KIND AROUND THE EDGES .",
			"duration": "7 min.",
			"id": "23986425-d3a5-5e13-8bab-299745777a8d",
			"locale": "Hawthorne",
			"region": "California",
			"shape": "Circle",
			"time_encounter": "20:30:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-97.9405828,
				29.8826436
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1972-10-10",
			"description": "On october 10&#44 1972 myself&#44my 5yrs.daughter&#442 neices and 2 nephews were playing tag in the back yard .When we looked over on the ridge",
			"duration": "20minutes",
			"id": "c15b38c9-9a3e-543c-a703-dd742f25b4d5",
			"locale": "Harlan",
			"region": "Kentucky",
			"shape": "Circle",
			"time_encounter": "19:00:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-98.5104781,
				29.4263987
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "1952 Lackland AFB&#44 TX.  Lights racing across the sky &amp; making 90 degree turns on a dime.",
			"duration": "4-2 hrs",
			"id": "db680066-c83d-5ed7-89a4-1d79466ea62d",
			"locale": "Bexar County",
			"region": "Texas",
			"shape": "Light",
			"time_encounter": "20:30:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-73.4078968,
				41.1175966
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "This event took place in early fall around 1949-50. It occurred after a Boy Scout meeting in the Baptist Church. The Baptist Church sit",
			"duration": "45 minutes",
			"id": "b04965e6-a9bb-591f-8f8a-1adcb2c8dc39",
			"locale": "San Marcos",
			"region": "Texas",
			"shape": "Cylinder",
			"time_encounter": "20:30:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-86.2894222,
				33.5923259
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "1949 Lackland AFB&#44 TX.  Lights racing across the sky &amp; making 90 degree turns on a dime.",
			"duration": "1-2 hrs",
			"id": "4b166dbe-d99d-5091-abdd-95b83330ed3a",
			"locale": "Bexar County",
			"region": "Texas",
			"shape": "Light",
			"time_encounter": "21:00:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-82.9842885,
				30.2961892
			],
			"type": "Point"
		},
		"properties": {
			"country": "United Kingdom",
			"date_encounter": "1955-10-10",
			"description": "Green/Orange circular disc over Chester&#44 England",
			"duration": "20 seconds",
			"id": "98123fde-012f-5ff3-8b50-881449dac91a",
			"locale": "Chester",
			"region": "England",
			"shape": "Circle",
			"time_encounter": "17:00:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-118.3483256,
				33.9188589
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1956-10-10",
			"description": "My older brother and twin sister were leaving the only Edna theater at about 9 PM&#44...we had our bikes and I took a different route home",
			"duration": "1/2 hour",
			"id": "6ed955c6-506a-5343-9be4-2c0afae02eef",
			"locale": "Edna",
			"region": "Texas",
			"shape": "Circle",
			"time_encounter": "21:00:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-98.5104781,
				29.4263987
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1961-10-10",
			"description": "My father is now 89 my brother 52 the girl with us now 51 myself 49 and the other fellow which worked with my father if he&#39s still livi",
			"duration": "5 minutes",
			"id": "a6c4fc8f-6950-51de-a9ae-2c519c465071",
			"locale": "Bristol",
			"region": "Tennessee",
			"shape": "Sphere",
			"time_encounter": "19:00:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-97.9405828,
				29.8826436
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1960-10-10",
			"description": "AS a Marine 1st Lt. flying an FJ4B fighter/attack aircraft on a solo night exercise&#44 I was at 50&#44000&#39 in a &quot;clean&quot; aircraft (no ordinan",
			"duration": "15 minutes",
			"id": "c8691da2-158a-5ed6-8537-0e6f140801f2",
			"locale": "Kaneohe",
			"region": "Hawaii",
			"shape": "Light",
			"time_encounter": "20:00:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-96.6462526,
				28.9772626
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1965-10-10",
			"description": "A bright orange color changing to reddish color disk/saucer was observed hovering above power transmission lines.",
			"duration": "20 minutes",
			"id": "e99caacd-6c45-5906-bd9f-b79e62f25963",
			"locale": "Norwalk",
			"region": "Connecticut",
			"shape": "Disk",
			"time_encounter": "23:45:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-82.1885212,
				36.5945034
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1966-10-10",
			"description": "Saucer zaps energy from powerline as my pregnant mother receives mental signals not to pass info",
			"duration": "several minutes",
			"id": "0159d6c7-973f-5e7a-a9a0-d195d0ea6fe2",
			"locale": "Live Oak",
			"region": "Florida",
			"shape": "Disk",
			"time_encounter": "21:00:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-73.4078968,
				41.1175966
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1968-10-10",
			"description": "silent red /orange mass of energy floated by three of us in western North Carolina in the 60s",
			"duration": "3 minutes",
			"id": "52524d6e-10dc-5261-aa36-8b2efcbaa5f0",
			"locale": "Franklin Park",
			"region": "North Carolina",
			"shape": "Fireball",
			"time_encounter": "19:00:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-82.1885212,
				36.5945034
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "My father is now 89 my brother 52 the girl with us now 51 myself 49 and the other fellow which worked with my father if he&#39s still livi",
			"duration": "8 minutes",
			"id": "292c8e99-2378-55aa-83d8-350e0ac3f1cc",
			"locale": "Bristol",
			"region": "Tennessee",
			"shape": "Sphere",
			"time_encounter": "20:30:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-73.4078968,
				41.1175966
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "A bright orange color changing to reddish color disk/saucer was observed hovering above power transmission lines.",
			"duration": "23 minutes",
			"id": "4c507660-a83b-55c0-9b2b-83eccb07723d",
			"locale": "Norwalk",
			"region": "Connecticut",
			"shape": "Disk",
			"time_encounter": "20:30:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-86.2894222,
				33.5923259
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "Strobe Lighted disk shape object observed close&#44 at low speeds&#44 and low altitude in Oct 1966 in Pell City Alabama",
			"duration": "6  minutes",
			"id": "a1b9b633-da11-58be-b1a9-5cfa2848f186",
			"locale": "Harrisburg",
			"region": "Alabama",
			"shape": "Disk",
			"time_encounter": "20:30:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-82.9842885,
				30.2961892
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "Saucer zaps energy from powerline as my pregnant mother receives mental signals not to pass info",
			"duration": "several minutes",
			"id": "c2708a8b-120a-56f5-a30d-990048af87cc",
			"locale": "Live Oak",
			"region": "Florida",
			"shape": "Disk",
			"time_encounter": "20:30:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-118.3483256,
				33.9188589
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "ROUND &#44 ORANGE &#44 WITH WHAT I WOULD SAY WAS POLISHED METAL OF SOME KIND AROUND THE EDGES .",
			"duration": "8 min.",
			"id": "e7263999-68b6-5a23-b530-af25b7efd632",
			"locale": "Hawthorne",
			"region": "California",
			"shape": "Circle",
			"time_encounter": "20:30:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-97.9405828,
				29.8826436
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "This event took place in early fall around 1949-50. It occurred after a Boy Scout meeting in the Baptist Church. The Baptist Church sit",
			"duration": "49 minutes",
			"id": "ce1ae2d5-3454-5952-97ff-36ff935bcfe9",
			"locale": "San Marcos",
			"region": "Texas",
			"shape": "Cylinder",
			"time_encounter": "20:30:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-98.5104781,
				29.4263987
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "1953 Lackland AFB&#44 TX.  Lights racing across the sky &amp; making 90 degree turns on a dime.",
			"duration": "5-2 hrs",
			"id": "33677b87-bc8d-5ff6-9a25-fe60225e4bf0",
			"locale": "Bexar County",
			"region": "Texas",
			"shape": "Light",
			"time_encounter": "20:30:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-82.9842885,
				30.2961892
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "Saucer zaps energy from powerline as my pregnant mother receives mental signals not to pass info",
			"duration": "several minutes",
			"id": "0ff1e264-520d-543a-87dd-181a491e667e",
			"locale": "Live Oak",
			"region": "Florida",
			"shape": "Disk",
			"time_encounter": "20:30:00"
		},
		"type": "Feature"
	},
	{
		"geometry": {
			"coordinates": [
				-96.6462526,
				28.9772626
			],
			"type": "Point"
		},
		"properties": {
			"country": "United States",
			"date_encounter": "1949-10-10",
			"description": "My older brother and twin sister were leaving the only Edna theater at about 9 PM&#44...we had our bikes and I took a different route home",
			"duration": "4/2 hour",
			"id": "35140057-a2a4-5adb-a500-46f8ed8b66a9",
			"locale": "Edna",
			"region": "Texas",
			"shape": "Circle",
			"time_encounter": "20:30:00"
		},
		"type": "Feature"
	}
];

const hello_world_fetch = async () => {
	return await fetch(`http://${apiGisUrl}`)
}


async function fetchDataFromAPI(ne_lat, ne_long, sw_lat, sw_long) {
	try {
		const response = await axios.get(
			`/api/entities?neLat=${ne_lat}&neLng=${ne_long}&swLat=${sw_lat}&swLng=${sw_long}`
		);

		if (!response.ok) {
			throw new Error('Network response was not ok');
		}

		const data = response.json();
		console.log(data)
		return data;
	} catch (error) {
		console.error('Error fetching data from API:', error);
	}
};

function ObjectMarkersGroup() {

	const map = useMap();
	var [geom, setGeom] = useState([...DEMO_DATA]);
	console.log(geom)
	const [bounds, setBounds] = useState(map.getBounds());

	/**
	 * Setup the event to update the bounds automatically
	 */
	useEffect(() => {
		const cb = () => {
			setBounds(map.getBounds());
		}
		map.on('moveend', cb);

		return () => {
			map.off('moveend', cb);
		}
	}, []);

	/* Updates the data for the current bounds */
	useEffect(() => {
		console.log(`> getting data for bounds`, bounds);
		const { _northEast, _southWest } = bounds;
		const neLat = _northEast.lat;
		const neLng = _northEast.lng;

		const swLat = _southWest.lat;
		const swLng = _southWest.lng;
		//        await fetchDataFromAPI(neLat, neLng, swLat, swLng)
		//            .then((data) => setGeom(data))
		//            .catch((error) => console.error(error));
		setGeom(DEMO_DATA);
	}, [bounds])

	return (
		<LayerGroup>
			{
				geom.map(geoJSON => <ObjectMarker key={geoJSON.properties.id} geoJSON={geoJSON} />)
			}
		</LayerGroup>
	);
}

export default ObjectMarkersGroup;
