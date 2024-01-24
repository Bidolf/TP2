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
                if len(matching_sightings) > 0:
                    for sighting in matching_sightings:
                        sighting_id = sighting.get("ufo_shape_ref")
                        for sub_xml1 in xml:
                            root = etree.fromstring(sub_xml1)
                            shape = root.xpath(f"/Ufo/Ufo-shapes/Ufo-shape[@id='{sighting_id}']/text()")
                            if shape:
                                break
                        data = {
                            'region': sighting.find("Location/Region").text,
                            'year': sighting.find("DateTimeEncounter/Date").text.split('-')[0],
                            'ufo_shape': str(shape[0]),
                            'encounter_duration': sighting.find("EncounterDuration/Text").text,
                            'description': sighting.find("Description").text,
                        }
                        retrieve_info.append(data)
            if retrieve_info:
                print("Data was successfully retrieved", flush=True)
                return retrieve_info
            else:
                print("Unable to retrieve data", flush=True)
                return data
        else:
            print("Unable to retrieve xml")
            return data
    else:
        print("singleresult = true")
        return data