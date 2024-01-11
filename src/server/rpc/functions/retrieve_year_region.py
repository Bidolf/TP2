from lxml import etree
from src.server.rpc.db_functions.retrieve_xml import retrieve_xml


def retrieve_year_region(region, year, singleresult):
    retrieve_info = []
    data = []
    if singleresult:
        xml = retrieve_xml()
        if xml:
            for sub_xml in xml:
                root = etree.fromstring(sub_xml)
                xpath_expr = f"//Sighting[DateTimeEncounter/Date[starts-with(text(), '{year}')]]\
                                     [Location/Region[text() = '{region}']]"
                matching_sightings = root.xpath(xpath_expr)
                if matching_sightings:
                    for sighting in matching_sightings:
                        data = {
                            'region': sighting.find("Location/Region").text,
                            'year': sighting.find("DateTimeEncounter/Date").text.split('-')[0],
                            'ufo_shape': sighting.find("UFOShape").text,
                            'encounter_duration': sighting.find("EncounterDuration/Text").text,
                            'description': sighting.find("Description").text,
                        }
                        retrieve_info.append(data)
            if retrieve_info:
                print("Data was successfully retrieved", flush=True)
                return retrieve_info
            else:
                print("Unable to retrieve schema", flush=True)
                return data
        else:
            print("Unable to retrieve schema", flush=True)
            return data
    else:
        print("Unable to retrieve schema", flush=True)
        return data
