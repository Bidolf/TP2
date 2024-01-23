from lxml import etree
from db_functions.retrieve_xml import retrieve_xml


def retrieve_year_region(region, year, singleresult):
    retrieve_info = []
    data = []
    shape = []
    if singleresult:
        xml = retrieve_xml()
        if xml:
            for sub_xml in xml:
                root = etree.fromstring(sub_xml)
                xpath_expr = f"/Ufo/Sightings/Sighting[DateTimeEncounter/Date[starts-with(text(), '{year}')]]\
                                     [Location/Region[text() = '{region}']]"
                matching_sightings = root.xpath(xpath_expr)
                if matching_sightings:
                    for sighting in matching_sightings:
                        sighting_id = sighting.get("id")
                        for sub_xml1 in xml:
                            root = etree.fromstring(sub_xml1)
                            shape = root.xpath(f"/Ufo/Ufo-shapes/Ufo-shape[@id='{sighting_id}']/text()")
                        data = {
                            'region': sighting.find("Location/Region").text,
                            'year': sighting.find("DateTimeEncounter/Date").text.split('-')[0],
                            'ufo_shape': shape[0],
                            'encounter_duration': sighting.find("EncounterDuration/Text").text,
                            'description': sighting.find("Description").text,
                        }
                        retrieve_info.append(data)
            if retrieve_info:
                print("Data was successfully retrieved")
                return retrieve_info
            else:
                print("Unable to retrieve schema")
                return data
        else:
            print("Unable to retrieve schema")
            return data
    else:
        print("Unable to retrieve schema")
        return data
